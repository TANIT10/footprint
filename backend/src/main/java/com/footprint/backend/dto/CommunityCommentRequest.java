package com.footprint.backend.dto;

public class CommunityCommentRequest {

    private String content;

    public CommunityCommentRequest() {
    }

    public String getContent() {
        return content;
    }

    public void setContent(
            String content
    ) {
        this.content = content;
    }
}