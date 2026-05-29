package com.hasi.service.auth;

public class AuthService {
    public void register() {
//     · existsByEmail 중복 체크 → AUTH_005
//     · BCrypt 비밀번호 암호화
//     · isEmailVerified = false 저장
//     · 인증코드 이메일 발송
    }

    public void emadilSend() {
//     · 6자리 코드 생성
//     · Redis 저장 (TTL 10분)
//     · 이메일 발송
    }

    public void emailVerify() {
//     · Redis에서 코드 비교
//     · 틀리거나 만료 → VERIFY_001
//     · 성공 시 isEmailVerified = true
    }

    public void login() {
//     · 이메일 조회 없으면 → AUTH_001
//     · 비밀번호 불일치 → AUTH_001
//     · 이메일 미인증 → AUTH_002
//     · 성공 시 accessToken + refreshToken 발급
    }

}
