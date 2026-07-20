package com.hasi.service.common;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // AUTH
    AUTH_001(HttpStatus.UNAUTHORIZED,  "AUTH_001", "이메일 또는 비밀번호가 틀렸습니다"),
    AUTH_002(HttpStatus.FORBIDDEN,     "AUTH_002", "이메일 인증이 필요합니다"),
    AUTH_003(HttpStatus.UNAUTHORIZED,  "AUTH_003", "토큰이 만료되었습니다"),
    AUTH_004(HttpStatus.FORBIDDEN,     "AUTH_004", "접근 권한이 없습니다"),
    AUTH_005(HttpStatus.CONFLICT,      "AUTH_005", "이미 사용 중인 이메일입니다"),
    AUTH_007(HttpStatus.CONFLICT, "AUTH_007", "이미 연동된 소셜 계정입니다"),

    // VERIFY
    VERIFY_001(HttpStatus.BAD_REQUEST, "VERIFY_001", "코드가 틀렸거나 만료되었습니다"),
    VERIFY_002(HttpStatus.FORBIDDEN, "VERIFY_002", "이메일 인증이 필요합니다"),

    // VALID
    VALID_001(HttpStatus.BAD_REQUEST,  "VALID_001", "입력값이 올바르지 않습니다");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
