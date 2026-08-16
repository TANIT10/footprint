package com.footprint.backend.dto;

import java.time.LocalDateTime;

import com.footprint.backend.entity.NotificationType;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String message,
        String label,
        Long postId,
        Long noticeId,
        boolean isRead,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {
}