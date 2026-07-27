package com.hasi.messenger.presence;

import com.hasi.messenger.directory.ServiceDirectory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 접속 상태(presence). STOMP 세션이 하나라도 있으면 온라인.
 *
 * @author Jinwoo Jeong
 */
@Service
public class PresenceService {

    private static final Logger log = LoggerFactory.getLogger(PresenceService.class);

    private static final String KEY_PREFIX = "presence:";

    private final StringRedisTemplate redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final ServiceDirectory serviceDirectory;
    private final Duration ttl;

    // 로컬 세션
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();

    public PresenceService(StringRedisTemplate redisTemplate,
                           SimpMessagingTemplate messagingTemplate,
                           ServiceDirectory serviceDirectory,
                           @Value("${app.presence.ttl-seconds}") long ttlSeconds){
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
        this.serviceDirectory = serviceDirectory;
        this.ttl = Duration.ofSeconds(ttlSeconds);
    }

    public void onConnect(String sessionId, String userId){
        if (sessionId == null || userId == null) {
            return;
        }
        sessionToUser.put(sessionId, userId);

        String key = key(userId);
        redisTemplate.opsForSet().add(key, sessionId);
        redisTemplate.expire(key, ttl);

        broadcast(userId, true);
    }

    public void onDisconnect(String sessionId){
        if (sessionId == null) {
            return;
        }
        String userId = sessionToUser.remove(sessionId);
        if (userId == null) {
            return; // 인증 실패로 CONNECT까지 못 간 세션
        }

        String key = key(userId);
        redisTemplate.opsForSet().remove(key, sessionId);

        boolean stillOnline = sessionCount(key) > 0;
        if (stillOnline) {
            // 다른 탭이 남아있음. TTL만 살려두고 온라인 유지.
            redisTemplate.expire(key, ttl);
        } else {
            redisTemplate.delete(key);
        }

        broadcast(userId, stillOnline);
    }

    public boolean isOnline(String userId){
        return userId != null && sessionCount(key(userId)) > 0;
    }

    /**
     * 요청자가 볼 수 있는 상대에 한해서만 접속 여부를 돌려줍니다. ServiceDirectory 로직 사용
     */
    public List<String> onlineVisibleTo(String requesterId, List<String> userIds){
        if (requesterId == null || userIds == null || userIds.isEmpty()) {
            return List.of();
        }
        Long requester = parseUserId(requesterId);
        if (requester == null) {
            return List.of();
        }

        Set<String> visible = serviceDirectory.findVisibleUserIds(requester).stream()
                .map(String::valueOf)
                .collect(Collectors.toCollection(HashSet::new));
        visible.add(requesterId); // 워크스페이스가 없어도 자기 자신은 볼 수 있습니다

        return userIds.stream()
                .filter(visible::contains)
                .filter(this::isOnline)
                .toList();
    }

    /**
     * TTL 갱신.
     */
    @Scheduled(fixedDelayString = "${app.presence.refresh-interval-ms}")
    public void refreshTtl(){
        Set<String> activeUsers = new HashSet<>(sessionToUser.values());
        for (String userId : activeUsers) {
            try {
                redisTemplate.expire(key(userId), ttl);
            } catch (Exception e) {
                log.warn("presence TTL 갱신 실패 - userId={}", userId, e);
            }
        }
    }

    private long sessionCount(String key){
        Long size = redisTemplate.opsForSet().size(key);
        return size == null ? 0 : size;
    }

    /**
     *   - 같은 워크스페이스: /topic/workspace.{id}.presence
     *   - 친구: /user/queue/presence
     */
    private void broadcast(String userId, boolean online){
        Long uid = parseUserId(userId);
        if (uid == null) {
            return;
        }
        PresenceDtos.PresenceEvent event =
                new PresenceDtos.PresenceEvent(userId, online, LocalDateTime.now());

        for (Long workspaceId : serviceDirectory.findWorkspaceIds(uid)) {
            messagingTemplate.convertAndSend("/topic/workspace." + workspaceId + ".presence", event);
        }
        for (Long friendId : serviceDirectory.findAcceptedFriendIds(uid)) {
            messagingTemplate.convertAndSendToUser(String.valueOf(friendId), "/queue/presence", event);
        }
    }

    private Long parseUserId(String userId){
        try {
            return Long.valueOf(userId);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String key(String userId){
        return KEY_PREFIX + userId;
    }
}
