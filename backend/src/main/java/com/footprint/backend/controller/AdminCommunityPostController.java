package com.footprint.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.service.CommunityPostService;

@RestController
@RequestMapping(
        "/api/admin/community/posts"
)
public class AdminCommunityPostController {

    private final CommunityPostService
            communityPostService;

    public AdminCommunityPostController(
            CommunityPostService
                    communityPostService
    ) {
        this.communityPostService =
                communityPostService;
    }

    /*
     * ==========================================
     * 관리자 커뮤니티 게시글 강제 삭제
     * ==========================================
     *
     * DELETE
     * /api/admin/community/posts/{postId}
     *
     * SecurityConfig의
     * /api/admin/** → ADMIN 전용 정책으로 보호됩니다.
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void>
    deleteCommunityPost(
            @PathVariable
            Long postId
    ) {

        communityPostService
                .deletePostByAdmin(
                        postId
                );

        return ResponseEntity
                .noContent()
                .build();
    }
}
