-- Seed script: 3 test users + 1 test workspace (with users as members)
-- Password for all test users: 12345678 (bcrypt hashed)

INSERT INTO users (email, password_hash, nickname, is_active, is_admin, is_email_verified, status_code, created_at, updated_at)
VALUES
    ('test_user1@example.com', '$2b$10$XNmP3kHfJN8vaksCue2wRer5cLobVdBn8nYTuMjldoHATZU3Yvd1G', 'test_user1', true, false, true, 'online', NOW(), NOW()),
    ('test_user2@example.com', '$2b$10$h7Vf6NwtjzYjsa9GbkHCres0jtux40wDKmU/msFXm7aQpkaMBzQTW', 'test_user2', true, false, true, 'online', NOW(), NOW()),
    ('test_user3@example.com', '$2b$10$iFSRem.VJoeHYcvOrqhxXeU7097TG4RDBYsemGrpdZ4VaRFPRb0/S', 'test_user3', true, false, true, 'online', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO workspaces (owner_id, name, is_private, description, created_at, updated_at)
SELECT uid, 'test_workspace', false, 'Seeded workspace for testing', NOW(), NOW()
FROM users
WHERE email = 'test_user1@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO workspace_members (workspace_id, user_id, role, created_at)
SELECT w.id, u.uid,
       CASE WHEN u.email = 'test_user1@example.com' THEN 'OWNER' ELSE 'MEMBER' END,
       NOW()
FROM workspaces w
JOIN users u ON u.email IN ('test_user1@example.com', 'test_user2@example.com', 'test_user3@example.com')
WHERE w.name = 'test_workspace'
ON CONFLICT (workspace_id, user_id) DO NOTHING;
