package com.footprint.backend.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.footprint.backend.dto.CommunityPostRequest;
import com.footprint.backend.dto.CommunityPostResponse;
import com.footprint.backend.entity.CommunityPost;
import com.footprint.backend.entity.CommunityPostImage;
import com.footprint.backend.entity.CommunityPostLike;
import com.footprint.backend.entity.User;
import com.footprint.backend.repository.CommunityCommentRepository;
import com.footprint.backend.repository.CommunityPostImageRepository;
import com.footprint.backend.repository.CommunityPostLikeRepository;
import com.footprint.backend.repository.CommunityPostRepository;
import com.footprint.backend.repository.CommunityReportRepository;
import com.footprint.backend.repository.UserRepository;

@Service
@Transactional
public class CommunityPostService {

    private static final int
            MAXIMUM_IMAGE_COUNT = 5;

    private final CommunityPostRepository
            communityPostRepository;

    private final CommunityPostImageRepository
            communityPostImageRepository;

    private final CommunityPostImageService
            communityPostImageService;

    private final CommunityPostLikeRepository
            communityPostLikeRepository;

    private final CommunityCommentRepository
            communityCommentRepository;

    private final UserRepository
            userRepository;

    private final CommunityReportRepository
            communityReportRepository;

    private final NotificationService
            notificationService;

    public CommunityPostService(
            CommunityPostRepository
                    communityPostRepository,
            CommunityPostImageRepository
                    communityPostImageRepository,
            CommunityPostImageService
                    communityPostImageService,
            CommunityPostLikeRepository
                    communityPostLikeRepository,
            CommunityCommentRepository
                    communityCommentRepository,
            UserRepository
                    userRepository,
            CommunityReportRepository
                    communityReportRepository,
            NotificationService
                    notificationService
    ) {
        this.communityPostRepository =
                communityPostRepository;

        this.communityPostImageRepository =
                communityPostImageRepository;

        this.communityPostImageService =
                communityPostImageService;

        this.communityPostLikeRepository =
                communityPostLikeRepository;

        this.communityCommentRepository =
                communityCommentRepository;

        this.userRepository =
                userRepository;

        this.communityReportRepository =
                communityReportRepository;

        this.notificationService =
                notificationService;
    }

    /*
     * 커뮤니티 게시글 목록
     */
    @Transactional(readOnly = true)
    public Page<CommunityPostResponse> getPosts(
            String username,
            String keyword,
            int page
    ) {

        Pageable pageable =
                PageRequest.of(
                        Math.max(
                                page,
                                0
                        ),
                        20
                );

        Page<CommunityPost> communityPosts;

        /*
         * 로그인 사용자가 있는 경우
         * 자신이 차단한 사용자의 글을
         * DB 조회 단계에서 제외합니다.
         *
         * 기존 목록/검색 동작은 그대로 유지합니다.
         */
        if (
                username != null &&
                !username.isBlank()
        ) {

            if (
                    keyword == null ||
                    keyword.isBlank()
            ) {

                communityPosts =
                        communityPostRepository
                                .findVisiblePosts(
                                        username,
                                        pageable
                                );

            } else {

                String normalizedKeyword =
                        keyword.trim();

                communityPosts =
                        communityPostRepository
                                .findVisiblePostsByKeyword(
                                        username,
                                        normalizedKeyword,
                                        pageable
                                );
            }

        } else {

            /*
             * 비로그인 호출이 들어오는 경우를 대비해
             * 기존 조회 로직도 그대로 남겨둡니다.
             */
            if (
                    keyword == null ||
                    keyword.isBlank()
            ) {

                communityPosts =
                        communityPostRepository
                                .findAllByOrderByCreatedAtDesc(
                                        pageable
                                );

            } else {

                String normalizedKeyword =
                        keyword.trim();

                communityPosts =
                        communityPostRepository
                                .findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseOrderByCreatedAtDesc(
                                        normalizedKeyword,
                                        normalizedKeyword,
                                        pageable
                                );
            }
        }

        User currentUser =
                findCurrentUserOptional(
                        username
                );

        return communityPosts.map(
                post ->
                        toResponse(
                                post,
                                currentUser
                        )
        );
    }

