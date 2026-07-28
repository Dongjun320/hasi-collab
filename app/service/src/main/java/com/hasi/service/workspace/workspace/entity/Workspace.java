package com.hasi.service.workspace.workspace.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Entity
@Table(name = "workspaces")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder

public class Workspace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "is_private", nullable = false)
    @Builder.Default
    private boolean isPrivate = false;

    @Column(name = "icon_url", length = 512)
    private String iconUrl;

    @Column()
    private String description;

    @Column(name = "default_channel_id")
    private Long defaultChannelId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void updateName(String name) {
        this.name = name;
    }
    public void updateIsPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }
    public void updateIconUrl(String iconUrl) {
        this.iconUrl = iconUrl;
    }
    public void updateDescription(String description) { this.description = description; }
    public void updateDefaultChannelId(Long defaultChannelId) { this.defaultChannelId = defaultChannelId; }

}
