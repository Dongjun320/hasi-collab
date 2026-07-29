package com.hasi.messenger.notification;

import java.time.LocalDateTime;
import java.util.Map;

public final class NotificationDtos {

    private NotificationDtos(){}

    public record Outbound(Long id,
                           NotificationType type,
                           Long actorId,
                           Long subjectId,
                           Long workspaceId,
                           Map<String, Object> payload,
                           boolean unread,
                           boolean resolved,
                           LocalDateTime createdAt) {
    }

    public record NewNotification(Long recipientId,
                                  NotificationType type,
                                  Long actorId,
                                  Long subjectId,
                                  Long workspaceId,
                                  Map<String, Object> payload,
                                  String dedupKey) {
    }

    public record UnreadCount(long unreadCount) {
    }

    public record CreateResult(Outbound notification, boolean created) {
    }
}
