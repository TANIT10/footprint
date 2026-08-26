package com.footprint.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.footprint.backend.dto.NoticeCreateRequest;
import com.footprint.backend.dto.NoticeResponse;
import com.footprint.backend.dto.NoticeUpdateRequest;
import com.footprint.backend.service.NoticeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/notices")
public class AdminNoticeController {

    private static final int MAX_NOTICE_IMAGES = 3;

    private final NoticeService noticeService;

    public AdminNoticeController(
            NoticeService noticeService
    ) {
        this.noticeService =
                noticeService;
    }

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<NoticeResponse> createNotice(
            Authentication authentication,

            @Valid
            @RequestPart("data")
            NoticeCreateRequest request,

            @RequestPart(
                    value = "images",
                    required = false
            )
            List<MultipartFile> images
    ) {
        validateImageCount(images);

        NoticeResponse response =
                noticeService.createNotice(
                        authentication.getName(),
                        request,
                        images
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping(
            value = "/{noticeId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<NoticeResponse> updateNotice(
            @PathVariable Long noticeId,

            @Valid
            @RequestPart("data")
            NoticeUpdateRequest request,

            @RequestPart(
                    value = "existingImageUrls",
                    required = false
            )
            List<String> existingImageUrls,

            @RequestPart(
                    value = "newImages",
                    required = false
            )
            List<MultipartFile> newImages
    ) {
        int existingCount =
                existingImageUrls == null
                        ? 0
                        : existingImageUrls.size();

        int newCount =
                newImages == null
                        ? 0
                        : newImages.size();

        if (
                existingCount + newCount >
                MAX_NOTICE_IMAGES
        ) {
            throw new IllegalArgumentException(
                    "공지 사진은 최대 3장까지 등록할 수 있습니다."
            );
        }

        return ResponseEntity.ok(
                noticeService.updateNotice(
                        noticeId,
                        request,
                        existingImageUrls,
                        newImages
                )
        );
    }

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

    private void validateImageCount(
            List<MultipartFile> images
    ) {
        if (
                images != null &&
                images.size() > MAX_NOTICE_IMAGES
        ) {
            throw new IllegalArgumentException(
                    "공지 사진은 최대 3장까지 등록할 수 있습니다."
            );
        }
    }
}