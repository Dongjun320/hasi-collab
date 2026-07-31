package com.hasi.service.user.repository;

import com.hasi.service.user.entity.UserMemo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserMemoRepository extends JpaRepository<UserMemo, Long> {

    Optional<UserMemo> findByOwnerIdAndTargetId(Long ownerId, Long targetId);

    void deleteByOwnerIdAndTargetId(Long ownerId, Long targetId);
}