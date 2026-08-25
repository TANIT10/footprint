package com.footprint.backend.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CommunityPostResponse {

    private Long id;

    private String title;

    private String content;

    private String authorUsername;

    private String authorNickname;

    private String authorProfileImageUrl;

    private List<String> imageUrls =
            new ArrayList<>();

    /*
     * 좋아요 수
     */
    private long likeCount;

    /*
     * 댓글 수
     */
    private long commentCount;

    /*
     * 현재 로그인한 사용자가
     * 이 글에 좋아요를 눌렀는지 여부
     */
    private boolean likedByMe;

    /*
     * 현재 로그인한 사용자가
     * 이 게시글 작성자인지 여부
     *
     * true일 때만 프론트에서
     * 수정/삭제 메뉴(⋮)를 표시합니다.
     */
    private boolean mine;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public CommunityPostResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title
    ) {
        this.title = title;
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

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(
            List<String> imageUrls
    ) {
        if (imageUrls == null) {
            this.imageUrls =
                    new ArrayList<>();

            return;
        }

        this.imageUrls =
                imageUrls;
    }

    public long getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(
            long likeCount
    ) {
        this.likeCount =
                likeCount;
    }

    public long getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(
            long commentCount
    ) {
        this.commentCount =
                commentCount;
    }

    public boolean isLikedByMe() {
        return likedByMe;
    }

    public void setLikedByMe(
            boolean likedByMe
    ) {
        this.likedByMe =
                likedByMe;
    }

    public boolean isMine() {
        return mine;
    }

    public void setMine(
            boolean mine
    ) {
        this.mine =
                mine;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt =
                updatedAt;
    }
}