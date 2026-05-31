package com.hasi.service.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import  java.util.List;
import  java.util.Map;

@RestController
@RequestMapping("/api/v1/mail")
@RequiredArgsConstructor

public class MailController {

    private final MailService mailService;

    @PostMapping("/accounts")
    public ResponseEntity<MailAccount> addAccount(@RequestBody MailAccount account) {
        return ResponseEntity.ok(mailService.addAccount(account));

    }

    @GetMapping("/accounts/{accountId}/mails")
    public ResponseEntity<List<Map<String, Object>>> getMails(
            @PathVariable Long accountId,
            @RequestParam(defaultValue = "30") int limit) {
        try {
            return ResponseEntity.ok(mailService.fetchMails(accountId, limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}


