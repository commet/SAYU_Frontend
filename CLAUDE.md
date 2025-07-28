# SAYU Project Context for Claude

## Project Philosophy & Core Values
SAYU는 단순한 예술 추천 플랫폼이 아닌, 사용자의 내면과 예술을 연결하는 관계 중심 플랫폼입니다. 모든 기능은 사용자의 존엄성과 공감을 최우선으로 설계되어야 합니다.

### 핵심 설계 원칙
- **다층적 감정 모델**: 단순 긍정/부정이 아닌 복잡하고 미묘한 감정 상태 반영
- **16가지 개성 존중**: 각 APT 유형별 고유한 UX/UI와 인터랙션 패턴 구현
- **관계의 깊이**: 표면적 매칭이 아닌 의미 있는 연결 형성
- **공동 창작**: 사용자가 플랫폼과 함께 성장하는 참여적 설계

### 개발 철학
- **완전한 구현**: "TODO" 나 placeholder 없는 실제 동작하는 코드
- **적응적 설계**: 사용자 유형과 상황에 따라 변화하는 인터페이스
- **분산 자율성**: 중앙집중식이 아닌 사용자 주도의 경험 설계

## Project Overview
SAYU는 성격 유형과 예술 선호도를 연결하는 Art Life Platform으로, 사용자의 내면적 성향을 16가지 동물 캐릭터로 표현하고 이를 바탕으로 깊이 있는 예술 경험을 제공합니다.

## Important Files
- `/REQUIREMENTS.md` - 전체 기술 요구사항 문서
- `/backend/package.json` - 백엔드 의존성
- `/frontend/package.json` - 프론트엔드 의존성
- `/backend/.env.example` - 환경 변수 템플릿
- `/SECURITY_IMPROVEMENTS.md` - 보안 개선 사항

## Deployment Architecture
- **Frontend**: Vercel (Next.js 자동 배포)
- **Backend**: Railway (Node.js Express 서버)
- **Database**: PostgreSQL with pgvector (Railway)
- **Cache**: Redis (Railway)
- **CDN/Images**: Cloudinary
- **Monitoring**: Sentry
- **Future**: Supabase 마이그레이션 계획

## Key Technologies
- **Backend**: Node.js, Express, PostgreSQL (pgvector), Redis, JWT, OAuth
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **AI**: OpenAI API, Google Generative AI, Replicate API
- **Security**: Rate limiting, CSRF protection, XSS defense

## 주요 기능별 구현 가이드

### APT (Art Personality Test) 시스템
```javascript
// 각 유형별 테마 예시
const aptThemes = {
  'INFP_호랑이': {
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4' },
    animations: 'gentle-float',
    interactionPattern: 'exploratory',
    emotionalDepth: 'high',
    uiDensity: 'minimal'
  },
  // ... 16개 유형 각각 고유 테마
};
```
- 4축 기반 심층 질문으로 16가지 동물 캐릭터 분류
- 각 유형별 차별화된 시각적 테마와 인터랙션 패턴
- 사용자 여정에 따른 적응적 UI 변화

### 감정 상태 시스템
```javascript
const emotionalState = {
  primary: 'curious',      // 주 감정
  secondary: 'peaceful',   // 부 감정
  intensity: 0.7,          // 감정 강도
  volatility: 0.3,         // 변동성
  context: 'viewing_monet', // 상황 맥락
  history: [...]           // 감정 변화 이력
};
```

### 관계 깊이 측정
```javascript
const relationshipDepth = {
  interactionFrequency: 0.6,    // 상호작용 빈도
  emotionalResonance: 0.8,      // 감정적 공명
  sharedExperiences: 12,        // 공유 경험 수
  conversationDepth: 0.7,       // 대화 깊이
  mutualGrowth: 0.5            // 상호 성장도
};
```

### 퍼셉션 익스체인지 (감상 교환)
- 동일 작품에 대한 다층적 해석 공유
- 익명/실명 단계적 공개 시스템
- 감상에 대한 감상 (메타 레벨 상호작용)
- 대화 깊이를 자연스럽게 유도하는 UI

