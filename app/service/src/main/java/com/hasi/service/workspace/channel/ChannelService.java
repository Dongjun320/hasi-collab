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
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChannelService {
    private final ChannelRepository channelRepository;
    private final ChannelMemberRepository channelMemberRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @Transactional
    public ChannelData createWorkspaceChannel(Long workspaceId, ChannelCreateRequest request) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = workspaceMemberRepository.findByUserIdAndWorkspaceId(uid, workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_004));

        if(!workspaceMember.getRole().name().equals("OWNER")) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        Long parentId = null;
        if(request.getParentId() != null && request.getParentId().isPresent()) {
            parentId = request.getParentId().get();
        }

        // Channel 엔티티 생성 및 저장
        Channel channel = Channel.builder()
                .workspaceId(workspaceId)
                .parentId(parentId)
                .name(request.getName())
                .isPrivate(request.getIsPrivate())
                .build();

        channelRepository.save(channel);

        ChannelMember channelMember = ChannelMember.builder()
                .channelId(channel.getId())
                .userId(uid)
                .role(ChannelMember.Role.OWNER)
                .build();

        channelMemberRepository.save(channelMember);

        // Channel의 값을 data에 담아 리턴
        ChannelData data = new ChannelData();
        data.setId(channel.getId());
        data.setWorkspaceId(channel.getWorkspaceId());
        data.setParentId(JsonNullable.of(channel.getParentId()));
        data.setName(channel.getName());
        data.setIsPrivate(channel.isPrivate());
        data.setCreatedAt(channel.getCreatedAt().atOffset(ZoneOffset.UTC));

        return data;
    }

    public ChannelDetailResponseData getWorkspaceChannel(Long workspaceId, Long channelId) {

        // 해당 Channel 을 찾고, channelMember 수를 count하기 위한 channelMember 리스트를 찾음
        Channel channel = channelRepository.findByWorkspaceIdAndId(workspaceId, channelId)
                .orElseThrow(() -> new ApiException(ErrorCode.CH_002));

        List<ChannelMember> channelMembers = channelMemberRepository.findByChannelId(channelId);

        // Channel 값, ChannelMember count 값을 data에 담아 리턴
        ChannelDetailResponseData data = new ChannelDetailResponseData();
        data.setId(channel.getId());
        data.setWorkspaceId(channel.getWorkspaceId());
        data.setParentId(JsonNullable.of(channel.getParentId()));
        data.setName(channel.getName());
        data.setIsPrivate(channel.isPrivate());
        data.setCreatedAt(channel.getCreatedAt().atOffset(ZoneOffset.UTC));
        data.setMemberCount(channelMembers.size());

        return data;
    }

    public List<ChannelData> getWorkspaceChannels(Long workspaceId) {

        // Channels 리스트 조회
        List<Channel> channels = channelRepository.findByWorkspaceId(workspaceId);

        List<ChannelData> data = new ArrayList<>();

        // Channel 리스트의 각 Channel 값을 item에 넣은 후 data에 담음
        for(Channel channel : channels) {
            ChannelData item = new ChannelData();
            item.setId(channel.getId());
            item.setWorkspaceId(channel.getWorkspaceId());
            item.setParentId(JsonNullable.of(channel.getParentId()));
            item.setName(channel.getName());
            item.setIsPrivate(channel.isPrivate());
            item.setCreatedAt(channel.getCreatedAt().atOffset(ZoneOffset.UTC));

            data.add(item);
        }
        return data;
    }

    @Transactional
    public ChannelData patchWorkspaceChannel(Long workspaceId, Long channelId, ChannelPatchRequest request) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = workspaceMemberRepository.findByUserIdAndWorkspaceId(uid, workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_004));

        if(!workspaceMember.getRole().name().equals("OWNER")) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        Channel channel = channelRepository.findByWorkspaceIdAndId(workspaceId, channelId)
                .orElseThrow(() -> new ApiException(ErrorCode.CH_002));

        if(request.getName() != null) {
            channel.updateName(request.getName());
        }
        if(request.getIsPrivate() != null) {
            channel.updateIsPrivate(request.getIsPrivate());
        }

        ChannelData data = new ChannelData();
        data.setId(channel.getId());
        data.setWorkspaceId(channel.getWorkspaceId());
        data.setParentId(JsonNullable.of(channel.getParentId()));
        data.setName(channel.getName());
        data.setIsPrivate(channel.isPrivate());
        data.setCreatedAt(channel.getCreatedAt().atOffset(ZoneOffset.UTC));

        return data;
    }

    @Transactional
    public ChannelDeleteResponseData deleteWorkspaceChannel(Long workspaceId, Long channelId) {

        Long uid = getCurrentUserId();

        // 워크스페이스에 소속한 멤버가 아니면 접근불가
        WorkspaceMember workspaceMember = workspaceMemberRepository.findByUserIdAndWorkspaceId(uid, workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_004));

        // owner가 아니면 삭제 불가
        if(!workspaceMember.getRole().name().equals("OWNER")) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        // 하위 채널이 있을 경우 삭제 불가
        List<Channel> subChannels = channelRepository.findByParentId(channelId);
        if(!subChannels.isEmpty()) {
            throw new ApiException(ErrorCode.CH_004);
        }

        Channel channel = channelRepository.findByWorkspaceIdAndId(workspaceId, channelId)
                .orElseThrow(() -> new ApiException(ErrorCode.CH_002));

        channelMemberRepository.deleteByChannelId(channel.getId());
        channelRepository.delete(channel);

        ChannelDeleteResponseData data = new ChannelDeleteResponseData();
        data.setMessage("채널 삭제 완료");

        return data;
    }

    public ChannelMemberJoinResponseData joinChannelMembers(Long workspaceId, Long channelId) {

        Long uid = getCurrentUserId();

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, uid)) {
            throw new ApiException(ErrorCode.AUTH_004); // 워크스페이스 멤버가 아님
        }

        if (channelMemberRepository.existsByChannelIdAndUserId(channelId, uid)) {
            throw new ApiException(ErrorCode.CH_005); // 이미 참가한 멤버
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

    private Long getCurrentUserId() {
        // 현재 userId를 JWT SecurityContextHolder에서 추출
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || authentication.getName() == null) {
            throw new ApiException(ErrorCode.AUTH_003);
        }
        return Long.valueOf(authentication.getName());
    }
}
