package com.hasi.messenger.notification;

import com.fasterxml.jackson.annotation.JsonValue;

public enum NotificationType {

    MENTION("mention"),
    INVITE("invite"),
    FRIEND("friend"),
    SYSTEM("system"),
    MESSAGE("message");

    private final String wireName;

    NotificationType(String wireName){
        this.wireName = wireName;
    }

    @JsonValue
    public String wireName(){
        return wireName;
    }
}
