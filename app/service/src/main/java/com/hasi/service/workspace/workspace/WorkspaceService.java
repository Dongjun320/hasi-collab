package com.hasi.service.workspace.workspace;

import com.hasi.collab.model.WorkspaceCreateRequest;
import com.hasi.collab.model.WorkspaceData;
import com.hasi.collab.model.WorkspaceGetUserSpaceResponseDataInner;
import com.hasi.collab.model.WorkspaceMemberData;
import com.hasi.service.common.ApiException;
import com.hasi.service.common.ErrorCode;
import com.hasi.service.workspace.member.entity.WorkspaceMember;
import com.hasi.service.workspace.member.repository.WorkspaceMemberRepository;
import com.hasi.service.workspace.workspace.entity.Workspace;
import com.hasi.service.workspace.workspace.repository.WorkspaceRepository;
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

    public WorkspaceData createWorkspace(WorkspaceCreateRequest request) {

        // ownerId를 JWT SecurityContextHolder에서 추출
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || authentication.getName() == null) {
            throw new ApiException(ErrorCode.AUTH_003); // 추후 커스텀 에러 작성 및 교체 필요
        }
        Long ownerId = Long.valueOf(authentication.getName());

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
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001)); // 추후 커스텀 에러 작성 및 교체 필요

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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || authentication.getName() == null) {
            throw new ApiException(ErrorCode.AUTH_003); // 추후 커스텀 에러 작성 및 교체 필요
        }
        Long uid = Long.valueOf(authentication.getName());

        List<WorkspaceMember> members = workspaceMemberRepository.findByUserId(uid);

        List<WorkspaceGetUserSpaceResponseDataInner> data = new ArrayList<>();
        for (WorkspaceMember member : members) {
            Workspace workspace = workspaceRepository.findById(member.getWorkspaceId())
                    .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001)); // 추후 커스텀 에러 작성 및 교체 필요
            WorkspaceGetUserSpaceResponseDataInner item = new WorkspaceGetUserSpaceResponseDataInner();
            item.setId(workspace.getId());
            item.setName(workspace.getName());
            item.setIconUrl(JsonNullable.of(workspace.getIconUrl()));
            item.setRole(member.getRole().name());

            data.add(item);
        }

        return data;
    }
}
