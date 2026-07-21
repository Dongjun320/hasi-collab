package com.hasi.service.workspace.member.repository;

import com.hasi.service.workspace.member.entity.ChannelMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChannelMemberRepository extends JpaRepository<ChannelMember, Long> {
    List<ChannelMember> findByChannelId(Long channelId);

    void deleteByChannelId(Long channelId);

    boolean existsByChannelIdAndUserId(Long channelId, Long userId);
}
