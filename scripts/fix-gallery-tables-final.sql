-- SAYU Gallery 테이블 완전 재구성
-- 모든 필요한 컬럼을 포함한 최종 버전

-- 1. 기존 테이블 삭제 (필요시 주석 해제)
-- DROP TABLE IF EXISTS artwork_interactions CASCADE;
-- DROP TABLE IF EXISTS artworks CASCADE;

-- 2. artworks 테이블 생성 또는 수정
CREATE TABLE IF NOT EXISTS artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    year_created VARCHAR(50),
    medium VARCHAR(255),
    style VARCHAR(255),
    genre VARCHAR(255),
    tags TEXT[],
    emotion_tags TEXT[],
    image_url TEXT,
    description TEXT,
    museum VARCHAR(255),
    is_public_domain BOOLEAN DEFAULT true,
    license VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 누락된 컬럼들 추가 (이미 있으면 스킵)
DO $$ 
BEGIN
    -- style 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'style'
    ) THEN
        ALTER TABLE artworks ADD COLUMN style VARCHAR(255);
        RAISE NOTICE '✅ style 컬럼 추가됨';
    END IF;

    -- genre 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'genre'
    ) THEN
        ALTER TABLE artworks ADD COLUMN genre VARCHAR(255);
        RAISE NOTICE '✅ genre 컬럼 추가됨';
    END IF;

    -- emotion_tags 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'emotion_tags'
    ) THEN
        ALTER TABLE artworks ADD COLUMN emotion_tags TEXT[];
        RAISE NOTICE '✅ emotion_tags 컬럼 추가됨';
    END IF;

    -- tags 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'tags'
    ) THEN
        ALTER TABLE artworks ADD COLUMN tags TEXT[];
        RAISE NOTICE '✅ tags 컬럼 추가됨';
    END IF;

    -- description 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'description'
    ) THEN
        ALTER TABLE artworks ADD COLUMN description TEXT;
        RAISE NOTICE '✅ description 컬럼 추가됨';
    END IF;

    -- museum 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'museum'
    ) THEN
        ALTER TABLE artworks ADD COLUMN museum VARCHAR(255);
        RAISE NOTICE '✅ museum 컬럼 추가됨';
    END IF;

    -- is_public_domain 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'is_public_domain'
    ) THEN
        ALTER TABLE artworks ADD COLUMN is_public_domain BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ is_public_domain 컬럼 추가됨';
    END IF;

    -- license 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'license'
    ) THEN
        ALTER TABLE artworks ADD COLUMN license VARCHAR(100);
        RAISE NOTICE '✅ license 컬럼 추가됨';
    END IF;
END $$;

-- 4. artwork_interactions 테이블 생성
CREATE TABLE IF NOT EXISTS artwork_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('view', 'like', 'save', 'share')),
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_artwork_interactions_user_id ON artwork_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_artwork_interactions_artwork_id ON artwork_interactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_interactions_type ON artwork_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_artwork_interactions_created_at ON artwork_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_artist ON artworks(artist);
CREATE INDEX IF NOT EXISTS idx_artworks_style ON artworks(style);
CREATE INDEX IF NOT EXISTS idx_artworks_genre ON artworks(genre);

-- 6. RLS 정책 설정
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_interactions ENABLE ROW LEVEL SECURITY;

-- artworks 테이블 정책
DROP POLICY IF EXISTS "Anyone can view artworks" ON artworks;
CREATE POLICY "Anyone can view artworks" ON artworks
    FOR SELECT USING (true);

-- artwork_interactions 테이블 정책
DROP POLICY IF EXISTS "Users can view their own interactions" ON artwork_interactions;
CREATE POLICY "Users can view their own interactions" ON artwork_interactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own interactions" ON artwork_interactions;
CREATE POLICY "Users can insert their own interactions" ON artwork_interactions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update their own interactions" ON artwork_interactions;
CREATE POLICY "Users can update their own interactions" ON artwork_interactions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete their own interactions" ON artwork_interactions;
CREATE POLICY "Users can delete their own interactions" ON artwork_interactions
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- 7. 샘플 데이터 추가 (안전하게 처리)
DO $$
BEGIN
    -- 테이블이 비어있는 경우에만 샘플 데이터 추가
    IF NOT EXISTS (SELECT 1 FROM artworks LIMIT 1) THEN
        INSERT INTO artworks (
            title, 
            artist, 
            year_created, 
            medium, 
            style, 
            genre, 
            tags, 
            emotion_tags, 
            image_url
        ) VALUES 
        (
            '수련',
            '클로드 모네',
            '1916',
            '유화',
            '인상주의',
            '풍경화',
            ARRAY['인상주의', '프랑스', '풍경', '자연'],
            ARRAY['평화로운', '고요한', '아름다운'],
            'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/800px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg'
        ),
        (
            '별이 빛나는 밤',
            '빈센트 반 고흐',
            '1889',
            '유화',
            '후기인상주의',
            '풍경화',
            ARRAY['후기인상주의', '네덜란드', '밤', '풍경'],
            ARRAY['몽환적인', '신비로운', '역동적인'],
            'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'
        ),
        (
            '게르니카',
            '파블로 피카소',
            '1937',
            '유화',
            '큐비즘',
            '역사화',
            ARRAY['큐비즘', '스페인', '전쟁', '역사'],
            ARRAY['비극적인', '강렬한', '충격적인'],
            'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Mural_del_Gernika.jpg/800px-Mural_del_Gernika.jpg'
        ),
        (
            '진주 귀걸이를 한 소녀',
            '요하네스 베르메르',
            '1665',
            '유화',
            '바로크',
            '초상화',
            ARRAY['바로크', '네덜란드', '초상', '여성'],
            ARRAY['우아한', '신비로운', '섬세한'],
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg'
        ),
        (
            '절규',
            '에드바르트 뭉크',
            '1893',
            '유화',
            '표현주의',
            '인물화',
            ARRAY['표현주의', '노르웨이', '감정', '인물'],
            ARRAY['불안한', '고통스러운', '절망적인'],
            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch.jpg'
        );
        
        RAISE NOTICE '✅ 샘플 데이터 추가 완료';
    ELSE
        RAISE NOTICE '✓ 기존 데이터가 있어 샘플 데이터 추가 생략';
    END IF;
END $$;

-- 8. 권한 부여
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 9. 테이블 구조 확인
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'artworks';
    
    RAISE NOTICE '';
    RAISE NOTICE '===== 갤러리 테이블 설정 완료 =====';
    RAISE NOTICE '✅ artworks 테이블: % 개 컬럼', col_count;
    RAISE NOTICE '✅ artwork_interactions 테이블 생성/확인 완료';
    RAISE NOTICE '✅ 모든 필수 컬럼 확인 완료';
    RAISE NOTICE '✅ 인덱스 및 RLS 정책 설정 완료';
    RAISE NOTICE '';
    RAISE NOTICE '테스트 쿼리:';
    RAISE NOTICE 'SELECT title, artist, style, emotion_tags FROM artworks LIMIT 3;';
END $$;