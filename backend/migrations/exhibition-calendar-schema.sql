-- 전시 캘린더 시스템 데이터베이스 스키마

-- 사용자 알림 설정
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
  
  -- 알림 설정
  notification_preferences JSONB NOT NULL DEFAULT '{
    "notifyBefore": [7, 1],
    "quietHours": {"start": 22, "end": 8},
    "enableLocationAlert": true,
    "maxDistance": 5
  }',
  
  -- 알림 상태
  is_active BOOLEAN DEFAULT TRUE,
  notifications_sent INTEGER DEFAULT 0,
  last_notification_sent TIMESTAMPTZ,
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, exhibition_id)
);

-- 사용자 북마크/관심 전시
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
  
  -- 북마크 정보
  bookmark_type VARCHAR(50) DEFAULT 'interested', -- 'interested', 'planning', 'maybe'
  notes TEXT,
  reminder_date DATE,
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, exhibition_id)
);

-- 전시 관람 기록
CREATE TABLE IF NOT EXISTS user_exhibition_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
  
  -- 관람 정보
  visited_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- 관람 세부사항
  visit_type VARCHAR(50) DEFAULT 'solo', -- 'solo', 'group', 'family', 'date'
  companions_count INTEGER DEFAULT 0,
  
  -- 리뷰 및 피드백
  review_text TEXT,
  review_tags TEXT[], -- ['educational', 'inspiring', 'crowded', 'peaceful']
  would_recommend BOOLEAN,
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, exhibition_id, visited_at)
);

-- 캘린더 이벤트 동기화
CREATE TABLE IF NOT EXISTS calendar_sync_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 동기화 설정
  sync_provider VARCHAR(50) NOT NULL, -- 'google', 'apple', 'outlook'
  is_enabled BOOLEAN DEFAULT FALSE,
  
  -- 인증 정보 (암호화된 토큰)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- 동기화 옵션
  sync_options JSONB DEFAULT '{
    "syncBookmarked": true,
    "syncVisited": false,
    "createReminders": true,
    "reminderMinutes": 60
  }',
  
  -- 동기화 상태
  last_sync_at TIMESTAMPTZ,
  sync_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'success', 'error'
  sync_error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, sync_provider)
);

-- 알림 전송 로그
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE SET NULL,
  
  -- 알림 정보
  notification_type VARCHAR(50) NOT NULL, -- 'exhibition_reminder', 'location_alert', 'new_recommendation'
  notification_title VARCHAR(200) NOT NULL,
  notification_message TEXT NOT NULL,
  
  -- 전송 정보
  delivery_method VARCHAR(50) NOT NULL, -- 'push', 'email', 'sms'
  delivery_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  delivery_error TEXT,
  
  -- 사용자 반응
  was_opened BOOLEAN DEFAULT FALSE,
  was_clicked BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- 메타데이터
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 위치 기반 알림 설정
CREATE TABLE IF NOT EXISTS location_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 위치 설정
  alert_radius_km FLOAT DEFAULT 5.0,
  is_enabled BOOLEAN DEFAULT TRUE,
  
  -- 알림 조건
  alert_conditions JSONB DEFAULT '{
    "onlyBookmarked": false,
    "minRating": 0,
    "preferredGenres": [],
    "quietHours": {"start": 22, "end": 8}
  }',
  
  -- 위치 기록
  last_latitude FLOAT,
  last_longitude FLOAT,
  last_location_update TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 캘린더 뷰 통계
CREATE TABLE IF NOT EXISTS calendar_view_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- 뷰 정보
  view_date DATE NOT NULL,
  view_type VARCHAR(50) NOT NULL, -- 'month', 'week', 'day', 'list'
  exhibitions_viewed INTEGER DEFAULT 0,
  
  -- 필터 사용
  filters_used JSONB DEFAULT '{}', -- {"location": "Seoul", "genres": ["contemporary"]}
  
  -- 상호작용
  exhibitions_clicked INTEGER DEFAULT 0,
  bookmarks_added INTEGER DEFAULT 0,
  notifications_set INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_user_notifications_user_exhibition ON user_notifications(user_id, exhibition_id);
CREATE INDEX idx_user_notifications_active ON user_notifications(is_active);
CREATE INDEX idx_user_notifications_exhibition ON user_notifications(exhibition_id);

CREATE INDEX idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_exhibition_id ON user_bookmarks(exhibition_id);
CREATE INDEX idx_user_bookmarks_type ON user_bookmarks(bookmark_type);
CREATE INDEX idx_user_bookmarks_reminder ON user_bookmarks(reminder_date) WHERE reminder_date IS NOT NULL;

