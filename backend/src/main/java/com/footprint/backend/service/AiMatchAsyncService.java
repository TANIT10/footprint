package com.footprint.backend.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AiMatchAsyncService {

    private final PostMatchService postMatchService;

    public AiMatchAsyncService(
            PostMatchService postMatchService
    ) {
        this.postMatchService =
                postMatchService;
    }

    @Async("aiMatchTaskExecutor")
    public void processNewPost(
            Long postId
    ) {

        try {

            postMatchService.processNewPost(
                    postId
            );

        } catch (Exception exception) {

            System.err.println(
                    "[AI MATCH ASYNC] "
                            + "게시글 AI 매칭 실패"
                            + " / postId="
                            + postId
                            + " / "
                            + exception.getMessage()
            );

            exception.printStackTrace();
        }
    }
}