package com.hasi.service.workspace.member;

import com.hasi.collab.api.WorkspaceMemberApi;
import com.hasi.collab.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MemberController implements WorkspaceMemberApi {
    private final MemberService memberService;
    private final InvitationService invitationService;

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

}
