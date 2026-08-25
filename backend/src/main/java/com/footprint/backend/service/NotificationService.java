package com.footprint.backend.service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.footprint.backend.dto.NotificationPageResponse;
import com.footprint.backend.dto.NotificationResponse;
import com.footprint.backend.entity.CommunityComment;
import com.footprint.backend.entity.Notification;
import com.footprint.backend.entity.NotificationType;
import com.footprint.backend.entity.User;
import com.footprint.backend.repository.CommunityCommentRepository;
import com.footprint.backend.repository.CommunityPostLikeRepository;
import com.footprint.backend.repository.NotificationRepository;

@Service
@Transactional(readOnly = true)
public class NotificationService {

    private static final int
            NOTIFICATION_PAGE_SIZE = 30;

    private static final int
            NOTIFICATION_RETENTION_DAYS = 14;

    private final NotificationRepository
            notificationRepository;

    private final CommunityPostLikeRepository
            communityPostLikeRepository;

    private final CommunityCommentRepository
            communityCommentRepository;

    public NotificationService(
            NotificationRepository
                    notificationRepository,
            CommunityPostLikeRepository
                    communityPostLikeRepository,
            CommunityCommentRepository
                    communityCommentRepository
    ) {
        this.notificationRepository =
                notificationRepository;

        this.communityPostLikeRepository =
                communityPostLikeRepository;

        this.communityCommentRepository =
                communityCommentRepository;
    }

    /*
     * ==========================================
     * 알림 목록
     * ==========================================
     */
    public NotificationPageResponse getNotifications(
            String username,
            int page
    ) {

        if (page < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "페이지 번호는 0 이상이어야 합니다."
            );
        }

        Page<Notification> notificationPage =
                notificationRepository
                        .findByRecipientUsernameOrderByCreatedAtDesc(
                                username,
                                PageRequest.of(
                                        page,
                                        NOTIFICATION_PAGE_SIZE
                                )
                        );

        List<NotificationResponse> notifications =
                notificationPage
                        .getContent()
                        .stream()
                        .map(
                                this::toResponse
                        )
                        .toList();

        long unreadCount =
                notificationRepository
                        .countByRecipientUsernameAndReadFalse(
                                username
                        );

