package com.hasi.service.workspace.board.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "boards")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder

public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(nullable = false, length = 100)
    private String name;

    // 보드를 관리하는 부서장(워크스페이스 ADMIN)의 userId
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // updateBoard - null이 아닌 필드만 갱신 (BoardUpdateRequest 부분 수정 대응)
    public void update(String name, Long ownerId) {
        if (name != null) this.name = name;
        if (ownerId != null) this.ownerId = ownerId;
    }
}
