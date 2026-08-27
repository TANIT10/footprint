package com.footprint.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import com.footprint.backend.dto.AdminCommunityUserResponse;
import com.footprint.backend.entity.CommunityPost;
import com.footprint.backend.entity.Post;
import com.footprint.backend.entity.ReportTargetType;
import com.footprint.backend.entity.User;
import com.footprint.backend.entity.UserRole;
import com.footprint.backend.exception.LoginFailedException;
import com.footprint.backend.repository.AiMatchCandidateStatusRepository;
import com.footprint.backend.repository.CommentRepository;
import com.footprint.backend.repository.CommunityCommentRepository;
import com.footprint.backend.repository.CommunityPostLikeRepository;
import com.footprint.backend.repository.CommunityPostRepository;
import com.footprint.backend.repository.CommunityReportRepository;
import com.footprint.backend.repository.CommunityUserBlockRepository;
import com.footprint.backend.repository.InquiryRepository;
import com.footprint.backend.repository.NotificationRepository;
import com.footprint.backend.repository.PostRepository;
import com.footprint.backend.repository.ReportRepository;
import com.footprint.backend.repository.UserRepository;

@Service
public class UserService {

    private static final String PASSWORD_PATTERN =
            "^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"
            + "[a-zA-Z0-9!@#$%^&*]{8,20}$";

    private final UserRepository
            userRepository;

    private final PasswordEncoder
            passwordEncoder;

    private final ProfileImageService
            profileImageService;

    private final NotificationService
            notificationService;

    /*
     * ==========================================
     * 회원 탈퇴 관련
     * ==========================================
     */
    private final PostRepository
            postRepository;

    private final PostService
            postService;

    private final CommunityPostRepository
            communityPostRepository;

    private final CommunityPostService
            communityPostService;

    private final CommentRepository
            commentRepository;

    private final CommunityCommentRepository
            communityCommentRepository;

    private final CommunityPostLikeRepository
            communityPostLikeRepository;

    private final CommunityReportRepository
            communityReportRepository;

    private final CommunityUserBlockRepository
            communityUserBlockRepository;

    private final InquiryRepository
            inquiryRepository;

    private final NotificationRepository
            notificationRepository;

    private final ReportRepository
            reportRepository;

