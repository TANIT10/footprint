package com.footprint.backend.dto;

import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;

    private Long postId;

    private Long authorId;

    private String authorUsername;

    private String authorNickname;

    private String authorProfileImageUrl;

    private String content;

    private LocalDateTime createdAt;

    private boolean deletable;

    public CommentResponse(
            Long id,
            Long postId,
            Long authorId,
            String authorUsername,
            String authorNickname,
            String authorProfileImageUrl,
            String content,
            LocalDateTime createdAt,
            boolean deletable
    ) {
        this.id = id;
        this.postId = postId;
        this.authorId = authorId;
        this.authorUsername =
                authorUsername;
        this.authorNickname =
                authorNickname;
        this.authorProfileImageUrl =
                authorProfileImageUrl;
        this.content = content;
        this.createdAt = createdAt;
        this.deletable = deletable;
    }

    public Long getId() {
        return id;
    }

    public Long getPostId() {
        return postId;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public String getAuthorNickname() {
        return authorNickname;
    }

    public String getAuthorProfileImageUrl() {
        return authorProfileImageUrl;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isDeletable() {
        return deletable;
    }
}