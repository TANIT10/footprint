package com.footprint.backend.dto;

import java.time.LocalDateTime;

public record NoticeResponse(
        Long id,
        String title,
        String content,
        boolean important,
        boolean featured,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}