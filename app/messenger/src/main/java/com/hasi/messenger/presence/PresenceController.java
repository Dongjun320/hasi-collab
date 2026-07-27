package com.hasi.messenger.presence;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

/**
 * 입장 시 초기 상태 스냅샷.
 *
 * @author Jinwoo Jeong
 */
@RestController
@RequestMapping("/messenger-api/presence")
public class PresenceController {

    private final PresenceService presenceService;

    public PresenceController(PresenceService presenceService){
        this.presenceService = presenceService;
    }

    // request가 봐야하는 유저만
    @GetMapping
    public PresenceDtos.PresenceSnapshot online(@RequestParam List<String> userIds, Principal principal){
        return new PresenceDtos.PresenceSnapshot(
                presenceService.onlineVisibleTo(principal.getName(), userIds));
    }
}
