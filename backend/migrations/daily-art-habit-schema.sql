-- Daily Art Habit 기능을 위한 스키마
-- 매일 예술 작품 감상 습관화 시스템

-- 사용자 습관 설정 테이블
CREATE TABLE user_habit_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- 알림 시간대 설정
    morning_time TIME DEFAULT '08:00',  -- 출근길 3분 (7-9시)
    lunch_time TIME DEFAULT '12:30',    -- 점심시간 5분 (12-1시)
    night_time TIME DEFAULT '22:00',    -- 잠들기 전 10분 (9-11시)
    -- 알림 활성화 여부
    morning_enabled BOOLEAN DEFAULT true,
    lunch_enabled BOOLEAN DEFAULT true,
    night_enabled BOOLEAN DEFAULT true,
    -- 푸시 알림 설정
    push_enabled BOOLEAN DEFAULT true,
    email_reminder BOOLEAN DEFAULT false,
    -- 사용자 타임존
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
    -- 주간 활성 요일 (0=일요일, 6=토요일)
    active_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- 평일만 기본
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 일일 예술 작품 기록
CREATE TABLE daily_art_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    -- 출근길 3분
    morning_artwork_id UUID REFERENCES artworks_extended(id),
    morning_question TEXT,
    morning_response TEXT,
    morning_color VARCHAR(7), -- HEX color code
    morning_completed_at TIMESTAMPTZ,
    -- 점심시간 5분
    lunch_emotion VARCHAR(50),
    lunch_artwork_id UUID REFERENCES artworks_extended(id),
    lunch_reason TEXT,
    lunch_completed_at TIMESTAMPTZ,
    -- 잠들기 전 10분
    night_artwork_id UUID REFERENCES artworks_extended(id),
    night_reflection TEXT,
    night_mood_tags TEXT[],
    night_completed_at TIMESTAMPTZ,
    -- 전체 진행도
    daily_completion_rate FLOAT DEFAULT 0, -- 0-1 (0%, 33%, 66%, 100%)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, entry_date)
);

-- 스트릭 추적 테이블
CREATE TABLE user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    -- 마일스톤 달성 기록
    achieved_7_days BOOLEAN DEFAULT false,
    achieved_7_days_at TIMESTAMPTZ,
    achieved_30_days BOOLEAN DEFAULT false,
    achieved_30_days_at TIMESTAMPTZ,
    achieved_100_days BOOLEAN DEFAULT false,
    achieved_100_days_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 감정 체크인 기록
CREATE TABLE emotion_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_time TIMESTAMPTZ DEFAULT NOW(),
    time_of_day VARCHAR(20), -- 'morning', 'lunch', 'night'
    primary_emotion VARCHAR(50),
    secondary_emotions TEXT[],
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
    selected_artwork_id UUID REFERENCES artworks_extended(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 푸시 알림 구독 정보
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- 알림 전송 기록
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50), -- 'morning', 'lunch', 'night', 'streak', 'achievement'
    scheduled_time TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivery_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'clicked'
    error_message TEXT,
    payload JSONB,
    clicked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 습관 보상 및 뱃지
CREATE TABLE habit_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(50), -- 'badge', 'exhibition_invite', 'mentor_match'
    reward_name VARCHAR(100),
    reward_description TEXT,
    milestone_days INTEGER,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, reward_type, milestone_days)
);

-- 일일 추천 작품 큐
CREATE TABLE daily_artwork_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artworks_extended(id),
    queue_date DATE NOT NULL,
    time_slot VARCHAR(20), -- 'morning', 'lunch', 'night'
    recommendation_reason TEXT,
    based_on_preference JSONB, -- 어떤 선호도 기반인지
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, queue_date, time_slot)
);

-- 사용자 선호 시간대 분석
CREATE TABLE user_activity_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER, -- 0-6
    hour_of_day INTEGER, -- 0-23
    activity_count INTEGER DEFAULT 0,
    avg_completion_time INTEGER, -- seconds
    last_activity TIMESTAMPTZ,
    UNIQUE(user_id, day_of_week, hour_of_day)
);

