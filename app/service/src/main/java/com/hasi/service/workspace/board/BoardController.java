package com.hasi.service.workspace.board;

import com.hasi.collab.api.BoardApi;
import com.hasi.collab.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BoardController implements BoardApi {
    private final BoardService boardService;

    // ────────────────────────── 보드 ──────────────────────────

    @Override
    public ResponseEntity<BoardListResponse> listBoards(Long workspaceId) {
        List<BoardData> data = boardService.listBoards(workspaceId);
        BoardListResponse response = new BoardListResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<BoardCreateResponse> createBoard(Long workspaceId, BoardCreateRequest request) {
        BoardData data = boardService.createBoard(workspaceId, request);
        BoardCreateResponse response = new BoardCreateResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<BoardUpdateResponse> updateBoard(Long workspaceId, Long boardId, BoardUpdateRequest request) {
        BoardData data = boardService.updateBoard(workspaceId, boardId, request);
        BoardUpdateResponse response = new BoardUpdateResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<BoardDeleteResponse> deleteBoard(Long workspaceId, Long boardId) {
        BoardDeleteResponseData data = boardService.deleteBoard(workspaceId, boardId);
        BoardDeleteResponse response = new BoardDeleteResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    // ────────────────────────── 부서원 ──────────────────────────

    @Override
    public ResponseEntity<BoardMemberListResponse> listBoardMembers(Long workspaceId, Long boardId) {
        List<BoardMemberData> data = boardService.listBoardMembers(workspaceId, boardId);
        BoardMemberListResponse response = new BoardMemberListResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<BoardMemberAddResponse> addBoardMember(Long workspaceId, Long boardId, BoardMemberAddRequest request) {
        BoardMemberAddResponseData data = boardService.addBoardMember(workspaceId, boardId, request);
        BoardMemberAddResponse response = new BoardMemberAddResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<BoardMemberRemoveResponse> removeBoardMember(Long workspaceId, Long boardId, Long userId) {
        BoardMemberRemoveResponseData data = boardService.removeBoardMember(workspaceId, boardId, userId);
        BoardMemberRemoveResponse response = new BoardMemberRemoveResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    // ────────────────────────── 태스크 ──────────────────────────

    @Override
    public ResponseEntity<TaskListResponse> listTask(Long workspaceId, Long boardId) {
        List<TaskData> data = boardService.listTask(workspaceId, boardId);
        TaskListResponse response = new TaskListResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<TaskCreateResponse> createTask(Long workspaceId, Long boardId, TaskCreateRequest request) {
        TaskData data = boardService.createTask(workspaceId, boardId, request);
        TaskCreateResponse response = new TaskCreateResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<TaskUpdateResponse> updateTask(Long workspaceId, Long boardId, Long taskId, TaskUpdateRequest request) {
        TaskData data = boardService.updateTask(workspaceId, boardId, taskId, request);
        TaskUpdateResponse response = new TaskUpdateResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<TaskDeleteResponse> deleteTask(Long workspaceId, Long boardId, Long taskId) {
        TaskDeleteResponseData data = boardService.deleteTask(workspaceId, boardId, taskId);
        TaskDeleteResponse response = new TaskDeleteResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);

        return ResponseEntity.ok(response);
    }
}
