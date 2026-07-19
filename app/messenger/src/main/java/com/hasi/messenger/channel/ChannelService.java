package com.hasi.messenger.channel;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChannelService {

    private final ChannelMessageRepository messageRepository;
    private final SimpMessagingTemplate messageTemplate;

    public ChannelService(ChannelMessageRepository messageRepository, SimpMessagingTemplate messageTemplate){
        this.messageRepository = messageRepository;
        this.messageTemplate = messageTemplate;
    }

    // 메시지 POST
    @Transactional
    public ChannelDtos.OutboundMessage createMessage(Long channelId, String sender, String content){
        LocalDateTime now = LocalDateTime.now();

        ChannelMessage message = new ChannelMessage();
        message.setChannelId(channelId);
        message.setSenderId(Long.valueOf(sender));
        message.setContent(content);
        message.setCreatedAt(now);
        message.setUpdatedAt(now);

        ChannelMessage saved = messageRepository.save(message);
        ChannelDtos.OutboundMessage outbound = toOutbound(saved);
        broadcast(channelId, outbound);
        return outbound;
    }

    // 메시지 UPDATE
    @Transactional
    public ChannelDtos.OutboundMessage updateMessage(Long channelId, String sender, Long id, String content){
        ChannelMessage message = requireOwnedMessage(channelId, sender, id);
        message.setContent(content);
        message.setUpdatedAt(LocalDateTime.now());

        ChannelDtos.OutboundMessage outbound = toOutbound(message);
        broadcast(channelId, outbound);
        return outbound;
    }

    // 메시지 DELETE
    @Transactional
    public ChannelDtos.OutboundMessage deleteMessage(Long channelId, String sender, Long id){
        ChannelMessage message = requireOwnedMessage(channelId, sender, id);
        message.setIsDeleted(true);
        message.setDeletedAt(LocalDateTime.now());

        ChannelDtos.OutboundMessage outbound = toOutbound(message);
        broadcast(channelId, outbound);
        return outbound;
    }

    // 입장시 채널방 구성할 history 반환
    @Transactional(readOnly = true)
    public List<ChannelDtos.OutboundMessage> history(Long channelId){
        return messageRepository.findByChannelIdOrderByCreatedAtAsc(channelId).stream()
                .map(this::toOutbound)
                .toList();
    }

    private ChannelMessage requireOwnedMessage(Long channelId, String sender, Long id){
        ChannelMessage message = messageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Message not found: " + id));

        if (!message.getChannelId().equals(channelId)) {
            throw new IllegalArgumentException("Message " + id + " does not belong to channel " + channelId);
        }
        if (!message.getSenderId().equals(Long.valueOf(sender))) {
            throw new AccessDeniedException("Sender " + sender + " does not own message " + id);
        }
        return message;
    }

    private void broadcast(Long channelId, ChannelDtos.OutboundMessage outbound){
        messageTemplate.convertAndSend("/topic/channel." + channelId, outbound);
    }

    private ChannelDtos.OutboundMessage toOutbound(ChannelMessage message){
        return new ChannelDtos.OutboundMessage(
                message.getId(),
                message.getChannelId(),
                message.getIsDeleted() ? null : message.getContent(),
                message.getSenderId().toString(),
                message.getCreatedAt(),
                message.getIsDeleted()
        );
    }
}
