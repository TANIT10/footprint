package com.footprint.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.footprint.backend.dto.BlockedUserResponse;
import com.footprint.backend.entity.CommunityUserBlock;
import com.footprint.backend.entity.User;
import com.footprint.backend.repository.CommunityUserBlockRepository;
import com.footprint.backend.repository.UserRepository;

@Service
@Transactional
public class CommunityUserBlockService {

    private final CommunityUserBlockRepository
            communityUserBlockRepository;

    private final UserRepository
            userRepository;

    public CommunityUserBlockService(
            CommunityUserBlockRepository
                    communityUserBlockRepository,
            UserRepository
                    userRepository
    ) {
        this.communityUserBlockRepository =
                communityUserBlockRepository;

        this.userRepository =
                userRepository;
    }

    /*
     * ==========================================
     * 사용자 차단
     * ==========================================
     */
    public void blockUser(
            String blockerUsername,
            String blockedUsername
    ) {

        User blocker =
                getUser(
                        blockerUsername
                );

        User blockedUser =
                getUser(
                        blockedUsername
                );

        /*
         * 자기 자신은 차단할 수 없음
         */
        if (
                blocker.getId()
                        .equals(
                                blockedUser.getId()
                        )
        ) {
            throw new IllegalArgumentException(
                    "자기 자신은 차단할 수 없습니다."
            );
        }

        /*
         * 이미 차단한 사용자라면
         * 중복 저장하지 않음
         */
        boolean alreadyBlocked =
                communityUserBlockRepository
                        .existsByBlockerUsernameAndBlockedUserUsername(
                                blockerUsername,
                                blockedUsername
                        );

        if (alreadyBlocked) {
            return;
        }

        CommunityUserBlock block =
                new CommunityUserBlock();

        block.setBlocker(
                blocker
        );

        block.setBlockedUser(
                blockedUser
        );

        communityUserBlockRepository
                .save(
                        block
                );
    }

    /*
     * ==========================================
     * 사용자 차단 해제
     * ==========================================
     */
    public void unblockUser(
            String blockerUsername,
            String blockedUsername
    ) {

        CommunityUserBlock block =
                communityUserBlockRepository
                        .findByBlockerUsernameAndBlockedUserUsername(
                                blockerUsername,
                                blockedUsername
                        )
                        .orElse(
                                null
                        );

        if (block == null) {
            return;
        }

        communityUserBlockRepository
                .delete(
                        block
                );
    }

    /*
     * ==========================================
     * 차단 여부 확인
     * ==========================================
     */
    @Transactional(readOnly = true)
    public boolean isBlocked(
            String blockerUsername,
            String blockedUsername
    ) {

        if (
                blockerUsername == null ||
                blockerUsername.isBlank() ||
                blockedUsername == null ||
                blockedUsername.isBlank()
        ) {
            return false;
        }

        return communityUserBlockRepository
                .existsByBlockerUsernameAndBlockedUserUsername(
                        blockerUsername,
                        blockedUsername
                );
    }

    /*
     * ==========================================
     * 내가 차단한 username 목록
     * ==========================================
     *
     * 게시글/댓글 목록에서
     * 차단 사용자를 제외할 때 사용하는
     * 내부 기능입니다.
     */
    @Transactional(readOnly = true)
    public List<String> getBlockedUsernames(
            String blockerUsername
    ) {

        if (
                blockerUsername == null ||
                blockerUsername.isBlank()
        ) {
            return List.of();
        }

        return communityUserBlockRepository
                .findAllByBlockerUsernameOrderByCreatedAtDesc(
                        blockerUsername
                )
                .stream()
                .map(
                        block ->
                                block
                                        .getBlockedUser()
                                        .getUsername()
                )
                .toList();
    }

    /*
     * ==========================================
     * 내가 차단한 사용자 목록
     * 화면 표시용
     * ==========================================
     *
     * 화면에는 nickname을 보여주고,
     * 실제 차단 해제 요청에는 username을
     * 계속 사용할 수 있도록 둘 다 내려줍니다.
     */
    @Transactional(readOnly = true)
    public List<BlockedUserResponse> getBlockedUsers(
            String blockerUsername
    ) {

        if (
                blockerUsername == null ||
                blockerUsername.isBlank()
        ) {
            return List.of();
        }

        return communityUserBlockRepository
                .findAllByBlockerUsernameOrderByCreatedAtDesc(
                        blockerUsername
                )
                .stream()
                .map(
                        block -> {

                            User blockedUser =
                                    block.getBlockedUser();

                            return new BlockedUserResponse(
                                    blockedUser.getUsername(),
                                    blockedUser.getNickname()
                            );
                        }
                )
                .toList();
    }

    /*
     * ==========================================
     * 사용자 조회
     * ==========================================
     */
    private User getUser(
            String username
    ) {

        if (
                username == null ||
                username.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "사용자 정보가 필요합니다."
            );
        }

        return userRepository
                .findByUsername(
                        username
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "사용자 정보를 찾을 수 없습니다."
                                )
                );
    }
}