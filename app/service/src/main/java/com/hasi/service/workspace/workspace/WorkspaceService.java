package com.hasi.service.workspace.workspace;

import com.hasi.collab.model.*;
import com.hasi.service.common.ApiException;
import com.hasi.service.common.ErrorCode;
import com.hasi.service.workspace.member.entity.WorkspaceMember;
import com.hasi.service.workspace.member.repository.WorkspaceMemberRepository;
import com.hasi.service.workspace.workspace.entity.Workspace;
import com.hasi.service.workspace.workspace.repository.WorkspaceRepository;
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
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @Transactional
    public WorkspaceData createWorkspace(WorkspaceCreateRequest request) {

        Long ownerId = getCurrentUserId();

        // Entity 생성
        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .isPrivate(request.getIsPrivate())
                .description(request.getDescription())
                .iconUrl(request.getIconUrl())
                .ownerId(ownerId)
                .build();

        // DB 저장
        Workspace saved = workspaceRepository.save(workspace);

        // owner를 워크스페이스 멤버로 등록
        WorkspaceMember ownerMember = WorkspaceMember.builder()
                .workspaceId(saved.getId())
                .userId(ownerId)
                .role(WorkspaceMember.Role.OWNER)
                .build();
        workspaceMemberRepository.save(ownerMember);


        // DTO 변환
        WorkspaceData data = new WorkspaceData();
        data.setId(saved.getId());
        data.setName(saved.getName());
        data.setOwnerId(saved.getOwnerId());
        data.setIsPrivate(saved.isPrivate());
        data.setDescription(JsonNullable.of(saved.getDescription()));
        data.setIconUrl(JsonNullable.of(saved.getIconUrl()));
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

        // 워크스페이스에 소속한 멤버가 아니면 접근불가
        WorkspaceMember workspaceMember = workspaceMemberRepository.findByUserIdAndWorkspaceId(uid, workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_004));

        // owner가 아니면 수정 불가
        if(!workspaceMember.getRole().name().equals("OWNER")) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.WS_002));

        if(request.getName() != null) {
            workspace.updateName(request.getName());
        }
        if(request.getDescription() != null) {
            workspace.updateDescription(request.getDescription());
        }
        if(request.getIconUrl() != null) {
            workspace.updateIconUrl(request.getIconUrl());
        }
        if(request.getIsPrivate() != null) {
            workspace.updateIsPrivate(request.getIsPrivate());
        }

        WorkspaceData data = new WorkspaceData();
        data.setId(workspace.getId());
        data.setName(workspace.getName());
        data.setOwnerId(workspace.getOwnerId());
        data.setIsPrivate(workspace.isPrivate());
        data.setDescription(JsonNullable.of(workspace.getDescription()));
        data.setIconUrl(JsonNullable.of(workspace.getIconUrl()));
        data.setCreatedAt(workspace.getCreatedAt().atOffset(ZoneOffset.UTC));
        data.setUpdatedAt(workspace.getUpdatedAt().atOffset(ZoneOffset.UTC));

        return data;
    }

    @Transactional
    public WorkspaceDeleteResponseData deleteWorkspace(Long workspaceId) {

        Long uid = getCurrentUserId();
        
        // 워크스페이스에 소속한 멤버가 아니면 접근불가
        WorkspaceMember workspaceMember = workspaceMemberRepository.findByUserIdAndWorkspaceId(uid, workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_004));

        // owner가 아니면 삭제 불가
        if(!workspaceMember.getRole().name().equals("OWNER")) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                        .orElseThrow(() -> new ApiException(ErrorCode.WS_002));

        workspaceMemberRepository.deleteByWorkspaceId(workspaceId);
        workspaceRepository.delete(workspace);
        
        WorkspaceDeleteResponseData data = new WorkspaceDeleteResponseData();
        data.setMessage("워크스페이스 삭제 완료");

        return data;
    }
}
