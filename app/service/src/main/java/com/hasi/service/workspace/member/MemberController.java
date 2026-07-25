package com.hasi.service.workspace.member;

import com.hasi.collab.api.WorkspaceMemberApi;
import com.hasi.collab.model.*;
import com.hasi.service.workspace.channel.ChannelService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MemberController implements WorkspaceMemberApi {
    private final MemberService memberService;
    private final InvitationService invitationService;
    private final ChannelService channelService;

    @Override
    public ResponseEntity<WorkspaceMemberInviteResponse> inviteWorkspaceMember(Long workspaceId, WorkspaceMemberInviteRequest request) {
        WorkspaceMemberInviteResponseData data = invitationService.createInvitation(workspaceId, request);
        WorkspaceMemberInviteResponse response = new WorkspaceMemberInviteResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<MemberInviteListResponse> getReceivedInvitation() {
        List<InviteMemberData> data = invitationService.getReceivedInvitation();
        MemberInviteListResponse response = new MemberInviteListResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<MemberInviteListResponse> getSentInvitation() {
        List<InviteMemberData> data = invitationService.getSentInvitation();
        MemberInviteListResponse response = new MemberInviteListResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<MemberInviteResponse> responseInvitation(Long invitationId, MemberInvitePatchRequest request) {
        MemberInviteResponseData data = invitationService.patchResponseInvitation(invitationId, request);
        MemberInviteResponse response = new MemberInviteResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ChannelMemberJoinResponse> joinChannelMembers(Long workspaceId, Long channelId) {
        ChannelMemberJoinResponseData data = channelService.joinChannelMembers(workspaceId, channelId);
        ChannelMemberJoinResponse response = new ChannelMemberJoinResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<WorkspaceMemberListResponse> getWorkspaceMembers(Long workspaceId) {
        List<WorkspaceMemberData> data = memberService.getWorkspaceMembers(workspaceId);
        WorkspaceMemberListResponse response = new WorkspaceMemberListResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ChannelMemberListResponse> getChannelMembers(Long workspaceId, Long channelId) {
        List<ChannelMemberData> data = memberService.getChannelMembers(workspaceId, channelId);
        ChannelMemberListResponse response = new ChannelMemberListResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<WorkspaceMemberPatchResponse> patchWorkspaceMember(Long workspaceId, Long userId, WorkspaceMemberPatchRequest request) {
        WorkspaceMemberData data = memberService.patchWorkspaceMember(workspaceId, userId, request);
        WorkspaceMemberPatchResponse response = new WorkspaceMemberPatchResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<WorkspaceMemberLeaveResponse> leaveWorkspaceMember(Long workspaceId) {
        WorkspaceMemberLeaveResponseData data = memberService.leaveWorkspaceMember(workspaceId);
        WorkspaceMemberLeaveResponse response = new WorkspaceMemberLeaveResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ChannelMemberLeaveResponse> leaveChannelMember(Long workspaceId, Long channelId) {
        ChannelMemberLeaveResponseData data = memberService.leaveChannelMember(workspaceId, channelId);
        ChannelMemberLeaveResponse response = new ChannelMemberLeaveResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<WorkspaceMemberRemoveResponse> removeWorkspaceMember(Long workspaceId, Long userId) {
        WorkspaceMemberRemoveResponseData data = memberService.removeWorkspaceMember(workspaceId, userId);
        WorkspaceMemberRemoveResponse response = new WorkspaceMemberRemoveResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ChannelMemberRemoveResponse> removeChannelMember(Long workspaceId, Long channelId, Long userId) {
        ChannelMemberRemoveResponseData data = memberService.removeChannelMember(workspaceId, channelId, userId);
        ChannelMemberRemoveResponse response = new ChannelMemberRemoveResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

}
