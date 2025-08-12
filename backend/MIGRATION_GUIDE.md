# SAYU Supabase 마이그레이션 가이드

## 🎯 목표
기존 Railway + 복잡한 테이블 구조에서 → Supabase + 단순화된 구조로 마이그레이션

## 📋 변경사항 요약

### Before (문제점)
- `users` 테이블 (TEXT id) + `user_profiles` 테이블 분리
- ProfileCompleteModal에서 존재하지 않는 컬럼들 참조
- `refreshUser()` 함수 누락
- RLS 정책 불일치

### After (해결책)
- `profiles` 테이블로 통합 (auth.users의 UUID id 직접 참조)
- 모든 사용자 정보를 한 테이블에서 관리
- 자동 프로필 생성 트리거
- 최적화된 인덱스 및 RLS 정책

## 🚀 마이그레이션 단계

### 1단계: 백업 (필수)
```bash
# 현재 데이터 백업
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2단계: 새 스키마 적용
```bash
# Supabase Dashboard → SQL Editor에서 실행
# 또는 psql 사용
psql $SUPABASE_DATABASE_URL < backend/migrations/supabase-optimized-schema.sql
```

### 3단계: 데이터 마이그레이션 (기존 데이터가 있는 경우)
```sql
-- 기존 users + user_profiles 데이터를 새 profiles 테이블로 이전
INSERT INTO profiles (
  id, email, username, bio, avatar_url, 
  language, preferences, points, level,
  created_at, updated_at
)
SELECT 
  u.id::uuid,
  u.email,
  COALESCE(u.name, up.bio, split_part(u.email, '@', 1)),
  up.bio,
  up.avatar_url,
  COALESCE(up.language, 'ko'),
  COALESCE(up.preferences, '{}'),
  COALESCE(up.points, 0),
  COALESCE(up.level, 1),
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
ON CONFLICT (id) DO NOTHING;

-- APT 결과 이전 (최신 것만)
UPDATE profiles 
SET 
  personality_type = apt.apt_type,
  animal_type = apt.animal_type,
  apt_scores = apt.scores,
  apt_completed_at = apt.created_at
FROM (
  SELECT DISTINCT ON (user_id) 
    user_id, apt_type, animal_type, scores, created_at
  FROM apt_results
  ORDER BY user_id, created_at DESC
) apt
WHERE profiles.id = apt.user_id::uuid;

-- Art 프로필 이전
UPDATE profiles
SET
  art_preferences = ap.art_preferences,
  personality_traits = ap.personality_traits,
  ai_generated_image_url = ap.ai_generated_image_url,
  generated_prompt = ap.generated_prompt,
  style_description = ap.style_description,
  color_palette = ap.color_palette
FROM art_profiles ap
WHERE profiles.id = ap.user_id::uuid;
```

### 4단계: 환경 변수 확인
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5단계: 프론트엔드 코드 배포
```bash
# 수정된 코드 배포
npm run build
npm run deploy
```

### 6단계: 테스트
1. **새 사용자 등록 테스트**
   - OAuth 로그인 (Google, Kakao 등)
   - 자동 프로필 생성 확인
   
2. **프로필 완성 테스트**
   - ProfileCompleteModal 동작 확인
   - 데이터 저장 확인
   
3. **기존 사용자 로그인 테스트**
   - 마이그레이션된 데이터 확인
   - 모든 기능 정상 동작 확인

## 🔍 문제 해결

### 트러블슈팅 체크리스트

1. **"Checking if user exists in database..." 무한 로딩**
   ```sql
   -- Supabase에서 확인
   SELECT * FROM profiles WHERE id = 'user_uuid';
   ```

2. **RLS 정책 오류**
   ```sql
   -- 현재 사용자 확인
   SELECT auth.uid();
   
   -- 정책 확인
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. **자동 프로필 생성 실패**
   ```sql
   -- 트리거 확인
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   
   -- 함수 확인
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

## 📊 성능 모니터링

### 쿼리 성능 확인
```sql
-- 느린 쿼리 확인
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%profiles%' 
ORDER BY mean_time DESC;

-- 인덱스 사용률 확인
SELECT 
  schemaname, tablename, indexname, 
  idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public';
```

### 예상 성능 개선
- 단일 테이블 조회로 JOIN 제거 → **50% 빠른 응답시간**
- 최적화된 인덱스 → **매칭 쿼리 10배 향상**
- Supabase Edge → **글로벌 CDN으로 지연시간 50% 감소**

## 🎉 마이그레이션 완료 검증

✅ **완료 체크리스트**
- [ ] 새 사용자 OAuth 로그인 정상 동작
- [ ] 자동 프로필 생성 동작
- [ ] ProfileCompleteModal 정상 동작  
- [ ] 기존 사용자 데이터 정상 표시
- [ ] APT 테스트 및 결과 저장 정상
- [ ] 팔로우 시스템 정상 동작
- [ ] 성능 개선 확인 (응답시간 측정)

## 🚨 롤백 계획
문제 발생 시 즉시 롤백:
```bash
# 백업에서 복원
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# 이전 버전 코드로 롤백
git revert HEAD
npm run deploy
```

## 📈 예상 효과
- **개발 속도**: 복잡한 JOIN 제거로 2배 향상
- **성능**: API 응답시간 50% 개선  
- **비용**: Railway $400 → Supabase $100 (75% 절감)
- **안정성**: Supabase의 고가용성 인프라
- **확장성**: pgvector 기반 AI 기능 확장 용이