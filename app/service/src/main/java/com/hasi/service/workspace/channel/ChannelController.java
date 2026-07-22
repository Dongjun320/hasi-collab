package com.hasi.service.workspace.channel;

import com.hasi.collab.api.WorkspaceChannelApi;
import com.hasi.collab.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChannelController implements WorkspaceChannelApi {
    private final ChannelService channelService;

    @Override
    public ResponseEntity<ChannelCreateResponse> createWorkspaceChannel(Long workspaceId, ChannelCreateRequest request) {
        ChannelData data = channelService.createWorkspaceChannel(workspaceId, request);
        ChannelCreateResponse response = new ChannelCreateResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<ChannelDetailResponse> getWorkspaceChannel(Long workspaceId, Long channelId) {
        ChannelDetailResponseData data = channelService.getWorkspaceChannel(workspaceId, channelId);
        ChannelDetailResponse response = new ChannelDetailResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ChannelListResponse> getWorkspaceChannels(Long workspaceId) {
        List<ChannelData> data = channelService.getWorkspaceChannels(workspaceId);
        ChannelListResponse response = new ChannelListResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ChannelPatchResponse> patchWorkspaceChannel(Long workspaceId, Long channelId, ChannelPatchRequest request) {
        ChannelData data = channelService.patchWorkspaceChannel(workspaceId, channelId, request);
        ChannelPatchResponse response = new ChannelPatchResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ChannelDeleteResponse> deleteWorkspaceChannel(Long workspaceId, Long channelId) {
        ChannelDeleteResponseData data = channelService.deleteWorkspaceChannel(workspaceId, channelId);
        ChannelDeleteResponse response = new ChannelDeleteResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }


}
