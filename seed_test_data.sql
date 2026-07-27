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
