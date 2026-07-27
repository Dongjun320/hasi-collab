package com.hasi.messenger.presence;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

/**
 *
 * STOMP 연결로 presence 관리
 *
 * @author Jinwoo Jeong
 */
@Component
public class PresenceEventListener {

    private final PresenceService presenceService;

    public PresenceEventListener(PresenceService presenceService){
        this.presenceService = presenceService;
    }

    @EventListener
    public void onSessionConnected(SessionConnectedEvent event){
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = accessor.getUser();
        if (user == null) {
            return; // CONNECT 인증을 통과하지 못한 세션
        }
        presenceService.onConnect(accessor.getSessionId(), user.getName());
    }

    @EventListener
    public void onSessionDisconnect(SessionDisconnectEvent event){
        presenceService.onDisconnect(event.getSessionId());
    }
}
