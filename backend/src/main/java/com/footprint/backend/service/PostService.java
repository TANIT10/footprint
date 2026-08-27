package com.footprint.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import com.footprint.backend.dto.PostCreateRequest;
import com.footprint.backend.dto.PostListItemResponse;
import com.footprint.backend.dto.PostPageResponse;
import com.footprint.backend.dto.PostResponse;
import com.footprint.backend.dto.PostUpdateRequest;
import com.footprint.backend.entity.Gender;
import com.footprint.backend.entity.Post;
import com.footprint.backend.entity.PostImage;
import com.footprint.backend.entity.ReportTargetType;
import com.footprint.backend.entity.User;
import com.footprint.backend.entity.UserRole;
import com.footprint.backend.repository.CommentRepository;
import com.footprint.backend.repository.NotificationRepository;
import com.footprint.backend.repository.PostImageRepository;
import com.footprint.backend.repository.PostRepository;
import com.footprint.backend.repository.ReportRepository;
import com.footprint.backend.repository.UserRepository;

@Service
public class PostService {

    private static final int POST_PAGE_SIZE = 50;

    private final PostRepository
            postRepository;

    private final PostImageRepository
            postImageRepository;

    private final CommentRepository
            commentRepository;

    private final NotificationRepository
            notificationRepository;

    private final ReportRepository
            reportRepository;

    private final UserRepository
            userRepository;

    private final PostImageService
            postImageService;

    /*
     * 새 게시글 저장 후
     * AI 매칭을 별도 스레드에서 실행한다.
     */
    private final AiMatchAsyncService
            aiMatchAsyncService;

    public PostService(
            PostRepository postRepository,
            PostImageRepository postImageRepository,
            CommentRepository commentRepository,
            NotificationRepository notificationRepository,
            ReportRepository reportRepository,
            UserRepository userRepository,
            PostImageService postImageService,
            AiMatchAsyncService aiMatchAsyncService
    ) {

        this.postRepository =
                postRepository;

        this.postImageRepository =
                postImageRepository;

        this.commentRepository =
                commentRepository;

        this.notificationRepository =
                notificationRepository;

        this.reportRepository =
                reportRepository;

        this.userRepository =
                userRepository;

        this.postImageService =
                postImageService;

        this.aiMatchAsyncService =
                aiMatchAsyncService;
    }

    /*
     * =========================================================
     * 게시글 등록
     * =========================================================
     */
    @Transactional
    public PostResponse createPost(
            String username,
            PostCreateRequest request,
            List<MultipartFile> images
    ) {

        User author =
                findUser(
                        username
                );

        /*
         * 실제 이미지 파일을 먼저 저장한다.
         */
        List<String> savedImageUrls =
                postImageService
                        .saveAll(
                                images
                        );

        try {

            Post post =
                    new Post();

            post.setAuthor(
                    author
            );

            post.setPostType(
                    request.getPostType()
            );

            post.setBreed(
                    request.getBreed()
            );

            if (
                    request.getGender()
                            == null
            ) {
                post.setGender(
                        Gender.UNKNOWN
                );
            } else {
                post.setGender(
                        request.getGender()
                );
            }

            post.setAge(
                    emptyToNull(
                            request.getAge()
                    )
            );

            post.setColor(
                    emptyToNull(
                            request.getColor()
                    )
            );

            post.setFeature(
                    emptyToNull(
                            request.getFeature()
                    )
            );

            post.setLocation(
                    request.getLocation()
            );

            post.setDate(
                    request.getDate()
            );

            post.setContact(
                    emptyToNull(
                            request.getContact()
                    )
            );

            post.setContent(
                    request.getContent()
            );

            Post savedPost =
                    postRepository
                            .save(
                                    post
                            );

            /*
             * 게시글 이미지 DB 저장.
             */
            List<PostImage> postImages =
                    createPostImages(
                            savedPost,
                            savedImageUrls
                    );

            postImageRepository
                    .saveAll(
                            postImages
                    );

            /*
             * 중요.
             *
             * 비동기 AI를 지금 바로 실행하면
             * 다른 스레드가 현재 트랜잭션이
             * 커밋되기 전에 실행될 수 있다.
             *
             * 그러면 새 게시글이나 이미지가
             * 아직 DB에서 조회되지 않을 수 있다.
             *
             * 따라서 트랜잭션 COMMIT이
             * 성공한 뒤에만 AI 작업을 시작한다.
             */
            registerAiMatchAfterCommit(
                    savedPost.getId()
            );

            return toResponse(
                    savedPost,
                    savedImageUrls
            );

        } catch (
                RuntimeException exception
        ) {

            /*
             * DB 저장 실패 시
             * 먼저 저장했던 실제 이미지 파일 제거.
             */
            postImageService
                    .deleteAll(
                            savedImageUrls
                    );

            throw exception;
        }
    }

