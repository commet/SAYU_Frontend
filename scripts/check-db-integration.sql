-- Check DB Integration for Quiz Results
-- Run these queries in Supabase SQL Editor to verify

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'quiz_results');

-- 2. Check users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('auth_id', 'personality_type', 'quiz_completed');

-- 3. Check quiz_results table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quiz_results'
AND column_name IN ('user_id', 'personality_type', 'animal_type', 'scores');

-- 4. Check sample data (recent quiz results)
SELECT 
    u.email,
    u.personality_type as user_type,
    u.quiz_completed,
    qr.personality_type as quiz_type,
    qr.created_at
FROM users u
LEFT JOIN quiz_results qr ON qr.user_id = u.id
WHERE u.quiz_completed = true
ORDER BY qr.created_at DESC
LIMIT 10;

-- 5. Check for any users with quiz results
SELECT COUNT(*) as total_users_with_quiz
FROM users 
WHERE personality_type IS NOT NULL;

-- 6. Check for orphaned quiz results
SELECT COUNT(*) as orphaned_results
FROM quiz_results qr
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = qr.user_id
);