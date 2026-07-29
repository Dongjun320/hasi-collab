package com.hasi.messenger.notification;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/messenger-api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService){
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDtos.Outbound> inbox(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "false") boolean includeResolved,
            @RequestParam(defaultValue = "50") int limit,
            Principal principal){
        return notificationService.inbox(principal.getName(), unreadOnly, includeResolved, limit);
    }

    @GetMapping("/unread-count")
    public NotificationDtos.UnreadCount unreadCount(Principal principal){
        return new NotificationDtos.UnreadCount(
                notificationService.unreadCount(principal.getName()));
    }

    @PatchMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable Long id, Principal principal){
        notificationService.markRead(principal.getName(), id);
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(Principal principal){
        notificationService.markAllRead(principal.getName());
    }
}
