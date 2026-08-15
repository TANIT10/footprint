package com.footprint.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.Post;

public interface PostRepository
        extends JpaRepository<Post, Long> {

    Page<Post> findAllByOrderByCreatedAtDesc(
            Pageable pageable
    );

    Page<Post> findByAuthorIdOrderByCreatedAtDesc(
            Long authorId,
            Pageable pageable
    );
}