package com.hasi.service.workspace.workspace;

import com.hasi.collab.api.WorkspaceApi;
import com.hasi.collab.model.WorkspaceCreateRequest;
import com.hasi.collab.model.WorkspaceCreateResponse;
import com.hasi.collab.model.WorkspaceData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

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
}
