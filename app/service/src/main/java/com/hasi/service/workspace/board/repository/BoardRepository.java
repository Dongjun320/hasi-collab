package com.hasi.service.workspace.board.repository;

import com.hasi.service.workspace.board.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {

    List<Board> findByWorkspaceId(Long workspaceId);

    // 경로의 workspaceId와 boardId가 실제로 이어져 있는지까지 확인
    Optional<Board> findByWorkspaceIdAndId(Long workspaceId, Long id);
}
