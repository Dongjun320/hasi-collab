package com.hasi.service.auth;

import com.hasi.service.auth.dto.request.*;
import com.hasi.service.auth.dto.response.*;
import com.hasi.service.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 회원가입 → 이메일 인증코드 자동 발송
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response));
    }

    // 이메일 인증코드 재발송
    @PostMapping("/email/send")
    public ResponseEntity<ApiResponse<String>> emailSend(
            @Valid @RequestBody EmailSendRequest request) {
        authService.emailSend(request);
        return ResponseEntity.ok(ApiResponse.ok("인증코드 발송 완료 (10분 유효)"));
    }

    // 이메일 인증코드 확인
    @PostMapping("/email/verify")
    public ResponseEntity<ApiResponse<String>> emailVerify(
            @Valid @RequestBody EmailVerifyRequest request) {
        authService.emailVerify(request);
        return ResponseEntity.ok(ApiResponse.ok("이메일 인증 완료"));
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(
            @Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(ApiResponse.ok("로그아웃 완료"));
    }
}