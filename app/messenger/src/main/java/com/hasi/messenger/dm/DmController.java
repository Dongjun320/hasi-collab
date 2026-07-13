package com.hasi.messenger.dm;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class DmController {

    @MessageMapping("/dm/send")
    public void send(@Payload DmDtos.IncomingMessage incomingMessage, Principal principal){
        // TODO
        String sender = principal.getName();
//        DmService.createMessage();
    }

    @MessageMapping("/dm/{messageId}/delete")
    public void delete(@DestinationVariable String channelId, @Payload Long id, Principal principal){
        // TODO
        String sender = principal.getName();
//        DmService.deleteMessage();
    }

    @MessageMapping("/dm/{messageId}/update")
    public void update(@DestinationVariable String channelId, @Payload DmDtos.UpdateMessage updateMessage, Principal principal){
        // TODO
        String sender = principal.getName();
//        DmService.updateMessage();
    }
}
