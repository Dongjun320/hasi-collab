package com.hasi.messenger.messages;

public class GreetMessage {
    private String name;

    public GreetMessage(){
    }

    public GreetMessage(String name){
        this.name=name;
    }

    public String getName(){
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
