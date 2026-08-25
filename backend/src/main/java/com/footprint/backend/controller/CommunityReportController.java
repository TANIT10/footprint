package com.footprint.backend.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.dto.CommunityReportRequest;
import com.footprint.backend.service.CommunityReportService;

@RestController
@RequestMapping("/api/community/reports")
public class CommunityReportController {

    private final CommunityReportService
            communityReportService;

    public CommunityReportController(
            CommunityReportService
                    communityReportService
    ) {
        this.communityReportService =
                communityReportService;
    }

    /*
     * ==========================================
     * 커뮤니티 게시글 신고
     * ==========================================
     *
     * POST
     * /api/community/reports/posts/{postId}
     *
     * 예:
     * {
     *   "reason": "SPAM",
     *   "detail": "광고 게시글입니다."
     * }
     */
    @PostMapping(
            "/posts/{postId}"
    )
    public ResponseEntity<Void> reportPost(
            Principal principal,
            @PathVariable
            Long postId,
            @RequestBody
            CommunityReportRequest request
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        communityReportService
                .reportPost(
                        principal
                                .getName(),
                        postId,
                        request
                );

        return ResponseEntity
                .noContent()
                .build();
    }
}