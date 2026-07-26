package com.hasi.messenger.channel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * @author Jinwoo Jeong
 */
public interface ChannelReadStateRepository extends JpaRepository<ChannelReadState, Long> {

    /**
     * 커서를 앞으로만 옮기는 upsert.
     *
     * @return 갱신된 record 수
     */
    @Modifying
    @Query(value = """
            INSERT INTO channel_read_states (channel_id, user_id, last_read_message_id, updated_at)
            VALUES (:channelId, :userId, :messageId, :now)
            ON CONFLICT (channel_id, user_id) DO UPDATE
               SET last_read_message_id = EXCLUDED.last_read_message_id,
                   updated_at           = EXCLUDED.updated_at
             WHERE channel_read_states.last_read_message_id < EXCLUDED.last_read_message_id
            """, nativeQuery = true)
    int upsertIfNewer(@Param("channelId") Long channelId,
                      @Param("userId") Long userId,
                      @Param("messageId") Long messageId,
                      @Param("now") LocalDateTime now);

    List<ChannelReadState> findByChannelId(Long channelId);

    Optional<ChannelReadState> findByChannelIdAndUserId(Long channelId, Long userId);
}
