package com.hasi.service.auth;

import com.hasi.collab.model.SocialAccountResponse;
import com.hasi.service.auth.entity.SocialAccount;
import com.hasi.service.auth.entity.User;
import com.hasi.service.auth.repository.SocialAccountRepository;
import com.hasi.service.auth.repository.UserRepository;
import com.hasi.service.common.ApiException;
import com.hasi.service.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.ZoneOffset;
import java.util.UUID;

// 소셜 계정 연동 전담.
// AuthService에 두면 PasswordEncoder(SecurityConfig) 의존 때문에
// OAuth2SuccessHandler → AuthService → SecurityConfig → OAuth2SuccessHandler 순환이 생겨 분리함
@Service
@RequiredArgsConstructor
public class SocialAccountService {

    private final SocialAccountRepository socialAccountRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;

    // 소셜 계정 연동 (OAuth2SuccessHandler에서 호출 — SecurityContext가 비어 있어 uid를 받음)
    @Transactional
    public void linkSocialAccount(Long uid, String provider, String providerId) {
        // 이미 다른 유저가 연동한 소셜 계정인지
        if (socialAccountRepository.findByProviderAndProviderId(provider, providerId).isPresent()) {
            throw new ApiException(ErrorCode.AUTH_007);
        }
        // 이 유저가 이미 다른 소셜을 연동했는지 (계정당 1개)
        if (socialAccountRepository.findByUserUid(uid).isPresent()) {
            throw new ApiException(ErrorCode.AUTH_008);
        }

        User user = userRepository.findById(uid)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        socialAccountRepository.save(
                SocialAccount.builder()
                        .user(user)
                        .provider(provider)
                        .providerId(providerId)
                        .build()
        );
    }

    // 내 소셜 연동 조회 (없으면 null)
    public SocialAccountResponse getSocialAccount() {
        return socialAccountRepository.findByUserUid(getCurrentUserId())
                .map(sa -> new SocialAccountResponse()
                        .provider(SocialAccountResponse.ProviderEnum.fromValue(sa.getProvider()))
                        .linkedAt(sa.getCreatedAt().atOffset(ZoneOffset.UTC)))
                .orElse(null);
    }

    @Transactional
    public void unlinkSocialAccount() {
        SocialAccount sa = socialAccountRepository.findByUserUid(getCurrentUserId())
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_009));
        socialAccountRepository.delete(sa);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ApiException(ErrorCode.AUTH_003);
        }
        return Long.valueOf(authentication.getName());
    }

    // OAuth 성공 시점엔 우리 서비스 사용자가 누구인지 모름.
    // 소셜 정보를 Redis에 잠깐 보관하고 1회용 코드를 발급 (이메일 인증과 같은 패턴)
    public String issueLinkCode(String provider, String providerId) {
        String code = UUID.randomUUID().toString().replace("-", "");
        redisTemplate.opsForValue()
                .set("social:link:" + code, provider + ":" + providerId, Duration.ofMinutes(5));
        return code;
    }

    // 프론트가 JWT를 달고 호출 — 이제 uid를 알 수 있으므로 실제 연동 수행
    @Transactional
    public void linkByCode(String code) {
        String key = "social:link:" + code;
        String value = redisTemplate.opsForValue().get(key);
        if (value == null) {
            throw new ApiException(ErrorCode.AUTH_010);
        }
        redisTemplate.delete(key);   // 1회용

        int sep = value.indexOf(':');
        String provider = value.substring(0, sep);
        String providerId = value.substring(sep + 1);

        linkSocialAccount(getCurrentUserId(), provider, providerId);
    }
}