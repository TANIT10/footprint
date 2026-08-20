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
import com.footprint.backend.entity.User;
import com.footprint.backend.entity.UserRole;
import com.footprint.backend.repository.CommentRepository;
import com.footprint.backend.repository.PostImageRepository;
import com.footprint.backend.repository.PostRepository;
import com.footprint.backend.repository.UserRepository;

@Service
public class PostService {

    private static final int POST_PAGE_SIZE = 50;

    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostImageService postImageService;

    public PostService(
            PostRepository postRepository,
            PostImageRepository postImageRepository,
            CommentRepository commentRepository,
            UserRepository userRepository,
            PostImageService postImageService) {

        this.postRepository = postRepository;
        this.postImageRepository =
                postImageRepository;
        this.commentRepository =
                commentRepository;
        this.userRepository = userRepository;
        this.postImageService = postImageService;
    }

    @Transactional
    public PostResponse createPost(
            String username,
            PostCreateRequest request,
            List<MultipartFile> images) {

        User author = findUser(username);

        List<String> savedImageUrls =
                postImageService.saveAll(images);

        try {
            Post post = new Post();

            post.setAuthor(author);
            post.setPostType(
                    request.getPostType()
            );
            post.setBreed(
                    request.getBreed()
            );

            if (request.getGender() == null) {
                post.setGender(Gender.UNKNOWN);
            } else {
                post.setGender(
                        request.getGender()
                );
            }

            post.setAge(
                    emptyToNull(request.getAge())
            );
            post.setColor(
                    emptyToNull(request.getColor())
            );
            post.setFeature(
                    emptyToNull(request.getFeature())
            );
            post.setLocation(
                    request.getLocation()
            );
            post.setDate(
                    request.getDate()
            );
            post.setContact(
                    emptyToNull(request.getContact())
            );
            post.setContent(
                    request.getContent()
            );

            Post savedPost =
                    postRepository.save(post);

            List<PostImage> postImages =
                    createPostImages(
                            savedPost,
                            savedImageUrls
                    );

            postImageRepository.saveAll(
                    postImages
            );

            return toResponse(
                    savedPost,
                    savedImageUrls
            );
        } catch (RuntimeException exception) {

            postImageService.deleteAll(
                    savedImageUrls
            );

            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public PostPageResponse getPostPage(
            int page) {

        validatePage(page);

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

        return toPageResponse(postPage);
    }

    @Transactional(readOnly = true)
    public PostPageResponse getMyPostPage(
            String username,
            int page) {

        validatePage(page);

        User user = findUser(username);

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

        return toPageResponse(postPage);
    }

    @Transactional(readOnly = true)
    public PostResponse getPost(
            Long postId) {

        Post post = findPost(postId);

        List<String> imageUrls =
                getImageUrls(postId);

        return toResponse(
                post,
                imageUrls
        );
    }

    @Transactional
    public PostResponse updatePost(
            String username,
            Long postId,
            PostUpdateRequest request,
            List<MultipartFile> newImages) {

        Post post = findPost(postId);

        validateUpdateAuthor(
                post,
                username
        );

        List<String> currentImageUrls =
                getImageUrls(postId);

        List<String> existingImageUrls =
                new ArrayList<>(
                        request.getExistingImageUrls()
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
                postImageService.saveOptional(
                        newImages
                );

        List<String> removedImageUrls =
                currentImageUrls.stream()
                .filter(imageUrl ->
                        !existingImageUrls
                                .contains(imageUrl)
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
                postRepository.saveAndFlush(
                        post
                );

        postImageRepository.deleteByPostId(
                postId
        );
        postImageRepository.flush();

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

        postImageRepository.saveAll(
                finalPostImages
        );
        postImageRepository.flush();

        return toResponse(
                savedPost,
                finalImageUrls
        );
    }

    @Transactional
    public void deletePost(
            String username,
            Long postId) {

        User currentUser =
                findUser(username);

        Post post = findPost(postId);

        validateDeletePermission(
                currentUser,
                post
        );

        List<String> imageUrls =
                getImageUrls(postId);

        registerDeleteImageCleanup(
                imageUrls
        );

        commentRepository.deleteByPostId(
                postId
        );
        commentRepository.flush();

        postImageRepository.deleteByPostId(
                postId
        );
        postImageRepository.flush();

        postRepository.delete(post);
        postRepository.flush();
    }

    private User findUser(String username) {

        return userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );
    }

    private Post findPost(Long postId) {

        return postRepository
                .findById(postId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "게시글을 찾을 수 없습니다."
                        )
                );
    }

    private void validatePage(int page) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "페이지 번호는 0 이상이어야 합니다."
            );
        }
    }

    private PostPageResponse toPageResponse(
            Page<Post> postPage) {

        List<Post> posts =
                postPage.getContent();

        List<Long> postIds =
                posts.stream()
                .map(Post::getId)
                .toList();

        Map<Long, String>
                representativeImageMap =
                        getRepresentativeImageMap(
                                postIds
                        );

        List<PostListItemResponse> responses =
                posts.stream()
                .map(post ->
                        toListItemResponse(
                                post,
                                representativeImageMap
                                        .get(post.getId())
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

    private List<String> getImageUrls(
            Long postId) {

        return postImageRepository
                .findByPostIdOrderByDisplayOrderAsc(
                        postId
                )
                .stream()
                .map(PostImage::getImageUrl)
                .toList();
    }

    private List<PostImage> createPostImages(
            Post post,
            List<String> imageUrls) {

        List<PostImage> postImages =
                new ArrayList<>();

        for (int index = 0;
                index < imageUrls.size();
                index++) {

            PostImage postImage =
                    new PostImage();

            postImage.setPost(post);
            postImage.setImageUrl(
                    imageUrls.get(index)
            );
            postImage.setDisplayOrder(index);

            postImages.add(postImage);
        }

        return postImages;
    }

    private void validateUpdateAuthor(
            Post post,
            String username) {

        if (!post.getAuthor()
                .getUsername()
                .equals(username)) {

            throw new AccessDeniedException(
                    "본인이 작성한 게시글만 "
                    + "수정할 수 있습니다."
            );
        }
    }

    private void validateDeletePermission(
            User currentUser,
            Post post) {

        boolean isAuthor =
                post.getAuthor()
                .getId()
                .equals(currentUser.getId());

        boolean isAdmin =
                currentUser.getRole()
                        == UserRole.ADMIN;

        if (!isAuthor && !isAdmin) {
            throw new AccessDeniedException(
                    "본인이 작성한 게시글만 "
                    + "삭제할 수 있습니다."
            );
        }
    }

    private void validateExistingImageUrls(
            List<String> existingImageUrls,
            List<String> currentImageUrls) {

        Set<String> currentImageUrlSet =
                new HashSet<>(
                        currentImageUrls
                );

        Set<String> requestedImageUrlSet =
                new HashSet<>();

        for (String imageUrl
                : existingImageUrls) {

            if (imageUrl == null
                    || imageUrl.isBlank()) {

                throw new IllegalArgumentException(
                        "유지할 사진 주소가 "
                        + "올바르지 않습니다."
                );
            }

            if (!requestedImageUrlSet.add(
                    imageUrl
            )) {
                throw new IllegalArgumentException(
                        "같은 사진을 중복해서 "
                        + "등록할 수 없습니다."
                );
            }

            if (!currentImageUrlSet.contains(
                    imageUrl
            )) {
                throw new IllegalArgumentException(
                        "해당 게시글에 등록되지 "
                        + "않은 사진입니다."
                );
            }
        }
    }

    private void updatePostFields(
            Post post,
            PostUpdateRequest request) {

        post.setPostType(
                request.getPostType()
        );
        post.setBreed(
                request.getBreed()
        );

        if (request.getGender() == null) {
            post.setGender(Gender.UNKNOWN);
        } else {
            post.setGender(
                    request.getGender()
            );
        }

        post.setAge(
                emptyToNull(request.getAge())
        );
        post.setColor(
                emptyToNull(request.getColor())
        );
        post.setFeature(
                emptyToNull(request.getFeature())
        );
        post.setLocation(
                request.getLocation()
        );
        post.setDate(
                request.getDate()
        );
        post.setContact(
                emptyToNull(request.getContact())
        );
        post.setContent(
                request.getContent()
        );
    }

    private void registerUpdateImageCleanup(
            List<String> newImageUrls,
            List<String> removedImageUrls) {

        List<String> newImages =
                List.copyOf(newImageUrls);

        List<String> removedImages =
                List.copyOf(removedImageUrls);

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
                                    int status) {

                                if (status
                                        != STATUS_COMMITTED) {

                                    postImageService
                                            .deleteAll(
                                                    newImages
                                            );
                                }
                            }
                        }
                );
    }

    private void registerDeleteImageCleanup(
            List<String> imageUrls) {

        List<String> images =
                List.copyOf(imageUrls);

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

    private Map<Long, String>
            getRepresentativeImageMap(
                    List<Long> postIds) {

        Map<Long, String> result =
                new HashMap<>();

        if (postIds.isEmpty()) {
            return result;
        }

        List<PostImage> postImages =
                postImageRepository
                .findByPostIdInOrderByPostIdAscDisplayOrderAsc(
                        postIds
                );

        for (PostImage postImage : postImages) {

            Long postId =
                    postImage
                    .getPost()
                    .getId();

            result.putIfAbsent(
                    postId,
                    postImage.getImageUrl()
            );
        }

        return result;
    }

    private PostListItemResponse
            toListItemResponse(
                    Post post,
                    String representativeImage) {

        User author = post.getAuthor();

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

    private PostResponse toResponse(
            Post post,
            List<String> imageUrls) {

        User author = post.getAuthor();

        String representativeImage = null;

        if (imageUrls != null
                && !imageUrls.isEmpty()) {

            representativeImage =
                    imageUrls.get(0);
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

    private String emptyToNull(String value) {

        if (value == null
                || value.isBlank()) {

            return null;
        }

        return value.trim();
    }
}