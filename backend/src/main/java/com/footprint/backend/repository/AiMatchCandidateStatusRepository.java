package com.footprint.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.AiMatchCandidateStatus;

public interface AiMatchCandidateStatusRepository
        extends JpaRepository<AiMatchCandidateStatus, Long> {

    Optional<AiMatchCandidateStatus>
            findByUsernameAndMissingPostIdAndSightedPostId(
                    String username,
                    Long missingPostId,
                    Long sightedPostId
            );

    List<AiMatchCandidateStatus>
            findByUsernameAndMissingPostIdOrderByFirstDetectedAtDesc(
                    String username,
                    Long missingPostId
            );

    List<AiMatchCandidateStatus>
            findByUsernameAndNewCandidateTrue(
                    String username
            );

    boolean existsByUsernameAndNewCandidateTrue(
            String username
    );

    boolean existsByUsernameAndMissingPostIdAndNewCandidateTrue(
            String username,
            Long missingPostId
    );

        /*
     * 회원 탈퇴 전용
     * 해당 사용자의 AI 매칭 후보 상태 전체 삭제
     */
    void deleteByUsername(
            String username
    );
}