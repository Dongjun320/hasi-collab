package com.hasi.service.friend;

import com.hasi.collab.model.FriendResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    // 친구 목록 조회
    @GetMapping
    public ResponseEntity<List<FriendResponse>> getFriends(Authentication authentication) {
        Long userId = Long.valueOf((String) authentication.getPrincipal());
        return ResponseEntity.ok(friendService.getFriends(userId));
    }

    // 친구 추가
    @PostMapping("/requests/{receiverId}")
    public ResponseEntity<Void> sendRequest(
            Authentication authentication,
            @PathVariable Long receiverId) {
        Long userId = Long.valueOf((String) authentication.getPrincipal());
        friendService.sendRequest(userId, receiverId);
        return ResponseEntity.ok().build();
    }

    // 받은 요청 목록
    @GetMapping("/requests/received")
    public ResponseEntity<List<FriendResponse>> getReceivedRequests(Authentication authentication) {
        Long userId = Long.valueOf((String) authentication.getPrincipal());
        return ResponseEntity.ok(friendService.getReceivedRequests(userId));
    }

    // 보낸 요청 목록
    @GetMapping("/requests/sent")
    public ResponseEntity<List<FriendResponse>> getSentRequests(Authentication authentication) {
        Long userId = Long.valueOf((String) authentication.getPrincipal());
        return ResponseEntity.ok(friendService.getSentRequests(userId));
    }

    // 요청 수락
    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<Void> acceptRequest(
            Authentication authentication,
            @PathVariable Long requestId) {
        Long userId = Long.valueOf((String) authentication.getPrincipal());
        friendService.acceptRequest(userId, requestId);
        return ResponseEntity.ok().build();
    }

    // 요청 거절
    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<Void> rejectRequest(
            Authentication authentication,
            @PathVariable Long requestId) {
        Long userId = Long.valueOf((String) authentication.getPrincipal());
        friendService.rejectRequest(userId, requestId);
        return ResponseEntity.ok().build();
    }

    // 친구 삭제
    @DeleteMapping("/{relationId}")
    public ResponseEntity<Void> removeFriend(
            Authentication authentication,
            @PathVariable Long relationId) {
        Long userId = Long.valueOf((String) authentication.getPrincipal());
        friendService.removeFriend(userId, relationId);
        return ResponseEntity.ok().build();
    }
}