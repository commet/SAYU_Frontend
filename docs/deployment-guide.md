# SAYU 프로덕션 배포 가이드

## 🚀 배포 구조 이해하기

### 현재 vs 프로덕션 구조

```
[현재 로컬 구조]
localhost:3000 (Next.js) → localhost DB → 로컬 API

[프로덕션 구조]
vercel.app (Next.js) → Supabase DB → Vercel Functions
```

## 📌 핵심 질문: "Supabase만으로 가능한가?"

**답: NO, Next.js 서버가 필요합니다!**

### 각 서비스의 역할:

| 서비스 | 역할 | 필수 여부 |
|--------|------|----------|
| **Supabase** | 데이터베이스, 인증, 스토리지 | ✅ 필수 |
| **Vercel** | Next.js 호스팅, 페이지 렌더링, API Routes | ✅ 필수 |
| **Express 서버** | 크롤링, 복잡한 백엔드 작업 | ⚠️ 선택적 |

## 🎯 즉시 배포 가능한 방법 (무료)

### 1단계: Vercel 계정 생성 및 연결

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
cd frontend
vercel
```

### 2단계: 환경변수 설정

Vercel Dashboard (https://vercel.com/dashboard) 에서:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hgltvdshuyfffskvjmst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# AI APIs
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AIza...
REPLICATE_API_TOKEN=r8_...

# OAuth (선택)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
KAKAO_CLIENT_ID=...
INSTAGRAM_CLIENT_ID=...
```

### 3단계: 배포

```bash
# 프로덕션 배포
vercel --prod

# 또는 GitHub 연결 후 자동 배포
# Settings > Git > Connect GitHub Repository
```

## 💰 비용 구조

### 완전 무료 옵션 (시작용)
- **Vercel Hobby**: $0/월 (개인 프로젝트)
- **Supabase Free**: $0/월 (500MB DB, 1GB 스토리지)
- **총 비용**: $0/월

### 프로 옵션 (추천)
- **Vercel Pro**: $20/월 (팀 협업, 더 긴 함수 실행)
- **Supabase Pro**: $25/월 (8GB DB, 100GB 스토리지)
- **총 비용**: $45/월

## 🔧 기능별 배포 위치

### Vercel에서 실행 (Next.js API Routes)
✅ 가능한 것들:
- `/api/quiz/*` - 퀴즈 분석
- `/api/artworks` - 작품 데이터
- `/api/dashboard/stats` - 대시보드 통계
- `/api/ai-council` - AI 상담
- `/api/auth/*` - 인증 처리

⚠️ 제한사항:
- 실행 시간: 10초 (Hobby), 60초 (Pro)
- 메모리: 1024MB (Hobby), 3008MB (Pro)

### Supabase Edge Functions
✅ 이미 구현된 함수들:
- `calculate-apt-compatibility` - 성격 호환성
- `calculate-daily-matches` - 매칭 알고리즘
- `manage-art-pulse` - 아트 펄스

### 별도 백엔드 필요 (Railway/Render)
❌ 분리 필요한 기능:
- 웹 크롤링 (Puppeteer)
- 대용량 이미지 처리
- 정기 크론 작업

## 📝 실제 배포 체크리스트

### 배포 전 확인사항:

- [ ] `.env.local` 파일의 모든 환경변수 확인
- [ ] `package.json` 스크립트 확인
- [ ] 데이터베이스 마이그레이션 실행
- [ ] 이미지 최적화 설정
- [ ] 캐싱 전략 설정

### 배포 명령어:

```bash
# 1. 빌드 테스트
cd frontend
npm run build

# 2. 환경변수 확인
vercel env pull

# 3. 프로덕션 배포
vercel --prod

# 4. 도메인 연결 (선택)
vercel domains add sayu.my
```

## 🚨 자주 묻는 질문

### Q: Railway에 있는 백엔드 서버는 어떻게 하나요?
A: 처음에는 무시하고 Vercel만으로 시작하세요. 크롤링이 필요하면 나중에 추가.

### Q: Redis 캐싱은 어떻게 하나요?
A: Vercel KV(무료 제공) 또는 Upstash Redis(무료 플랜) 사용

### Q: 이미지는 어디에 저장하나요?
A: Supabase Storage 또는 Cloudinary(무료 플랜)

### Q: 실시간 기능은 작동하나요?
A: Supabase Realtime이 Vercel에서도 잘 작동합니다.

## 🎉 5분 안에 배포하기

```bash
# 1. Vercel CLI 설치 (1분)
npm i -g vercel

# 2. 배포 시작 (2분)
cd frontend
vercel

# 3. 환경변수 설정 (2분)
# Vercel Dashboard에서 설정

# 완료! 🚀
```

배포 URL: `https://sayu-[random].vercel.app`

## 📊 성능 최적화 팁

1. **정적 생성 활용**
   ```typescript
   // 정적 페이지는 빌드 시 생성
   export const dynamic = 'force-static'
   ```

2. **ISR 활용**
   ```typescript
   // 1시간마다 재생성
   export const revalidate = 3600
   ```

3. **Edge Runtime 사용**
   ```typescript
   // API Routes에서
   export const runtime = 'edge'
   ```

## 🔗 유용한 링크

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://app.supabase.com)
- [배포 상태 확인](https://vercel.com/[your-team]/sayu)

---

**요약**: Supabase(DB) + Vercel(서버) = 완전한 웹 애플리케이션 ✅

Supabase만으로는 페이지를 렌더링하고 서빙할 서버가 없어서 불가능합니다. 
Vercel이 그 역할을 해줍니다!