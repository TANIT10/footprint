package com.footprint.backend.dto;

import com.footprint.backend.entity.User;
import com.footprint.backend.entity.UserRole;

public class MyProfileResponse {

    private final Long id;
    private final String username;
    private final String nickname;
    private final String profileImageUrl;
    private final UserRole role;

    public MyProfileResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.nickname = user.getNickname();
        this.profileImageUrl = user.getProfileImageUrl();
        this.role = user.getRole();
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getNickname() {
        return nickname;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public UserRole getRole() {
        return role;
    }
}