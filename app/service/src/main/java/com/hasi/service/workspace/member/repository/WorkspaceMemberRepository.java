package com.hasi.service.workspace.member.repository;

import com.hasi.service.workspace.member.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {
}