    /*
     * 내가 작성한 커뮤니티 게시글 목록
     */
    @Transactional(readOnly = true)
    public Page<CommunityPostResponse> getMyPosts(
            String username,
            int page
    ) {

        User currentUser =
                getUser(
                        username
                );

        Pageable pageable =
                PageRequest.of(
                        Math.max(
                                page,
                                0
                        ),
                        20
                );

        Page<CommunityPost> communityPosts =
                communityPostRepository
                        .findByAuthorUsernameOrderByCreatedAtDesc(
                                username,
                                pageable
                        );

        return communityPosts.map(
                post ->
                        toResponse(
                                post,
                                currentUser
                        )
        );
    }

    /*
     * 커뮤니티 게시글 상세
     */
    @Transactional(readOnly = true)
    public Optional<CommunityPostResponse> getPost(
            String username,
            Long postId
    ) {

        User currentUser =
                findCurrentUserOptional(
                        username
                );

        return communityPostRepository
                .findById(
                        postId
                )
                .map(
                        post ->
                                toResponse(
                                        post,
                                        currentUser
                                )
                );
    }

    /*
     * 사진 없이 글 작성
     */
    public CommunityPostResponse createPost(
            String username,
            CommunityPostRequest request
    ) {

        return createPost(
                username,
                request,
                null
        );
    }

    /*
     * 커뮤니티 글 작성
     */
    public CommunityPostResponse createPost(
            String username,
            CommunityPostRequest request,
            List<MultipartFile> images
    ) {

        validateRequest(
                request
        );

        User author =
                getUser(
                        username
                );

        validateCommunityWriteAccess(
                author
        );

        List<String> savedImageUrls =
                new ArrayList<>();

        try {

            savedImageUrls =
                    communityPostImageService
                            .saveOptional(
                                    images
                            );

            CommunityPost communityPost =
                    new CommunityPost();

            communityPost.setAuthor(
                    author
            );

            communityPost.setTitle(
                    request
                            .getTitle()
                            .trim()
            );

            communityPost.setContent(
                    request
                            .getContent()
                            .trim()
            );

            CommunityPost savedPost =
                    communityPostRepository
                            .save(
                                    communityPost
                            );

            saveImageEntities(
                    savedPost,
                    savedImageUrls
            );

            return toResponse(
                    savedPost,
                    author
            );

        } catch (
                RuntimeException exception
        ) {

            communityPostImageService
                    .deleteAll(
                            savedImageUrls
                    );

            throw exception;
        }
    }

