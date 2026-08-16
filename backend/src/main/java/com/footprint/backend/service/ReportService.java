package com.footprint.backend.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.footprint.backend.dto.ReportCreateRequest;
import com.footprint.backend.dto.ReportHandleRequest;
import com.footprint.backend.dto.ReportPageResponse;
import com.footprint.backend.dto.ReportResponse;
import com.footprint.backend.entity.NotificationType;
import com.footprint.backend.entity.Report;
import com.footprint.backend.entity.ReportStatus;
import com.footprint.backend.entity.ReportTargetType;
import com.footprint.backend.entity.User;
import com.footprint.backend.repository.CommentRepository;
import com.footprint.backend.repository.PostRepository;
import com.footprint.backend.repository.ReportRepository;
import com.footprint.backend.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private static final int REPORT_PAGE_SIZE = 20;

    private static final List<ReportStatus>
            ACTIVE_REPORT_STATUSES = List.of(
                    ReportStatus.PENDING,
                    ReportStatus.REVIEWING
            );

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;

    public ReportService(
            ReportRepository reportRepository,
            UserRepository userRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            NotificationService notificationService
    ) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ReportResponse createReport(
            String username,
            ReportCreateRequest request
    ) {
        User reporter = findUser(username);

        validateTarget(
                reporter,
                request.targetType(),
                request.targetId()
        );

        boolean duplicateReport =
                reportRepository
                        .existsByReporterIdAndTargetTypeAndTargetIdAndStatusIn(
                                reporter.getId(),
                                request.targetType(),
                                request.targetId(),
                                ACTIVE_REPORT_STATUSES
                        );

        if (duplicateReport) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 처리 중인 신고가 있습니다."
            );
        }

        Report report = new Report();
        report.setReporter(reporter);
        report.setTargetType(request.targetType());
        report.setTargetId(request.targetId());
        report.setReason(request.reason());
        report.setDescription(
                normalizeOptionalText(
                        request.description()
                )
        );

        Report savedReport =
                reportRepository.save(report);

        return toResponse(savedReport);
    }

    public ReportPageResponse getAdminReports(
            int page,
            ReportStatus status
    ) {
        if (page < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "페이지 번호는 0 이상이어야 합니다."
            );
        }

        PageRequest pageRequest = PageRequest.of(
                page,
                REPORT_PAGE_SIZE
        );

        Page<Report> reportPage =
                status == null
                        ? reportRepository
                                .findAllByOrderByCreatedAtDesc(
                                        pageRequest
                                )
                        : reportRepository
                                .findByStatusOrderByCreatedAtDesc(
                                        status,
                                        pageRequest
                                );

        List<ReportResponse> reports =
                reportPage.getContent()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return new ReportPageResponse(
                reports,
                reportPage.getNumber(),
                reportPage.getTotalPages(),
                reportPage.getTotalElements(),
                reportPage.isFirst(),
                reportPage.isLast()
        );
    }

    public ReportResponse getAdminReport(
            Long reportId
    ) {
        return toResponse(findReport(reportId));
    }

    @Transactional
    public ReportResponse handleReport(
            String adminUsername,
            Long reportId,
            ReportHandleRequest request
    ) {
        if (request.status() == ReportStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "관리자 처리 상태로 PENDING을 "
                    + "선택할 수 없습니다."
            );
        }

        User admin = findUser(adminUsername);
        Report report = findReport(reportId);
        ReportStatus previousStatus =
                report.getStatus();

        report.handle(
                request.status(),
                normalizeOptionalText(
                        request.adminNote()
                ),
                admin
        );

        if (
                previousStatus != request.status()
                && isFinalStatus(request.status())
        ) {
            notificationService.createNotification(
                    report.getReporter(),
                    NotificationType.REPORT_RESULT,
                    "신고 처리 결과가 도착했어요",
                    getReportResultMessage(
                            request.status()
                    ),
                    "신고 결과",
                    null,
                    null
            );
        }

        return toResponse(report);
    }

    private boolean isFinalStatus(
            ReportStatus status
    ) {
        return status == ReportStatus.RESOLVED
                || status == ReportStatus.REJECTED;
    }

    private String getReportResultMessage(
            ReportStatus status
    ) {
        if (status == ReportStatus.RESOLVED) {
            return "접수한 신고가 처리 완료됐어요.";
        }

        return "접수한 신고가 반려됐어요.";
    }

    private void validateTarget(
            User reporter,
            ReportTargetType targetType,
            Long targetId
    ) {
        boolean targetExists = switch (targetType) {
            case POST ->
                    postRepository.existsById(targetId);
            case COMMENT ->
                    commentRepository.existsById(targetId);
            case USER ->
                    userRepository.existsById(targetId);
        };

        if (!targetExists) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "신고 대상을 찾을 수 없습니다."
            );
        }

        if (
                targetType == ReportTargetType.USER
                && reporter.getId().equals(targetId)
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "자기 자신은 신고할 수 없습니다."
            );
        }
    }

    private Report findReport(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "신고 내역을 찾을 수 없습니다."
                        )
                );
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "로그인한 사용자를 "
                                + "찾을 수 없습니다."
                        )
                );
    }

    private String normalizeOptionalText(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private ReportResponse toResponse(
            Report report
    ) {
        String handledByNickname =
                report.getHandledBy() == null
                        ? null
                        : report.getHandledBy()
                                .getNickname();

        return new ReportResponse(
                report.getId(),
                report.getReporter().getId(),
                report.getReporter().getUsername(),
                report.getTargetType(),
                report.getTargetId(),
                report.getReason(),
                report.getDescription(),
                report.getStatus(),
                report.getAdminNote(),
                handledByNickname,
                report.getHandledAt(),
                report.getCreatedAt(),
                report.getUpdatedAt()
        );
    }
}