package com.hasi.service.auth.dto.response;

import com.hasi.service.auth.entity.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private UserData user;

    public LoginResponse(String accessToken, String refreshToken, User user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = new UserData(user);
    }

    @Getter
    public static class UserData {
        private Long uid;
        private String nickname;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public UserData(User user) {
            this.uid = user.getUid();
            this.nickname = user.getNickname();
            this.createdAt = user.getCreatedAt();
            this.updatedAt = user.getUpdatedAt();
        }
    }
}