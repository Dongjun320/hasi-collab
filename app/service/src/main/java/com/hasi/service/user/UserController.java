package com.hasi.service.user;

import com.hasi.collab.model.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateAvatar(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateAvatar(file));
    }

    @DeleteMapping("/me/avatar/delete")
    public ResponseEntity<Void> deleteAvatar(){
        userService.deleteAvatar();
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{targetId}/memo")
    public ResponseEntity<Void> upsertMemo(
            @PathVariable Long targetId,
            @Valid @RequestBody MemoRequest request) {
        userService.upsertMemo(targetId, request.getContent());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{targetId}/memo")
    public ResponseEntity<MemoResponse> getMemo(@PathVariable Long targetId) {
        String content = userService.getMemo(targetId);
        return ResponseEntity.ok(new MemoResponse().content(content));
    }

    @DeleteMapping("/{targetId}/memo")
    public ResponseEntity<Void> deleteMemo(@PathVariable Long targetId) {
        userService.deleteMemo(targetId);
        return ResponseEntity.ok().build();
    }
}