package com.hasi.service.workspace.board.repository;

import com.hasi.service.workspace.board.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {

    List<Board> findByWorkspaceId(Long workspaceId);
}
