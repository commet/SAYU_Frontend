-- SAYU Gallery Collection RPC Functions
-- 트랜잭션 처리와 원자성 보장을 위한 저장 프로시저

-- 1. 작품 저장 함수 (UPSERT + Interaction 저장을 원자적으로 처리)
CREATE OR REPLACE FUNCTION save_artwork_with_interaction(
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
    v_existing_interaction BOOLEAN;
    v_result JSONB;
BEGIN
    -- 트랜잭션 시작
    -- 1. 작품 UPSERT (있으면 가져오고, 없으면 생성)
    IF p_artwork_data IS NOT NULL THEN
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
            metadata
        ) VALUES (
            p_external_id,
            COALESCE(p_artwork_data->>'title', 'Untitled'),
            COALESCE(p_artwork_data->>'artist', 'Unknown Artist'),
            p_artwork_data->>'year',
            p_artwork_data->>'imageUrl',
            COALESCE(p_artwork_data->>'medium', 'Mixed Media'),
            p_artwork_data->>'style',
            p_artwork_data->>'description',
            p_artwork_data->>'museum',
            p_artwork_data->>'department',
            COALESCE((p_artwork_data->>'isPublicDomain')::boolean, true),
            COALESCE(p_artwork_data->>'license', 'CC0'),
            p_artwork_data
        )
        ON CONFLICT (external_id) 
        DO UPDATE SET
            -- 기존 작품이 있으면 메타데이터만 업데이트
            metadata = artworks.metadata || EXCLUDED.metadata,
            updated_at = NOW()
        RETURNING id INTO v_artwork_id;
    ELSE
        -- artworkData가 없으면 기존 작품 찾기
        SELECT id INTO v_artwork_id
        FROM artworks
        WHERE external_id = p_external_id;
        
        IF v_artwork_id IS NULL THEN
            RAISE EXCEPTION 'Artwork not found and no data provided: %', p_external_id;
        END IF;
    END IF;

    -- 2. 기존 interaction 확인
    SELECT EXISTS (
        SELECT 1 FROM artwork_interactions
        WHERE user_id = p_user_id 
        AND artwork_id = v_artwork_id 
        AND interaction_type = 'save'
    ) INTO v_existing_interaction;

    -- 3. 새로운 interaction 추가 (중복이 아닌 경우만)
    IF NOT v_existing_interaction THEN
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
    END IF;

    -- 4. 결과 반환
    v_result := jsonb_build_object(
        'success', true,
        'artwork_id', v_artwork_id,
        'external_id', p_external_id,
        'already_saved', v_existing_interaction,
        'saved_count', (
            SELECT COUNT(*) 
            FROM artwork_interactions 
            WHERE user_id = p_user_id 
            AND interaction_type = 'save'
        )
    );

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        -- 롤백은 자동으로 됨
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'external_id', p_external_id
        );
END;
$$;

-- 2. 작품 제거 함수
CREATE OR REPLACE FUNCTION remove_artwork_from_collection(
    p_user_id UUID,
    p_external_id VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_artwork_id UUID;
    v_deleted_count INTEGER;
    v_result JSONB;
BEGIN
    -- 1. external_id로 artwork 찾기
    SELECT id INTO v_artwork_id
    FROM artworks
    WHERE external_id = p_external_id;

    IF v_artwork_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Artwork not found',
            'external_id', p_external_id
        );
    END IF;

    -- 2. interaction 삭제
    DELETE FROM artwork_interactions
    WHERE user_id = p_user_id 
    AND artwork_id = v_artwork_id 
    AND interaction_type = 'save';

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    -- 3. 결과 반환
    v_result := jsonb_build_object(
        'success', true,
        'deleted_count', v_deleted_count,
        'saved_count', (
            SELECT COUNT(*) 
            FROM artwork_interactions 
            WHERE user_id = p_user_id 
            AND interaction_type = 'save'
        )
    );

    RETURN v_result;
END;
$$;

-- 3. 배치 저장 함수 (여러 작품을 한번에 저장)
CREATE OR REPLACE FUNCTION save_artworks_batch(
    p_user_id UUID,
    p_artworks JSONB  -- Array of {external_id, artwork_data}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_artwork JSONB;
    v_results JSONB[] := ARRAY[]::JSONB[];
    v_success_count INTEGER := 0;
    v_error_count INTEGER := 0;
    v_single_result JSONB;
BEGIN
    -- 각 작품에 대해 저장 처리
    FOR v_artwork IN SELECT * FROM jsonb_array_elements(p_artworks)
    LOOP
        v_single_result := save_artwork_with_interaction(
            p_user_id,
            v_artwork->>'external_id',
            v_artwork->'artwork_data'
        );
        
        v_results := array_append(v_results, v_single_result);
        
        IF (v_single_result->>'success')::boolean THEN
            v_success_count := v_success_count + 1;
        ELSE
            v_error_count := v_error_count + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', v_error_count = 0,
        'success_count', v_success_count,
        'error_count', v_error_count,
        'results', to_jsonb(v_results),
        'total_saved', (
            SELECT COUNT(*) 
            FROM artwork_interactions 
            WHERE user_id = p_user_id 
            AND interaction_type = 'save'
        )
    );
END;
$$;

-- 4. 사용자 컬렉션 조회 최적화 함수
CREATE OR REPLACE FUNCTION get_user_collection(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_department VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    external_id VARCHAR,
    title VARCHAR,
    artist VARCHAR,
    year_created VARCHAR,
    image_url TEXT,
    medium VARCHAR,
    style VARCHAR,
    description TEXT,
    museum VARCHAR,
    department VARCHAR,
    is_public_domain BOOLEAN,
    license VARCHAR,
    metadata JSONB,
    saved_at TIMESTAMP WITH TIME ZONE,
    interaction_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        a.external_id,
        a.title,
        a.artist,
        a.year_created,
        a.image_url,
        a.medium,
        a.style,
        a.description,
        a.museum,
        a.department,
        a.is_public_domain,
        a.license,
        a.metadata,
        ai.created_at as saved_at,
        COUNT(*) OVER() as interaction_count
    FROM artwork_interactions ai
    JOIN artworks a ON ai.artwork_id = a.id
    WHERE ai.user_id = p_user_id 
    AND ai.interaction_type = 'save'
    AND (p_department IS NULL OR a.department = p_department)
    ORDER BY ai.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;

-- 5. 권한 설정
GRANT EXECUTE ON FUNCTION save_artwork_with_interaction TO authenticated;
GRANT EXECUTE ON FUNCTION remove_artwork_from_collection TO authenticated;
GRANT EXECUTE ON FUNCTION save_artworks_batch TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_collection TO authenticated;

-- 6. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_artworks_external_id_btree 
ON artworks USING btree(external_id);

CREATE INDEX IF NOT EXISTS idx_interactions_user_artwork_type 
ON artwork_interactions(user_id, artwork_id, interaction_type);

CREATE INDEX IF NOT EXISTS idx_interactions_user_type_created 
ON artwork_interactions(user_id, interaction_type, created_at DESC);

COMMENT ON FUNCTION save_artwork_with_interaction IS 'Atomic save operation for artwork and interaction';
COMMENT ON FUNCTION remove_artwork_from_collection IS 'Remove artwork from user collection';
COMMENT ON FUNCTION save_artworks_batch IS 'Batch save multiple artworks';
COMMENT ON FUNCTION get_user_collection IS 'Optimized query for user collection';