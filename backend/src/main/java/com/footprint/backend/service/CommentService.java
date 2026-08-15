package com.footprint.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.footprint.backend.dto.CommentCreateRequest;
import com.footprint.backend.dto.CommentResponse;
import com.footprint.backend.entity.Comment;
import com.footprint.backend.entity.Post;
import com.footprint.backend.entity.User;
import com.footprint.backend.entity.UserRole;
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

        User author = findUser(username);

        Post post = findPost(postId);

        Comment comment = new Comment();

        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(
                request.getContent().trim()
        );

        Comment savedComment =
                commentRepository.save(comment);

        return toResponse(
                savedComment,
                author
        );
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(
            String username,
            Long postId) {

        User currentUser =
                findUser(username);

        findPost(postId);

        return commentRepository
                .findByPostIdOrderByCreatedAtAsc(
                        postId
                )
                .stream()
                .map(comment ->
                        toResponse(
                                comment,
                                currentUser
                        )
                )
                .toList();
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

    private CommentResponse toResponse(
            Comment comment,
            User currentUser) {

        User author = comment.getAuthor();

        boolean isAuthor =
                author.getId()
                .equals(currentUser.getId());

        boolean isAdmin =
                currentUser.getRole()
                        == UserRole.ADMIN;

        return new CommentResponse(
                comment.getId(),
                comment.getPost().getId(),
                author.getId(),
                author.getNickname(),
                author.getProfileImageUrl(),
                comment.getContent(),
                comment.getCreatedAt(),
                isAuthor || isAdmin
        );
    }
}