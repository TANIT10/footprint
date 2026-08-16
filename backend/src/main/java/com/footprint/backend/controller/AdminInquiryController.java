package com.footprint.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.dto.InquiryConversationPageResponse;
import com.footprint.backend.dto.InquiryMessageCreateRequest;
import com.footprint.backend.dto.InquiryMessageResponse;
import com.footprint.backend.service.InquiryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/inquiries")
public class AdminInquiryController {

    private final InquiryService inquiryService;

    public AdminInquiryController(
            InquiryService inquiryService
    ) {
        this.inquiryService = inquiryService;
    }

    @GetMapping
    public ResponseEntity<InquiryConversationPageResponse>
            getConversations(
                    @RequestParam(defaultValue = "0")
                    int page
            ) {
        return ResponseEntity.ok(
                inquiryService.getAdminConversations(page)
        );
    }

    @GetMapping("/{userId}/messages")
    public ResponseEntity<List<InquiryMessageResponse>>
            getMessages(
                    @PathVariable Long userId
            ) {
        return ResponseEntity.ok(
                inquiryService.getAdminMessages(userId)
        );
    }

    @PostMapping("/{userId}/messages")
    public ResponseEntity<InquiryMessageResponse>
            sendMessage(
                    @PathVariable Long userId,
                    @Valid @RequestBody
                    InquiryMessageCreateRequest request
            ) {
        InquiryMessageResponse response =
                inquiryService.sendAdminMessage(
                        userId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}