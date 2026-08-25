package com.footprint.backend.dto;

import java.time.LocalDateTime;

import com.footprint.backend.entity.UserRole;

public record AdminCommunityUserResponse(

        Long id,

        String username,

        String nickname,

        UserRole role,

        int communityWarningCount,

        boolean communitySuspended,

        LocalDateTime communitySuspendedUntil

) {

}