    /*
     * =========================================================
     * 전체 게시글 목록
     * =========================================================
     */
    @Transactional(readOnly = true)
    public PostPageResponse getPostPage(
            int page
    ) {

        validatePage(
                page
        );

        Pageable pageable =
                PageRequest.of(
                        page,
                        POST_PAGE_SIZE
                );

        Page<Post> postPage =
                postRepository
                        .findAllByOrderByCreatedAtDesc(
                                pageable
                        );

        return toPageResponse(
                postPage
        );
    }

    /*
     * =========================================================
     * 내가 작성한 게시글 목록
     * =========================================================
     */
    @Transactional(readOnly = true)
    public PostPageResponse getMyPostPage(
            String username,
            int page
    ) {

        validatePage(
                page
        );

        User user =
                findUser(
                        username
                );

        Pageable pageable =
                PageRequest.of(
                        page,
                        POST_PAGE_SIZE
                );

        Page<Post> postPage =
                postRepository
                        .findByAuthorIdOrderByCreatedAtDesc(
                                user.getId(),
                                pageable
                        );

        return toPageResponse(
                postPage
        );
    }

    /*
     * =========================================================
     * 게시글 상세
     * =========================================================
     */
    @Transactional(readOnly = true)
    public PostResponse getPost(
            Long postId
    ) {

        Post post =
                findPost(
                        postId
                );

        List<String> imageUrls =
                getImageUrls(
                        postId
                );

        return toResponse(
                post,
                imageUrls
        );
    }

    /*
     * =========================================================
     * 게시글 수정
     * =========================================================
     */
    @Transactional
    public PostResponse updatePost(
            String username,
            Long postId,
            PostUpdateRequest request,
            List<MultipartFile> newImages
    ) {

        Post post =
                findPost(
                        postId
                );

        validateUpdateAuthor(
                post,
                username
        );

        List<String> currentImageUrls =
                getImageUrls(
                        postId
                );

        List<String> existingImageUrls =
                new ArrayList<>(
                        request
                                .getExistingImageUrls()
                );

        validateExistingImageUrls(
                existingImageUrls,
                currentImageUrls
        );

        int newImageCount =
                newImages == null
                        ? 0
                        : newImages.size();

        postImageService
                .validateTotalImageCount(
                        existingImageUrls.size()
                                + newImageCount
                );

        List<String> savedNewImageUrls =
                postImageService
                        .saveOptional(
                                newImages
                        );

        List<String> removedImageUrls =
                currentImageUrls
                        .stream()
                        .filter(
                                imageUrl ->
                                        !existingImageUrls
                                                .contains(
                                                        imageUrl
                                                )
                        )
                        .toList();

        registerUpdateImageCleanup(
                savedNewImageUrls,
                removedImageUrls
        );

        updatePostFields(
                post,
                request
        );

        Post savedPost =
                postRepository
                        .saveAndFlush(
                                post
                        );

        postImageRepository
                .deleteByPostId(
                        postId
                );

        postImageRepository
                .flush();

        List<String> finalImageUrls =
                new ArrayList<>(
                        existingImageUrls
                );

        finalImageUrls.addAll(
                savedNewImageUrls
        );

        List<PostImage> finalPostImages =
                createPostImages(
                        savedPost,
                        finalImageUrls
                );

        postImageRepository
                .saveAll(
                        finalPostImages
                );

        postImageRepository
                .flush();

        return toResponse(
                savedPost,
                finalImageUrls
        );
    }

