-- 🛡️ Step 1: external_id 컬럼 안전하게 추가
-- 최소한의 변경으로 시작합니다

-- ============================================
-- 사전 체크: 이미 external_id가 있는지 확인
-- ============================================
DO $$ 
BEGIN
    -- external_id 컬럼이 없을 때만 추가
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'artworks' 
        AND column_name = 'external_id'
    ) THEN
        -- 1. 컬럼 추가 (처음엔 NULL 허용으로)
        ALTER TABLE artworks 
        ADD COLUMN external_id VARCHAR(255);
        
        RAISE NOTICE '✅ external_id 컬럼이 추가되었습니다';
    ELSE
        RAISE NOTICE '⚠️ external_id 컬럼이 이미 존재합니다';
    END IF;
END $$;

-- ============================================
-- 추가 확인: 컬럼이 제대로 추가되었는지
-- ============================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'artworks' 
AND column_name = 'external_id';

-- ============================================
-- 📝 설명 추가 (문서화)
-- ============================================
COMMENT ON COLUMN artworks.external_id IS 
'외부 시스템 ID (예: MET Museum의 "met-436533", Artvee의 "peasant-woman" 등). 
프론트엔드에서 사용하는 실제 artwork ID를 저장합니다.
NULL 허용 - 기존 데이터와의 호환성 보장';

-- ============================================
-- 결과 확인
-- ============================================
SELECT 
    '✅ Step 1 완료: external_id 컬럼 추가됨' as "상태",
    COUNT(*) as "전체 artwork 수",
    COUNT(external_id) as "external_id 있는 artwork 수"
FROM artworks;

-- ============================================
-- 🔍 다음 단계 준비 상태 체크
-- ============================================
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ 기존 데이터 없음 - 바로 Step 3로 이동 가능'
        WHEN COUNT(*) > 0 AND COUNT(external_id) = 0 THEN '⚠️ 기존 데이터 있음 - Step 2 마이그레이션 필요'
        WHEN COUNT(*) > 0 AND COUNT(external_id) > 0 THEN '✅ 일부 데이터에 external_id 있음'
        ELSE '❓ 상태 확인 필요'
    END as "다음 단계"
FROM artworks;