package com.footprint.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record NoticeResponse(
        Long id,
        String title,
        String content,
        boolean important,
        boolean featured,
        List<String> imageUrls,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}