    /*
     * =========================================================
     * 게시글 삭제
     * =========================================================
     */
    @Transactional
    public void deletePost(
            String username,
            Long postId
    ) {

        User currentUser =
                findUser(
                        username
                );

        Post post =
                findPost(
                        postId
                );

        validateDeletePermission(
                currentUser,
                post
        );

        List<String> imageUrls =
                getImageUrls(
                        postId
                );

        /*
         * 실제 이미지 파일은
         * DB 트랜잭션 COMMIT이 성공한 뒤 삭제합니다.
         */
        registerDeleteImageCleanup(
                imageUrls
        );

        /*
         * 게시글 댓글 삭제
         */
        commentRepository
                .deleteByPostId(
                        postId
                );

        commentRepository
                .flush();

        /*
         * 삭제되는 일반 게시글을 가리키는
         * 알림 전체 삭제
         *
         * 일반 알림 / AI 매칭 알림 등
         * 같은 postId를 가진 알림을 정리합니다.
         */
        notificationRepository
                .deleteByPostId(
                        postId
                );

        notificationRepository
                .flush();

        /*
         * 삭제되는 일반 게시글을 대상으로 한
         * 신고 기록 전체 삭제
         */
        reportRepository
                .deleteByTargetTypeAndTargetId(
                        ReportTargetType.POST,
                        postId
                );

        reportRepository
                .flush();

        /*
         * 게시글 이미지 DB 정보 삭제
         */
        postImageRepository
                .deleteByPostId(
                        postId
                );

        postImageRepository
                .flush();

        /*
         * 게시글 본체 삭제
         */
        postRepository
                .delete(
                        post
                );

        postRepository
                .flush();
    }

    /*
     * =========================================================
     * 새 게시글 AI 매칭 예약
     * =========================================================
     *
     * DB 트랜잭션이 정상적으로 커밋된 뒤
     * 별도 스레드에서 AI 매칭을 시작한다.
     */
    private void registerAiMatchAfterCommit(
            Long postId
    ) {

        if (
                postId == null
        ) {
            return;
        }

        /*
         * 현재 트랜잭션 동기화가 활성화된 경우
         * afterCommit에서 AI 작업 시작.
         */
        if (
                TransactionSynchronizationManager
                        .isSynchronizationActive()
        ) {

            TransactionSynchronizationManager
                    .registerSynchronization(
                            new TransactionSynchronization() {

                                @Override
                                public void afterCommit() {

                                    aiMatchAsyncService
                                            .processNewPost(
                                                    postId
                                            );
                                }
                            }
                    );

            return;
        }

        /*
         * 혹시 트랜잭션이 없는 환경에서
         * 호출된 경우에도 안전하게 실행.
         */
        aiMatchAsyncService
                .processNewPost(
                        postId
                );
    }

    /*
     * =========================================================
     * 사용자 조회
     * =========================================================
     */
    private User findUser(
            String username
    ) {

        return userRepository
                .findByUsername(
                        username
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );
    }

