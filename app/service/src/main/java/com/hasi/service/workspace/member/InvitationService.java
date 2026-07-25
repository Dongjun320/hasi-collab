package com.hasi.service.workspace.member;

import com.hasi.collab.model.*;
import com.hasi.service.auth.entity.User;
import com.hasi.service.auth.repository.UserRepository;
import com.hasi.service.common.ApiException;
import com.hasi.service.common.ErrorCode;
import com.hasi.service.workspace.member.entity.Invitation;
import com.hasi.service.workspace.member.entity.WorkspaceMember;
import com.hasi.service.workspace.member.repository.InvitationRepository;
import com.hasi.service.workspace.member.repository.WorkspaceMemberRepository;
import com.hasi.service.workspace.workspace.entity.Workspace;
import com.hasi.service.workspace.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvitationService {
    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public WorkspaceMemberInviteResponseData createInvitation(Long workspaceId, WorkspaceMemberInviteRequest request) {

        Long inviterId = getCurrentUserId();

        // nickname으로 uid 찾기
        User user = userRepository.findByNickname(request.getNickname())
                .orElseThrow(() -> new ApiException(ErrorCode.MBR_001)); // 추후 커스텀 에러 작성 및 교체

        // 이미 워크스페이스에 속한 멤버인지 체크
        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getUid())) {
            throw new ApiException(ErrorCode.MBR_002);
        }

        if (inviterId.equals(user.getUid())) {
            throw new ApiException(ErrorCode.MBR_004);
        }

        // 이미 보낸 초대가 PENDING일 경우 다시 보낼 수 없음
        if (invitationRepository.existsByWorkspaceIdAndInviteeIdAndStatus(workspaceId, user.getUid(), Invitation.Status.PENDING)) {
            throw new ApiException(ErrorCode.MBR_007);
        }

        // invitation 레코드 생성
        Invitation invitation = Invitation.builder()
                .workspaceId(workspaceId)
                .inviterId(inviterId)
                .inviteeId(user.getUid())
                .status(Invitation.Status.PENDING)
                .build();

        invitationRepository.save(invitation);

        // response 리턴
        WorkspaceMemberInviteResponseData data = new WorkspaceMemberInviteResponseData();
        data.setUserId(user.getUid());
        data.setRole(WorkspaceMemberInviteResponseData.RoleEnum.fromValue(request.getRole().name().toLowerCase()));
        data.setMessage("초대 완료");

        return data;
    }

    public enum InvitationType {
        SENT, RECEIVED
    }

    public List<InviteMemberData> getInvitation(InvitationType type) {

        // InvitationType(SENT, RECEIVED)에 따른 DB 검색(inviter, invitee) 변경
        Long inviteId = getCurrentUserId();
        List<Invitation> invites;
        if (type == InvitationType.SENT) {
            invites = invitationRepository.findByInviterIdAndStatus(inviteId, Invitation.Status.PENDING);
        } else {
            invites = invitationRepository.findByInviteeIdAndStatus(inviteId, Invitation.Status.PENDING);
        }

        // InviteMemberData가 들어간 list 반환
        List<InviteMemberData> data = new ArrayList<>();
        for (Invitation invite : invites) {
            User inviter = userRepository.findById(invite.getInviterId())
                    .orElseThrow(() -> new ApiException(ErrorCode.MBR_003));
            User invitee = userRepository.findById(invite.getInviteeId())
                    .orElseThrow(() -> new ApiException(ErrorCode.MBR_003));
            Workspace workspace = workspaceRepository.findById(invite.getWorkspaceId())
                    .orElseThrow(() -> new ApiException(ErrorCode.WS_002));

            InviteMemberData item = new InviteMemberData();
            item.setInvitationId(invite.getId());
            item.setWorkspaceId(invite.getWorkspaceId());
            item.setWorkspaceName(workspace.getName());
            item.setInviterId(invite.getInviterId());
            item.setInviterNickname(inviter.getNickname());
            item.setInviteeId(invite.getInviteeId());
            item.setInviteeNickname(invitee.getNickname());
            item.setStatus(InviteMemberData.StatusEnum.fromValue(invite.getStatus().name()));
            item.setCreatedAt(invite.getCreatedAt().atOffset(ZoneOffset.UTC));
            item.setExpiresAt(invite.getExpiresAt().atOffset(ZoneOffset.UTC));

            data.add(item);
        }
        return data;
    }

    public List<InviteMemberData> getReceivedInvitation() {
        return getInvitation(InvitationType.RECEIVED);
    }

    public List<InviteMemberData> getSentInvitation() {
        return getInvitation(InvitationType.SENT);
    }

    @Transactional
    public MemberInviteResponseData patchResponseInvitation(Long invitationId, MemberInvitePatchRequest request) {

        Long userId = getCurrentUserId();

        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ApiException(ErrorCode.MBR_006));

        if(request.getAction() == null) {
            throw new ApiException(ErrorCode.MBR_004);
        }

        // 초대 수락/거절/취소에 따른 switch문
        String action = request.getAction().name();
        String message;

        switch(action) {
            case "ACCEPTED":
                if(!invitation.getInviteeId().equals(userId)) {
                    throw new ApiException(ErrorCode.AUTH_004);
                }
                invitation.accept();
                // workspaceMember 레코드 생성
                workspaceMemberRepository.save(
                        WorkspaceMember.builder()
                                .workspaceId(invitation.getWorkspaceId())
                                .userId(userId)
                                .role(WorkspaceMember.Role.MEMBER)
                                .build()
                );
                message = "초대 수락 완료";
                break;
            case "DECLINED":
                if(!invitation.getInviteeId().equals(userId)) {
                    throw new ApiException(ErrorCode.AUTH_004);
                }
                invitation.decline();
                message = "초대 거절 완료";
                break;
            case "CANCELLED": // 초대 보낸 유저가 취소하는 경우(다른 건 초대 받은 유저가 응답하는 형태)
                if(!invitation.getInviterId().equals(userId)) {
                    throw new ApiException(ErrorCode.AUTH_004);
                }
                invitation.cancel();
                message = "초대 취소 완료";
                break;
            default:
                throw new ApiException(ErrorCode.MBR_004);
        }

        // Response 리턴
        MemberInviteResponseData data = new MemberInviteResponseData();
        data.setMessage(message);
        data.setInvitationId(invitationId);
        data.setStatus(MemberInviteResponseData.StatusEnum.fromValue(invitation.getStatus().name()));

        return data;
    }

    private Long getCurrentUserId() {
        // 현재 userId를 JWT SecurityContextHolder에서 추출
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || authentication.getName() == null) {
            throw new ApiException(ErrorCode.AUTH_003);
        }
        return Long.valueOf(authentication.getName());
    }
}




























