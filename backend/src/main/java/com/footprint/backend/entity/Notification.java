package com.footprint.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(
                        name = "idx_notifications_recipient_created",
                        columnList = "recipient_id, created_at"
                ),
                @Index(
                        name = "idx_notifications_recipient_read",
                        columnList = "recipient_id, is_read"
                )
        }
)
public class Notification {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "recipient_id",
            nullable = false
    )
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private NotificationType type;

    @Column(
            nullable = false,
            length = 100
    )
    private String title;

    @Column(
            nullable = false,
            length = 500
    )
    private String message;

    @Column(length = 50)
    private String label;

    /*
     * 기존 찾아요 / 봤어요 게시글 연결용
     */
    @Column(name = "post_id")
    private Long postId;

    /*
     * 커뮤니티 게시글 연결용
     *
     * 기존 postId를 재사용하지 않고
     * 커뮤니티 게시글 ID를 별도로 저장합니다.
     */
    @Column(name = "community_post_id")
    private Long communityPostId;

    /*
     * 공지사항 연결용
     */
    @Column(name = "notice_id")
    private Long noticeId;

    @Column(
            name = "is_read",
            nullable = false
    )
    private boolean read = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    public Notification() {
    }

    @PrePersist
    public void onCreate() {
        this.createdAt =
                LocalDateTime.now();
    }

    public void markAsRead() {

        if (!this.read) {

            this.read = true;

            this.readAt =
                    LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public User getRecipient() {
        return recipient;
    }

    public void setRecipient(
            User recipient
    ) {
        this.recipient =
                recipient;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(
            NotificationType type
    ) {
        this.type =
                type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title
    ) {
        this.title =
                title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(
            String message
    ) {
        this.message =
                message;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(
            String label
    ) {
        this.label =
                label;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(
            Long postId
    ) {
        this.postId =
                postId;
    }

    public Long getCommunityPostId() {
        return communityPostId;
    }

    public void setCommunityPostId(
            Long communityPostId
    ) {
        this.communityPostId =
                communityPostId;
    }

    public Long getNoticeId() {
        return noticeId;
    }

    public void setNoticeId(
            Long noticeId
    ) {
        this.noticeId =
                noticeId;
    }

    public boolean isRead() {
        return read;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}