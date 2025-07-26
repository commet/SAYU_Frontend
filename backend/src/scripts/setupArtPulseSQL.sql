-- Art Pulse 실시간 공동 감상 데이터베이스 스키마

-- Art Pulse Sessions Table
CREATE TABLE IF NOT EXISTS art_pulse_sessions (
  id VARCHAR(255) PRIMARY KEY,
  artwork_id UUID,
  artwork_data JSONB NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  phase VARCHAR(50) DEFAULT 'contemplation' CHECK (phase IN ('contemplation', 'sharing', 'voting')),
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_art_pulse_sessions_status ON art_pulse_sessions(status);
CREATE INDEX IF NOT EXISTS idx_art_pulse_sessions_start_time ON art_pulse_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_art_pulse_sessions_artwork_id ON art_pulse_sessions(artwork_id);

-- Art Pulse Participations Table
CREATE TABLE IF NOT EXISTS art_pulse_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) REFERENCES art_pulse_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sayu_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_art_pulse_participations_session ON art_pulse_participations(session_id);
CREATE INDEX IF NOT EXISTS idx_art_pulse_participations_user ON art_pulse_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_art_pulse_participations_sayu_type ON art_pulse_participations(sayu_type);

-- Art Pulse Emotions Table
CREATE TABLE IF NOT EXISTS art_pulse_emotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) REFERENCES art_pulse_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emotion VARCHAR(50) NOT NULL CHECK (emotion IN (
    'wonder', 'melancholy', 'joy', 'contemplation', 'nostalgia', 
    'awe', 'serenity', 'passion', 'mystery', 'hope'
  )),
  intensity DECIMAL(3,2) DEFAULT 1.0 CHECK (intensity >= 0.1 AND intensity <= 1.0),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_art_pulse_emotions_session ON art_pulse_emotions(session_id);
CREATE INDEX IF NOT EXISTS idx_art_pulse_emotions_user ON art_pulse_emotions(user_id);
CREATE INDEX IF NOT EXISTS idx_art_pulse_emotions_emotion ON art_pulse_emotions(emotion);
CREATE INDEX IF NOT EXISTS idx_art_pulse_emotions_submitted_at ON art_pulse_emotions(submitted_at);

-- Art Pulse Reflections Table
CREATE TABLE IF NOT EXISTS art_pulse_reflections (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES art_pulse_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reflection TEXT NOT NULL CHECK (length(reflection) >= 10 AND length(reflection) <= 500),
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_art_pulse_reflections_session ON art_pulse_reflections(session_id);
CREATE INDEX IF NOT EXISTS idx_art_pulse_reflections_user ON art_pulse_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_art_pulse_reflections_created_at ON art_pulse_reflections(created_at);
CREATE INDEX IF NOT EXISTS idx_art_pulse_reflections_anonymous ON art_pulse_reflections(is_anonymous);

-- Art Pulse Reflection Likes Table
CREATE TABLE IF NOT EXISTS art_pulse_reflection_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reflection_id VARCHAR(255) REFERENCES art_pulse_reflections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reflection_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_art_pulse_likes_reflection ON art_pulse_reflection_likes(reflection_id);
CREATE INDEX IF NOT EXISTS idx_art_pulse_likes_user ON art_pulse_reflection_likes(user_id);

-- Artwork Analytics Table (for selection algorithm)
CREATE TABLE IF NOT EXISTS artwork_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID UNIQUE,
  emotional_depth_score DECIMAL(3,2) DEFAULT 0.5 CHECK (emotional_depth_score >= 0 AND emotional_depth_score <= 1),
  visual_impact_score DECIMAL(3,2) DEFAULT 0.5 CHECK (visual_impact_score >= 0 AND visual_impact_score <= 1),
  discussion_potential_score DECIMAL(3,2) DEFAULT 0.5 CHECK (discussion_potential_score >= 0 AND discussion_potential_score <= 1),
  historical_engagement JSONB DEFAULT '{}',
  mood_tags TEXT[],
  season_tags TEXT[],
  last_featured_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artwork_analytics_artwork ON artwork_analytics(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_analytics_discussion_score ON artwork_analytics(discussion_potential_score);
CREATE INDEX IF NOT EXISTS idx_artwork_analytics_emotional_score ON artwork_analytics(emotional_depth_score);
CREATE INDEX IF NOT EXISTS idx_artwork_analytics_last_featured ON artwork_analytics(last_featured_at);

-- Insert Art Pulse Achievements
INSERT INTO achievements (id, name, description, category, requirement_type, requirement_value, reward_points, icon_url, created_at)
VALUES 
  ('art-pulse-deep-reflection', 'Deep Reflection Master', 'Your reflection received the most likes in an Art Pulse session', 'art_pulse', 'reflection_likes', 1, 100, '/icons/achievements/deep-reflection.svg', NOW()),
  ('art-pulse-emotion-pioneer', 'Emotion Pioneer', 'Participated in 10 Art Pulse sessions', 'art_pulse', 'session_count', 10, 50, '/icons/achievements/emotion-pioneer.svg', NOW()),
  ('art-pulse-contemplative-soul', 'Contemplative Soul', 'Shared reflections in 5 consecutive Art Pulse sessions', 'art_pulse', 'consecutive_reflections', 5, 75, '/icons/achievements/contemplative-soul.svg', NOW()),
  ('art-pulse-community-builder', 'Community Builder', 'Your reflections received 100 total likes across all sessions', 'art_pulse', 'total_reflection_likes', 100, 200, '/icons/achievements/community-builder.svg', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample artwork analytics for testing
INSERT INTO artwork_analytics (artwork_id, emotional_depth_score, visual_impact_score, discussion_potential_score, mood_tags, season_tags)
VALUES
  (gen_random_uuid(), 0.8, 0.9, 0.7, ARRAY['contemplative', 'melancholic'], ARRAY['autumn', 'winter']),
  (gen_random_uuid(), 0.9, 0.8, 0.8, ARRAY['joyful', 'vibrant'], ARRAY['spring', 'summer']),
  (gen_random_uuid(), 0.7, 0.7, 0.9, ARRAY['mysterious', 'thought-provoking'], ARRAY['winter'])
ON CONFLICT (artwork_id) DO NOTHING;