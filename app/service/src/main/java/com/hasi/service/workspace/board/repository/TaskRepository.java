package com.hasi.service.workspace.board.repository;

import com.hasi.service.workspace.board.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByBoardId(Long boardId);

    // 경로의 boardId와 taskId가 실제로 이어져 있는지까지 확인
    Optional<Task> findByBoardIdAndId(Long boardId, Long id);

    void deleteByBoardId(Long boardId);
}
