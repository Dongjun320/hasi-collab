package com.hasi.service.common;

import lombok.Getter;

/**
 * 비즈니스 로직에서 던지는 커스텀 예외
 * 사용 예: throw new ApiException(ErrorCode.AUTH_001);
 */
@Getter
public class ApiException extends RuntimeException {

    private final ErrorCode errorCode;

    public ApiException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
