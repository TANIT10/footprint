package com.footprint.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.Comment;

public interface CommentRepository
        extends JpaRepository<Comment, Long> {

    List<Comment>
            findByPostIdOrderByCreatedAtAsc(
                    Long postId
            );

    void deleteByPostId(Long postId);
}