package com.footprint.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.footprint.backend.service.AiMatchService;
import com.footprint.backend.service.PostMatchService;

@RestController
@RequestMapping("/api/ai-match")
public class AiMatchController {

    private final AiMatchService aiMatchService;
    private final PostMatchService postMatchService;

    public AiMatchController(
            AiMatchService aiMatchService,
            PostMatchService postMatchService) {

        this.aiMatchService = aiMatchService;
        this.postMatchService = postMatchService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>>
            checkAiHealth() {

        return ResponseEntity.ok(
                aiMatchService.checkHealth()
        );
    }

    @GetMapping("/posts/{missingPostId}")
    public ResponseEntity<List<Map<String, Object>>>
            findSimilarSightedPosts(
                    @PathVariable
                    Long missingPostId) {

        return ResponseEntity.ok(
                postMatchService
                        .findSimilarSightedPosts(
                                missingPostId
                        )
        );
    }
}