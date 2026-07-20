package com.hasi.messenger.dm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * JPARepository를 extends한  Direct Message Repository
 * Message는 Entity, Long은 PK의 타입
 * @author Jinwoo Jeong
 */
public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {

    List<DirectMessage> findByIds(
            Long senderIdA, Long receiverIdA, Long senderIdB, Long receiverIdB);
}
