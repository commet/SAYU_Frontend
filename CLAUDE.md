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
- **AI**: OpenAI API, Google Generative AI

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
```

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

## Important Considerations
1. Frontend와 Backend가 분리된 서버에서 실행됨
2. CORS 설정 필수
3. 환경 변수는 각 플랫폼에서 별도 관리
4. 이미지는 Cloudinary CDN 사용
5. 프론트엔드는 SSR/SSG 혼합 사용
6. API 엔드포인트는 인증 토큰 필요

## Testing
- Backend: Jest + Supertest
- Frontend: React Testing Library (준비 중)
- E2E: Playwright (계획 중)

## Monitoring
- Vercel Analytics (Frontend)
- Railway Metrics (Backend)
- Sentry (Both)

## Contact
프로젝트 관련 질문이나 이슈는 GitHub Issues에 등록해주세요.