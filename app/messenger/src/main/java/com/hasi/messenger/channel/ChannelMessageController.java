package com.hasi.messenger.channel;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/messenger-api/channels")
public class ChannelMessageController {

    private final ChannelService channelService;

    public ChannelMessageController(ChannelService channelService){
        this.channelService = channelService;
    }

    @GetMapping("/{channelId}/messages")
    public List<ChannelDtos.OutboundMessage> history(@PathVariable Long channelId, Principal principal){
        return channelService.history(channelId, principal.getName());
    }

    @GetMapping("/{channelId}/read-states")
    public List<ChannelDtos.ReadState> readStates(@PathVariable Long channelId, Principal principal){
        return channelService.readStates(channelId, principal.getName());
    }
}
