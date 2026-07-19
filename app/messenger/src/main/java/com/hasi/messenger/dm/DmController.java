package com.hasi.messenger.dm;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class DmController {

    private final DmService dmService;

    public DmController(DmService dmService){
        this.dmService = dmService;
    }

    @MessageMapping("/dm/send")
    public void send(@Payload DmDtos.IncomingMessage incomingMessage, Principal principal){
        String sender = principal.getName();
        dmService.createMessage(sender, incomingMessage.receiverId(), incomingMessage.content());
    }

    @MessageMapping("/dm/{messageId}/delete")
    public void delete(@DestinationVariable Long messageId, @Payload Long id, Principal principal){
        String sender = principal.getName();
        dmService.deleteMessage(sender, id);
    }

    @MessageMapping("/dm/{messageId}/update")
    public void update(@DestinationVariable Long messageId, @Payload DmDtos.UpdateMessage updateMessage, Principal principal){
        String sender = principal.getName();
        dmService.updateMessage(sender, updateMessage.id(), updateMessage.content());
    }
}
