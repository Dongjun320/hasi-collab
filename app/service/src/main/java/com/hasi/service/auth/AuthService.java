package com.hasi.service.auth;

import com.hasi.collab.model.*;
import com.hasi.service.auth.entity.SocialAccount;
import com.hasi.service.auth.entity.User;
import com.hasi.service.auth.repository.UserRepository;
import com.hasi.service.auth.repository.SocialAccountRepository;
import com.hasi.service.common.ApiException;
import com.hasi.service.common.ErrorCode;
import com.hasi.service.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final JavaMailSender javaMailSender;

    // 회원가입
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String verifiedKey = "email:verified:" + request.getEmail();
        boolean isVerified = "true".equals(redisTemplate.opsForValue().get(verifiedKey));

        // 이메일 인증 없이 가입 시도
        if (!isVerified) {
            throw new ApiException(ErrorCode.VERIFY_002);
        }
        // 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(ErrorCode.AUTH_005);
        }

        // 유저 저장 (isEmailVerified = false)
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .isEmailVerified(true)
                .isActive(true)
                .isAdmin(false)
                .statusCode(User.StatusCode.ONLINE)
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
            throw new ApiException(ErrorCode.VERIFY_001);
        }
        redisTemplate.opsForValue()
                .set("email:verified:" + request.getEmail(), "true", Duration.ofMinutes(10));
        redisTemplate.delete(key);

    }

    // 로그인
    public LogInResponse login(LogInRequest request) {
        // 이메일로 유저 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException(ErrorCode.AUTH_001);
        }

        // 이메일 인증 여부 확인
        if (!user.isEmailVerified()) {
            throw new ApiException(ErrorCode.AUTH_002);
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
                .createdAt(user.getCreatedAt().atOffset(ZoneOffset.UTC))
                .updatedAt(user.getUpdatedAt().atOffset(ZoneOffset.UTC));
        return new LogInResponse()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userData);
    }

    public LogInResponse extendSession(Long userId) {
        // 이메일로 유저 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        String newAccessToken = jwtProvider.generateToken(String.valueOf(user.getUid()));

        UserData userData = new UserData()
                .uid(user.getUid())
                .nickname(user.getNickname())
                .createdAt(user.getCreatedAt().atOffset(ZoneOffset.UTC))
                .updatedAt(user.getUpdatedAt().atOffset(ZoneOffset.UTC));
        return new LogInResponse()
                .accessToken(newAccessToken)
                .refreshToken(null)
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
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(request.getEmail());
        message.setSubject("[HASI] 이메일 인증 코드");
        message.setText("인증 코드: " + code + "\n\n10분 안에 입력해주세요.");
        javaMailSender.send(message);
    }

    // 비밀번호 재설정용 인증코드 발송
    public void emailSendForPasswordReset(EmailSendRequest request) {
        String code = generateCode();
        redisTemplate.opsForValue()
                .set("email:reset:" + request.getEmail(), code, Duration.ofMinutes(10));
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(request.getEmail());
        message.setSubject("[HASI] 비밀번호 재설정 코드");
        message.setText("비밀번호 재설정 코드: " + code + "\n\n10분 안에 입력해주세요.");
        javaMailSender.send(message);
    }

    // logout() - refreshToken 블랙리스트 등록
    public void logout(LogOutRequest request) {
        redisTemplate.opsForValue()
                .set("BL:" + request.getRefreshToken(), "logout", Duration.ofDays(7));
    }


    // 비밀번호 재설정 코드 확인만 (비밀번호 변경 X)
    public void emailVerifyForPWReset(String email, String code) {
        String savedCode = redisTemplate.opsForValue().get("email:reset:" + email);
        if (savedCode == null || !savedCode.equals(code)) {
            throw new ApiException(ErrorCode.VERIFY_001);
        }
        // 코드 확인 성공 플래그 저장 (5분)
        redisTemplate.opsForValue()
                .set("password:verified:" + email, "true", Duration.ofMinutes(5));
    }

    @Transactional
    public void resetPassword(String email, String newPassword) {

        // 코드 확인 완료 여부 체크
        String verified = redisTemplate.opsForValue().get("password:verified:" + email);
        if (!"true".equals(verified)) {
            throw new ApiException(ErrorCode.VERIFY_001);
        }

        // 유저 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        // 비밀번호 변경
        user.updatePassword(passwordEncoder.encode(newPassword));

        // Redis 코드 삭제
        redisTemplate.delete("email:reset:" + email);
    }

}
