package com.hasi.messenger.messages;

import lombok.Getter;

@Getter
public class HasiGreeting {

    private String content;

    public HasiGreeting(){}

    public HasiGreeting(String content){
        this.content = content;
    }
}
