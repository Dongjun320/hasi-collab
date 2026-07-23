package com.hasi.service.friend.entity;

import com.hasi.service.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "friends",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"sender_id", "receiver_id"})
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Friend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;      // 요청 보낸 사람

    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;    // 요청 받은 사람

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void accept() {
        this.status = Status.ACCEPTED;
    }

    public void reject() {
        this.status = Status.REJECTED;
    }

    public enum Status {
        PENDING, ACCEPTED, REJECTED
    }

    public void resendAsSender(Long senderId, Long receiverId) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.status = Status.PENDING;
    }
}