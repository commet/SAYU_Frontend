-- Supabase artworks 테이블 문제 해결
-- ERROR: column "style" does not exist 수정

-- 1. 먼저 현재 artworks 테이블 구조 확인
-- 이 쿼리를 실행해서 현재 컬럼들을 확인하세요
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'artworks' 
ORDER BY ordinal_position;

-- 2. artworks 테이블이 없다면 생성
CREATE TABLE IF NOT EXISTS artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    year_created VARCHAR(50),
    medium VARCHAR(255),
    style VARCHAR(255),  -- 이 컬럼이 누락되었을 가능성
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

-- 3. 만약 artworks 테이블은 있는데 style 컬럼만 없다면 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'artworks' 
        AND column_name = 'style'
    ) THEN
        ALTER TABLE artworks ADD COLUMN style VARCHAR(255);
        RAISE NOTICE 'style 컬럼이 추가되었습니다.';
    ELSE
        RAISE NOTICE 'style 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- 4. genre 컬럼도 확인하고 없으면 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'artworks' 
        AND column_name = 'genre'
    ) THEN
        ALTER TABLE artworks ADD COLUMN genre VARCHAR(255);
        RAISE NOTICE 'genre 컬럼이 추가되었습니다.';
    END IF;
END $$;

-- 5. artwork_interactions 테이블과의 외래키 관계 확인
-- 외래키가 없다면 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'artwork_interactions'
        AND constraint_name LIKE '%artwork_id%'
    ) THEN
        ALTER TABLE artwork_interactions
        ADD CONSTRAINT fk_artwork_interactions_artwork_id
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE;
        RAISE NOTICE '외래키 관계가 추가되었습니다.';
    END IF;
END $$;

-- 6. 샘플 데이터가 없다면 추가
INSERT INTO artworks (
    id, 
    title, 
    artist, 
    year_created, 
    medium, 
    style, 
    genre, 
    tags, 
    emotion_tags, 
    image_url
)
SELECT * FROM (VALUES 
    (
        'a1111111-1111-1111-1111-111111111111'::uuid,
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
        'a2222222-2222-2222-2222-222222222222'::uuid,
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
        'a3333333-3333-3333-3333-333333333333'::uuid,
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
        'a4444444-4444-4444-4444-444444444444'::uuid,
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
        'a5555555-5555-5555-5555-555555555555'::uuid,
        '절규',
        '에드바르트 뭉크',
        '1893',
        '유화',
        '표현주의',
        '인물화',
        ARRAY['표현주의', '노르웨이', '감정', '인물'],
        ARRAY['불안한', '고통스러운', '절망적인'],
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch.jpg'
    )
) AS sample_data
WHERE NOT EXISTS (
    SELECT 1 FROM artworks WHERE id = sample_data.column1
);

-- 7. RLS 정책 확인 및 설정
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_interactions ENABLE ROW LEVEL SECURITY;

-- artworks는 모든 사용자가 읽을 수 있어야 함
DROP POLICY IF EXISTS "Anyone can view artworks" ON artworks;
CREATE POLICY "Anyone can view artworks" ON artworks
    FOR SELECT USING (true);

-- artwork_interactions는 사용자별로 제한
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

-- 8. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_artworks_style ON artworks(style);
CREATE INDEX IF NOT EXISTS idx_artworks_genre ON artworks(genre);
CREATE INDEX IF NOT EXISTS idx_artworks_artist ON artworks(artist);

-- 9. 최종 확인
DO $$
BEGIN
    RAISE NOTICE '===== 수정 완료 =====';
    RAISE NOTICE '✅ artworks 테이블 확인 및 수정 완료';
    RAISE NOTICE '✅ style 컬럼 확인 및 추가 완료';
    RAISE NOTICE '✅ 외래키 관계 설정 완료';
    RAISE NOTICE '✅ RLS 정책 설정 완료';
    RAISE NOTICE '✅ 인덱스 생성 완료';
    RAISE NOTICE '';
    RAISE NOTICE '다음 쿼리로 최종 확인하세요:';
    RAISE NOTICE 'SELECT * FROM artworks LIMIT 1;';
END $$;