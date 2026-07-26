package com.hasi.messenger.channel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * JPARepository를 extends한  Channel Message Repository
 * Message는 Entity, Long은 PK의 타입
 * @author Jinwoo Jeong
 */
public interface ChannelMessageRepository extends JpaRepository<ChannelMessage, Long> {
    // save(), findByID(), findAll(), delete(), count(), existsByID() 자동제공

    List<ChannelMessage> findByChannelIdOrderByCreatedAtAsc(Long channelId);

    boolean existsByIdAndChannelId(Long id, Long channelId);

    @Query("""
            SELECT count(m) FROM ChannelMessage m
            WHERE m.channelId = :channelId
              AND m.id > :lastReadId
              AND m.senderId <> :userId
              AND m.isDeleted = false
            """)
    long countUnread(@Param("channelId") Long channelId,
                     @Param("userId") Long userId,
                     @Param("lastReadId") Long lastReadId);
}
