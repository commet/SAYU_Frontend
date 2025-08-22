# SAYU 배포 환경 변수 설정 가이드 (Supabase Only)

## Vercel (Frontend) 환경 변수

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hgltvdshuyfffskvjmst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk

# AI APIs (직접 사용 시 - 옵션)
NEXT_PUBLIC_HUGGINGFACE_API_KEY=your-huggingface-api-key
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_REPLICATE_API_KEY=your-replicate-api-key

# Google AI
GOOGLE_AI_API_KEY=AIzaSyCA5z8z1mM34zfMBl0ymB7MLaHJFO3LGGI

# OAuth
NEXT_PUBLIC_KAKAO_CLIENT_ID=b77d30526259fe07dc988dddbb7b6c91
NEXT_PUBLIC_KAKAO_CLIENT_SECRET=zNfQPM1kzDs8zKCB4oOJprvbpU4r0yml
NEXT_PUBLIC_APP_URL=https://sayu.vercel.app
```

## Supabase Edge Functions 환경 변수

Supabase 대시보드 > Edge Functions > Settings에서 다음 환경 변수를 설정하세요:

```bash
# Replicate API (중요!)
REPLICATE_API_KEY=your-replicate-api-key
```

## Supabase Edge Function 배포

1. Supabase CLI 설치:
```bash
npm install -g supabase
```

2. Supabase 프로젝트 링크:
```bash
supabase link --project-ref hgltvdshuyfffskvjmst
```

3. Edge Function 배포:
```bash
supabase functions deploy generate-art
```

## 중요 사항

### 1. API 키 보안
- 프로덕션 환경에서는 실제 API 키를 사용하세요
- 절대 GitHub에 API 키를 커밋하지 마세요
- Replicate API 키는 Supabase Edge Functions 환경 변수에만 설정

### 2. CORS 설정
Supabase Edge Functions는 자동으로 CORS를 처리합니다:
- 모든 도메인에서 접근 가능 (개발 편의를 위해)
- 프로덕션에서는 특정 도메인만 허용하도록 수정 권장

### 3. 배포 순서
1. Supabase Edge Function 배포 (`supabase functions deploy generate-art`)
2. Supabase 대시보드에서 환경 변수 설정 (REPLICATE_API_KEY)
3. Vercel에 프론트엔드 배포

### 4. 환경별 URL
- **개발 환경**
  - Frontend: `http://localhost:3000`
  - Supabase Edge Functions: `http://localhost:54321/functions/v1`
  - 로컬 백엔드 (옵션): `http://localhost:3007`

- **프로덕션 환경**
  - Frontend: `https://sayu.vercel.app`
  - Supabase Edge Functions: `https://hgltvdshuyfffskvjmst.supabase.co/functions/v1`

### 5. AI Art Profile 기능
Replicate API를 통한 이미지 생성이 Supabase Edge Functions를 통해 작동합니다:
- Frontend → Supabase Edge Function (`/functions/v1/generate-art`) → Replicate API
- CORS 문제 없이 안전하게 작동
- 이미지는 base64로 전송 (최대 50MB)
- Supabase Edge Functions의 무료 티어: 500,000 호출/월

### 6. 트러블슈팅
- **CORS 오류**: Supabase Edge Function의 corsHeaders 확인
- **API 키 오류**: Supabase 대시보드에서 환경 변수 확인
- **Function not found**: Edge Function이 배포되었는지 확인
- **Timeout 오류**: Edge Function은 최대 150초까지 실행 가능