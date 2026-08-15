package com.footprint.backend.dto;

import java.time.LocalDateTime;

public record NoticeListItemResponse(
        Long id,
        String title,
        boolean important,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}