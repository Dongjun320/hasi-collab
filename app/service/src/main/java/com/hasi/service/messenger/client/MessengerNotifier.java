package com.hasi.service.messenger.client;

import com.hasi.service.messenger.api.InternalMessageApi;
import com.hasi.service.messenger.api.InternalNotificationApi;
import com.hasi.service.messenger.model.NotificationCreateRequest;
import com.hasi.service.workspace.channel.event.ChannelMessagesPurgeEvent;
import com.hasi.service.workspace.member.event.InvitationResolvedEvent;
import com.hasi.service.workspace.member.event.MemberInvitedEvent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.client.RestClientException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MessengerNotifier {

    private static final Logger log = LoggerFactory.getLogger(MessengerNotifier.class);

    private final InternalNotificationApi notificationApi;
    private final InternalMessageApi messageApi;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMemberInvited(MemberInvitedEvent event) {
        NotificationCreateRequest request = new NotificationCreateRequest()
                .recipientId(event.inviteeId())
                .type(NotificationCreateRequest.TypeEnum.INVITE)
                .actorId(event.inviterId())
                .subjectId(event.invitationId())
                .workspaceId(event.workspaceId())
                .payload(payloadOf(event))
                .dedupKey("INVITE:" + event.invitationId());

        try {
            notificationApi.createNotification(request);
        } catch (RestClientException e) {
            log.warn("초대 알림 전송 실패. invitationId={}, inviteeId={}",
                    event.invitationId(), event.inviteeId(), e);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onChannelMessagesPurge(ChannelMessagesPurgeEvent event) {
        List<Long> channelIds = event.channelIds();
        if(channelIds == null || channelIds.isEmpty()) {
            return;
        }

        try {
            messageApi.deleteChannelMessages(channelIds);
        } catch (RestClientException e) {
            log.error("채널 메시지 삭제 실패. channelIds={}", channelIds, e);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onInvitationResolved(InvitationResolvedEvent event) {
        try {
            notificationApi.resolveNotifications(List.of("INVITE:" + event.invitationId()));
        } catch (RestClientException e) {
            log.warn("초대 알림 resolve 실패. invitationId={}", event.invitationId(), e);
        }
    }

    private Map<String, Object> payloadOf(MemberInvitedEvent event) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("inviterNickname", event.inviterNickname());
        payload.put("workspaceName", event.workspaceName());
        if(event.channelName() != null) {
            payload.put("channelName", event.channelName());
        }
        return payload;
    }
}