CREATE INDEX idx_user_exhibition_visits_user_id ON user_exhibition_visits(user_id);
CREATE INDEX idx_user_exhibition_visits_exhibition_id ON user_exhibition_visits(exhibition_id);
CREATE INDEX idx_user_exhibition_visits_visited_at ON user_exhibition_visits(visited_at DESC);
CREATE INDEX idx_user_exhibition_visits_rating ON user_exhibition_visits(rating);

CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_exhibition_id ON notification_logs(exhibition_id);
CREATE INDEX idx_notification_logs_type ON notification_logs(notification_type);
CREATE INDEX idx_notification_logs_scheduled ON notification_logs(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_notification_logs_status ON notification_logs(delivery_status);

CREATE INDEX idx_calendar_view_stats_user_date ON calendar_view_stats(user_id, view_date);
CREATE INDEX idx_calendar_view_stats_view_type ON calendar_view_stats(view_type);

-- 뷰: 사용자 캘린더 요약
CREATE OR REPLACE VIEW user_calendar_summary AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT un.exhibition_id) as notifications_set,
    COUNT(DISTINCT ub.exhibition_id) as bookmarks_count,
    COUNT(DISTINCT uev.exhibition_id) as exhibitions_visited,
    AVG(uev.rating) as avg_rating,
    SUM(uev.duration_minutes) as total_viewing_minutes,
    COUNT(DISTINCT nl.id) as notifications_received,
    COUNT(DISTINCT CASE WHEN nl.was_opened THEN nl.id END) as notifications_opened,
    MAX(uev.visited_at) as last_visit_date,
    COUNT(DISTINCT css.sync_provider) as calendar_syncs_enabled
FROM users u
LEFT JOIN user_notifications un ON u.id = un.user_id AND un.is_active = true
LEFT JOIN user_bookmarks ub ON u.id = ub.user_id
LEFT JOIN user_exhibition_visits uev ON u.id = uev.user_id
LEFT JOIN notification_logs nl ON u.id = nl.user_id AND nl.created_at > CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN calendar_sync_settings css ON u.id = css.user_id AND css.is_enabled = true
GROUP BY u.id, u.username;

-- 뷰: 전시별 관심도 통계
CREATE OR REPLACE VIEW exhibition_interest_stats AS
SELECT 
    e.id as exhibition_id,
    e.title,
    e.start_date,
    e.end_date,
    COUNT(DISTINCT un.user_id) as notification_users,
    COUNT(DISTINCT ub.user_id) as bookmark_users,
    COUNT(DISTINCT uev.user_id) as visited_users,
    AVG(uev.rating) as avg_rating,
    COUNT(DISTINCT uev.id) as total_visits,
    SUM(uev.duration_minutes) as total_viewing_minutes,
    AVG(uev.duration_minutes) as avg_viewing_minutes
FROM exhibitions e
LEFT JOIN user_notifications un ON e.id = un.exhibition_id AND un.is_active = true
LEFT JOIN user_bookmarks ub ON e.id = ub.exhibition_id
LEFT JOIN user_exhibition_visits uev ON e.id = uev.exhibition_id
WHERE e.end_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY e.id, e.title, e.start_date, e.end_date;

-- 함수: 알림 스케줄링
CREATE OR REPLACE FUNCTION schedule_exhibition_notifications()
RETURNS INTEGER AS $$
DECLARE
    notification_record RECORD;
    notifications_scheduled INTEGER := 0;
    notification_date TIMESTAMPTZ;
    quiet_start INTEGER;
    quiet_end INTEGER;
BEGIN
    -- 활성 알림 설정들을 순회
    FOR notification_record IN 
        SELECT un.*, e.title, e.start_date, e.end_date
        FROM user_notifications un
        JOIN exhibitions e ON un.exhibition_id = e.id
        WHERE un.is_active = true
          AND e.start_date > CURRENT_DATE
          AND un.last_notification_sent IS NULL
    LOOP
        -- 알림 전송 일정 계산
        FOR i IN SELECT unnest((notification_record.notification_preferences->>'notifyBefore')::int[])
        LOOP
            notification_date := notification_record.start_date - (i || ' days')::INTERVAL;
            
            -- 조용한 시간 설정 적용
            quiet_start := (notification_record.notification_preferences->'quietHours'->>'start')::int;
            quiet_end := (notification_record.notification_preferences->'quietHours'->>'end')::int;
            
            -- 조용한 시간 피하기
            IF EXTRACT(hour FROM notification_date) >= quiet_start OR 
               EXTRACT(hour FROM notification_date) < quiet_end THEN
                notification_date := date_trunc('day', notification_date) + INTERVAL '9 hours';
            END IF;
            
            -- 이미 지난 시간이 아닌 경우에만 스케줄링
            IF notification_date > NOW() THEN
                INSERT INTO notification_logs (
                    user_id, exhibition_id, notification_type,
                    notification_title, notification_message,
                    delivery_method, scheduled_for
                ) VALUES (
                    notification_record.user_id,
                    notification_record.exhibition_id,
                    'exhibition_reminder',
                    CASE 
                        WHEN i = 1 THEN '내일 시작하는 전시가 있어요!'
                        ELSE i || '일 후 시작하는 전시를 놓치지 마세요!'
                    END,
                    '"' || notification_record.title || '"이(가) ' || 
                    TO_CHAR(notification_record.start_date, 'MM월 DD일') || '에 시작됩니다.',
                    'push',
                    notification_date
                );
                
                notifications_scheduled := notifications_scheduled + 1;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN notifications_scheduled;
