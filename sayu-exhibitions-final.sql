-- 🎨 SAYU 최종 전시 데이터베이스 스키마
-- 간단한 venues_simple 포함
-- 생성일: 2025-08-31

-- ========================================
-- 1. 간단한 미술관/갤러리 테이블 (venues_simple)
-- ========================================
CREATE TABLE IF NOT EXISTS venues_simple (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ko TEXT NOT NULL UNIQUE,
  name_en TEXT,
  city TEXT DEFAULT '서울',
  district TEXT, -- 강남구, 종로구 등
  venue_type TEXT CHECK (venue_type IN ('museum', 'gallery', 'art_center', 'alternative', 'auction')) DEFAULT 'gallery',
  address TEXT,
  phone TEXT,
  website TEXT,
  is_major BOOLEAN DEFAULT FALSE, -- 주요 미술관 여부
  priority_order NUMERIC DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. 한글 전시 테이블 (exhibitions_ko)
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
  venue_id UUID REFERENCES venues_simple(id),
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
-- 3. 영문 전시 테이블 (exhibitions_en)
-- ========================================
CREATE TABLE IF NOT EXISTS exhibitions_en (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibition_ko_id UUID REFERENCES exhibitions_ko(id) ON DELETE CASCADE,
  
  -- 기본 정보
  exhibition_title TEXT NOT NULL,
  artists TEXT[] DEFAULT '{}',
  description TEXT,
  
  -- 날짜 정보 (ko와 동일)
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
  venue_id UUID REFERENCES venues_simple(id),
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
-- 4. 인덱스 생성
-- ========================================

-- venues_simple 인덱스
CREATE INDEX IF NOT EXISTS idx_venues_simple_name_ko ON venues_simple(name_ko);
CREATE INDEX IF NOT EXISTS idx_venues_simple_city ON venues_simple(city);
CREATE INDEX IF NOT EXISTS idx_venues_simple_major ON venues_simple(is_major);
CREATE INDEX IF NOT EXISTS idx_venues_simple_priority ON venues_simple(priority_order);

-- exhibitions_ko 인덱스
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_status ON exhibitions_ko(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_dates ON exhibitions_ko(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_venue_name ON exhibitions_ko(venue_name);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_venue_id ON exhibitions_ko(venue_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_ko_featured ON exhibitions_ko(is_featured);

-- exhibitions_en 인덱스
CREATE INDEX IF NOT EXISTS idx_exhibitions_en_ko_id ON exhibitions_en(exhibition_ko_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_en_venue_id ON exhibitions_en(venue_id);

-- ========================================
-- 5. 업데이트 트리거
-- ========================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_venues_simple_timestamp BEFORE UPDATE
    ON venues_simple FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_exhibitions_ko_timestamp BEFORE UPDATE
    ON exhibitions_ko FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_exhibitions_en_timestamp BEFORE UPDATE
    ON exhibitions_en FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ========================================
-- 6. 주요 미술관 초기 데이터
-- ========================================
INSERT INTO venues_simple (name_ko, name_en, city, district, venue_type, is_major, priority_order) VALUES
('국립현대미술관', 'National Museum of Modern and Contemporary Art', '서울', '종로구', 'museum', true, 1),
('서울시립미술관', 'Seoul Museum of Art', '서울', '중구', 'museum', true, 2),
('리움미술관', 'Leeum Museum of Art', '서울', '용산구', 'museum', true, 3),
('국제갤러리', 'Kukje Gallery', '서울', '종로구', 'gallery', true, 4),
('갤러리현대', 'Gallery Hyundai', '서울', '종로구', 'gallery', true, 5),
('페로탕', 'Perrotin', '서울', '용산구', 'gallery', true, 6),
('타데우스 로팍', 'Thaddaeus Ropac', '서울', '용산구', 'gallery', true, 7),
('아모레퍼시픽미술관', 'Amorepacific Museum of Art', '서울', '용산구', 'museum', true, 8),
('대림미술관', 'Daelim Museum', '서울', '종로구', 'museum', true, 9),
('예술의전당', 'Seoul Arts Center', '서울', '서초구', 'art_center', true, 10),
('DDP', 'Dongdaemun Design Plaza', '서울', '중구', 'art_center', true, 11),
('호암미술관', 'Hoam Museum of Art', '용인', NULL, 'museum', true, 12),
('부산현대미술관', 'Busan Museum of Modern Art', '부산', NULL, 'museum', true, 13),
('페이스갤러리', 'Pace Gallery', '서울', '용산구', 'gallery', true, 14),
('PKM갤러리', 'PKM Gallery', '서울', '종로구', 'gallery', true, 15),
('학고재', 'Hakgojae Gallery', '서울', '종로구', 'gallery', true, 16),
('아라리오갤러리', 'Arario Gallery', '서울', '종로구', 'gallery', true, 17),
('가나아트센터', 'Gana Art Center', '서울', '종로구', 'gallery', true, 18),
('일민미술관', 'Ilmin Museum of Art', '서울', '종로구', 'museum', false, 19),
('송은', 'SongEun', '서울', '강남구', 'art_center', false, 20)
ON CONFLICT (name_ko) DO NOTHING;

-- ========================================
-- 7. 성공 메시지
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ SAYU 최종 전시 데이터베이스 생성 완료!';
  RAISE NOTICE '📊 테이블: venues_simple, exhibitions_ko, exhibitions_en';
  RAISE NOTICE '🏛️ 주요 미술관 20개 등록 완료';
  RAISE NOTICE '🔍 인덱스 및 트리거 설정 완료';
END $$;