### 실시간 갤러리 동시 관람
```javascript
const sharedGallerySession = {
  participants: ['user1', 'user2'],
  currentArtwork: 'artworkId',
  emotionalStates: {
    user1: { primary: 'curious', secondary: 'peaceful' },
    user2: { primary: 'nostalgic', secondary: 'inspired' }
  },
  sharedNotes: [],
  synchronizedView: true,
  voiceChannel: 'optional'
};
```

### 전시 동행 매칭 시스템
```javascript
const matchingAlgorithm = async (userId) => {
  // 1단계: APT 호환성 필터링 (대규모)
  const compatibleTypes = await getCompatibleAPTTypes(userId);
  
  // 2단계: 위치 기반 필터링
  const nearbyUsers = await filterByLocation(compatibleTypes);
  
  // 3단계: 활동 시간대 매칭
  const timeCompatible = filterByActiveHours(nearbyUsers);
  
  // 4단계: 심층 매칭 점수 계산 (소수 후보군)
  const deepScores = await calculateDeepMatchScores(timeCompatible);
  
  // 5단계: 상호 선호도 학습 반영
  return applyMutualPreferenceLearning(deepScores);
};
```

## 보안 가이드라인
- ✅ 모든 API 키는 환경 변수로 관리
- ✅ 파일 업로드 시 타입, 크기, 내용 검증
- ✅ SQL 인젝션 방지 (파라미터화된 쿼리)
- ✅ JWT 토큰 갱신 및 만료 처리
- ✅ XSS, CSRF 공격 방어 구현
- ✅ Rate limiting으로 API 남용 방지
- ⚠️ 민감 데이터 암호화 저장 (진행 중)

## 성능 최적화
- **알고리즘**: O(n²) → O(n) 최적화 (Daily Challenge)
- **캐싱**: Redis 활용한 응답 속도 개선
- **메모리**: Node.js 프로세스 메모리 제한 설정
- **비동기**: 병렬 처리로 응답 시간 단축

## 환경 변수

### Backend (.env)
```
# 필수
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]
JWT_SECRET=your-secret-key-minimum-32-chars
OPENAI_API_KEY=sk-your-openai-api-key

# AI 서비스
REPLICATE_API_TOKEN=your-replicate-api-token
GOOGLE_AI_API_KEY=your-google-ai-api-key

# 선택
REDIS_URL=redis://localhost:6379
SENTRY_DSN=https://your-sentry-dsn

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 보안
CSRF_SECRET=your-csrf-secret-key
SESSION_SECRET=your-session-secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Commands
```bash
<<<<<<< HEAD
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

## 🚨 CRITICAL DATABASE STATUS (미래 Claude 필독!)
- **✅ Railway → Supabase 완전 마이그레이션 완료 (2025년 7월 28일)**
- **커밋 69a85f5**: "23개 테이블 5,793개 레코드" 100% 이관 완료
- **84% 비용 절감 달성** (월 $45 → $7)
- **모든 백엔드 코드는 이미 Supabase 연동 완료됨**
- **⚠️ IMPORTANT**: `.env` 파일은 `.gitignore`에 있어 각 환경별 수동 설정 필요
- **실제 확인 방법**: `cd backend && node -e "const {createClient} = require('@supabase/supabase-js'); console.log('Supabase 작동 중!')"`
- **절대 혼동하지 말 것**: Railway 연결 실패 = 환경 변수 문제, 마이그레이션은 완료됨

- **⚠️ IMPORTANT: venues 테이블이 global_venues로 통합됨 (2025년 1월)**
  - 모든 새 코드는 global_venues 테이블 사용
  - 상세 가이드: `/backend/VENUE_TABLE_MIGRATION_GUIDE.md`

