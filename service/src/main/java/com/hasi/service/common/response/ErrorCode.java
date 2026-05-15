package com.hasi.service.common.response;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 공통
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다."),

    // 인증
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다."),

    // 사용자
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "비밀번호가 올바르지 않습니다."),
    EMAIL_NOT_VERIFIED(HttpStatus.FORBIDDEN, "이메일 인증이 완료되지 않았습니다."),
    VERIFICATION_CODE_INVALID(HttpStatus.BAD_REQUEST, "인증 코드가 올바르지 않거나 만료되었습니다."),

    // 워크스페이스
    WORKSPACE_NOT_FOUND(HttpStatus.NOT_FOUND, "워크스페이스를 찾을 수 없습니다."),
    WORKSPACE_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "워크스페이스 멤버가 아닙니다."),

    // 채널
    CHANNEL_NOT_FOUND(HttpStatus.NOT_FOUND, "채널을 찾을 수 없습니다."),
    CHANNEL_ACCESS_DENIED(HttpStatus.FORBIDDEN, "채널 접근 권한이 없습니다."),

    // 메시지
    MESSAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "메시지를 찾을 수 없습니다."),
    MESSAGE_DELETE_DENIED(HttpStatus.FORBIDDEN, "본인 메시지만 삭제할 수 있습니다."),

    // DM
    DM_ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "DM 방을 찾을 수 없습니다."),

    // 칸반
    TASK_NOT_FOUND(HttpStatus.NOT_FOUND, "업무를 찾을 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
