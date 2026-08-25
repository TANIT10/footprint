package com.footprint.backend.dto;

import java.time.LocalDateTime;

import com.footprint.backend.entity.CommunityReportReason;
import com.footprint.backend.entity.CommunityReportStatus;

public record AdminCommunityReportResponse(

        Long id,

        Long communityPostId,

        String postTitle,

        String reporterUsername,

        String reporterNickname,

        String reportedUsername,

        String reportedNickname,

        CommunityReportReason reason,

        String detail,

        CommunityReportStatus status,

        LocalDateTime createdAt,

        LocalDateTime reviewedAt

) {

}