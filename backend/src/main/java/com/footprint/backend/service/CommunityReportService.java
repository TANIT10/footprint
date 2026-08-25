package com.footprint.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.footprint.backend.dto.AdminCommunityReportResponse;
import com.footprint.backend.dto.CommunityReportRequest;
import com.footprint.backend.entity.CommunityPost;
import com.footprint.backend.entity.CommunityReport;
import com.footprint.backend.entity.CommunityReportStatus;
import com.footprint.backend.entity.User;
import com.footprint.backend.repository.CommunityPostRepository;
import com.footprint.backend.repository.CommunityReportRepository;
import com.footprint.backend.repository.UserRepository;

@Service
@Transactional
public class CommunityReportService {

    private final CommunityReportRepository
            communityReportRepository;

    private final CommunityPostRepository
            communityPostRepository;

    private final UserRepository
            userRepository;

    public CommunityReportService(
            CommunityReportRepository
                    communityReportRepository,
            CommunityPostRepository
                    communityPostRepository,
            UserRepository
                    userRepository
    ) {
        this.communityReportRepository =
                communityReportRepository;

        this.communityPostRepository =
                communityPostRepository;

        this.userRepository =
                userRepository;
    }

    /*
     * ==========================================
     * 커뮤니티 게시글 신고
     * ==========================================
     */
    public void reportPost(
            String reporterUsername,
            Long communityPostId,
            CommunityReportRequest request
    ) {

        if (
                reporterUsername == null ||
                reporterUsername.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "로그인이 필요합니다."
            );
        }

        if (communityPostId == null) {
            throw new IllegalArgumentException(
                    "신고할 게시글 정보가 필요합니다."
            );
        }

        if (
                request == null ||
                request.getReason() == null
        ) {
            throw new IllegalArgumentException(
                    "신고 사유를 선택해 주세요."
            );
        }

        User reporter =
                userRepository
                        .findByUsername(
                                reporterUsername
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "사용자 정보를 찾을 수 없습니다."
                                        )
                        );

        CommunityPost communityPost =
                communityPostRepository
                        .findById(
                                communityPostId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "신고할 커뮤니티 게시글을 찾을 수 없습니다."
                                        )
                        );

        User reportedUser =
                communityPost
                        .getAuthor();

        if (reportedUser == null) {
            throw new IllegalArgumentException(
                    "게시글 작성자 정보를 찾을 수 없습니다."
            );
        }

        /*
         * 자기 글은 신고할 수 없음
         */
        if (
                reporter.getId()
                        .equals(
                                reportedUser.getId()
                        )
        ) {
            throw new IllegalArgumentException(
                    "본인이 작성한 게시글은 신고할 수 없습니다."
            );
        }

        /*
         * 같은 사용자가 같은 글을
         * 중복 신고하지 않도록 방지
         */
        boolean alreadyReported =
                communityReportRepository
                        .existsByReporterUsernameAndCommunityPostId(
                                reporterUsername,
                                communityPostId
                        );

        if (alreadyReported) {
            throw new IllegalArgumentException(
                    "이미 신고한 게시글입니다."
            );
        }

        CommunityReport report =
                new CommunityReport();

        report.setReporter(
                reporter
        );

        report.setReportedUser(
                reportedUser
        );

        report.setCommunityPost(
                communityPost
        );

        report.setReason(
                request.getReason()
        );

        String detail =
                request.getDetail();

        if (
                detail != null &&
                !detail.isBlank()
        ) {

            String normalizedDetail =
                    detail.trim();

            if (
                    normalizedDetail.length() >
                    500
            ) {
                throw new IllegalArgumentException(
                        "신고 상세 내용은 500자 이하로 입력해 주세요."
                );
            }

            report.setDetail(
                    normalizedDetail
            );
        }

        report.setStatus(
                CommunityReportStatus.PENDING
        );

        communityReportRepository
                .save(
                        report
                );
    }

    /*
     * ==========================================
     * 관리자 신고 목록 조회
     * ==========================================
     */
    @Transactional(readOnly = true)
    public List<AdminCommunityReportResponse>
    getReports(
            CommunityReportStatus status
    ) {

        if (status == null) {
            throw new IllegalArgumentException(
                    "신고 처리 상태가 필요합니다."
            );
        }

        return communityReportRepository
                .findAllByStatusOrderByCreatedAtDesc(
                        status
                )
                .stream()
                .map(
                        this::toAdminResponse
                )
                .toList();
    }

    /*
     * ==========================================
     * 관리자 신고 상세 조회
     * ==========================================
     */
    @Transactional(readOnly = true)
    public AdminCommunityReportResponse getReport(
            Long reportId
    ) {

        if (reportId == null) {
            throw new IllegalArgumentException(
                    "신고 번호가 필요합니다."
            );
        }

        CommunityReport report =
                communityReportRepository
                        .findById(
                                reportId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "신고 정보를 찾을 수 없습니다."
                                        )
                        );

        return toAdminResponse(
                report
        );
    }

    /*
     * ==========================================
     * 관리자 신고 처리 상태 변경
     * ==========================================
     */
    public AdminCommunityReportResponse
    updateReportStatus(
            Long reportId,
            CommunityReportStatus status
    ) {

        if (reportId == null) {
            throw new IllegalArgumentException(
                    "신고 번호가 필요합니다."
            );
        }

        if (status == null) {
            throw new IllegalArgumentException(
                    "변경할 신고 상태가 필요합니다."
            );
        }

        CommunityReport report =
                communityReportRepository
                        .findById(
                                reportId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "신고 정보를 찾을 수 없습니다."
                                        )
                        );

        report.setStatus(
                status
        );

        /*
         * 최종 처리 완료 또는 기각일 때만
         * 관리자 검토 완료 시간을 기록합니다.
         */
        if (
                status ==
                        CommunityReportStatus.RESOLVED ||
                status ==
                        CommunityReportStatus.DISMISSED
        ) {

            report.setReviewedAt(
                    LocalDateTime.now()
            );

        } else {

            report.setReviewedAt(
                    null
            );
        }

        CommunityReport savedReport =
                communityReportRepository
                        .save(
                                report
                        );

        return toAdminResponse(
                savedReport
        );
    }

    /*
     * ==========================================
     * 관리자 신고 Response 변환
     * ==========================================
     */
    private AdminCommunityReportResponse
    toAdminResponse(
            CommunityReport report
    ) {

        CommunityPost communityPost =
                report
                        .getCommunityPost();

        User reporter =
                report
                        .getReporter();

        User reportedUser =
                report
                        .getReportedUser();

        return new AdminCommunityReportResponse(
                report.getId(),

                communityPost != null
                        ? communityPost.getId()
                        : null,

                communityPost != null
                        ? communityPost.getTitle()
                        : null,

                reporter != null
                        ? reporter.getUsername()
                        : null,

                reporter != null
                        ? reporter.getNickname()
                        : null,

                reportedUser != null
                        ? reportedUser.getUsername()
                        : null,

                reportedUser != null
                        ? reportedUser.getNickname()
                        : null,

                report.getReason(),

                report.getDetail(),

                report.getStatus(),

                report.getCreatedAt(),

                report.getReviewedAt()
        );
    }
}
