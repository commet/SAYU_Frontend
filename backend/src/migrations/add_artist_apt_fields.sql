-- Artist APT 필드 추가 마이그레이션
-- 16가지 APT 유형으로 작가를 분류하기 위한 필드들

-- artists 테이블에 APT 관련 필드 추가
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS apt_type VARCHAR(4) CHECK (apt_type IN (
  'LAEF', 'LAEC', 'LAMF', 'LAMC', 
  'LREF', 'LREC', 'LRMF', 'LRMC',
  'SAEF', 'SAEC', 'SAMF', 'SAMC',
  'SREF', 'SREC', 'SRMF', 'SRMC'
)),
ADD COLUMN IF NOT EXISTS apt_scores JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS apt_analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS apt_confidence INTEGER CHECK (apt_confidence >= 0 AND apt_confidence <= 100),
ADD COLUMN IF NOT EXISTS apt_analyzed_at TIMESTAMP;

-- APT 유형별 인덱스
CREATE INDEX IF NOT EXISTS idx_artists_apt_type ON artists(apt_type);
CREATE INDEX IF NOT EXISTS idx_artists_apt_confidence ON artists(apt_confidence);

-- APT 분석 이력 테이블
CREATE TABLE IF NOT EXISTS artist_apt_analysis_history (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  apt_type VARCHAR(4) NOT NULL,
  axis_scores JSONB NOT NULL,
  confidence INTEGER NOT NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 이력 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_apt_history_artist ON artist_apt_analysis_history(artist_id);
CREATE INDEX IF NOT EXISTS idx_apt_history_created ON artist_apt_analysis_history(created_at);

-- APT 유형 참조 테이블 (정적 데이터)
CREATE TABLE IF NOT EXISTS apt_types (
  code VARCHAR(4) PRIMARY KEY,
  name_ko VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) NOT NULL,
  animal_ko VARCHAR(20) NOT NULL,
  animal_en VARCHAR(20) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  description_ko TEXT NOT NULL,
  description_en TEXT NOT NULL,
  characteristics JSONB NOT NULL
);

