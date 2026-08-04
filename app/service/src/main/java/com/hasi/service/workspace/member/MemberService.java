package com.hasi.service.workspace.member;

import com.hasi.collab.model.*;
import com.hasi.service.auth.entity.User;
import com.hasi.service.auth.repository.UserRepository;
import com.hasi.service.common.ApiException;
import com.hasi.service.common.ErrorCode;
import com.hasi.service.workspace.channel.entity.Channel;
import com.hasi.service.workspace.channel.repository.ChannelRepository;
import com.hasi.service.workspace.member.entity.ChannelMember;
import com.hasi.service.workspace.member.entity.WorkspaceMember;
import com.hasi.service.workspace.member.repository.ChannelMemberRepository;
import com.hasi.service.workspace.member.repository.WorkspaceMemberRepository;
import com.hasi.service.workspace.workspace.entity.Workspace;
import com.hasi.service.workspace.workspace.entity.WorkspacePermission;
import com.hasi.service.workspace.workspace.repository.WorkspacePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ChannelMemberRepository channelMemberRepository;
    private final UserRepository userRepository;
    private final ChannelRepository channelRepository;
    private final WorkspacePermissionRepository workspacePermissionRepository;

    public List<WorkspaceMemberData> getWorkspaceMembers(Long workspaceId) {
        List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceId(workspaceId);

        List<WorkspaceMemberData> data = new ArrayList<>();

        for(WorkspaceMember member : members) {
            WorkspaceMemberData item = new WorkspaceMemberData();
            User user = userRepository.findById(member.getUserId())
                            .orElseThrow(() -> new ApiException(ErrorCode.USER_003));

            item.setUserId(user.getUid());
            item.setNickname(user.getNickname());
            item.setRole(WorkspaceMemberData.RoleEnum.fromValue(member.getRole().name()));
            data.add(item);
        }

        return data;
    }

    public List<ChannelMemberData> getChannelMembers(Long workspaceId, Long channelId) {
        List<ChannelMember> members = channelMemberRepository.findByChannelId(channelId);

        List<ChannelMemberData> data = new ArrayList<>();

        for(ChannelMember member : members) {
            ChannelMemberData item = new ChannelMemberData();
            User user = userRepository.findById(member.getUserId())
                    .orElseThrow(() -> new ApiException(ErrorCode.USER_003));

            item.setUserId(user.getUid());
            item.setNickname(user.getNickname());
            item.setRole(ChannelMemberData.RoleEnum.fromValue(member.getRole().name()));

            data.add(item);
        }
        return data;
    }

    @Transactional
    public WorkspaceMemberData patchWorkspaceMember(Long workspaceId, Long userId, WorkspaceMemberPatchRequest request) {
        Long ownerId = getCurrentUserId();

        // 워크스페이스의 멤버인지 확인
        WorkspaceMember workspaceOwner = getWorkspaceMemberOrThrow(workspaceId, ownerId);

        if(!hasPermission(workspaceId, workspaceOwner, WorkspacePermission.Permission.EDIT_WORKSPACE_MEMBER_ROLE)) {
            throw new ApiException(ErrorCode.AUTH_004);
        }


        if(userId.equals(ownerId)) {
            throw new ApiException(ErrorCode.MBR_004);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_003));

        WorkspaceMember workspaceMember = getWorkspaceMemberOrThrow(workspaceId, userId);

        if(request.getRole() != null)
            workspaceMember.updateRole(WorkspaceMember.Role.valueOf(request.getRole().name()));

        workspaceMemberRepository.save(workspaceMember);

        WorkspaceMemberData data = new WorkspaceMemberData();
        if(request.getRole() != null)
            data.setRole(WorkspaceMemberData.RoleEnum.fromValue(workspaceMember.getRole().name()));

        data.setUserId(userId);
        data.setNickname(user.getNickname());

        return data;
    }

    @Transactional
    public ChannelMemberData patchChannelMember(Long workspaceId, Long channelId, Long userId, ChannelMemberPatchRequest request) {
        Long ownerId = getCurrentUserId();

        channelRepository.findByWorkspaceIdAndId(workspaceId, channelId)
                .orElseThrow(() -> new ApiException(ErrorCode.CH_002));

        // 채널의 멤버인지 확인
        ChannelMember channelOwner = getChannelMemberOrThrow(channelId, ownerId);

        if(!hasPermission(workspaceId, channelOwner, WorkspacePermission.Permission.EDIT_CHANNEL_MEMBER_ROLE)) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        if(userId.equals(ownerId)) {
            throw new ApiException(ErrorCode.MBR_004);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_003));

        ChannelMember channelMember = getChannelMemberOrThrow(channelId, userId);

        if(request.getRole() != null)
            channelMember.updateRole(ChannelMember.Role.valueOf(request.getRole().name()));

        channelMemberRepository.save(channelMember);

        ChannelMemberData data = new ChannelMemberData();
        if(request.getRole() != null)
            data.setRole(ChannelMemberData.RoleEnum.fromValue(channelMember.getRole().name()));

        data.setUserId(userId);
        data.setNickname(user.getNickname());

        return data;
    }

    @Transactional
    public WorkspaceMemberLeaveResponseData leaveWorkspaceMember(Long workspaceId) {
        Long uid = getCurrentUserId();

        // 워크스페이스에 해당 유저가 있는지 확인
        WorkspaceMember workspaceMember = getWorkspaceMemberOrThrow(workspaceId, uid);

        // 워크스페이스의 OWNER이면 나갈 수 없음(삭제해야됨)
        if(workspaceMember.getRole().equals(WorkspaceMember.Role.OWNER)) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        // 멤버가 속했던 채널들의 채널 멤버 먼저 삭제
        List<Channel> channels = channelRepository.findByWorkspaceId(workspaceId);
        for (Channel channel : channels) {
            channelMemberRepository.findByChannelIdAndUserId(channel.getId(), uid)
                    .ifPresent(channelMemberRepository::delete);
        }

        // 워크스페이스 멤버 삭제
        workspaceMemberRepository.delete(workspaceMember);

        WorkspaceMemberLeaveResponseData data = new WorkspaceMemberLeaveResponseData();
        data.setMessage("워크스페이스 탈퇴 성공");

        return data;
    }

    @Transactional
    public ChannelMemberLeaveResponseData leaveChannelMember(Long workspaceId, Long channelId) {
        Long uid = getCurrentUserId();

        // 채널이 있는지 확인(워크스페이스 있는지 확인 알수없음, 파라미터)
        Channel channel = channelRepository.findByWorkspaceIdAndId(workspaceId, channelId)
                .orElseThrow(() -> new ApiException(ErrorCode.CH_002));

        // 채널에 해당 유저가 있는지 확인
        ChannelMember channelMember = getChannelMemberOrThrow(channelId, uid);

        // 채널의 OWNER이면 나갈 수 없음(삭제해야됨)
        if(channelMember.getRole().equals(ChannelMember.Role.OWNER)) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        // 나가는 채널이 상위 채널
        if(channel.getParentId() == null) {
            List<Channel> subChannels = channelRepository.findByParentId(channel.getId());
            for(Channel subChannel : subChannels) {
                channelMemberRepository.findByChannelIdAndUserId(subChannel.getId(), uid)
                                .ifPresent(channelMemberRepository::delete);
            }
        }

        channelMemberRepository.delete(channelMember);

        ChannelMemberLeaveResponseData data = new ChannelMemberLeaveResponseData();
        data.setMessage("채널 탈퇴 성공");

        return data;
    }

    @Transactional
    public WorkspaceMemberRemoveResponseData removeWorkspaceMember(Long workspaceId, Long userId) {
        Long ownerId = getCurrentUserId();

        // 추방할 유저가 워크스페이스에 소속되어 있는지 확인
        WorkspaceMember workspaceMember = getWorkspaceMemberOrThrow(workspaceId, userId);

        WorkspaceMember workspaceOwner = getWorkspaceMemberOrThrow(workspaceId, ownerId);

        // 워크스페이스의 OWNER가 아니면 추방 불가
        if(!hasPermission(workspaceId, workspaceOwner, WorkspacePermission.Permission.REMOVE_WORKSPACE_MEMBER)) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        // OWNER가 자기 자신을 추방 불가
        if(ownerId.equals(userId)) {
            throw new ApiException(ErrorCode.MBR_004);
        }

        // 멤버가 속했던 채널들의 채널 멤버 먼저 삭제
        List<Channel> channels = channelRepository.findByWorkspaceId(workspaceId);
        for (Channel channel : channels) {
            channelMemberRepository.findByChannelIdAndUserId(channel.getId(), userId)
                    .ifPresent(channelMemberRepository::delete);
        }

        workspaceMemberRepository.delete(workspaceMember);

        WorkspaceMemberRemoveResponseData data = new WorkspaceMemberRemoveResponseData();
        data.setMessage("워크스페이스 추방 성공");

        return data;
    }

    @Transactional
    public ChannelMemberRemoveResponseData removeChannelMember(Long workspaceId, Long channelId, Long userId) {
        Long ownerId = getCurrentUserId();

        // 채널이 있는지 확인(워크스페이스 있는지 확인 알수없음, 파라미터)
        Channel channel = channelRepository.findByWorkspaceIdAndId(workspaceId, channelId)
                .orElseThrow(() -> new ApiException(ErrorCode.CH_002));

        // 추방할 유저가 채널에 소속되어 있는지 확인
        ChannelMember channelMember = getChannelMemberOrThrow(channelId, userId);

        ChannelMember channelOwner = getChannelMemberOrThrow(channelId, ownerId);

        // 채널의 permission에 따른 수정
        if(!hasPermission(workspaceId, channelOwner, WorkspacePermission.Permission.REMOVE_CHANNEL_MEMBER)) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        // OWNER이 채널의 자기 자신을 추방 불가
        if(ownerId.equals(userId))
            throw new ApiException(ErrorCode.MBR_004);

        // 나가는 채널이 상위 채널
        if(channel.getParentId() == null) {
            List<Channel> subChannels = channelRepository.findByParentId(channel.getId());
            for(Channel subChannel : subChannels) {
                channelMemberRepository.findByChannelIdAndUserId(subChannel.getId(), userId)
                        .ifPresent(channelMemberRepository::delete);
            }
        }

        channelMemberRepository.delete(channelMember);

        ChannelMemberRemoveResponseData data = new ChannelMemberRemoveResponseData();
        data.setMessage("채널 추방 성공");

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

    private WorkspaceMember getWorkspaceMemberOrThrow(Long workspaceId, Long userId) {
        return workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.MBR_003));
    }

    private ChannelMember getChannelMemberOrThrow(Long channelId, Long userId) {
        return channelMemberRepository.findByChannelIdAndUserId(channelId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.MBR_003));
    }

    private boolean hasPermission(Long workspaceId, WorkspaceMember member, WorkspacePermission.Permission permission) {
        if (member.getRole() == WorkspaceMember.Role.OWNER) return true;
        if (member.getRole() == WorkspaceMember.Role.MEMBER) return false;

        // ADMIN이면 워크스페이스별 권한 테이블 조회
        return workspacePermissionRepository
                .existsByWorkspaceIdAndPermissionAndAdminAllowed(workspaceId, permission, true);
    }

    private boolean hasPermission(Long workspaceId, ChannelMember member, WorkspacePermission.Permission permission) {
        if (member.getRole() == ChannelMember.Role.OWNER) return true;
        if (member.getRole() == ChannelMember.Role.MEMBER) return false;

        // ADMIN이면 워크스페이스별 권한 테이블 조회
        return workspacePermissionRepository
                .existsByWorkspaceIdAndPermissionAndAdminAllowed(workspaceId, permission, true);
    }

    @Transactional
    public TransferWorkspaceOwnershipResponseData transferWorkspaceOwnership(Long workspaceId, TransferWorkspaceOwnershipRequest request) {
        Long previousOwnerId = getCurrentUserId();

        User previousUser = userRepository.findById(previousOwnerId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_003));
        User newUser = userRepository.findById(request.getNewOwnerUserId())
                .orElseThrow(() -> new ApiException(ErrorCode.USER_003));

        WorkspaceMember previousOwner = getWorkspaceMemberOrThrow(workspaceId, previousOwnerId);
        WorkspaceMember newOwner = getWorkspaceMemberOrThrow(workspaceId, request.getNewOwnerUserId());

        if(!previousOwner.getRole().equals(WorkspaceMember.Role.OWNER)) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        if (previousOwnerId.equals(request.getNewOwnerUserId())) {
            throw new ApiException(ErrorCode.MBR_004);
        }

        newOwner.updateRole(WorkspaceMember.Role.OWNER);
        previousOwner.updateRole(WorkspaceMember.Role.ADMIN);

        TransferWorkspaceOwnershipResponseData data = new TransferWorkspaceOwnershipResponseData();
        WorkspaceMemberData newOwnerData = new WorkspaceMemberData();
        WorkspaceMemberData previousOwnerData = new WorkspaceMemberData();

        newOwnerData.setUserId(newOwner.getUserId());
        newOwnerData.setNickname(newUser.getNickname());
        newOwnerData.setRole(WorkspaceMemberData.RoleEnum.fromValue(newOwner.getRole().name()));

        previousOwnerData.setUserId(previousOwner.getUserId());
        previousOwnerData.setNickname(previousUser.getNickname());
        previousOwnerData.setRole(WorkspaceMemberData.RoleEnum.fromValue(previousOwner.getRole().name()));

        data.setNewOwner(newOwnerData);
        data.setPreviousOwner(previousOwnerData);
        data.setMessage("워크스페이스 OWNER 위임 성공");

        return data;
    }

    @Transactional
    public TransferChannelOwnershipResponseData transferChannelOwnership(Long workspaceId, Long channelId, TransferChannelOwnershipRequest request) {
        Long previousOwnerId = getCurrentUserId();

        User previousUser = userRepository.findById(previousOwnerId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_003));
        User newUser = userRepository.findById(request.getNewOwnerUserId())
                .orElseThrow(() -> new ApiException(ErrorCode.USER_003));

        Channel channel = getChannelOrThrow(workspaceId, channelId);

        ChannelMember previousOwner = getChannelMemberOrThrow(channelId, previousOwnerId);
        ChannelMember newOwner = getChannelMemberOrThrow(channelId, request.getNewOwnerUserId());

        if(!previousOwner.getRole().equals(ChannelMember.Role.OWNER)) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        if (previousOwnerId.equals(request.getNewOwnerUserId())) {
            throw new ApiException(ErrorCode.MBR_004);
        }

        newOwner.updateRole(ChannelMember.Role.OWNER);
        previousOwner.updateRole(ChannelMember.Role.ADMIN);

        TransferChannelOwnershipResponseData data = new TransferChannelOwnershipResponseData();
        ChannelMemberData newOwnerData = new ChannelMemberData();
        ChannelMemberData previousOwnerData = new ChannelMemberData();

        newOwnerData.setUserId(newOwner.getUserId());
        newOwnerData.setNickname(newUser.getNickname());
        newOwnerData.setRole(ChannelMemberData.RoleEnum.fromValue(newOwner.getRole().name()));

        previousOwnerData.setUserId(previousOwner.getUserId());
        previousOwnerData.setNickname(previousUser.getNickname());
        previousOwnerData.setRole(ChannelMemberData.RoleEnum.fromValue(previousOwner.getRole().name()));

        data.setNewOwner(newOwnerData);
        data.setPreviousOwner(previousOwnerData);
        data.setMessage("채널 OWNER 위임 성공");

        return data;
    }

    private Channel getChannelOrThrow(Long workspaceId, Long channelId) {
        return channelRepository.findByWorkspaceIdAndId(workspaceId, channelId)
                .orElseThrow(() -> new ApiException(ErrorCode.CH_002));
    }
}
