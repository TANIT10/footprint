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
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "community_reports",

        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_community_reports_reporter_post",
                        columnNames = {
                                "reporter_id",
                                "community_post_id"
                        }
                )
        },

        indexes = {
                @Index(
                        name = "idx_community_reports_status_created",
                        columnList = "status, created_at"
                ),

                @Index(
                        name = "idx_community_reports_reported_user",
                        columnList = "reported_user_id"
                ),

                @Index(
                        name = "idx_community_reports_post",
                        columnList = "community_post_id"
                )
        }
)
public class CommunityReport {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    /*
     * 신고한 사용자
     */
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "reporter_id",
            nullable = false
    )
    private User reporter;

    /*
     * 신고당한 사용자
     *
     * 게시글 작성자를 저장합니다.
     * 나중에 관리자 경고/정지 조치 시 사용합니다.
     */
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "reported_user_id",
            nullable = false
    )
    private User reportedUser;

    /*
     * 신고 대상 커뮤니티 게시글
     */
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "community_post_id",
            nullable = false
    )
    private CommunityPost communityPost;

    /*
     * 신고 사유
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 40
    )
    private CommunityReportReason reason;

    /*
     * 기타 사유 등 추가 설명
     *
     * 없어도 되므로 null 허용
     */
    @Column(
            length = 500
    )
    private String detail;

    /*
     * 신고 처리 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private CommunityReportStatus status =
            CommunityReportStatus.PENDING;

    /*
     * 신고 접수 시간
     */
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    /*
     * 관리자 처리 완료 시간
     *
     * 아직 처리되지 않았으면 null
     */
    @Column(
            name = "reviewed_at"
    )
    private LocalDateTime reviewedAt;

    public CommunityReport() {
    }

    @PrePersist
    public void onCreate() {

        this.createdAt =
                LocalDateTime.now();

        if (this.status == null) {
            this.status =
                    CommunityReportStatus.PENDING;
        }
    }

    public Long getId() {
        return id;
    }

    public User getReporter() {
        return reporter;
    }

    public void setReporter(
            User reporter
    ) {
        this.reporter =
                reporter;
    }

    public User getReportedUser() {
        return reportedUser;
    }

    public void setReportedUser(
            User reportedUser
    ) {
        this.reportedUser =
                reportedUser;
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

    public CommunityReportReason getReason() {
        return reason;
    }

    public void setReason(
            CommunityReportReason reason
    ) {
        this.reason =
                reason;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(
            String detail
    ) {
        this.detail =
                detail;
    }

    public CommunityReportStatus getStatus() {
        return status;
    }

    public void setStatus(
            CommunityReportStatus status
    ) {
        this.status =
                status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(
            LocalDateTime reviewedAt
    ) {
        this.reviewedAt =
                reviewedAt;
    }
}