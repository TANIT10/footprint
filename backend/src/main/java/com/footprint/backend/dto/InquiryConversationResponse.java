package com.footprint.backend.dto;

import java.time.LocalDateTime;

import com.footprint.backend.entity.InquirySender;

public record InquiryConversationResponse(
        Long userId,
        String username,
        String nickname,
        String lastMessage,
        InquirySender lastSender,
        LocalDateTime lastMessageAt,
        long unreadCount
) {
}