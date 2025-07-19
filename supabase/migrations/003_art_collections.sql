-- 작품 컬렉션 시스템 테이블 구조

-- 1. 사용자 컬렉션
CREATE TABLE art_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  is_shared boolean DEFAULT false, -- 공동 컬렉션 여부
  cover_image_url text,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. 컬렉션 아이템 (저장된 작품)
CREATE TABLE collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES art_collections(id) ON DELETE CASCADE,
  artwork_id text NOT NULL, -- 박물관 API의 작품 ID
  museum_source text NOT NULL, -- 'met', 'cleveland', 'rijksmuseum' 등
  artwork_data jsonb NOT NULL, -- 작품 정보 캐싱
  emotion_tags text[] DEFAULT '{}', -- 감정 태그 3개 (예: ['평온함', '그리움', '설렘'])
  personal_note text, -- 개인 감상평
  added_by uuid REFERENCES auth.users(id), -- 공동 컬렉션인 경우 누가 추가했는지
  added_at timestamp with time zone DEFAULT now(),
  UNIQUE(collection_id, artwork_id)
);

-- 3. 공동 컬렉션 참여자
CREATE TABLE collection_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES art_collections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text DEFAULT 'collaborator' CHECK (role IN ('owner', 'collaborator')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'left')),
  invited_at timestamp with time zone DEFAULT now(),
  joined_at timestamp with time zone,
  UNIQUE(collection_id, user_id)
);

-- 4. 컬렉션 좋아요
CREATE TABLE collection_likes (
  collection_id uuid REFERENCES art_collections(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (collection_id, user_id)
);

-- 5. 컬렉션 댓글
CREATE TABLE collection_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES art_collections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  parent_id uuid REFERENCES collection_comments(id), -- 대댓글 지원
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. 사용자 활동 추적 (커뮤니티 오픈 기준용)
CREATE TABLE user_art_activities (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  artworks_viewed integer DEFAULT 0,
  collections_created integer DEFAULT 0,
  emotions_tagged integer DEFAULT 0,
  notes_written integer DEFAULT 0,
  daily_challenges_completed integer DEFAULT 0,
  last_activity_at timestamp with time zone DEFAULT now(),
  community_unlocked boolean DEFAULT false,
  community_unlocked_at timestamp with time zone
);

-- RLS 정책 설정
ALTER TABLE art_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_art_activities ENABLE ROW LEVEL SECURITY;

-- 컬렉션 정책
CREATE POLICY "사용자는 자신의 컬렉션을 관리할 수 있다" ON art_collections
  FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM collection_collaborators 
      WHERE collection_id = art_collections.id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "공개 컬렉션은 모두가 볼 수 있다" ON art_collections
  FOR SELECT USING (is_public = true);

-- 아이템 정책
CREATE POLICY "컬렉션 참여자는 아이템을 관리할 수 있다" ON collection_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM art_collections ac
      LEFT JOIN collection_collaborators cc ON cc.collection_id = ac.id
      WHERE ac.id = collection_items.collection_id 
      AND (ac.user_id = auth.uid() OR (cc.user_id = auth.uid() AND cc.status = 'active'))
    )
  );

CREATE POLICY "공개 컬렉션의 아이템은 모두가 볼 수 있다" ON collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM art_collections 
      WHERE id = collection_items.collection_id 
      AND is_public = true
    )
  );

-- 사용자 활동 정책
CREATE POLICY "사용자는 자신의 활동만 볼 수 있다" ON user_art_activities
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX idx_collections_user ON art_collections(user_id);
CREATE INDEX idx_collections_public ON art_collections(is_public) WHERE is_public = true;
CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_collection_items_artwork ON collection_items(artwork_id);
CREATE INDEX idx_collection_items_emotions ON collection_items USING GIN(emotion_tags);
CREATE INDEX idx_collection_likes_collection ON collection_likes(collection_id);
CREATE INDEX idx_collection_comments_collection ON collection_comments(collection_id);

-- 트리거: 컬렉션 업데이트 시 updated_at 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON art_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 트리거: 사용자 활동 추적
CREATE OR REPLACE FUNCTION track_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- 컬렉션 생성 시
  IF TG_TABLE_NAME = 'art_collections' AND TG_OP = 'INSERT' THEN
    INSERT INTO user_art_activities (user_id, collections_created)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      collections_created = user_art_activities.collections_created + 1,
      last_activity_at = now();
  
  -- 작품 추가 시
  ELSIF TG_TABLE_NAME = 'collection_items' AND TG_OP = 'INSERT' THEN
    UPDATE user_art_activities 
    SET 
      artworks_viewed = artworks_viewed + 1,
      emotions_tagged = emotions_tagged + CASE WHEN array_length(NEW.emotion_tags, 1) > 0 THEN 1 ELSE 0 END,
      notes_written = notes_written + CASE WHEN NEW.personal_note IS NOT NULL THEN 1 ELSE 0 END,
      last_activity_at = now()
    WHERE user_id = NEW.added_by;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_collection_creation
  AFTER INSERT ON art_collections
  FOR EACH ROW
  EXECUTE FUNCTION track_user_activity();

CREATE TRIGGER track_item_addition
  AFTER INSERT ON collection_items
  FOR EACH ROW
  EXECUTE FUNCTION track_user_activity();