-- 감상 교환 시스템 (느린 연결, 깊은 관계)

-- 1. 감상 교환 세션
CREATE TABLE perception_exchange_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 참여자 정보
  initiator_id uuid NOT NULL REFERENCES auth.users(id),
  partner_id uuid NOT NULL REFERENCES auth.users(id),
  
  -- 교환 대상 작품
  artwork_id text NOT NULL,
  museum_source text NOT NULL,
  artwork_data jsonb NOT NULL,
  
  -- 세션 상태
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'expired', 'declined')),
  current_phase integer DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 4),
  
  -- 타이밍
  initiated_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  completed_at timestamp with time zone,
  expires_at timestamp with time zone DEFAULT (now() + INTERVAL '7 days'),
  
  UNIQUE(initiator_id, partner_id, artwork_id)
);

-- 2. 감상 메시지
CREATE TABLE perception_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES perception_exchange_sessions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  
  -- 메시지 내용
  content text NOT NULL,
  emotion_tags text[], -- 이 감상과 관련된 감정들
  
  -- 공개 단계 (단계별로 점진적 공개)
  phase integer NOT NULL CHECK (phase BETWEEN 1 AND 4),
  
  -- 메타데이터
  word_count integer,
  sent_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  
  -- 상호작용
  reaction text, -- 'resonate', 'thoughtful', 'inspiring' 등
  
  CHECK (length(content) >= 50) -- 최소 50자 이상
);

-- 3. 감상 교환 규칙/설정
CREATE TABLE exchange_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  
  -- 선호 설정
  preferred_exchange_pace text DEFAULT 'moderate' CHECK (preferred_exchange_pace IN ('slow', 'moderate', 'flexible')),
  min_message_length integer DEFAULT 100,
  
  -- 자동 매칭 설정
  auto_accept_from_high_matches boolean DEFAULT false,
  auto_accept_threshold numeric(3,2) DEFAULT 0.85,
  
  -- 알림 설정
  notify_new_invitations boolean DEFAULT true,
  notify_new_messages boolean DEFAULT true,
  notify_phase_changes boolean DEFAULT true,
  
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. 교환 통계 (품질 지표)
CREATE TABLE exchange_quality_metrics (
  session_id uuid PRIMARY KEY REFERENCES perception_exchange_sessions(id),
  
  -- 깊이 지표
  avg_message_length integer,
  total_word_count integer,
  unique_emotion_tags integer,
  
  -- 참여도 지표
  response_time_hours numeric(5,2),
  message_frequency numeric(5,2), -- 일 평균 메시지 수
  completion_rate numeric(3,2), -- 완료된 단계 비율
  
  -- 품질 점수
  depth_score numeric(3,2), -- 0-1, 대화의 깊이
  engagement_score numeric(3,2), -- 0-1, 참여도
  resonance_score numeric(3,2), -- 0-1, 감정적 공명
  
  calculated_at timestamp with time zone DEFAULT now()
);

-- 5. 단계별 공개 정보
CREATE TABLE phase_reveals (
  session_id uuid NOT NULL REFERENCES perception_exchange_sessions(id),
  phase integer NOT NULL CHECK (phase BETWEEN 1 AND 4),
  
  -- 각 단계에서 공개되는 정보
  revealed_info jsonb NOT NULL, -- {닉네임, APT타입, 프로필사진, 실명 등}
  revealed_at timestamp with time zone DEFAULT now(),
  
  PRIMARY KEY (session_id, phase)
);

-- RLS 정책
ALTER TABLE perception_exchange_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE perception_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_reveals ENABLE ROW LEVEL SECURITY;

-- 세션 정책
CREATE POLICY "자신이 참여한 세션만 조회" ON perception_exchange_sessions
  FOR ALL USING (auth.uid() = initiator_id OR auth.uid() = partner_id);

-- 메시지 정책
CREATE POLICY "세션 참여자만 메시지 조회" ON perception_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM perception_exchange_sessions
      WHERE id = perception_messages.session_id
      AND (initiator_id = auth.uid() OR partner_id = auth.uid())
    )
  );

-- 설정 정책
CREATE POLICY "자신의 설정만 관리" ON exchange_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 통계는 세션 참여자만
CREATE POLICY "세션 참여자만 통계 조회" ON exchange_quality_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perception_exchange_sessions
      WHERE id = exchange_quality_metrics.session_id
      AND (initiator_id = auth.uid() OR partner_id = auth.uid())
    )
  );

-- 인덱스
CREATE INDEX idx_sessions_users ON perception_exchange_sessions(initiator_id, partner_id);
CREATE INDEX idx_sessions_status ON perception_exchange_sessions(status);
CREATE INDEX idx_sessions_artwork ON perception_exchange_sessions(artwork_id);
CREATE INDEX idx_messages_session ON perception_messages(session_id);
CREATE INDEX idx_messages_phase ON perception_messages(phase);

-- 함수: 감상 교환 초대 생성
CREATE OR REPLACE FUNCTION create_perception_exchange(
  p_partner_id uuid,
  p_artwork_id text,
  p_museum_source text,
  p_artwork_data jsonb,
  p_initial_message text
)
RETURNS uuid AS $$
DECLARE
  v_session_id uuid;
  v_initiator_id uuid;
