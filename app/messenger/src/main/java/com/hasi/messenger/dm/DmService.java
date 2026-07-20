package com.hasi.messenger.dm;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DmService {
    private final DirectMessageRepository messageRepository;
    private final SimpMessagingTemplate messageTemplate;

    public DmService(DirectMessageRepository messageRepository, SimpMessagingTemplate messageTemplate){
        this.messageRepository = messageRepository;
        this.messageTemplate = messageTemplate;
    }

    // 메시지 POST
    @Transactional
    public DmDtos.OutboundMessage createMessage(String sender, Long receiverId, String content){
        LocalDateTime now = LocalDateTime.now();

        DirectMessage message = new DirectMessage();
        message.setSenderId(Long.valueOf(sender));
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setCreatedAt(now);
        message.setUpdatedAt(now);

        DirectMessage saved = messageRepository.save(message);
        DmDtos.OutboundMessage outbound = toOutbound(saved);
        broadcast(outbound);
        return outbound;
    }

    // 메시지 UPDATE
    @Transactional
    public DmDtos.OutboundMessage updateMessage(String sender, Long id, String content){
        DirectMessage message = requireOwnedMessage(sender, id);
        message.setContent(content);
        message.setUpdatedAt(LocalDateTime.now());

        DmDtos.OutboundMessage outbound = toOutbound(message);
        broadcast(outbound);
        return outbound;
    }

    // 메시지 DELETE
    @Transactional
    public DmDtos.OutboundMessage deleteMessage(String sender, Long id){
        DirectMessage message = requireOwnedMessage(sender, id);
        message.setIsDeleted(true);
        message.setDeletedAt(LocalDateTime.now());

        DmDtos.OutboundMessage outbound = toOutbound(message);
        broadcast(outbound);
        return outbound;
    }

    // 입장시 DM방 구성할 history 반환
    @Transactional(readOnly = true)
    public List<DmDtos.OutboundMessage> history(String userA, String userB){
        Long a = Long.valueOf(userA);
        Long b = Long.valueOf(userB);
        return messageRepository
                .findByIds(a, b, b, a)
                .stream()
                .map(this::toOutbound)
                .toList();
    }

    private DirectMessage requireOwnedMessage(String sender, Long id){
        DirectMessage message = messageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Message not found: " + id));

        if (!message.getSenderId().equals(Long.valueOf(sender))) {
            throw new AccessDeniedException("Sender " + sender + " does not own message " + id);
        }
        return message;
    }

    private void broadcast(DmDtos.OutboundMessage outbound){
        long a = Long.parseLong(outbound.sender());
        long b = Long.parseLong(outbound.receiver());
        String topic = "/topic/dm." + Math.min(a, b) + "." + Math.max(a, b);
        messageTemplate.convertAndSend(topic, outbound);
    }

    private DmDtos.OutboundMessage toOutbound(DirectMessage message){
        return new DmDtos.OutboundMessage(
                message.getId(),
                message.getIsDeleted() ? null : message.getContent(),
                message.getSenderId().toString(),
                message.getReceiverId().toString(),
                message.getCreatedAt(),
                message.getIsDeleted()
        );
    }
}
