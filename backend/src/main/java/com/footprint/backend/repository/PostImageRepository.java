package com.footprint.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.PostImage;

public interface PostImageRepository
        extends JpaRepository<PostImage, Long> {

    List<PostImage>
            findByPostIdOrderByDisplayOrderAsc(
                    Long postId
            );

    List<PostImage>
            findByPostIdInOrderByPostIdAscDisplayOrderAsc(
                    List<Long> postIds
            );

    void deleteByPostId(Long postId);
}