package com.footprint.backend.config;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "aiMatchTaskExecutor")
    public Executor aiMatchTaskExecutor() {

        ThreadPoolTaskExecutor executor =
                new ThreadPoolTaskExecutor();

        /*
         * AI 서버가 무거운 작업을 하기 때문에
         * 동시에 너무 많은 비교 요청을 보내지 않는다.
         */
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(100);

        executor.setThreadNamePrefix(
                "ai-match-"
        );

        executor.initialize();

        return executor;
    }
}