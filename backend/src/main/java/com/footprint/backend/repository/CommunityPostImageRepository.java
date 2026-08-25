package com.footprint.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.CommunityPostImage;

public interface CommunityPostImageRepository
        extends JpaRepository<
                CommunityPostImage,
                Long
        > {

    List<CommunityPostImage>
    findByCommunityPostIdOrderByDisplayOrderAsc(
            Long communityPostId
    );

    void deleteByCommunityPostId(
            Long communityPostId
    );
}