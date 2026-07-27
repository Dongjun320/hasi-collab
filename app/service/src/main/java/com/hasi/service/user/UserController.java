package com.hasi.service.user;

import com.hasi.collab.model.UserData;
import com.hasi.collab.model.UserSearchResponse;
import com.hasi.collab.model.NicknameUpdateRequest;
import com.hasi.collab.model.StatusMessageUpdateRequest;
import com.hasi.collab.model.StatusUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<UserSearchResponse> searchUser(
            @RequestParam String nickname) {
        return ResponseEntity.ok(userService.searchByNickname(nickname));
    }

    @GetMapping("/me")
    public ResponseEntity<UserData> getMyInfo() {
        return ResponseEntity.ok(userService.getMyInfo());
    }

    @PatchMapping("/me/nickname")
    public ResponseEntity<Void> updateNickname(
            @Valid @RequestBody NicknameUpdateRequest request) {
        userService.updateNickname(request.getNickname());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/me/status-message")
    public ResponseEntity<Void> updateStatusMessage(
            @Valid @RequestBody StatusMessageUpdateRequest request) {
        userService.updateStatusMessage(request.getStatusMessage().orElse(null));
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/me/status")
    public ResponseEntity<Void> updateStatus(
            @Valid @RequestBody StatusUpdateRequest request) {
        userService.updateStatus(request.getStatusCode().getValue());
        return ResponseEntity.ok().build();
    }
}