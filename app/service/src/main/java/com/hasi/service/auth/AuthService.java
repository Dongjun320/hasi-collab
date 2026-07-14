package com.hasi.service.auth;

import com.hasi.collab.model.RegisterRequest;
import com.hasi.collab.model.EmailSendRequest;
import com.hasi.collab.model.EmailVerifyRequest;
import com.hasi.collab.model.LogOutRequest;
import com.hasi.collab.model.LogInRequest;
import com.hasi.collab.model.LogInResponse;
import com.hasi.collab.model.RegisterResponse;
import com.hasi.collab.model.UserData;
import com.hasi.service.auth.entity.SocialAccount;
import com.hasi.service.auth.entity.User;
import com.hasi.service.auth.repository.UserRepository;
import com.hasi.service.auth.repository.SocialAccountRepository;
import com.hasi.service.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.ZoneOffset;

import java.time.Duration;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;

    // 회원가입
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String verifiedKey = "email:verified:" + request.getEmail();
        boolean isVerified = "true".equals(redisTemplate.opsForValue().get(verifiedKey));

        // 이메일 인증 없이 가입 시도
        if (!isVerified) {
            throw new RuntimeException("VERIFY_002"); // 이메일 인증 안 하고 가입 시도
        }
        // 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("AUTH_005");  // 나중에 커스텀 예외로 교체
        }

        // 유저 저장 (isEmailVerified = false)
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .isEmailVerified(false)
                .isActive(true)
                .isAdmin(false)
                .statusCode(User.StatusCode.online)
                .build();

        User savedUser = userRepository.save(user);
        redisTemplate.delete(verifiedKey);

        return new RegisterResponse()
                .message("회원가입이 완료되었습니다.")
                .userId(savedUser.getUid());
    }

    // 이메일 인증코드 확인
    @Transactional
    public void emailVerify(EmailVerifyRequest request) {

        String key = "email:verify:" + request.getEmail();
        String savedCode = redisTemplate.opsForValue().get(key);

        // 코드 없거나 만료됐거나 틀리면
        if (savedCode == null || !savedCode.equals(request.getCode())) {
            throw new RuntimeException("VERIFY_001");
        }
        redisTemplate.opsForValue()
                .set("email:verified:" + request.getEmail(), "true", Duration.ofMinutes(10));
        redisTemplate.delete(key);

    }

    // 로그인
    public LogInResponse login(LogInRequest request) {
        // 이메일로 유저 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("AUTH_001"));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("AUTH_001");
        }

        // 이메일 인증 여부 확인
        if (!user.isEmailVerified()) {
            throw new RuntimeException("AUTH_002");
        }

        // JWT 발급
        String accessToken = jwtProvider.generateToken(String.valueOf(user.getUid()));
        String refreshToken = jwtProvider.generateRefreshToken(String.valueOf(user.getUid()));

        // Refresh Token Redis 저장
        redisTemplate.opsForValue()
                .set("RT:" + user.getUid(), refreshToken, Duration.ofDays(7));

        UserData userData = new UserData()
                .uid(user.getUid())
                .nickname(user.getNickname())
                .createdAt(user.getCreatedAt().atOffset(ZoneOffset.UTC))   // ← 변환
                .updatedAt(user.getUpdatedAt().atOffset(ZoneOffset.UTC));  // ← 변환
        return new LogInResponse()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userData);
    }

    // 6자리 랜덤 코드 생성
    private String generateCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    // emailSend() - 인증코드 재발송
    public void emailSend(EmailSendRequest request) {
        String code = generateCode();
        redisTemplate.opsForValue()
                .set("email:verify:" + request.getEmail(), code, Duration.ofMinutes(10));
        System.out.println("인증코드: " + code); // 나중에 실제 메일 발송으로 교체
    }

    // logout() - refreshToken 블랙리스트 등록
    public void logout(LogOutRequest request) {
        redisTemplate.opsForValue()
                .set("BL:" + request.getRefreshToken(), "logout", Duration.ofDays(7));
    }

    // 소셜 계정 연동 (로그인된 상태에서 설정에서 호출)
    @Transactional
    public void linkSocialAccount(Long uid, String provider, String providerId) {

        // 이미 다른 유저가 연동한 소셜 계정인지 체크
        if (socialAccountRepository.findByProviderAndProviderId(provider, providerId).isPresent()) {
            throw new RuntimeException("AUTH_007"); // 이미 연동된 소셜 계정
        }

        User user = userRepository.findById(uid)
                .orElseThrow(() -> new RuntimeException("AUTH_001"));

        socialAccountRepository.save(
                SocialAccount.builder()
                        .user(user)
                        .provider(provider)
                        .providerId(providerId)
                        .build()
        );
    }

}
