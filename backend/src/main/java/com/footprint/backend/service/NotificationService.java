package com.footprint.backend.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.footprint.backend.dto.NotificationPageResponse;
import com.footprint.backend.dto.NotificationResponse;
import com.footprint.backend.entity.Notification;
import com.footprint.backend.entity.NotificationType;
import com.footprint.backend.entity.User;
import com.footprint.backend.repository.NotificationRepository;

@Service
@Transactional(readOnly = true)
public class NotificationService {

    private static final int NOTIFICATION_PAGE_SIZE = 30;

    private final NotificationRepository
            notificationRepository;

    public NotificationService(
            NotificationRepository
                    notificationRepository
    ) {
        this.notificationRepository =
                notificationRepository;
    }

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
                notificationPage.getContent()
                        .stream()
                        .map(this::toResponse)
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
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "알림을 찾을 수 없습니다."
                                )
                        );

        notification.markAsRead();

        return toResponse(notification);
    }

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
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLabel(label);
        notification.setPostId(postId);
        notification.setNoticeId(noticeId);

        Notification savedNotification =
                notificationRepository.save(notification);

        return toResponse(savedNotification);
    }

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
                notification.getNoticeId(),
                notification.isRead(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}