package com.footprint.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.footprint.backend.entity.User;
import com.footprint.backend.exception.LoginFailedException;
import com.footprint.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

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

        if (!username.matches("^[a-zA-Z0-9]{1,10}$")) {
            throw new IllegalArgumentException(
                    "아이디는 영문과 숫자만 사용하여 10자 이내로 입력해주세요."
            );
        }

        if (!nickname.matches("^[가-힣a-zA-Z0-9]{1,10}$")) {
            throw new IllegalArgumentException(
                    "닉네임은 한글, 영문, 숫자만 사용하여 10자 이내로 입력해주세요."
            );
        }

        if (!password.matches(
                "^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{2,16}$"
        )) {
            throw new IllegalArgumentException(
                    "비밀번호는 영문과 숫자를 조합하여 16자 이내로 입력해주세요."
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

        return userRepository.save(user);
    }

    public User login(
            String username,
            String password) {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new LoginFailedException(
                                "아이디 또는 비밀번호가 올바르지 않습니다."
                        )
                );

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new LoginFailedException(
                    "아이디 또는 비밀번호가 올바르지 않습니다."
            );
        }

        return user;
    }

    @Transactional
    public void withdraw(
            String username,
            String password) {

        if (username == null || username.isBlank()) {
            throw new LoginFailedException(
                    "로그인 정보를 확인할 수 없습니다."
            );
        }

        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException(
                    "비밀번호를 입력해주세요."
            );
        }

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new LoginFailedException(
                                "회원 정보를 찾을 수 없습니다."
                        )
                );

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new LoginFailedException(
                    "비밀번호가 올바르지 않습니다."
            );
        }

        userRepository.delete(user);
    }
    
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
                    "아이디는 영문과 숫자만 사용하여 10자 이내로 입력해주세요."
            );
        }

        return userRepository.existsByUsername(
                username
        );
    }

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
                    "닉네임은 한글, 영문, 숫자만 사용하여 10자 이내로 입력해주세요."
            );
        }

        return userRepository.existsByNickname(
                nickname
        );
    }
}