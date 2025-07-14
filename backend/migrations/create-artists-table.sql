-- Artists table to store artist information
CREATE TABLE IF NOT EXISTS artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ko VARCHAR(255),
    birth_year INTEGER,
    death_year INTEGER,
    nationality VARCHAR(100),
    nationality_ko VARCHAR(100),
    bio TEXT,
    bio_ko TEXT,
    copyright_status VARCHAR(50) NOT NULL DEFAULT 'unknown',
    follow_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    era VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- JSON fields for complex data
    images JSONB DEFAULT '{}',
    sources JSONB DEFAULT '{}',
    license_info JSONB DEFAULT '{}',
    official_links JSONB DEFAULT '{}',
    representation JSONB DEFAULT '{}',
    recent_exhibitions JSONB DEFAULT '[]',
    media_links JSONB DEFAULT '{}',
    
    -- Verification fields
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP,
    verification_method VARCHAR(50),
    
    -- Artist-managed profiles
    artist_managed JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '{}',
    purchase_links JSONB DEFAULT '{}'
);

-- Artist follows table for user-artist relationships
CREATE TABLE IF NOT EXISTS artist_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, artist_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);
CREATE INDEX IF NOT EXISTS idx_artists_nationality ON artists(nationality);
CREATE INDEX IF NOT EXISTS idx_artists_copyright_status ON artists(copyright_status);
CREATE INDEX IF NOT EXISTS idx_artists_birth_year ON artists(birth_year);
CREATE INDEX IF NOT EXISTS idx_artists_follow_count ON artists(follow_count);
CREATE INDEX IF NOT EXISTS idx_artists_is_featured ON artists(is_featured);
CREATE INDEX IF NOT EXISTS idx_artists_created_at ON artists(created_at);

