package com.hasi.service.workspace.member.event;

public record MemberInvitedEvent(Long invitationId,
                                 Long inviteeId,
                                 Long inviterId,
                                 Long workspaceId,
                                 Long channelId,
                                 String inviterNickname,
                                 String workspaceName,
                                 String channelName) {

}
