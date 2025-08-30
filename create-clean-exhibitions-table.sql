-- 새로운 깨끗한 전시 테이블 생성
-- exhibitions_clean 테이블

CREATE TABLE exhibitions_clean (
  -- 기본 식별자
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 전시 기본 정보
  exhibition_title TEXT NOT NULL,  -- 한글/영문 통합 (예: "김창열 회고전 / KIM TSCHANG-YEUL")
  artists TEXT[],  -- 작가 배열 (예: ['김창열', '이우환'])
  description TEXT,  -- 2-3문장 설명
  
  -- 날짜 정보
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('ongoing', 'upcoming', 'ended')),
  
  -- 장소 정보
  venue_name TEXT NOT NULL,  -- 예: '국립현대미술관 서울'
  city TEXT DEFAULT '서울',
  address TEXT,
  
  -- 운영 정보
  operating_hours TEXT,  -- 예: '10:00-18:00 (월요일 휴관)'
  ticket_price TEXT,  -- 예: '성인 4,000원 / 학생 2,000원'
  phone_number TEXT,
  website_url TEXT,
  source_url TEXT,  -- 공식 웹사이트 링크
  
  -- 전시 유형
  exhibition_type TEXT CHECK (exhibition_type IN ('solo', 'group', 'special', 'biennale', 'permanent')),
  genre TEXT CHECK (genre IN ('contemporary', 'painting', 'photography', 'craft', 'design', 'media', 'sculpture', 'installation')),
  
  -- 관리 필드
  venue_id INTEGER,  -- 나중에 venues 테이블과 연결
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,  -- 추천 전시 여부
  priority_order INTEGER,  -- 우선순위 (낮을수록 우선)
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_exhibitions_clean_dates ON exhibitions_clean(start_date, end_date);
CREATE INDEX idx_exhibitions_clean_venue ON exhibitions_clean(venue_name);
CREATE INDEX idx_exhibitions_clean_status ON exhibitions_clean(status);
CREATE INDEX idx_exhibitions_clean_priority ON exhibitions_clean(priority_order);

-- 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exhibitions_clean_updated_at BEFORE UPDATE
    ON exhibitions_clean FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 상태 자동 업데이트 함수 (매일 실행하면 자동으로 status 변경)
CREATE OR REPLACE FUNCTION update_exhibition_status()
RETURNS void AS $$
BEGIN
    UPDATE exhibitions_clean 
    SET status = CASE
        WHEN CURRENT_DATE < start_date THEN 'upcoming'
        WHEN CURRENT_DATE > end_date THEN 'ended'
        ELSE 'ongoing'
    END;
END;
$$ LANGUAGE plpgsql;