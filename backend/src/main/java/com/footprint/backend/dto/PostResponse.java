package com.footprint.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.footprint.backend.entity.Gender;
import com.footprint.backend.entity.PostType;

public class PostResponse {

    private Long id;

    private Long authorId;

    private String authorNickname;

    private String authorProfileImageUrl;

    private PostType postType;

    private String breed;

    private Gender gender;

    private String age;

    private String color;

    private String feature;

    private String location;

    private LocalDate date;

    private String contact;

    private String content;

    private String representativeImage;

    private List<String> images;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public PostResponse(
            Long id,
            Long authorId,
            String authorNickname,
            String authorProfileImageUrl,
            PostType postType,
            String breed,
            Gender gender,
            String age,
            String color,
            String feature,
            String location,
            LocalDate date,
            String contact,
            String content,
            String representativeImage,
            List<String> images,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.authorId = authorId;
        this.authorNickname = authorNickname;
        this.authorProfileImageUrl = authorProfileImageUrl;
        this.postType = postType;
        this.breed = breed;
        this.gender = gender;
        this.age = age;
        this.color = color;
        this.feature = feature;
        this.location = location;
        this.date = date;
        this.contact = contact;
        this.content = content;
        this.representativeImage = representativeImage;
        this.images = images;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getAge() {
        return age;
    }

    public String getColor() {
        return color;
    }

    public String getFeature() {
        return feature;
    }

    public String getLocation() {
        return location;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getContact() {
        return contact;
    }

    public String getContent() {
        return content;
    }

    public String getRepresentativeImage() {
        return representativeImage;
    }

    public List<String> getImages() {
        return images;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}