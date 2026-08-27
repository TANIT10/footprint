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

        /*
        * 회원 탈퇴 전용
        * 사용자가 작성한 일반 게시글 댓글 전체 삭제
        */
        void deleteByAuthorId(
                Long authorId
        );
}