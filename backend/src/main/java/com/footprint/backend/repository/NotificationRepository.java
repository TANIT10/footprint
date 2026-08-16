package com.footprint.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.Notification;

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
}