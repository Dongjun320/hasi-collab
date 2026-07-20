package com.hasi.service.auth;

import com.hasi.collab.api.AuthApi;
import com.hasi.collab.model.RegisterRequest;
import com.hasi.collab.model.EmailSendRequest;
import com.hasi.collab.model.EmailVerifyRequest;
import com.hasi.collab.model.LogOutRequest;
import com.hasi.collab.model.LogInRequest;
import com.hasi.collab.model.LogInResponse;
import com.hasi.collab.model.RegisterResponse;
import com.hasi.service.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController implements AuthApi {

    private final AuthService authService;

    // 회원가입 → 이메일 인증코드 자동 발송
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    // 이메일 인증코드 재발송
    @PostMapping("/email/send")
    public ResponseEntity<Void> emailSend(
            @Valid @RequestBody EmailSendRequest request) {
        authService.emailSend(request);
        return ResponseEntity.ok().build();
    }

    // 이메일 인증코드 확인
    @PostMapping("/email/verify")
    public ResponseEntity<Void> emailVerify(
            @Valid @RequestBody EmailVerifyRequest request) {
        authService.emailVerify(request);
        return ResponseEntity.ok().build();
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<LogInResponse> login(
            @Valid @RequestBody LogInRequest request) {
        LogInResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @Valid @RequestBody LogOutRequest request) {
        authService.logout(request);
        return ResponseEntity.ok().build();
    }
}