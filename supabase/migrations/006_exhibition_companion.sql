-- 전시 동행 매칭 시스템

-- 1. 전시 정보
CREATE TABLE exhibitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE, -- 외부 API ID
  title text NOT NULL,
  venue text NOT NULL, -- 전시 장소
  venue_address text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  image_url text,
  ticket_url text,
  ticket_price_range text, -- 예: "무료", "15,000-25,000원"
  category text, -- 회화, 조각, 미디어아트, 사진 등
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. 전시 동행 찾기
CREATE TABLE exhibition_companion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  exhibition_id uuid NOT NULL REFERENCES exhibitions(id),
  
  -- 동행 정보
  preferred_date date NOT NULL,
  preferred_time_slot text NOT NULL CHECK (preferred_time_slot IN ('morning', 'afternoon', 'evening', 'flexible')),
  group_size integer DEFAULT 2 CHECK (group_size BETWEEN 2 AND 4),
  
  -- 관람 스타일
  viewing_pace text NOT NULL CHECK (viewing_pace IN ('quick', 'moderate', 'slow')),
  interaction_style text NOT NULL CHECK (interaction_style IN ('silent_first', 'discuss_while', 'flexible')),
  
  -- 매칭 조건
  preferred_apt_types text[], -- 선호하는 APT 타입들
  age_range int4range, -- 연령대 범위
  gender_preference text CHECK (gender_preference IN ('same', 'any')),
  
  -- 메시지
  message text, -- 동행 찾는 이유나 기대사항
  
  -- 상태
  status text DEFAULT 'active' CHECK (status IN ('active', 'matched', 'expired', 'cancelled')),
  expires_at timestamp with time zone DEFAULT (now() + INTERVAL '7 days'),
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id, exhibition_id, preferred_date)
);

-- 3. 동행 매칭
CREATE TABLE exhibition_companions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES exhibition_companion_requests(id),
  companion_id uuid NOT NULL REFERENCES auth.users(id),
  
  -- 매칭 점수
  apt_compatibility_score numeric(3,2),
  style_match_score numeric(3,2), -- 관람 스타일 일치도
  schedule_match_score numeric(3,2), -- 일정 일치도
  total_match_score numeric(3,2),
  
  -- 상태
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  responded_at timestamp with time zone,
  
  -- 만남 후
  met_in_person boolean DEFAULT false,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  review_tags text[], -- '시간 약속 잘 지킴', '대화가 즐거웠음', '취향이 잘 맞음' 등
  review_note text,
  
  created_at timestamp with time zone DEFAULT now()
);

-- 4. 전시 관심 표시
CREATE TABLE exhibition_interests (
  user_id uuid NOT NULL REFERENCES auth.users(id),
  exhibition_id uuid NOT NULL REFERENCES exhibitions(id),
  interested_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, exhibition_id)
);

-- 5. 동행 후 연결
CREATE TABLE companion_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_match_id uuid NOT NULL REFERENCES exhibition_companions(id),
  
  -- 연결 유형
  connection_type text CHECK (connection_type IN ('follow', 'exchange', 'friend')),
  
  -- 상태
  initiated_by uuid NOT NULL REFERENCES auth.users(id),
  accepted_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  
  created_at timestamp with time zone DEFAULT now()
);

-- RLS 정책
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_companion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_connections ENABLE ROW LEVEL SECURITY;

-- 전시 정보는 모두 공개
CREATE POLICY "전시 정보는 공개" ON exhibitions
  FOR SELECT USING (true);

-- 동행 요청 정책
CREATE POLICY "자신의 동행 요청 관리" ON exhibition_companion_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "활성 동행 요청은 모두 조회 가능" ON exhibition_companion_requests
  FOR SELECT USING (status = 'active' AND expires_at > now());

-- 매칭 정책
CREATE POLICY "관련된 매칭만 조회" ON exhibition_companions
  FOR ALL USING (
    auth.uid() = companion_id OR
    EXISTS (
      SELECT 1 FROM exhibition_companion_requests
      WHERE id = exhibition_companions.request_id
      AND user_id = auth.uid()
    )
  );

-- 관심 표시는 자유
CREATE POLICY "전시 관심 표시" ON exhibition_interests
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_exhibitions_dates ON exhibitions(start_date, end_date);
CREATE INDEX idx_exhibitions_venue ON exhibitions(venue);
CREATE INDEX idx_companion_requests_exhibition ON exhibition_companion_requests(exhibition_id);
CREATE INDEX idx_companion_requests_status ON exhibition_companion_requests(status) WHERE status = 'active';
CREATE INDEX idx_companion_requests_date ON exhibition_companion_requests(preferred_date);
CREATE INDEX idx_companions_request ON exhibition_companions(request_id);
CREATE INDEX idx_companions_companion ON exhibition_companions(companion_id);

