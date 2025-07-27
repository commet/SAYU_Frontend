# SAYU Supabase 마이그레이션 로그

## 🗓️ 2025-01-27 마이그레이션 진행 기록

### 📁 새로 생성된 파일들 (Supabase 전용)

#### 1. 백엔드 (Supabase 지원)
- `/backend/src/config/supabase-client.js` - Supabase 클라이언트 설정
- `/backend/src/services/database.service.js` - 통합 데이터베이스 서비스
- `/backend/src/middleware/supabase-auth.js` - Supabase 인증 미들웨어
- `/backend/src/controllers/quizController-supabase.js` - Supabase 버전 퀴즈 컨트롤러

#### 2. 프론트엔드 (Supabase 통합)
- `/frontend/lib/supabase/database.types.ts` - TypeScript 타입 정의
- `/frontend/lib/supabase/api.ts` - Supabase API 래퍼
- `/frontend/hooks/useAuth.ts` - 인증 Hook
- `/frontend/lib/api/client.ts` - 통합 API 클라이언트
- `/frontend/.env.example` - 환경 변수 템플릿

##### Vercel Functions (API Routes)
- `/frontend/pages/api/quiz/start.ts` - Quiz 시작 API
- `/frontend/pages/api/quiz/answer.ts` - Quiz 답변 API
- `/frontend/pages/api/exhibitions/index.ts` - 전시 목록 API
- `/frontend/pages/api/exhibitions/[id].ts` - 전시 상세 API
- `/frontend/pages/api/exhibitions/[id]/like.ts` - 전시 좋아요 API
- `/frontend/pages/api/art-profile/generate.ts` - 아트 프로필 생성 API
- `/frontend/pages/api/art-profile/status.ts` - 생성 상태 확인 API
- `/frontend/pages/api/perception-exchange/create.ts` - 감상 교환 생성 API
- `/frontend/pages/api/perception-exchange/[artworkId].ts` - 감상 목록 API
- `/frontend/pages/api/social/follow.ts` - 팔로우 API

#### 3. 마이그레이션 관련
- `/supabase/migrations/001_complete_schema.sql` - 전체 DB 스키마
- `/scripts/migrate-to-supabase.js` - 데이터 마이그레이션 스크립트
- `/scripts/check-migration-readiness.js` - 마이그레이션 사전 점검
- `/scripts/apply-supabase-schema.js` - Supabase 스키마 적용
- `/docs/SUPABASE_MIGRATION_GUIDE.md` - 마이그레이션 가이드
- `/docs/SUPABASE_ENV_SETUP.md` - 환경 변수 설정 가이드

### 🗑️ 나중에 제거할 Railway 관련 파일들

#### 백엔드
- `/backend/src/config/database.js` - Railway PostgreSQL 설정
- `/backend/src/config/hybridDatabase.js` - 하이브리드 DB 시스템
- `/backend/src/middleware/auth.js` - JWT 인증 (구버전)
- `/backend/src/controllers/*Controller.js` - 모든 기존 컨트롤러
- `/backend/railway.json` - Railway 배포 설정
- `/backend/railway-cron.js` - Railway 크론 작업
- `/backend/sayu-living-server.js` - Railway 서버 엔트리
- `/backend/Procfile*` - Railway 프로세스 파일

#### 프론트엔드
- `/frontend/lib/api.ts` - 구 API 클라이언트
- `/frontend/lib/auth.ts` - 구 인증 시스템
- `/frontend/lib/supabase-mock.ts` - 개발용 mock

#### 문서/설정
- `/RAILWAY_*.md` - 모든 Railway 관련 문서
- `/HYBRID_ARCHITECTURE.md` - 하이브리드 시스템 문서
- `/.env` 파일의 Railway 관련 변수들

### 🔄 수정이 필요한 파일들

1. `/backend/package.json` - Railway 관련 스크립트 제거
2. `/frontend/package.json` - Railway API 의존성 제거
3. `/.env.example` 파일들 - Railway 변수 제거
4. `/backend/src/server.js` - Supabase 전용으로 수정

### ⚡ 현재 진행 상황

- [x] Phase 1: 코드베이스 분석
- [x] Phase 2: Supabase 스키마 생성
- [x] Phase 3: 백엔드 Supabase 서비스 구현
- [x] Phase 4: Vercel Functions API 이전 (완료!)
  - [x] Quiz API
  - [x] Exhibition API
  - [x] Art Profile API
  - [x] Perception Exchange API
  - [x] Social Features API
- [x] Phase 5: 프론트엔드 통합 (완료!)
  - [x] API 클라이언트 생성
  - [x] 레거시 API 래퍼 업데이트
  - [x] 환경 변수 설정 가이드 작성
- [ ] Phase 6: 테스트
- [ ] Phase 7: Railway 정리

### 📝 주의사항

1. **병렬 운영**: 마이그레이션 완료까지 Railway와 Supabase 병렬 운영
2. **데이터 동기화**: 실제 마이그레이션 전까지 데이터 변경 주의
3. **환경 변수**: 새 Supabase 변수와 기존 Railway 변수 구분
4. **롤백 대비**: 모든 Railway 코드는 마이그레이션 검증 후 제거

### 🎯 다음 작업

Exhibition API를 Vercel Functions로 구현합니다.