    /*
     * =========================================================
     * 게시글 조회
     * =========================================================
     */
    private Post findPost(
            Long postId
    ) {

        return postRepository
                .findById(
                        postId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "게시글을 찾을 수 없습니다."
                        )
                );
    }

    /*
     * =========================================================
     * 페이지 번호 검사
     * =========================================================
     */
    private void validatePage(
            int page
    ) {

        if (
                page < 0
        ) {
            throw new IllegalArgumentException(
                    "페이지 번호는 0 이상이어야 합니다."
            );
        }
    }

    /*
     * =========================================================
     * 게시글 페이지 응답 변환
     * =========================================================
     */
    private PostPageResponse
            toPageResponse(
                    Page<Post> postPage
            ) {

        List<Post> posts =
                postPage
                        .getContent();

        List<Long> postIds =
                posts
                        .stream()
                        .map(
                                Post::getId
                        )
                        .toList();

        Map<Long, String>
                representativeImageMap =
                getRepresentativeImageMap(
                        postIds
                );

        List<PostListItemResponse> responses =
                posts
                        .stream()
                        .map(
                                post ->
                                        toListItemResponse(
                                                post,
                                                representativeImageMap
                                                        .get(
                                                                post.getId()
                                                        )
                                        )
                        )
                        .toList();

        return new PostPageResponse(
                responses,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalElements(),
                postPage.getTotalPages(),
                postPage.isFirst(),
                postPage.isLast()
        );
    }

    /*
     * =========================================================
     * 게시글 이미지 URL 목록
     * =========================================================
     */
    private List<String> getImageUrls(
            Long postId
    ) {

        return postImageRepository
                .findByPostIdOrderByDisplayOrderAsc(
                        postId
                )
                .stream()
                .map(
                        PostImage::getImageUrl
                )
                .toList();
    }

    /*
     * =========================================================
     * PostImage 엔티티 생성
     * =========================================================
     */
    private List<PostImage>
            createPostImages(
                    Post post,
                    List<String> imageUrls
            ) {

        List<PostImage> postImages =
                new ArrayList<>();

        for (
                int index = 0;
                index < imageUrls.size();
                index++
        ) {

            PostImage postImage =
                    new PostImage();

            postImage.setPost(
                    post
            );

            postImage.setImageUrl(
                    imageUrls.get(
                            index
                    )
            );

            postImage.setDisplayOrder(
                    index
            );

            postImages.add(
                    postImage
            );
        }

        return postImages;
    }

    /*
     * =========================================================
     * 수정 권한 확인
     * =========================================================
     */
    private void validateUpdateAuthor(
            Post post,
            String username
    ) {

        if (
                !post.getAuthor()
                        .getUsername()
                        .equals(
                                username
                        )
        ) {

            throw new AccessDeniedException(
                    "본인이 작성한 게시글만 "
                            + "수정할 수 있습니다."
            );
        }
    }

    /*
     * =========================================================
     * 삭제 권한 확인
     * =========================================================
     */
    private void validateDeletePermission(
            User currentUser,
            Post post
    ) {

        boolean isAuthor =
                post.getAuthor()
                        .getId()
                        .equals(
                                currentUser
                                        .getId()
                        );

        boolean isAdmin =
                currentUser.getRole()
                        == UserRole.ADMIN;

        if (
                !isAuthor &&
                !isAdmin
        ) {

            throw new AccessDeniedException(
                    "본인이 작성한 게시글만 "
                            + "삭제할 수 있습니다."
            );
        }
    }

    /*
     * =========================================================
     * 수정 시 기존 이미지 검증
     * =========================================================
     */
    private void validateExistingImageUrls(
            List<String> existingImageUrls,
            List<String> currentImageUrls
    ) {

        Set<String> currentImageUrlSet =
                new HashSet<>(
                        currentImageUrls
                );

        Set<String> requestedImageUrlSet =
                new HashSet<>();

        for (
                String imageUrl
                : existingImageUrls
        ) {

            if (
                    imageUrl == null ||
                    imageUrl.isBlank()
            ) {

                throw new IllegalArgumentException(
                        "유지할 사진 주소가 "
                                + "올바르지 않습니다."
                );
            }

            if (
                    !requestedImageUrlSet
                            .add(
                                    imageUrl
                            )
            ) {

                throw new IllegalArgumentException(
                        "같은 사진을 중복해서 "
                                + "등록할 수 없습니다."
                );
            }

            if (
                    !currentImageUrlSet
                            .contains(
                                    imageUrl
                            )
            ) {

                throw new IllegalArgumentException(
                        "해당 게시글에 등록되지 "
                                + "않은 사진입니다."
                );
            }
        }
    }

    /*
     * =========================================================
     * 게시글 수정 필드 적용
     * =========================================================
     */
    private void updatePostFields(
            Post post,
            PostUpdateRequest request
    ) {

        post.setPostType(
                request.getPostType()
        );

        post.setBreed(
                request.getBreed()
        );

        if (
                request.getGender()
                        == null
        ) {
            post.setGender(
                    Gender.UNKNOWN
            );
        } else {
            post.setGender(
                    request.getGender()
            );
        }

        post.setAge(
                emptyToNull(
                        request.getAge()
                )
        );

        post.setColor(
                emptyToNull(
                        request.getColor()
                )
        );

        post.setFeature(
                emptyToNull(
                        request.getFeature()
                )
        );

        post.setLocation(
                request.getLocation()
        );

        post.setDate(
                request.getDate()
        );

        post.setContact(
                emptyToNull(
                        request.getContact()
                )
        );

        post.setContent(
                request.getContent()
        );
    }

    /*
     * =========================================================
     * 수정 후 실제 이미지 파일 정리
     * =========================================================
     */
    private void registerUpdateImageCleanup(
            List<String> newImageUrls,
            List<String> removedImageUrls
    ) {

        List<String> newImages =
                List.copyOf(
                        newImageUrls
                );

        List<String> removedImages =
                List.copyOf(
                        removedImageUrls
                );

        TransactionSynchronizationManager
                .registerSynchronization(
                        new TransactionSynchronization() {

                            @Override
                            public void afterCommit() {

                                postImageService
                                        .deleteAll(
                                                removedImages
                                        );
                            }

                            @Override
                            public void afterCompletion(
                                    int status
                            ) {

                                if (
                                        status
                                                != STATUS_COMMITTED
                                ) {

                                    postImageService
                                            .deleteAll(
                                                    newImages
                                            );
                                }
                            }
                        }
                );
    }

    /*
     * =========================================================
     * 삭제 후 실제 이미지 파일 정리
     * =========================================================
     */
    private void registerDeleteImageCleanup(
            List<String> imageUrls
    ) {

        List<String> images =
                List.copyOf(
                        imageUrls
                );

        TransactionSynchronizationManager
                .registerSynchronization(
                        new TransactionSynchronization() {

                            @Override
                            public void afterCommit() {

                                postImageService
                                        .deleteAll(
                                                images
                                        );
                            }
                        }
                );
    }

    /*
     * =========================================================
     * 목록용 대표 이미지 한 번에 조회
     * =========================================================
     */
    private Map<Long, String>
            getRepresentativeImageMap(
                    List<Long> postIds
            ) {

        Map<Long, String> result =
                new HashMap<>();

        if (
                postIds.isEmpty()
        ) {
            return result;
        }

        List<PostImage> postImages =
                postImageRepository
                        .findByPostIdInOrderByPostIdAscDisplayOrderAsc(
                                postIds
                        );

        for (
                PostImage postImage
                : postImages
        ) {

            Long postId =
                    postImage
                            .getPost()
                            .getId();

            result.putIfAbsent(
                    postId,
                    postImage
                            .getImageUrl()
            );
        }

        return result;
    }

    /*
     * =========================================================
     * 목록 응답 변환
     * =========================================================
     */
    private PostListItemResponse
            toListItemResponse(
                    Post post,
                    String representativeImage
            ) {

        User author =
                post.getAuthor();

        return new PostListItemResponse(
                post.getId(),
                author.getId(),
                author.getUsername(),
                author.getNickname(),
                author.getProfileImageUrl(),
                post.getPostType(),
                post.getBreed(),
                post.getGender(),
                post.getLocation(),
                post.getDate(),
                representativeImage,
                post.getCreatedAt()
        );
    }

    /*
     * =========================================================
     * 상세 응답 변환
     * =========================================================
     */
    private PostResponse toResponse(
            Post post,
            List<String> imageUrls
    ) {

        User author =
                post.getAuthor();

        String representativeImage =
                null;

        if (
                imageUrls != null &&
                !imageUrls.isEmpty()
        ) {

            representativeImage =
                    imageUrls.get(
                            0
                    );
        }

        return new PostResponse(
                post.getId(),
                author.getId(),
                author.getUsername(),
                author.getNickname(),
                author.getProfileImageUrl(),
                post.getPostType(),
                post.getBreed(),
                post.getGender(),
                post.getAge(),
                post.getColor(),
                post.getFeature(),
                post.getLocation(),
                post.getDate(),
                post.getContact(),
                post.getContent(),
                representativeImage,
                imageUrls,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    /*
     * =========================================================
     * 빈 문자열 → null
     * =========================================================
     */
    private String emptyToNull(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {

            return null;
        }

        return value.trim();
    }
}