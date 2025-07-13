-- Reflections (성찰) 테이블 추가
CREATE TABLE IF NOT EXISTS public.reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exhibition_id VARCHAR(255),
    exhibition_name VARCHAR(500),
    museum_name VARCHAR(255),
    visit_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- 성찰 내용
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    emotion VARCHAR(50), -- happy, inspired, thoughtful, peaceful, etc.
    reflection_text TEXT,
    favorite_artwork VARCHAR(500),
    key_takeaway TEXT,
    
    -- 동행자 정보
    companion_id UUID REFERENCES profiles(id),
    companion_name VARCHAR(100),
    
    -- 미디어
    voice_note_url TEXT,
    photos JSONB DEFAULT '[]', -- Array of photo URLs
    
    -- 메타데이터
    visit_duration INTEGER, -- in minutes
    weather VARCHAR(50),
    mood_before VARCHAR(50),
    mood_after VARCHAR(50),
    tags TEXT[], -- Array of tags
    
    -- 공개 설정
    is_public BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX idx_reflections_user_id ON reflections(user_id);
CREATE INDEX idx_reflections_exhibition_id ON reflections(exhibition_id);
CREATE INDEX idx_reflections_visit_date ON reflections(visit_date);
CREATE INDEX idx_reflections_is_public ON reflections(is_public);

-- RLS 정책
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- 공개 성찰은 누구나 볼 수 있음
CREATE POLICY "Public reflections are viewable by everyone" 
ON reflections FOR SELECT 
USING (is_public = true);

-- 사용자는 자신의 모든 성찰을 볼 수 있음
CREATE POLICY "Users can view own reflections" 
ON reflections FOR SELECT 
USING (auth.uid() = user_id);

-- 사용자는 자신의 성찰을 작성할 수 있음
CREATE POLICY "Users can create own reflections" 
ON reflections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 성찰을 수정할 수 있음
CREATE POLICY "Users can update own reflections" 
ON reflections FOR UPDATE 
USING (auth.uid() = user_id);

-- 사용자는 자신의 성찰을 삭제할 수 있음
CREATE POLICY "Users can delete own reflections" 
ON reflections FOR DELETE 
USING (auth.uid() = user_id);

-- Updated timestamp trigger
CREATE TRIGGER update_reflections_updated_at 
    BEFORE UPDATE ON reflections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();