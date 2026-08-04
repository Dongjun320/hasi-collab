package com.hasi.messenger.channel;

import java.time.LocalDateTime;

public final class ChannelDtos {

    private ChannelDtos(){}

    public record IncomingMessage(String content) {
    }

    public record OutboundMessage(Long id, Long channelId, String content, String sender,
                                  LocalDateTime createdAt, boolean isDeleted) {
    }

    public record UpdateMessage(String content, Long id) {
    }

    public record ReadReceipt(Long lastReadMessageId) {
    }

    public record ReadState(String userId, Long lastReadMessageId, LocalDateTime updatedAt) {
    }

    // 채널 삭제 정리 결과 (Service -> Messenger 내부 호출용)
    public record DeletedCounts(long messages, long readStates) {
    }
}