## Important Considerations
1. Frontend와 Backend가 분리된 서버에서 실행됨
2. CORS 설정 필수
3. 환경 변수는 각 플랫폼에서 별도 관리
4. 이미지는 Cloudinary CDN 사용
5. 프론트엔드는 SSR/SSG 혼합 사용
6. API 엔드포인트는 인증 토큰 필요
7. **venues 테이블 대신 global_venues 사용 (통합 완료)**

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
=======
>>>>>>> 387884c5e2dc7dc27995f48a8e33a2a1e7032884
# Backend
cd backend
npm run dev              # 개발 서버 (nodemon)
npm start               # 프로덕션
npm test                # 테스트 실행
npm run db:setup        # DB 초기화
npm run db:migrate      # 마이그레이션

# Frontend  
cd frontend
npm run dev             # 개발 서버
npm run build:vercel    # Vercel 빌드
npm run lint            # ESLint
npm run typecheck       # TypeScript 체크

# 메모리 제한 실행
NODE_OPTIONS='--max-old-space-size=2048' npm run dev
```

## 중요 파일 구조

### 핵심 기능별 위치
```
/backend
  /src
    /services
      aptCacheService.js      # APT 캐싱 시스템
      artProfileService.js    # AI 아트 프로필
      perceptionService.js    # 감상 교환
      matchingService.js      # 전시 동행 매칭
    /middleware
      rateLimiter.js         # API 제한
      csrfProtection.js      # CSRF 방어
      xssProtection.js       # XSS 방어
      
/frontend
  /components
    /perception-exchange     # 감상 교환 UI
    /apt-quiz               # 성격 테스트
    /gallery                # 갤러리 컴포넌트
    /exhibition-companion   # 전시 동행
  /lib
    /api                    # API 클라이언트
  /types                    # TypeScript 타입
```

## 아키텍처 개선 계획

### 단기 (1-2개월)
- [ ] Supabase 마이그레이션 완료
- [ ] 테스트 커버리지 80% 달성
- [ ] 성능 모니터링 대시보드 구축
- [ ] 메모리 최적화 완료

### 중기 (3-6개월)
- [ ] 마이크로서비스 아키텍처 전환
- [ ] GraphQL API 도입
- [ ] 실시간 기능 WebSocket 구현
- [ ] 모바일 앱 개발 (React Native)

### 장기 (6-12개월)
- [ ] AI 기반 큐레이션 고도화
- [ ] AR/VR 갤러리 체험
- [ ] 블록체인 작품 인증
- [ ] 글로벌 확장 (다국어)

## 커밋 규칙
```bash
# 형식: <type>(<scope>): <subject>

feat: 새로운 기능
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
perf: 성능 개선
test: 테스트 추가
chore: 기타 변경사항

# 예시
feat(perception): 감상 교환 익명 모드 추가
fix(auth): JWT 토큰 만료 처리 수정
perf(gallery): 이미지 lazy loading 구현
```

## 문제 해결 가이드

### 메모리 누수
```bash
# 프로세스 확인
tasklist | findstr node

# 메모리 사용량 확인
wmic process where "name='node.exe'" get ProcessId,WorkingSetSize

# 프로세스 정리
wmic process where "name='node.exe' and WorkingSetSize > 1000000000" delete
```

### 데이터베이스 연결
- Supabase 연결 실패 시 Railway PostgreSQL 사용
- 연결 풀 크기 조정 (max: 20)
- SSL 설정 확인

### CORS 이슈
- 개발: localhost:3001 허용
- 프로덕션: Vercel 도메인 설정
- credentials: true 필수

## 모니터링 & 로깅
- **APM**: Sentry (에러 추적)
- **로그**: Winston (구조화된 로깅)
- **메트릭**: Prometheus + Grafana
- **알림**: Slack 웹훅 연동

## 테스트 전략
- **단위 테스트**: Jest (목표: 80%)
- **통합 테스트**: Supertest
- **E2E 테스트**: Playwright
- **부하 테스트**: k6

## Contact & Support
- GitHub Issues: 버그 리포트 및 기능 제안
- Discord: 실시간 커뮤니티 지원
- Email: support@sayu.art