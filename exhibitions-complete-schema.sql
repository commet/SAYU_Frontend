-- 🎨 SAYU 완전한 전시 데이터베이스 스키마
-- 한글/영문 분리형 설계
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
  
  -- 운영 정보
  operating_hours TEXT DEFAULT '화-일 10:00-18:00 (월요일 휴관)',
  ticket_price TEXT DEFAULT '무료',
  phone_number TEXT,
  website_url TEXT,
  source_url TEXT,
  
  -- 장소 정보
  venue_name TEXT NOT NULL,
  venue_id UUID,
  city TEXT DEFAULT '서울',
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
-- 2. 영문 전시 테이블 (exhibitions_en)
-- ========================================
CREATE TABLE IF NOT EXISTS exhibitions_en (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibition_ko_id UUID REFERENCES exhibitions_ko(id) ON DELETE CASCADE,
  
  -- 기본 정보
  exhibition_title TEXT NOT NULL,
  artists TEXT[] DEFAULT '{}',
  description TEXT,
  
  -- 날짜 정보
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('ongoing', 'upcoming', 'ended')) DEFAULT 'upcoming',
  
  -- 운영 정보
  operating_hours TEXT DEFAULT 'Tue-Sun 10:00-18:00 (Closed Mondays)',
  ticket_price TEXT DEFAULT 'Free',
  phone_number TEXT,
  website_url TEXT,
  source_url TEXT,
  
  -- 장소 정보
  venue_name TEXT NOT NULL,
  venue_id UUID,
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
-- 3. 미술관/갤러리 테이블 (venues)
-- ========================================
CREATE TABLE IF NOT EXISTS venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 기본 정보
  name_ko TEXT NOT NULL,
  name_en TEXT,
  type TEXT CHECK (type IN ('museum', 'gallery', 'art_center', 'alternative_space', 'auction_house')) DEFAULT 'gallery',
  
  -- 위치 정보
  city TEXT DEFAULT '서울',
  district TEXT,
  address_ko TEXT,
  address_en TEXT,
  
  -- 연락 정보
  phone_number TEXT,
  website_url TEXT,
  email TEXT,
  
  -- 운영 정보
  operating_hours_ko TEXT DEFAULT '화-일 10:00-18:00 (월요일 휴관)',
  operating_hours_en TEXT DEFAULT 'Tue-Sun 10:00-18:00 (Closed Mondays)',
  
  -- 메타데이터
  priority_order NUMERIC DEFAULT 50,
  is_major BOOLEAN DEFAULT FALSE,
  
  -- 시스템 필드
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. 인덱스 생성
-- ========================================

-- 한글 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_status ON exhibitions_ko(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_dates ON exhibitions_ko(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_venue ON exhibitions_ko(venue_name);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_featured ON exhibitions_ko(is_featured);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_priority ON exhibitions_ko(priority_order);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_genre ON exhibitions_ko(genre);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_type ON exhibitions_ko(exhibition_type);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_city ON exhibitions_ko(city);

-- 영문 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_exhibitions_en_status ON exhibitions_en(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_en_dates ON exhibitions_en(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_exhibitions_en_venue ON exhibitions_en(venue_name);
CREATE INDEX IF NOT EXISTS idx_exhibitions_en_featured ON exhibitions_en(is_featured);
CREATE INDEX IF NOT EXISTS idx_exhibitions_en_priority ON exhibitions_en(priority_order);
CREATE INDEX IF NOT EXISTS idx_exhibitions_en_ko_id ON exhibitions_en(exhibition_ko_id);

-- 미술관 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(type);
CREATE INDEX IF NOT EXISTS idx_venues_major ON venues(is_major);

-- ========================================
-- 5. 업데이트 트리거
-- ========================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exhibitions_ko_updated_at BEFORE UPDATE
    ON exhibitions_ko FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_exhibitions_en_updated_at BEFORE UPDATE
    ON exhibitions_en FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE
    ON venues FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ========================================
-- 6. 다국어 통합 뷰 (선택사항)
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
    ko.created_at,
    ko.updated_at
FROM exhibitions_ko ko
LEFT JOIN exhibitions_en en ON ko.id = en.exhibition_ko_id;

-- ========================================
-- 7. 주요 미술관 데이터 삽입
-- ========================================
INSERT INTO venues (name_ko, name_en, type, city, is_major, priority_order) VALUES
('국립현대미술관', 'National Museum of Modern and Contemporary Art', 'museum', '서울', true, 1),
('서울시립미술관', 'Seoul Museum of Art', 'museum', '서울', true, 2),
('리움미술관', 'Leeum Museum of Art', 'museum', '서울', true, 3),
('국제갤러리', 'Kukje Gallery', 'gallery', '서울', true, 4),
('갤러리현대', 'Gallery Hyundai', 'gallery', '서울', true, 5),
('아모레퍼시픽미술관', 'Amorepacific Museum of Art', 'museum', '서울', true, 6),
('대림미술관', 'Daelim Museum', 'museum', '서울', true, 7),
('예술의전당', 'Seoul Arts Center', 'art_center', '서울', true, 8),
('DDP', 'Dongdaemun Design Plaza', 'art_center', '서울', true, 9),
('부산현대미술관', 'Busan Museum of Modern Art', 'museum', '부산', true, 10)
ON CONFLICT DO NOTHING;

-- ========================================
-- 8. 성공 메시지
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ SAYU 완전한 전시 데이터베이스 스키마 생성 완료!';
  RAISE NOTICE '📊 테이블: exhibitions_ko, exhibitions_en, venues';
  RAISE NOTICE '🔍 인덱스: 성능 최적화 완료';
  RAISE NOTICE '🔄 트리거: 자동 업데이트 설정 완료';
END $$;