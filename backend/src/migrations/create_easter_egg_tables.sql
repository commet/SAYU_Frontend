-- Easter Egg System Tables

-- Easter egg definitions table
CREATE TABLE IF NOT EXISTS easter_eggs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ko VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    description_ko TEXT NOT NULL,
    trigger_type VARCHAR(20) NOT NULL CHECK (trigger_type IN ('action', 'time', 'sequence', 'command', 'random')),
    condition_type VARCHAR(50) NOT NULL,
    condition_value JSONB,
    reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('badge', 'title', 'feature', 'experience')),
    reward_id VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    icon VARCHAR(10) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('knowledge', 'exploration', 'emotion', 'special')),
    points INTEGER DEFAULT 0,
    hints TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User easter egg discoveries table
CREATE TABLE IF NOT EXISTS user_easter_eggs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    egg_id VARCHAR(50) NOT NULL REFERENCES easter_eggs(id),
    discovered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    notification_shown BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, egg_id)
);

-- Index for faster queries
CREATE INDEX idx_user_easter_eggs_user_id ON user_easter_eggs(user_id);
CREATE INDEX idx_user_easter_eggs_discovered_at ON user_easter_eggs(discovered_at);
CREATE INDEX idx_easter_eggs_rarity ON easter_eggs(rarity);

-- Add columns to users table for easter egg tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS easter_egg_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_title VARCHAR(100);

-- Add role column if it doesn't exist (for admin functionality)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    END IF;
END $$;

-- Insert initial easter eggs
INSERT INTO easter_eggs (id, name, name_ko, description, description_ko, trigger_type, condition_type, condition_value, reward_type, reward_id, rarity, icon, category, points, hints) VALUES
-- Action-based
('perfectionist', 'Perfectionist', '완벽주의자', 'Retook the personality quiz 3 or more times', '성격 퀴즈를 3번 이상 다시 응시', 'action', 'quiz_retakes', '{"value": 3}', 'badge', 'badge_perfectionist', 'common', '🏆', 'special', 10, ARRAY['Not satisfied with your first result?', 'Try, try again...']),
('explorer', 'Type Explorer', '유형 탐험가', 'Visited all 16 personality type pages', '16가지 성격 유형 페이지를 모두 방문', 'action', 'pages_visited', '{"value": 16}', 'badge', 'badge_explorer', 'rare', '🌟', 'exploration', 25, ARRAY['Curious about other types?', 'Every personality has its charm']),
('butterfly_effect', 'Butterfly Effect', '나비 효과', 'Clicked the animal cursor 100 times', '동물 커서를 100번 이상 클릭', 'action', 'cursor_clicks', '{"value": 100}', 'badge', 'badge_butterfly', 'common', '🦋', 'special', 15, NULL),
('art_lover', 'Art Lover', '예술 애호가', 'Favorited the same artwork 3 times', '같은 작품을 3번 이상 즐겨찾기', 'action', 'repeated_favorite', '{"value": 3}', 'badge', 'badge_art_lover', 'rare', '💝', 'emotion', 30, NULL),
('theme_switcher', 'Theme Magician', '테마 마법사', 'Switched between dark/light mode 10 times', '다크모드/라이트모드 10번 전환', 'action', 'theme_switches', '{"value": 10}', 'experience', 'rainbow_theme', 'common', '🎨', 'special', 10, NULL),

-- Time-based
('night_owl', 'Night Owl', '올빼미족', 'Accessed the site between 2-4 AM local time', '현지 시간 새벽 2-4시 사이에 접속', 'time', 'time_range', '{"start": 2, "end": 4}', 'badge', 'badge_night_owl', 'rare', '🦉', 'special', 20, NULL),
('early_bird', 'Early Bird', '얼리버드', 'First login between 5-6 AM local time', '현지 시간 새벽 5-6시 사이 첫 로그인', 'time', 'time_range', '{"start": 5, "end": 6}', 'badge', 'badge_early_bird', 'rare', '🌅', 'special', 20, NULL),
('halloween_spirit', 'Halloween Spirit', '할로윈 정신', 'Visited on Halloween (October 31)', '할로윈(10월 31일)에 방문', 'time', 'specific_date', '{"month": 10, "day": 31}', 'experience', 'gothic_theme', 'epic', '🎃', 'special', 40, NULL),
('full_moon', 'Lunar Observer', '달빛 관찰자', 'Visited during a full moon', '보름달 기간에 방문', 'time', 'lunar_phase', '{"phase": "full"}', 'feature', 'lunar_gallery', 'epic', '🌙', 'special', 35, NULL),

-- Command-based
('secret_gallery', 'Secret Keeper', '비밀의 수호자', 'Discovered the secret gallery command', '비밀 갤러리 명령어 발견', 'command', 'chat_command', '{"value": "/secret gallery"}', 'feature', 'secret_gallery_access', 'legendary', '🗝️', 'special', 100, ARRAY['Ask the AI about hidden spaces', 'Some galleries are not on the map']),
('konami_code', 'Retro Gamer', '레트로 게이머', 'Entered the Konami code', '코나미 코드 입력', 'sequence', 'key_sequence', '{"value": ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]}', 'badge', 'badge_retro_gamer', 'epic', '🎮', 'special', 50, NULL),
('art_detective', 'Art Detective', '예술 탐정', 'Started the art mystery game', '예술 미스터리 게임 시작', 'command', 'chat_command', '{"value": "/art detective"}', 'experience', 'mystery_game', 'rare', '🔍', 'knowledge', 25, NULL)
ON CONFLICT (id) DO NOTHING;

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_easter_eggs_updated_at BEFORE UPDATE ON easter_eggs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();