    /*
     * 커뮤니티 게시글 수정
     *
     * 작성자 본인만 수정 가능합니다.
     */
    public CommunityPostResponse updatePost(
            String username,
            Long postId,
            CommunityPostRequest request,
            List<String> existingImageUrls,
            List<MultipartFile> newImages
    ) {

        validateRequest(
                request
        );

        User currentUser =
                getUser(
                        username
                );

        validateCommunityWriteAccess(
                currentUser
        );

        CommunityPost communityPost =
                getCommunityPost(
                        postId
                );

        validateAuthor(
                communityPost,
                currentUser
        );

        List<CommunityPostImage>
                currentImages =
                communityPostImageRepository
                        .findByCommunityPostIdOrderByDisplayOrderAsc(
                                postId
                        );

        List<String> currentImageUrls =
                currentImages
                        .stream()
                        .map(
                                CommunityPostImage
                                        ::getImageUrl
                        )
                        .toList();

        List<String> keptImageUrls =
                normalizeExistingImages(
                        currentImageUrls,
                        existingImageUrls
                );

        int newImageCount =
                countRealFiles(
                        newImages
                );

        int totalImageCount =
                keptImageUrls.size()
                        + newImageCount;

        if (
                totalImageCount >
                MAXIMUM_IMAGE_COUNT
        ) {
            throw new IllegalArgumentException(
                    "사진은 최대 5장까지만 등록할 수 있습니다."
            );
        }

        List<String> removedImageUrls =
                currentImageUrls
                        .stream()
                        .filter(
                                imageUrl ->
                                        !keptImageUrls
                                                .contains(
                                                        imageUrl
                                                )
                        )
                        .toList();

        List<String> savedNewImageUrls =
                new ArrayList<>();

        try {

            savedNewImageUrls =
                    communityPostImageService
                            .saveOptional(
                                    newImages
                            );

            communityPost.setTitle(
                    request
                            .getTitle()
                            .trim()
            );

            communityPost.setContent(
                    request
                            .getContent()
                            .trim()
            );

            communityPostImageRepository
                    .deleteByCommunityPostId(
                            postId
                    );

            /*
             * 기존 이미지 삭제 SQL을 먼저 DB에 반영합니다.
             *
             * community_post_images에는
             * post_id + display_order UNIQUE 제약이 있으므로
             * 같은 순번의 새 이미지 행을 저장하기 전에
             * 기존 행 삭제를 확정해야 합니다.
             */
            communityPostImageRepository
                    .flush();

            List<String> finalImageUrls =
                    new ArrayList<>();

            finalImageUrls.addAll(
                    keptImageUrls
            );

            finalImageUrls.addAll(
                    savedNewImageUrls
            );

            saveImageEntities(
                    communityPost,
                    finalImageUrls
            );

            CommunityPost updatedPost =
                    communityPostRepository
                            .save(
                                    communityPost
                            );

            communityPostImageService
                    .deleteAll(
                            removedImageUrls
                    );

            return toResponse(
                    updatedPost,
                    currentUser
            );

        } catch (
                RuntimeException exception
        ) {

            communityPostImageService
                    .deleteAll(
                            savedNewImageUrls
                    );

            throw exception;
        }
    }

    /*
     * 커뮤니티 게시글 삭제
     *
     * 작성자 본인만 삭제 가능합니다.
     */
    public void deletePost(
            String username,
            Long postId
    ) {

        User currentUser =
                getUser(
                        username
                );

        CommunityPost communityPost =
                getCommunityPost(
                        postId
                );

        validateAuthor(
                communityPost,
                currentUser
        );

        deleteCommunityPostData(
                communityPost
        );
    }

    /*
     * ==========================================
     * 관리자 커뮤니티 게시글 강제 삭제
     * ==========================================
     *
     * ADMIN 전용 Controller에서만 호출합니다.
     *
     * 작성자 본인 여부와 관계없이
     * 게시글 및 관련 데이터를 안전하게 정리합니다.
     */
    public void deletePostByAdmin(
            Long postId
    ) {

        CommunityPost communityPost =
                getCommunityPost(
                        postId
                );

        deleteCommunityPostData(
                communityPost
        );
    }

    /*
     * ==========================================
     * 커뮤니티 게시글 삭제 공통 처리
     * ==========================================
     */
    private void deleteCommunityPostData(
            CommunityPost communityPost
    ) {

        Long postId =
                communityPost.getId();

        List<CommunityPostImage> images =
                communityPostImageRepository
                        .findByCommunityPostIdOrderByDisplayOrderAsc(
                                postId
                        );

        List<String> imageUrls =
                images.stream()
                        .map(
                                CommunityPostImage
                                        ::getImageUrl
                        )
                        .toList();

        /*
         * FK 제약에 걸리지 않도록
         * 게시글을 참조하는 데이터부터 정리합니다.
         */
        communityCommentRepository
                .deleteByCommunityPostId(
                        postId
                );

        communityPostLikeRepository
                .deleteByCommunityPostId(
                        postId
                );

        communityPostImageRepository
                .deleteByCommunityPostId(
                        postId
                );

        /*
         * 신고된 게시글도 작성자가 직접 삭제할 수 있으므로
         * 관리자 삭제뿐 아니라 일반 삭제에서도
         * 해당 신고 기록을 함께 정리합니다.
         */
        communityReportRepository
                .deleteByCommunityPostId(
                        postId
                );

        /*
         * 삭제되는 글을 가리키는
         * 댓글/좋아요 커뮤니티 알림도 함께 정리합니다.
         */
        notificationService
                .deleteCommunityPostNotifications(
                        postId
                );

        communityPostRepository
                .delete(
                        communityPost
                );

        communityPostImageService
                .deleteAll(
                        imageUrls
                );
    }

