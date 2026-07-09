package com.hasi.service.mail;

import jakarta.mail.*;
import jakarta.mail.internet.MimeMultipart;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.ZoneId;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor

public class MailService {

    private final MailAccountRepository mailAccountRepository;

    public MailAccount addAccount(MailAccount account) {

        switch (account.getProvider()) {
            case "gmail" -> { account.setImapHost("imap.gmail.com"); account.setImapPort(993);}
            case "yahoo" -> { account.setImapHost("imap.mail.yahoo.co.jp"); account.setImapPort(993);}
            case "outlook" -> { account.setImapHost("outlook.office365.com"); account.setImapPort(993);}
        }
        return mailAccountRepository.save(account);
    }

    public List<Map<String, Object>> fetchMails(Long accountId, int limit) throws Exception {
        MailAccount account = mailAccountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("계정을 찾을 수 없습니다."));


        Properties props = new Properties();
        props.put("mail.store.protocol", "imaps");
        props.put("mail.imaps.host", account.getImapHost());
        props.put("mail.imaps.port", account.getImapPort());
        props.put("mail.imaps.ssl.enable", "true");

        Session session = Session.getInstance(props);
        Store store = session.getStore("imaps");
        store.connect(account.getImapHost(), account.getEmail(), account.getPassword());

        Folder inbox = store.getFolder("INBOX");
        inbox.open(Folder.READ_ONLY);

        int total = inbox.getMessageCount();
        int start = Math.max(1, total - limit + 1);

        Message[] messages = inbox.getMessages(start, total);

        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = messages.length - 1 ; i>= 0 ; i--) {
            Message msg = messages[i];
            Map<String, Object> mail = new HashMap<>();

            mail.put("id", msg.getMessageNumber());
            mail.put("subject", msg.getSubject() != null ? msg .getSubject() : "제목 없음");
            mail.put("from", msg.getFrom() != null ? msg.getFrom()[0].toString() : "");
            mail.put("date", msg.getSentDate() != null
                ? LocalDateTime.ofInstant(msg.getSentDate().toInstant(), ZoneId.systemDefault()).toString() : "");
            mail.put("read", msg.isSet(Flags.Flag.SEEN));
            mail.put("body", getTextContent(msg));

            result.add(mail);

        }

        inbox.close(false);
        store.close();

        return  result;
    }

    private  String getTextContent(Message msg) throws MessagingException, IOException {
        if (msg.isMimeType("text/plane")) {
            return (String) msg.getContent();
        } else if (msg.isMimeType("text/html")) {
            return (String) msg.getContent();
        } else if (msg.isMimeType("multipart/*")) {
            MimeMultipart multipart = (MimeMultipart) msg.getContent();
            for (int i = 0 ; i < multipart.getCount() ; i++) {
                BodyPart part = multipart.getBodyPart(i);
                if (part.isMimeType("text/plain")) {
                    return (String) part.getContent();
                } else if (part.isMimeType("text/html")) {
                    return (String) part.getContent();
                }
            }
        }
        return "(본문 없음)";
    }
}
