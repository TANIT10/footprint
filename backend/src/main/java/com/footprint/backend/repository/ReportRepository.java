package com.footprint.backend.repository;

import java.util.Collection;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.Report;
import com.footprint.backend.entity.ReportStatus;
import com.footprint.backend.entity.ReportTargetType;

public interface ReportRepository
        extends JpaRepository<Report, Long> {

    boolean existsByReporterIdAndTargetTypeAndTargetIdAndStatusIn(
            Long reporterId,
            ReportTargetType targetType,
            Long targetId,
            Collection<ReportStatus> statuses
    );

    Page<Report> findByReporterUsernameOrderByCreatedAtDesc(
            String username,
            Pageable pageable
    );

    Page<Report> findAllByOrderByCreatedAtDesc(
            Pageable pageable
    );

    Page<Report> findByStatusOrderByCreatedAtDesc(
            ReportStatus status,
            Pageable pageable
    );

        /*
     * 회원 탈퇴 전용
     * 해당 사용자가 작성한 일반 신고 기록 전체 삭제
     */
    void deleteByReporterId(
            Long reporterId
    );

        /*
        * 일반 게시글/댓글 등
        * 특정 신고 대상과 연결된 신고 기록 삭제
        */
        void deleteByTargetTypeAndTargetId(
                ReportTargetType targetType,
                Long targetId
        );
}