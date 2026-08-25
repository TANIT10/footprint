package com.footprint.backend.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.footprint.backend.dto.CommunityPostRequest;
import com.footprint.backend.dto.CommunityPostResponse;
import com.footprint.backend.service.CommunityPostService;

@RestController
@RequestMapping("/api/community/posts")
public class CommunityPostController {

    private final CommunityPostService
            communityPostService;

    public CommunityPostController(
            CommunityPostService
                    communityPostService
    ) {
        this.communityPostService =
                communityPostService;
    }

    /*
     * 커뮤니티 게시글 목록
     *
     * GET /api/community/posts?page=0
     *
     * 검색:
     * GET /api/community/posts?page=0&keyword=강아지
     */
    @GetMapping
    public ResponseEntity<
            Page<CommunityPostResponse>
    > getPosts(
            Principal principal,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    required = false
            )
            String keyword
    ) {

        String username =
                principal != null
                        ? principal.getName()
                        : null;

        Page<CommunityPostResponse> posts =
                communityPostService
                        .getPosts(
                                username,
                                keyword,
                                page
                        );

        return ResponseEntity.ok(
                posts
        );
    }

    /*
     * =====================================
     * 내가 작성한 커뮤니티 게시글 목록
     * =====================================
     *
     * GET /api/community/posts/my?page=0
     *
     * 현재 로그인한 사용자가 작성한
     * 커뮤니티 게시글만 최신순으로 반환합니다.
     */
    @GetMapping("/my")
    public ResponseEntity<
            Page<CommunityPostResponse>
    > getMyPosts(
            Principal principal,

            @RequestParam(
                    defaultValue = "0"
            )
            int page
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        Page<CommunityPostResponse> posts =
                communityPostService
                        .getMyPosts(
                                principal
                                        .getName(),
                                page
                        );

        return ResponseEntity.ok(
                posts
        );
    }

    /*
     * 커뮤니티 게시글 상세
     *
     * GET /api/community/posts/{postId}
     */
    @GetMapping("/{postId}")
    public ResponseEntity<
            CommunityPostResponse
    > getPost(
            Principal principal,

            @PathVariable
            Long postId
    ) {

        String username =
                principal != null
                        ? principal.getName()
                        : null;

        return communityPostService
                .getPost(
                        username,
                        postId
                )
                .map(
                        ResponseEntity::ok
                )
                .orElseGet(
                        () ->
                                ResponseEntity
                                        .notFound()
                                        .build()
                );
    }

    /*
     * 커뮤니티 게시글 작성
     *
     * 제목 + 내용 + 사진
     * multipart/form-data
     */
    @PostMapping(
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<
            CommunityPostResponse
    > createPost(
            Principal principal,

            @RequestParam("title")
            String title,

            @RequestParam("content")
            String content,

            @RequestParam(
                    value = "images",
                    required = false
            )
            List<MultipartFile> images
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        CommunityPostRequest request =
                new CommunityPostRequest();

        request.setTitle(
                title
        );

        request.setContent(
                content
        );

        CommunityPostResponse createdPost =
                communityPostService
                        .createPost(
                                principal
                                        .getName(),
                                request,
                                images
                        );

        return ResponseEntity.ok(
                createdPost
        );
    }

    /*
     * 커뮤니티 게시글 수정
     *
     * PUT /api/community/posts/{postId}
     *
     * 작성자 본인만 수정 가능
     */
    @PutMapping(
            value = "/{postId}",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<
            CommunityPostResponse
    > updatePost(
            Principal principal,

            @PathVariable
            Long postId,

            @RequestParam("title")
            String title,

            @RequestParam("content")
            String content,

            @RequestParam(
                    value = "existingImageUrls",
                    required = false
            )
            List<String> existingImageUrls,

            @RequestParam(
                    value = "images",
                    required = false
            )
            List<MultipartFile> images
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        CommunityPostRequest request =
                new CommunityPostRequest();

        request.setTitle(
                title
        );

        request.setContent(
                content
        );

        CommunityPostResponse updatedPost =
                communityPostService
                        .updatePost(
                                principal
                                        .getName(),
                                postId,
                                request,
                                existingImageUrls,
                                images
                        );

        return ResponseEntity.ok(
                updatedPost
        );
    }

    /*
     * 커뮤니티 게시글 삭제
     *
     * DELETE /api/community/posts/{postId}
     *
     * 작성자 본인만 삭제 가능
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            Principal principal,

            @PathVariable
            Long postId
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        communityPostService
                .deletePost(
                        principal
                                .getName(),
                        postId
                );

        return ResponseEntity
                .noContent()
                .build();
    }

    /*
     * 좋아요 토글
     *
     * POST /api/community/posts/{postId}/like
     */
    @PostMapping("/{postId}/like")
    public ResponseEntity<
            CommunityPostResponse
    > toggleLike(
            Principal principal,

            @PathVariable
            Long postId
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        CommunityPostResponse response =
                communityPostService
                        .toggleLike(
                                principal
                                        .getName(),
                                postId
                        );

        return ResponseEntity.ok(
                response
        );
    }
}