    /*
     * 좋아요 토글
     */
    public CommunityPostResponse toggleLike(
            String username,
            Long postId
    ) {

        if (
                username == null ||
                username.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "로그인이 필요합니다."
            );
        }

        User currentUser =
                getUser(
                        username
                );

        CommunityPost communityPost =
                getCommunityPost(
                        postId
                );

        Optional<CommunityPostLike>
                savedLike =
                communityPostLikeRepository
                        .findByCommunityPostIdAndUserId(
                                postId,
                                currentUser
                                        .getId()
                        );

        boolean likedNow;

        if (
                savedLike.isPresent()
        ) {

            /*
             * 이미 좋아요를 누른 상태
             * → 좋아요 취소
             */
            communityPostLikeRepository
                    .delete(
                            savedLike.get()
                    );

            likedNow = false;

        } else {

            /*
             * 좋아요가 없는 상태
             * → 새 좋아요 등록
             */
            CommunityPostLike newLike =
                    new CommunityPostLike();

            newLike.setCommunityPost(
                    communityPost
            );

            newLike.setUser(
                    currentUser
            );

            communityPostLikeRepository
                    .save(
                            newLike
                    );

            likedNow = true;
        }

        /*
         * =====================================
         * 커뮤니티 좋아요 묶음 알림 동기화
         * =====================================
         *
         * 게시글 작성자에게 같은 글 기준
         * 좋아요 알림 하나만 유지합니다.
         *
         * 자기 글에 자기가 누른 좋아요는
         * NotificationService 내부에서
         * 자동으로 제외합니다.
         */
        User postAuthor =
                communityPost
                        .getAuthor();

        notificationService
                .syncCommunityLikeNotification(
                        postAuthor,
                        currentUser,
                        communityPost.getId(),
                        likedNow
                );

