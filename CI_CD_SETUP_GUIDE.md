# SAYU CI/CD 파이프라인 설정 가이드

이 가이드는 SAYU 프로젝트의 GitHub Actions 기반 CI/CD 파이프라인을 설정하는 방법을 설명합니다.

## 🔧 GitHub Secrets 설정

### 1. GitHub Repository Settings
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭하여 아래 secrets 추가

### 2. 필수 Secrets 목록

#### 🗄️ Database & Backend Core
```
DATABASE_URL=your-database-url-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_KEY=your-supabase-service-key-here
SUPABASE_JWT_SECRET=your-supabase-jwt-secret-here
```

#### 🔐 Security Keys
```
JWT_SECRET=your-jwt-secret-key-here-minimum-64-chars
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-here-minimum-64-chars
SESSION_SECRET=your-session-secret-key-here-minimum-64-chars
```

#### 🤖 AI Services
```
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
REPLICATE_API_TOKEN=your-replicate-api-token-here
```

#### ☁️ Cloud Services
```
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

#### 📍 Location Services
```
GOOGLE_PLACES_API_KEY=your-google-places-api-key  
FOURSQUARE_API_KEY=your-foursquare-api-key
```

#### 🚀 Deployment Services
```
RAILWAY_TOKEN=생성필요
VERCEL_TOKEN=생성필요
VERCEL_ORG_ID=생성필요
VERCEL_PROJECT_ID=생성필요
```

#### 🌐 App Configuration
```
PORT=3002
FRONTEND_URL=https://sayu.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://hgltvdshuyfffskvjmst.supabase.co  
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.4R8eEGXOmnyJh6qGLKSzPyJOKBkZPOKsNI4-OZzg2w8
NEXT_PUBLIC_APP_URL=https://sayu.vercel.app
```

## 🏗️ Deployment Tokens 생성

### 1. Railway Token 생성
1. [Railway](https://railway.app) 로그인
2. Account Settings → Tokens → Create Token
3. `RAILWAY_TOKEN`에 추가

### 2. Vercel Token 생성  
1. [Vercel](https://vercel.com) 로그인
2. Settings → Tokens → Create Token
3. `VERCEL_TOKEN`에 추가

### 3. Vercel Project IDs
```bash
# Vercel CLI 설치 및 로그인
npm i -g vercel
vercel login

# 프로젝트 정보 확인
cd frontend
vercel link
```

프로젝트 링크 후 `.vercel/project.json`에서 확인:
- `VERCEL_ORG_ID`: orgId 값
- `VERCEL_PROJECT_ID`: projectId 값

## 📊 CI/CD Pipeline 구조

### 🔄 Workflow 파일들

#### 1. Backend Deploy (`backend-deploy.yml`)
- **트리거**: `backend/` 폴더 변경 시
- **과정**: 
  - ESLint 검사 (최대 200 warnings)
  - Jest 테스트 실행
  - Railway 자동 배포
- **환경**: Railway

#### 2. Frontend Deploy (`frontend-deploy.yml`)  
- **트리거**: `frontend/` 폴더 변경 시
- **과정**:
  - TypeScript 컴파일 검사
  - ESLint 검사 (최대 100 warnings)
  - Next.js 빌드 테스트
  - Vercel 자동 배포
  - Lighthouse 성능 테스트
- **환경**: Vercel

#### 3. PR Quality Check (`pr-check.yml`)
- **트리거**: Pull Request 생성/업데이트
- **과정**:
  - 변경된 파일 감지
  - 백엔드/프론트엔드 선택적 테스트
  - CodeQL 보안 분석
  - npm audit 취약점 검사
  - PR 코멘트로 결과 요약

## 🚦 배포 흐름

### 자동 배포 (Production)
```
main 브랜치 push → 테스트 → 배포 → 알림
```

### PR 검토 과정
```
PR 생성 → 품질 검사 → 코드 리뷰 → merge → 자동 배포
```

## 📈 모니터링 & 알림

### Lighthouse 성능 체크
- **성능**: 80% 이상 (warning)
- **접근성**: 90% 이상 (error)
- **SEO**: 90% 이상 (warning)
- **PWA**: 80% 이상 (warning)

### 코드 품질 기준
- **Backend ESLint**: 최대 200 warnings
- **Frontend ESLint**: 최대 100 warnings  
- **TypeScript**: 0 errors
- **Tests**: 100% pass required

## 🔧 로컬 테스트

### Backend 테스트
```bash
cd backend
npm test
npm run lint
```

### Frontend 테스트  
```bash
cd frontend
npm run build
npm run lint
npx tsc --noEmit
```

### API 연결 테스트
```bash
cd backend
node test-api-connections.js
```

## 🆘 문제 해결

### 일반적인 CI/CD 이슈

#### 1. Build Timeout
- **문제**: 빌드가 시간 초과로 실패
- **해결**: 
  - 의존성 캐싱 확인
  - 빌드 프로세스 최적화
  - GitHub Actions 제한시간 확인

#### 2. Environment Variables Missing
- **문제**: 환경 변수 오류
- **해결**:
  - GitHub Secrets 설정 확인
  - Workflow 파일의 env 섹션 확인
  - 변수명 오타 확인

#### 3. Deployment Failed
- **문제**: Railway/Vercel 배포 실패
- **해결**:
  - 토큰 유효성 확인
  - 서비스 상태 확인
  - 로그 분석

### 성능 최적화 팁

#### GitHub Actions 최적화
- 의존성 캐싱 활용
- 병렬 작업 최대한 활용
- 필요한 작업만 실행 (path filters)

#### 빌드 시간 단축
- `.dockerignore` 최적화
- 불필요한 파일 제외
- 캐시 전략 개선

## 🔄 업데이트 가이드

### Secrets 업데이트
1. GitHub Repository → Settings → Secrets
2. 기존 secret 수정 또는 새로 추가
3. Workflow 재실행으로 확인

### Workflow 수정
1. `.github/workflows/` 파일 편집
2. main 브랜치에 push
3. Actions 탭에서 실행 확인

---

## 🎯 다음 단계

CI/CD 설정 완료 후:
1. ✅ **ESLint 설정** (완료)
2. ✅ **빌드 오류 해결** (완료)  
3. ✅ **환경 변수 설정** (완료)
4. 🔧 **CI/CD 파이프라인** (이 가이드)
5. 📊 **모니터링 연결** (다음)
6. 🌐 **도메인 & SSL** (다음)

이 가이드를 따라 설정하면 SAYU가 완전히 자동화된 배포 파이프라인을 갖게 됩니다!