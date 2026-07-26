package com.hasi.messenger.channel;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * 채널 멤버별 마지막 읽은 메시지 커서.
 *
 * @author Jinwoo Jeong
 */
@Entity
@Table(name = "channel_read_states",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_channel_read_states_channel_user",
                columnNames = {"channel_id", "user_id"}))
@Getter
@Setter
@ToString
public class ChannelReadState {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "channel_id", nullable = false)
    private Long channelId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "last_read_message_id", nullable = false)
    private Long lastReadMessageId;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
