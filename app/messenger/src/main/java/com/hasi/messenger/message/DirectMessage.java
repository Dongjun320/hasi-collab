package com.hasi.messenger.message;

import jakarta.persistence.*;

import java.time.LocalDateTime;

public class DirectMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_msg_id")
    private ChannelMessage parentMessage;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false)
    private Long receiverId;

    @Column(nullable = false)
    private Boolean isDeleted = false;

    private LocalDateTime deletedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

}
