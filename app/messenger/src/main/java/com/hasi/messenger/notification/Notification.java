package com.hasi.messenger.notification;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_notifications_dedup_key",
                columnNames = "dedup_key"),
        indexes = @Index(name = "idx_by_recipient_id_and_created_at", columnList = "recipient_id, created_at"))
@Getter
@Setter
@ToString
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private NotificationType type;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "workspace_id")
    private Long workspaceId;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Column(name = "dedup_key", nullable = false, length = 128)
    private String dedupKey;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
