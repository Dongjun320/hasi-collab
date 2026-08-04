package com.hasi.service.workspace.member.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "invitations")

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder

public class Invitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "channel_id")
    private Long channelId;

    @Column(name = "inviter_id", nullable = false)
    private Long inviterId;

    @Column(name = "invitee_id", nullable = false)
    private Long inviteeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);

    public void accept() {
        validatePending("수락");
        this.status = Status.ACCEPTED;
    }

    public void decline() {
        validatePending("거절");
        this.status = Status.DECLINED;
    }

    public void cancel() {
        validatePending("취소");
        this.status = Status.CANCELLED;
    }

    private void validatePending(String action) {
        if(this.status != Status.PENDING) {
            throw new IllegalStateException("PENDING 상태의 초대만 " + action + "할 수 있습니다.");
        }

        // 아직 만료된 초대는 Exception으로 넘기지 않음
    }

    public enum Status {
        ACCEPTED, PENDING, DECLINED , CANCELLED
    }
}
