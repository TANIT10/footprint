package com.footprint.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.footprint.backend.dto.PostCreateRequest;
import com.footprint.backend.dto.PostListItemResponse;
import com.footprint.backend.dto.PostPageResponse;
import com.footprint.backend.dto.PostResponse;
import com.footprint.backend.entity.Gender;
import com.footprint.backend.entity.Post;
import com.footprint.backend.entity.PostImage;
import com.footprint.backend.entity.User;
import com.footprint.backend.repository.PostImageRepository;
import com.footprint.backend.repository.PostRepository;
import com.footprint.backend.repository.UserRepository;

@Service
public class PostService {

    private static final int POST_PAGE_SIZE = 50;

    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final UserRepository userRepository;
    private final PostImageService postImageService;

    public PostService(
            PostRepository postRepository,
            PostImageRepository postImageRepository,
            UserRepository userRepository,
            PostImageService postImageService) {

        this.postRepository = postRepository;
        this.postImageRepository =
                postImageRepository;
        this.userRepository = userRepository;
        this.postImageService = postImageService;
    }

    @Transactional
    public PostResponse createPost(
            String username,
            PostCreateRequest request,
            List<MultipartFile> images) {

        User author = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );

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
                    new ArrayList<>();

            for (int index = 0;
                    index < savedImageUrls.size();
                    index++) {

                PostImage postImage =
                        new PostImage();

                postImage.setPost(savedPost);
                postImage.setImageUrl(
                        savedImageUrls.get(index)
                );
                postImage.setDisplayOrder(index);

                postImages.add(postImage);
            }

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

        if (page < 0) {
            throw new IllegalArgumentException(
                    "페이지 번호는 0 이상이어야 합니다."
            );
        }

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

    @Transactional(readOnly = true)
    public PostResponse getPost(
            Long postId) {

        Post post = postRepository
                .findById(postId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "게시글을 찾을 수 없습니다."
                        )
                );

        List<String> imageUrls =
                postImageRepository
                .findByPostIdOrderByDisplayOrderAsc(
                        postId
                )
                .stream()
                .map(PostImage::getImageUrl)
                .toList();

        return toResponse(
                post,
                imageUrls
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