package com.hasi.service.mail;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class MailTemplateService {

    public String load(String templateName, String code) {
        try (InputStream is = new ClassPathResource("templates/" + templateName).getInputStream()) {
            String html = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return html.replace("{{CODE}}", code);
        } catch (IOException e) {
            throw new RuntimeException("메일 템플릿 로딩 실패", e);
        }
    }
}