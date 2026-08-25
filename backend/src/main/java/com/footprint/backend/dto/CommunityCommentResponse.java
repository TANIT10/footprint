package com.footprint.backend.dto;

import java.time.LocalDateTime;

public class CommunityCommentResponse {

    private Long id;

    private String content;

    private String authorUsername;

    private String authorNickname;

    private String authorProfileImageUrl;

    private boolean deletable;

    private LocalDateTime createdAt;

    public CommunityCommentResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(
            String content
    ) {
        this.content = content;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public void setAuthorUsername(
            String authorUsername
    ) {
        this.authorUsername =
                authorUsername;
    }

    public String getAuthorNickname() {
        return authorNickname;
    }

    public void setAuthorNickname(
            String authorNickname
    ) {
        this.authorNickname =
                authorNickname;
    }

    public String getAuthorProfileImageUrl() {
        return authorProfileImageUrl;
    }

    public void setAuthorProfileImageUrl(
            String authorProfileImageUrl
    ) {
        this.authorProfileImageUrl =
                authorProfileImageUrl;
    }

    public boolean isDeletable() {
        return deletable;
    }

    public void setDeletable(
            boolean deletable
    ) {
        this.deletable =
                deletable;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt =
                createdAt;
    }
}