package com.hasi.messenger.notification;

import com.hasi.messenger.api.InternalNotificationApi;
import com.hasi.messenger.model.NotificationCreateData;
import com.hasi.messenger.model.NotificationCreateRequest;
import com.hasi.messenger.model.NotificationCreateResponse;
import com.hasi.messenger.model.NotificationResolveData;
import com.hasi.messenger.model.NotificationResolveResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Service -> Messenger Notification용 내부 통신 엔드포인트.
 *
 * @author Jinwoo Jeong
 */
@RestController
public class InternalNotificationController implements InternalNotificationApi {

    private final NotificationService notificationService;

    public InternalNotificationController(NotificationService notificationService){
        this.notificationService = notificationService;
    }

    @Override
    public ResponseEntity<NotificationCreateResponse> createNotification(NotificationCreateRequest request){
        NotificationDtos.CreateResult result = notificationService.create(
                new NotificationDtos.NewNotification(
                        request.getRecipientId(),
                        NotificationType.valueOf(request.getType().name()),
                        request.getActorId(),
                        request.getSubjectId(),
                        request.getWorkspaceId(),
                        request.getPayload(),
                        request.getDedupKey()));

        NotificationCreateData data = new NotificationCreateData();
        data.setId(result.notification().id());
        data.setCreated(result.created());

        NotificationCreateResponse response = new NotificationCreateResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<NotificationResolveResponse> resolveNotifications(List<String> dedupKeys){
        NotificationResolveData data = new NotificationResolveData();
        data.setResolved(notificationService.resolve(dedupKeys));

        NotificationResolveResponse response = new NotificationResolveResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);
        return ResponseEntity.ok(response);
    }
}
