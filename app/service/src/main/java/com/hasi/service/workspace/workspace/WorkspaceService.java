package com.hasi.service.workspace.workspace;

import com.hasi.collab.model.*;
import com.hasi.service.common.ApiException;
import com.hasi.service.common.ErrorCode;
import com.hasi.service.workspace.board.entity.Board;
import com.hasi.service.workspace.board.repository.BoardMemberRepository;
import com.hasi.service.workspace.board.repository.BoardRepository;
import com.hasi.service.workspace.board.repository.TaskRepository;
import com.hasi.service.workspace.channel.entity.Channel;
import com.hasi.service.workspace.channel.repository.ChannelRepository;
import com.hasi.service.workspace.member.entity.ChannelMember;
import com.hasi.service.workspace.member.entity.WorkspaceMember;
import com.hasi.service.workspace.member.repository.ChannelMemberRepository;
import com.hasi.service.workspace.member.repository.WorkspaceMemberRepository;
import com.hasi.service.workspace.workspace.entity.Workspace;
import com.hasi.service.workspace.workspace.entity.WorkspacePermission;
import com.hasi.service.workspace.workspace.repository.WorkspacePermissionRepository;
import com.hasi.service.workspace.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ChannelRepository channelRepository;
    private final ChannelMemberRepository channelMemberRepository;
    private final BoardRepository boardRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final TaskRepository taskRepository;
    private final WorkspacePermissionRepository workspacePermissionRepository;

    @Transactional
    public WorkspaceData createWorkspace(WorkspaceCreateRequest request) {

        Long ownerId = getCurrentUserId();

        // Entity 생성
        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .isPrivate(request.getIsPrivate())
                .description(request.getDescription().orElse(null))
                .iconUrl(request.getIconUrl().orElse(null))
                .defaultChannelId(null)
                .ownerId(ownerId)
                .build();

        // DB 저장
        Workspace saved = workspaceRepository.save(workspace);

        // owner를 워크스페이스 멤버로 등록
        WorkspaceMember workspaceOwner = WorkspaceMember.builder()
                .workspaceId(saved.getId())
                .userId(ownerId)
                .role(WorkspaceMember.Role.OWNER)
                .build();
        workspaceMemberRepository.save(workspaceOwner);

        // Channel 엔티티 생성 및 저장
        Channel channel = Channel.builder()
                .workspaceId(workspace.getId())
                .parentId(null)
                .name("공지사항")
                .isPrivate(false)
                .build();

        channelRepository.save(channel);

        ChannelMember channelOwner = ChannelMember.builder()
                .channelId(channel.getId())
                .userId(ownerId)
                .role(ChannelMember.Role.OWNER)
                .build();

        channelMemberRepository.save(channelOwner);

        workspace.updateDefaultChannelId(channel.getId());

        // WorkspacePermission 엔티티 생성 및 저장
        for (WorkspacePermission.Permission permission : WorkspacePermission.Permission.values()) {
            workspacePermissionRepository.save(
                    WorkspacePermission.builder()
                            .workspaceId(saved.getId())
                            .permission(permission)
                            .adminAllowed(false)
                            .build()
            );
        }

        // DTO 변환
        WorkspaceData data = new WorkspaceData();
        data.setId(saved.getId());
        data.setName(saved.getName());
        data.setOwnerId(saved.getOwnerId());
        data.setIsPrivate(saved.isPrivate());
        data.setDescription(JsonNullable.of(saved.getDescription()));
        data.setIconUrl(JsonNullable.of(saved.getIconUrl()));
        data.setDefaultChannelId(JsonNullable.of(saved.getDefaultChannelId()));
        data.setCreatedAt(saved.getCreatedAt().atOffset(ZoneOffset.UTC));
        data.setUpdatedAt(saved.getUpdatedAt().atOffset(ZoneOffset.UTC));

        return data;
    }

    public WorkspaceData getWorkspace(Long workspaceId) {
        // 워크스페이스 찾기
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.WS_002));

        // 해당 워크스페이스의 값을 DATA에 넣음
        WorkspaceData data = new WorkspaceData();
        data.setId(workspace.getId());
        data.setName(workspace.getName());
        data.setOwnerId(workspace.getOwnerId());
        data.setIsPrivate(workspace.isPrivate());
        data.setDescription(JsonNullable.of(workspace.getDescription()));
        data.setIconUrl(JsonNullable.of(workspace.getIconUrl()));
        data.setDefaultChannelId(JsonNullable.of(workspace.getDefaultChannelId()));
        data.setCreatedAt(workspace.getCreatedAt().atOffset(ZoneOffset.UTC));
        data.setUpdatedAt(workspace.getUpdatedAt().atOffset(ZoneOffset.UTC));

        return data;
    }

    public List<WorkspaceGetUserSpaceResponseDataInner> getWorkspaceUserSpace() {

        Long uid = getCurrentUserId();

        // 자신이 들어간 워크스페이스 목록 추출
        List<WorkspaceMember> members = workspaceMemberRepository.findByUserId(uid);

        // 해당 워크스페이스의 값을 DATA에 넣음
        List<WorkspaceGetUserSpaceResponseDataInner> data = new ArrayList<>();
        for (WorkspaceMember member : members) {
            Workspace workspace = workspaceRepository.findById(member.getWorkspaceId())
                    .orElseThrow(() -> new ApiException(ErrorCode.WS_002));
            WorkspaceGetUserSpaceResponseDataInner item = new WorkspaceGetUserSpaceResponseDataInner();
            item.setId(workspace.getId());
            item.setName(workspace.getName());
            item.setIconUrl(JsonNullable.of(workspace.getIconUrl()));
            item.setRole(member.getRole().name());

            data.add(item);
        }

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

    @Transactional
    public WorkspaceData patchWorkspace(Long workspaceId, WorkspacePatchRequest request) {

        Long uid = getCurrentUserId();

        // 워크스페이스가 있는지 확인
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.WS_002));

        // 워크스페이스에 소속한 멤버가 아니면 접근불가
        WorkspaceMember workspaceMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, uid)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_004));

        // permission에 따른 수정
        if(!hasPermission(workspaceId, workspaceMember, WorkspacePermission.Permission.EDIT_WORKSPACE)) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        if(request.getName() != null) {
            workspace.updateName(request.getName());
        }
        if(request.getDescription().isPresent()) {
            workspace.updateDescription(request.getDescription().get());
        }
        if(request.getIconUrl().isPresent()) {
            workspace.updateIconUrl(request.getIconUrl().get());
        }
        if(request.getIsPrivate() != null) {
            workspace.updateIsPrivate(request.getIsPrivate());
        }
        if(request.getDefaultChannelId() != null) {
            workspace.updateDefaultChannelId(request.getDefaultChannelId());
        }

        WorkspaceData data = new WorkspaceData();
        data.setId(workspace.getId());
        data.setName(workspace.getName());
        data.setOwnerId(workspace.getOwnerId());
        data.setIsPrivate(workspace.isPrivate());
        data.setDescription(JsonNullable.of(workspace.getDescription()));
        data.setIconUrl(JsonNullable.of(workspace.getIconUrl()));
        data.setDefaultChannelId(JsonNullable.of(workspace.getDefaultChannelId()));
        data.setCreatedAt(workspace.getCreatedAt().atOffset(ZoneOffset.UTC));
        data.setUpdatedAt(workspace.getUpdatedAt().atOffset(ZoneOffset.UTC));

        return data;
    }

    @Transactional
    public WorkspaceDeleteResponseData deleteWorkspace(Long workspaceId) {

        Long uid = getCurrentUserId();

        // 워크스페이스가 있는지 확인
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.WS_002));

        // 워크스페이스에 소속한 멤버가 아니면 접근불가
        WorkspaceMember workspaceMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, uid)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_004));

        // permission에 따른 수정
        if(!hasPermission(workspaceId, workspaceMember, WorkspacePermission.Permission.DELETE_WORKSPACE)) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        // 워크스페이스 소속 채널들의 채널 멤버 먼저 삭제
        List<Channel> channels = channelRepository.findByWorkspaceId(workspaceId);
        for (Channel channel : channels) {
            channelMemberRepository.deleteByChannelId(channel.getId());
        }

        // 채널 삭제
        channelRepository.deleteAll(channels);

        // 워크스페이스 소속 보드들의 태스크·부서원 먼저 삭제
        List<Board> boards = boardRepository.findByWorkspaceId(workspaceId);
        for (Board board : boards) {
            taskRepository.deleteByBoardId(board.getId());
            boardMemberRepository.deleteByBoardId(board.getId());
        }

        // 보드 삭제
        boardRepository.deleteAll(boards);

        // 워크스페이스 멤버 삭제
        workspaceMemberRepository.deleteByWorkspaceId(workspaceId);

        // 워크스페이스 권한 삭제
        workspacePermissionRepository.deleteByWorkspaceId(workspaceId);

        // 워크스페이스 삭제
        workspaceRepository.delete(workspace);
        
        WorkspaceDeleteResponseData data = new WorkspaceDeleteResponseData();
        data.setMessage("워크스페이스 삭제 완료");

        return data;
    }

    private boolean hasPermission(Long workspaceId, WorkspaceMember member, WorkspacePermission.Permission permission) {
        if (member.getRole() == WorkspaceMember.Role.OWNER) return true;
        if (member.getRole() == WorkspaceMember.Role.MEMBER) return false;

        // ADMIN이면 워크스페이스별 권한 테이블 조회
        return workspacePermissionRepository
                .existsByWorkspaceIdAndPermissionAndAdminAllowed(workspaceId, permission, true);
    }

    public List<WorkspacePermissionData> getWorkspacePermissions(Long workspaceId) {
        Long ownerId = getCurrentUserId();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.WS_002));

        if(!ownerId.equals(workspace.getOwnerId())) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        List<WorkspacePermission> permissions = workspacePermissionRepository.findByWorkspaceId(workspaceId);

        List<WorkspacePermissionData> data = new ArrayList<>();

        for (WorkspacePermission permission : permissions) {
            WorkspacePermissionData item = new WorkspacePermissionData();
            item.setPermission(WorkspacePermissionData.PermissionEnum.fromValue(permission.getPermission().name()));
            item.setAdminAllowed(permission.isAdminAllowed());
            data.add(item);
        }

        return data;
    }

    @Transactional
    public List<WorkspacePermissionData> patchWorkspacePermissions(Long workspaceId, WorkspacePermissionsPatchRequest request) {
        Long ownerId = getCurrentUserId();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.WS_002));

        if(!ownerId.equals(workspace.getOwnerId())) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        for (WorkspacePermissionsPatchRequestPermissionsInner item : request.getPermissions()) {
            WorkspacePermission permission = workspacePermissionRepository
                    .findByWorkspaceIdAndPermission(workspaceId, WorkspacePermission.Permission.valueOf(item.getPermission().name()))
                    .orElseThrow(() -> new ApiException(ErrorCode.AUTH_004));

            permission.updateAdminAllowed(item.getAdminAllowed());
        }

        List<WorkspacePermission> permissions = workspacePermissionRepository.findByWorkspaceId(workspaceId);
        List<WorkspacePermissionData> data = new ArrayList<>();

        for (WorkspacePermission permission : permissions) {
            WorkspacePermissionData permissionData = new WorkspacePermissionData();
            permissionData.setPermission(WorkspacePermissionData.PermissionEnum.fromValue(permission.getPermission().name()));
            permissionData.setAdminAllowed(permission.isAdminAllowed());
            data.add(permissionData);
        }

        return data;
    }
}
