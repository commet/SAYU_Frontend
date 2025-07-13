# SAYU 데이터베이스 마이그레이션 전략

## 현재 상태
- Railway DB: 모든 기존 데이터 보관
- Supabase: 새로 설정됨, 비어있음
- 하이브리드 모드: 활성화됨

## 권장 마이그레이션 순서

### Phase 1: 새 기능만 Supabase 사용 (현재)
- 위험도: ⭐ (매우 낮음)
- 새로 추가되는 기능들만 Supabase에 저장
- 기존 기능은 Railway 유지

### Phase 2: 독립적인 기능 이전 (1-2주 후)
- 위험도: ⭐⭐ (낮음)
- 이전 추천 기능:
  1. follows (팔로우 시스템) - 독립적이고 단순함
  2. art_profiles (AI 아트 프로필) - 비교적 새로운 기능
  3. artvee_artworks (아트비 작품) - 외부 데이터

### Phase 3: 핵심 기능 이전 (1개월 후)
- 위험도: ⭐⭐⭐ (중간)
- 이전 대상:
  1. users, user_profiles - 백업 필수!
  2. mbti_results - 사용자 데이터
  3. gamification - 포인트/레벨 시스템

### Phase 4: 완전 이전 (2개월 후)
- 위험도: ⭐⭐⭐⭐ (높음)
- Railway 완전 종료
- Supabase만 사용

## 즉시 실행 가능한 설정

`.env` 파일에 추가:
```
# 새 기능만 Supabase로 라우팅
SUPABASE_SERVICES=artvee_artworks,exhibition_calendar
```

이렇게 하면 새로운 아트비 작품과 전시 캘린더만 Supabase를 사용합니다.