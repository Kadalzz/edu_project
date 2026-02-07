-- ================================================
-- MANUAL GURU CREATION (Jika belum ada guru)
-- ================================================
-- Run in Supabase SQL Editor

-- Step 1: Create User with GURU role
DO $$
DECLARE
  new_user_id TEXT;
BEGIN
  -- Generate password hash untuk 'guru123'
  -- Hash: $2a$10$8zYQ7xLEByYKXy5K7vQ7oOH8QO0nPGXJaY0j0pKjPwqLKz5rKzqPO
  
  INSERT INTO users (id, email, password, role, name, "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid(),
    'guru@eduspecial.com',
    '$2a$10$8zYQ7xLEByYKXy5K7vQ7oOH8QO0nPGXJaY0j0pKjPwqLKz5rKzqPO',
    'GURU',
    'Guru Pertama',
    NOW(),
    NOW()
  )
  RETURNING id INTO new_user_id;
  
  -- Step 2: Create Guru profile
  INSERT INTO guru (id, "userId", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid(),
    new_user_id,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Guru created successfully!';
  RAISE NOTICE 'Email: guru@eduspecial.com';
  RAISE NOTICE 'Password: guru123';
END $$;

-- Verify
SELECT 
  u.email,
  u.name,
  u.role,
  g.id as guru_id
FROM users u
JOIN guru g ON u.id = g."userId"
WHERE u.role = 'GURU';