CREATE INDEX IF NOT EXISTS idx_artist_follows_user_id ON artist_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_follows_artist_id ON artist_follows(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_follows_followed_at ON artist_follows(followed_at);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_artists_search ON artists USING gin(
    to_tsvector('english', name || ' ' || COALESCE(bio, ''))
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artists_updated_at
    BEFORE UPDATE ON artists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample artists data
INSERT INTO artists (name, name_ko, birth_year, death_year, nationality, nationality_ko, bio, bio_ko, copyright_status, follow_count, is_featured, era, images, sources) VALUES
(
    'Vincent van Gogh',
    '빈센트 반 고흐',
    1853,
    1890,
    'Dutch',
    '네덜란드',
    'Post-impressionist painter known for his expressive use of color and emotional honesty.',
    '색채의 표현적 사용과 감정적 진솔함으로 유명한 후기 인상주의 화가.',
    'public_domain',
    15420,
    true,
    'Post-Impressionism',
    '{"portrait": "/images/artists/van-gogh-portrait.jpg", "works": []}',
    '{"wikidata": "Q5582", "wikimedia": "Category:Vincent van Gogh"}'
),
(
    'Georgia O''Keeffe',
    '조지아 오키프',
    1887,
    1986,
    'American',
    '미국',
    'American modernist artist known for her paintings of enlarged flowers and New Mexican landscapes.',
    '확대된 꽃과 뉴멕시코 풍경 그림으로 유명한 미국의 모더니스트 화가.',
    'licensed',
    8930,
    true,
    'Modernism',
    '{"portrait": "/images/artists/okeefe-portrait.jpg", "thumbnails": []}',
    '{}',
    '{"licenseType": "Estate License", "licenseHolder": "Georgia O''Keeffe Museum", "usageRights": ["Educational Use", "Museum Display"]}'
),
(
    'Yayoi Kusama',
    '쿠사마 야요이',
    1929,
    NULL,
    'Japanese',
    '일본',
    'Contemporary artist known for her polka dot infinity rooms and pumpkin sculptures.',
    '물방울무늬 인피니티 룸과 호박 조각으로 유명한 현대 작가.',
    'contemporary',
    24680,
    true,
    'Contemporary',
    '{}',
    '{}',
    '{}',
    '{"instagram": "https://www.instagram.com/yayoikusama_official/", "website": "https://yayoikusama.jp/"}',
    '{"gallery": "David Zwirner Gallery", "gallerySite": "https://www.davidzwirner.com/artists/yayoi-kusama"}',
    '[{"title": "Cosmic Nature", "venue": "New York Botanical Garden", "year": 2024, "city": "New York"}]'
),
(
    'Kaws',
    '카우스',
    1974,
    NULL,
    'American',
    '미국',
    'Contemporary artist and designer known for his cartoon-inspired characters and sculptures.',
    '만화에서 영감을 받은 캐릭터와 조각으로 유명한 현대 작가이자 디자이너.',
    'verified_artist',
    19250,
    true,
    'Contemporary',
    '{}',
    '{}',
    '{}',
    '{}',
    '{}',
    '[]',
    '{"interviews": [], "articles": [], "reviews": []}',
    true,
    NOW(),
    'email',
    '{"profileImage": "/images/artists/kaws-profile.jpg", "allowedWorks": [], "socialLinks": {"instagram": "@kaws", "twitter": "@kaws"}}',
    '{"canShareImages": true, "allowCommercialUse": false, "allowDerivativeWorks": false}'
),
(
    'Leonardo da Vinci',
    '레오나르도 다 빈치',
    1452,
    1519,
    'Italian',
    '이탈리아',
    'Renaissance polymath known for iconic works like the Mona Lisa and The Last Supper.',
    '모나리자와 최후의 만찬 같은 상징적 작품으로 유명한 르네상스 시대의 박학다식한 인물.',
    'public_domain',
    32400,
    true,
    'Renaissance',
    '{"portrait": "/images/artists/leonardo-portrait.jpg"}',
    '{"wikidata": "Q762", "wikimedia": "Category:Leonardo da Vinci"}'
),
(
    'Frida Kahlo',
    '프리다 칼로',
    1907,
    1954,
    'Mexican',
    '멕시코',
    'Mexican artist known for her self-portraits and works inspired by nature and Mexican culture.',
    '자화상과 자연, 멕시코 문화에서 영감을 받은 작품으로 유명한 멕시코 화가.',
    'licensed',
    21300,
    true,
    'Surrealism',
    '{"portrait": "/images/artists/frida-portrait.jpg"}',
    '{}',
    '{"licenseType": "Estate License", "licenseHolder": "Frida Kahlo Corporation"}'
),
(
    'Andy Warhol',
    '앤디 워홀',
    1928,
    1987,
    'American',
    '미국',
    'Leading figure in the pop art movement, known for his colorful prints of celebrities and consumer goods.',
    '팝 아트 운동의 선도적 인물로, 유명인과 소비재의 컬러풀한 프린트로 유명.',
    'licensed',
    18700,
    true,
    'Pop Art',
    '{"portrait": "/images/artists/warhol-portrait.jpg"}',
    '{}',
    '{"licenseType": "Foundation License", "licenseHolder": "Andy Warhol Foundation"}'
),
(
    'Claude Monet',
    '클로드 모네',
    1840,
    1926,
    'French',
    '프랑스',
    'Founder of French Impressionist painting, famous for his series of Water Lilies.',
    '프랑스 인상주의 회화의 창시자로, 수련 연작으로 유명.',
    'public_domain',
    28900,
    true,
    'Impressionism',
    '{"portrait": "/images/artists/monet-portrait.jpg"}',
    '{"wikidata": "Q296", "wikimedia": "Category:Claude Monet"}'
),
(
    'Pablo Picasso',
    '파블로 피카소',
    1881,
    1973,
    'Spanish',
    '스페인',
    'Spanish painter and sculptor, co-founder of Cubism and one of the most influential artists of the 20th century.',
    '스페인 화가이자 조각가, 입체파의 공동 창시자이며 20세기의 가장 영향력 있는 작가 중 한 명.',
    'licensed',
    45200,
    true,
    'Cubism',
    '{"portrait": "/images/artists/picasso-portrait.jpg"}',
    '{}',
    '{"licenseType": "Estate License", "licenseHolder": "Picasso Administration"}'
),
(
    'Banksy',
    '뱅크시',
    NULL,
    NULL,
    'British',
    '영국',
    'Anonymous street artist known for politically charged graffiti and subversive art.',
    '정치적 메시지가 담긴 그래피티와 전복적인 예술로 유명한 익명의 거리 예술가.',
    'contemporary',
    33400,
    true,
    'Street Art',
    '{}',
    '{}',
    '{}',
    '{"instagram": "https://www.instagram.com/banksy/"}',
    '{}',
    '[]'
)
ON CONFLICT (id) DO NOTHING;