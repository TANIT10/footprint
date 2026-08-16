package com.footprint.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.dto.NotificationPageResponse;
import com.footprint.backend.dto.NotificationResponse;
import com.footprint.backend.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService
            notificationService;

    public NotificationController(
            NotificationService
                    notificationService
    ) {
        this.notificationService =
                notificationService;
    }

    @GetMapping
    public ResponseEntity<NotificationPageResponse>
            getNotifications(
                    Authentication authentication,
                    @RequestParam(defaultValue = "0")
                    int page
            ) {
        return ResponseEntity.ok(
                notificationService.getNotifications(
                        authentication.getName(),
                        page
                )
        );
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse>
            readNotification(
                    Authentication authentication,
                    @PathVariable
                    Long notificationId
            ) {
        return ResponseEntity.ok(
                notificationService.readNotification(
                        authentication.getName(),
                        notificationId
                )
        );
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void>
            readAllNotifications(
                    Authentication authentication
            ) {
        notificationService.readAllNotifications(
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}