package com.hasi.service.friend;

import com.hasi.collab.model.*;
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
    @PostMapping("/{friendId}")
    public ResponseEntity<Void> addFriend(
            Authentication authentication,
            @PathVariable Long friendId) {
        Long userId = Long.valueOf((String) authentication.getPrincipal());
        friendService.addFriend(userId, friendId);
        return ResponseEntity.ok().build();
    }

    // 친구 삭제
    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(
            Authentication authentication,
            @PathVariable Long friendId) {
        Long userId = Long.valueOf((String) authentication.getPrincipal());
        friendService.removeFriend(userId, friendId);
        return ResponseEntity.ok().build();
    }
}