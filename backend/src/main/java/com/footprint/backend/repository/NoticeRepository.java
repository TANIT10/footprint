package com.footprint.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.Notice;

public interface NoticeRepository
        extends JpaRepository<Notice, Long> {

    Page<Notice>
            findAllByOrderByImportantDescCreatedAtDesc(
                    Pageable pageable
            );
}