        return new NotificationPageResponse(
                notifications,
                unreadCount,
                notificationPage.getNumber(),
                notificationPage.getTotalPages(),
                notificationPage.getTotalElements(),
                notificationPage.isFirst(),
                notificationPage.isLast()
        );
    }

    /*
     * ==========================================
     * 알림 하나 읽음
     * ==========================================
     */
    @Transactional
    public NotificationResponse readNotification(
            String username,
            Long notificationId
    ) {

        Notification notification =
                notificationRepository
                        .findByIdAndRecipientUsername(
                                notificationId,
                                username
                        )
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "알림을 찾을 수 없습니다."
                                        )
                        );

        notification.markAsRead();

        return toResponse(
                notification
        );
    }

    /*
     * ==========================================
     * 알림 전체 읽음
     * ==========================================
     */
    @Transactional
    public void readAllNotifications(
            String username
    ) {

        List<Notification> unreadNotifications =
                notificationRepository
                        .findByRecipientUsernameAndReadFalse(
                                username
                        );

        unreadNotifications.forEach(
                Notification::markAsRead
        );
    }

    /*
     * ==========================================
     * 기존 알림 생성
     * ==========================================
     *
     * 기존 코드와의 호환성을 위해
     * 기존 매개변수 구조를 그대로 유지합니다.
     *
     * 일반 게시글 → postId
     * 공지사항 → noticeId
     */
    @Transactional
    public NotificationResponse createNotification(
            User recipient,
            NotificationType type,
            String title,
            String message,
            String label,
            Long postId,
            Long noticeId
    ) {

        return createNotification(
                recipient,
                type,
                title,
                message,
                label,
                postId,
                null,
                noticeId
        );
    }

    /*
     * ==========================================
     * 통합 알림 생성
     * ==========================================
     *
     * 일반 게시글:
     * postId 사용
     *
     * 커뮤니티:
     * communityPostId 사용
     *
     * 공지:
     * noticeId 사용
     */
    @Transactional
    public NotificationResponse createNotification(
            User recipient,
            NotificationType type,
            String title,
            String message,
            String label,
            Long postId,
            Long communityPostId,
            Long noticeId
    ) {

        if (recipient == null) {
            throw new IllegalArgumentException(
                    "알림 수신자 정보가 필요합니다."
            );
        }

        if (type == null) {
            throw new IllegalArgumentException(
                    "알림 종류가 필요합니다."
            );
        }

        Notification notification =
                new Notification();

        notification.setRecipient(
                recipient
        );

        notification.setType(
                type
        );

        notification.setTitle(
                title
        );

        notification.setMessage(
                message
        );

        notification.setLabel(
                label
        );

        notification.setPostId(
                postId
        );

        notification.setCommunityPostId(
                communityPostId
        );

        notification.setNoticeId(
                noticeId
        );

        Notification savedNotification =
                notificationRepository
                        .save(
                                notification
                        );

        return toResponse(
                savedNotification
        );
    }

    /*
     * ==========================================
     * 기존 AI 매칭 알림
     * ==========================================
     *
     * 기존 기능을 그대로 유지합니다.
     */
    @Transactional
    public void createAiMatchNotificationIfAbsent(
            User recipient,
            Long sightedPostId
    ) {

        boolean alreadyExists =
                notificationRepository
                        .existsByRecipientUsernameAndTypeAndPostId(
                                recipient.getUsername(),
                                NotificationType.AI_MATCH,
                                sightedPostId
                        );

        if (alreadyExists) {
            return;
        }

        createNotification(
                recipient,
                NotificationType.AI_MATCH,
                "🐾 닮은 발자국을 발견했어요",
                "찾고 있는 아이와 매우 비슷한 "
                        + "제보가 등록됐어요. "
                        + "꼭 확인해 주세요.",
                "확인 요망",
                sightedPostId,
                null
        );
    }

    /*
     * ==========================================
     * 커뮤니티 댓글 알림
     * ==========================================
     *
     * 자신의 글에 자신이 댓글을 작성한 경우에는
     * 알림을 생성하지 않습니다.
     *
     * 댓글 알림은 댓글 하나마다 개별 생성합니다.
     */
    @Transactional
    public void createCommunityCommentNotification(
            User recipient,
            User commentAuthor,
            Long communityPostId
    ) {

        if (
                recipient == null ||
                commentAuthor == null ||
                communityPostId == null
        ) {
            return;
        }

        /*
         * 자기 글에 자기가 작성한 댓글은
         * 알림에서 제외합니다.
         */
        if (
                recipient.getId() != null &&
                recipient.getId().equals(
                        commentAuthor.getId()
                )
        ) {
            return;
        }

        /*
         * 같은 커뮤니티 게시글에서는
         * 댓글 알림을 여러 개 쌓지 않고
         * 항상 하나만 유지합니다.
         *
         * 한 사람이 댓글을 여러 개 작성해도
         * 작성자 수는 1명으로 계산합니다.
         */
        List<CommunityComment> comments =
                communityCommentRepository
                        .findByCommunityPostIdOrderByCreatedAtAsc(
                                communityPostId
                        );

        Map<Long, User> uniqueCommentAuthors =
                new LinkedHashMap<>();

        for (
                CommunityComment comment
                        : comments
        ) {

            User author =
                    comment.getAuthor();

            if (
                    author == null ||
                    author.getId() == null
            ) {
                continue;
            }

            /*
             * 게시글 작성자 자신의 댓글은
             * 묶음 알림 숫자에서도 제외합니다.
             */
            if (
                    recipient.getId() != null &&
                    recipient.getId().equals(
                            author.getId()
                    )
            ) {
                continue;
            }

            uniqueCommentAuthors
                    .putIfAbsent(
                            author.getId(),
                            author
                    );
        }

        int uniqueAuthorCount =
                uniqueCommentAuthors.size();

        if (uniqueAuthorCount <= 0) {
            return;
        }

        /*
         * 같은 게시글의 기존 커뮤니티 댓글 알림을
         * 모두 정리한 뒤 최신 묶음 알림 하나만 만듭니다.
         *
         * 이렇게 하면 같은 사람이 댓글을 5개 달아도
         * 알림은 1개만 남습니다.
         */
        List<Notification>
                existingCommentNotifications =
                notificationRepository
                        .findAllByRecipientUsernameAndTypeAndCommunityPostIdOrderByCreatedAtAsc(
                                recipient.getUsername(),
                                NotificationType.COMMUNITY_COMMENT,
                                communityPostId
                        );

        if (
                !existingCommentNotifications
                        .isEmpty()
        ) {
            notificationRepository
                    .deleteAll(
                            existingCommentNotifications
                    );

            notificationRepository
                    .flush();
        }

        User firstAuthor =
                uniqueCommentAuthors
                        .values()
                        .iterator()
                        .next();

        String firstAuthorName =
                getDisplayName(
                        firstAuthor
                );

        String message;

        if (uniqueAuthorCount == 1) {

            message =
                    firstAuthorName
                            + "님이 회원님의 커뮤니티 글에 댓글을 남겼어요.";

        } else {

            message =
                    firstAuthorName
                            + "님 외 "
                            + (
                                    uniqueAuthorCount -
                                    1
                            )
                            + "명이 회원님의 커뮤니티 글에 댓글을 남겼어요.";
        }

        createNotification(
                recipient,
                NotificationType.COMMUNITY_COMMENT,
                "💬 새 댓글이 달렸어요",
                message,
                "커뮤니티",
                null,
                communityPostId,
                null
        );
    }

    /*
     * ==========================================
     * 커뮤니티 좋아요 알림 동기화
     * ==========================================
     *
     * 좋아요는 한 사람마다 새 알림을 계속 만들지 않고
     * 같은 커뮤니티 게시글당 알림 하나만 유지합니다.
     *
     * 예)
     * 1명:
     * "tester님이 회원님의 글을 좋아해요."
     *
     * 3명:
     * "tester님 외 2명이 회원님의 글을 좋아해요."
     *
     * 게시글 작성자가 자기 글에 누른 좋아요는
     * 알림 숫자에서 제외합니다.
     *
     * likedNow:
     * true  → actor가 방금 좋아요를 누름
     * false → actor가 방금 좋아요를 취소함
     */
    @Transactional
    public void syncCommunityLikeNotification(
            User recipient,
            User actor,
            Long communityPostId,
            boolean likedNow
    ) {

        if (
                recipient == null ||
                actor == null ||
                communityPostId == null
        ) {
            return;
        }

        /*
         * 자기 글에 자기가 누른 좋아요는
         * 커뮤니티 알림에 영향을 주지 않습니다.
         */
        if (
                recipient.getId() != null &&
                recipient.getId().equals(
                        actor.getId()
                )
        ) {
            return;
        }

        Optional<Notification>
                savedNotification =
                notificationRepository
                        .findByRecipientUsernameAndTypeAndCommunityPostId(
                                recipient.getUsername(),
                                NotificationType.COMMUNITY_LIKE,
                                communityPostId
                        );

        long totalLikeCount =
                communityPostLikeRepository
                        .countByCommunityPostId(
                                communityPostId
                        );

        /*
         * 작성자가 자기 글에 좋아요를 눌렀다면
         * 알림에 표시되는 숫자에서는 1을 제외합니다.
         */
        boolean authorLikedOwnPost =
                recipient.getId() != null &&
                communityPostLikeRepository
                        .existsByCommunityPostIdAndUserId(
                                communityPostId,
                                recipient.getId()
                        );

        long notificationLikeCount =
                totalLikeCount -
                (
                        authorLikedOwnPost
                                ? 1L
                                : 0L
                );

        /*
         * 다른 사용자의 좋아요가 하나도 남지 않은 경우
         * 기존 묶음 좋아요 알림도 제거합니다.
         */
        if (
                notificationLikeCount <= 0
        ) {

            savedNotification.ifPresent(
                    notificationRepository
                            ::delete
            );

            return;
        }

        String actorName =
                getDisplayName(
                        actor
                );

        String message;

        if (notificationLikeCount == 1) {

            /*
             * 좋아요 취소 후 한 명만 남았는데
             * 지금 actor가 취소한 사람이라면
             * 남은 사람 이름을 알 수 없으므로
             * 일반 문구를 사용합니다.
             */
            if (likedNow) {
                message =
                        actorName
                                + "님이 회원님의 커뮤니티 글을 좋아해요.";
            } else {
                message =
                        "1명이 회원님의 커뮤니티 글을 좋아해요.";
            }

        } else {

            if (likedNow) {
                message =
                        actorName
                                + "님 외 "
                                + (
                                        notificationLikeCount -
                                        1
                                )
                                + "명이 회원님의 커뮤니티 글을 좋아해요.";
            } else {
                message =
                        notificationLikeCount
                                + "명이 회원님의 커뮤니티 글을 좋아해요.";
            }
        }

        /*
         * 기존 묶음 알림이 아직 없는 경우
         * 새 알림을 생성합니다.
         */
        if (
                savedNotification.isEmpty()
        ) {

            createNotification(
                    recipient,
                    NotificationType.COMMUNITY_LIKE,
                    "❤️ 커뮤니티 글에 좋아요가 생겼어요",
                    message,
                    "커뮤니티",
                    null,
                    communityPostId,
                    null
            );

            return;
        }

        Notification notification =
                savedNotification.get();

        /*
         * 이미 읽은 좋아요 알림에 새 좋아요가 추가된 경우:
         *
         * 이전 알림을 제거하고 새 알림으로 다시 만들어
         * 새 좋아요가 읽지 않은 알림으로 표시되게 합니다.
         */
        if (
                likedNow &&
                notification.isRead()
        ) {

            notificationRepository
                    .delete(
                            notification
                    );

            notificationRepository
                    .flush();

            createNotification(
                    recipient,
                    NotificationType.COMMUNITY_LIKE,
                    "❤️ 커뮤니티 글에 좋아요가 생겼어요",
                    message,
                    "커뮤니티",
                    null,
                    communityPostId,
                    null
            );

            return;
        }

        /*
         * 아직 읽지 않은 기존 묶음 알림은
         * 새 알림을 추가하지 않고 내용만 갱신합니다.
         */
        notification.setTitle(
                "❤️ 커뮤니티 글에 좋아요가 생겼어요"
        );

        notification.setMessage(
                message
        );

        notification.setLabel(
                "커뮤니티"
        );

        notificationRepository
                .save(
                        notification
                );
    }

    /*
     * ==========================================
     * 관리자 경고 알림
     * ==========================================
     */
    @Transactional
    public void createCommunityWarningNotification(
            User recipient,
            int warningCount
    ) {

        if (recipient == null) {
            return;
        }

        createNotification(
                recipient,
                NotificationType.SYSTEM,
                "⚠️ 커뮤니티 이용 경고",
                "운영 정책 위반으로 경고 "
                        + warningCount
                        + "회가 적용되었어요.",
                "경고",
                null,
                null
        );
    }

    /*
     * ==========================================
     * 관리자 기간 정지 알림
     * ==========================================
     */
    @Transactional
    public void createCommunitySuspensionNotification(
            User recipient,
            int days,
            LocalDateTime suspendedUntil
    ) {

        if (
                recipient == null ||
                suspendedUntil == null
        ) {
            return;
        }

        createNotification(
                recipient,
                NotificationType.SYSTEM,
                "⚠️ 커뮤니티 이용 제한",
                "게시글과 댓글 작성이 "
                        + days
                        + "일간 제한돼요.",
                "이용 제한",
                null,
                null
        );
    }

    /*
     * ==========================================
     * 관리자 조기 정지 해제 알림
     * ==========================================
     */
    @Transactional
    public void createCommunitySuspensionClearedNotification(
            User recipient
    ) {

        if (recipient == null) {
            return;
        }

        createNotification(
                recipient,
                NotificationType.SYSTEM,
                "커뮤니티 이용 제한 해제",
                "게시글과 댓글을 다시 작성할 수 있어요.",
                "제한 해제",
                null,
                null
        );
    }

    /*
     * ==========================================
     * 삭제된 커뮤니티 게시글 관련 알림 정리
     * ==========================================
     *
     * 커뮤니티 게시글이 삭제될 때
     * 해당 글을 가리키는 댓글/좋아요 알림 등을
     * 함께 삭제합니다.
     */
    @Transactional
    public void deleteCommunityPostNotifications(
            Long communityPostId
    ) {

        if (communityPostId == null) {
            return;
        }

        notificationRepository
                .deleteByCommunityPostId(
                        communityPostId
                );
    }

    /*
     * ==========================================
     * 14일 지난 알림 자동 삭제
     * ==========================================
     *
     * 매일 새벽 4시에 실행합니다.
     * 생성 후 14일이 지난 알림은
     * 읽음 여부와 관계없이 삭제합니다.
     */
    @Scheduled(
            cron = "0 0 4 * * *"
    )
    @Transactional
    public void deleteExpiredNotifications() {

        LocalDateTime cutoff =
                LocalDateTime
                        .now()
                        .minusDays(
                                NOTIFICATION_RETENTION_DAYS
                        );

        notificationRepository
                .deleteByCreatedAtBefore(
                        cutoff
                );
    }

    /*
     * ==========================================
     * 사용자 표시 이름
     * ==========================================
     */
    private String getDisplayName(
            User user
    ) {

        if (
                user.getNickname() != null &&
                !user.getNickname().isBlank()
        ) {
            return user.getNickname();
        }

        if (
                user.getUsername() != null &&
                !user.getUsername().isBlank()
        ) {
            return user.getUsername();
        }

        return "사용자";
    }

    /*
     * ==========================================
     * Entity → Response
     * ==========================================
     */
    private NotificationResponse toResponse(
            Notification notification
    ) {

        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getLabel(),
                notification.getPostId(),
                notification.getCommunityPostId(),
                notification.getNoticeId(),
                notification.isRead(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}

