package com.hasi.service.workspace.board;

import com.hasi.collab.model.*;
import com.hasi.service.auth.entity.User;
import com.hasi.service.auth.repository.UserRepository;
import com.hasi.service.common.ApiException;
import com.hasi.service.common.ErrorCode;
import com.hasi.service.workspace.board.entity.Board;
import com.hasi.service.workspace.board.entity.BoardMember;
import com.hasi.service.workspace.board.entity.Task;
import com.hasi.service.workspace.board.repository.BoardMemberRepository;
import com.hasi.service.workspace.board.repository.BoardRepository;
import com.hasi.service.workspace.board.repository.TaskRepository;
import com.hasi.service.workspace.member.entity.WorkspaceMember;
import com.hasi.service.workspace.member.repository.WorkspaceMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

/**
 * 보드(부서별 칸반) 권한 규칙
 *  - 워크스페이스 OWNER : 모든 보드 조회·수정·삭제 가능
 *  - 부서장(board.ownerId) : 자기 보드의 부서원·태스크 관리 가능
 *  - 부서원(BoardMember) : 조회 + 본인이 담당자인 태스크의 status만 변경 가능
 */
@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final TaskRepository taskRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    // ────────────────────────── 보드 ──────────────────────────

    public List<BoardData> listBoards(Long workspaceId) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = requireWorkspaceMember(workspaceId, uid);

        List<Board> boards = boardRepository.findByWorkspaceId(workspaceId);

        List<BoardData> data = new ArrayList<>();

        // 접근 가능한 보드만 담음 (OWNER는 전체, 나머지는 부서장이거나 부서원인 보드만)
        for (Board board : boards) {
            if (!hasBoardAccess(board, workspaceMember, uid)) {
                continue;
            }
            data.add(toBoardData(board));
        }
        return data;
    }

    @Transactional
    public BoardData createBoard(Long workspaceId, BoardCreateRequest request) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = requireWorkspaceMember(workspaceId, uid);

        // 보드 생성은 워크스페이스 OWNER만 가능
        if (workspaceMember.getRole() != WorkspaceMember.Role.OWNER) {
            throw new ApiException(ErrorCode.AUTH_004);
        }

        // ownerId 생략 시 생성자 본인이 부서장
        Long ownerId = request.getOwnerId() != null ? request.getOwnerId() : uid;

        // 부서장은 해당 워크스페이스의 OWNER 또는 ADMIN이어야 함
        WorkspaceMember owner = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, ownerId)
                .orElseThrow(() -> new ApiException(ErrorCode.MBR_003));

        if (owner.getRole() == WorkspaceMember.Role.MEMBER) {
            throw new ApiException(ErrorCode.BRD_002);
        }

        Board board = Board.builder()
                .workspaceId(workspaceId)
                .name(request.getName())
                .ownerId(ownerId)
                .build();

        boardRepository.save(board);

        // 부서장은 부서원 목록에도 함께 등록
        boardMemberRepository.save(BoardMember.builder()
                .boardId(board.getId())
                .userId(ownerId)
                .build());

        return toBoardData(board);
    }

    @Transactional
    public BoardData updateBoard(Long workspaceId, Long boardId, BoardUpdateRequest request) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = requireWorkspaceMember(workspaceId, uid);
        Board board = requireBoard(workspaceId, boardId);

        // 이름 변경은 OWNER·부서장, 부서장 교체는 워크스페이스 OWNER만 가능
        requireBoardManager(board, workspaceMember, uid);

        Long newOwnerId = request.getOwnerId();
        if (newOwnerId != null) {
            if (workspaceMember.getRole() != WorkspaceMember.Role.OWNER) {
                throw new ApiException(ErrorCode.AUTH_004);
            }

            WorkspaceMember newOwner = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, newOwnerId)
                    .orElseThrow(() -> new ApiException(ErrorCode.MBR_003));

            if (newOwner.getRole() == WorkspaceMember.Role.MEMBER) {
                throw new ApiException(ErrorCode.BRD_002);
            }

            // 새 부서장이 부서원 목록에 없으면 추가
            if (!boardMemberRepository.existsByBoardIdAndUserId(boardId, newOwnerId)) {
                boardMemberRepository.save(BoardMember.builder()
                        .boardId(boardId)
                        .userId(newOwnerId)
                        .build());
            }
        }

        board.update(request.getName(), newOwnerId);

        return toBoardData(board);
    }

    @Transactional
    public BoardDeleteResponseData deleteBoard(Long workspaceId, Long boardId) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = requireWorkspaceMember(workspaceId, uid);
        Board board = requireBoard(workspaceId, boardId);

        requireBoardManager(board, workspaceMember, uid);

        // 하위 태스크·부서원도 함께 삭제
        taskRepository.deleteByBoardId(boardId);
        boardMemberRepository.deleteByBoardId(boardId);
        boardRepository.delete(board);

        BoardDeleteResponseData data = new BoardDeleteResponseData();
        data.setId(boardId);
        data.setMessage("보드가 삭제되었습니다.");

        return data;
    }

    // ────────────────────────── 부서원 ──────────────────────────

    public List<BoardMemberData> listBoardMembers(Long workspaceId, Long boardId) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = requireWorkspaceMember(workspaceId, uid);
        Board board = requireBoard(workspaceId, boardId);

        requireBoardAccess(board, workspaceMember, uid);

        List<BoardMember> members = boardMemberRepository.findByBoardId(boardId);

        List<BoardMemberData> data = new ArrayList<>();

        for (BoardMember member : members) {
            User user = userRepository.findById(member.getUserId())
                    .orElseThrow(() -> new ApiException(ErrorCode.MBR_001));

            // 워크스페이스 역할을 함께 내려줌 (프론트에서 수정 권한 판단용)
            WorkspaceMember wm = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, member.getUserId())
                    .orElseThrow(() -> new ApiException(ErrorCode.MBR_003));

            BoardMemberData item = new BoardMemberData();
            item.setUserId(user.getUid());
            item.setNickname(user.getNickname());
            item.setRole(BoardMemberData.RoleEnum.fromValue(wm.getRole().name()));

            data.add(item);
        }
        return data;
    }

    @Transactional
    public BoardMemberAddResponseData addBoardMember(Long workspaceId, Long boardId, BoardMemberAddRequest request) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = requireWorkspaceMember(workspaceId, uid);
        Board board = requireBoard(workspaceId, boardId);

        requireBoardManager(board, workspaceMember, uid);

        Long targetId = request.getUserId();

        // 같은 워크스페이스 멤버만 부서원으로 추가 가능
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, targetId)) {
            throw new ApiException(ErrorCode.MBR_003);
        }

        if (boardMemberRepository.existsByBoardIdAndUserId(boardId, targetId)) {
            throw new ApiException(ErrorCode.BRD_003);
        }

        boardMemberRepository.save(BoardMember.builder()
                .boardId(boardId)
                .userId(targetId)
                .build());

        BoardMemberAddResponseData data = new BoardMemberAddResponseData();
        data.setMessage("부서원 추가 완료");
        data.setUserId(targetId);

        return data;
    }

    @Transactional
    public BoardMemberRemoveResponseData removeBoardMember(Long workspaceId, Long boardId, Long userId) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = requireWorkspaceMember(workspaceId, uid);
        Board board = requireBoard(workspaceId, boardId);

        requireBoardManager(board, workspaceMember, uid);

        // 부서장은 부서원 목록에서 뺄 수 없음 (부서장 교체를 먼저 해야 함)
        if (board.getOwnerId().equals(userId)) {
            throw new ApiException(ErrorCode.BRD_002);
        }

        BoardMember member = boardMemberRepository.findByBoardIdAndUserId(boardId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.BRD_005));

        boardMemberRepository.delete(member);

        BoardMemberRemoveResponseData data = new BoardMemberRemoveResponseData();
        data.setMessage("부서원이 제외되었습니다.");

        return data;
    }

    // ────────────────────────── 태스크 ──────────────────────────

    public List<TaskData> listTask(Long workspaceId, Long boardId) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = requireWorkspaceMember(workspaceId, uid);
        Board board = requireBoard(workspaceId, boardId);

        requireBoardAccess(board, workspaceMember, uid);

        List<Task> tasks = taskRepository.findByBoardId(boardId);

        List<TaskData> data = new ArrayList<>();

        for (Task task : tasks) {
            data.add(toTaskData(task));
        }
        return data;
    }

    @Transactional
    public TaskData createTask(Long workspaceId, Long boardId, TaskCreateRequest request) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = requireWorkspaceMember(workspaceId, uid);
        Board board = requireBoard(workspaceId, boardId);

        // 생성 자체는 부서원이면 누구나 가능. 단, 관리자가 아니면 본인 담당으로만 만들 수 있음
        requireBoardAccess(board, workspaceMember, uid);

        Long assigneeId = request.getAssigneeId();
        if (!isBoardManager(board, workspaceMember, uid)) {
            if (assigneeId != null && !assigneeId.equals(uid)) {
                throw new ApiException(ErrorCode.AUTH_004);
            }
            assigneeId = uid;   // 부서원은 항상 본인 담당으로 생성
        } else if (assigneeId != null && !boardMemberRepository.existsByBoardIdAndUserId(boardId, assigneeId)) {
            // 관리자가 담당자를 지정했다면 해당 보드의 부서원이어야 함
            throw new ApiException(ErrorCode.BRD_002);
        }

        Task task = Task.builder()
                .boardId(boardId)
                .title(request.getTitle())
                .content(request.getContent())
                .startDate(request.getStartDate())
                .dueDate(request.getDueDate())
                .status(Task.Status.valueOf(request.getStatus().getValue()))
                .assigneeId(assigneeId)
                .priority(request.getPriority() != null
                        ? Task.Priority.valueOf(request.getPriority().getValue())
                        : null)
                .build();

        taskRepository.save(task);

        return toTaskData(task);
    }

    @Transactional
    public TaskData updateTask(Long workspaceId, Long boardId, Long taskId, TaskUpdateRequest request) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = requireWorkspaceMember(workspaceId, uid);
        Board board = requireBoard(workspaceId, boardId);

        requireBoardAccess(board, workspaceMember, uid);

        Task task = taskRepository.findByBoardIdAndId(boardId, taskId)
                .orElseThrow(() -> new ApiException(ErrorCode.BRD_004));

        // 부서원은 본인이 담당자인 태스크의 status(칸반 이동)만 변경 가능
        if (!isBoardManager(board, workspaceMember, uid)) {
            boolean isAssignee = uid.equals(task.getAssigneeId());
            boolean statusOnly = request.getTitle() == null
                    && request.getContent() == null
                    && request.getStartDate() == null
                    && request.getDueDate() == null
                    && request.getAssigneeId() == null
                    && request.getPriority() == null;

            if (!isAssignee || !statusOnly) {
                throw new ApiException(ErrorCode.AUTH_004);
            }
        }

        // 담당자를 바꾼다면 해당 보드의 부서원이어야 함
        Long assigneeId = request.getAssigneeId();
        if (assigneeId != null && !boardMemberRepository.existsByBoardIdAndUserId(boardId, assigneeId)) {
            throw new ApiException(ErrorCode.BRD_002);
        }

        task.update(
                request.getTitle(),
                request.getContent(),
                request.getStartDate(),
                request.getDueDate(),
                request.getStatus() != null ? Task.Status.valueOf(request.getStatus().getValue()) : null,
                assigneeId,
                request.getPriority() != null ? Task.Priority.valueOf(request.getPriority().getValue()) : null
        );

        return toTaskData(task);
    }

    @Transactional
    public TaskDeleteResponseData deleteTask(Long workspaceId, Long boardId, Long taskId) {

        Long uid = getCurrentUserId();
        WorkspaceMember workspaceMember = requireWorkspaceMember(workspaceId, uid);
        Board board = requireBoard(workspaceId, boardId);

        requireBoardManager(board, workspaceMember, uid);

        Task task = taskRepository.findByBoardIdAndId(boardId, taskId)
                .orElseThrow(() -> new ApiException(ErrorCode.BRD_004));

        taskRepository.delete(task);

        TaskDeleteResponseData data = new TaskDeleteResponseData();
        data.setId(taskId);
        data.setMessage("태스크가 삭제되었습니다.");

        return data;
    }

    // ────────────────────────── 공통 ──────────────────────────

    // 워크스페이스 소속이 아니면 접근 불가
    private WorkspaceMember requireWorkspaceMember(Long workspaceId, Long uid) {
        return workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, uid)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_004));
    }

    // 경로의 workspaceId와 boardId가 이어져 있는지까지 확인
    private Board requireBoard(Long workspaceId, Long boardId) {
        return boardRepository.findByWorkspaceIdAndId(workspaceId, boardId)
                .orElseThrow(() -> new ApiException(ErrorCode.BRD_001));
    }

    // 워크스페이스 OWNER이거나 이 보드의 부서장
    private boolean isBoardManager(Board board, WorkspaceMember workspaceMember, Long uid) {
        return workspaceMember.getRole() == WorkspaceMember.Role.OWNER
                || board.getOwnerId().equals(uid);
    }

    private void requireBoardManager(Board board, WorkspaceMember workspaceMember, Long uid) {
        if (!isBoardManager(board, workspaceMember, uid)) {
            throw new ApiException(ErrorCode.AUTH_004);
        }
    }

    // 관리자이거나 부서원이면 조회 가능
    private boolean hasBoardAccess(Board board, WorkspaceMember workspaceMember, Long uid) {
        return isBoardManager(board, workspaceMember, uid)
                || boardMemberRepository.existsByBoardIdAndUserId(board.getId(), uid);
    }

    private void requireBoardAccess(Board board, WorkspaceMember workspaceMember, Long uid) {
        if (!hasBoardAccess(board, workspaceMember, uid)) {
            throw new ApiException(ErrorCode.AUTH_004);
        }
    }

    private BoardData toBoardData(Board board) {
        BoardData data = new BoardData();
        data.setId(board.getId());
        data.setWorkspaceId(board.getWorkspaceId());
        data.setName(board.getName());
        data.setOwnerId(board.getOwnerId());
        data.setCreatedAt(board.getCreatedAt().atOffset(ZoneOffset.UTC));

        return data;
    }

    private TaskData toTaskData(Task task) {
        TaskData data = new TaskData();
        data.setId(task.getId());
        data.setBoardId(task.getBoardId());
        data.setTitle(task.getTitle());
        data.setContent(task.getContent());
        data.setStartDate(task.getStartDate());
        data.setDueDate(task.getDueDate());
        data.setStatus(TaskData.StatusEnum.fromValue(task.getStatus().name()));
        data.setAssigneeId(task.getAssigneeId());
        data.setPriority(task.getPriority() != null
                ? TaskData.PriorityEnum.fromValue(task.getPriority().name())
                : null);
        data.setCreatedAt(task.getCreatedAt().atOffset(ZoneOffset.UTC));
        data.setUpdatedAt(task.getUpdatedAt().atOffset(ZoneOffset.UTC));

        return data;
    }

    private Long getCurrentUserId() {
        // 현재 userId를 JWT SecurityContextHolder에서 추출
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ApiException(ErrorCode.AUTH_003);
        }
        return Long.valueOf(authentication.getName());
    }
}
