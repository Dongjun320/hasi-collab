package com.hasi.messenger.security;

import com.hasi.messenger.directory.ServiceDirectory;
import com.hasi.messenger.error.StompErrorPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * STOMP CONNECT 인증과 SUBSCRIBE
 *
 * @author Jinwoo Jeong
 */
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(StompAuthChannelInterceptor.class);

    private static final Pattern CHANNEL_TOPIC = Pattern.compile("^/topic/channel\\.(\\d+)(\\.read)?$");

    private static final Pattern WORKSPACE_PRESENCE_TOPIC = Pattern.compile("^/topic/workspace\\.(\\d+)\\.presence$");

    private static final Set<String> USER_DESTINATIONS =
            Set.of("/user/queue/dm", "/user/queue/errors", "/user/queue/presence",
                    "/user/queue/notifications");

    private final JwtProvider jwtProvider;
    private final ServiceDirectory serviceDirectory;
    private final SimpMessagingTemplate messagingTemplate;

    public StompAuthChannelInterceptor(JwtProvider jwtProvider,
                                       ServiceDirectory serviceDirectory,
                                       @Lazy SimpMessagingTemplate messagingTemplate) {
        this.jwtProvider = jwtProvider;
        this.serviceDirectory = serviceDirectory;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            accessor = StompHeaderAccessor.wrap(message);
        }

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            accessor.setUser(authenticate(accessor));
            return message;
        }

        // STOMP Error 프레임은 연결 자체를 끊어서 x
        if (StompCommand.SUBSCRIBE.equals(command) && !isSubscriptionAllowed(accessor)) {
            return null;
        }

        return message;
    }

    private boolean isSubscriptionAllowed(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        Principal user = accessor.getUser();

        if (destination == null || user == null) {
            denySubscription(user, destination);
            return false;
        }

        if (USER_DESTINATIONS.contains(destination)) {
            return true;
        }

        Matcher matcher = CHANNEL_TOPIC.matcher(destination);
        if (matcher.matches() && serviceDirectory.isChannelMember(parseUserId(matcher.group(1)), parseUserId(user.getName()))) {
            return true;
        }

        Matcher presenceMatcher = WORKSPACE_PRESENCE_TOPIC.matcher(destination);
        if (presenceMatcher.matches()
                && serviceDirectory.isWorkspaceMember(parseUserId(presenceMatcher.group(1)), parseUserId(user.getName()))) {
            return true;
        }

        denySubscription(user, destination);
        return false;
    }

    private Long parseUserId(String value) {
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private void denySubscription(Principal user, String destination) {
        log.warn("STOMP SUBSCRIBE denied: user={} destination={}",
                user == null ? "<anonymous>" : user.getName(), destination);

        if (user == null) {
            return;
        }
        messagingTemplate.convertAndSendToUser(
                user.getName(),
                "/queue/errors",
                StompErrorPayload.accessDenied(destination));
    }

    private Authentication authenticate(StompHeaderAccessor accessor) {
        String token = resolveToken(accessor.getFirstNativeHeader("Authorization"));
        if (token == null || !jwtProvider.validateToken(token)) {
            throw new MessagingException("STOMP CONNECT rejected: missing or invalid JWT");
        }
        String userId = jwtProvider.getUserId(token);
        return new UsernamePasswordAuthenticationToken(userId, null, List.of());
    }

    private String resolveToken(String bearer) {
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
