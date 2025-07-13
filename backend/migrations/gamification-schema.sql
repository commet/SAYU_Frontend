-- 게이미피케이션 시스템 데이터베이스 스키마

-- 사용자 게이미피케이션 정보
CREATE TABLE IF NOT EXISTS user_gamification (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    current_points INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    weekly_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_user_gamification_level ON user_gamification(level);
CREATE INDEX idx_user_gamification_total_points ON user_gamification(total_points DESC);

-- 활동 로그 (이벤트 소싱)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    points_earned INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_activity_type ON activity_logs(activity_type);

-- 칭호 정의
CREATE TABLE IF NOT EXISTS titles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ko VARCHAR(100) NOT NULL,
    description TEXT,
    description_ko TEXT,
    icon VARCHAR(10),
    rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
    sort_order INTEGER DEFAULT 0
);

-- 초기 칭호 데이터
INSERT INTO titles (id, name, name_ko, description, description_ko, icon, rarity) VALUES
('early-bird', 'Early Bird', '얼리버드', 'Visit exhibitions before 10 AM 5 times', '오전 10시 이전 관람 5회', '🌅', 'common'),
('night-owl', 'Night Owl', '야행성 올빼미', 'Visit night exhibitions 3 times', '야간 개장 관람 3회', '🦉', 'rare'),
('slow-walker', 'Slow Walker', '느긋한 산책자', 'Average viewing time over 2 hours', '평균 관람 시간 2시간 이상', '🚶', 'rare'),
('passion-runner', 'Passion Runner', '열정 관람러', 'Visit 3+ exhibitions in one day', '하루 3개 이상 전시 관람', '🏃', 'common'),
('modern-art', 'Modern Art Enthusiast', '현대미술 마니아', 'Visit 20 modern art exhibitions', '현대미술 전시 20회', '🎭', 'epic'),
('photo-lover', 'Photography Lover', '사진전 애호가', 'Visit 15 photography exhibitions', '사진전 15회', '📸', 'rare'),
('k-art', 'K-Art Supporter', 'K-아트 서포터', 'Visit 10 Korean artist exhibitions', '한국 작가전 10회', '🇰🇷', 'rare')
ON CONFLICT (id) DO NOTHING;

-- 사용자 칭호 획득 기록
CREATE TABLE IF NOT EXISTS user_titles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title_id VARCHAR(50) REFERENCES titles(id),
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    is_main BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id, title_id)
);

-- 칭호 진행도
CREATE TABLE IF NOT EXISTS title_progress (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title_id VARCHAR(50) REFERENCES titles(id),
    progress INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, title_id)
);

-- 도전 과제
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL, -- {activity: 'EXHIBITION_COMPLETE', metadata: {genre: 'modern'}}
    target INTEGER NOT NULL,
    reward_points INTEGER NOT NULL,
    reward_title_id VARCHAR(50) REFERENCES titles(id),
    is_active BOOLEAN DEFAULT true,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자별 도전 과제 진행도
CREATE TABLE IF NOT EXISTS user_challenges (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, challenge_id)
);

-- 일일 통계 (집계 테이블)
CREATE TABLE IF NOT EXISTS daily_stats (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    points_earned INTEGER DEFAULT 0,
    exhibitions_visited INTEGER DEFAULT 0,
    reviews_written INTEGER DEFAULT 0,
    photos_uploaded INTEGER DEFAULT 0,
    total_duration_minutes INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, date)
);

-- 리더보드 (주간)
CREATE TABLE IF NOT EXISTS leaderboard_weekly (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    points INTEGER DEFAULT 0,
    rank INTEGER,
    PRIMARY KEY (user_id, week_start)
);

-- 리더보드 (월간)
CREATE TABLE IF NOT EXISTS leaderboard_monthly (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month_start DATE NOT NULL,
    points INTEGER DEFAULT 0,
    rank INTEGER,
    PRIMARY KEY (user_id, month_start)
);

-- 인덱스
CREATE INDEX idx_leaderboard_weekly_rank ON leaderboard_weekly(week_start, rank);
CREATE INDEX idx_leaderboard_monthly_rank ON leaderboard_monthly(month_start, rank);

-- 이벤트 정의
CREATE TABLE IF NOT EXISTS gamification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- 'multiplier', 'special_challenge', 'double_points'
    conditions JSONB DEFAULT '{}',
    multiplier DECIMAL(3,2) DEFAULT 1.0,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 전시 세션 기록
CREATE TABLE IF NOT EXISTS exhibition_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exhibition_id UUID NOT NULL,
    exhibition_name VARCHAR(500),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    location JSONB, -- {lat, lng, venue}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_exhibition_sessions_user_id ON exhibition_sessions(user_id);
CREATE INDEX idx_exhibition_sessions_start_time ON exhibition_sessions(start_time DESC);

-- 뷰: 사용자 통계 요약
CREATE OR REPLACE VIEW user_stats_summary AS
SELECT 
    ug.user_id,
    ug.level,
    ug.total_points,
    ug.weekly_streak,
    COUNT(DISTINCT es.id) as total_exhibitions,
    COALESCE(AVG(es.duration_minutes), 0) as avg_duration,
    COUNT(DISTINCT ut.title_id) as titles_earned,
    COUNT(DISTINCT DATE(al.created_at)) as active_days
FROM user_gamification ug
LEFT JOIN exhibition_sessions es ON ug.user_id = es.user_id
LEFT JOIN user_titles ut ON ug.user_id = ut.user_id
LEFT JOIN activity_logs al ON ug.user_id = al.user_id
GROUP BY ug.user_id, ug.level, ug.total_points, ug.weekly_streak;

-- 함수: 레벨 이름 가져오기
CREATE OR REPLACE FUNCTION get_level_name(level_num INTEGER)
RETURNS TABLE(name VARCHAR, name_ko VARCHAR, icon VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN level_num <= 10 THEN 'First Steps'
            WHEN level_num <= 25 THEN 'Full of Curiosity'
            WHEN level_num <= 50 THEN 'Eyes Opening'
            WHEN level_num <= 75 THEN 'Full of Emotion'
            ELSE 'Art Soul'
        END as name,
        CASE 
            WHEN level_num <= 10 THEN '첫 발걸음'
            WHEN level_num <= 25 THEN '호기심 가득'
            WHEN level_num <= 50 THEN '눈뜨는 중'
            WHEN level_num <= 75 THEN '감성 충만'
            ELSE '예술혼'
        END as name_ko,
        CASE 
            WHEN level_num <= 10 THEN '🌱'
            WHEN level_num <= 25 THEN '👀'
            WHEN level_num <= 50 THEN '✨'
            WHEN level_num <= 75 THEN '🌸'
            ELSE '🎨'
        END as icon;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 활동 로그 생성 시 포인트 업데이트
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_gamification
    SET 
        current_points = current_points + NEW.points_earned,
        total_points = total_points + NEW.points_earned,
        last_activity = NEW.created_at,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_points
AFTER INSERT ON activity_logs
FOR EACH ROW
EXECUTE FUNCTION update_user_points();

-- 트리거: 타임스탬프 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_gamification_updated_at
BEFORE UPDATE ON user_gamification
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();