package com.footprint.backend.dto;

import java.time.LocalDateTime;

import com.footprint.backend.entity.NotificationType;

public record NotificationResponse(

        Long id,

        NotificationType type,

        String title,

        String message,

        String label,

        /*
         * 기존 찾아요 / 봤어요 게시글
         */
        Long postId,

        /*
         * 커뮤니티 게시글
         */
        Long communityPostId,

        /*
         * 공지사항
         */
        Long noticeId,

        boolean isRead,

        LocalDateTime readAt,

        LocalDateTime createdAt

) {

}