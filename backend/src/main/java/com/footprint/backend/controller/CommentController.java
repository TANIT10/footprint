package com.footprint.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.dto.CommentCreateRequest;
import com.footprint.backend.dto.CommentResponse;
import com.footprint.backend.service.CommentService;

import jakarta.validation.Valid;

@RestController
public class CommentController {

    private final CommentService commentService;

    public CommentController(
            CommentService commentService) {

        this.commentService = commentService;
    }

    @PostMapping(
            "/api/posts/{postId}/comments"
    )
    public ResponseEntity<CommentResponse>
            createComment(
                    Authentication authentication,
                    @PathVariable Long postId,
                    @Valid
                    @RequestBody
                    CommentCreateRequest request) {

        String username =
                authentication.getName();

        CommentResponse response =
                commentService.createComment(
                        username,
                        postId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping(
            "/api/posts/{postId}/comments"
    )
    public ResponseEntity<List<CommentResponse>>
            getComments(
                    Authentication authentication,
                    @PathVariable Long postId) {

        String username =
                authentication.getName();

        List<CommentResponse> responses =
                commentService.getComments(
                        username,
                        postId
                );

        return ResponseEntity.ok(responses);
    }

    @DeleteMapping(
            "/api/comments/{commentId}"
    )
    public ResponseEntity<Void>
            deleteComment(
                    Authentication authentication,
                    @PathVariable Long commentId) {

        String username =
                authentication.getName();

        commentService.deleteComment(
                username,
                commentId
        );

        return ResponseEntity
                .noContent()
                .build();
    }
}