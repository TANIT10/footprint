package com.footprint.backend.dto;

import com.footprint.backend.entity.CommunityReportStatus;

public class AdminCommunityReportStatusRequest {

    private CommunityReportStatus status;

    public AdminCommunityReportStatusRequest() {
    }

    public CommunityReportStatus getStatus() {
        return status;
    }

    public void setStatus(
            CommunityReportStatus status
    ) {
        this.status =
                status;
    }
}
