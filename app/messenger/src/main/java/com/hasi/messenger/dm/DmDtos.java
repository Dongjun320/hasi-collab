package com.hasi.messenger.dm;

import java.time.LocalDateTime;

public class DmDtos {
    private DmDtos(){}

    public record IncomingMessage(String content) {
    }

    public record OutboundMessage(Long id, String content, String sender, String receiver,
                                  LocalDateTime createdAt, boolean isDeleted) {
    }

    public record UpdateMessage(String content, Long id) {
    }
}
