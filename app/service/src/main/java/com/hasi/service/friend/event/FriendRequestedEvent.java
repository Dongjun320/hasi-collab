package com.hasi.service.friend.event;

public record FriendRequestedEvent(
        Long friendRelationId,   // friends.id → subjectId로 사용
        Long receiverId,          // 알림 받을 사람 (recipientId)
        Long senderId,            // 요청 보낸 사람 (actorId)
        String senderNickname     // payload에 넣을 발신자 닉네임
) {}
