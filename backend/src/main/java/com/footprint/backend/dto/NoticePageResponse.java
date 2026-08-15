package com.footprint.backend.dto;

import java.util.List;

public record NoticePageResponse(
        List<NoticeListItemResponse> notices,
        int currentPage,
        int totalPages,
        long totalElements,
        boolean first,
        boolean last
) {
}