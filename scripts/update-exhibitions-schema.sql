-- exhibitions 테이블 스키마 업데이트
-- 상설 전시 지원 및 추가 필드 포함

-- 1. 새로운 컬럼들 추가
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS poster_image_url TEXT;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS gallery_images TEXT[];
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS themes TEXT[];
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS sponsors TEXT[];
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS collaborators TEXT[];
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS special_events JSONB;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS gallery_location TEXT;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS art_medium TEXT[];
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS curator_en TEXT;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS booking_required BOOLEAN DEFAULT FALSE;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS ticket_required BOOLEAN DEFAULT FALSE;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT FALSE;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS data_source TEXT;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS data_quality_score NUMERIC(3,2);
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS personality_matches JSONB;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS recommendation_score NUMERIC(3,2);
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS venue_type TEXT;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS venue_tier TEXT;

-- 2. exhibition_type 컬럼 업데이트 (permanent 타입 추가)
-- 기존 CHECK constraint 삭제 후 재생성
ALTER TABLE exhibitions DROP CONSTRAINT IF EXISTS exhibitions_exhibition_type_check;

-- CHECK constraint 추가
ALTER TABLE exhibitions 
ADD CONSTRAINT exhibitions_exhibition_type_check 
CHECK (exhibition_type IN (
  'solo', 'group', 'permanent', 'collection', 
  'special', 'retrospective', 'traveling', 
  'online', 'virtual', 'popup'
));

-- 3. 상설 전시 처리를 위한 함수 및 트리거
CREATE OR REPLACE FUNCTION handle_permanent_exhibition()
RETURNS TRIGGER AS $$
BEGIN
  -- 상설 전시인 경우
  IF NEW.is_permanent = TRUE OR NEW.exhibition_type = 'permanent' THEN
    -- end_date를 매우 먼 미래로 설정 (NULL 대신 2099-12-31 사용)
    IF NEW.end_date IS NULL OR NEW.end_date < '2099-12-31' THEN
      NEW.end_date := '2099-12-31'::DATE;
    END IF;
    NEW.is_permanent := TRUE;
    NEW.exhibition_type := 'permanent';
    NEW.status := 'ongoing';
  END IF;
  
  -- status 자동 업데이트
  IF NEW.end_date IS NOT NULL THEN
    IF NEW.start_date > CURRENT_DATE THEN
      NEW.status := 'upcoming';
    ELSIF NEW.end_date < CURRENT_DATE AND NEW.is_permanent = FALSE THEN
      NEW.status := 'closed';
    ELSE
      NEW.status := 'ongoing';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS permanent_exhibition_trigger ON exhibitions;

CREATE TRIGGER permanent_exhibition_trigger
BEFORE INSERT OR UPDATE ON exhibitions
FOR EACH ROW
EXECUTE FUNCTION handle_permanent_exhibition();

-- 4. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_exhibitions_is_permanent ON exhibitions(is_permanent);
CREATE INDEX IF NOT EXISTS idx_exhibitions_exhibition_type ON exhibitions(exhibition_type);
CREATE INDEX IF NOT EXISTS idx_exhibitions_venue_name ON exhibitions(venue_name);
CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_dates ON exhibitions(start_date, end_date);

-- 5. 상설 전시 뷰 생성 (편의를 위한 뷰)
CREATE OR REPLACE VIEW permanent_exhibitions AS
SELECT * FROM exhibitions 
WHERE is_permanent = TRUE OR exhibition_type = 'permanent';

-- 6. 현재 진행중인 전시 뷰
CREATE OR REPLACE VIEW ongoing_exhibitions AS
SELECT * FROM exhibitions 
WHERE status = 'ongoing' 
  AND (end_date >= CURRENT_DATE OR is_permanent = TRUE);

-- 업데이트 완료 메시지
COMMENT ON TABLE exhibitions IS '전시 정보 테이블 - 상설 전시 지원 및 확장 필드 포함 (2025-08-09 업데이트)';