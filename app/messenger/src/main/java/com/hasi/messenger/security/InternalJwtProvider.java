package com.hasi.messenger.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * 서버 간(Service -> Messenger)
 *
 * @author Jinwoo Jeong
 */
@Component
public class InternalJwtProvider {

    public static final String SCOPE_CLAIM = "scope";
    public static final String INTERNAL_SCOPE = "internal";

    private final SecretKey key;
    private final String issuer;

    public InternalJwtProvider(@Value("${app.internal.jwt.secret}") String secret,
                              @Value("${app.internal.jwt.issuer}") String issuer){
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
    }


    public Optional<String> resolveCaller(String token){
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(issuer)
                    .require(SCOPE_CLAIM, INTERNAL_SCOPE)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return Optional.ofNullable(claims.getSubject()).filter(subject -> !subject.isBlank());
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
