package com.hasi.messenger.dm;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;


@Service
public class DmService {
    private DirectMessageRepository messageRepository;
    private SimpMessagingTemplate messageTemplate;

    public DmService(DirectMessageRepository messageRepository, SimpMessagingTemplate messageTemplate){
        this.messageRepository = messageRepository;
        this.messageTemplate = messageTemplate;
    }

    // 메시지 POST
//    @Transactional
//    public OutboundMessage createMessage(Long channelId, String sender, String content){
//
//    }

    // 메시지 UPDATE
//    @Transactional
//    public OutboundMessage updateMessage(Long channelId, String sender, String content){
//
//    }

    // 메시지 DELETE
//    @Transactional
//    public OutboundMessage deleteMessage(Long channelId, String sender, String content){
//
//    }

//    // 입장시 DM방 구성할 history 반환
//    @Transactional
//    public List<OutboundMessage> history(String userA, String userB){
//        //TODO
//    }
}