END;
$$ LANGUAGE plpgsql;

-- 함수: 위치 기반 알림 체크
CREATE OR REPLACE FUNCTION check_location_alerts(
    p_user_id UUID,
    p_latitude FLOAT,
    p_longitude FLOAT
)
RETURNS INTEGER AS $$
DECLARE
    alert_settings RECORD;
    nearby_exhibitions RECORD;
    alerts_sent INTEGER := 0;
BEGIN
    -- 사용자의 위치 알림 설정 조회
    SELECT * INTO alert_settings
    FROM location_alerts
    WHERE user_id = p_user_id AND is_enabled = true;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- 근처 전시 조회
    FOR nearby_exhibitions IN
        SELECT DISTINCT e.id, e.title, i.name as institution_name,
               ST_Distance(
                   ST_MakePoint(p_longitude, p_latitude),
                   ST_MakePoint(i.longitude, i.latitude)
               ) * 111.32 as distance_km
        FROM exhibitions e
        JOIN institutions i ON e.institution_id = i.id
        LEFT JOIN user_bookmarks ub ON e.id = ub.exhibition_id AND ub.user_id = p_user_id
        WHERE e.status = 'ongoing'
          AND e.end_date >= CURRENT_DATE
          AND ST_Distance(
              ST_MakePoint(p_longitude, p_latitude),
              ST_MakePoint(i.longitude, i.latitude)
          ) * 111.32 <= alert_settings.alert_radius_km
          AND (
              (alert_settings.alert_conditions->>'onlyBookmarked')::boolean = false
              OR ub.id IS NOT NULL
          )
          -- 24시간 내에 같은 전시에 대한 위치 알림이 없었는지 확인
          AND NOT EXISTS (
              SELECT 1 FROM notification_logs
              WHERE user_id = p_user_id
                AND exhibition_id = e.id
                AND notification_type = 'location_alert'
                AND created_at > NOW() - INTERVAL '24 hours'
          )
    LOOP
        -- 위치 알림 생성
        INSERT INTO notification_logs (
            user_id, exhibition_id, notification_type,
            notification_title, notification_message,
            delivery_method
        ) VALUES (
            p_user_id,
            nearby_exhibitions.id,
            'location_alert',
            '근처에 관심 전시가 있어요!',
            nearby_exhibitions.institution_name || '에서 "' || 
            nearby_exhibitions.title || '" 전시가 진행 중이에요. (' ||
            ROUND(nearby_exhibitions.distance_km::numeric, 1) || 'km)',
            'push'
        );
        
        alerts_sent := alerts_sent + 1;
    END LOOP;
    
    -- 위치 정보 업데이트
    UPDATE location_alerts
    SET last_latitude = p_latitude,
        last_longitude = p_longitude,
        last_location_update = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN alerts_sent;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 북마크 생성 시 알림 설정 제안
CREATE OR REPLACE FUNCTION suggest_notification_on_bookmark()
RETURNS TRIGGER AS $$
BEGIN
    -- 북마크가 생성되고 아직 알림 설정이 없는 경우
    IF NOT EXISTS (
        SELECT 1 FROM user_notifications
        WHERE user_id = NEW.user_id AND exhibition_id = NEW.exhibition_id
    ) THEN
        -- 기본 알림 설정 생성
        INSERT INTO user_notifications (user_id, exhibition_id, is_active)
        VALUES (NEW.user_id, NEW.exhibition_id, false); -- 비활성 상태로 생성
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_suggest_notification_on_bookmark
AFTER INSERT ON user_bookmarks
FOR EACH ROW
EXECUTE FUNCTION suggest_notification_on_bookmark();

-- 트리거: 타임스탬프 자동 업데이트
CREATE TRIGGER update_user_notifications_updated_at
BEFORE UPDATE ON user_notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_bookmarks_updated_at
BEFORE UPDATE ON user_bookmarks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_exhibition_visits_updated_at
BEFORE UPDATE ON user_exhibition_visits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_sync_settings_updated_at
BEFORE UPDATE ON calendar_sync_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_alerts_updated_at
BEFORE UPDATE ON location_alerts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();