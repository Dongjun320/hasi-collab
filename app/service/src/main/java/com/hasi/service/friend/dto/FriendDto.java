package com.hasi.service.friend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FriendDto {
    private Long id;
    private String name;
    private String status;
    private String statusMessage;
}