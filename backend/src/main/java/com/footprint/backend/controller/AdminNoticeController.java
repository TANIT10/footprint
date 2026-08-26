package com.footprint.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.dto.NoticeCreateRequest;
import com.footprint.backend.dto.NoticeResponse;
import com.footprint.backend.dto.NoticeUpdateRequest;
import com.footprint.backend.service.NoticeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/notices")
public class AdminNoticeController {

    private final NoticeService noticeService;

    public AdminNoticeController(
            NoticeService noticeService
    ) {
        this.noticeService =
                noticeService;
    }

    @PostMapping
    public ResponseEntity<NoticeResponse> createNotice(
            Authentication authentication,
            @Valid @RequestBody NoticeCreateRequest request
    ) {
        NoticeResponse response =
                noticeService.createNotice(
                        authentication.getName(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{noticeId}")
    public ResponseEntity<NoticeResponse> updateNotice(
            @PathVariable Long noticeId,
            @Valid @RequestBody NoticeUpdateRequest request
    ) {
        return ResponseEntity.ok(
                noticeService.updateNotice(
                        noticeId,
                        request
                )
        );
    }

    /*
     * 선택한 공지를 대표공지로 설정
     *
     * 기존 대표공지는 자동으로 해제됩니다.
     */
    @PutMapping("/{noticeId}/featured")
    public ResponseEntity<NoticeResponse> setFeaturedNotice(
            @PathVariable Long noticeId
    ) {
        return ResponseEntity.ok(
                noticeService.setFeaturedNotice(
                        noticeId
                )
        );
    }

    /*
     * 현재 대표공지 해제
     */
    @DeleteMapping("/featured")
    public ResponseEntity<Void> clearFeaturedNotice() {

        noticeService.clearFeaturedNotice();

        return ResponseEntity
                .noContent()
                .build();
    }

    @DeleteMapping("/{noticeId}")
    public ResponseEntity<Void> deleteNotice(
            @PathVariable Long noticeId
    ) {
        noticeService.deleteNotice(
                noticeId
        );

        return ResponseEntity
                .noContent()
                .build();
    }
}