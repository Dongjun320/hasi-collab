package com.hasi.service.auth.entity;

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

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_code", nullable = false)
    private StatusCode statusCode = StatusCode.online;

    @Column(name = "status_message", length = 100)
    private String statusMessage;

    @Column(name = "dnd_start_time")
    private LocalTime dndStartTime;

    @Column(name = "dnd_end_time")
    private LocalTime dndEndTime;

    @Column(name = "dept_id")
    private Long deptId;           // FK to Departments

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "is_admin", nullable = false)
    private boolean isAdmin = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // status_code ENUM 정의
    public enum StatusCode {
        online, away, busy, offline, outside, remote
    }
}