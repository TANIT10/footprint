package com.footprint.backend.service;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
public class AiMatchService {

    private final RestClient restClient;

    public AiMatchService(
            @Value("${ai.match.base-url}")
            String aiMatchBaseUrl) {

        this.restClient =
                RestClient.builder()
                .baseUrl(aiMatchBaseUrl)
                .build();
    }

    public Map<String, Object> checkHealth() {

        return restClient.get()
                .uri("/health")
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> comparePosts(
            List<Path> missingImagePaths,
            List<Path> sightedImagePaths) {

        if (missingImagePaths == null
                || missingImagePaths.isEmpty()) {

            throw new IllegalArgumentException(
                    "찾아요 게시글 사진이 필요합니다."
            );
        }

        if (sightedImagePaths == null
                || sightedImagePaths.isEmpty()) {

            throw new IllegalArgumentException(
                    "봤어요 게시글 사진이 필요합니다."
            );
        }

        MultiValueMap<String, Object> body =
                new LinkedMultiValueMap<>();

        for (Path imagePath
                : missingImagePaths) {

            body.add(
                    "missing_images",
                    new FileSystemResource(
                            imagePath
                    )
            );
        }

        for (Path imagePath
                : sightedImagePaths) {

            body.add(
                    "sighted_images",
                    new FileSystemResource(
                            imagePath
                    )
            );
        }

        Map<String, Object> response =
                restClient.post()
                .uri("/compare-posts")
                .contentType(
                        MediaType.MULTIPART_FORM_DATA
                )
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new IllegalStateException(
                    "AI 서버에서 매칭 결과를 "
                    + "받지 못했습니다."
            );
        }

        return response;
    }
}