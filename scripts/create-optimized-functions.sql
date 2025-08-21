-- Optimized RPC functions for Gallery Collection
-- 트랜잭션 처리와 성능 최적화를 위한 저장 프로시저

-- 1. 작품 저장 최적화 함수 (UPSERT + 상호작용 저장을 원자적으로 처리)
CREATE OR REPLACE FUNCTION save_artwork_optimized(
    p_user_id UUID,
    p_external_id VARCHAR,
    p_artwork_data JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_artwork_id UUID;
    v_already_saved BOOLEAN;
    v_result JSONB;
BEGIN
    -- 트랜잭션 시작 (자동)
    
    -- 1. artwork 조회 또는 생성
    IF p_artwork_data IS NOT NULL THEN
        -- UPSERT: 있으면 업데이트, 없으면 삽입
        INSERT INTO artworks (
            external_id,
            title,
            artist,
            year_created,
            image_url,
            medium,
            style,
            description,
            museum,
            department,
            is_public_domain,
            license,
            source_type,
            metadata
        ) VALUES (
            p_external_id,
            COALESCE(p_artwork_data->>'title', 'Untitled'),
            COALESCE(p_artwork_data->>'artist', 'Unknown Artist'),
            p_artwork_data->>'year_created',
            p_artwork_data->>'image_url',
            COALESCE(p_artwork_data->>'medium', 'Mixed Media'),
            p_artwork_data->>'style',
            p_artwork_data->>'description',
            p_artwork_data->>'museum',
            p_artwork_data->>'department',
            COALESCE((p_artwork_data->>'is_public_domain')::BOOLEAN, true),
            COALESCE(p_artwork_data->>'license', 'CC0'),
            COALESCE(p_artwork_data->>'source_type', 'user_upload'),
            COALESCE(p_artwork_data->'metadata', '{}'::JSONB)
        )
        ON CONFLICT (external_id) DO UPDATE SET
            title = EXCLUDED.title,
            artist = EXCLUDED.artist,
            year_created = COALESCE(EXCLUDED.year_created, artworks.year_created),
            image_url = COALESCE(EXCLUDED.image_url, artworks.image_url),
            medium = EXCLUDED.medium,
            style = COALESCE(EXCLUDED.style, artworks.style),
            description = COALESCE(EXCLUDED.description, artworks.description),
            museum = COALESCE(EXCLUDED.museum, artworks.museum),
            department = COALESCE(EXCLUDED.department, artworks.department),
            metadata = artworks.metadata || COALESCE(EXCLUDED.metadata, '{}'::JSONB),
            updated_at = NOW()
        RETURNING id INTO v_artwork_id;
    ELSE
        -- artwork_data가 없으면 기존 artwork 조회
        SELECT id INTO v_artwork_id
        FROM artworks
        WHERE external_id = p_external_id;
        
        IF v_artwork_id IS NULL THEN
            RAISE EXCEPTION 'Artwork not found and no data provided';
        END IF;
    END IF;
    
    -- 2. 이미 저장되어 있는지 확인
    SELECT EXISTS(
        SELECT 1 FROM artwork_interactions
        WHERE user_id = p_user_id 
        AND artwork_id = v_artwork_id 
        AND interaction_type = 'save'
    ) INTO v_already_saved;
    
    -- 3. 저장되어 있지 않으면 저장
    IF NOT v_already_saved THEN
        INSERT INTO artwork_interactions (
            user_id,
            artwork_id,
            interaction_type,
            created_at
        ) VALUES (
            p_user_id,
            v_artwork_id,
            'save',
            NOW()
        );
        
        -- 통계 업데이트 (비동기적으로 처리하거나 트리거로 처리 가능)
        INSERT INTO artwork_stats (artwork_id, stat_date, save_count)
        VALUES (v_artwork_id, CURRENT_DATE, 1)
        ON CONFLICT (artwork_id, stat_date) 
        DO UPDATE SET save_count = artwork_stats.save_count + 1;
    END IF;
    
    -- 4. 결과 반환
    v_result := jsonb_build_object(
        'success', true,
        'artwork_id', v_artwork_id,
        'external_id', p_external_id,
        'already_saved', v_already_saved
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- 에러 로깅 (선택적)
        RAISE LOG 'Error in save_artwork_optimized: %', SQLERRM;
        RAISE;
END;
$$;

-- 2. 배치 저장 함수 (여러 작품을 한 번에 저장)
CREATE OR REPLACE FUNCTION save_artworks_batch(
    p_user_id UUID,
    p_artworks JSONB[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_artwork JSONB;
    v_results JSONB[] := '{}';
    v_single_result JSONB;
    v_success_count INT := 0;
    v_failed_count INT := 0;
BEGIN
    -- 각 artwork에 대해 저장 시도
    FOREACH v_artwork IN ARRAY p_artworks
    LOOP
        BEGIN
            v_single_result := save_artwork_optimized(
                p_user_id,
                v_artwork->>'external_id',
                v_artwork->'data'
            );
            v_success_count := v_success_count + 1;
            v_results := array_append(v_results, v_single_result);
        EXCEPTION
            WHEN OTHERS THEN
                v_failed_count := v_failed_count + 1;
                v_results := array_append(v_results, 
                    jsonb_build_object(
                        'success', false,
                        'external_id', v_artwork->>'external_id',
                        'error', SQLERRM
                    )
                );
        END;
    END LOOP;
    
    RETURN jsonb_build_object(
        'total', array_length(p_artworks, 1),
        'success_count', v_success_count,
        'failed_count', v_failed_count,
        'results', to_jsonb(v_results)
    );
END;
$$;

-- 3. 사용자의 저장된 작품 효율적 조회
CREATE OR REPLACE FUNCTION get_user_saved_artworks(
    p_user_id UUID,
    p_limit INT DEFAULT 500,
    p_offset INT DEFAULT 0
)
RETURNS TABLE(
    external_id VARCHAR,
    title VARCHAR,
    artist VARCHAR,
    year_created VARCHAR,
    image_url TEXT,
    medium VARCHAR,
    museum VARCHAR,
    department VARCHAR,
    saved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.external_id,
        a.title,
        a.artist,
        a.year_created,
        a.image_url,
        a.medium,
        a.museum,
        a.department,
        ai.created_at as saved_at,
        a.metadata
    FROM artwork_interactions ai
    JOIN artworks a ON ai.artwork_id = a.id
    WHERE ai.user_id = p_user_id
    AND ai.interaction_type = 'save'
    ORDER BY ai.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 4. 작품 제거 최적화 함수
CREATE OR REPLACE FUNCTION remove_saved_artwork(
    p_user_id UUID,
    p_external_id VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_artwork_id UUID;
    v_deleted_count INT;
BEGIN
    -- artwork ID 조회
    SELECT id INTO v_artwork_id
    FROM artworks
    WHERE external_id = p_external_id;
    
    IF v_artwork_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Artwork not found'
        );
    END IF;
    
    -- 상호작용 삭제
    DELETE FROM artwork_interactions
    WHERE user_id = p_user_id
    AND artwork_id = v_artwork_id
    AND interaction_type = 'save';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- 통계 업데이트
    IF v_deleted_count > 0 THEN
        INSERT INTO artwork_stats (artwork_id, stat_date, save_count)
        VALUES (v_artwork_id, CURRENT_DATE, -1)
        ON CONFLICT (artwork_id, stat_date) 
        DO UPDATE SET save_count = GREATEST(0, artwork_stats.save_count - 1);
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'deleted', v_deleted_count > 0
    );
END;
$$;

-- 5. 인기 작품 조회 (캐싱 친화적)
CREATE OR REPLACE FUNCTION get_trending_artworks(
    p_days INT DEFAULT 7,
    p_limit INT DEFAULT 20
)
RETURNS TABLE(
    external_id VARCHAR,
    title VARCHAR,
    artist VARCHAR,
    image_url TEXT,
    save_count BIGINT,
    view_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        a.external_id,
        a.title,
        a.artist,
        a.image_url,
        COUNT(DISTINCT CASE WHEN ai.interaction_type = 'save' THEN ai.user_id END) as save_count,
        COUNT(DISTINCT CASE WHEN ai.interaction_type = 'view' THEN ai.user_id END) as view_count
    FROM artworks a
    JOIN artwork_interactions ai ON a.id = ai.artwork_id
    WHERE ai.created_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY a.id, a.external_id, a.title, a.artist, a.image_url
    ORDER BY save_count DESC, view_count DESC
    LIMIT p_limit;
$$;

-- 6. 권한 설정
GRANT EXECUTE ON FUNCTION save_artwork_optimized TO authenticated;
GRANT EXECUTE ON FUNCTION save_artworks_batch TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_saved_artworks TO authenticated;
GRANT EXECUTE ON FUNCTION remove_saved_artwork TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_artworks TO authenticated, anon;

-- 7. Row Level Security (RLS) 정책
ALTER TABLE artwork_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own interactions"
ON artwork_interactions
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view artworks"
ON artworks
FOR SELECT
USING (true);

CREATE POLICY "System can insert/update artworks"
ON artworks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update artworks"
ON artworks
FOR UPDATE
USING (true);

COMMENT ON FUNCTION save_artwork_optimized IS 'Atomically saves artwork and creates interaction record';
COMMENT ON FUNCTION get_user_saved_artworks IS 'Efficiently retrieves user saved artworks with pagination';