package com.footprint.backend.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.service.AiMatchCandidateStatusService;

@RestController
@RequestMapping("/api/ai-match/status")
public class AiMatchCandidateStatusController {

    private final AiMatchCandidateStatusService
            aiMatchCandidateStatusService;

    public AiMatchCandidateStatusController(
            AiMatchCandidateStatusService
                    aiMatchCandidateStatusService
    ) {
        this.aiMatchCandidateStatusService =
                aiMatchCandidateStatusService;
    }

    /*
     * 마이페이지 NEW 표시용
     *
     * GET
     * /api/ai-match/status/new
     */
    @GetMapping("/new")
    public ResponseEntity<Map<String, Object>>
            getNewSummary(
                    Principal principal
            ) {

        return ResponseEntity.ok(
                aiMatchCandidateStatusService
                        .getNewSummary(
                                principal.getName()
                        )
        );
    }

    /*
     * 특정 찾아요 글의 NEW 상태
     *
     * GET
     * /api/ai-match/status/missing/{missingPostId}
     */
    @GetMapping(
            "/missing/{missingPostId}"
    )
    public ResponseEntity<Map<String, Object>>
            getMissingPostNewStatus(
                    Principal principal,
                    @PathVariable
                    Long missingPostId
            ) {

        return ResponseEntity.ok(
                aiMatchCandidateStatusService
                        .getNewStatusForMissingPost(
                                principal.getName(),
                                missingPostId
                        )
        );
    }

    /*
     * 특정 찾아요 글의 NEW 후보
     * 전부 확인 처리
     *
     * PUT
     * /api/ai-match/status/missing/{missingPostId}/check
     */
    @PutMapping(
            "/missing/{missingPostId}/check"
    )
    public ResponseEntity<Void>
            checkMissingPostCandidates(
                    Principal principal,
                    @PathVariable
                    Long missingPostId
            ) {

        aiMatchCandidateStatusService
                .markMissingPostCandidatesAsChecked(
                        principal.getName(),
                        missingPostId
                );

        return ResponseEntity
                .noContent()
                .build();
    }

    /*
     * 특정 후보 카드 하나만 확인 처리
     *
     * PUT
     * /api/ai-match/status/missing/{missingPostId}/candidate/{sightedPostId}/check
     */
    @PutMapping(
            "/missing/{missingPostId}"
                    + "/candidate/{sightedPostId}"
                    + "/check"
    )
    public ResponseEntity<Void>
            checkCandidate(
                    Principal principal,
                    @PathVariable
                    Long missingPostId,
                    @PathVariable
                    Long sightedPostId
            ) {

        aiMatchCandidateStatusService
                .markCandidateAsChecked(
                        principal.getName(),
                        missingPostId,
                        sightedPostId
                );

        return ResponseEntity
                .noContent()
                .build();
    }
}