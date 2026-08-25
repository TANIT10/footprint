package com.footprint.backend.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.dto.CommunityCommentRequest;
import com.footprint.backend.dto.CommunityCommentResponse;
import com.footprint.backend.service.CommunityCommentService;

@RestController
@RequestMapping("/api/community")
public class CommunityCommentController {

    private final CommunityCommentService
            communityCommentService;

    public CommunityCommentController(
            CommunityCommentService
                    communityCommentService
    ) {
        this.communityCommentService =
                communityCommentService;
    }

    /*
     * 커뮤니티 댓글 목록
     *
     * GET
     * /api/community/posts/{postId}/comments
     */
    @GetMapping(
            "/posts/{postId}/comments"
    )
    public ResponseEntity<
            List<CommunityCommentResponse>
    > getComments(
            Principal principal,

            @PathVariable
            Long postId
    ) {

        String username =
                principal != null
                        ? principal.getName()
                        : null;

        List<CommunityCommentResponse> comments =
                communityCommentService
                        .getComments(
                                username,
                                postId
                        );

        return ResponseEntity.ok(
                comments
        );
    }

    /*
     * 커뮤니티 댓글 작성
     *
     * POST
     * /api/community/posts/{postId}/comments
     */
    @PostMapping(
            "/posts/{postId}/comments"
    )
    public ResponseEntity<
            CommunityCommentResponse
    > createComment(
            Principal principal,

            @PathVariable
            Long postId,

            @RequestBody
            CommunityCommentRequest request
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        CommunityCommentResponse createdComment =
                communityCommentService
                        .createComment(
                                principal
                                        .getName(),
                                postId,
                                request
                        );

        return ResponseEntity.ok(
                createdComment
        );
    }

    /*
     * 커뮤니티 댓글 삭제
     *
     * DELETE
     * /api/community/comments/{commentId}
     */
    @DeleteMapping(
            "/comments/{commentId}"
    )
    public ResponseEntity<Void> deleteComment(
            Principal principal,

            @PathVariable
            Long commentId
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        communityCommentService
                .deleteComment(
                        principal
                                .getName(),
                        commentId
                );

        return ResponseEntity
                .noContent()
                .build();
    }
}