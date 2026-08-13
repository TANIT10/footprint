package com.footprint.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.footprint.backend.dto.LoginRequest;
import com.footprint.backend.dto.LoginResponse;
import com.footprint.backend.dto.SignupRequest;
import com.footprint.backend.dto.WithdrawRequest;
import com.footprint.backend.entity.User;
import com.footprint.backend.jwt.JwtUtil;
import com.footprint.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(
            UserService userService,
            JwtUtil jwtUtil) {

        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsername(
            @RequestParam String username) {

        boolean duplicated =
                userService.isUsernameDuplicated(
                        username
                );

        return ResponseEntity.ok(duplicated);
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNickname(
            @RequestParam String nickname) {

        boolean duplicated =
                userService.isNicknameDuplicated(
                        nickname
                );

        return ResponseEntity.ok(duplicated);
    }
    
    @PostMapping("/signup")
    public ResponseEntity<String> signup(
            @RequestBody SignupRequest request) {

        userService.signup(
                request.getUsername(),
                request.getPassword(),
                request.getNickname()
        );

        return ResponseEntity.ok("회원가입 성공");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        User user = userService.login(
                request.getUsername(),
                request.getPassword()
        );

        String token =
                jwtUtil.createToken(user.getUsername());

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getNickname(),
                "로그인 성공",
                token
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<String> me(
            Authentication authentication) {

        String username = authentication.getName();

        return ResponseEntity.ok(
                "현재 로그인 사용자: " + username
        );
    }

    @DeleteMapping("/me")
    public ResponseEntity<String> withdraw(
            Authentication authentication,
            @RequestBody WithdrawRequest request) {

        String username = authentication.getName();

        userService.withdraw(
                username,
                request.getPassword()
        );

        return ResponseEntity.ok(
                "회원 탈퇴가 완료되었습니다."
        );
    }
}