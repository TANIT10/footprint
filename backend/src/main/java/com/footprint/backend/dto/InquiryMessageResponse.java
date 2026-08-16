package com.footprint.backend.dto;

import java.time.LocalDateTime;

import com.footprint.backend.entity.InquirySender;

public record InquiryMessageResponse(
        Long id,
        String content,
        InquirySender sender,
        boolean read,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {
}