package com.footprint.backend.dto;

import java.time.LocalDateTime;

import com.footprint.backend.entity.ReportReason;
import com.footprint.backend.entity.ReportStatus;
import com.footprint.backend.entity.ReportTargetType;

public record ReportResponse(
        Long id,
        Long reporterId,
        String reporterUsername,
        ReportTargetType targetType,
        Long targetId,
        ReportReason reason,
        String description,
        ReportStatus status,
        String adminNote,
        String handledByNickname,
        LocalDateTime handledAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}