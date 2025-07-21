-- 전시 동행 매칭 테이블
CREATE TABLE IF NOT EXISTS exhibition_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID NOT NULL,
  host_user_id UUID NOT NULL REFERENCES users(id),
  matched_user_id UUID REFERENCES users(id),
  preferred_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  matching_criteria JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'completed', 'cancelled')),
  expires_at TIMESTAMP NOT NULL,
  matched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_exhibition_matches_exhibition ON exhibition_matches(exhibition_id);
CREATE INDEX idx_exhibition_matches_host ON exhibition_matches(host_user_id);
CREATE INDEX idx_exhibition_matches_status ON exhibition_matches(status);
CREATE INDEX idx_exhibition_matches_date ON exhibition_matches(preferred_date);

-- 작품 상호작용 테이블
CREATE TABLE IF NOT EXISTS artwork_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  artwork_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_artwork_interactions_user ON artwork_interactions(user_id);
CREATE INDEX idx_artwork_interactions_target ON artwork_interactions(target_user_id);
CREATE INDEX idx_artwork_interactions_artwork ON artwork_interactions(artwork_id);

-- 공유 컬렉션 테이블
CREATE TABLE IF NOT EXISTS shared_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  theme VARCHAR(255),
  creator_id UUID NOT NULL REFERENCES users(id),
  collaborator_ids UUID[] DEFAULT '{}',
  visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_shared_collections_creator ON shared_collections(creator_id);
CREATE INDEX idx_shared_collections_visibility ON shared_collections(visibility);

-- 컬렉션 작품 테이블
CREATE TABLE IF NOT EXISTS collection_artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES shared_collections(id) ON DELETE CASCADE,
  artwork_id VARCHAR(255) NOT NULL,
  added_by UUID NOT NULL REFERENCES users(id),
  note TEXT,
  voice_note TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_collection_artworks_collection ON collection_artworks(collection_id);
CREATE INDEX idx_collection_artworks_artwork ON collection_artworks(artwork_id);

-- 사용자 프로필에 프라이버시 관련 컬럼 추가
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS privacy_level INTEGER DEFAULT 1 CHECK (privacy_level BETWEEN 1 AND 4),
ADD COLUMN IF NOT EXISTS privacy_revealed_info JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS art_persona_image TEXT,
ADD COLUMN IF NOT EXISTS blurred_photo TEXT,
ADD COLUMN IF NOT EXISTS artistic_mask_photo TEXT;

-- 실시간 갤러리 세션 테이블
CREATE TABLE IF NOT EXISTS gallery_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id VARCHAR(255) NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- 갤러리 세션 참가자 테이블
CREATE TABLE IF NOT EXISTS gallery_session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES gallery_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  apt_type VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP
);

-- 갤러리 세션 노트 테이블
CREATE TABLE IF NOT EXISTS gallery_session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES gallery_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  artwork_id VARCHAR(255) NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_gallery_sessions_active ON gallery_sessions(is_active);
CREATE INDEX idx_gallery_participants_session ON gallery_session_participants(session_id);
CREATE INDEX idx_gallery_participants_user ON gallery_session_participants(user_id);
CREATE INDEX idx_gallery_notes_session ON gallery_session_notes(session_id);

-- 안전 기능을 위한 체크인 테이블
CREATE TABLE IF NOT EXISTS exhibition_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  exhibition_match_id UUID REFERENCES exhibition_matches(id),
  venue_name VARCHAR(255) NOT NULL,
  venue_address TEXT,
  checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checkout_time TIMESTAMP,
  emergency_contact_notified BOOLEAN DEFAULT false,
  notes TEXT
);

-- 인덱스 생성
CREATE INDEX idx_exhibition_checkins_user ON exhibition_checkins(user_id);
CREATE INDEX idx_exhibition_checkins_match ON exhibition_checkins(exhibition_match_id);