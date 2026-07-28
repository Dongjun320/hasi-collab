package com.hasi.service.auth;

import com.hasi.collab.api.AuthApi;
import com.hasi.collab.model.*;
import com.hasi.service.jwt.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@RestController
@RequiredArgsConstructor
public class AuthController implements AuthApi {

    private final AuthService authService;
    private final SocialAccountService socialAccountService;
    private final JwtProvider jwtProvider;

    // 회원가입 (선 이메일 인증 필요)
    @Override
    public ResponseEntity<RegisterResponse> register(RegisterRequest registerRequest) {
        RegisterResponse response = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 이메일 인증코드 발송
    @Override
    public ResponseEntity<Void> emailSend(EmailSendRequest emailSendRequest) {
        authService.emailSend(emailSendRequest);
        return ResponseEntity.ok().build();
    }

    // 비밀번호 찾기 전용 인증코드 발송
    @Override
    public ResponseEntity<Void> passwordSend(EmailSendRequest emailSendRequest) {
        authService.emailSendForPasswordReset(emailSendRequest);
        return ResponseEntity.ok().build();
    }

    // 이메일 인증코드 확인
    public ResponseEntity<Void> emailVerify(EmailVerifyRequest emailVerifyRequest) {
        authService.emailVerify(emailVerifyRequest);
        return ResponseEntity.ok().build();
    }

    // 비밀번호 재설정 코드 확인
    @Override
    public ResponseEntity<Void> passwordVerify(EmailVerifyRequest emailVerifyRequest) {
        authService.emailVerifyForPWReset(emailVerifyRequest.getEmail(), emailVerifyRequest.getCode());
        return ResponseEntity.ok().build();
    }

    // 로그인
    @Override
    public ResponseEntity<LogInResponse> login(LogInRequest logInRequest) {
        LogInResponse response = authService.login(logInRequest);
        return ResponseEntity.ok(response);
    }

    // 로그아웃
    @Override
    public ResponseEntity<Void> logout(LogOutRequest logOutRequest) {
        HttpServletRequest httpRequest =
                ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                        .getRequest();

        String accessToken = jwtProvider.resolveToken(httpRequest);

        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        authService.logout(accessToken, logOutRequest);
        return ResponseEntity.ok().build();
    }

    // 로그인 중인 사용자의 패스워드 변경
    @Override
    public ResponseEntity<Void> changePassword(PasswordChangeRequest passwordChangeRequest) {
        Long userId = getCurrentUserId();
        authService.changePassword(userId, passwordChangeRequest.getCurrentPassword(),
                passwordChangeRequest.getNewPassword());
        return ResponseEntity.ok().build();
    }

    // 비밀번호 찾기 이메일 인증코드 확인 및 패스워드 변경
    @Override
    public ResponseEntity<Void> resetPassword(PasswordResetRequest passwordResetRequest) {
        authService.resetPassword(passwordResetRequest.getEmail(), passwordResetRequest.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<GetSocialAccount200Response> getSocialAccount() {
        GetSocialAccount200Response body = new GetSocialAccount200Response()
                .success(true)
                .data(socialAccountService.getSocialAccount());
        return ResponseEntity.ok(body);
    }

    @Override
    public ResponseEntity<Void> unlinkSocialAccount() {
        socialAccountService.unlinkSocialAccount();
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Void> linkSocialAccount(SocialLinkRequest socialLinkRequest) {
        socialAccountService.linkByCode(socialLinkRequest.getCode());
        return ResponseEntity.ok().build();
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return Long.valueOf((String) authentication.getPrincipal());
    }

    @PostMapping("/api/auth/extend")
    public ResponseEntity<LogInResponse> extendSession(Authentication authentication) {
        Long userId = Long.valueOf((String) authentication.getPrincipal());
        return ResponseEntity.ok(authService.extendSession(userId));
    }
}