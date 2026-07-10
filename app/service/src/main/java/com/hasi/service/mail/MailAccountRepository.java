package com.hasi.service.mail;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MailAccountRepository extends JpaRepository<MailAccount, Long> {

    List<MailAccount> findByUserId(String userId);

}
