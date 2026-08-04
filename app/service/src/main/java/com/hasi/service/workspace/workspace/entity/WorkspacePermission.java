package com.hasi.service.workspace.workspace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workspace_permissions", uniqueConstraints = @UniqueConstraint(columnNames = {"workspace_id", "permission"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder

public class WorkspacePermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Permission permission;

    @Column(name = "admin_allowed", nullable = false)
    @Builder.Default
    private boolean adminAllowed = false;

    public enum Permission {
        EDIT_WORKSPACE,
        DELETE_WORKSPACE,
        INVITE_WORKSPACE_MEMBER,
        REMOVE_WORKSPACE_MEMBER,
        EDIT_WORKSPACE_MEMBER_ROLE,
        CREATE_CHANNEL,
        EDIT_CHANNEL,
        DELETE_CHANNEL,
        INVITE_CHANNEL_MEMBER,
        REMOVE_CHANNEL_MEMBER,
        EDIT_CHANNEL_MEMBER_ROLE
    }

    public void updateAdminAllowed(boolean adminAllowed) {
        this.adminAllowed = adminAllowed;
    }
}
