package com.hasi.service.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
public class InternalJwtProvider {

    public static final String SCOPE_CLAIM = "scope";
    public static final String INTERNAL_SCOPE = "internal";

    // 호출한 쪽을 messenger 로그에 남기기 위한 sub 값
    private static final String CALLER = "service";

    private final SecretKey key;
    private final String issuer;
    private final long ttlSeconds; // 토큰 만료 초

    public InternalJwtProvider(@Value("${app.internal.jwt.secret}") String secret,
                               @Value("${app.internal.jwt.issuer}") String issuer,
                               @Value("${app.internal.jwt.ttl-seconds}") long ttlSeconds) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.ttlSeconds = ttlSeconds;
    }

    // 내부 호출용 토큰 발급
    public String issue() {
        Instant now = Instant.now();

        return Jwts.builder()
                .issuer(issuer)
                .subject(CALLER)
                .claim(SCOPE_CLAIM, INTERNAL_SCOPE)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(key)
                .compact();
    }
}
