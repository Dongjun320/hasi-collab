-- Seed script: 3 test users + 1 test workspace (with users as members)
-- Password for all test users: 12345678 (bcrypt hashed)

INSERT INTO users (email, password_hash, nickname, is_active, is_admin, is_email_verified, created_at, updated_at)
VALUES
    ('1@1.com', '$2b$10$XNmP3kHfJN8vaksCue2wRer5cLobVdBn8nYTuMjldoHATZU3Yvd1G', 'u1', true, false, true, NOW(), NOW()),
    ('2@2.com', '$2b$10$h7Vf6NwtjzYjsa9GbkHCres0jtux40wDKmU/msFXm7aQpkaMBzQTW', 'u2', true, false, true, NOW(), NOW()),
    ('3@3.com', '$2b$10$iFSRem.VJoeHYcvOrqhxXeU7097TG4RDBYsemGrpdZ4VaRFPRb0/S', 'u3', true, false, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO workspaces (owner_id, name, is_private, description, created_at, updated_at)
SELECT uid, 'test_workspace', false, 'Seeded workspace for testing', NOW(), NOW()
FROM users
WHERE email = '1@1.com'
  AND NOT EXISTS (SELECT 1 FROM workspaces WHERE name = 'test_workspace');

INSERT INTO workspace_members (workspace_id, user_id, role, created_at)
SELECT w.id, u.uid,
       CASE WHEN u.email = '1@1.com' THEN 'OWNER' ELSE 'MEMBER' END,
       NOW()
FROM workspaces w
JOIN users u ON u.email IN ('1@1.com', '2@2.com', '3@3.com')
WHERE w.name = 'test_workspace'
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- u1 -> u2, u3 친구 - 친구 테스트용
INSERT INTO friends (sender_id, receiver_id, status, created_at, updated_at)
SELECT u1.uid, u2.uid, 'ACCEPTED', NOW(), NOW()
FROM users u1, users u2
WHERE u1.email = '1@1.com' AND u2.email = '2@2.com'
    ON CONFLICT DO NOTHING;

INSERT INTO friends (sender_id, receiver_id, status, created_at, updated_at)
SELECT u1.uid, u2.uid, 'ACCEPTED', NOW(), NOW()
FROM users u1, users u2
WHERE u1.email = '1@1.com' AND u2.email = '3@3.com'
    ON CONFLICT DO NOTHING;

-- u2를 ADMIN(부서장 후보)으로 승격 — 보드 권한 테스트용
UPDATE workspace_members wm
SET role = 'ADMIN'
FROM workspaces w, users u
WHERE wm.workspace_id = w.id
  AND wm.user_id = u.uid
  AND w.name = 'test_workspace'
  AND u.email = '2@2.com';

-- ─────────────────────────── 채널 ───────────────────────────
-- general        : 공개,  u1(OWNER)·u2·u3 전원 → /topic/channel.{id} SUBSCRIBE 성공 케이스
-- design_channel : 비공개, u1(OWNER)·u2 만      → u3는 SUBSCRIBE 거부되어야 정상

INSERT INTO channels (workspace_id, name, is_private, created_at)
SELECT w.id, 'general', false, NOW()
FROM workspaces w
WHERE w.name = 'test_workspace'
  AND NOT EXISTS (
      SELECT 1 FROM channels c WHERE c.workspace_id = w.id AND c.name = 'general'
  );

INSERT INTO channels (workspace_id, name, is_private, created_at)
SELECT w.id, 'design_channel', true, NOW()
FROM workspaces w
WHERE w.name = 'test_workspace'
  AND NOT EXISTS (
      SELECT 1 FROM channels c WHERE c.workspace_id = w.id AND c.name = 'design_channel'
  );

-- general: 전원 참여 (u1만 OWNER)
INSERT INTO channel_members (channel_id, user_id, role, created_at)
SELECT c.id, u.uid,
       CASE WHEN u.email = '1@1.com' THEN 'OWNER' ELSE 'MEMBER' END,
       NOW()
FROM channels c
JOIN workspaces w ON w.id = c.workspace_id
JOIN users u ON u.email IN ('1@1.com', '2@2.com', '3@3.com')
WHERE w.name = 'test_workspace' AND c.name = 'general'
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- design_channel: u1·u2 만 (u3 제외 — 권한 거부 테스트용)
INSERT INTO channel_members (channel_id, user_id, role, created_at)
SELECT c.id, u.uid,
       CASE WHEN u.email = '1@1.com' THEN 'OWNER' ELSE 'MEMBER' END,
       NOW()
FROM channels c
JOIN workspaces w ON w.id = c.workspace_id
JOIN users u ON u.email IN ('1@1.com', '2@2.com')
WHERE w.name = 'test_workspace' AND c.name = 'design_channel'
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- ─────────────────────────── 칸반 보드 ───────────────────────────
-- design_board : 부서장 u2, 부서원 u2·u3        → u1(OWNER)·u2·u3 접근 가능
-- backend_board: 부서장 u1, 부서원 u1           → u3는 조회 목록에서 안 보여야 정상

INSERT INTO boards (workspace_id, name, owner_id, created_at)
SELECT w.id, 'design_board', u.uid, NOW()
FROM workspaces w, users u
WHERE w.name = 'test_workspace'
  AND u.email = '2@2.com'
  AND NOT EXISTS (
      SELECT 1 FROM boards b WHERE b.workspace_id = w.id AND b.name = 'design_board'
  );

INSERT INTO boards (workspace_id, name, owner_id, created_at)
SELECT w.id, 'backend_board', u.uid, NOW()
FROM workspaces w, users u
WHERE w.name = 'test_workspace'
  AND u.email = '1@1.com'
  AND NOT EXISTS (
      SELECT 1 FROM boards b WHERE b.workspace_id = w.id AND b.name = 'backend_board'
  );

INSERT INTO board_members (board_id, user_id, created_at)
SELECT b.id, u.uid, NOW()
FROM boards b
JOIN workspaces w ON w.id = b.workspace_id
JOIN users u ON u.email IN ('2@2.com', '3@3.com')
WHERE w.name = 'test_workspace' AND b.name = 'design_board'
ON CONFLICT (board_id, user_id) DO NOTHING;

INSERT INTO board_members (board_id, user_id, created_at)
SELECT b.id, u.uid, NOW()
FROM boards b
JOIN workspaces w ON w.id = b.workspace_id
JOIN users u ON u.email = '1@1.com'
WHERE w.name = 'test_workspace' AND b.name = 'backend_board'
ON CONFLICT (board_id, user_id) DO NOTHING;

-- design_board 태스크 3개 (u3 담당 2개 → 부서원 status 변경 권한 테스트용)
INSERT INTO tasks (board_id, title, status, assignee_id, priority, created_at, updated_at)
SELECT b.id, t.title, t.status, u.uid, t.priority, NOW(), NOW()
FROM (VALUES
    ('로고 시안 작업', 'TODO',        'HIGH',   '3@3.com'),
    ('메인 배너 디자인', 'IN_PROGRESS', 'MEDIUM', '3@3.com'),
    ('컬러 가이드 정리', 'REVIEW',      'LOW',    '2@2.com')
) AS t(title, status, priority, assignee_email)
JOIN users u ON u.email = t.assignee_email
JOIN workspaces w ON w.name = 'test_workspace'
JOIN boards b ON b.workspace_id = w.id AND b.name = 'design_board'
WHERE NOT EXISTS (
      SELECT 1 FROM tasks x WHERE x.board_id = b.id AND x.title = t.title
  );

-- backend_board 태스크 1개 (u1 담당)
INSERT INTO tasks (board_id, title, status, assignee_id, priority, created_at, updated_at)
SELECT b.id, 'API 스펙 정리', 'TODO', u.uid, 'HIGH', NOW(), NOW()
FROM boards b
JOIN workspaces w ON w.id = b.workspace_id
JOIN users u ON u.email = '1@1.com'
WHERE w.name = 'test_workspace' AND b.name = 'backend_board'
  AND NOT EXISTS (
      SELECT 1 FROM tasks x WHERE x.board_id = b.id AND x.title = 'API 스펙 정리'
  );
