-- 사용자 작가 선호도 테이블
CREATE TABLE IF NOT EXISTS user_artist_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artist VARCHAR(200) NOT NULL,
  score FLOAT DEFAULT 0,
  is_inferred BOOLEAN DEFAULT FALSE, -- 추론된 선호도인지 직접적인지
  is_initial BOOLEAN DEFAULT FALSE,   -- APT 기반 초기 설정인지
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, artist)
);

-- 사용자 장르 선호도 테이블
CREATE TABLE IF NOT EXISTS user_genre_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  genre VARCHAR(100) NOT NULL,
  score FLOAT DEFAULT 0,
  is_inferred BOOLEAN DEFAULT FALSE,
  is_initial BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, genre)
);

-- 사용자 시대/운동 선호도 테이블
CREATE TABLE IF NOT EXISTS user_period_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(100) NOT NULL,
  score FLOAT DEFAULT 0,
  is_inferred BOOLEAN DEFAULT FALSE,
  is_initial BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period)
);

-- 작가 관계 테이블 (미술사적 연관성)
CREATE TABLE IF NOT EXISTS artist_relations (
  artist VARCHAR(200) PRIMARY KEY,
  movement VARCHAR(100),
  nationality VARCHAR(100),
  birth_year INTEGER,
  death_year INTEGER,
  influenced_by TEXT[], -- 영향을 받은 작가들
  influenced TEXT[],    -- 영향을 준 작가들
  related TEXT[],       -- 같은 운동/시대의 작가들
  styles TEXT[],        -- 주요 스타일
  metadata JSONB DEFAULT '{}'
);

-- 추천 히스토리 테이블
CREATE TABLE IF NOT EXISTS recommendation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artvee_artworks(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50), -- artist_based, genre_based, collaborative, exploratory
  recommendation_score FLOAT,
  explanation TEXT,
  was_viewed BOOLEAN DEFAULT FALSE,
  was_liked BOOLEAN DEFAULT FALSE,
  feedback_score INTEGER, -- 1-5 사용자 피드백
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 취향 스냅샷 (주기적 저장)
CREATE TABLE IF NOT EXISTS user_taste_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  top_artists JSONB, -- [{artist: "van-gogh", score: 100}, ...]
  top_genres JSONB,
  top_periods JSONB,
  preference_vector FLOAT[], -- 벡터 임베딩 (추후 ML용)
  total_interactions INTEGER,
  diversity_score FLOAT, -- 취향의 다양성 지표
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- 인덱스 생성
CREATE INDEX idx_user_artist_prefs_user_score ON user_artist_preferences(user_id, score DESC);
CREATE INDEX idx_user_artist_prefs_artist ON user_artist_preferences(artist);
CREATE INDEX idx_user_genre_prefs_user_score ON user_genre_preferences(user_id, score DESC);
CREATE INDEX idx_user_genre_prefs_genre ON user_genre_preferences(genre);
CREATE INDEX idx_user_period_prefs_user_score ON user_period_preferences(user_id, score DESC);
CREATE INDEX idx_recommendation_history_user ON recommendation_history(user_id, created_at DESC);
CREATE INDEX idx_recommendation_history_artwork ON recommendation_history(artwork_id);
CREATE INDEX idx_user_taste_snapshots_user_date ON user_taste_snapshots(user_id, snapshot_date DESC);

-- 트리거: 선호도 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_preference_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artist_pref_timestamp
BEFORE UPDATE ON user_artist_preferences
FOR EACH ROW EXECUTE FUNCTION update_preference_timestamp();

CREATE TRIGGER update_genre_pref_timestamp
BEFORE UPDATE ON user_genre_preferences
FOR EACH ROW EXECUTE FUNCTION update_preference_timestamp();

CREATE TRIGGER update_period_pref_timestamp
BEFORE UPDATE ON user_period_preferences
FOR EACH ROW EXECUTE FUNCTION update_preference_timestamp();

-- 뷰: 사용자 취향 프로필
CREATE OR REPLACE VIEW user_taste_profiles AS
SELECT 
  u.id as user_id,
  u.personality_type as mbti_type,
  (SELECT COUNT(DISTINCT artist) FROM user_artist_preferences WHERE user_id = u.id) as artist_diversity,
  (SELECT COUNT(DISTINCT genre) FROM user_genre_preferences WHERE user_id = u.id) as genre_diversity,
  (SELECT SUM(score) FROM user_artist_preferences WHERE user_id = u.id) as total_artist_score,
  (SELECT SUM(score) FROM user_genre_preferences WHERE user_id = u.id) as total_genre_score,
  (SELECT COUNT(*) FROM image_usage_log WHERE user_id = u.id) as total_interactions,
  (SELECT COUNT(DISTINCT artwork_id) FROM image_usage_log WHERE user_id = u.id) as unique_artworks_viewed
FROM users u;

-- 뷰: 인기 작가 랭킹
CREATE OR REPLACE VIEW popular_artists_ranking AS
SELECT 
  artist,
  COUNT(DISTINCT user_id) as unique_fans,
  SUM(score) as total_score,
  AVG(score) as avg_score,
  COUNT(*) FILTER (WHERE is_inferred = false) as direct_preferences,
  COUNT(*) FILTER (WHERE is_inferred = true) as inferred_preferences
FROM user_artist_preferences
WHERE artist IS NOT NULL
GROUP BY artist
ORDER BY unique_fans DESC, total_score DESC;

-- 뷰: 장르별 사용자 분포
CREATE OR REPLACE VIEW genre_user_distribution AS
SELECT 
  genre,
  COUNT(DISTINCT user_id) as user_count,
  AVG(score) as avg_preference_score,
  COUNT(DISTINCT uap.user_id) FILTER (WHERE u.personality_type LIKE 'I%') as introvert_count,
  COUNT(DISTINCT uap.user_id) FILTER (WHERE u.personality_type LIKE 'E%') as extrovert_count,
  COUNT(DISTINCT uap.user_id) FILTER (WHERE u.personality_type LIKE '_N%') as intuitive_count,
  COUNT(DISTINCT uap.user_id) FILTER (WHERE u.personality_type LIKE '_S%') as sensing_count
FROM user_genre_preferences uap
JOIN users u ON uap.user_id = u.id
GROUP BY genre
ORDER BY user_count DESC;

-- 샘플 작가 관계 데이터 삽입
INSERT INTO artist_relations (artist, movement, influenced_by, influenced, related) VALUES
('van-gogh', 'post-impressionism', 
 ARRAY['millet', 'daumier', 'hiroshige'], 
 ARRAY['matisse', 'vlaminck', 'kirchner'],
 ARRAY['gauguin', 'cezanne', 'toulouse-lautrec']),
 
('monet', 'impressionism',
 ARRAY['boudin', 'jongkind', 'turner'],
 ARRAY['signac', 'seurat', 'caillebotte'],
 ARRAY['renoir', 'degas', 'pissarro', 'sisley']),
 
('picasso', 'cubism',
 ARRAY['cezanne', 'gauguin', 'el-greco'],
 ARRAY['pollock', 'de-kooning', 'bacon'],
 ARRAY['braque', 'gris', 'leger']),
 
('rembrandt', 'baroque',
 ARRAY['caravaggio', 'lastman', 'elsheimer'],
 ARRAY['bol', 'flinck', 'dou'],
 ARRAY['vermeer', 'hals', 'jan-steen'])
 
ON CONFLICT (artist) DO NOTHING;