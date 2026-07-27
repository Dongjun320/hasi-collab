package com.hasi.messenger.presence;

import java.time.LocalDateTime;
import java.util.List;

public final class PresenceDtos {

    private PresenceDtos(){}

    // /topic/presence 로 나가는 상태 알림.
    public record PresenceEvent(String userId, boolean online, LocalDateTime updatedAt) {
    }

    public record PresenceSnapshot(List<String> onlineUserIds) {
    }
}
