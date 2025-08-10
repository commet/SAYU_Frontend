-- 전시 관련 추가 테이블들 생성

-- 1. 전시 작품 목록 테이블
CREATE TABLE IF NOT EXISTS exhibition_artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    title_ko VARCHAR(500),
    year INTEGER,
    medium VARCHAR(200),
    dimensions VARCHAR(200),
    description TEXT,
    image_url VARCHAR(500),
    artwork_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 전시 언론 보도 테이블
CREATE TABLE IF NOT EXISTS exhibition_press (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    outlet_name VARCHAR(200) NOT NULL,
    outlet_country VARCHAR(2) DEFAULT 'KR',
    article_title VARCHAR(500),
    article_url VARCHAR(500),
    publication_date DATE,
    journalist_name VARCHAR(100),
    article_type VARCHAR(50) DEFAULT 'review', -- review, preview, interview, news
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. 아티스트 컬렉션 소장처 테이블
CREATE TABLE IF NOT EXISTS artist_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_name VARCHAR(200) NOT NULL,
    artist_name_en VARCHAR(200),
    artist_name_ko VARCHAR(200),
    institution_name VARCHAR(300) NOT NULL,
    institution_name_en VARCHAR(300),
    institution_type VARCHAR(50) DEFAULT 'museum', -- museum, gallery, foundation, private
    country VARCHAR(2),
    city VARCHAR(100),
    artworks_count INTEGER DEFAULT 1,
    notable_works TEXT[],
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(artist_name, institution_name)
);

-- 4. 관련 전시/동시개최전 테이블
CREATE TABLE IF NOT EXISTS exhibition_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    main_exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    related_exhibition_title VARCHAR(500) NOT NULL,
    related_exhibition_title_en VARCHAR(500),
    related_venue VARCHAR(200),
    relation_type VARCHAR(50) NOT NULL, -- concurrent, sequel, retrospective, companion
    start_date DATE,
    end_date DATE,
    description TEXT,
    official_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. 전시 이미지 테이블 (포스터, 설치전경, 작품사진 등)
CREATE TABLE IF NOT EXISTS exhibition_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(50) NOT NULL, -- poster, installation, artwork, gallery_view, opening
    title VARCHAR(200),
    alt_text VARCHAR(300),
    photographer VARCHAR(100),
    image_order INTEGER DEFAULT 0,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. 전시 특별 프로그램/이벤트 테이블
CREATE TABLE IF NOT EXISTS exhibition_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    event_title VARCHAR(300) NOT NULL,
    event_title_en VARCHAR(300),
    event_type VARCHAR(50) NOT NULL, -- opening, talk, performance, workshop, tour
    event_date DATE,
    event_time TIME,
    duration_minutes INTEGER,
    venue VARCHAR(200),
    speaker VARCHAR(200),
    description TEXT,
    booking_required BOOLEAN DEFAULT false,
    booking_url VARCHAR(500),
    max_participants INTEGER,
    admission_fee INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_exhibition_artworks_exhibition_id ON exhibition_artworks(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_press_exhibition_id ON exhibition_press(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_artist_collections_artist_name ON artist_collections(artist_name);
CREATE INDEX IF NOT EXISTS idx_exhibition_relations_main_exhibition_id ON exhibition_relations(main_exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_images_exhibition_id ON exhibition_images(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_events_exhibition_id ON exhibition_events(exhibition_id);

-- RLS (Row Level Security) 정책 - 모든 사용자가 읽기 가능
ALTER TABLE exhibition_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_press ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_events ENABLE ROW LEVEL SECURITY;

-- 읽기 정책
CREATE POLICY "Allow public read access" ON exhibition_artworks FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON exhibition_press FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON artist_collections FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON exhibition_relations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON exhibition_images FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON exhibition_events FOR SELECT USING (true);

-- 코멘트 추가
COMMENT ON TABLE exhibition_artworks IS '전시 작품 목록';
COMMENT ON TABLE exhibition_press IS '전시 언론 보도';
COMMENT ON TABLE artist_collections IS '아티스트 작품 소장처';
COMMENT ON TABLE exhibition_relations IS '관련/동시개최 전시';
COMMENT ON TABLE exhibition_images IS '전시 이미지';
COMMENT ON TABLE exhibition_events IS '전시 특별 프로그램/이벤트';