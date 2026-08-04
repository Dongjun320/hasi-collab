package com.hasi.service.workspace.board.repository;

import com.hasi.service.workspace.board.entity.BoardMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BoardMemberRepository extends JpaRepository<BoardMember, Long> {

    List<BoardMember> findByBoardId(Long boardId);

    List<BoardMember> findByUserId(Long userId);

    Optional<BoardMember> findByBoardIdAndUserId(Long boardId, Long userId);

    boolean existsByBoardIdAndUserId(Long boardId, Long userId);

    void deleteByBoardId(Long boardId);
}
