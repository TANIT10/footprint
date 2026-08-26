package com.footprint.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "notice_images")
public class NoticeImage {

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
            name = "notice_id",
            nullable = false
    )
    private Notice notice;

    @Column(
            name = "image_url",
            nullable = false,
            length = 1000
    )
    private String imageUrl;

    @Column(
            name = "display_order",
            nullable = false
    )
    private int displayOrder;

    public NoticeImage() {
    }

    public Long getId() {
        return id;
    }

    public Notice getNotice() {
        return notice;
    }

    public void setNotice(
            Notice notice
    ) {
        this.notice = notice;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(
            String imageUrl
    ) {
        this.imageUrl = imageUrl;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(
            int displayOrder
    ) {
        this.displayOrder =
                displayOrder;
    }
}