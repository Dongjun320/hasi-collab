package com.hasi.service.workspace.member.repository;

import com.hasi.service.workspace.member.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {
    List<WorkspaceMember> findByUserId(Long userId);

    Optional<WorkspaceMember> findByUserIdAndWorkspaceId(Long userId, Long workspaceId);
}
