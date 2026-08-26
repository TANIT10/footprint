package com.footprint.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.NoticeImage;

public interface NoticeImageRepository
        extends JpaRepository<NoticeImage, Long> {

    List<NoticeImage>
            findAllByNoticeIdOrderByDisplayOrderAsc(
                    Long noticeId
            );

    void deleteAllByNoticeId(
            Long noticeId
    );
}