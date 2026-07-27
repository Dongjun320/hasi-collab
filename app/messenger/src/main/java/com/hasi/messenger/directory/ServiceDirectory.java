package com.hasi.messenger.directory;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 읽기 전용으로. JPA로 Entity 생성 시 충돌 가능
 * @author Jinwoo Jeong
 */
@Repository
public class ServiceDirectory {

    private final JdbcTemplate jdbcTemplate;

    public ServiceDirectory(JdbcTemplate jdbcTemplate){
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean userExists(Long userId){
        if (userId == null) {
            return false;
        }
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM users WHERE uid = ? AND is_active = true)",
                Boolean.class,
                userId));
    }

    public boolean isChannelMember(Long channelId, Long userId){
        if (channelId == null || userId == null) {
            return false;
        }
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM channel_members WHERE channel_id = ? AND user_id = ?)",
                Boolean.class,
                channelId,
                userId));
    }

    public boolean isWorkspaceMember(Long workspaceId, Long userId){
        if (workspaceId == null || userId == null) {
            return false;
        }
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM workspace_members WHERE workspace_id = ? AND user_id = ?)",
                Boolean.class,
                workspaceId,
                userId));
    }

    // presence 수신: 같은 워크스페이스
    public List<Long> findWorkspaceIds(Long userId){
        if (userId == null) {
            return List.of();
        }
        return jdbcTemplate.queryForList(
                "SELECT workspace_id FROM workspace_members WHERE user_id = ?",
                Long.class,
                userId);
    }

    /**
     * presence를 볼 수 있는 상대 = 같은 워크스페이스 + 친구.
     */
    public List<Long> findVisibleUserIds(Long userId){
        if (userId == null) {
            return List.of();
        }
        return jdbcTemplate.queryForList(
                "SELECT DISTINCT peer.user_id FROM workspace_members me "
                        + "JOIN workspace_members peer ON peer.workspace_id = me.workspace_id "
                        + "WHERE me.user_id = ? "
                        + "UNION "
                        + "SELECT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END "
                        + "FROM friends WHERE status = 'ACCEPTED' AND (sender_id = ? OR receiver_id = ?)",
                Long.class,
                userId,
                userId,
                userId,
                userId);
    }

    // presence 수신 : 친구.
    public List<Long> findAcceptedFriendIds(Long userId){
        if (userId == null) {
            return List.of();
        }
        return jdbcTemplate.queryForList(
                "SELECT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END "
                        + "FROM friends WHERE status = 'ACCEPTED' AND (sender_id = ? OR receiver_id = ?)",
                Long.class,
                userId,
                userId,
                userId);
    }
}
