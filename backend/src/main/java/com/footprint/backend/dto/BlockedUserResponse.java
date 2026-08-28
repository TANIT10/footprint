package com.footprint.backend.dto;

public class BlockedUserResponse {

    private String username;
    private String nickname;

    public BlockedUserResponse(
            String username,
            String nickname
    ) {
        this.username = username;
        this.nickname = nickname;
    }

    public String getUsername() {
        return username;
    }

    public String getNickname() {
        return nickname;
    }
}