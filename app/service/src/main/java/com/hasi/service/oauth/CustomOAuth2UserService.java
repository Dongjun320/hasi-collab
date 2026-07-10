package com.hasi.service.oauth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {

        String provider = request.getClientRegistration().getRegistrationId();

        OAuth2User oAuth2User;

        oAuth2User = new DefaultOAuth2UserService().loadUser(request);


        // 플랫폼별 응답 파싱
        OAuthAttributes attributes = OAuthAttributes.of(provider, oAuth2User.getAttributes());

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of(
                        "providerId", attributes.getProviderId(),
                        "provider",   attributes.getProvider(),
                        "name",       attributes.getName() != null ? attributes.getName() : "",
                        "email",      attributes.getEmail() != null ? attributes.getEmail() : ""
                ),
                "providerId"
        );
    }
}