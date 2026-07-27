package com.hasi.service.workspace.member.repository;

import com.hasi.service.workspace.member.entity.ChannelMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChannelMemberRepository extends JpaRepository<ChannelMember, Long> {
    List<ChannelMember> findByChannelId(Long channelId);

    Optional<ChannelMember> findByChannelIdAndUserId(Long channelId, Long userId);

    boolean existsByChannelIdAndUserId(Long channelId, Long userId);

    void deleteByChannelId(Long channelId);
}
