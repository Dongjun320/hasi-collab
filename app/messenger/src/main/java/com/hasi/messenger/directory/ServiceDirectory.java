package com.hasi.messenger.directory;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

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
}
