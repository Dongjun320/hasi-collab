package com.hasi.service.friend;

import com.hasi.collab.model.FriendResponse;
import com.hasi.service.auth.entity.User;
import com.hasi.service.auth.repository.UserRepository;
import com.hasi.service.common.ApiException;
import com.hasi.service.common.ErrorCode;
import com.hasi.service.friend.entity.Friend;
import com.hasi.service.friend.repository.FriendRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;

    // 친구 요청 보내기
    @Transactional
    public void sendRequest(Long senderId, Long receiverId) {

        if (senderId.equals(receiverId)) {
            throw new ApiException(ErrorCode.FRIEND_001); // 자기 자신 요청 불가
        }

        // 상대 유저 존재 확인
        userRepository.findById(receiverId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_001)); // 상대 유저 존재하지 않음

        Optional<Friend> existing = friendRepository
                .findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
                        senderId, receiverId, senderId, receiverId);

        // 이미 친구신청 혹은 친구관계인지 확인
        if (existing.isPresent()) {
            Friend friend = existing.get();

            if (friend.getStatus() == Friend.Status.REJECTED) {
                // 예전에 거절당했으면 재요청 가능하게 새로 세팅
                friend.resendAsSender(senderId, receiverId);
                return;
            }

            // PENDING이거나 ACCEPTED면 막기
            throw new ApiException(ErrorCode.FRIEND_002);
        }

        friendRepository.save(
                Friend.builder()
                        .senderId(senderId)
                        .receiverId(receiverId)
                        .status(Friend.Status.PENDING)
                        .build()
        );
    }

    // 친구 요청 수락
    @Transactional
    public void acceptRequest(Long userId, Long requestId) {
        Friend friend = friendRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(ErrorCode.FRIEND_003)); // 요청 없음

        if (!friend.getReceiverId().equals(userId)) {
            throw new ApiException(ErrorCode.FRIEND_004); // 본인에게 온 요청이 아님
        }

        friend.accept();
    }

    // 친구 요청 거절
    @Transactional
    public void rejectRequest(Long userId, Long requestId) {
        Friend friend = friendRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(ErrorCode.FRIEND_003));

        if (!friend.getReceiverId().equals(userId)) {
            throw new ApiException(ErrorCode.FRIEND_004);
        }

        friend.reject();
    }

    // 친구 삭제
    @Transactional
    public void removeFriend(Long userId, Long relationId) {
        Friend friend = friendRepository
                .findById(relationId)
                .orElseThrow(() -> new ApiException(ErrorCode.FRIEND_003));

        // 참여자 검증 - 본인이 sender나 receiver로 포함된 관계인지 확인
        if (!friend.getSenderId().equals(userId) && !friend.getReceiverId().equals(userId)) {
            throw new ApiException(ErrorCode.FRIEND_004);
        }

        friendRepository.deleteById(friend.getId());
    }

    // 받은 요청 목록
    public List<FriendResponse> getReceivedRequests(Long userId) {
        return friendRepository.findByReceiverIdAndStatus(userId, Friend.Status.PENDING)
                .stream()
                .map(f -> toResponse(f.getId(), f.getSenderId()))
                .collect(Collectors.toList());
    }

    // 보낸 요청 목록
    public List<FriendResponse> getSentRequests(Long userId) {
        return friendRepository.findBySenderIdAndStatus(userId, Friend.Status.PENDING)
                .stream()
                .map(f -> toResponse(f.getId(), f.getReceiverId()))
                .collect(Collectors.toList());
    }

    // 친구 목록 조회
    public List<FriendResponse> getFriends(Long userId) {
        return friendRepository.findBySenderIdAndStatusOrReceiverIdAndStatus(
                        userId, Friend.Status.ACCEPTED, userId, Friend.Status.ACCEPTED)
                .stream()
                .map(f -> {
                    Long friendUid = f.getSenderId().equals(userId) ? f.getReceiverId() : f.getSenderId();
                    return toResponse(f.getId(), friendUid);
                })
                .collect(Collectors.toList());
    }

    private FriendResponse toResponse(Long relationId, Long targetUserId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_001));

        return new FriendResponse()
                .id(relationId)               // 관계(요청) id
                .name(user.getNickname())
                .status(FriendResponse.StatusEnum.fromValue(user.getStatusCode().name()))
                .statusMessage(user.getStatusMessage());
    }
}