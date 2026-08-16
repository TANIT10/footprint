package com.footprint.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.dto.ReportHandleRequest;
import com.footprint.backend.dto.ReportPageResponse;
import com.footprint.backend.dto.ReportResponse;
import com.footprint.backend.entity.ReportStatus;
import com.footprint.backend.service.ReportService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    private final ReportService reportService;

    public AdminReportController(
            ReportService reportService
    ) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<ReportPageResponse>
            getReports(
                    @RequestParam(defaultValue = "0")
                    int page,
                    @RequestParam(required = false)
                    ReportStatus status
            ) {
        return ResponseEntity.ok(
                reportService.getAdminReports(
                        page,
                        status
                )
        );
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<ReportResponse>
            getReport(
                    @PathVariable Long reportId
            ) {
        return ResponseEntity.ok(
                reportService.getAdminReport(reportId)
        );
    }

    @PutMapping("/{reportId}")
    public ResponseEntity<ReportResponse>
            handleReport(
                    Authentication authentication,
                    @PathVariable Long reportId,
                    @Valid @RequestBody
                    ReportHandleRequest request
            ) {
        return ResponseEntity.ok(
                reportService.handleReport(
                        authentication.getName(),
                        reportId,
                        request
                )
        );
    }
}