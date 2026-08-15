package com.footprint.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.footprint.backend.entity.Gender;
import com.footprint.backend.entity.PostType;

public class PostListItemResponse {

    private Long id;

    private Long authorId;

    private String authorNickname;

    private String authorProfileImageUrl;

    private PostType postType;

    private String breed;

    private Gender gender;

    private String location;

    private LocalDate date;

    private String representativeImage;

    private LocalDateTime createdAt;

    public PostListItemResponse(
            Long id,
            Long authorId,
            String authorNickname,
            String authorProfileImageUrl,
            PostType postType,
            String breed,
            Gender gender,
            String location,
            LocalDate date,
            String representativeImage,
            LocalDateTime createdAt) {

        this.id = id;
        this.authorId = authorId;
        this.authorNickname = authorNickname;
        this.authorProfileImageUrl =
                authorProfileImageUrl;
        this.postType = postType;
        this.breed = breed;
        this.gender = gender;
        this.location = location;
        this.date = date;
        this.representativeImage =
                representativeImage;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public String getAuthorNickname() {
        return authorNickname;
    }

    public String getAuthorProfileImageUrl() {
        return authorProfileImageUrl;
    }

    public PostType getPostType() {
        return postType;
    }

    public String getBreed() {
        return breed;
    }

    public Gender getGender() {
        return gender;
    }

    public String getLocation() {
        return location;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getRepresentativeImage() {
        return representativeImage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}