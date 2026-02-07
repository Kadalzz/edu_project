-- ================================================
-- CHECK PREREQUISITES FOR PARENT REGISTRATION
-- ================================================
-- Run this in Supabase SQL Editor to verify setup

-- 1. Check if any GURU exists
SELECT 
  'GURU Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ OK - Ada guru terdaftar'
    ELSE '❌ PERLU REGISTER GURU DULU'
  END as status
FROM users 
WHERE role = 'GURU';

-- 2. Check if any Kelas exists
SELECT 
  'KELAS Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ OK - Ada kelas tersedia'
    ELSE '⚠️ Will be created automatically'
  END as status
FROM kelas;

-- 3. List existing users with their roles
SELECT 
  email,
  name,
  role,
  "createdAt"
FROM users
ORDER BY "createdAt" DESC;

-- 4. List existing Guru profiles
SELECT 
  g.id,
  u.name as nama_guru,
  u.email,
  g."createdAt"
FROM guru g
JOIN users u ON g."userId" = u.id;

-- 5. List existing Kelas
SELECT 
  k.nama as nama_kelas,
  k."tahunAjaran",
  u.name as nama_guru,
  k."createdAt"
FROM kelas k
JOIN guru g ON k."guruId" = g.id
JOIN users u ON g."userId" = u.id;
