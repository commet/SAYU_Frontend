
-- Go to Supabase Dashboard > SQL Editor and run:

CREATE TABLE IF NOT EXISTS exhibition_artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID,
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

CREATE TABLE IF NOT EXISTS exhibition_press (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID,
    outlet_name VARCHAR(200) NOT NULL,
    outlet_country VARCHAR(2) DEFAULT 'KR',
    article_title VARCHAR(500),
    article_url VARCHAR(500),
    publication_date DATE,
    journalist_name VARCHAR(100),
    article_type VARCHAR(50) DEFAULT 'review',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artist_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_name VARCHAR(200) NOT NULL,
    artist_name_en VARCHAR(200),
    artist_name_ko VARCHAR(200),
    institution_name VARCHAR(300) NOT NULL,
    institution_name_en VARCHAR(300),
    institution_type VARCHAR(50) DEFAULT 'museum',
    country VARCHAR(2),
    city VARCHAR(100),
    artworks_count INTEGER DEFAULT 1,
    notable_works TEXT[],
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
