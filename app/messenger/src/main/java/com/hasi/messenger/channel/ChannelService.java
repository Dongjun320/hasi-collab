package com.hasi.messenger.channel;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class ChannelService {

    private ChannelMessageRepository messageRepository;
    private SimpMessagingTemplate messageTemplate;

    public ChannelService(ChannelMessageRepository messageRepository, SimpMessagingTemplate messageTemplate){
        this.messageRepository = messageRepository;
        this.messageTemplate = messageTemplate;
    }

//    // 메시지 POST
//    @Transactional
//    public ChannelDtos.OutboundMessage createMessage(Long channelId, String sender, String content){
//    }

    // 메시지 UPDATE
//    @Transactional
//    public OutboundMessage updateMessage(Long channelId, String sender, String content){
//
//    }

    // 메시지 DELETE
//    @Transactional
//    public OutboundMessage deleteMessage(Long channelId, String sender, Long Id){
//
//    }

//    // 입장시 채널방 구성할 history 반환
//    @Transactional
//    public List<OutboundMessage> history(Long channelId){
//        //TODO
//    }
}
