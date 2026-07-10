package com.hasi.service.auth;
import com.hasi.service.auth.dto.request.*;
import com.hasi.service.auth.dto.response.RegisterResponse;
import com.hasi.service.auth.dto.response.LoginResponse;
import com.hasi.service.auth.entity.User;
import com.hasi.service.auth.repository.UserRepository;
import com.hasi.service.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;

    // ① 회원가입
    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        // 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("AUTH_005");  // 나중에 커스텀 예외로 교체
        }

        // 비밀번호 bcrypt 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 유저 저장 (isEmailVerified = false)
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(encodedPassword)
                .nickname(request.getNickname())
                .isEmailVerified(false)
                .isActive(true)
                .isAdmin(false)
                .statusCode(User.StatusCode.online)
                .build();

        User savedUser = userRepository.save(user);

        // 6자리 인증코드 생성 + Redis 저장 (TTL 10분)
        String code = generateCode();
        redisTemplate.opsForValue()
                .set("email:verify:" + request.getEmail(), code, Duration.ofMinutes(10));

        // 이메일 발송 (개발 중엔 콘솔 출력)
        System.out.println("인증코드: " + code);  // 나중에 EmailVerifyService로 교체

        return new RegisterResponse("인증 이메일이 발송되었습니다.", savedUser.getUid());
    }

    // ② 이메일 인증코드 확인
    @Transactional
    public void emailVerify(EmailVerifyRequest request) {

        String key = "email:verify:" + request.getEmail();
        String savedCode = redisTemplate.opsForValue().get(key);

        // 코드 없거나 만료됐거나 틀리면
        if (savedCode == null || !savedCode.equals(request.getCode())) {
            throw new RuntimeException("VERIFY_001");
        }

        // 인증 성공 → isEmailVerified = true 업데이트
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("AUTH_001"));

        user.verifyEmail();  // User.java에 메서드 추가 필요
        redisTemplate.delete(key);  // Redis에서 코드 삭제
    }

    // ③ 로그인
    public LoginResponse login(LoginRequest request) {

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

        return new LoginResponse(accessToken, refreshToken, user);
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
    public void logout(LogoutRequest request) {
        redisTemplate.opsForValue()
                .set("BL:" + request.getRefreshToken(), "logout", Duration.ofDays(7));
    }

}
