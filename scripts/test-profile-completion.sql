-- ProfileCompletion 기능 테스트를 위한 SQL 스크립트
-- Supabase SQL Editor에서 실행

-- =============================================
-- 1. profiles 테이블 현재 구조 확인
-- =============================================
SELECT 
    column_name as "컬럼명",
    data_type as "데이터타입",
    is_nullable as "NULL허용",
    column_default as "기본값"
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY 
    ordinal_position;

-- =============================================
-- 2. ProfileCompletion 관련 새 컬럼들이 있는지 확인
-- =============================================
SELECT 
    column_name,
    CASE WHEN column_name IN ('gender', 'age_group', 'region', 'viewing_styles', 'profile_completed_at', 'profile_completion_version') 
         THEN '✅ ProfileCompletion용 컬럼'
         ELSE '기존 컬럼'
    END as "컬럼타입"
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN ('gender', 'age_group', 'region', 'viewing_styles', 'profile_completed_at', 'profile_completion_version')
ORDER BY 
    column_name;

-- =============================================
-- 3. 새 컬럼 개수 확인 (0=없음, 6=모두있음)
-- =============================================
SELECT 
    COUNT(*) as "새_컬럼_개수",
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ 새 컬럼 없음 - bio 필드 fallback 사용'
        WHEN COUNT(*) = 6 THEN '✅ 모든 컬럼 존재 - 직접 저장 가능'
        ELSE '⚠️ 일부만 존재 - 확인 필요'
    END as "상태"
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN ('gender', 'age_group', 'region', 'viewing_styles', 'profile_completed_at', 'profile_completion_version');

-- =============================================
-- 4. 현재 프로필 데이터 샘플 확인
-- =============================================
SELECT 
    id,
    username,
    bio,
    CASE 
        WHEN bio IS NOT NULL AND bio::text LIKE '{%}' THEN 'JSON 데이터 있음'
        ELSE 'JSON 없음'
    END as "bio_상태",
    created_at,
    updated_at
FROM 
    profiles
WHERE 
    id IS NOT NULL
ORDER BY 
    updated_at DESC
LIMIT 5;

-- =============================================
-- 5. bio 필드에 ProfileCompletion 데이터가 있는 레코드 확인
-- =============================================
SELECT 
    id,
    username,
    bio::text as "bio_content"
FROM 
    profiles
WHERE 
    bio IS NOT NULL 
    AND bio::text LIKE '%profile_completion_version%'
LIMIT 3;