package com.footprint.backend.dto;

public class UpdateProfileRequest {

    private String nickname;

    public UpdateProfileRequest() {
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(
            String nickname) {

        this.nickname = nickname;
    }
}