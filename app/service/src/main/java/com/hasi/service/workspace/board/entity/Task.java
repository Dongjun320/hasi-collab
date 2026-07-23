package com.hasi.service.workspace.board.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder

public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "board_id", nullable = false)
    private Long boardId;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.TODO;

    @Column(name = "assignee_id")
    private Long assigneeId;   // 담당자 없을 수 있으므로 NULL 허용

    @Enumerated(EnumType.STRING)
    private Priority priority; // 우선순위 미지정 가능

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // updateTask - null이 아닌 필드만 갱신 (TaskUpdateRequest 부분 수정 대응)
    public void update(String title, Status status, Long assigneeId, Priority priority) {
        if (title != null) this.title = title;
        if (status != null) this.status = status;
        if (assigneeId != null) this.assigneeId = assigneeId;
        if (priority != null) this.priority = priority;
    }

    // status ENUM 정의 (openapi 스펙과 동일)
    public enum Status {
        TODO, IN_PROGRESS, REVIEW, DONE
    }

    // priority ENUM 정의 (openapi 스펙과 동일)
    public enum Priority {
        HIGH, MEDIUM, LOW
    }
}
