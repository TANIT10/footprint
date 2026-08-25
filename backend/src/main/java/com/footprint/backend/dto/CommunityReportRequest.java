package com.footprint.backend.dto;

import com.footprint.backend.entity.CommunityReportReason;

public class CommunityReportRequest {

    private CommunityReportReason reason;

    private String detail;

    public CommunityReportRequest() {
    }

    public CommunityReportReason getReason() {
        return reason;
    }

    public void setReason(
            CommunityReportReason reason
    ) {
        this.reason =
                reason;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(
            String detail
    ) {
        this.detail =
                detail;
    }
}