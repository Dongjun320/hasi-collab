package com.hasi.service.auth.entity;

import com.hasi.service.friend.entity.Friend;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uid;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;   // 소셜 로그인 시 NULL 허용

    @Column(nullable = false, unique = true, length = 50)
    private String nickname;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(name = "status_message", length = 100)
    private String statusMessage;

    @Column(name = "language", length = 8)
    private String language;   // 선호 언어 (ko | ja), null이면 클라이언트 기본값(ko)

    @Column(name = "position", length = 50)
    private String position;

    @Column(name = "dept_id")
    private Long deptId;           // FK to Departments

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "is_admin", nullable = false)
    @Builder.Default
    private boolean isAdmin = false;

    @Column(name = "is_email_verified", nullable = false)
    @Builder.Default
    private boolean isEmailVerified = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void updatePassword(String encodedPassword) {
        this.passwordHash = encodedPassword;
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updateStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public void updateLanguage(String language) {
        this.language = language;
    }

    public void updateAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public void withdraw() {
        this.passwordHash = null;
        this.nickname = "탈퇴한 사용자_" + this.uid;
        this.avatarUrl = null;
        this.isActive = false;
    }

}