package com.hasi.service.auth.repository;

import com.hasi.service.auth.entity.SocialAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.Optional;

@Repository
public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {

    Optional<SocialAccount> findByProviderAndProviderId(String provider, String providerId);

    Optional<SocialAccount> findByUserUid(Long uid);
    void deleteByUserUid(Long uid);
}
