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
    AUTH_006(HttpStatus.CONFLICT, "AUTH_006", "가입되지 않은 이메일입니다"),
    AUTH_007(HttpStatus.CONFLICT, "AUTH_007", "이미 연동된 소셜 계정입니다"),
    AUTH_008(HttpStatus.CONFLICT, "AUTH_008", "이미 연동된 소셜 계정이 있습니다. 해제 후 다시 시도해주세요"),
    AUTH_009(HttpStatus.NOT_FOUND, "AUTH_009", "연동된 소셜 계정이 없습니다"),
    AUTH_010(HttpStatus.BAD_REQUEST, "AUTH_010", "연동 코드가 유효하지 않거나 만료되었습니다"),


    // VERIFY
    VERIFY_001(HttpStatus.BAD_REQUEST, "VERIFY_001", "코드가 틀렸거나 만료되었습니다"),
    VERIFY_002(HttpStatus.FORBIDDEN, "VERIFY_002", "이메일 인증이 필요합니다"),

    // VALID
    VALID_001(HttpStatus.BAD_REQUEST,  "VALID_001", "입력값이 올바르지 않습니다"),

    // SERVER
    SERVER_001(HttpStatus.INTERNAL_SERVER_ERROR, "SERVER_001", "서버 내부 오류가 발생하였습니다"),

    // WORKSPACE
    WS_001(HttpStatus.CONFLICT, "WS_001", "동일한 이름의 워크스페이스가 존재합니다"),
    WS_002(HttpStatus.NOT_FOUND, "WS_002", "워크스페이스를 찾을 수 없습니다"),
    WS_003(HttpStatus.BAD_REQUEST, "WS_003", "워크스페이스 입력값이 유효하지 않습니다"),

    // CHANNEL
    CH_001(HttpStatus.CONFLICT, "CH_001", "동일한 이름의 채널이 존재합니다"),
    CH_002(HttpStatus.NOT_FOUND, "CH_002", "채널을 찾을 수 없습니다"),
    CH_003(HttpStatus.BAD_REQUEST, "CH_003", "채널 입력값이 유효하지 않습니다"),
    CH_004(HttpStatus.CONFLICT, "CH_004", "하위 채널이 있어 삭제할 수 없습니다"),
    CH_005(HttpStatus.CONFLICT, "CH_005", "이미 채널에 참가한 멤버입니다"),
    CH_006(HttpStatus.CONFLICT, "CH_006", "삭제할 수 없는 채널입니다"),

    // MEMBER
    MBR_001(HttpStatus.NOT_FOUND, "MBR_001", "해당 닉네임의 사용자를 찾을 수 없습니다"),
    MBR_002(HttpStatus.CONFLICT, "MBR_002", "이미 워크스페이스에 속한 멤버입니다"),
    MBR_003(HttpStatus.NOT_FOUND, "MBR_003", "멤버를 찾을 수 없습니다"),
    MBR_004(HttpStatus.BAD_REQUEST, "MBR_004", "멤버 입력값이 유효하지 않습니다"),
    MBR_005(HttpStatus.NOT_FOUND, "MBR_005", "워크스페이스 또는 채널 또는 멤버를 찾을 수 없습니다"),
    MBR_006(HttpStatus.NOT_FOUND, "MBR_006", "초대를 찾을 수 없습니다"),
    MBR_007(HttpStatus.CONFLICT, "MBR_007", "초대 대기 중인 사용자입니다"),

    // BOARD
    BRD_001(HttpStatus.NOT_FOUND, "BRD_001", "보드를 찾을 수 없습니다"),
    BRD_002(HttpStatus.BAD_REQUEST, "BRD_002", "보드 입력값이 유효하지 않습니다"),
    BRD_003(HttpStatus.CONFLICT, "BRD_003", "이미 보드에 속한 멤버입니다"),
    BRD_004(HttpStatus.NOT_FOUND, "BRD_004", "태스크를 찾을 수 없습니다"),
    BRD_005(HttpStatus.NOT_FOUND, "BRD_005", "보드 멤버를 찾을 수 없습니다"),

    // FRIEND
    FRIEND_001(HttpStatus.BAD_REQUEST, "FRIEND_001", "자기 자신에게 친구 요청을 보낼 수 없습니다"),
    FRIEND_002(HttpStatus.CONFLICT,    "FRIEND_002", "이미 요청했거나 친구인 사용자입니다"),
    FRIEND_003(HttpStatus.NOT_FOUND,  "FRIEND_003", "존재하지 않는 친구 요청입니다"),
    FRIEND_004(HttpStatus.FORBIDDEN,  "FRIEND_004", "본인에게 온 요청이 아닙니다"),

    // USER
    USER_001(HttpStatus.NOT_FOUND, "USER_001", "해당 닉네임의 사용자를 찾을 수 없습니다"),
    USER_002(HttpStatus.CONFLICT, "USER_002", "이미 사용 중인 닉네임입니다");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
