# 🏗️ SAYU 최적화 백엔드 아키텍처

## 📋 현재 상황 분석

### 사용 중인 서비스:
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway (Node.js Express)
- **Database**: Railway PostgreSQL
- **외부 API**: OpenAI, Replicate, Museum APIs
- **기타**: Redis, Email, OAuth

### 주요 문제점:
1. 모든 기능이 하나의 Express 서버에 집중
2. 서버리스로 이전 가능한 기능들이 많음
3. 비용 최적화 필요
4. 관리 복잡도가 높음

## 🎯 최적화된 하이브리드 아키텍처

### 1️⃣ **Supabase** (데이터베이스 + 인증 + 스토리지)
- PostgreSQL 데이터베이스
- 사용자 인증 (이메일, OAuth)
- 파일 스토리지 (프로필 이미지, 아트 이미지)
- 실시간 구독
- Edge Functions (Deno)

### 2️⃣ **Vercel** (프론트엔드 + Edge Functions)
- Next.js 앱 호스팅
- Edge Functions:
  - AI 아트 프로필 생성 (Replicate API)
  - 간단한 OpenAI API 호출
  - 박물관 API 검색

### 3️⃣ **Railway** (백그라운드 작업만)
- 크론 작업 (이메일 자동화)
- 박물관 데이터 동기화
- 복잡한 배치 처리
- Redis 캐싱

## 🔄 서비스별 기능 분배

### **Supabase로 이전**
```
✅ 사용자 관리 (users 테이블)
✅ 인증 (Auth)
✅ 파일 업로드 (Storage)
✅ 기본 CRUD API (자동 생성)
✅ 실시간 기능 (Realtime)
✅ RLS (Row Level Security)
```

### **Vercel Edge Functions**
```
✅ /api/art-profile - AI 아트 생성
✅ /api/quiz-analysis - 퀴즈 분석
✅ /api/recommendations - 추천 API
✅ /api/museum-search - 박물관 검색
```

### **Railway 유지**
```
✅ 이메일 크론 작업
✅ 박물관 데이터 동기화
✅ 복잡한 분석 작업
✅ Redis 캐싱 서버
```

## 📊 아키텍처 다이어그램

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  Next.js App    │────▶│  Vercel Edge     │────▶│   External      │
│   (Vercel)      │     │   Functions      │     │     APIs        │
│                 │     │                  │     │                 │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │                                                 
         │              ┌──────────────────┐              
         └─────────────▶│                  │              
                        │    Supabase      │              
                        │  - PostgreSQL    │              
                        │  - Auth          │              
                        │  - Storage       │              
                        │  - Realtime      │              
                        └────────┬─────────┘              
                                 │                        
                        ┌────────▼─────────┐              
                        │                  │              
                        │  Railway Worker  │              
                        │  - Cron Jobs     │              
                        │  - Batch Process │              
                        │  - Redis Cache   │              
                        └──────────────────┘              
```

## 💰 비용 최적화

### 현재 (월간 예상)
- Railway: $20-50
- Vercel: $0 (무료)
- 총: $20-50

### 최적화 후 (월간 예상)
- Supabase: $0 (무료 티어)
- Vercel: $0 (무료 티어)
- Railway: $5-10 (최소화)
- 총: $5-10

**절감액: 월 $15-40 (75% 절감)**

## 🚀 구현 단계

### Phase 1: Supabase 설정 (1주)
1. Supabase 프로젝트 생성
2. 데이터베이스 마이그레이션
3. Auth 설정
4. Storage 버킷 생성
5. RLS 정책 설정

### Phase 2: Edge Functions 이전 (1주)
1. Vercel Edge Functions 설정
2. AI 아트 프로필 API 이전
3. 퀴즈 분석 API 이전
4. 추천 API 이전

### Phase 3: Railway 최소화 (3일)
1. 크론 작업만 남기기
2. 불필요한 라우트 제거
3. 메모리 사용량 최적화

### Phase 4: 프론트엔드 통합 (3일)
1. Supabase 클라이언트 설정
2. API 엔드포인트 변경
3. 인증 플로우 업데이트

## 🔧 기술 스택 변경

### Before
```
- Express.js (모든 API)
- Passport.js (인증)
- PostgreSQL (직접 연결)
- Multer (파일 업로드)
- node-cron (스케줄링)
```

### After
```
- Supabase (DB + Auth + Storage)
- Vercel Edge (서버리스 API)
- Railway (크론 전용)
- @supabase/js (클라이언트)
- Deno (Edge Functions)
```

## 📝 마이그레이션 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 마이그레이션
- [ ] 사용자 데이터 마이그레이션
- [ ] Storage 버킷 설정
- [ ] Edge Functions 작성
- [ ] API 엔드포인트 테스트
- [ ] 프론트엔드 통합
- [ ] Railway 서비스 축소
- [ ] 모니터링 설정
- [ ] 성능 테스트

## 🎯 최종 목표

1. **비용 75% 절감**
2. **관리 복잡도 50% 감소**
3. **성능 향상** (Edge 배포)
4. **확장성 개선**
5. **개발 속도 향상**