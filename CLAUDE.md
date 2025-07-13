# SAYU Project Context for Claude

## Project Overview
SAYU는 성격 유형과 예술 선호도를 연결하는 Art Life Platform입니다. 사용자의 성격을 분석하여 맞춤형 미술관 경험을 제공하고 예술 감상 커뮤니티를 구축합니다.

## Important Files
- `/REQUIREMENTS.md` - 전체 기술 요구사항 문서
- `/backend/package.json` - 백엔드 의존성
- `/frontend/package.json` - 프론트엔드 의존성
- `/backend/.env.example` - 환경 변수 템플릿

## Deployment Architecture
- **Frontend**: Vercel (Next.js 자동 배포)
- **Backend**: Railway (Node.js Express 서버)
- **Database**: PostgreSQL with pgvector (Railway)
- **Cache**: Redis (Railway)
- **CDN/Images**: Cloudinary
- **Monitoring**: Sentry

## Key Technologies
- **Backend**: Node.js, Express, PostgreSQL (pgvector), Redis, JWT, OAuth
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **AI**: OpenAI API, Google Generative AI, Replicate API

## 현재 구현된 주요 기능

### 백엔드
- 사용자 인증 (JWT + OAuth)
- MBTI 기반 퀴즈 시스템
- AI 아트 프로필 생성 (Replicate API)
- 박물관 API 통합 (Met, Cleveland, Rijksmuseum)
- 이메일 자동화 (크론 작업)
- 팔로우 시스템
- 추천 엔진

### 프론트엔드
- 퀴즈 인터페이스
- 프로필 관리
- 아트워크 갤러리
- 팔로우 기능 UI
- AI 아트 프로필 생성기

## 환경 변수

### Backend (.env)
```
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]
REPLICATE_API_TOKEN=your-replicate-api-token
OPENAI_API_KEY=your-openai-api-key
JWT_SECRET=your-secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 중요 파일 위치

### AI 아트 프로필 기능
- Backend Service: `/backend/src/services/artProfileService.js`
- Backend Controller: `/backend/src/controllers/artProfileController.js`
- Backend Routes: `/backend/src/routes/artProfileRoutes.js`
- Frontend Component: `/frontend/components/art-profile/ArtProfileGenerator.tsx`
- Frontend Types: `/frontend/types/art-profile.ts`

### 팔로우 시스템
- Frontend Types: `/frontend/types/follow.ts`
- Frontend API: `/frontend/lib/follow-api.ts`
- Frontend Component: `/frontend/components/follow/FollowButton.tsx`

## Development Commands
```bash
# Backend (Railway)
cd backend
npm run dev        # 로컬 개발 서버
npm start         # 프로덕션 (sayu-living-server.js)
npm test          # 테스트 실행
npm run db:setup  # 데이터베이스 설정

# Frontend (Vercel)
cd frontend
npm run dev       # 로컬 개발 서버
npm run build:vercel  # Vercel 빌드
npm run lint      # 린팅 체크
npm run typecheck # 타입 체크
```

## 계획된 아키텍처 변경 (미구현)

### Supabase 마이그레이션
- 문서: `/backend/OPTIMAL_ARCHITECTURE.md`
- 설정 가이드: `/SUPABASE_SETUP_GUIDE.md`
- 마이그레이션 계획: `/MIGRATION_PLAN.md`

### 목표
1. Supabase로 DB + Auth + Storage 이전
2. Vercel Edge Functions로 API 이전
3. Railway는 크론 작업만 유지
4. 비용 75% 절감

### 구현 상태
- ✅ 설계 완료
- ✅ 코드 샘플 작성
- ❌ 실제 마이그레이션 미완료

## Deployment Process
### Frontend (Vercel)
- main 브랜치 push 시 자동 배포
- 환경 변수는 Vercel 대시보드에서 관리
- `SKIP_ENV_VALIDATION=true` 설정 필요

### Backend (Railway)
- Railway CLI 또는 GitHub 연동으로 배포
- `sayu-living-server.js`가 엔트리 포인트
- 환경 변수는 Railway 대시보드에서 관리

## Architecture Notes
- Monorepo 구조 (frontend, backend 분리)
- Frontend와 Backend는 별도 서버에 배포
- CORS 설정으로 cross-origin 요청 처리
- JWT 기반 인증 시스템
- Redis 캐싱 전략 사용
- 16가지 동물 캐릭터로 성격 유형 표현
- 다국어 지원 (한국어/영어)

## API Communication
- Frontend (Vercel) → Backend (Railway) API 호출
- Backend URL은 환경 변수로 관리
- 모든 API 요청은 HTTPS 사용

## Current Status
- 성격 테스트 시스템 구현 완료
- 미술관 API 연동 진행 중
- 커뮤니티 기능 개발 중
- AI 상담 기능 베타 테스트 중
- AI 아트 프로필 기능 구현 완료
- 팔로우 시스템 백엔드 구현 완료

## Important Considerations
1. Frontend와 Backend가 분리된 서버에서 실행됨
2. CORS 설정 필수
3. 환경 변수는 각 플랫폼에서 별도 관리
4. 이미지는 Cloudinary CDN 사용
5. 프론트엔드는 SSR/SSG 혼합 사용
6. API 엔드포인트는 인증 토큰 필요

## Git 커밋 시
```bash
git add .
git commit -m "feat: 기능 설명"
git push

# 커밋 메시지 규칙
# feat: 새 기능
# fix: 버그 수정
# refactor: 리팩토링
# docs: 문서 수정
# style: 코드 스타일 변경
```

## 테스트 명령어
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# 데이터베이스 테스트
node test-art-profile.js
```

## 문제 해결

### "Module not found" 오류
```bash
npm install [missing-module]
```

### 데이터베이스 연결 실패
- DATABASE_URL 확인
- Railway 서비스 상태 확인

### CORS 오류
- Backend CORS 설정 확인
- Frontend API URL 확인

## Testing
- Backend: Jest + Supertest
- Frontend: React Testing Library (준비 중)
- E2E: Playwright (계획 중)

## Monitoring
- Vercel Analytics (Frontend)
- Railway Metrics (Backend)
- Sentry (Both)

## Artvee Crawler 프로젝트
현재 진행 중인 작업: Artvee.com 공개 도메인 예술 작품 수집
- 위치: `/artvee-crawler/`
- 상세 문서: `/artvee-crawler/CRAWLER_SETUP.md`
- 목표: 1,000개 작품 수집 및 SAYU 통합
- 진행 상황: URL 수집 스크립트 작성 완료, 크롤링 대기 중

# Contact
프로젝트 관련 질문이나 이슈는 GitHub Issues에 등록해주세요.