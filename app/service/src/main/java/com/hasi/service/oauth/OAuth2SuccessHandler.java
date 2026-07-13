package com.hasi.service.oauth;

import com.hasi.service.auth.entity.SocialAccount;
import com.hasi.service.auth.repository.SocialAccountRepository;
import com.hasi.service.jwt.JwtProvider;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final SocialAccountRepository socialAccountRepository;
    private final JwtProvider jwtProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String provider = (String) oAuth2User.getAttributes().get("provider");
        String providerId = (String) oAuth2User.getAttributes().get("providerId");

        // (provider, providerId)로 SocialAccount 조회
        Optional<SocialAccount> socialAccount =
                socialAccountRepository.findByProviderAndProviderId(provider, providerId);

        if (socialAccount.isPresent()) {
            // 이미 연동된 계정 → 바로 로그인
            Long uid = socialAccount.get().getUser().getUid();
            String accessToken  = jwtProvider.generateToken(String.valueOf(uid));
            String refreshToken = jwtProvider.generateRefreshToken(String.valueOf(uid));

            String redirectUrl = "http://localhost:5173/oauth2/redirect"
                    + "?token=" + accessToken
                    + "&refreshToken=" + refreshToken;
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);

        } else {
            // 처음 보는 계정 → 일반 가입 절차로 안내
            String redirectUrl = "http://localhost:5173/signup"
                    + "?reason=social_not_linked"
                    + "&provider=" + provider;
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        }

    }
}
