-- SAYU 핵심 기능을 위한 artists 테이블 확장
-- 감정 기반 매칭과 성격 유형 연결을 위한 필드 추가

-- 작품 스타일 정보
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS artistic_style JSONB DEFAULT '{
  "movements": [],
  "techniques": [],
  "dominant_colors": [],
  "color_temperature": null,
  "brushwork": null
}';

-- 감정적 특성 (SAYU 핵심!)
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS emotional_profile JSONB DEFAULT '{
  "primary_emotions": [],
  "emotional_intensity": null,
  "mood_signature": null,
  "viewer_impact": null
}';

-- 16가지 성격 유형 친화도
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS personality_affinity JSONB DEFAULT '{
  "scores": {},
  "best_match_types": [],
  "match_reasoning": null
}';

-- 대표작 정보
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS representative_works JSONB DEFAULT '[]';

-- 주요 테마와 주제
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS themes_subjects JSONB DEFAULT '{
  "primary_themes": [],
  "recurring_motifs": [],
  "conceptual_interests": []
}';

-- 통계 정보
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS statistics JSONB DEFAULT '{
  "total_artworks": 0,
  "artworks_in_sayu": 0,
  "exhibition_count": 0,
  "follower_trends": []
}';

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_artists_emotional_profile ON artists USING gin(emotional_profile);
CREATE INDEX IF NOT EXISTS idx_artists_personality_affinity ON artists USING gin(personality_affinity);
CREATE INDEX IF NOT EXISTS idx_artists_themes ON artists USING gin(themes_subjects);

-- 감정 기반 검색을 위한 함수
CREATE OR REPLACE FUNCTION search_artists_by_emotion(emotion_keyword TEXT)
RETURNS TABLE(artist_id UUID, artist_name VARCHAR, match_score FLOAT)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    name,
    (
      CASE 
        WHEN emotional_profile->>'primary_emotions' ILIKE '%' || emotion_keyword || '%' THEN 1.0
        WHEN emotional_profile->>'mood_signature' ILIKE '%' || emotion_keyword || '%' THEN 0.8
        WHEN emotional_profile->>'viewer_impact' ILIKE '%' || emotion_keyword || '%' THEN 0.6
        ELSE 0.0
      END
    ) as match_score
  FROM artists
  WHERE 
    emotional_profile->>'primary_emotions' ILIKE '%' || emotion_keyword || '%' OR
    emotional_profile->>'mood_signature' ILIKE '%' || emotion_keyword || '%' OR
    emotional_profile->>'viewer_impact' ILIKE '%' || emotion_keyword || '%'
  ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql;

-- 성격 유형별 아티스트 추천 함수
CREATE OR REPLACE FUNCTION recommend_artists_by_personality(animal_type TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(artist_id UUID, artist_name VARCHAR, affinity_score FLOAT)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    name,
    COALESCE((personality_affinity->'scores'->>animal_type)::FLOAT, 0.0) as affinity_score
  FROM artists
  WHERE personality_affinity->'scores' ? animal_type
  ORDER BY affinity_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;