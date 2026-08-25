package com.footprint.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            nullable = false,
            unique = true,
            length = 10
    )
    private String username;

    @Column(
            nullable = false
    )
    private String password;

    @Column(
            unique = true,
            length = 10
    )
    private String nickname;

    /*
     * 기존 회원 데이터와의 호환성을 위해
     * null을 허용합니다.
     *
     * 값이 없는 기존 회원은
     * getRole()에서 USER로 처리합니다.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            length = 20
    )
    private UserRole role =
            UserRole.USER;

    /*
     * 프로필 이미지 주소
     */
    @Column(
            length = 1000
    )
    private String profileImageUrl;

    /*
     * ==========================================
     * 커뮤니티 경고 누적 횟수
     * ==========================================
     *
     * 기존 회원 데이터와의 호환성을 위해
     * DB 기본값이 없어도 getter에서 0으로 처리합니다.
     */
    @Column(
            name = "community_warning_count"
    )
    private Integer communityWarningCount =
            0;

    /*
     * ==========================================
     * 커뮤니티 이용 정지 종료 시각
     * ==========================================
     *
     * null:
     * 정지 상태 아님
     *
     * 현재 시간보다 미래:
     * 정지 상태
     *
     * 현재 시간보다 과거:
     * 정지 기간 종료
     */
    @Column(
            name = "community_suspended_until"
    )
    private LocalDateTime
            communitySuspendedUntil;

    public User() {
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(
            String username
    ) {
        this.username =
                username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(
            String password
    ) {
        this.password =
                password;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(
            String nickname
    ) {
        this.nickname =
                nickname;
    }

    public UserRole getRole() {

        if (role == null) {
            return UserRole.USER;
        }

        return role;
    }

    public void setRole(
            UserRole role
    ) {
        this.role = role;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(
            String profileImageUrl
    ) {
        this.profileImageUrl =
                profileImageUrl;
    }

    public int getCommunityWarningCount() {

        if (
                communityWarningCount ==
                null
        ) {
            return 0;
        }

        return communityWarningCount;
    }

    public void setCommunityWarningCount(
            Integer communityWarningCount
    ) {

        if (
                communityWarningCount ==
                null
        ) {
            this.communityWarningCount =
                    0;

            return;
        }

        this.communityWarningCount =
                Math.max(
                        0,
                        communityWarningCount
                );
    }

    public void addCommunityWarning() {

        this.communityWarningCount =
                getCommunityWarningCount()
                        + 1;
    }

    public LocalDateTime
    getCommunitySuspendedUntil() {

        return communitySuspendedUntil;
    }

    public void setCommunitySuspendedUntil(
            LocalDateTime
                    communitySuspendedUntil
    ) {
        this.communitySuspendedUntil =
                communitySuspendedUntil;
    }

    /*
     * ==========================================
     * 현재 커뮤니티 정지 상태인지 확인
     * ==========================================
     */
    public boolean isCommunitySuspended() {

        if (
                communitySuspendedUntil ==
                null
        ) {
            return false;
        }

        return communitySuspendedUntil
                .isAfter(
                        LocalDateTime.now()
                );
    }

    /*
     * ==========================================
     * 커뮤니티 정지 해제
     * ==========================================
     */
    public void clearCommunitySuspension() {

        this.communitySuspendedUntil =
                null;
    }
}