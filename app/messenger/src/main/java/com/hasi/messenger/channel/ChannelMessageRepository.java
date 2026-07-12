package com.hasi.messenger.channel;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * JPARepository를 extends한  Channel Message Repository
 * Message는 Entity, Long은 PK의 타입
 * @author Jinwoo Jeong
 */
public interface ChannelMessageRepository extends JpaRepository<ChannelMessage, Long> {
    // save(), findByID(), findAll(), delete(), count(), existsByID() 자동제공
}
