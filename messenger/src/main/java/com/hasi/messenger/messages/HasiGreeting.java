package com.hasi.messenger.messages;

public class HasiGreetings {

    private String name;

    public HasiGreetings(){
    }

    public HasiGreetings(String name){
        this.name=name;
    }

    public String getName(){
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