    private final AiMatchCandidateStatusRepository
            aiMatchCandidateStatusRepository;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            ProfileImageService profileImageService,
            NotificationService notificationService,
            PostRepository postRepository,
            PostService postService,
            CommunityPostRepository communityPostRepository,
            CommunityPostService communityPostService,
            CommentRepository commentRepository,
            CommunityCommentRepository communityCommentRepository,
            CommunityPostLikeRepository communityPostLikeRepository,
            CommunityReportRepository communityReportRepository,
            CommunityUserBlockRepository communityUserBlockRepository,
            InquiryRepository inquiryRepository,
            NotificationRepository notificationRepository,
            ReportRepository reportRepository,
            AiMatchCandidateStatusRepository
                    aiMatchCandidateStatusRepository
    ) {

        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.profileImageService =
                profileImageService;

        this.notificationService =
                notificationService;

        this.postRepository =
                postRepository;

        this.postService =
                postService;

        this.communityPostRepository =
                communityPostRepository;

        this.communityPostService =
                communityPostService;

        this.commentRepository =
                commentRepository;

        this.communityCommentRepository =
                communityCommentRepository;

        this.communityPostLikeRepository =
                communityPostLikeRepository;

        this.communityReportRepository =
                communityReportRepository;

        this.communityUserBlockRepository =
                communityUserBlockRepository;

        this.inquiryRepository =
                inquiryRepository;

        this.notificationRepository =
                notificationRepository;

        this.reportRepository =
                reportRepository;

        this.aiMatchCandidateStatusRepository =
                aiMatchCandidateStatusRepository;
    }

    /*
     * ==========================================
     * 회원가입
     * ==========================================
     */
    @Transactional
    public User signup(
            String username,
            String password,
            String nickname
    ) {

        if (
                username == null ||
                username.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "아이디를 입력해주세요."
            );
        }

        if (
                password == null ||
                password.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "비밀번호를 입력해주세요."
            );
        }

        if (
                nickname == null ||
                nickname.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "닉네임을 입력해주세요."
            );
        }

        username =
                username.trim();

        nickname =
                nickname.trim();

        if (
                !username.matches(
                        "^[a-zA-Z0-9]{1,10}$"
                )
        ) {
            throw new IllegalArgumentException(
                    "아이디는 영문과 숫자만 사용하여 "
                    + "10자 이내로 입력해주세요."
            );
        }

        if (
                !nickname.matches(
                        "^[가-힣a-zA-Z0-9]{1,10}$"
                )
        ) {
            throw new IllegalArgumentException(
                    "닉네임은 한글, 영문, 숫자만 사용하여 "
                    + "10자 이내로 입력해주세요."
            );
        }

        if (
                !password.matches(
                        PASSWORD_PATTERN
                )
        ) {
            throw new IllegalArgumentException(
                    "비밀번호는 영문, 숫자, 특수문자를 "
                    + "각각 포함하여 8~20자로 입력해주세요. "
                    + "사용 가능한 특수문자: !@#$%^&*"
            );
        }

        if (
                userRepository.existsByUsername(
                        username
                )
        ) {
            throw new IllegalArgumentException(
                    "이미 사용 중인 아이디입니다."
            );
        }

        if (
                userRepository.existsByNickname(
                        nickname
                )
        ) {
            throw new IllegalArgumentException(
                    "이미 사용 중인 닉네임입니다."
            );
        }

        String encodedPassword =
                passwordEncoder.encode(
                        password
                );

        User user =
                new User();

        user.setUsername(
                username
        );

        user.setPassword(
                encodedPassword
        );

        user.setNickname(
                nickname
        );

        user.setRole(
                UserRole.USER
        );

        return userRepository.save(
                user
        );
    }

    /*
     * ==========================================
     * 로그인
     * ==========================================
     */
    @Transactional(readOnly = true)
    public User login(
            String username,
            String password
    ) {

        User user =
                userRepository
                        .findByUsername(
                                username
                        )
                        .orElseThrow(() ->
                                new LoginFailedException(
                                        "아이디 또는 비밀번호가 "
                                        + "올바르지 않습니다."
                                )
                        );

        if (
                !passwordEncoder.matches(
                        password,
                        user.getPassword()
                )
        ) {

            throw new LoginFailedException(
                    "아이디 또는 비밀번호가 "
                    + "올바르지 않습니다."
            );
        }

        return user;
    }

    /*
     * ==========================================
     * 내 프로필
     * ==========================================
     */
    @Transactional(readOnly = true)
    public User getMyProfile(
            String username
    ) {

        return findUserByUsername(
                username
        );
    }

    /*
     * ==========================================
     * 공개 프로필
     * ==========================================
     */
    @Transactional(readOnly = true)
    public User getPublicProfile(
            Long userId
    ) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "회원 번호가 필요합니다."
            );
        }

        return userRepository
                .findById(
                        userId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "회원 정보를 찾을 수 없습니다."
                        )
                );
    }

    /*
     * ==========================================
     * 프로필 수정
     * ==========================================
     */
    @Transactional
    public User updateProfile(
            String username,
            String nickname
    ) {

        if (
                nickname == null ||
                nickname.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "닉네임을 입력해주세요."
            );
        }

        nickname =
                nickname.trim();

        if (
                !nickname.matches(
                        "^[가-힣a-zA-Z0-9]{1,10}$"
                )
        ) {
            throw new IllegalArgumentException(
                    "닉네임은 한글, 영문, 숫자만 사용하여 "
                    + "10자 이내로 입력해주세요."
            );
        }

        User user =
                findUserByUsername(
                        username
                );

        boolean nicknameChanged =
                !nickname.equals(
                        user.getNickname()
                );

        /*
         * 현재 닉네임과 동일한 경우에는
         * 실제 변경이 아니므로 14일 제한을 적용하지 않습니다.
         */
        if (!nicknameChanged) {
            return user;
        }

        /*
         * ==========================================
         * 닉네임 변경 14일 제한
         * ==========================================
         *
         * nicknameChangedAt == null:
         * 아직 닉네임을 변경한 적이 없으므로 즉시 변경 가능
         *
         * 값이 있는 경우:
         * 마지막 변경 시각으로부터 정확히 14일이 지난 뒤
         * 다시 변경할 수 있습니다.
         */
        LocalDateTime now =
                LocalDateTime.now();

        LocalDateTime nicknameChangedAt =
                user.getNicknameChangedAt();

        if (
                nicknameChangedAt != null &&
                now.isBefore(
                        nicknameChangedAt
                                .plusDays(14)
                )
        ) {
            throw new IllegalArgumentException(
                    "닉네임은 14일에 한 번 변경할 수 있습니다."
            );
        }

        if (
                userRepository
                        .existsByNickname(
                                nickname
                        )
        ) {

            throw new IllegalArgumentException(
                    "이미 사용 중인 닉네임입니다."
            );
        }

        /*
         * 닉네임과 마지막 변경 시각은
         * 실제 변경이 성공하는 경우에만 함께 갱신합니다.
         */
        user.setNickname(
                nickname
        );

        user.setNicknameChangedAt(
                now
        );

        return user;
    }

    /*
     * ==========================================
     * 프로필 이미지 수정
     * ==========================================
     */
    @Transactional
    public User updateProfileImage(
            String username,
            MultipartFile image
    ) {

        User user =
                findUserByUsername(
                        username
                );

        String previousImageUrl =
                user.getProfileImageUrl();

        String newImageUrl =
                profileImageService.save(
                        image
                );

        user.setProfileImageUrl(
                newImageUrl
        );

        profileImageService.delete(
                previousImageUrl
        );

        return user;
    }

    /*
     * ==========================================
     * 프로필 이미지 삭제
     * ==========================================
     */
    @Transactional
    public User deleteProfileImage(
            String username
    ) {

        User user =
                findUserByUsername(
                        username
                );

        String previousImageUrl =
                user.getProfileImageUrl();

        user.setProfileImageUrl(
                null
        );

        profileImageService.delete(
                previousImageUrl
        );

        return user;
    }

    /*
     * ==========================================
     * 회원 탈퇴
     * ==========================================
     *
     * 삭제 순서가 매우 중요합니다.
     *
     * 1. 비밀번호 확인
     * 2. 관리자 계정 탈퇴 차단
     * 3. 사용자가 작성한 게시글 삭제
     * 4. 사용자와 직접 연결된 각종 데이터 삭제
     * 5. users 행 삭제
     * 6. DB COMMIT 성공 후 프로필 이미지 파일 삭제
     */
    @Transactional
    public void withdraw(
            String username,
            String password
    ) {

        if (
                password == null ||
                password.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "비밀번호를 입력해주세요."
            );
        }

        User user =
                findUserByUsername(
                        username
                );

        if (
                !passwordEncoder.matches(
                        password,
                        user.getPassword()
                )
        ) {

            throw new LoginFailedException(
                    "비밀번호가 올바르지 않습니다."
            );
        }

        /*
         * 관리자 계정은 회원탈퇴 기능을 사용하지 않습니다.
         *
         * notices.author_id,
         * reports.handled_by 등
         * 관리자 전용 데이터 보호 목적도 있습니다.
         */
        if (
                user.getRole()
                        == UserRole.ADMIN
        ) {
            throw new IllegalArgumentException(
                    "관리자 계정은 탈퇴할 수 없습니다."
            );
        }

        Long userId =
                user.getId();

        String normalizedUsername =
                user.getUsername();

        String profileImageUrl =
                user.getProfileImageUrl();

        /*
         * ==========================================
         * 1. 작성한 일반 게시글 전체 삭제
         * ==========================================
         *
         * 항상 첫 페이지를 다시 조회합니다.
         * 게시글을 삭제하면 목록 크기가 줄어들기 때문에
         * 페이지 번호를 증가시키면 일부 글을 건너뛸 수 있습니다.
         */
        while (true) {

            Page<Post> postPage =
                    postRepository
                            .findByAuthorIdOrderByCreatedAtDesc(
                                    userId,
                                    PageRequest.of(
                                            0,
                                            50
                                    )
                            );

            List<Post> posts =
                    postPage.getContent();

            if (
                    posts.isEmpty()
            ) {
                break;
            }

            List<Long> postIds =
                    posts.stream()
                            .map(
                                    Post::getId
                            )
                            .toList();

            for (
                    Long postId
                    : postIds
            ) {

                postService.deletePost(
                        normalizedUsername,
                        postId
                );
            }
        }

        /*
         * ==========================================
         * 2. 작성한 커뮤니티 게시글 전체 삭제
         * ==========================================
         *
         * 기존 CommunityPostService의 삭제 로직을 사용하여
         * 댓글 / 좋아요 / 이미지 / 신고 / 알림까지
         * 게시글 단위로 안전하게 정리합니다.
         */
        while (true) {

            Page<CommunityPost>
                    communityPostPage =
                    communityPostRepository
                            .findByAuthorUsernameOrderByCreatedAtDesc(
                                    normalizedUsername,
                                    PageRequest.of(
                                            0,
                                            20
                                    )
                            );

            List<CommunityPost>
                    communityPosts =
                    communityPostPage
                            .getContent();

            if (
                    communityPosts.isEmpty()
            ) {
                break;
            }

            List<Long> communityPostIds =
                    communityPosts.stream()
                            .map(
                                    CommunityPost::getId
                            )
                            .toList();

            for (
                    Long communityPostId
                    : communityPostIds
            ) {

                communityPostService
                        .deletePost(
                                normalizedUsername,
                                communityPostId
                        );
            }
        }

        /*
         * ==========================================
         * 3. 다른 사람 글에 작성한 일반 댓글 삭제
         * ==========================================
         */
        commentRepository
                .deleteByAuthorId(
                        userId
                );

        commentRepository
                .flush();

        /*
         * ==========================================
         * 4. 다른 사람 커뮤니티 글에 작성한 댓글 삭제
         * ==========================================
         */
        communityCommentRepository
                .deleteByAuthorId(
                        userId
                );

        communityCommentRepository
                .flush();

        /*
         * ==========================================
         * 5. 다른 커뮤니티 글에 누른 좋아요 삭제
         * ==========================================
         */
        communityPostLikeRepository
                .deleteByUserId(
                        userId
                );

        communityPostLikeRepository
                .flush();

        /*
         * ==========================================
         * 6. 커뮤니티 신고 기록 삭제
         * ==========================================
         *
         * 내가 신고한 기록과
         * 내가 신고당한 기록 모두 삭제합니다.
         */
        communityReportRepository
                .deleteByReporterId(
                        userId
                );

        communityReportRepository
                .deleteByReportedUserId(
                        userId
                );

        communityReportRepository
                .flush();

        /*
         * ==========================================
         * 7. 차단 관계 전체 삭제
         * ==========================================
         *
         * 내가 차단한 기록 +
         * 다른 사람이 나를 차단한 기록
         */
        communityUserBlockRepository
                .deleteByBlockerId(
                        userId
                );

        communityUserBlockRepository
                .deleteByBlockedUserId(
                        userId
                );

        communityUserBlockRepository
                .flush();

        /*
         * ==========================================
         * 8. 문의 내역 삭제
         * ==========================================
         */
        inquiryRepository
                .deleteByUserId(
                        userId
                );

        inquiryRepository
                .flush();

        /*
         * ==========================================
         * 9. 일반 신고 데이터 삭제
         * ==========================================
         *
         * 내가 작성한 신고 +
         * 나 자신을 대상으로 한 USER 신고
         */
        reportRepository
                .deleteByReporterId(
                        userId
                );

        reportRepository
                .deleteByTargetTypeAndTargetId(
                        ReportTargetType.USER,
                        userId
                );

        reportRepository
                .flush();

        /*
         * ==========================================
         * 10. 받은 알림 전체 삭제
         * ==========================================
         */
        notificationRepository
                .deleteByRecipientId(
                        userId
                );

        notificationRepository
                .flush();

        /*
         * ==========================================
         * 11. AI 매칭 후보 확인 상태 삭제
         * ==========================================
         *
         * 이 테이블은 users FK는 아니지만
         * username 문자열로 사용자를 구분하므로
         * 탈퇴 시 같이 정리합니다.
         */
        aiMatchCandidateStatusRepository
                .deleteByUsername(
                        normalizedUsername
                );

        aiMatchCandidateStatusRepository
                .flush();

        /*
         * ==========================================
         * 12. 사용자 본체 삭제
         * ==========================================
         */
        userRepository.delete(
                user
        );

        userRepository.flush();

        /*
         * ==========================================
         * 13. DB COMMIT 성공 후 프로필 사진 삭제
         * ==========================================
         *
         * 예전처럼 DB보다 파일을 먼저 삭제하면
         * 회원탈퇴 DB 처리 실패 시
         * 프로필 사진만 사라질 수 있습니다.
         *
         * 따라서 DB 트랜잭션이 성공한 경우에만
         * 실제 프로필 이미지 파일을 지웁니다.
         */
        registerProfileImageDeleteAfterCommit(
                profileImageUrl
        );
    }

    /*
     * ==========================================
     * 회원 탈퇴 후 프로필 실제 파일 삭제
     * ==========================================
     */
    private void registerProfileImageDeleteAfterCommit(
            String profileImageUrl
    ) {

        if (
                profileImageUrl == null ||
                profileImageUrl.isBlank()
        ) {
            return;
        }

        if (
                TransactionSynchronizationManager
                        .isSynchronizationActive()
        ) {

            TransactionSynchronizationManager
                    .registerSynchronization(
                            new TransactionSynchronization() {

                                @Override
                                public void afterCommit() {

                                    profileImageService
                                            .delete(
                                                    profileImageUrl
                                            );
                                }
                            }
                    );

            return;
        }

        /*
         * 혹시 트랜잭션 없이 호출되는 예외적인 경우
         */
        profileImageService.delete(
                profileImageUrl
        );
    }

    /*
     * ==========================================
     * 아이디 중복 확인
     * ==========================================
     */
    @Transactional(readOnly = true)
    public boolean isUsernameDuplicated(
            String username
    ) {

        if (
                username == null ||
                username.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "아이디를 입력해주세요."
            );
        }

        username =
                username.trim();

        if (
                !username.matches(
                        "^[a-zA-Z0-9]{1,10}$"
                )
        ) {
            throw new IllegalArgumentException(
                    "아이디는 영문과 숫자만 사용하여 "
                    + "10자 이내로 입력해주세요."
            );
        }

        return userRepository
                .existsByUsername(
                        username
                );
    }

    /*
     * ==========================================
     * 닉네임 중복 확인
     * ==========================================
     */
    @Transactional(readOnly = true)
    public boolean isNicknameDuplicated(
            String nickname
    ) {

        if (
                nickname == null ||
                nickname.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "닉네임을 입력해주세요."
            );
        }

        nickname =
                nickname.trim();

        if (
                !nickname.matches(
                        "^[가-힣a-zA-Z0-9]{1,10}$"
                )
        ) {
            throw new IllegalArgumentException(
                    "닉네임은 한글, 영문, 숫자만 사용하여 "
                    + "10자 이내로 입력해주세요."
            );
        }

        return userRepository
                .existsByNickname(
                        nickname
                );
    }

    /*
     * ==========================================
     * 관리자 - 커뮤니티 사용자 상태 조회
     * ==========================================
     */
    @Transactional(readOnly = true)
    public AdminCommunityUserResponse
    getCommunityAdminUser(
            String username
    ) {

        User user =
                findUserForAdmin(
                        username
                );

        return toAdminCommunityUserResponse(
                user
        );
    }

    /*
     * ==========================================
     * 관리자 - 커뮤니티 경고 1회 추가
     * ==========================================
     */
    @Transactional
    public AdminCommunityUserResponse
    addCommunityWarningByAdmin(
            String username
    ) {

        User user =
                findUserForAdmin(
                        username
                );

        validateSanctionTarget(
                user
        );

        user.addCommunityWarning();

        User savedUser =
                userRepository.save(
                        user
                );

        notificationService
                .createCommunityWarningNotification(
                        savedUser,
                        savedUser
                                .getCommunityWarningCount()
                );

        return toAdminCommunityUserResponse(
                savedUser
        );
    }

    /*
     * ==========================================
     * 관리자 - 커뮤니티 기간 정지
     * ==========================================
     *
     * 허용 기간:
     * 1일 / 3일 / 7일 / 30일
     */
    @Transactional
    public AdminCommunityUserResponse
    suspendCommunityUserByAdmin(
            String username,
            int days
    ) {

        if (
                days != 1 &&
                days != 3 &&
                days != 7 &&
                days != 30
        ) {
            throw new IllegalArgumentException(
                    "정지 기간은 1일, 3일, 7일, 30일 중에서 선택해 주세요."
            );
        }

        User user =
                findUserForAdmin(
                        username
                );

        validateSanctionTarget(
                user
        );

        user.setCommunitySuspendedUntil(
                LocalDateTime
                        .now()
                        .plusDays(
                                days
                        )
        );

        User savedUser =
                userRepository.save(
                        user
                );

        notificationService
                .createCommunitySuspensionNotification(
                        savedUser,
                        days,
                        savedUser
                                .getCommunitySuspendedUntil()
                );

        return toAdminCommunityUserResponse(
                savedUser
        );
    }

    /*
     * ==========================================
     * 관리자 - 커뮤니티 정지 해제
     * ==========================================
     */
    @Transactional
    public AdminCommunityUserResponse
    clearCommunitySuspensionByAdmin(
            String username
    ) {

        User user =
                findUserForAdmin(
                        username
                );

        validateSanctionTarget(
                user
        );

        user.clearCommunitySuspension();

        User savedUser =
                userRepository.save(
                        user
                );

        notificationService
                .createCommunitySuspensionClearedNotification(
                        savedUser
                );

        return toAdminCommunityUserResponse(
                savedUser
        );
    }

    /*
     * ==========================================
     * 관리자 제재 대상 검증
     * ==========================================
     */
    private void validateSanctionTarget(
            User user
    ) {

        if (
                user.getRole()
                        == UserRole.ADMIN
        ) {
            throw new IllegalArgumentException(
                    "관리자 계정에는 커뮤니티 제재를 적용할 수 없습니다."
            );
        }
    }

    /*
     * ==========================================
     * 관리자 사용자 조회
     * ==========================================
     */
    private User findUserForAdmin(
            String username
    ) {

        if (
                username == null ||
                username.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "회원 아이디가 필요합니다."
            );
        }

        return userRepository
                .findByUsername(
                        username.trim()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "회원 정보를 찾을 수 없습니다."
                        )
                );
    }

    /*
     * ==========================================
     * 관리자 사용자 Response
     * ==========================================
     */
    private AdminCommunityUserResponse
    toAdminCommunityUserResponse(
            User user
    ) {

        return new AdminCommunityUserResponse(
                user.getId(),
                user.getUsername(),
                user.getNickname(),
                user.getRole(),
                user.getCommunityWarningCount(),
                user.isCommunitySuspended(),
                user.getCommunitySuspendedUntil()
        );
    }

    /*
     * ==========================================
     * 사용자 조회 공통
     * ==========================================
     */
    private User findUserByUsername(
            String username
    ) {

        if (
                username == null ||
                username.isBlank()
        ) {
            throw new LoginFailedException(
                    "로그인 정보를 확인할 수 없습니다."
            );
        }

        return userRepository
                .findByUsername(
                        username
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "회원 정보를 찾을 수 없습니다."
                        )
                );
    }
}