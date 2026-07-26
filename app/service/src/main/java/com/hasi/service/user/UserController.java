package com.hasi.service.user;

import com.hasi.collab.model.UserData;
import com.hasi.collab.model.UserSearchResponse;
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
}