-- APT 유형 데이터 삽입
INSERT INTO apt_types (code, name_ko, name_en, animal_ko, animal_en, emoji, description_ko, description_en, characteristics) VALUES
('LAEF', '몽환적 방랑자', 'Dreamy Wanderer', '여우', 'Fox', '🦊', '혼자서 추상 작품을 감정적으로 자유롭게 감상', 'Appreciates abstract art emotionally and freely alone', '["독립적", "감성적", "자유로운", "직관적"]'),
('LAEC', '감성 큐레이터', 'Emotional Curator', '고양이', 'Cat', '🐱', '혼자서 추상 작품을 감정적으로 체계적으로 감상', 'Appreciates abstract art emotionally and systematically alone', '["섬세한", "체계적", "감성적", "분석적"]'),
('LAMF', '직관적 탐구자', 'Intuitive Explorer', '올빼미', 'Owl', '🦉', '혼자서 추상 작품의 의미를 자유롭게 탐구', 'Explores abstract art meanings freely alone', '["탐구적", "자유로운", "철학적", "개방적"]'),
('LAMC', '철학적 수집가', 'Philosophical Collector', '거북이', 'Turtle', '🐢', '혼자서 추상 작품의 의미를 체계적으로 정리', 'Systematically organizes abstract art meanings alone', '["체계적", "철학적", "수집가", "분석적"]'),
('LREF', '고독한 관찰자', 'Solitary Observer', '카멜레온', 'Chameleon', '🦎', '혼자서 구상 작품을 감정적으로 자유롭게 관찰', 'Observes representational art emotionally and freely alone', '["관찰력", "감성적", "독립적", "자유로운"]'),
('LREC', '섬세한 감정가', 'Delicate Connoisseur', '고슴도치', 'Hedgehog', '🦔', '혼자서 구상 작품을 감정적으로 체계적으로 음미', 'Appreciates representational art emotionally and systematically alone', '["섬세한", "체계적", "감상적", "깊이있는"]'),
('LRMF', '디지털 탐험가', 'Digital Explorer', '문어', 'Octopus', '🐙', '혼자서 구상 작품의 의미를 자유롭게 분석', 'Analyzes representational art meanings freely alone', '["분석적", "탐험적", "기술적", "자유로운"]'),
('LRMC', '학구적 연구자', 'Academic Researcher', '비버', 'Beaver', '🦫', '혼자서 구상 작품의 의미를 체계적으로 연구', 'Researches representational art meanings systematically alone', '["학구적", "체계적", "연구적", "정밀한"]'),
('SAEF', '감성 나눔이', 'Emotional Sharer', '나비', 'Butterfly', '🦋', '함께 추상 작품의 감정을 자유롭게 나눔', 'Shares abstract art emotions freely with others', '["사교적", "감성적", "나눔", "자유로운"]'),
('SAEC', '예술 네트워커', 'Art Networker', '펭귄', 'Penguin', '🐧', '함께 추상 작품의 감정을 체계적으로 공유', 'Shares abstract art emotions systematically with others', '["네트워킹", "체계적", "감성적", "연결"]'),
('SAMF', '영감 전도사', 'Inspiration Evangelist', '앵무새', 'Parrot', '🦜', '함께 추상 작품의 의미를 자유롭게 전파', 'Spreads abstract art meanings freely with others', '["전파력", "영감적", "자유로운", "열정적"]'),
('SAMC', '문화 기획자', 'Cultural Planner', '사슴', 'Deer', '🦌', '함께 추상 작품의 의미를 체계적으로 기획', 'Plans abstract art meanings systematically with others', '["기획력", "체계적", "문화적", "조직적"]'),
('SREF', '열정적 관람자', 'Passionate Viewer', '강아지', 'Dog', '🐕', '함께 구상 작품을 감정적으로 자유롭게 즐김', 'Enjoys representational art emotionally and freely with others', '["열정적", "사교적", "즐거운", "자유로운"]'),
('SREC', '따뜻한 안내자', 'Warm Guide', '오리', 'Duck', '🦆', '함께 구상 작품을 감정적으로 체계적으로 안내', 'Guides representational art emotionally and systematically with others', '["안내력", "따뜻한", "체계적", "배려"]'),
('SRMF', '지식 멘토', 'Knowledge Mentor', '코끼리', 'Elephant', '🐘', '함께 구상 작품의 의미를 자유롭게 가르침', 'Teaches representational art meanings freely with others', '["가르침", "지식", "자유로운", "멘토링"]'),
('SRMC', '체계적 교육자', 'Systematic Educator', '독수리', 'Eagle', '🦅', '함께 구상 작품의 의미를 체계적으로 교육', 'Educates representational art meanings systematically with others', '["교육적", "체계적", "조직적", "전문적"]')
ON CONFLICT (code) DO NOTHING;

-- 작가-APT 매칭 통계 뷰
CREATE OR REPLACE VIEW artist_apt_statistics AS
SELECT 
  apt_type,
  COUNT(*) as artist_count,
  AVG(apt_confidence) as avg_confidence,
  COUNT(CASE WHEN apt_confidence >= 80 THEN 1 END) as high_confidence_count
FROM artists
WHERE apt_type IS NOT NULL
GROUP BY apt_type;

-- 유사 작가 찾기 함수
CREATE OR REPLACE FUNCTION find_similar_artists_by_apt(
  p_artist_id INTEGER,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  artist_id INTEGER,
  artist_name VARCHAR,
  apt_type VARCHAR,
  similarity_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH target_artist AS (
    SELECT apt_type, apt_scores
    FROM artists
    WHERE id = p_artist_id
  )
  SELECT 
    a.id,
    a.name,
    a.apt_type,
    (
      1 - (
        ABS((a.apt_scores->>'L_S')::NUMERIC - (ta.apt_scores->>'L_S')::NUMERIC) / 200.0 +
        ABS((a.apt_scores->>'A_R')::NUMERIC - (ta.apt_scores->>'A_R')::NUMERIC) / 200.0 +
        ABS((a.apt_scores->>'E_M')::NUMERIC - (ta.apt_scores->>'E_M')::NUMERIC) / 200.0 +
        ABS((a.apt_scores->>'F_C')::NUMERIC - (ta.apt_scores->>'F_C')::NUMERIC) / 200.0
      ) / 4
    ) * 100 AS similarity_score
  FROM artists a, target_artist ta
  WHERE a.id != p_artist_id
    AND a.apt_type IS NOT NULL
  ORDER BY similarity_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;