package com.hasi.service.workspace.channel.repository;

import com.hasi.service.workspace.channel.entity.Channel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
    Optional<Channel> findByWorkspaceIdAndId(Long workspaceId, Long channelId);

    List<Channel> findByWorkspaceId(Long workspaceId);
}
