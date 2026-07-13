package com.hasi.messenger.channel;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChannelController {

    private ChannelService channelService;

    @MessageMapping("/channel/{channelId}/send")
    public void send(@DestinationVariable Long channelId, @Payload ChannelDtos.IncomingMessage incomingMessage, Principal principal){
        String sender = principal.getName();
//        this.channelService.createMessage(channelId, sender, incomingMessage.content());
    }

    @MessageMapping("/channel/{channelId}/delete")
    public void delete(@DestinationVariable Long channelId, @Payload Long id, Principal principal){
        String sender = principal.getName();
//        this.channelService.deleteMessage(channelId, sender, id);
    }

    @MessageMapping("/channel/{channelId}/update")
    public void update(@DestinationVariable Long channelId, @Payload ChannelDtos.UpdateMessage updateMessage, Principal principal){
        String sender = principal.getName();
//        this.channelService.updateMessage(channelId, sender, incomingMessage.content());
    }
}
