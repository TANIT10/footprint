package com.footprint.backend.dto;

public class LoginResponse {

    private Long id;
    private String username;
    private String nickname;
    private String message;
    private String token;

    public LoginResponse(
            Long id,
            String username,
            String nickname,
            String message,
            String token) {

        this.id = id;
        this.username = username;
        this.nickname = nickname;
        this.message = message;
        this.token = token;
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

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }
}