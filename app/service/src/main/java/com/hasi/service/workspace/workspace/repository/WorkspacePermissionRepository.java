package com.hasi.service.workspace.workspace.repository;

import com.hasi.service.workspace.workspace.entity.WorkspacePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspacePermissionRepository extends JpaRepository<WorkspacePermission, Long> {
    boolean existsByWorkspaceIdAndPermissionAndAdminAllowed(Long workspaceId, WorkspacePermission.Permission permission, boolean adminAllowed);

    List<WorkspacePermission> findByWorkspaceId(Long workspaceId);

    Optional<WorkspacePermission> findByWorkspaceIdAndPermission(Long workspaceId, WorkspacePermission.Permission permission);

    void deleteByWorkspaceId(Long workspaceId);
}
