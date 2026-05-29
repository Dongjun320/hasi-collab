package com.hasi.service.oauth;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class OAuthAttributes {

    private String providerId;
    private String provider;
    private String name;
    private String email;

    public static OAuthAttributes of(String provider, Map<String, Object> attrs) {
        return switch (provider) {
            case "google" -> ofGoogle(attrs);
            case "line" -> ofLine(attrs);
            case "twitter" -> ofTwitter(attrs);
            case "amazon" -> ofAmazon(attrs);
            default -> throw new IllegalArgumentException("Unknown provider " + provider);
        };
    }

    private static OAuthAttributes ofGoogle(Map<String, Object> attrs) {
        return OAuthAttributes.builder()
                .providerId((String) attrs.get("sub"))
                .provider("google")
                .name((String) attrs.get("name"))
                .email((String) attrs.get("email"))
                .build();
    }

    private static OAuthAttributes ofLine(Map<String, Object> attrs) {
        return OAuthAttributes.builder()
                .providerId((String) attrs.get("userId"))
                .provider("line")
                .name((String) attrs.get("displayName"))
                .email(null)
                .build();
    }

    @SuppressWarnings("unchecked")
    private static OAuthAttributes ofTwitter(Map<String, Object> attrs) {
        Map<String, Object> data = (Map<String, Object>) attrs.get("data");
        return OAuthAttributes.builder()
                .providerId((String) data.get("id"))
                .provider("twitter")
                .name((String) data.get("name"))
                .email(null)
                .build();
    }

    private static OAuthAttributes ofAmazon(Map<String, Object> attrs) {
        return OAuthAttributes.builder()
                .providerId((String) attrs.get("user_id"))
                .provider("amazon")
                .name((String) attrs.get("name"))
                .email((String) attrs.get("email"))
                .build();
    }
}

