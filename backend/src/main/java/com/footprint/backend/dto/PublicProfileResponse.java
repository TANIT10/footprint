package com.footprint.backend.dto;

import com.footprint.backend.entity.User;

public class PublicProfileResponse {

    private final Long id;
    private final String nickname;
    private final String profileImageUrl;
    private final String introduction;

    public PublicProfileResponse(User user) {
        this.id = user.getId();
        this.nickname = user.getNickname();
        this.profileImageUrl = user.getProfileImageUrl();
        this.introduction = "우리 함께 발자국을 이어가요. 🐾";
    }

    public Long getId() {
        return id;
    }

    public String getNickname() {
        return nickname;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public String getIntroduction() {
        return introduction;
    }
}