package com.footprint.backend.dto;

import java.util.List;

public record NotificationPageResponse(
        List<NotificationResponse> notifications,
        long unreadCount,
        int currentPage,
        int totalPages,
        long totalElements,
        boolean first,
        boolean last
) {
}