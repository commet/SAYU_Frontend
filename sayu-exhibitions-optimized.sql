-- 🎨 SAYU 최적화된 전시 DB 구조 (마스터-번역 패턴)
-- 사용자 활동 테이블과 완벽 호환
-- 생성일: 2025-08-31

-- ========================================
-- 1. 간단한 미술관 테이블 (언어 중립)
-- ========================================
CREATE TABLE IF NOT EXISTS venues_simple (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ko TEXT NOT NULL UNIQUE,
  name_en TEXT,
  city TEXT DEFAULT '서울',
  district TEXT,
  venue_type TEXT CHECK (venue_type IN ('museum', 'gallery', 'art_center', 'alternative', 'auction')) DEFAULT 'gallery',
  address_ko TEXT,
  address_en TEXT,
  phone TEXT,
  website TEXT,
  is_major BOOLEAN DEFAULT FALSE,
  priority_order NUMERIC DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. 전시 마스터 테이블 (언어 중립적 정보)
-- ========================================
CREATE TABLE IF NOT EXISTS exhibitions_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 언어 중립적 필드들
  venue_id UUID REFERENCES venues_simple(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('ongoing', 'upcoming', 'ended')) DEFAULT 'upcoming',
  
  -- 분류 (언어 중립)
  exhibition_type TEXT CHECK (exhibition_type IN ('solo', 'group', 'special', 'biennale', 'permanent')) DEFAULT 'group',
  genre TEXT CHECK (genre IN ('contemporary', 'painting', 'sculpture', 'photography', 'media', 'installation', 'craft', 'design')) DEFAULT 'contemporary',
  
  -- 운영 정보
  ticket_price_adult INTEGER DEFAULT 0, -- 0 = 무료
  ticket_price_student INTEGER DEFAULT 0,
  operating_hours_type TEXT DEFAULT 'standard', -- standard, extended, special
  
  -- 메타데이터
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  priority_order NUMERIC DEFAULT 50,
  
  -- 미디어
  poster_url TEXT,
  thumbnail_url TEXT,
  
  -- 시스템
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 3. 전시 번역 테이블 (다국어 지원)
-- ========================================
CREATE TABLE IF NOT EXISTS exhibitions_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibition_id UUID REFERENCES exhibitions_master(id) ON DELETE CASCADE,
  language_code TEXT CHECK (language_code IN ('ko', 'en', 'ja', 'zh')) NOT NULL,
  
  -- 번역 필드들
  exhibition_title TEXT NOT NULL,
  subtitle TEXT,
  artists TEXT[] DEFAULT '{}',
  description TEXT,
  venue_name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  
  -- 운영 정보 (언어별)
  operating_hours TEXT,
  ticket_info TEXT,
  phone_number TEXT,
  website_url TEXT,
  
  -- SEO
  meta_description TEXT,
  keywords TEXT[],
  
  -- 시스템
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- 언어별 유니크
  UNIQUE(exhibition_id, language_code)
);

-- ========================================
-- 4. 기존 사용자 활동 테이블 연결
-- ========================================
-- 모든 사용자 활동은 exhibitions_master.id를 참조하므로 변경 불필요!

-- exhibition_views 예시 (이미 존재하는 경우 스킵)
CREATE TABLE IF NOT EXISTS exhibition_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibition_id UUID REFERENCES exhibitions_master(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- users 테이블 참조
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exhibition_id, user_id, viewed_at)
);

-- exhibition_likes 예시 (이미 존재하는 경우 스킵)
CREATE TABLE IF NOT EXISTS exhibition_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibition_id UUID REFERENCES exhibitions_master(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exhibition_id, user_id)
);

