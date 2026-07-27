package com.hasi.messenger.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

/**
 * Service -> Messenger 서버 간 호출 인증.
 *
 * @author Jinwoo Jeong
 */
@Component
public class InternalTokenFilter extends OncePerRequestFilter {

    private static final String INTERNAL_PATH_PREFIX = "/messenger-api/internal/";
    private static final String HEADER = "Internal-Token";

    private final byte[] expectedToken;

    public InternalTokenFilter(@Value("${app.internal.token}") String internalToken){
        this.expectedToken = internalToken.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (request.getRequestURI().startsWith(INTERNAL_PATH_PREFIX) && tokenMatches(request.getHeader(HEADER))) {
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            "service", null, List.of(new SimpleGrantedAuthority("ROLE_INTERNAL")));

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    // 길이 차이로 시크릿이 새지 않도록 상수 시간 비교
    private boolean tokenMatches(String provided){
        if (provided == null) {
            return false;
        }
        return MessageDigest.isEqual(provided.getBytes(StandardCharsets.UTF_8), expectedToken);
    }
}
