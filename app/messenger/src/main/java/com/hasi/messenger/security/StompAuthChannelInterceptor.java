package com.hasi.messenger.security;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String DM_TOPIC_PREFIX = "/topic/dm.";

    private final JwtProvider jwtProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            accessor = StompHeaderAccessor.wrap(message);
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            accessor.setUser(authenticate(accessor));
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            authorizeSubscribe(accessor);
        }

        return message;
    }

    private Authentication authenticate(StompHeaderAccessor accessor) {
        String token = resolveToken(accessor.getFirstNativeHeader("Authorization"));
        if (token == null || !jwtProvider.validateToken(token)) {
            throw new MessagingException("STOMP CONNECT rejected: missing or invalid JWT");
        }
        String userId = jwtProvider.getUserId(token);
        return new UsernamePasswordAuthenticationToken(userId, null, List.of());
    }

    private void authorizeSubscribe(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null || !destination.startsWith(DM_TOPIC_PREFIX)) {
            return; // channel topics: no membership data available here, see plan's known gaps
        }

        Principal principal = accessor.getUser();
        String uid = principal == null ? null : principal.getName();

        String[] participants = destination.substring(DM_TOPIC_PREFIX.length()).split("\\.");
        boolean isParticipant = participants.length == 2
                && (participants[0].equals(uid) || participants[1].equals(uid));

        if (!isParticipant) {
            throw new MessagingException("SUBSCRIBE rejected: not a participant of " + destination);
        }
    }

    private String resolveToken(String bearer) {
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
