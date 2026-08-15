package com.footprint.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.footprint.backend.dto.CommentCreateRequest;
import com.footprint.backend.dto.CommentResponse;
import com.footprint.backend.entity.Comment;
import com.footprint.backend.entity.Post;
import com.footprint.backend.entity.User;
import com.footprint.backend.repository.CommentRepository;
import com.footprint.backend.repository.PostRepository;
import com.footprint.backend.repository.UserRepository;

@Service
public class CommentService {

    private final CommentRepository
            commentRepository;

    private final PostRepository
            postRepository;

    private final UserRepository
            userRepository;

    public CommentService(
            CommentRepository commentRepository,
            PostRepository postRepository,
            UserRepository userRepository) {

        this.commentRepository =
                commentRepository;
        this.postRepository =
                postRepository;
        this.userRepository =
                userRepository;
    }

    @Transactional
    public CommentResponse createComment(
            String username,
            Long postId,
            CommentCreateRequest request) {

        User author = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );

        Post post = postRepository
                .findById(postId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "게시글을 찾을 수 없습니다."
                        )
                );

        Comment comment = new Comment();

        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(
                request.getContent().trim()
        );

        Comment savedComment =
                commentRepository.save(comment);

        return new CommentResponse(
                savedComment.getId(),
                post.getId(),
                author.getId(),
                author.getNickname(),
                author.getProfileImageUrl(),
                savedComment.getContent(),
                savedComment.getCreatedAt(),
                true
        );
    }
}