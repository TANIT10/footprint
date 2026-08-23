package com.footprint.backend.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "ai_match_candidate_status",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_ai_match_candidate",
                        columnNames = {
                                "username",
                                "missing_post_id",
                                "sighted_post_id"
                        }
                )
        }
)
public class AiMatchCandidateStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * 찾아요 게시글 작성자
     */
    @Column(
            name = "username",
            nullable = false,
            length = 100
    )
    private String username;

    /*
     * 기준이 된 찾아요 게시글 ID
     */
    @Column(
            name = "missing_post_id",
            nullable = false
    )
    private Long missingPostId;

    /*
     * AI가 찾아낸 봤어요 게시글 ID
     */
    @Column(
            name = "sighted_post_id",
            nullable = false
    )
    private Long sightedPostId;

    /*
     * AI 내부 유사도 점수
     *
     * 사용자 화면에는 표시하지 않고
     * 60 / 70 기준 판정에만 사용
     */
    @Column(
            name = "combined_score",
            nullable = false
    )
    private Double combinedScore;

    /*
     * 사용자가 아직 확인하지 않은
     * 새로운 후보인지 여부
     */
    @Column(
            name = "is_new",
            nullable = false
    )
    private boolean newCandidate = true;

    /*
     * 처음 후보로 발견된 시간
     */
    @Column(
            name = "first_detected_at",
            nullable = false
    )
    private Instant firstDetectedAt;

    /*
     * 마지막으로 AI 비교에서
     * 후보로 확인된 시간
     */
    @Column(
            name = "last_detected_at",
            nullable = false
    )
    private Instant lastDetectedAt;

    /*
     * 사용자가 확인한 시간
     */
    @Column(
            name = "checked_at"
    )
    private Instant checkedAt;

    @PrePersist
    protected void onCreate() {

        Instant now = Instant.now();

        if (firstDetectedAt == null) {
            firstDetectedAt = now;
        }

        if (lastDetectedAt == null) {
            lastDetectedAt = now;
        }
    }

    public void updateMatch(
            Double combinedScore
    ) {
        this.combinedScore =
                combinedScore;

        this.lastDetectedAt =
                Instant.now();
    }

    public void markAsNew() {
        this.newCandidate = true;
        this.checkedAt = null;
    }

    public void markAsChecked() {
        this.newCandidate = false;
        this.checkedAt =
                Instant.now();
    }

    public Long getId() {
        return id;
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

    public Long getMissingPostId() {
        return missingPostId;
    }

    public void setMissingPostId(
            Long missingPostId
    ) {
        this.missingPostId =
                missingPostId;
    }

    public Long getSightedPostId() {
        return sightedPostId;
    }

    public void setSightedPostId(
            Long sightedPostId
    ) {
        this.sightedPostId =
                sightedPostId;
    }

    public Double getCombinedScore() {
        return combinedScore;
    }

    public void setCombinedScore(
            Double combinedScore
    ) {
        this.combinedScore =
                combinedScore;
    }

    public boolean isNewCandidate() {
        return newCandidate;
    }

    public void setNewCandidate(
            boolean newCandidate
    ) {
        this.newCandidate =
                newCandidate;
    }

    public Instant getFirstDetectedAt() {
        return firstDetectedAt;
    }

    public void setFirstDetectedAt(
            Instant firstDetectedAt
    ) {
        this.firstDetectedAt =
                firstDetectedAt;
    }

    public Instant getLastDetectedAt() {
        return lastDetectedAt;
    }

    public void setLastDetectedAt(
            Instant lastDetectedAt
    ) {
        this.lastDetectedAt =
                lastDetectedAt;
    }

    public Instant getCheckedAt() {
        return checkedAt;
    }

    public void setCheckedAt(
            Instant checkedAt
    ) {
        this.checkedAt =
                checkedAt;
    }
}
