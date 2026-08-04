package com.hasi.service.friend.repository;

import com.hasi.service.friend.entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Long> {

    // 특정 방향의 요청 조회 (A→B)
    Optional<Friend> findBySenderIdAndReceiverId(Long senderId, Long receiverId);

    // 양방향 아무 관계나 존재하는지 확인 (A-B든 B-A든)
    Optional<Friend> findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
            Long senderId1, Long receiverId1, Long senderId2, Long receiverId2);

    // 내가 받은 대기중 요청 목록
    List<Friend> findByReceiverIdAndStatus(Long receiverId, Friend.Status status);

    // 내가 보낸 대기중 요청 목록
    List<Friend> findBySenderIdAndStatus(Long senderId, Friend.Status status);

    // 친구 목록 (내가 sender든 receiver든 ACCEPTED인 것)
    List<Friend> findBySenderIdAndStatusOrReceiverIdAndStatus(
            Long senderId, Friend.Status status1, Long receiverId, Friend.Status status2);

    Optional<Friend> findById(Long id);

    void deleteById(Long id);
}