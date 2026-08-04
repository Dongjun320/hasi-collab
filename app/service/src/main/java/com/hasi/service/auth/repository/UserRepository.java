package com.hasi.service.auth.repository;
import com.hasi.service.auth.entity.User;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User, Long>{
    Optional<User> findByEmail(String email);
    Optional<User> findByNickname(String nickname);

    boolean existsByEmail(String email);

    List<User> findAllByNicknameIn(@NotNull @Size(min = 1, max = 50) List<String> nicknames);
}
