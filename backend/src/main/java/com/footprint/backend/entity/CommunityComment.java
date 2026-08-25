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

@Entity
@Table(
        name = "community_comments"
)
public class CommunityComment {

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
            name = "author_id",
            nullable = false
    )
    private User author;

    @Column(
            nullable = false,
            length = 1000
    )
    private String content;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    public CommunityComment() {
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

    public User getAuthor() {
        return author;
    }

    public void setAuthor(
            User author
    ) {
        this.author =
                author;
    }

    public String getContent() {
        return content;
    }

    public void setContent(
            String content
    ) {
        this.content =
                content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}