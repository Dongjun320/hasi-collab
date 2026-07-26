package com.hasi.messenger.dm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * JPARepository를 extends한  Direct Message Repository
 * Message는 Entity, Long은 PK의 타입
 * @author Jinwoo Jeong
 */
public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {

    @Query("""
        SELECT m FROM DirectMessage m
        WHERE (m.senderId = :a AND m.receiverId = :b)
           OR (m.senderId = :b AND m.receiverId = :a)
        ORDER BY m.createdAt ASC
    """)
    List<DirectMessage> findConversation(@Param("a") Long userA, @Param("b") Long userB);
}
