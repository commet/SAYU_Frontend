-- exhibitions 테이블 스키마 업데이트
-- 영문 필드들 추가
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS admission_fee_en TEXT; -- 입장료 영문
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS location_en TEXT; -- 위치 영문
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS organizer_en TEXT; -- 주최자 영문
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS description_en TEXT; -- 설명 영문

-- JSON 필드들 추가
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS highlights JSONB; -- 전시 하이라이트
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS sections JSONB; -- 전시 섹션 정보
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS programs JSONB; -- 관련 프로그램
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS visitor_info JSONB; -- 관람객 정보
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS related_artists JSONB; -- 관련 아티스트 정보

-- 추가 중요 필드들
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS poster_image_url TEXT; -- 포스터 이미지 URL
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS gallery_images JSONB; -- 갤러리 이미지들
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS gallery_location TEXT; -- 갤러리 위치
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS themes JSONB; -- 전시 테마들
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS sponsors JSONB; -- 후원사들
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS collaborators JSONB; -- 협력기관들
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS special_events JSONB; -- 특별 이벤트들
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS accessibility_info JSONB; -- 접근성 정보
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS price_details JSONB; -- 가격 상세정보
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS booking_info JSONB; -- 예약 정보

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_exhibitions_poster_image ON exhibitions(poster_image_url) WHERE poster_image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exhibitions_themes ON exhibitions USING GIN (themes) WHERE themes IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exhibitions_artists_related ON exhibitions USING GIN (related_artists) WHERE related_artists IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exhibitions_location_en ON exhibitions(location_en) WHERE location_en IS NOT NULL;

-- 코멘트 추가
COMMENT ON COLUMN exhibitions.admission_fee_en IS '입장료 정보 (영문)';
COMMENT ON COLUMN exhibitions.location_en IS '전시 위치 정보 (영문)';
COMMENT ON COLUMN exhibitions.organizer_en IS '주최자 정보 (영문)';
COMMENT ON COLUMN exhibitions.description_en IS '전시 설명 (영문)';
COMMENT ON COLUMN exhibitions.highlights IS '전시 주요 하이라이트 (JSON)';
COMMENT ON COLUMN exhibitions.sections IS '전시 섹션 구성 (JSON)';
COMMENT ON COLUMN exhibitions.programs IS '관련 프로그램 정보 (JSON)';
COMMENT ON COLUMN exhibitions.visitor_info IS '관람객 안내 정보 (JSON)';
COMMENT ON COLUMN exhibitions.related_artists IS '참여 아티스트 상세 정보 (JSON)';
COMMENT ON COLUMN exhibitions.poster_image_url IS '전시 포스터 이미지 URL';
COMMENT ON COLUMN exhibitions.gallery_images IS '갤러리 이미지 URL 배열 (JSON)';
COMMENT ON COLUMN exhibitions.gallery_location IS '갤러리 내 위치 정보';
COMMENT ON COLUMN exhibitions.themes IS '전시 테마 분류 (JSON)';
COMMENT ON COLUMN exhibitions.sponsors IS '후원사 정보 (JSON)';
COMMENT ON COLUMN exhibitions.collaborators IS '협력기관 정보 (JSON)';
COMMENT ON COLUMN exhibitions.special_events IS '특별 이벤트 정보 (JSON)';
COMMENT ON COLUMN exhibitions.accessibility_info IS '접근성 정보 (JSON)';
COMMENT ON COLUMN exhibitions.price_details IS '가격 상세 정보 (JSON)';
COMMENT ON COLUMN exhibitions.booking_info IS '예약 관련 정보 (JSON)';