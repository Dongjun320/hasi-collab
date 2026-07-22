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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;

    // 친구 추가 (양방향 저장)
    @Transactional
    public void addFriend(Long userId, Long friendId) {

        if (userId.equals(friendId)) {
            throw new ApiException(ErrorCode.FRIEND_001); // 자기 자신 추가 불가
        }

        // 상대 유저 존재 확인
        userRepository.findById(friendId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        // 이미 친구인지 확인
        if (friendRepository.findByUserIdAndFriendId(userId, friendId).isPresent()) {
            throw new ApiException(ErrorCode.FRIEND_002); // 이미 친구임
        }

        // 양방향 저장
        friendRepository.save(Friend.builder().userId(userId).friendId(friendId).build());
        friendRepository.save(Friend.builder().userId(friendId).friendId(userId).build());
    }

    // 친구 삭제 (양방향 삭제)
    @Transactional
    public void removeFriend(Long userId, Long friendId) {
        friendRepository.deleteByUserIdAndFriendId(userId, friendId);
        friendRepository.deleteByUserIdAndFriendId(friendId, userId);
    }

    // 친구 목록 조회
    public List<FriendResponse> getFriends(Long userId) {
        List<Friend> friends = friendRepository.findByUserId(userId);

        return friends.stream()
                .map(f -> {
                    User friendUser = userRepository.findById(f.getFriendId())
                            .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));
                    return new FriendResponse()
                            .id(friendUser.getUid())
                            .name(friendUser.getNickname())
                            .status(FriendResponse.StatusEnum.fromValue(
                                    friendUser.getStatusCode().name()))
                            .statusMessage(friendUser.getStatusMessage());
                })
                .collect(Collectors.toList());
    }
}