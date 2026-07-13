package com.hasi.service.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "social_accounts",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"provider", "provider_id"})  // (provider, providerId) 유니크
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SocialAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → User (한 소셜 계정은 항상 한 명의 유저에게만 연동)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String provider;          // google / line / amazon / twitter

    @Column(name = "provider_id", nullable = false, length = 255)
    private String providerId;        // 플랫폼이 주는 고유 id

    @Column(name = "access_token", length = 512)
    private String accessToken;       // 서버 내부용, API 응답에 절대 포함 금지

    @Column(name = "refresh_token", length = 512)
    private String refreshToken;      // nullable - 플랫폼마다 발급 여부 다름

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;  // OAuth 플랫폼이 주는 값

    @Column(length = 255)
    private String scope;

}
