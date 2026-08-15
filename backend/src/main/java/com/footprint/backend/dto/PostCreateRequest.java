package com.footprint.backend.dto;

import java.time.LocalDate;

import com.footprint.backend.entity.Gender;
import com.footprint.backend.entity.PostType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PostCreateRequest {

    @NotNull(message = "게시글 상태를 선택해 주세요.")
    private PostType postType;

    @NotBlank(message = "품종을 입력해 주세요.")
    @Size(max = 50, message = "품종은 50자 이하로 입력해 주세요.")
    private String breed;

    private Gender gender;

    @Size(max = 30, message = "나이는 30자 이하로 입력해 주세요.")
    private String age;

    @Size(max = 50, message = "색상은 50자 이하로 입력해 주세요.")
    private String color;

    @Size(max = 500, message = "특징은 500자 이하로 입력해 주세요.")
    private String feature;

    @NotBlank(message = "장소를 입력해 주세요.")
    @Size(max = 255, message = "장소는 255자 이하로 입력해 주세요.")
    private String location;

    @NotNull(message = "날짜를 선택해 주세요.")
    private LocalDate date;

    @Size(max = 100, message = "연락처는 100자 이하로 입력해 주세요.")
    private String contact;

    @NotBlank(message = "내용을 입력해 주세요.")
    @Size(max = 3000, message = "내용은 3000자 이하로 입력해 주세요.")
    private String content;

    public PostType getPostType() {
        return postType;
    }

    public void setPostType(PostType postType) {
        this.postType = postType;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getAge() {
        return age;
    }

    public void setAge(String age) {
        this.age = age;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getFeature() {
        return feature;
    }

    public void setFeature(String feature) {
        this.feature = feature;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}