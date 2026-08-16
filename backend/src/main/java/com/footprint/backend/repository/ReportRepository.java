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
}