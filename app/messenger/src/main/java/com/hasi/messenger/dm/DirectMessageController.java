package com.hasi.messenger.dm;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/messenger-api/dm")
public class DirectMessageController {

    private final DmService dmService;

    public DirectMessageController(DmService dmService){
        this.dmService = dmService;
    }

    @GetMapping("/{peerId}/messages")
    public List<DmDtos.OutboundMessage> history(@PathVariable Long peerId, Principal principal){
        String myId = principal.getName();
        return dmService.history(myId, peerId.toString());
    }
}
