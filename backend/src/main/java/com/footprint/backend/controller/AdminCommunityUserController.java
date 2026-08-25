package com.footprint.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.dto.AdminCommunityUserResponse;
import com.footprint.backend.service.UserService;

@RestController
@RequestMapping(
        "/api/admin/community/users"
)
public class AdminCommunityUserController {

    private final UserService
            userService;

    public AdminCommunityUserController(
            UserService userService
    ) {
        this.userService =
                userService;
    }

    /*
     * ==========================================
     * 관리자 - 사용자 커뮤니티 제재 상태 조회
     * ==========================================
     *
     * GET
     * /api/admin/community/users/{username}
     */
    @GetMapping("/{username}")
    public ResponseEntity<
            AdminCommunityUserResponse
    > getUser(
            @PathVariable
            String username
    ) {

        return ResponseEntity.ok(
                userService
                        .getCommunityAdminUser(
                                username
                        )
        );
    }

    /*
     * ==========================================
     * 관리자 - 경고 1회 추가
     * ==========================================
     *
     * POST
     * /api/admin/community/users/{username}/warning
     */
    @PostMapping(
            "/{username}/warning"
    )
    public ResponseEntity<
            AdminCommunityUserResponse
    > addWarning(
            @PathVariable
            String username
    ) {

        return ResponseEntity.ok(
                userService
                        .addCommunityWarningByAdmin(
                                username
                        )
        );
    }

    /*
     * ==========================================
     * 관리자 - 기간 정지
     * ==========================================
     *
     * POST
     * /api/admin/community/users/{username}/suspension?days=7
     *
     * days:
     * 1 / 3 / 7 / 30
     */
    @PostMapping(
            "/{username}/suspension"
    )
    public ResponseEntity<
            AdminCommunityUserResponse
    > suspendUser(
            @PathVariable
            String username,

            @RequestParam
            int days
    ) {

        return ResponseEntity.ok(
                userService
                        .suspendCommunityUserByAdmin(
                                username,
                                days
                        )
        );
    }

    /*
     * ==========================================
     * 관리자 - 정지 해제
     * ==========================================
     *
     * DELETE
     * /api/admin/community/users/{username}/suspension
     */
    @DeleteMapping(
            "/{username}/suspension"
    )
    public ResponseEntity<
            AdminCommunityUserResponse
    > clearSuspension(
            @PathVariable
            String username
    ) {

        return ResponseEntity.ok(
                userService
                        .clearCommunitySuspensionByAdmin(
                                username
                        )
        );
    }
}
