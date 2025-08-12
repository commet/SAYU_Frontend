-- Supabase 마이그레이션 테스트 스크립트
-- 개발 환경에서 실행하여 스키마와 RLS 정책을 검증

-- 1. 테이블 존재 확인
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'apt_history', 'follows')
ORDER BY table_name;

-- 2. 프로필 테이블 컬럼 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. 인덱스 확인
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'apt_history', 'follows')
ORDER BY tablename, indexname;

-- 4. RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. 트리거 확인
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 6. 함수 확인
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'update_updated_at_column')
ORDER BY routine_name;

-- 7. 샘플 데이터 삽입 테스트 (개발환경에서만)
-- 주의: 실제 사용자 UUID로 교체 필요
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  -- auth.users에 테스트 사용자 삽입 (개발환경에서만 가능)
  -- 실제로는 Supabase Auth를 통해 생성됨
  RAISE NOTICE 'Test user ID: %', test_user_id;
  
  -- 프로필 직접 삽입 테스트
  INSERT INTO profiles (
    id, 
    email, 
    username, 
    gender, 
    age_range, 
    region, 
    companion_type,
    profile_completed
  ) VALUES (
    test_user_id,
    'test@example.com',
    'testuser',
    'prefer_not_to_say',
    '20s',
    'seoul',
    'friends',
    true
  );
  
  RAISE NOTICE 'Profile inserted successfully';
  
  -- 삽입된 데이터 확인
  PERFORM * FROM profiles WHERE id = test_user_id;
  
  -- 테스트 데이터 정리
  DELETE FROM profiles WHERE id = test_user_id;
  
  RAISE NOTICE 'Test completed successfully';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Test failed: %', SQLERRM;
END $$;

-- 8. 성능 테스트 쿼리
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM profiles 
WHERE personality_type = 'LAEF' 
  AND region = 'seoul' 
  AND profile_completed = true
LIMIT 10;

-- 9. 매칭 쿼리 성능 테스트
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
  p1.id as user1_id,
  p1.username as user1_name,
  p2.id as user2_id,
  p2.username as user2_name,
  p1.personality_type,
  p2.personality_type
FROM profiles p1
CROSS JOIN profiles p2
WHERE p1.id != p2.id
  AND p1.profile_completed = true
  AND p2.profile_completed = true
  AND p1.personality_type IS NOT NULL
  AND p2.personality_type IS NOT NULL
  AND p1.region = p2.region  -- 같은 지역
LIMIT 20;

-- 10. 현재 DB 상태 요약
SELECT 
  'profiles' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE profile_completed = true) as completed_profiles,
  COUNT(*) FILTER (WHERE personality_type IS NOT NULL) as with_apt_result,
  COUNT(*) FILTER (WHERE gender IS NOT NULL) as with_gender,
  COUNT(*) FILTER (WHERE region IS NOT NULL) as with_region
FROM profiles

UNION ALL

SELECT 
  'follows' as table_name,
  COUNT(*) as total_rows,
  NULL, NULL, NULL, NULL
FROM follows

UNION ALL

SELECT 
  'apt_history' as table_name,
  COUNT(*) as total_rows,
  NULL, NULL, NULL, NULL
FROM apt_history;

RAISE NOTICE '=== Migration Test Complete ===';