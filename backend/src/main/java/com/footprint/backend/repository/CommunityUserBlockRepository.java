package com.footprint.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.CommunityUserBlock;

public interface CommunityUserBlockRepository
        extends JpaRepository<
                CommunityUserBlock,
                Long
        > {

    /*
     * 특정 사용자가 다른 사용자를
     * 이미 차단했는지 확인
     */
    boolean existsByBlockerUsernameAndBlockedUserUsername(
            String blockerUsername,
            String blockedUsername
    );

    /*
     * 차단 해제할 때
     * 해당 차단 기록 조회
     */
    Optional<CommunityUserBlock>
            findByBlockerUsernameAndBlockedUserUsername(
                    String blockerUsername,
                    String blockedUsername
            );

    /*
     * 내가 차단한 사용자 전체 조회
     */
    List<CommunityUserBlock>
            findAllByBlockerUsernameOrderByCreatedAtDesc(
                    String blockerUsername
            );
}