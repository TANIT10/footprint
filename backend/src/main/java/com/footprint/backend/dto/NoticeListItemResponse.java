package com.footprint.backend.dto;

import java.time.LocalDateTime;

public record NoticeListItemResponse(
        Long id,
        String title,
        String summary,
        boolean important,
        boolean featured,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}