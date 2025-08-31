-- 🎨 SAYU 안전한 전시 DB 스키마 (기존 venues 활용)
-- 기존 venues 테이블과 충돌 없이 설계
-- 생성일: 2025-08-31

-- ========================================
-- 1. 한글 전시 테이블 (exhibitions_ko)
-- ========================================
CREATE TABLE IF NOT EXISTS exhibitions_ko (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 기본 정보
  exhibition_title TEXT NOT NULL,
  artists TEXT[] DEFAULT '{}',
  description TEXT,
  
  -- 날짜 정보
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('ongoing', 'upcoming', 'ended')) DEFAULT 'upcoming',
  
  -- 운영 정보 (venues 테이블에 없는 전시별 정보)
  operating_hours TEXT, -- 전시별 특별 운영시간 (있으면)
  ticket_price TEXT DEFAULT '무료',
  phone_number TEXT, -- 전시 전용 문의 번호 (있으면)
  website_url TEXT, -- 전시 전용 웹페이지
  source_url TEXT, -- 정보 출처 URL
  
  -- 장소 정보 (기존 venues 테이블 활용)
  venue_name TEXT NOT NULL, -- 백업용 텍스트
  venue_id UUID, -- 기존 venues 테이블 참조 (있으면)
  city TEXT DEFAULT '서울',
  address TEXT, -- 전시별 특별 주소 (서브 갤러리 등)
  
  -- 분류 정보
  exhibition_type TEXT CHECK (exhibition_type IN ('solo', 'group', 'special', 'biennale', 'permanent')) DEFAULT 'group',
  genre TEXT CHECK (genre IN ('contemporary', 'painting', 'sculpture', 'photography', 'media', 'installation', 'craft', 'design')) DEFAULT 'contemporary',
  
  -- 메타데이터
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  priority_order NUMERIC DEFAULT 50,
  
  -- 시스템 필드
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  
  -- 기존 venues 테이블이 있다면 외래키 제약조건 추가 가능 (선택사항)
  -- CONSTRAINT fk_venue FOREIGN KEY (venue_id) REFERENCES venues(id)
);

-- ========================================
-- 2. 영문 전시 테이블 (exhibitions_en)
-- ========================================
CREATE TABLE IF NOT EXISTS exhibitions_en (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibition_ko_id UUID REFERENCES exhibitions_ko(id) ON DELETE CASCADE,
  
  -- 기본 정보
  exhibition_title TEXT NOT NULL,
  artists TEXT[] DEFAULT '{}',
  description TEXT,
  
  -- 날짜 정보 (동일)
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('ongoing', 'upcoming', 'ended')) DEFAULT 'upcoming',
  
  -- 운영 정보
  operating_hours TEXT,
  ticket_price TEXT DEFAULT 'Free',
  phone_number TEXT,
  website_url TEXT,
  source_url TEXT,
  
  -- 장소 정보
  venue_name TEXT NOT NULL,
  venue_id UUID, -- 기존 venues 테이블 참조
  city TEXT DEFAULT 'Seoul',
  address TEXT,
  
  -- 분류 정보
  exhibition_type TEXT CHECK (exhibition_type IN ('solo', 'group', 'special', 'biennale', 'permanent')) DEFAULT 'group',
  genre TEXT CHECK (genre IN ('contemporary', 'painting', 'sculpture', 'photography', 'media', 'installation', 'craft', 'design')) DEFAULT 'contemporary',
  
  -- 메타데이터
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  priority_order NUMERIC DEFAULT 50,
  
  -- 시스템 필드
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 3. 인덱스 생성
-- ========================================
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_status ON exhibitions_ko(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_dates ON exhibitions_ko(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_venue_name ON exhibitions_ko(venue_name);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_venue_id ON exhibitions_ko(venue_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_featured ON exhibitions_ko(is_featured);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_priority ON exhibitions_ko(priority_order);

CREATE INDEX IF NOT EXISTS idx_exhibitions_en_status ON exhibitions_en(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_en_dates ON exhibitions_en(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_exhibitions_en_venue_name ON exhibitions_en(venue_name);
CREATE INDEX IF NOT EXISTS idx_exhibitions_en_venue_id ON exhibitions_en(venue_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_en_ko_id ON exhibitions_en(exhibition_ko_id);

-- ========================================
-- 4. 업데이트 트리거
-- ========================================
CREATE OR REPLACE FUNCTION update_exhibitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exhibitions_ko_updated_at BEFORE UPDATE
    ON exhibitions_ko FOR EACH ROW EXECUTE FUNCTION update_exhibitions_updated_at();

CREATE TRIGGER update_exhibitions_en_updated_at BEFORE UPDATE
    ON exhibitions_en FOR EACH ROW EXECUTE FUNCTION update_exhibitions_updated_at();

-- ========================================
-- 5. 다국어 통합 뷰 (기존 venues 활용)
-- ========================================
CREATE OR REPLACE VIEW exhibitions_multilang AS
SELECT 
    ko.id,
    ko.exhibition_title as title_ko,
    en.exhibition_title as title_en,
    ko.artists as artists_ko,
    en.artists as artists_en,
    ko.description as description_ko,
    en.description as description_en,
    ko.start_date,
    ko.end_date,
    ko.status,
    ko.venue_name as venue_ko,
    en.venue_name as venue_en,
    ko.city,
    ko.exhibition_type,
    ko.genre,
    ko.is_featured,
    ko.priority_order,
    ko.view_count,
    v.name as venue_full_name,
    v.address as venue_address,
    ko.created_at,
    ko.updated_at
FROM exhibitions_ko ko
LEFT JOIN exhibitions_en en ON ko.id = en.exhibition_ko_id
LEFT JOIN venues v ON ko.venue_id = v.id;

-- ========================================
-- 6. 성공 메시지
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ SAYU 안전한 전시 스키마 생성 완료!';
  RAISE NOTICE '🔗 기존 venues 테이블과 연동 가능';
  RAISE NOTICE '📊 테이블: exhibitions_ko, exhibitions_en';
  RAISE NOTICE '🔍 뷰: exhibitions_multilang (venues 조인)';
END $$;