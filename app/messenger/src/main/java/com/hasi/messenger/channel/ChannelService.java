package com.hasi.messenger.channel;

import com.hasi.messenger.directory.ServiceDirectory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChannelService {

    private final ChannelMessageRepository messageRepository;
    private final ChannelReadStateRepository readStateRepository;
    private final SimpMessagingTemplate messageTemplate;
    private final ServiceDirectory serviceDirectory;

    public ChannelService(ChannelMessageRepository messageRepository,
                          ChannelReadStateRepository readStateRepository,
                          SimpMessagingTemplate messageTemplate,
                          ServiceDirectory serviceDirectory){
        this.messageRepository = messageRepository;
        this.readStateRepository = readStateRepository;
        this.messageTemplate = messageTemplate;
        this.serviceDirectory = serviceDirectory;
    }

    // 메시지 POST
    @Transactional
    public ChannelDtos.OutboundMessage createMessage(Long channelId, String sender, String content){
        requireMembership(channelId, sender);
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
    public List<ChannelDtos.OutboundMessage> history(Long channelId, String requester){
        requireMembership(channelId, requester);
        return messageRepository.findByChannelIdOrderByCreatedAtAsc(channelId).stream()
                .map(this::toOutbound)
                .toList();
    }

    // 읽음 커서 갱신. 클라이언트가 "어디까지 봤는지"를 보내고 서버는 검증만 합니다.
    // (전달됐다 != 읽었다 이므로 서버가 스스로 알아낼 수 있는 값이 아닙니다)
    @Transactional
    public void markRead(Long channelId, String userId, Long messageId){
        requireMembership(channelId, userId);

        if (messageId == null || !messageRepository.existsByIdAndChannelId(messageId, channelId)) {
            throw new IllegalArgumentException(
                    "Message " + messageId + " does not belong to channel " + channelId);
        }

        LocalDateTime now = LocalDateTime.now();
        int updated = readStateRepository.upsertIfNewer(
                channelId, Long.valueOf(userId), messageId, now);

        // 커서가 뒤로 가거나 그대로면 알릴 것이 없습니다.
        if (updated == 0) {
            return;
        }
        broadcastRead(channelId, new ChannelDtos.ReadState(userId, messageId, now));
    }

    // 누가 어디까지 읽었는지 (입장 시 읽음 표시 렌더링용)
    @Transactional(readOnly = true)
    public List<ChannelDtos.ReadState> readStates(Long channelId, String requester){
        requireMembership(channelId, requester);
        return readStateRepository.findByChannelId(channelId).stream()
                .map(state -> new ChannelDtos.ReadState(
                        state.getUserId().toString(),
                        state.getLastReadMessageId(),
                        state.getUpdatedAt()))
                .toList();
    }

    // 안 읽은 개수. 커서가 없는 멤버는 아무것도 안 읽은 것으로 봅니다.
    @Transactional(readOnly = true)
    public long unreadCount(Long channelId, String userId){
        requireMembership(channelId, userId);
        Long uid = Long.valueOf(userId);
        long lastRead = readStateRepository.findByChannelIdAndUserId(channelId, uid)
                .map(ChannelReadState::getLastReadMessageId)
                .orElse(0L);
        return messageRepository.countUnread(channelId, uid, lastRead);
    }

    // 채널/워크스페이스가 삭제될 때 남는 메시지·읽음상태 정리.
    @Transactional
    public ChannelDtos.DeletedCounts deleteChannelMessages(List<Long> channelIds){
        if (channelIds == null || channelIds.isEmpty()) {
            return new ChannelDtos.DeletedCounts(0, 0);
        }
        long readStates = readStateRepository.deleteByChannelIdIn(channelIds);
        long messages = messageRepository.deleteByChannelIdIn(channelIds);
        return new ChannelDtos.DeletedCounts(messages, readStates);
    }

    // channel_member로 채널 멤버쉽 확인
    private void requireMembership(Long channelId, String userId){
        if (!serviceDirectory.isChannelMember(channelId, Long.valueOf(userId))) {
            throw new AccessDeniedException("User " + userId + " is not a member of channel " + channelId);
        }
    }

    private ChannelMessage requireOwnedMessage(Long channelId, String sender, Long id){
        requireMembership(channelId, sender);

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

    // 메시지 토픽과 분리합니다. /topic/channel.N은 이미 생성/수정/삭제가
    // 구분자 없이 같은 모양으로 흐르고 있어서 네 번째 모양을 얹지 않습니다.
    private void broadcastRead(Long channelId, ChannelDtos.ReadState readState){
        messageTemplate.convertAndSend("/topic/channel." + channelId + ".read", readState);
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
