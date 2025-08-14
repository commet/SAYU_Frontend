# SAYU 배포 가이드

## 1. Vercel 환경 변수 설정

### Vercel 대시보드에서 설정하기
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. SAYU 프로젝트 선택
3. Settings → Environment Variables 이동
4. 다음 환경 변수 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://hgltvdshuyfffskvjmst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.4R8eEGXOmnyJh6qGLKSzPyJOKBkZPOKsNI4-OZzg2w8
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI
NEXT_PUBLIC_APP_URL=https://sayu.my
NEXT_PUBLIC_APP_NAME=SAYU
NODE_ENV=production
```

5. Environment 선택: Production ✓ 체크
6. "Save" 클릭

## 2. Supabase 설정

### Supabase Dashboard에서 설정하기
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. SAYU 프로젝트 선택
3. Authentication → URL Configuration 이동
4. 다음 설정 업데이트:

#### Site URL
```
https://sayu.my
```

#### Redirect URLs (모두 추가)
```
https://sayu.my/auth/callback
https://sayu.my
http://localhost:3000/auth/callback
http://localhost:3000
```

5. "Save" 클릭

### OAuth Providers 설정 확인
1. Authentication → Providers 이동
2. 각 Provider (Google, Kakao, Discord, Facebook) 설정 확인
3. 각 Provider의 Redirect URL이 다음과 같이 설정되어 있는지 확인:
   - Google: `https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback`
   - Kakao: `https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback`
   - Discord: `https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback`
   - Facebook: `https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback`

## 3. 배포하기

### Git으로 자동 배포
```bash
git add .
git commit -m "fix: 로그인 인증 설정 수정"
git push origin main
```

Vercel이 자동으로 빌드 및 배포를 시작합니다.

### 배포 상태 확인
1. Vercel Dashboard에서 배포 상태 확인
2. 빌드 로그에서 에러 확인
3. 배포 완료 후 https://sayu.my 접속하여 테스트

## 4. 트러블슈팅

### 로그인이 안 될 때
1. 브라우저 개발자 도구 콘솔에서 에러 메시지 확인
2. Supabase Dashboard → Authentication → Logs에서 인증 로그 확인
3. Vercel Functions 로그 확인

### 일반적인 문제들
- **"Missing Supabase environment variables"**: Vercel 환경 변수 누락
- **"Redirect URL mismatch"**: Supabase Redirect URLs 설정 확인
- **"Invalid API key"**: SUPABASE_ANON_KEY 확인
- **CORS 에러**: Supabase URL Configuration 확인

## 5. 보안 주의사항
- `SUPABASE_SERVICE_KEY`는 절대 클라이언트 코드에 노출되면 안 됩니다
- 환경 변수는 반드시 Vercel Dashboard에서만 설정하세요
- `.env.local` 파일은 절대 git에 커밋하지 마세요