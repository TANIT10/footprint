package com.footprint.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.footprint.backend.dto.ReportCreateRequest;
import com.footprint.backend.dto.ReportResponse;
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

    private static final List<ReportStatus>
            ACTIVE_REPORT_STATUSES = List.of(
                    ReportStatus.PENDING,
                    ReportStatus.REVIEWING
            );

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public ReportService(
            ReportRepository reportRepository,
            UserRepository userRepository,
            PostRepository postRepository,
            CommentRepository commentRepository
    ) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional
    public ReportResponse createReport(
            String username,
            ReportCreateRequest request
    ) {
        User reporter = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "로그인한 사용자를 찾을 수 없습니다."
                ));

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