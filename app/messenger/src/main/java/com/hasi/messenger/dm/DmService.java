package com.hasi.messenger.dm;

import com.hasi.messenger.directory.ServiceDirectory;
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
    private final ServiceDirectory serviceDirectory;

    public DmService(DirectMessageRepository messageRepository,
                     SimpMessagingTemplate messageTemplate,
                     ServiceDirectory serviceDirectory){
        this.messageRepository = messageRepository;
        this.messageTemplate = messageTemplate;
        this.serviceDirectory = serviceDirectory;
    }

    // 메시지 POST
    @Transactional
    public DmDtos.OutboundMessage createMessage(String sender, Long receiverId, String content){
        if (!serviceDirectory.userExists(receiverId)) {
            throw new IllegalArgumentException("Receiver not found: " + receiverId);
        }

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
                .findById(a, b, b, a)
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

    // 각자의 개인 큐(/user/queue/dm)로 전달합니다.
    private void broadcast(DmDtos.OutboundMessage outbound){
        messageTemplate.convertAndSendToUser(outbound.sender(), "/queue/dm", outbound);

        if (!outbound.sender().equals(outbound.receiver())) {
            messageTemplate.convertAndSendToUser(outbound.receiver(), "/queue/dm", outbound);
        }
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
