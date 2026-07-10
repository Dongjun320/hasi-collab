package com.hasi.service.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class LogoutRequest {

    @NotBlank(message = "refreshToken은 필수입니다.")
    private String refreshToken;
}