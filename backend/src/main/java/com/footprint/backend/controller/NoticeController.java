package com.footprint.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.dto.NoticePageResponse;
import com.footprint.backend.dto.NoticeResponse;
import com.footprint.backend.service.NoticeService;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(
            NoticeService noticeService
    ) {
        this.noticeService =
                noticeService;
    }

    @GetMapping
    public ResponseEntity<NoticePageResponse> getNotices(
            @RequestParam(defaultValue = "0") int page
    ) {
        return ResponseEntity.ok(
                noticeService.getNotices(page)
        );
    }

    /*
     * 메인 / 커뮤니티 상단 대표공지 조회
     *
     * 대표공지가 없으면 응답 body가 null입니다.
     */
    @GetMapping("/featured")
    public ResponseEntity<NoticeResponse> getFeaturedNotice() {

        NoticeResponse featuredNotice =
                noticeService.getFeaturedNotice();

        return ResponseEntity.ok(
                featuredNotice
        );
    }

    @GetMapping("/{noticeId}")
    public ResponseEntity<NoticeResponse> getNotice(
            @PathVariable Long noticeId
    ) {
        return ResponseEntity.ok(
                noticeService.getNotice(noticeId)
        );
    }
}