        return toResponse(
                communityPost,
                currentUser
        );
    }

    /*
     * ==========================================
     * 커뮤니티 작성 권한 확인
     * ==========================================
     *
     * 관리자에 의해 기간 정지된 사용자는
     * 커뮤니티 글 작성/수정을 할 수 없습니다.
     */
    private void validateCommunityWriteAccess(
            User user
    ) {

        if (
                user != null &&
                user.isCommunitySuspended()
        ) {

            String suspendedUntil =
                    user
                            .getCommunitySuspendedUntil()
                            .toString();

            throw new IllegalArgumentException(
                    "커뮤니티 이용이 "
                    + suspendedUntil
                    + "까지 정지되어 있습니다."
            );
        }
    }

    /*
     * 요청 데이터 검증
     */
    private void validateRequest(
            CommunityPostRequest request
    ) {

        if (
                request == null ||
                request.getTitle() == null ||
                request.getTitle().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "제목을 입력해 주세요."
            );
        }

        if (
                request.getContent() == null ||
                request.getContent().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "내용을 입력해 주세요."
            );
        }

        if (
                request
                        .getTitle()
                        .trim()
                        .length() > 150
        ) {

            throw new IllegalArgumentException(
                    "제목은 150자 이하로 입력해 주세요."
            );
        }
    }

    /*
     * 로그인 사용자 조회
     */
    private User getUser(
            String username
    ) {

        if (
                username == null ||
                username.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "로그인이 필요합니다."
            );
        }

        return userRepository
                .findByUsername(
                        username
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "사용자 정보를 찾을 수 없습니다."
                                )
                );
    }

    /*
     * 게시글 조회
     */
    private CommunityPost getCommunityPost(
            Long postId
    ) {

        return communityPostRepository
                .findById(
                        postId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "커뮤니티 게시글을 찾을 수 없습니다."
                                )
                );
    }

    /*
     * 작성자 본인인지 검사
     */
    private void validateAuthor(
            CommunityPost communityPost,
            User currentUser
    ) {

        User author =
                communityPost
                        .getAuthor();

        if (
                author == null ||
                currentUser == null ||
                !author
                        .getId()
                        .equals(
                                currentUser
                                        .getId()
                        )
        ) {

            throw new IllegalArgumentException(
                    "본인이 작성한 게시글만 수정하거나 삭제할 수 있습니다."
            );
        }
    }

    /*
     * 현재 로그인 사용자 선택 조회
     */
    private User findCurrentUserOptional(
            String username
    ) {

        if (
                username == null ||
                username.isBlank()
        ) {
            return null;
        }

        return userRepository
                .findByUsername(
                        username
                )
                .orElse(
                        null
                );
    }

    /*
     * 기존 사진 목록 검증
     */
    private List<String> normalizeExistingImages(
            List<String> currentImageUrls,
            List<String> requestedImageUrls
    ) {

        if (
                requestedImageUrls == null ||
                requestedImageUrls.isEmpty()
        ) {
            return new ArrayList<>();
        }

        Set<String> requestedSet =
                new HashSet<>(
                        requestedImageUrls
                );

        return currentImageUrls
                .stream()
                .filter(
                        requestedSet
                                ::contains
                )
                .toList();
    }

    /*
     * 실제 새 파일 개수
     */
    private int countRealFiles(
            List<MultipartFile> images
    ) {

        if (
                images == null ||
                images.isEmpty()
        ) {
            return 0;
        }

        return (int)
                images.stream()
                        .filter(
                                image ->
                                        image != null &&
                                        !image.isEmpty()
                        )
                        .count();
    }

    /*
     * 사진 엔티티 저장
     */
    private void saveImageEntities(
            CommunityPost communityPost,
            List<String> imageUrls
    ) {

        for (
                int index = 0;
                index <
                        imageUrls.size();
                index++
        ) {

            CommunityPostImage image =
                    new CommunityPostImage();

            image.setCommunityPost(
                    communityPost
            );

            image.setImageUrl(
                    imageUrls.get(
                            index
                    )
            );

            image.setDisplayOrder(
                    index
            );

            communityPostImageRepository
                    .save(
                            image
                    );
        }
    }

    /*
     * Entity → Response
     */
    private CommunityPostResponse toResponse(
            CommunityPost communityPost,
            User currentUser
    ) {

        CommunityPostResponse response =
                new CommunityPostResponse();

        response.setId(
                communityPost.getId()
        );

        response.setTitle(
                communityPost.getTitle()
        );

        response.setContent(
                communityPost.getContent()
        );

        response.setCreatedAt(
                communityPost.getCreatedAt()
        );

        response.setUpdatedAt(
                communityPost.getUpdatedAt()
        );

        User author =
                communityPost.getAuthor();

        if (author != null) {

            response.setAuthorUsername(
                    author.getUsername()
            );

            response.setAuthorNickname(
                    author.getNickname()
            );

            response.setAuthorProfileImageUrl(
                    author.getProfileImageUrl()
            );
        }

        List<CommunityPostImage> images =
                communityPostImageRepository
                        .findByCommunityPostIdOrderByDisplayOrderAsc(
                                communityPost
                                        .getId()
                        );

        List<String> imageUrls =
                images.stream()
                        .map(
                                CommunityPostImage
                                        ::getImageUrl
                        )
                        .toList();

        response.setImageUrls(
                imageUrls
        );

        long likeCount =
                communityPostLikeRepository
                        .countByCommunityPostId(
                                communityPost
                                        .getId()
                        );

        long commentCount =
                communityCommentRepository
                        .countByCommunityPostId(
                                communityPost
                                        .getId()
                        );

        response.setLikeCount(
                likeCount
        );

        response.setCommentCount(
                commentCount
        );

        boolean likedByMe =
                currentUser != null &&
                communityPostLikeRepository
                        .existsByCommunityPostIdAndUserId(
                                communityPost
                                        .getId(),
                                currentUser
                                        .getId()
                        );

        response.setLikedByMe(
                likedByMe
        );

        /*
         * 현재 로그인한 사용자가
         * 이 게시글의 작성자인지 여부
         */
        boolean mine =
                currentUser != null &&
                author != null &&
                author.getId() != null &&
                author.getId().equals(
                        currentUser.getId()
                );

        response.setMine(
                mine
        );

        return response;
    }
}
