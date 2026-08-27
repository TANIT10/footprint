package com.footprint.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.footprint.backend.entity.CommunityComment;

public interface CommunityCommentRepository
        extends JpaRepository<
                CommunityComment,
                Long
        > {

    /*
     * 기존 댓글 목록 조회
     */
    List<CommunityComment>
    findByCommunityPostIdOrderByCreatedAtAsc(
            Long communityPostId
    );

    /*
     * 댓글 수
     */
    long countByCommunityPostId(
            Long communityPostId
    );

    /*
     * 게시글 삭제 시 댓글 전체 삭제
     */
    void deleteByCommunityPostId(
            Long communityPostId
    );

    /*
     * ==========================================
     * 차단 사용자 댓글 제외 조회
     * ==========================================
     *
     * 현재 사용자가 차단한 사용자의 댓글은
     * DB 조회 단계에서 제외합니다.
     */
    @Query("""
            SELECT cc
            FROM CommunityComment cc
            WHERE cc.communityPost.id = :communityPostId
            AND cc.author.id NOT IN (
                SELECT cub.blockedUser.id
                FROM CommunityUserBlock cub
                WHERE cub.blocker.username = :username
            )
            ORDER BY cc.createdAt ASC
            """)
    List<CommunityComment>
    findVisibleComments(
            @Param("communityPostId")
            Long communityPostId,
            @Param("username")
            String username
    );

        /*
        * 회원 탈퇴 전용
        * 사용자가 작성한 모든 커뮤니티 댓글 삭제
        */
        void deleteByAuthorId(
                Long authorId
    );
}
