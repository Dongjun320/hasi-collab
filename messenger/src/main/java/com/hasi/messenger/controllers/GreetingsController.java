package com.hasi.messenger.controllers;

import com.hasi.messenger.messages.HasiGreeting;
import com.hasi.messenger.messages.HelloMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

@Controller
public class GreetingsController {

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public HasiGreeting greeting(HelloMessage message) throws Exception {
        Thread.sleep(1000);
        return new HasiGreeting("안녕하세요, " + HtmlUtils.htmlEscape(message.getName()) + "!");
    }
}
