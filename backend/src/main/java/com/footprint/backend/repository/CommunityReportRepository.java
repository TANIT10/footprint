package com.footprint.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.footprint.backend.entity.CommunityReport;
import com.footprint.backend.entity.CommunityReportStatus;

public interface CommunityReportRepository
        extends JpaRepository<
                CommunityReport,
                Long
        > {

    /*
     * 같은 사용자가 같은 게시글을
     * 중복 신고했는지 확인
     */
    boolean existsByReporterUsernameAndCommunityPostId(
            String reporterUsername,
            Long communityPostId
    );

    /*
     * 관리자용 신고 목록
     *
     * 처리 상태별로 최신 신고부터 조회
     */
    List<CommunityReport>
            findAllByStatusOrderByCreatedAtDesc(
                    CommunityReportStatus status
            );

    /*
     * 특정 사용자가 신고당한 기록 조회
     *
     * 나중에 경고/정지 판단에 사용
     */
    List<CommunityReport>
            findAllByReportedUserUsernameOrderByCreatedAtDesc(
                    String username
            );

    /*
     * 게시글 삭제 시
     * 해당 글의 신고 기록 정리용
     */
    void deleteByCommunityPostId(
            Long communityPostId
    );

        /*
     * 회원 탈퇴 전용
     * 사용자가 직접 신고한 기록 전체 삭제
     */
    void deleteByReporterId(
            Long reporterId
    );

    /*
     * 회원 탈퇴 전용
     * 사용자가 신고당한 기록 전체 삭제
     */
    void deleteByReportedUserId(
            Long reportedUserId
    );
}