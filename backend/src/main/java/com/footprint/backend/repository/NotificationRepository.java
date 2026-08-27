package com.footprint.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.Notification;
import com.footprint.backend.entity.NotificationType;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    Page<Notification>
            findByRecipientUsernameOrderByCreatedAtDesc(
                    String username,
                    Pageable pageable
            );

    Optional<Notification>
            findByIdAndRecipientUsername(
                    Long notificationId,
                    String username
            );

    List<Notification>
            findByRecipientUsernameAndReadFalse(
                    String username
            );

    long countByRecipientUsernameAndReadFalse(
            String username
    );

    boolean existsByRecipientUsernameAndTypeAndPostId(
            String username,
            NotificationType type,
            Long postId
    );

    /*
     * 커뮤니티 좋아요 묶음 알림 조회
     */
    Optional<Notification>
            findByRecipientUsernameAndTypeAndCommunityPostId(
                    String username,
                    NotificationType type,
                    Long communityPostId
            );

    /*
     * 커뮤니티 댓글 묶음 처리용
     *
     * 같은 게시글의 COMMUNITY_COMMENT 알림을
     * 모두 조회할 때 사용합니다.
     */
    List<Notification>
            findAllByRecipientUsernameAndTypeAndCommunityPostIdOrderByCreatedAtAsc(
                    String username,
                    NotificationType type,
                    Long communityPostId
            );

    /*
     * 삭제된 커뮤니티 게시글과 연결된
     * 모든 알림 삭제
     *
     * 게시글 삭제 시
     * COMMUNITY_COMMENT / COMMUNITY_LIKE 등
     * 해당 communityPostId를 가진 알림을
     * 한 번에 정리합니다.
     */
    void deleteByCommunityPostId(
            Long communityPostId
    );

        /*
     * 일반 게시글 삭제 시
     * 해당 게시글을 가리키는 알림 전체 삭제
     *
     * 댓글 알림 / AI 매칭 알림 등
     * postId가 같은 알림을 정리합니다.
     */
    void deleteByPostId(
            Long postId
    );

    /*
     * 생성 후 14일이 지난 알림 자동 삭제용
     */
    void deleteByCreatedAtBefore(
            LocalDateTime cutoff
    );

        /*
     * 회원 탈퇴 전용
     * 해당 사용자가 받은 모든 알림 삭제
     */
    void deleteByRecipientId(
            Long recipientId
    );
}       