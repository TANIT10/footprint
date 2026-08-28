package com.footprint.backend.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.dto.BlockedUserResponse;
import com.footprint.backend.service.CommunityUserBlockService;

@RestController
@RequestMapping("/api/community/blocks")
public class CommunityUserBlockController {

    private final CommunityUserBlockService
            communityUserBlockService;

    public CommunityUserBlockController(
            CommunityUserBlockService
                    communityUserBlockService
    ) {
        this.communityUserBlockService =
                communityUserBlockService;
    }

    /*
     * ==========================================
     * 사용자 차단
     * ==========================================
     *
     * POST
     * /api/community/blocks/{blockedUsername}
     */
    @PostMapping("/{blockedUsername}")
    public ResponseEntity<Void> blockUser(
            Principal principal,
            @PathVariable
            String blockedUsername
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        communityUserBlockService
                .blockUser(
                        principal
                                .getName(),
                        blockedUsername
                );

        return ResponseEntity
                .noContent()
                .build();
    }

    /*
     * ==========================================
     * 사용자 차단 해제
     * ==========================================
     *
     * DELETE
     * /api/community/blocks/{blockedUsername}
     */
    @DeleteMapping("/{blockedUsername}")
    public ResponseEntity<Void> unblockUser(
            Principal principal,
            @PathVariable
            String blockedUsername
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        communityUserBlockService
                .unblockUser(
                        principal
                                .getName(),
                        blockedUsername
                );

        return ResponseEntity
                .noContent()
                .build();
    }

    /*
     * ==========================================
     * 차단 여부 확인
     * ==========================================
     *
     * GET
     * /api/community/blocks/{blockedUsername}
     *
     * 응답:
     * {
     *   "blocked": true
     * }
     */
    @GetMapping("/{blockedUsername}")
    public ResponseEntity<
            Map<String, Boolean>
    > isBlocked(
            Principal principal,
            @PathVariable
            String blockedUsername
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        boolean blocked =
                communityUserBlockService
                        .isBlocked(
                                principal
                                        .getName(),
                                blockedUsername
                        );

        return ResponseEntity.ok(
                Map.of(
                        "blocked",
                        blocked
                )
        );
    }

    /*
     * ==========================================
     * 내가 차단한 사용자 목록
     * ==========================================
     *
     * GET
     * /api/community/blocks
     *
     * 응답 예:
     * [
     *   {
     *     "username": "test01",
     *     "nickname": "콩이엄마"
     *   },
     *   {
     *     "username": "test03",
     *     "nickname": "두부아빠"
     *   }
     * ]
     */
    @GetMapping
    public ResponseEntity<
            List<BlockedUserResponse>
    > getBlockedUsers(
            Principal principal
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        List<BlockedUserResponse> blockedUsers =
                communityUserBlockService
                        .getBlockedUsers(
                                principal
                                        .getName()
                        );

        return ResponseEntity.ok(
                blockedUsers
        );
    }
}