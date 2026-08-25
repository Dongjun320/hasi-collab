package com.hasi.service.workspace.workspace;

import com.hasi.collab.api.WorkspaceApi;
import com.hasi.collab.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WorkspaceController implements WorkspaceApi {

    private final WorkspaceService workspaceService;

    @Override
    public ResponseEntity<WorkspaceCreateResponse> createWorkspace(WorkspaceCreateRequest workspaceCreateRequest) {
        WorkspaceData data = workspaceService.createWorkspace(workspaceCreateRequest);
        WorkspaceCreateResponse response = new WorkspaceCreateResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<WorkspaceGetResponse> getWorkspace(Long workspaceId) {
        WorkspaceData data = workspaceService.getWorkspace(workspaceId);
        WorkspaceGetResponse response = new WorkspaceGetResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<WorkspaceGetUserSpaceResponse> getWorkspaceUserSpace() {
        List<WorkspaceGetUserSpaceResponseDataInner> data = workspaceService.getWorkspaceUserSpace();
        WorkspaceGetUserSpaceResponse response = new WorkspaceGetUserSpaceResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<WorkspacePatchResponse> patchWorkspace(Long workspaceId, WorkspacePatchRequest request) {
        WorkspaceData data = workspaceService.patchWorkspace(workspaceId, request);
        WorkspacePatchResponse response = new WorkspacePatchResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);

    }

    @Override
    public ResponseEntity<WorkspaceDeleteResponse> deleteWorkspace(Long workspaceId) {
        WorkspaceDeleteResponseData data = workspaceService.deleteWorkspace(workspaceId);
        WorkspaceDeleteResponse response = new WorkspaceDeleteResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<WorkspacePermissionsGetResponse> getWorkspacePermissions(Long workspaceId) {
        List<WorkspacePermissionData> data = workspaceService.getWorkspacePermissions(workspaceId);
        WorkspacePermissionsGetResponse response = new WorkspacePermissionsGetResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<WorkspacePermissionsPatchResponse> patchWorkspacePermissions(Long workspaceId, WorkspacePermissionsPatchRequest request) {
        List<WorkspacePermissionData> data = workspaceService.patchWorkspacePermissions(workspaceId, request);
        WorkspacePermissionsPatchResponse response = new WorkspacePermissionsPatchResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<WorkspacePermissionsGetResponse> getUserWorkspacePermissions(Long workspaceId) {
        List<WorkspacePermissionData> data = workspaceService.getUserWorkspacePermissions(workspaceId);
        WorkspacePermissionsGetResponse response = new WorkspacePermissionsGetResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    // 워크스페이스 아이콘(이미지) 업로드/삭제 — 프로필 아바타와 동일하게 multipart 손수 처리(openapi 스펙 외)
    @PostMapping(value = "/api/workspaces/{workspaceId}/icon", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateWorkspaceIcon(
            @PathVariable Long workspaceId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(workspaceService.updateIcon(workspaceId, file));
    }

    @DeleteMapping("/api/workspaces/{workspaceId}/icon/delete")
    public ResponseEntity<Void> deleteWorkspaceIcon(@PathVariable Long workspaceId) {
        workspaceService.deleteIcon(workspaceId);
        return ResponseEntity.ok().build();
    }

}
