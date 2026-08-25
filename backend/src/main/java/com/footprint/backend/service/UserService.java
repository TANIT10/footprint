package com.footprint.backend.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.footprint.backend.dto.AdminCommunityUserResponse;
import com.footprint.backend.entity.User;
import com.footprint.backend.entity.UserRole;
import com.footprint.backend.exception.LoginFailedException;
import com.footprint.backend.repository.UserRepository;

@Service
public class UserService {

    private static final String PASSWORD_PATTERN =
            "^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"
            + "[a-zA-Z0-9!@#$%^&*]{8,20}$";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProfileImageService
            profileImageService;

    private final NotificationService
            notificationService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            ProfileImageService
                    profileImageService,
            NotificationService
                    notificationService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.profileImageService =
                profileImageService;
        this.notificationService =
                notificationService;
    }

    @Transactional
    public User signup(
            String username,
            String password,
            String nickname) {

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException(
                    "아이디를 입력해주세요."
            );
        }

        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException(
                    "비밀번호를 입력해주세요."
            );
        }

        if (nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException(
                    "닉네임을 입력해주세요."
            );
        }

        username = username.trim();
        nickname = nickname.trim();

        if (!username.matches(
                "^[a-zA-Z0-9]{1,10}$"
        )) {
            throw new IllegalArgumentException(
                    "아이디는 영문과 숫자만 사용하여 "
                    + "10자 이내로 입력해주세요."
            );
        }

        if (!nickname.matches(
                "^[가-힣a-zA-Z0-9]{1,10}$"
        )) {
            throw new IllegalArgumentException(
                    "닉네임은 한글, 영문, 숫자만 사용하여 "
                    + "10자 이내로 입력해주세요."
            );
        }

        if (!password.matches(PASSWORD_PATTERN)) {
            throw new IllegalArgumentException(
                    "비밀번호는 영문, 숫자, 특수문자를 "
                    + "각각 포함하여 8~20자로 입력해주세요. "
                    + "사용 가능한 특수문자: !@#$%^&*"
            );
        }

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException(
                    "이미 사용 중인 아이디입니다."
            );
        }

        if (userRepository.existsByNickname(nickname)) {
            throw new IllegalArgumentException(
                    "이미 사용 중인 닉네임입니다."
            );
        }

        String encodedPassword =
                passwordEncoder.encode(password);

        User user = new User();
        user.setUsername(username);
        user.setPassword(encodedPassword);
        user.setNickname(nickname);
        user.setRole(UserRole.USER);

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User login(
            String username,
            String password) {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new LoginFailedException(
                                "아이디 또는 비밀번호가 "
                                + "올바르지 않습니다."
                        )
                );

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new LoginFailedException(
                    "아이디 또는 비밀번호가 "
                    + "올바르지 않습니다."
            );
        }

        return user;
    }

    @Transactional(readOnly = true)
    public User getMyProfile(
            String username) {

        return findUserByUsername(username);
    }

    @Transactional(readOnly = true)
    public User getPublicProfile(
            Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "회원 번호가 필요합니다."
            );
        }

        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "회원 정보를 찾을 수 없습니다."
                        )
                );
    }

    @Transactional
    public User updateProfile(
            String username,
            String nickname) {

        if (nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException(
                    "닉네임을 입력해주세요."
            );
        }

        nickname = nickname.trim();

        if (!nickname.matches(
                "^[가-힣a-zA-Z0-9]{1,10}$"
        )) {
            throw new IllegalArgumentException(
                    "닉네임은 한글, 영문, 숫자만 사용하여 "
                    + "10자 이내로 입력해주세요."
            );
        }

        User user =
                findUserByUsername(username);

        boolean nicknameChanged =
                !nickname.equals(
                        user.getNickname()
                );

        if (nicknameChanged
                && userRepository
                        .existsByNickname(nickname)) {

            throw new IllegalArgumentException(
                    "이미 사용 중인 닉네임입니다."
            );
        }

        user.setNickname(nickname);

        return user;
    }

    @Transactional
    public User updateProfileImage(
            String username,
            MultipartFile image) {

        User user =
                findUserByUsername(username);

        String previousImageUrl =
                user.getProfileImageUrl();

        String newImageUrl =
                profileImageService.save(image);

        user.setProfileImageUrl(
                newImageUrl
        );

        profileImageService.delete(
                previousImageUrl
        );

        return user;
    }

    @Transactional
    public User deleteProfileImage(
            String username) {

        User user =
                findUserByUsername(username);

        String previousImageUrl =
                user.getProfileImageUrl();

        user.setProfileImageUrl(null);

        profileImageService.delete(
                previousImageUrl
        );

        return user;
    }

    @Transactional
    public void withdraw(
            String username,
            String password) {

        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException(
                    "비밀번호를 입력해주세요."
            );
        }

        User user =
                findUserByUsername(username);

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new LoginFailedException(
                    "비밀번호가 올바르지 않습니다."
            );
        }

        profileImageService.delete(
                user.getProfileImageUrl()
        );

        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public boolean isUsernameDuplicated(
            String username) {

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException(
                    "아이디를 입력해주세요."
            );
        }

        username = username.trim();

        if (!username.matches(
                "^[a-zA-Z0-9]{1,10}$"
        )) {
            throw new IllegalArgumentException(
                    "아이디는 영문과 숫자만 사용하여 "
                    + "10자 이내로 입력해주세요."
            );
        }

        return userRepository.existsByUsername(
                username
        );
    }

    @Transactional(readOnly = true)
    public boolean isNicknameDuplicated(
            String nickname) {

        if (nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException(
                    "닉네임을 입력해주세요."
            );
        }

        nickname = nickname.trim();

        if (!nickname.matches(
                "^[가-힣a-zA-Z0-9]{1,10}$"
        )) {
            throw new IllegalArgumentException(
                    "닉네임은 한글, 영문, 숫자만 사용하여 "
                    + "10자 이내로 입력해주세요."
            );
        }

        return userRepository.existsByNickname(
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

        /*
         * 이미 정지 중이라면
         * 현재 정지 종료 시각부터 기간을 더하지 않고,
         * 관리자 조치 시점 기준으로 새 종료 시각을 설정합니다.
         */
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
     *
     * 관리자 계정을 실수로 정지/경고하지 않도록
     * ADMIN 계정은 대상에서 제외합니다.
     */
    private void validateSanctionTarget(
            User user
    ) {

        if (
                user.getRole() ==
                UserRole.ADMIN
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

    private User findUserByUsername(
            String username) {

        if (username == null || username.isBlank()) {
            throw new LoginFailedException(
                    "로그인 정보를 확인할 수 없습니다."
            );
        }

        return userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "회원 정보를 찾을 수 없습니다."
                        )
                );
    }
}
