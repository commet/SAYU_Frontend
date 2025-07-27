-- APT 프로필 검증 함수
CREATE OR REPLACE FUNCTION validate_apt_profile()
RETURNS TRIGGER AS $$
DECLARE
  valid_types text[] := ARRAY['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC', 'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];
  apt_type text;
  importance int;
BEGIN
  -- APT 프로필이 있는 경우에만 검증
  IF NEW.apt_profile IS NOT NULL THEN
    -- primary_types 배열 확인
    IF NEW.apt_profile->'primary_types' IS NULL OR 
       jsonb_array_length(NEW.apt_profile->'primary_types') = 0 THEN
      RAISE EXCEPTION 'APT 프로필에는 primary_types 배열이 필요합니다';
    END IF;
    
    -- 첫 번째 타입 추출
    apt_type := NEW.apt_profile->'primary_types'->0->>'type';
    
    -- 타입이 없는 경우
    IF apt_type IS NULL THEN
      RAISE EXCEPTION 'APT 타입이 지정되지 않았습니다';
    END IF;
    
    -- 유효한 타입인지 확인
    IF NOT (apt_type = ANY(valid_types)) THEN
      RAISE EXCEPTION '유효하지 않은 APT 타입: %. 유효한 타입: %', apt_type, array_to_string(valid_types, ', ');
    END IF;
    
    -- dimensions 확인
    IF NEW.apt_profile->'dimensions' IS NULL THEN
      RAISE EXCEPTION 'APT 프로필에는 dimensions가 필요합니다';
    END IF;
    
    -- meta 정보 확인
    IF NEW.apt_profile->'meta' IS NULL THEN
      RAISE EXCEPTION 'APT 프로필에는 meta 정보가 필요합니다';
    END IF;
  END IF;
  
  -- 중요도 높은 아티스트의 APT 삭제 방지
  IF OLD.apt_profile IS NOT NULL AND NEW.apt_profile IS NULL THEN
    importance := COALESCE(NEW.importance_score, 0);
    IF importance >= 90 THEN
      RAISE EXCEPTION '중요도 %인 아티스트 %의 APT를 삭제할 수 없습니다', importance, NEW.name;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS validate_apt_profile_trigger ON artists;
CREATE TRIGGER validate_apt_profile_trigger
  BEFORE INSERT OR UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION validate_apt_profile();

-- 기존 잘못된 데이터 정리 (한 번만 실행)
UPDATE artists 
SET apt_profile = NULL 
WHERE apt_profile IS NOT NULL 
  AND apt_profile->'primary_types'->0->>'type' NOT IN (
    'LAEF', 'LAEC', 'LAMF', 'LAMC', 
    'LREF', 'LREC', 'LRMF', 'LRMC', 
    'SAEF', 'SAEC', 'SAMF', 'SAMC', 
    'SREF', 'SREC', 'SRMF', 'SRMC'
  );

-- 통계 확인
SELECT 
  COUNT(*) as total_artists,
  COUNT(CASE WHEN apt_profile IS NOT NULL THEN 1 END) as with_apt,
  COUNT(CASE WHEN importance_score >= 90 THEN 1 END) as high_importance,
  COUNT(CASE WHEN importance_score >= 90 AND apt_profile IS NOT NULL THEN 1 END) as high_importance_with_apt
FROM artists;