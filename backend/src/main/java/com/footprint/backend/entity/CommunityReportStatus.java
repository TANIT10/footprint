package com.footprint.backend.entity;

public enum CommunityReportStatus {

    /*
     * 새로 접수된 신고
     */
    PENDING,

    /*
     * 관리자가 확인 중
     */
    REVIEWING,

    /*
     * 조치 완료
     */
    RESOLVED,

    /*
     * 신고 기각
     */
    DISMISSED
}