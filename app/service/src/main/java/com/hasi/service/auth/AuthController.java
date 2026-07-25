package com.hasi.service.auth;

import com.hasi.collab.api.AuthApi;
import com.hasi.collab.model.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController implements AuthApi {

    private final AuthService authService;
    private final SocialAccountService socialAccountService;

    // 회원가입 (선 이메일 인증 필요)
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    // 이메일 인증코드 발송
    @PostMapping("/email/send")
    public ResponseEntity<Void> emailSend(
            @Valid @RequestBody EmailSendRequest request) {
        authService.emailSend(request);
        return ResponseEntity.ok().build();
    }

    // 비밀번호 찾기 전용 인증코드 발송
    @PostMapping("/password/send")
    public ResponseEntity<Void> emailSendForPasswordReset(
            @Valid @RequestBody EmailSendRequest request) {
        authService.emailSendForPasswordReset(request);
        return ResponseEntity.ok().build();
    }

    // 이메일 인증코드 확인
    @PostMapping("/email/verify")
    public ResponseEntity<Void> emailVerify(
            @Valid @RequestBody EmailVerifyRequest request) {
        authService.emailVerify(request);
        return ResponseEntity.ok().build();
    }

    // 비밀번호 재설정 코드 확인
    @PostMapping("/password/verify")
    public ResponseEntity<Void> emailVerifyForPWReset(
            @Valid @RequestBody EmailVerifyRequest request) {
        authService.emailVerifyForPWReset(request.getEmail(), request.getCode());
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

    // 비밀번호 찾기 이메일 인증코드 확인 및 패스워드 변경
    @PostMapping("/password/reset")
    public ResponseEntity<Void> resetPassword(
            @Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(
                request.getEmail(),
                request.getNewPassword()
        );
        return ResponseEntity.ok().build();
    }

    @Override
    @GetMapping("/social")
    public ResponseEntity<GetSocialAccount200Response> getSocialAccount() {
        GetSocialAccount200Response body = new GetSocialAccount200Response()
                .success(true)
                .data(socialAccountService.getSocialAccount());
        return ResponseEntity.ok(body);
    }

    @Override
    @DeleteMapping("/social")
    public ResponseEntity<Void> unlinkSocialAccount() {
        socialAccountService.unlinkSocialAccount();
        return ResponseEntity.ok().build();
    }

    @Override
    @PostMapping("/social/link")
    public ResponseEntity<Void> linkSocialAccount(@RequestBody SocialLinkRequest request) {
        socialAccountService.linkByCode(request.getCode());
        return ResponseEntity.ok().build();
    }
}