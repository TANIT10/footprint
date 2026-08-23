package com.footprint.backend.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.footprint.backend.entity.AiMatchCandidateStatus;
import com.footprint.backend.repository.AiMatchCandidateStatusRepository;

@Service
@Transactional(readOnly = true)
public class AiMatchCandidateStatusService {

    private final AiMatchCandidateStatusRepository
            aiMatchCandidateStatusRepository;

    public AiMatchCandidateStatusService(
            AiMatchCandidateStatusRepository
                    aiMatchCandidateStatusRepository
    ) {
        this.aiMatchCandidateStatusRepository =
                aiMatchCandidateStatusRepository;
    }

    /*
     * 마이페이지용
     *
     * 사용자에게 NEW 후보가
     * 하나라도 있는지 확인
     */
    public Map<String, Object> getNewSummary(
            String username
    ) {

        boolean hasNew =
                aiMatchCandidateStatusRepository
                        .existsByUsernameAndNewCandidateTrue(
                                username
                        );

        List<AiMatchCandidateStatus> newCandidates =
                aiMatchCandidateStatusRepository
                        .findByUsernameAndNewCandidateTrue(
                                username
                        );

        Map<Long, Long> newCountByMissingPost =
                new LinkedHashMap<>();

        for (
                AiMatchCandidateStatus status
                : newCandidates
        ) {
            newCountByMissingPost.merge(
                    status.getMissingPostId(),
                    1L,
                    Long::sum
            );
        }

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "hasNew",
                hasNew
        );

        response.put(
                "totalNewCount",
                newCandidates.size()
        );

        response.put(
                "newCountByMissingPost",
                newCountByMissingPost
        );

        return response;
    }

    /*
     * 특정 찾아요 글에
     * NEW 후보가 있는지 확인
     */
    public Map<String, Object> getNewStatusForMissingPost(
            String username,
            Long missingPostId
    ) {

        boolean hasNew =
                aiMatchCandidateStatusRepository
                        .existsByUsernameAndMissingPostIdAndNewCandidateTrue(
                                username,
                                missingPostId
                        );

        List<AiMatchCandidateStatus> statuses =
                aiMatchCandidateStatusRepository
                        .findByUsernameAndMissingPostIdOrderByFirstDetectedAtDesc(
                                username,
                                missingPostId
                        );

        long newCount =
                statuses.stream()
                        .filter(
                                AiMatchCandidateStatus
                                        ::isNewCandidate
                        )
                        .count();

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "missingPostId",
                missingPostId
        );

        response.put(
                "hasNew",
                hasNew
        );

        response.put(
                "newCount",
                newCount
        );

        return response;
    }

    /*
     * 특정 찾아요 글의 NEW 후보를
     * 모두 확인 처리
     */
    @Transactional
    public void markMissingPostCandidatesAsChecked(
            String username,
            Long missingPostId
    ) {

        List<AiMatchCandidateStatus> statuses =
                aiMatchCandidateStatusRepository
                        .findByUsernameAndMissingPostIdOrderByFirstDetectedAtDesc(
                                username,
                                missingPostId
                        );

        statuses.stream()
                .filter(
                        AiMatchCandidateStatus
                                ::isNewCandidate
                )
                .forEach(
                        AiMatchCandidateStatus
                                ::markAsChecked
                );
    }

    /*
     * 특정 후보 하나만 확인 처리
     *
     * 나중에 카드 단위 NEW 표시까지
     * 확장할 때 사용 가능
     */
    @Transactional
    public void markCandidateAsChecked(
            String username,
            Long missingPostId,
            Long sightedPostId
    ) {

        AiMatchCandidateStatus status =
                aiMatchCandidateStatusRepository
                        .findByUsernameAndMissingPostIdAndSightedPostId(
                                username,
                                missingPostId,
                                sightedPostId
                        )
                        .orElse(null);

        if (status == null) {
            return;
        }

        status.markAsChecked();
    }
}