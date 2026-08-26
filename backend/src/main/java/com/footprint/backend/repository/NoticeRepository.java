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

    Optional<Notice>
            findFirstByFeaturedTrue();

    @Modifying
    @Query("""
            update Notice n
            set n.featured = false
            where n.featured = true
            """)
    void clearFeatured();
}