-- 인덱스 생성
CREATE INDEX idx_user_habit_settings_user_id ON user_habit_settings(user_id);
CREATE INDEX idx_daily_art_entries_user_date ON daily_art_entries(user_id, entry_date DESC);
CREATE INDEX idx_daily_art_entries_date ON daily_art_entries(entry_date DESC);
CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX idx_user_streaks_current ON user_streaks(current_streak DESC);
CREATE INDEX idx_emotion_checkins_user_time ON emotion_checkins(user_id, checkin_time DESC);
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_notification_logs_user_type ON notification_logs(user_id, notification_type);
CREATE INDEX idx_notification_logs_scheduled ON notification_logs(scheduled_time);
CREATE INDEX idx_habit_rewards_user_id ON habit_rewards(user_id);
CREATE INDEX idx_daily_artwork_queue_user_date ON daily_artwork_queue(user_id, queue_date);
CREATE INDEX idx_user_activity_patterns_user ON user_activity_patterns(user_id);

-- 트리거: 스트릭 자동 업데이트
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    prev_date DATE;
    streak_count INTEGER;
BEGIN
    -- 이전 활동 날짜 조회
    SELECT last_activity_date, current_streak 
    INTO prev_date, streak_count
    FROM user_streaks 
    WHERE user_id = NEW.user_id;

    -- 스트릭 테이블이 없으면 생성
    IF NOT FOUND THEN
        INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_days, last_activity_date)
        VALUES (NEW.user_id, 1, 1, 1, NEW.entry_date);
        RETURN NEW;
    END IF;

    -- 연속 여부 확인 (전날이면 연속)
    IF NEW.entry_date = prev_date + INTERVAL '1 day' THEN
        streak_count := streak_count + 1;
    ELSIF NEW.entry_date > prev_date THEN
        -- 연속이 끊김
        streak_count := 1;
    END IF;

    -- 스트릭 업데이트
    UPDATE user_streaks 
    SET 
        current_streak = streak_count,
        longest_streak = GREATEST(longest_streak, streak_count),
        total_days = total_days + 1,
        last_activity_date = NEW.entry_date,
        achieved_7_days = CASE WHEN streak_count >= 7 THEN true ELSE achieved_7_days END,
        achieved_7_days_at = CASE 
            WHEN streak_count = 7 AND achieved_7_days = false THEN NOW() 
            ELSE achieved_7_days_at 
        END,
        achieved_30_days = CASE WHEN streak_count >= 30 THEN true ELSE achieved_30_days END,
        achieved_30_days_at = CASE 
            WHEN streak_count = 30 AND achieved_30_days = false THEN NOW() 
            ELSE achieved_30_days_at 
        END,
        achieved_100_days = CASE WHEN streak_count >= 100 THEN true ELSE achieved_100_days END,
        achieved_100_days_at = CASE 
            WHEN streak_count = 100 AND achieved_100_days = false THEN NOW() 
            ELSE achieved_100_days_at 
        END,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 일일 기록이 업데이트될 때마다 스트릭 업데이트
CREATE TRIGGER trigger_update_streak
AFTER INSERT OR UPDATE ON daily_art_entries
FOR EACH ROW
WHEN (NEW.daily_completion_rate > 0)
EXECUTE FUNCTION update_user_streak();

-- 활동 패턴 분석 함수
CREATE OR REPLACE FUNCTION analyze_activity_pattern()
RETURNS TRIGGER AS $$
BEGIN
    -- 활동 패턴 기록
    INSERT INTO user_activity_patterns (
        user_id, 
        day_of_week, 
        hour_of_day, 
        activity_count,
        last_activity
    )
    VALUES (
        NEW.user_id,
        EXTRACT(DOW FROM NEW.created_at),
        EXTRACT(HOUR FROM NEW.created_at),
        1,
        NEW.created_at
    )
    ON CONFLICT (user_id, day_of_week, hour_of_day)
    DO UPDATE SET
        activity_count = user_activity_patterns.activity_count + 1,
        last_activity = NEW.created_at;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 일일 기록 생성 시 활동 패턴 분석
CREATE TRIGGER trigger_analyze_pattern
AFTER INSERT ON daily_art_entries
FOR EACH ROW
EXECUTE FUNCTION analyze_activity_pattern();