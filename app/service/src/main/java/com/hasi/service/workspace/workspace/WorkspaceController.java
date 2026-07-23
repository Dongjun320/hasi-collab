package com.hasi.service.workspace.workspace;

import com.hasi.collab.api.WorkspaceApi;
import com.hasi.collab.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

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

}
