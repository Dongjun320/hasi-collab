package com.hasi.messenger.error;

/**
 * /user/queue/errors에 클라이언트 별로 가는 에러
 *
 * @author Jinwoo Jeong
 */
public record StompErrorPayload(String code, String message, String destination) {

    public static StompErrorPayload accessDenied(String destination) {
        return new StompErrorPayload("ACCESS_DENIED", "Access denied.", destination);
    }

    public static StompErrorPayload invalidRequest(String destination) {
        return new StompErrorPayload("INVALID_REQUEST", "Invalid request.", destination);
    }

    public static StompErrorPayload internalError(String destination) {
        return new StompErrorPayload("INTERNAL_ERROR", "Internal error.", destination);
    }
}
