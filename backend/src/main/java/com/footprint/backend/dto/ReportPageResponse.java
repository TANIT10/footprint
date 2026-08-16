package com.footprint.backend.dto;

import java.util.List;

public record ReportPageResponse(
        List<ReportResponse> reports,
        int currentPage,
        int totalPages,
        long totalElements,
        boolean first,
        boolean last
) {
}