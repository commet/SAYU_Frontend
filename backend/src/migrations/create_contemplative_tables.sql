-- 사유의 산책 관련 테이블들

-- 감상 세션 테이블
CREATE TABLE IF NOT EXISTS contemplative_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    artwork_id VARCHAR(255) NOT NULL,
    duration FLOAT NOT NULL, -- 초 단위
    depth VARCHAR(20) CHECK (depth IN ('glance', 'observe', 'contemplate', 'immerse')),
    interactions JSONB DEFAULT '[]',
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 산책 세션 테이블
CREATE TABLE IF NOT EXISTS walk_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    mode VARCHAR(20) CHECK (mode IN ('free', 'themed', 'deep', 'memory')),
    duration INTEGER NOT NULL, -- 초 단위
    artwork_count INTEGER DEFAULT 0,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 작품별 감상 통계 테이블
CREATE TABLE IF NOT EXISTS artwork_contemplation_stats (
    artwork_id VARCHAR(255) PRIMARY KEY,
    total_views INTEGER DEFAULT 0,
    total_time FLOAT DEFAULT 0, -- 총 감상 시간 (초)
    avg_depth FLOAT DEFAULT 1, -- 평균 감상 깊이 (1-4)
    longest_contemplation FLOAT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 사용자별 감상 통계 테이블
CREATE TABLE IF NOT EXISTS user_contemplation_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_time FLOAT DEFAULT 0, -- 총 감상 시간
    deep_contemplations INTEGER DEFAULT 0, -- 깊은 감상 횟수
    favorite_time_of_day VARCHAR(20), -- morning, afternoon, evening, night
    avg_session_duration FLOAT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 사용자별 산책 통계 테이블
CREATE TABLE IF NOT EXISTS user_walk_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_walks INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0, -- 총 산책 시간 (초)
    favorite_mode VARCHAR(20),
    longest_walk INTEGER DEFAULT 0,
    last_walk TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_contemplative_sessions_user_id ON contemplative_sessions(user_id);
CREATE INDEX idx_contemplative_sessions_artwork_id ON contemplative_sessions(artwork_id);
CREATE INDEX idx_contemplative_sessions_timestamp ON contemplative_sessions(timestamp DESC);
CREATE INDEX idx_walk_sessions_user_id ON walk_sessions(user_id);
CREATE INDEX idx_walk_sessions_mode ON walk_sessions(mode);

-- 감상 깊이별 작품 추천을 위한 뷰
CREATE OR REPLACE VIEW deep_contemplation_artworks AS
SELECT 
    acs.artwork_id,
    acs.total_views,
    acs.avg_depth,
    acs.total_time,
    RANK() OVER (ORDER BY acs.avg_depth DESC, acs.total_time DESC) as depth_rank
FROM artwork_contemplation_stats acs
WHERE acs.total_views > 5
AND acs.avg_depth > 2.5;

-- 사용자 감상 패턴 뷰
CREATE OR REPLACE VIEW user_contemplation_patterns AS
SELECT 
    cs.user_id,
    DATE_TRUNC('hour', cs.timestamp) as hour_of_day,
    COUNT(*) as session_count,
    AVG(cs.duration) as avg_duration,
    MODE() WITHIN GROUP (ORDER BY cs.depth) as most_common_depth
FROM contemplative_sessions cs
WHERE cs.duration > 10 -- 의미 있는 감상만
GROUP BY cs.user_id, DATE_TRUNC('hour', cs.timestamp);

-- 감상 깊이 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_contemplation_stats() RETURNS TRIGGER AS $$
BEGIN
    -- 작품별 통계 업데이트
    INSERT INTO artwork_contemplation_stats (
        artwork_id, 
        total_views, 
        total_time, 
        avg_depth,
        longest_contemplation
    )
    VALUES (
        NEW.artwork_id,
        1,
        NEW.duration,
        CASE NEW.depth
            WHEN 'glance' THEN 1
            WHEN 'observe' THEN 2
            WHEN 'contemplate' THEN 3
            WHEN 'immerse' THEN 4
        END,
        NEW.duration
    )
    ON CONFLICT (artwork_id) DO UPDATE SET
        total_views = artwork_contemplation_stats.total_views + 1,
        total_time = artwork_contemplation_stats.total_time + NEW.duration,
        avg_depth = (
            artwork_contemplation_stats.avg_depth * artwork_contemplation_stats.total_views + 
            CASE NEW.depth
                WHEN 'glance' THEN 1
                WHEN 'observe' THEN 2
                WHEN 'contemplate' THEN 3
                WHEN 'immerse' THEN 4
            END
        ) / (artwork_contemplation_stats.total_views + 1),
        longest_contemplation = GREATEST(artwork_contemplation_stats.longest_contemplation, NEW.duration),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_contemplation_stats_trigger
AFTER INSERT ON contemplative_sessions
FOR EACH ROW
EXECUTE FUNCTION update_contemplation_stats();