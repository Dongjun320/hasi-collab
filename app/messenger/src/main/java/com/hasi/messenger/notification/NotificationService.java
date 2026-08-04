package com.hasi.messenger.notification;

import com.hasi.messenger.directory.ServiceDirectory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private static final String USER_DESTINATION = "/queue/notifications";

    private static final int MAX_LIMIT = 100;

    private static final TypeReference<Map<String, Object>> PAYLOAD_TYPE = new TypeReference<>() {};

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ServiceDirectory serviceDirectory;
    private final ObjectMapper objectMapper;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate,
                               ServiceDirectory serviceDirectory,
                               ObjectMapper objectMapper){
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
        this.serviceDirectory = serviceDirectory;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public NotificationDtos.CreateResult create(NotificationDtos.NewNotification request){
        if (request.dedupKey() == null || request.dedupKey().isBlank()) {
            throw new IllegalArgumentException("dedupKey is required");
        }
        if (!serviceDirectory.userExists(request.recipientId())) {
            throw new IllegalArgumentException("Recipient not found: " + request.recipientId());
        }

        int inserted = notificationRepository.insertIfAbsent(
                request.recipientId(),
                request.type().name(),
                request.actorId(),
                request.subjectId(),
                request.workspaceId(),
                writePayload(request.payload()),
                request.dedupKey(),
                LocalDateTime.now());

        Notification stored = notificationRepository.findByDedupKey(request.dedupKey())
                .orElseThrow(() -> new IllegalStateException(
                        "Notification vanished after insert: " + request.dedupKey()));

        NotificationDtos.Outbound outbound = toOutbound(stored);

        if (inserted > 0) {
            push(stored.getRecipientId(), outbound);
        }
        return new NotificationDtos.CreateResult(outbound, inserted > 0);
    }

    @Transactional
    public long resolve(Collection<String> dedupKeys){
        if (dedupKeys == null || dedupKeys.isEmpty()) {
            return 0;
        }
        return notificationRepository.resolveByDedupKeys(dedupKeys, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<NotificationDtos.Outbound> inbox(String userId,
                                                 boolean unreadOnly,
                                                 boolean includeResolved,
                                                 int limit){
        return notificationRepository.findInbox(
                        Long.valueOf(userId),
                        unreadOnly,
                        includeResolved,
                        PageRequest.of(0, Math.clamp(limit, 1, MAX_LIMIT)))
                .stream()
                .map(this::toOutbound)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(String userId){
        return notificationRepository.countByRecipientIdAndReadAtIsNullAndResolvedAtIsNull(
                Long.valueOf(userId));
    }

    @Transactional
    public void markRead(String userId, Long id){
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));

        if (!notification.getRecipientId().equals(Long.valueOf(userId))) {
            throw new AccessDeniedException(
                    "User " + userId + " is not the recipient of notification " + id);
        }
        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
        }
    }

    @Transactional
    public void markAllRead(String userId){
        notificationRepository.markAllRead(Long.valueOf(userId), LocalDateTime.now());
    }

    private void push(Long recipientId, NotificationDtos.Outbound outbound){
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            send(recipientId, outbound);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit(){
                send(recipientId, outbound);
            }
        });
    }

    private void send(Long recipientId, NotificationDtos.Outbound outbound){
        messagingTemplate.convertAndSendToUser(
                String.valueOf(recipientId), USER_DESTINATION, outbound);
    }

    private NotificationDtos.Outbound toOutbound(Notification notification){
        return new NotificationDtos.Outbound(
                notification.getId(),
                notification.getType(),
                notification.getActorId(),
                notification.getSubjectId(),
                notification.getWorkspaceId(),
                readPayload(notification.getPayload()),
                notification.getReadAt() == null,
                notification.getResolvedAt() != null,
                notification.getCreatedAt());
    }

    private String writePayload(Map<String, Object> payload){
        if (payload == null || payload.isEmpty()) {
            return null;
        }
        return objectMapper.writeValueAsString(payload);
    }

    private Map<String, Object> readPayload(String payload){
        if (payload == null || payload.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(payload, PAYLOAD_TYPE);
        } catch (JacksonException e) {
            log.warn("실패", e);
            return Map.of();
        }
    }
}
