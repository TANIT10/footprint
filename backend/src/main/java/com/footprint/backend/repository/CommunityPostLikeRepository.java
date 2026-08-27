package com.footprint.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.CommunityPostLike;

public interface CommunityPostLikeRepository
        extends JpaRepository<
                CommunityPostLike,
                Long
        > {

    long countByCommunityPostId(
            Long communityPostId
    );

    boolean existsByCommunityPostIdAndUserId(
            Long communityPostId,
            Long userId
    );

    Optional<CommunityPostLike>
    findByCommunityPostIdAndUserId(
            Long communityPostId,
            Long userId
    );

    void deleteByCommunityPostId(
            Long communityPostId
    );

    void deleteByUserId(
            Long userId
    );
}