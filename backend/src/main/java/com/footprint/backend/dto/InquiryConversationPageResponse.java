package com.footprint.backend.dto;

import java.util.List;

public record InquiryConversationPageResponse(
        List<InquiryConversationResponse> conversations,
        int currentPage,
        int totalPages,
        long totalElements,
        boolean first,
        boolean last
) {
}