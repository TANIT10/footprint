package com.footprint.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.footprint.backend.entity.Notice;

public interface NoticeRepository
        extends JpaRepository<Notice, Long> {

    Page<Notice>
            findAllByOrderByImportantDescCreatedAtDesc(
                    Pageable pageable
            );

    /*
     * 현재 대표 공지 조회
     */
    Optional<Notice>
            findFirstByFeaturedTrue();

    /*
     * 기존 대표 공지 전체 해제
     *
     * 대표 공지는 항상 최대 1개만
     * 유지하기 위해 사용합니다.
     */
    @Modifying
    @Query("""
            update Notice n
            set n.featured = false
            where n.featured = true
            """)
    void clearFeatured();
}