package com.footprint.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.dto.InquiryMessageCreateRequest;
import com.footprint.backend.dto.InquiryMessageResponse;
import com.footprint.backend.service.InquiryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryService inquiryService;

    public InquiryController(
            InquiryService inquiryService
    ) {
        this.inquiryService = inquiryService;
    }

    @PostMapping("/messages")
    public ResponseEntity<InquiryMessageResponse>
            sendMessage(
                    Authentication authentication,
                    @Valid @RequestBody
                    InquiryMessageCreateRequest request
            ) {
        InquiryMessageResponse response =
                inquiryService.sendUserMessage(
                        authentication.getName(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}