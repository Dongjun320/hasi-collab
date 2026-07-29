package com.hasi.messenger.notification;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Modifying
    @Query(value = """
            INSERT INTO notifications (recipient_id, type, actor_id, subject_id,
                                       workspace_id, payload, dedup_key, created_at)
            VALUES (:recipientId, :type, :actorId, :subjectId,
                    :workspaceId, :payload, :dedupKey, :now)
            ON CONFLICT (dedup_key) DO NOTHING
            """, nativeQuery = true)
    int insertIfAbsent(@Param("recipientId") Long recipientId,
                       @Param("type") String type,
                       @Param("actorId") Long actorId,
                       @Param("subjectId") Long subjectId,
                       @Param("workspaceId") Long workspaceId,
                       @Param("payload") String payload,
                       @Param("dedupKey") String dedupKey,
                       @Param("now") LocalDateTime now);

    Optional<Notification> findByDedupKey(String dedupKey);

    @Query("""
            SELECT n FROM Notification n
             WHERE n.recipientId = :recipientId
               AND (:unreadOnly = FALSE OR n.readAt IS NULL)
               AND (:includeResolved = TRUE OR n.resolvedAt IS NULL)
             ORDER BY n.createdAt DESC, n.id DESC
            """)
    List<Notification> findInbox(@Param("recipientId") Long recipientId,
                                 @Param("unreadOnly") boolean unreadOnly,
                                 @Param("includeResolved") boolean includeResolved,
                                 Pageable pageable);

    long countByRecipientIdAndReadAtIsNullAndResolvedAtIsNull(Long recipientId);

    /**
     *
     * @return resolved로 바뀐 record 수
     */
    @Modifying
    @Query("""
            UPDATE Notification n
               SET n.resolvedAt = :now
             WHERE n.dedupKey IN :dedupKeys
               AND n.resolvedAt IS NULL
            """)
    int resolveByDedupKeys(@Param("dedupKeys") Collection<String> dedupKeys,
                           @Param("now") LocalDateTime now);

    @Modifying
    @Query("""
            UPDATE Notification n
               SET n.readAt = :now
             WHERE n.recipientId = :recipientId
               AND n.readAt IS NULL
            """)
    int markAllRead(@Param("recipientId") Long recipientId,
                    @Param("now") LocalDateTime now);
}
