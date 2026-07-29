package com.hasi.service.workspace.member.repository;

import com.hasi.service.workspace.member.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    List<Invitation> findByInviterIdAndStatus(Long inviterId, Invitation.Status status);
    List<Invitation> findByInviteeIdAndStatus(Long inviteeId, Invitation.Status status);

    List<Invitation> findByInviteeId(Long inviteeId);
    List<Invitation> findByInviterId(Long inviterId);

    boolean existsByWorkspaceIdAndInviteeIdAndStatus(Long workspaceId, Long inviteeId, Invitation.Status status);

    boolean existsByChannelIdAndInviteeIdAndStatus(Long channelId, Long uid, Invitation.Status status);

    boolean existsByWorkspaceIdAndChannelIdIsNullAndInviteeIdAndStatus(Long workspaceId, Long inviteeId, Invitation.Status status);
}