-- 함수: 동행 매칭 점수 계산
CREATE OR REPLACE FUNCTION calculate_companion_match(
  p_request_id uuid,
  p_candidate_id uuid
)
RETURNS TABLE (
  apt_score numeric,
  style_score numeric,
  schedule_score numeric,
  total_score numeric
) AS $$
DECLARE
  v_request RECORD;
  v_candidate_profile RECORD;
  v_apt_compat numeric;
  v_style_match numeric;
  v_schedule_match numeric;
BEGIN
  -- 요청 정보 가져오기
  SELECT * INTO v_request
  FROM exhibition_companion_requests
  WHERE id = p_request_id;
  
  -- 후보자 프로필 가져오기
  SELECT 
    up.personality_type as apt_type,
    up.birth_date,
    up.gender
  INTO v_candidate_profile
  FROM user_profiles up
  WHERE up.user_id = p_candidate_id;
  
  -- 1. APT 호환성 점수
  IF v_request.preferred_apt_types IS NULL OR 
     array_length(v_request.preferred_apt_types, 1) = 0 THEN
    -- APT 선호가 없으면 기본 호환성 점수 사용
    SELECT score INTO v_apt_compat
    FROM compatibility_scores
    WHERE (type1 = (SELECT personality_type FROM user_profiles WHERE user_id = v_request.user_id) 
           AND type2 = v_candidate_profile.apt_type)
       OR (type2 = (SELECT personality_type FROM user_profiles WHERE user_id = v_request.user_id) 
           AND type1 = v_candidate_profile.apt_type);
    
    IF v_apt_compat IS NULL THEN v_apt_compat := 0.5; END IF;
  ELSE
    -- 선호 APT에 포함되는지 확인
    IF v_candidate_profile.apt_type = ANY(v_request.preferred_apt_types) THEN
      v_apt_compat := 1.0;
    ELSE
      v_apt_compat := 0.3;
    END IF;
  END IF;
  
  -- 2. 관람 스타일 일치도
  -- TODO: 실제로는 사용자의 과거 동행 기록에서 스타일 추출
  v_style_match := 0.7; -- 임시값
  
  -- 3. 일정 유연성
  -- 같은 날짜, 시간대를 원하는 사람 우선
  v_schedule_match := 0.8; -- 임시값
  
  -- 총점 계산
  RETURN QUERY
  SELECT 
    v_apt_compat,
    v_style_match,
    v_schedule_match,
    (v_apt_compat * 0.4 + v_style_match * 0.3 + v_schedule_match * 0.3) as total;
END;
$$ LANGUAGE plpgsql;

-- 함수: 동행 매칭 찾기
CREATE OR REPLACE FUNCTION find_exhibition_companions(p_request_id uuid)
RETURNS void AS $$
DECLARE
  v_request RECORD;
  v_candidate RECORD;
  v_scores RECORD;
BEGIN
  -- 요청 정보 가져오기
  SELECT * INTO v_request
  FROM exhibition_companion_requests
  WHERE id = p_request_id;
  
  -- 같은 전시, 같은 날짜에 관심있는 사용자 찾기
  FOR v_candidate IN
    SELECT DISTINCT ecr.user_id
    FROM exhibition_companion_requests ecr
    WHERE ecr.exhibition_id = v_request.exhibition_id
      AND ecr.preferred_date = v_request.preferred_date
      AND ecr.user_id != v_request.user_id
      AND ecr.status = 'active'
      AND ecr.expires_at > now()
  LOOP
    -- 매칭 점수 계산
    SELECT * INTO v_scores
    FROM calculate_companion_match(p_request_id, v_candidate.user_id);
    
    -- 점수가 임계값 이상이면 매칭 제안
    IF v_scores.total_score >= 0.6 THEN
      INSERT INTO exhibition_companions (
        request_id,
        companion_id,
        apt_compatibility_score,
        style_match_score,
        schedule_match_score,
        total_match_score
      ) VALUES (
        p_request_id,
        v_candidate.user_id,
        v_scores.apt_score,
        v_scores.style_score,
        v_scores.schedule_score,
        v_scores.total_score
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 동행 요청 시 자동 매칭
CREATE OR REPLACE FUNCTION trigger_find_companions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    PERFORM find_exhibition_companions(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_find_companions
  AFTER INSERT OR UPDATE ON exhibition_companion_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_find_companions();

-- 함수: 만료된 요청 정리
CREATE OR REPLACE FUNCTION cleanup_expired_requests()
RETURNS void AS $$
BEGIN
  UPDATE exhibition_companion_requests
  SET status = 'expired'
  WHERE status = 'active'
    AND (expires_at < now() OR preferred_date < CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;