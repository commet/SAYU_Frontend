-- Supabase 매칭 시스템 테이블

-- 전시 동행 매칭
CREATE TABLE exhibition_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id text NOT NULL,
  host_user_id uuid NOT NULL REFERENCES auth.users(id),
  matched_user_id uuid REFERENCES auth.users(id),
  preferred_date date NOT NULL,
  time_slot text NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  matching_criteria jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'completed', 'cancelled')),
  expires_at timestamp with time zone NOT NULL,
  matched_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS 정책
ALTER TABLE exhibition_matches ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 매칭만 볼 수 있음
CREATE POLICY "Users can view their own matches" ON exhibition_matches
  FOR SELECT USING (auth.uid() = host_user_id OR auth.uid() = matched_user_id);

-- 사용자는 매칭을 생성할 수 있음
CREATE POLICY "Users can create matches" ON exhibition_matches
  FOR INSERT WITH CHECK (auth.uid() = host_user_id);

-- 사용자는 자신의 매칭을 업데이트할 수 있음
CREATE POLICY "Users can update their matches" ON exhibition_matches
  FOR UPDATE USING (auth.uid() = host_user_id);

-- 작품 상호작용
CREATE TABLE artwork_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  target_user_id uuid REFERENCES auth.users(id),
  artwork_id text NOT NULL,
  type text NOT NULL,
  prompt text NOT NULL,
  response text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- RLS 정책
ALTER TABLE artwork_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interactions" ON artwork_interactions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_user_id);

CREATE POLICY "Users can create interactions" ON artwork_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 공유 컬렉션
CREATE TABLE shared_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  theme text,
  creator_id uuid NOT NULL REFERENCES auth.users(id),
  collaborator_ids uuid[] DEFAULT '{}',
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS 정책
ALTER TABLE shared_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public collections are viewable by all" ON shared_collections
  FOR SELECT USING (visibility = 'public' OR auth.uid() = creator_id OR auth.uid() = ANY(collaborator_ids));

CREATE POLICY "Users can create collections" ON shared_collections
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update collections" ON shared_collections
  FOR UPDATE USING (auth.uid() = creator_id);

-- 컬렉션 작품
CREATE TABLE collection_artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES shared_collections(id) ON DELETE CASCADE,
  artwork_id text NOT NULL,
  added_by uuid NOT NULL REFERENCES auth.users(id),
  note text,
  voice_note text,
  added_at timestamp with time zone DEFAULT now()
);

-- RLS 정책
ALTER TABLE collection_artworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View artworks in accessible collections" ON collection_artworks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_collections sc
      WHERE sc.id = collection_id
      AND (sc.visibility = 'public' OR auth.uid() = sc.creator_id OR auth.uid() = ANY(sc.collaborator_ids))
    )
  );

-- APT 호환성 스코어 캐시
CREATE TABLE apt_compatibility_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES auth.users(id),
  user2_id uuid NOT NULL REFERENCES auth.users(id),
  user1_apt text NOT NULL,
  user2_apt text NOT NULL,
  overall_score integer NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  dimension_scores jsonb NOT NULL,
  shared_interests text[],
  complementary_traits text[],
  calculated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- 인덱스
CREATE INDEX idx_exhibition_matches_status ON exhibition_matches(status);
CREATE INDEX idx_exhibition_matches_date ON exhibition_matches(preferred_date);
CREATE INDEX idx_artwork_interactions_artwork ON artwork_interactions(artwork_id);
CREATE INDEX idx_shared_collections_creator ON shared_collections(creator_id);
CREATE INDEX idx_apt_compatibility_users ON apt_compatibility_scores(user1_id, user2_id);

-- 실시간 구독을 위한 함수
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거
CREATE TRIGGER update_exhibition_matches_updated_at BEFORE UPDATE ON exhibition_matches
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_shared_collections_updated_at BEFORE UPDATE ON shared_collections
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();