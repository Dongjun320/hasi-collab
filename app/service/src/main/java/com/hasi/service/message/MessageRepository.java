package com.hasi.service.message;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * JPARepository를 extends한  Message Repository
 * Message는 Entity, Long은 PK의 타입
 * @author Jinwoo Jeong
 */
public interface MessageRepository extends JpaRepository<Message, Long> {
    // save(), findByID(), findAll(), delete(), count(), existsByID() 자동제공
}
