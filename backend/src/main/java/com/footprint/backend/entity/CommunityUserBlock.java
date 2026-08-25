package com.footprint.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "community_user_blocks",

        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_community_user_blocks_blocker_blocked",
                        columnNames = {
                                "blocker_id",
                                "blocked_user_id"
                        }
                )
        },

        indexes = {
                @Index(
                        name = "idx_community_user_blocks_blocker",
                        columnList = "blocker_id"
                ),

                @Index(
                        name = "idx_community_user_blocks_blocked",
                        columnList = "blocked_user_id"
                )
        }
)
public class CommunityUserBlock {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    /*
     * 차단을 누른 사용자
     *
     * 예:
     * A가 B를 차단
     * → blocker = A
     */
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "blocker_id",
            nullable = false
    )
    private User blocker;

    /*
     * 차단당한 사용자
     *
     * 예:
     * A가 B를 차단
     * → blockedUser = B
     */
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "blocked_user_id",
            nullable = false
    )
    private User blockedUser;

    @jakarta.persistence.Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    public CommunityUserBlock() {
    }

    @PrePersist
    public void onCreate() {
        this.createdAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getBlocker() {
        return blocker;
    }

    public void setBlocker(
            User blocker
    ) {
        this.blocker =
                blocker;
    }

    public User getBlockedUser() {
        return blockedUser;
    }

    public void setBlockedUser(
            User blockedUser
    ) {
        this.blockedUser =
                blockedUser;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}