-- Art Pulse 테이블 생성

-- Art Pulse 세션
CREATE TABLE art_pulse_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'active', 'completed')) DEFAULT 'scheduled',
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Art Pulse 참여 기록
CREATE TABLE art_pulse_participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES art_pulse_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  apt_type TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  touch_data JSONB DEFAULT '[]'::jsonb,
  resonance_data JSONB DEFAULT '{
    "type": null,
    "intensity": 5,
    "focusAreas": [],
    "dwellTime": 0
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- 인덱스
CREATE INDEX idx_art_pulse_sessions_start_time ON art_pulse_sessions(start_time);
CREATE INDEX idx_art_pulse_sessions_daily_challenge_id ON art_pulse_sessions(daily_challenge_id);
CREATE INDEX idx_art_pulse_participations_session_id ON art_pulse_participations(session_id);
CREATE INDEX idx_art_pulse_participations_user_id ON art_pulse_participations(user_id);

-- RLS 정책
ALTER TABLE art_pulse_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_pulse_participations ENABLE ROW LEVEL SECURITY;

-- 세션은 모든 사용자가 읽을 수 있음
CREATE POLICY "Art Pulse sessions are viewable by everyone" 
  ON art_pulse_sessions FOR SELECT 
  USING (true);

-- 세션은 시스템만 생성/수정 가능 (Edge Function 사용)
CREATE POLICY "Art Pulse sessions can only be created by system" 
  ON art_pulse_sessions FOR INSERT 
  WITH CHECK (false);

-- 참여 기록은 본인것만 볼 수 있음
CREATE POLICY "Users can view own art pulse participations" 
  ON art_pulse_participations FOR SELECT 
  USING (auth.uid() = user_id);

-- 참여 기록은 본인만 생성 가능
CREATE POLICY "Users can create own art pulse participations" 
  ON art_pulse_participations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 참여 기록은 본인만 수정 가능
CREATE POLICY "Users can update own art pulse participations" 
  ON art_pulse_participations FOR UPDATE 
  USING (auth.uid() = user_id);

-- 자동 세션 생성 함수 (매일 실행되어야 함)
CREATE OR REPLACE FUNCTION create_daily_art_pulse_session()
RETURNS void AS $$
DECLARE
  today_challenge_id UUID;
  session_exists BOOLEAN;
BEGIN
  -- 오늘의 챌린지 ID 가져오기
  SELECT id INTO today_challenge_id
  FROM daily_challenges
  WHERE challenge_date = CURRENT_DATE
  LIMIT 1;
  
  -- 이미 세션이 있는지 확인
  SELECT EXISTS(
    SELECT 1 FROM art_pulse_sessions 
    WHERE daily_challenge_id = today_challenge_id
  ) INTO session_exists;
  
  -- 세션이 없으면 생성
  IF NOT session_exists AND today_challenge_id IS NOT NULL THEN
    INSERT INTO art_pulse_sessions (
      daily_challenge_id,
      start_time,
      end_time,
      status
    ) VALUES (
      today_challenge_id,
      CURRENT_DATE + INTERVAL '19 hours',
      CURRENT_DATE + INTERVAL '19 hours 25 minutes',
      'scheduled'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 세션 상태 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_art_pulse_session_status()
RETURNS void AS $$
BEGIN
  -- 시작 시간이 된 세션을 active로 변경
  UPDATE art_pulse_sessions
  SET status = 'active'
  WHERE status = 'scheduled'
    AND start_time <= NOW()
    AND end_time > NOW();
  
  -- 종료 시간이 지난 세션을 completed로 변경
  UPDATE art_pulse_sessions
  SET status = 'completed'
  WHERE status IN ('scheduled', 'active')
    AND end_time <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 참여자 수 업데이트 트리거
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE art_pulse_sessions
    SET participant_count = participant_count + 1
    WHERE id = NEW.session_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_participant_count
AFTER INSERT ON art_pulse_participations
FOR EACH ROW
EXECUTE FUNCTION update_participant_count();

-- Edge Function을 위한 관리자 정책 (service role 사용)
CREATE POLICY "Service role can manage art pulse sessions" 
  ON art_pulse_sessions 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');