-- exhibition_reviews 예시 (이미 존재하는 경우 스킵)
CREATE TABLE IF NOT EXISTS exhibition_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibition_id UUID REFERENCES exhibitions_master(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  language_code TEXT DEFAULT 'ko',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 5. 인덱스 생성
-- ========================================
-- venues_simple
CREATE INDEX IF NOT EXISTS idx_venues_simple_name_ko ON venues_simple(name_ko);
CREATE INDEX IF NOT EXISTS idx_venues_simple_major ON venues_simple(is_major);

-- exhibitions_master
CREATE INDEX IF NOT EXISTS idx_exhibitions_master_venue_id ON exhibitions_master(venue_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_master_status ON exhibitions_master(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_master_dates ON exhibitions_master(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_exhibitions_master_featured ON exhibitions_master(is_featured);

-- exhibitions_translations
CREATE INDEX IF NOT EXISTS idx_exhibitions_translations_exhibition_id ON exhibitions_translations(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_translations_language ON exhibitions_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_exhibitions_translations_title ON exhibitions_translations(exhibition_title);

-- ========================================
-- 6. 편의 뷰 (한글/영문 통합)
-- ========================================
CREATE OR REPLACE VIEW exhibitions_ko AS
SELECT 
    em.id,
    et.exhibition_title,
    et.subtitle,
    et.artists,
    et.description,
    et.venue_name,
    v.name_ko as venue_official_name,
    et.city,
    et.address,
    em.start_date,
    em.end_date,
    em.status,
    em.exhibition_type,
    em.genre,
    em.ticket_price_adult,
    em.ticket_price_student,
    et.operating_hours,
    et.ticket_info,
    et.phone_number,
    et.website_url,
    em.view_count,
    em.like_count,
    em.review_count,
    em.is_featured,
    em.priority_order,
    em.poster_url,
    em.thumbnail_url,
    em.created_at,
    em.updated_at
FROM exhibitions_master em
LEFT JOIN exhibitions_translations et ON em.id = et.exhibition_id AND et.language_code = 'ko'
LEFT JOIN venues_simple v ON em.venue_id = v.id;

CREATE OR REPLACE VIEW exhibitions_en AS
SELECT 
    em.id,
    et.exhibition_title,
    et.subtitle,
    et.artists,
    et.description,
    et.venue_name,
    v.name_en as venue_official_name,
    et.city,
    et.address,
    em.start_date,
    em.end_date,
    em.status,
    em.exhibition_type,
    em.genre,
    em.ticket_price_adult,
    em.ticket_price_student,
    et.operating_hours,
    et.ticket_info,
    et.phone_number,
    et.website_url,
    em.view_count,
    em.like_count,
    em.review_count,
    em.is_featured,
    em.priority_order,
    em.poster_url,
    em.thumbnail_url,
    em.created_at,
    em.updated_at
FROM exhibitions_master em
LEFT JOIN exhibitions_translations et ON em.id = et.exhibition_id AND et.language_code = 'en'
LEFT JOIN venues_simple v ON em.venue_id = v.id;

-- ========================================
-- 7. 트리거 (자동 업데이트)
-- ========================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
CREATE TRIGGER update_venues_timestamp BEFORE UPDATE ON venues_simple 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_exhibitions_master_timestamp BEFORE UPDATE ON exhibitions_master 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_exhibitions_translations_timestamp BEFORE UPDATE ON exhibitions_translations 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ========================================
-- 8. 카운트 업데이트 함수
-- ========================================
CREATE OR REPLACE FUNCTION update_exhibition_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'exhibition_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE exhibitions_master 
            SET like_count = like_count + 1 
            WHERE id = NEW.exhibition_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE exhibitions_master 
            SET like_count = like_count - 1 
            WHERE id = OLD.exhibition_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'exhibition_views' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE exhibitions_master 
            SET view_count = view_count + 1 
            WHERE id = NEW.exhibition_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'exhibition_reviews' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE exhibitions_master 
            SET review_count = review_count + 1 
            WHERE id = NEW.exhibition_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE exhibitions_master 
            SET review_count = review_count - 1 
            WHERE id = OLD.exhibition_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 카운트 트리거
CREATE TRIGGER update_like_count AFTER INSERT OR DELETE ON exhibition_likes
    FOR EACH ROW EXECUTE FUNCTION update_exhibition_counts();
CREATE TRIGGER update_view_count AFTER INSERT ON exhibition_views
    FOR EACH ROW EXECUTE FUNCTION update_exhibition_counts();
CREATE TRIGGER update_review_count AFTER INSERT OR DELETE ON exhibition_reviews
    FOR EACH ROW EXECUTE FUNCTION update_exhibition_counts();

-- ========================================
-- 9. 주요 미술관 초기 데이터
-- ========================================
INSERT INTO venues_simple (name_ko, name_en, city, venue_type, is_major, priority_order) VALUES
('국립현대미술관', 'MMCA', '서울', 'museum', true, 1),
('서울시립미술관', 'SeMA', '서울', 'museum', true, 2),
('리움미술관', 'Leeum', '서울', 'museum', true, 3),
('국제갤러리', 'Kukje Gallery', '서울', 'gallery', true, 4),
('갤러리현대', 'Gallery Hyundai', '서울', 'gallery', true, 5),
('페로탕', 'Perrotin', '서울', 'gallery', true, 6),
('타데우스 로팍', 'Thaddaeus Ropac', '서울', 'gallery', true, 7),
('아모레퍼시픽미술관', 'APMA', '서울', 'museum', true, 8),
('대림미술관', 'Daelim Museum', '서울', 'museum', true, 9),
('예술의전당', 'Seoul Arts Center', '서울', 'art_center', true, 10)
ON CONFLICT (name_ko) DO NOTHING;

-- ========================================
-- 10. 성공 메시지
-- ========================================
DO $$
BEGIN
  RAISE NOTICE 'SAYU 최적화 전시 DB 구축 완료!';
  RAISE NOTICE '마스터-번역 패턴으로 완벽한 다국어 지원';
  RAISE NOTICE '기존 사용자 활동 테이블과 100%% 호환';
  RAISE NOTICE 'exhibitions_ko/en 뷰로 간편한 접근';
END $$;