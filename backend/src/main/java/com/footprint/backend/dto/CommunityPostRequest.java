package com.footprint.backend.dto;

public class CommunityPostRequest {

    private String title;

    private String content;

    public CommunityPostRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title) {

        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(
            String content) {

        this.content = content;
    }
}