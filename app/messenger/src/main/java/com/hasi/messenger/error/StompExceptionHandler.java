package com.hasi.messenger.error;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;

/**
 * @MessageMapping 핸들러에서 나간 예외를 클라이언트가 볼 수 있게 만듭니다.
 *
 * @author Jinwoo Jeong
 */
@ControllerAdvice
public class StompExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(StompExceptionHandler.class);

    @MessageExceptionHandler(AccessDeniedException.class)
    @SendToUser(destinations = "/queue/errors", broadcast = false)
    public StompErrorPayload handleAccessDenied(AccessDeniedException ex, Message<?> message) {
        String destination = destinationOf(message);
        log.warn("STOMP access denied: destination={} reason={}", destination, ex.getMessage());
        return StompErrorPayload.accessDenied(destination);
    }

    @MessageExceptionHandler(IllegalArgumentException.class)
    @SendToUser(destinations = "/queue/errors", broadcast = false)
    public StompErrorPayload handleInvalidRequest(IllegalArgumentException ex, Message<?> message) {
        String destination = destinationOf(message);
        log.warn("STOMP invalid request: destination={} reason={}", destination, ex.getMessage());
        return StompErrorPayload.invalidRequest(destination);
    }

    @MessageExceptionHandler(Exception.class)
    @SendToUser(destinations = "/queue/errors", broadcast = false)
    public StompErrorPayload handleUnexpected(Exception ex, Message<?> message) {
        String destination = destinationOf(message);
        log.error("STOMP handler failed: destination={}", destination, ex);
        return StompErrorPayload.internalError(destination);
    }

    private String destinationOf(Message<?> message) {
        return SimpMessageHeaderAccessor.getDestination(message.getHeaders());
    }
}
