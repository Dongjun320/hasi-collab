package com.hasi.service.workspace.channel;

import com.hasi.collab.model.*;
import com.hasi.service.common.ApiException;
import com.hasi.service.common.ErrorCode;
import com.hasi.service.workspace.channel.entity.Channel;
import com.hasi.service.workspace.channel.repository.ChannelRepository;
import com.hasi.service.workspace.member.entity.ChannelMember;
import com.hasi.service.workspace.member.entity.WorkspaceMember;
import com.hasi.service.workspace.member.repository.ChannelMemberRepository;
import com.hasi.service.workspace.member.repository.WorkspaceMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChannelService {
    private final ChannelRepository channelRepository;
    private final ChannelMemberRepository channelMemberRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public ChannelData createWorkspaceChannel(Long workspaceId, ChannelCreateRequest request) {

        // 현재 id를 JWT SecurityContextHolder에서 추출
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || authentication.getName() == null) {
            throw new ApiException(ErrorCode.AUTH_003); // 추후 커스텀 에러 작성 및 교체 필요
        }
        Long uid = Long.valueOf(authentication.getName());
        WorkspaceMember workspaceMember = workspaceMemberRepository.findByUserIdAndWorkspaceId(uid, workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        if(!workspaceMember.getRole().name().equals("owner")) {
            throw new ApiException(ErrorCode.AUTH_001);
        }

        // Channel 엔티티 생성 및 저장
        Channel channel = Channel.builder()
                .workspaceId(workspaceId)
                .name(request.getName())
                .isPrivate(request.getIsPrivate())
                .build();

        channelRepository.save(channel);

        ChannelMember channelMember = ChannelMember.builder()
                .channelId(channel.getId())
                .userId(uid)
                .role(ChannelMember.Role.owner)
                .build();

        channelMemberRepository.save(channelMember);

        // Channel의 값을 data에 담아 리턴
        ChannelData data = new ChannelData();
        data.setId(channel.getId());
        data.setWorkspaceId(channel.getWorkspaceId());
        data.setName(channel.getName());
        data.setIsPrivate(channel.isPrivate());
        data.setCreatedAt(channel.getCreatedAt().atOffset(java.time.ZoneOffset.of("+09:00")));

        return data;
    }

    public ChannelDetailResponseData getWorkspaceChannel(Long workspaceId, Long channelId) {

        // 해당 Channel 을 찾고, channelMember 수를 count하기 위한 channelMember 리스트를 찾음
        Channel channel = channelRepository.findByWorkspaceIdAndId(workspaceId, channelId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        List<ChannelMember> channelMembers = channelMemberRepository.findByChannelId(channelId);
        if (channelMembers.isEmpty()) {
            throw new ApiException(ErrorCode.AUTH_002);
        }

        // Channel 값, ChannelMember count 값을 data에 담아 리턴
        ChannelDetailResponseData data = new ChannelDetailResponseData();
        data.setId(channel.getId());
        data.setWorkspaceId(channel.getWorkspaceId());
        data.setName(channel.getName());
        data.setIsPrivate(channel.isPrivate());
        data.setCreatedAt(channel.getCreatedAt().atOffset(java.time.ZoneOffset.of("+09:00")));
        data.setMemberCount(channelMembers.size());

        return data;
    }

    public List<ChannelData> getWorkspaceChannels(Long workspaceId) {

        // Channels 리스트 조회
        List<Channel> channels = channelRepository.findByWorkspaceId(workspaceId);
        if (channels.isEmpty()) {
            throw new ApiException(ErrorCode.AUTH_001);
        }

        List<ChannelData> data = new ArrayList<>();

        // Channel 리스트의 각 Channel 값을 item에 넣은 후 data에 담음
        for(Channel channel : channels) {
            ChannelData item = new ChannelData();
            item.setId(channel.getId());
            item.setWorkspaceId(channel.getWorkspaceId());
            item.setName(channel.getName());
            item.setIsPrivate(channel.isPrivate());
            item.createdAt(channel.getCreatedAt().atOffset(java.time.ZoneOffset.of("+09:00")));

            data.add(item);
        }
        return data;
    }

    @Transactional
    public ChannelData patchWorkspaceChannel(Long workspaceId, Long channelId, ChannelPatchRequest request) {
        // 현재 id를 JWT SecurityContextHolder에서 추출
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || authentication.getName() == null) {
            throw new ApiException(ErrorCode.AUTH_003); // 추후 커스텀 에러 작성 및 교체 필요
        }
        Long uid = Long.valueOf(authentication.getName());
        WorkspaceMember workspaceMember = workspaceMemberRepository.findByUserIdAndWorkspaceId(uid, workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        if(!workspaceMember.getRole().name().equals("owner")) {
            throw new ApiException(ErrorCode.AUTH_001);
        }

        Channel channel = channelRepository.findByWorkspaceIdAndId(workspaceId, channelId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        if(request.getName() != null) {
            channel.updateName(request.getName());
        }
        if(request.getIsPrivate() != null) {
            channel.updateIsPrivate(request.getIsPrivate());
        }

        ChannelData data = new ChannelData();
        data.setId(channel.getId());
        data.setWorkspaceId(channel.getWorkspaceId());
        data.setName(channel.getName());
        data.setIsPrivate(channel.isPrivate());
        data.setCreatedAt(channel.getCreatedAt().atOffset(java.time.ZoneOffset.of("+09:00")));

        return data;
    }

    @Transactional
    public ChannelDeleteResponseData deleteWorkspaceChannel(Long workspaceId, Long channelId) {
        // 현재 id를 JWT SecurityContextHolder에서 추출
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || authentication.getName() == null) {
            throw new ApiException(ErrorCode.AUTH_003); // 추후 커스텀 에러 작성 및 교체 필요
        }
        Long uid = Long.valueOf(authentication.getName());
        WorkspaceMember workspaceMember = workspaceMemberRepository.findByUserIdAndWorkspaceId(uid, workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        if(!workspaceMember.getRole().name().equals("owner")) {
            throw new ApiException(ErrorCode.AUTH_001);
        }

        Channel channel = channelRepository.findByWorkspaceIdAndId(workspaceId, channelId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        channelMemberRepository.deleteByChannelId(channel.getId());
        channelRepository.delete(channel);

        ChannelDeleteResponseData data = new ChannelDeleteResponseData();
        data.setMessage("채널 삭제 완료");

        return data;
    }

    public ChannelMemberJoinResponseData joinChannelMembers(Long workspaceId, Long channelId) {
        // 현재 id를 JWT SecurityContextHolder에서 추출
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || authentication.getName() == null) {
            throw new ApiException(ErrorCode.AUTH_003); // 추후 커스텀 에러 작성 및 교체 필요
        }
        Long uid = Long.valueOf(authentication.getName());

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, uid)) {
            throw new ApiException(ErrorCode.AUTH_004); // 워크스페이스 멤버가 아님
        }

        if (channelMemberRepository.existsByChannelIdAndUserId(channelId, uid)) {
            throw new ApiException(ErrorCode.AUTH_001); // 이미 참가한 멤버
        }

        ChannelMember channelMember = ChannelMember.builder()
                .channelId(channelId)
                .userId(uid)
                .build();

        channelMemberRepository.save(channelMember);

        ChannelMemberJoinResponseData data = new ChannelMemberJoinResponseData();
        data.setMessage("채널 참가 완료");

        return data;
    }


}
