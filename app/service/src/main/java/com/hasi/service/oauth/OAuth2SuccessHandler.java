package com.hasi.service.oauth;

import com.hasi.service.auth.SocialAccountService;
import com.hasi.service.auth.entity.SocialAccount;
import com.hasi.service.auth.repository.SocialAccountRepository;
import com.hasi.service.jwt.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final SocialAccountRepository socialAccountRepository;
    private final JwtProvider jwtProvider;
    private final SocialAccountService socialAccountService;
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
            // 미연동 → 연동 코드를 발급해 프론트로 전달
            // 로그인 화면에서 온 것인지 설정창에서 온 것인지 서버는 알 수 없으므로,
            // 프론트가 JWT 보유 여부로 판단해 처리 (있으면 연동, 없으면 안내)
            String linkCode = socialAccountService.issueLinkCode(provider, providerId);
            String redirectUrl = "http://localhost:5173/oauth2/redirect?social=unlinked"
                    + "&provider=" + provider
                    + "&linkCode=" + linkCode;
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        }

    }
}
