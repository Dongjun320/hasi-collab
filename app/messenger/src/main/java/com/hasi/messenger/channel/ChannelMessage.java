package com.hasi.messenger.channel;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * ChannelMessage Entity 입니다.
 * @author Jinwoo Jeong
 */
@Entity
@Table(name = "channel_messages")
@Getter
@Setter
@ToString
public class ChannelMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long channelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_msg_id")
    private ChannelMessage parentMessage;

    @Column(nullable = false)
    private Long senderId;

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
