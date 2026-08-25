package com.footprint.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.dto.AdminCommunityReportResponse;
import com.footprint.backend.dto.AdminCommunityReportStatusRequest;
import com.footprint.backend.entity.CommunityReportStatus;
import com.footprint.backend.service.CommunityReportService;

@RestController
@RequestMapping(
        "/api/admin/community/reports"
)
public class AdminCommunityReportController {

    private final CommunityReportService
            communityReportService;

    public AdminCommunityReportController(
            CommunityReportService
                    communityReportService
    ) {
        this.communityReportService =
                communityReportService;
    }

    /*
     * ==========================================
     * 관리자 신고 목록 조회
     * ==========================================
     *
     * GET
     * /api/admin/community/reports?status=PENDING
     *
     * status:
     * PENDING
     * REVIEWING
     * RESOLVED
     * DISMISSED
     */
    @GetMapping
    public ResponseEntity<
            List<AdminCommunityReportResponse>
    > getReports(
            @RequestParam(
                    defaultValue = "PENDING"
            )
            CommunityReportStatus status
    ) {

        List<AdminCommunityReportResponse>
                reports =
                communityReportService
                        .getReports(
                                status
                        );

        return ResponseEntity.ok(
                reports
        );
    }

    /*
     * ==========================================
     * 관리자 신고 상세 조회
     * ==========================================
     *
     * GET
     * /api/admin/community/reports/{reportId}
     */
    @GetMapping("/{reportId}")
    public ResponseEntity<
            AdminCommunityReportResponse
    > getReport(
            @PathVariable
            Long reportId
    ) {

        return ResponseEntity.ok(
                communityReportService
                        .getReport(
                                reportId
                        )
        );
    }

    /*
     * ==========================================
     * 관리자 신고 처리 상태 변경
     * ==========================================
     *
     * PATCH
     * /api/admin/community/reports/{reportId}/status
     *
     * 예:
     * {
     *   "status": "REVIEWING"
     * }
     */
    @PatchMapping(
            "/{reportId}/status"
    )
    public ResponseEntity<
            AdminCommunityReportResponse
    > updateReportStatus(
            @PathVariable
            Long reportId,

            @RequestBody
            AdminCommunityReportStatusRequest request
    ) {

        return ResponseEntity.ok(
                communityReportService
                        .updateReportStatus(
                                reportId,
                                request.getStatus()
                        )
        );
    }
}
