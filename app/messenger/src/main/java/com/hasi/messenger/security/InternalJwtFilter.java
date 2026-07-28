package com.hasi.messenger.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Service -> Messenger 서버 간
 *
 * @author Jinwoo Jeong
 */
@Component
public class InternalJwtFilter extends OncePerRequestFilter {

    private static final String INTERNAL_PATH_PREFIX = "/messenger-api/internal/";
    private static final String BEARER_PREFIX = "Bearer ";

    private final InternalJwtProvider internalJwtProvider;

    public InternalJwtFilter(InternalJwtProvider internalJwtProvider){
        this.internalJwtProvider = internalJwtProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (request.getRequestURI().startsWith(INTERNAL_PATH_PREFIX)) {
            internalJwtProvider.resolveCaller(resolveToken(request)).ifPresent(caller -> {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                caller, null, List.of(new SimpleGrantedAuthority("ROLE_INTERNAL")));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request){
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith(BEARER_PREFIX)) {
            return bearer.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
