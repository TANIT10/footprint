package com.footprint.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.footprint.backend.entity.CommunityPost;

public interface CommunityPostRepository
        extends JpaRepository<
                CommunityPost,
                Long
        > {

    /*
     * 기존 전체 목록 조회
     */
    Page<CommunityPost>
    findAllByOrderByCreatedAtDesc(
            Pageable pageable
    );

    /*
     * 기존 검색 조회
     */
    Page<CommunityPost>
    findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseOrderByCreatedAtDesc(
            String titleKeyword,
            String contentKeyword,
            Pageable pageable
    );

    /*
     * 내가 작성한 커뮤니티 글 조회
     */
    Page<CommunityPost>
    findByAuthorUsernameOrderByCreatedAtDesc(
            String username,
            Pageable pageable
    );

    /*
     * ==========================================
     * 차단 사용자 제외 커뮤니티 목록
     * ==========================================
     *
     * 현재 사용자가 차단한 사용자의 글은
     * DB 조회 단계에서 제외합니다.
     */
    @Query("""
            SELECT cp
            FROM CommunityPost cp
            WHERE cp.author.id NOT IN (
                SELECT cub.blockedUser.id
                FROM CommunityUserBlock cub
                WHERE cub.blocker.username = :username
            )
            ORDER BY cp.createdAt DESC
            """)
    Page<CommunityPost>
    findVisiblePosts(
            @Param("username")
            String username,
            Pageable pageable
    );

    /*
     * ==========================================
     * 차단 사용자 제외 검색
     * ==========================================
     */
    @Query("""
            SELECT cp
            FROM CommunityPost cp
            WHERE cp.author.id NOT IN (
                SELECT cub.blockedUser.id
                FROM CommunityUserBlock cub
                WHERE cub.blocker.username = :username
            )
            AND (
                LOWER(cp.title) LIKE LOWER(
                    CONCAT('%', :keyword, '%')
                )
                OR
                LOWER(cp.content) LIKE LOWER(
                    CONCAT('%', :keyword, '%')
                )
            )
            ORDER BY cp.createdAt DESC
            """)
    Page<CommunityPost>
    findVisiblePostsByKeyword(
            @Param("username")
            String username,
            @Param("keyword")
            String keyword,
            Pageable pageable
    );
}
