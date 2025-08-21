-- 🧪 Step 3: API 테스트를 위한 최소 설정
-- external_id 컬럼만 추가된 상태에서 API가 작동하는지 확인

-- ============================================
-- 1. 테스트용 artwork 생성 (있다면 스킵)
-- ============================================
DO $$
DECLARE
    v_test_id UUID;
BEGIN
    -- 테스트 artwork가 없으면 생성
    IF NOT EXISTS (
        SELECT 1 FROM artworks 
        WHERE external_id = 'test-peasant-woman'
    ) THEN
        INSERT INTO artworks (
            external_id,
            title,
            artist,
            year_created,
            image_url,
            medium,
            museum,
            department,
            is_public_domain
        ) VALUES (
            'test-peasant-woman',
            'Test: Peasant Woman',
            'Vincent van Gogh',
            '1885',
            'https://example.com/peasant-woman.jpg',
            'Oil on canvas',
            'Van Gogh Museum',
            'Paintings',
            true
        ) RETURNING id INTO v_test_id;
        
        RAISE NOTICE '✅ 테스트 artwork 생성됨: ID = %, external_id = test-peasant-woman', v_test_id;
    ELSE
        RAISE NOTICE '⚠️ 테스트 artwork가 이미 존재합니다';
    END IF;
END $$;

-- ============================================
-- 2. API 테스트를 위한 체크리스트
-- ============================================
SELECT 
    '📋 API 테스트 체크리스트' as "항목",
    '다음 조건들이 충족되는지 확인하세요' as "설명"
UNION ALL
SELECT 
    '1. external_id 컬럼',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'artworks' AND column_name = 'external_id'
        ) THEN '✅ 존재함'
        ELSE '❌ 없음 - Step 1 실행 필요'
    END
UNION ALL
SELECT 
    '2. 테스트 데이터',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM artworks WHERE external_id = 'test-peasant-woman'
        ) THEN '✅ 준비됨'
        ELSE '❌ 없음'
    END
UNION ALL
SELECT 
    '3. API route.ts',
    '✅ 이미 external_id 지원하도록 수정됨';

-- ============================================
-- 3. API 테스트 시나리오
-- ============================================
SELECT '
🧪 브라우저나 Postman에서 테스트:

1️⃣ 작품 저장 테스트:
POST /api/gallery/collection
{
  "userId": "YOUR_USER_ID",
  "artworkId": "test-peasant-woman",
  "action": "save"
}

2️⃣ 새 작품 저장 (artworkData 포함):
POST /api/gallery/collection
{
  "userId": "YOUR_USER_ID",
  "artworkId": "test-starry-night",
  "action": "save",
  "artworkData": {
    "title": "The Starry Night",
    "artist": "Vincent van Gogh",
    "year": "1889",
    "imageUrl": "https://example.com/starry-night.jpg",
    "museum": "MoMA"
  }
}

3️⃣ 컬렉션 조회:
GET /api/gallery/collection?userId=YOUR_USER_ID

4️⃣ 작품 제거:
POST /api/gallery/collection
{
  "userId": "YOUR_USER_ID",
  "artworkId": "test-peasant-woman",
  "action": "remove"
}
' as "테스트 시나리오";

-- ============================================
-- 4. 현재 데이터 상태 확인
-- ============================================
SELECT 
    'artworks with external_id' as "구분",
    COUNT(*) as "수량",
    string_agg(external_id, ', ' ORDER BY created_at DESC LIMIT 5) as "샘플 (최근 5개)"
FROM artworks
WHERE external_id IS NOT NULL
GROUP BY "구분"

UNION ALL

SELECT 
    'artworks without external_id',
    COUNT(*),
    string_agg(id::text, ', ' ORDER BY created_at DESC LIMIT 5)
FROM artworks
WHERE external_id IS NULL
GROUP BY "구분";

-- ============================================
-- 5. 문제 해결 가이드
-- ============================================
SELECT '
⚠️ 문제 발생 시:

1. "invalid input syntax for type uuid" 오류
   → external_id 컬럼이 없음. Step 1 실행 필요

2. "artwork not found" 오류
   → 해당 external_id가 DB에 없음. artworkData 포함하여 요청

3. 저장은 되는데 조회가 안 됨
   → artwork_interactions 테이블 확인

4. 500 에러
   → Supabase 로그 확인
   → RLS 정책 확인
' as "트러블슈팅 가이드";