BEGIN
  v_initiator_id := auth.uid();
  
  -- 세션 생성
  INSERT INTO perception_exchange_sessions (
    initiator_id,
    partner_id,
    artwork_id,
    museum_source,
    artwork_data
  ) VALUES (
    v_initiator_id,
    p_partner_id,
    p_artwork_id,
    p_museum_source,
    p_artwork_data
  )
  RETURNING id INTO v_session_id;
  
  -- 첫 메시지 작성 (익명)
  INSERT INTO perception_messages (
    session_id,
    sender_id,
    content,
    phase,
    word_count
  ) VALUES (
    v_session_id,
    v_initiator_id,
    p_initial_message,
    1,
    array_length(string_to_array(p_initial_message, ' '), 1)
  );
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수: 단계 진행
CREATE OR REPLACE FUNCTION advance_exchange_phase(p_session_id uuid)
RETURNS boolean AS $$
DECLARE
  v_current_phase integer;
  v_next_phase integer;
  v_initiator_id uuid;
  v_partner_id uuid;
  v_messages_count integer;
BEGIN
  -- 현재 단계 확인
  SELECT current_phase, initiator_id, partner_id 
  INTO v_current_phase, v_initiator_id, v_partner_id
  FROM perception_exchange_sessions
  WHERE id = p_session_id
    AND (initiator_id = auth.uid() OR partner_id = auth.uid());
  
  IF v_current_phase IS NULL THEN
    RETURN false;
  END IF;
  
  -- 양측 모두 현재 단계에서 메시지를 보냈는지 확인
  SELECT COUNT(DISTINCT sender_id) INTO v_messages_count
  FROM perception_messages
  WHERE session_id = p_session_id
    AND phase = v_current_phase;
  
  IF v_messages_count < 2 THEN
    RETURN false; -- 아직 양측 모두 메시지를 보내지 않음
  END IF;
  
  v_next_phase := v_current_phase + 1;
  
  -- 다음 단계로 진행
  UPDATE perception_exchange_sessions
  SET current_phase = v_next_phase
  WHERE id = p_session_id;
  
  -- 단계별 정보 공개
  IF v_next_phase = 2 THEN
    -- 닉네임 공개
    INSERT INTO phase_reveals (session_id, phase, revealed_info)
    VALUES (p_session_id, 2, '{"reveal": "nickname"}'::jsonb);
  ELSIF v_next_phase = 3 THEN
    -- APT 타입과 프로필 일부 공개
    INSERT INTO phase_reveals (session_id, phase, revealed_info)
    VALUES (p_session_id, 3, '{"reveal": "apt_type,partial_profile"}'::jsonb);
  ELSIF v_next_phase = 4 THEN
    -- 전체 프로필 공개
    INSERT INTO phase_reveals (session_id, phase, revealed_info)
    VALUES (p_session_id, 4, '{"reveal": "full_profile"}'::jsonb);
    
    -- 세션 완료
    UPDATE perception_exchange_sessions
    SET status = 'completed', completed_at = now()
    WHERE id = p_session_id;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: 메시지 품질 메트릭 업데이트
CREATE OR REPLACE FUNCTION update_exchange_metrics()
RETURNS TRIGGER AS $$
DECLARE
  v_metrics RECORD;
BEGIN
  -- 세션의 메트릭 계산
  WITH session_stats AS (
    SELECT 
      session_id,
      AVG(word_count) as avg_length,
      SUM(word_count) as total_words,
      COUNT(DISTINCT unnest(emotion_tags)) as unique_emotions,
      COUNT(*) as message_count,
      EXTRACT(EPOCH FROM (MAX(sent_at) - MIN(sent_at))) / 3600 as duration_hours
    FROM perception_messages
    WHERE session_id = NEW.session_id
    GROUP BY session_id
  )
  SELECT * INTO v_metrics FROM session_stats;
  
  -- 메트릭 업데이트 또는 삽입
  INSERT INTO exchange_quality_metrics (
    session_id,
    avg_message_length,
    total_word_count,
    unique_emotion_tags,
    message_frequency,
    depth_score,
    engagement_score
  ) VALUES (
    NEW.session_id,
    v_metrics.avg_length,
    v_metrics.total_words,
    v_metrics.unique_emotions,
    CASE 
      WHEN v_metrics.duration_hours > 0 
      THEN v_metrics.message_count / (v_metrics.duration_hours / 24)
      ELSE 0
    END,
    LEAST(v_metrics.avg_length / 200.0, 1), -- 깊이 점수
    LEAST(v_metrics.message_count / 10.0, 1) -- 참여도 점수
  )
  ON CONFLICT (session_id) DO UPDATE SET
    avg_message_length = EXCLUDED.avg_message_length,
    total_word_count = EXCLUDED.total_word_count,
    unique_emotion_tags = EXCLUDED.unique_emotion_tags,
    message_frequency = EXCLUDED.message_frequency,
    depth_score = EXCLUDED.depth_score,
    engagement_score = EXCLUDED.engagement_score,
    calculated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_metrics_on_message
  AFTER INSERT ON perception_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_metrics();