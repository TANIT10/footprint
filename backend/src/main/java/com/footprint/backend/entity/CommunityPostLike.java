package com.footprint.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "community_post_likes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name =
                                "uk_community_post_like",
                        columnNames = {
                                "community_post_id",
                                "user_id"
                        }
                )
        }
)
public class CommunityPostLike {

    @Id
    @GeneratedValue(
            strategy =
                    GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "community_post_id",
            nullable = false
    )
    private CommunityPost communityPost;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    public CommunityPostLike() {
    }

    @PrePersist
    public void onCreate() {

        this.createdAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public CommunityPost getCommunityPost() {
        return communityPost;
    }

    public void setCommunityPost(
            CommunityPost communityPost
    ) {
        this.communityPost =
                communityPost;
    }

    public User getUser() {
        return user;
    }

    public void setUser(
            User user
    ) {
        this.user =
                user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}