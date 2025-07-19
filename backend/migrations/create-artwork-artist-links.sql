-- 작품 테이블 생성 (미술관 API에서 수집한 작품들)
CREATE TABLE IF NOT EXISTS artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 기본 정보
    object_id VARCHAR(255) UNIQUE NOT NULL, -- 미술관별 고유 ID
    title VARCHAR(500) NOT NULL,
    title_ko VARCHAR(500),
    date_display VARCHAR(255), -- "1889", "c. 1850-1860" 등
    year_start INTEGER,
    year_end INTEGER,
    
    -- 작품 정보
    medium VARCHAR(500),
    medium_ko VARCHAR(500),
    dimensions VARCHAR(500),
    credit_line TEXT,
    department VARCHAR(255),
    classification VARCHAR(255),
    
    -- 이미지 정보
    image_url TEXT,
    thumbnail_url TEXT,
    cloudinary_url TEXT,
    image_width INTEGER,
    image_height INTEGER,
    
    -- 메타데이터
    source VARCHAR(100) NOT NULL, -- 'met', 'cleveland', 'artic' 등
    source_url TEXT,
    is_public_domain BOOLEAN DEFAULT false,
    is_on_view BOOLEAN DEFAULT false,
    gallery_info VARCHAR(500),
    
    -- 통계
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    
    -- 타임스탬프
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 작품-작가 연결 테이블
CREATE TABLE IF NOT EXISTS artwork_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'artist', -- 'artist', 'attributed to', 'workshop of', 'follower of' 등
    is_primary BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    UNIQUE(artwork_id, artist_id, role)
);

-- 작품-전시 연결 테이블
CREATE TABLE IF NOT EXISTS exhibition_artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    section VARCHAR(255),
    
    UNIQUE(exhibition_id, artwork_id)
);

-- 사용자-작품 상호작용
CREATE TABLE IF NOT EXISTS user_artwork_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'view', 'like', 'bookmark', 'share'
    interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, artwork_id, interaction_type)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_artworks_source ON artworks(source);
CREATE INDEX IF NOT EXISTS idx_artworks_year_start ON artworks(year_start);
CREATE INDEX IF NOT EXISTS idx_artworks_classification ON artworks(classification);
CREATE INDEX IF NOT EXISTS idx_artworks_public_domain ON artworks(is_public_domain);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at);

CREATE INDEX IF NOT EXISTS idx_artwork_artists_artwork ON artwork_artists(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_artists_artist ON artwork_artists(artist_id);

CREATE INDEX IF NOT EXISTS idx_exhibition_artworks_exhibition ON exhibition_artworks(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_artworks_artwork ON exhibition_artworks(artwork_id);

CREATE INDEX IF NOT EXISTS idx_user_artwork_interactions_user ON user_artwork_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_artwork_interactions_artwork ON user_artwork_interactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_user_artwork_interactions_type ON user_artwork_interactions(interaction_type);

-- 전체 텍스트 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_artworks_search ON artworks USING gin(
    to_tsvector('english', title || ' ' || COALESCE(medium, '') || ' ' || COALESCE(classification, ''))
);

-- 업데이트 트리거
CREATE TRIGGER update_artworks_updated_at
    BEFORE UPDATE ON artworks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();