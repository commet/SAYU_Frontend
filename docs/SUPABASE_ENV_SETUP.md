# Supabase 환경 변수 설정 가이드

## 1. Supabase 대시보드에서 키 찾기

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 (hgltvdshuyfffskvjmst)
3. 좌측 메뉴에서 **Settings** → **API** 클릭
4. 다음 키들을 복사:
   - **Project URL**: `https://hgltvdshuyfffskvjmst.supabase.co`
   - **anon public**: `anon` key (공개 가능)
   - **service_role**: `service_role` key (비공개, 서버에서만 사용)

## 2. Frontend 환경 변수 설정

### 2.1 개발 환경 (.env.local)

```bash
cd frontend
cp .env.example .env.local
```

`.env.local` 파일 편집:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hgltvdshuyfffskvjmst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_key_붙여넣기

# Supabase Service Key (for server-side operations)
SUPABASE_SERVICE_KEY=여기에_service_role_key_붙여넣기

# AI Services (선택사항)
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
GOOGLE_AI_API_KEY=AIza...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SAYU

# Development
NODE_ENV=development
```

### 2.2 Vercel 프로덕션 환경 변수

1. [Vercel Dashboard](https://vercel.com) 접속
2. SAYU 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 다음 변수들 추가:

```
NEXT_PUBLIC_SUPABASE_URL = https://hgltvdshuyfffskvjmst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [anon key]
SUPABASE_SERVICE_KEY = [service_role key]
OPENAI_API_KEY = [OpenAI API key]
REPLICATE_API_TOKEN = [Replicate API token]
NEXT_PUBLIC_APP_URL = https://sayu.vercel.app
```

## 3. Backend 환경 변수 설정 (마이그레이션용)

### 3.1 개발 환경 (.env)

```bash
cd backend
cp .env.example .env
```

`.env` 파일 편집:

```env
# Supabase (새로운 설정)
SUPABASE_URL=https://hgltvdshuyfffskvjmst.supabase.co
SUPABASE_ANON_KEY=여기에_anon_key_붙여넣기
SUPABASE_SERVICE_KEY=여기에_service_role_key_붙여넣기

# Railway PostgreSQL (기존 데이터 마이그레이션용)
DATABASE_URL=postgresql://postgres:password@host:port/railway

# 마이그레이션 플래그
ENABLE_SUPABASE=true
MIGRATE_TO_SUPABASE=true
```

## 4. 환경 변수 확인

### Frontend 확인
```bash
cd frontend
npm run dev
# 브라우저 콘솔에서 확인
# console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### Backend 확인
```bash
cd backend
node -e "console.log(require('dotenv').config().parsed)"
```

## 5. 보안 주의사항

### ⚠️ 절대 공개하면 안 되는 키
- `SUPABASE_SERVICE_KEY` - 서버 사이드에서만 사용
- `OPENAI_API_KEY` - API 비용 발생
- `REPLICATE_API_TOKEN` - API 비용 발생

### ✅ 공개 가능한 키
- `NEXT_PUBLIC_SUPABASE_URL` - 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - RLS로 보호됨

### Git 제외 확인
```bash
# .gitignore에 포함되어 있는지 확인
cat .gitignore | grep -E "\.env|\.local"
```

## 6. 문제 해결

### Supabase 연결 실패
1. URL이 정확한지 확인 (https:// 포함)
2. 키가 완전히 복사되었는지 확인
3. 네트워크 방화벽 확인

### 환경 변수 인식 안 됨
1. 서버 재시작 필요
2. `NEXT_PUBLIC_` 접두사 확인 (클라이언트용)
3. `.env.local` 파일 위치 확인 (frontend 폴더)

### Vercel 배포 시 오류
1. Vercel 환경 변수 저장 후 재배포
2. Build 로그에서 환경 변수 로드 확인
3. Production/Preview/Development 환경 구분

## 7. 다음 단계

환경 변수 설정이 완료되면:

1. **데이터 마이그레이션 실행**
   ```bash
   cd scripts
   node migrate-to-supabase.js
   ```

2. **개발 서버 테스트**
   ```bash
   cd frontend
   npm run dev
   ```

3. **기능 테스트**
   - 로그인/회원가입
   - 퀴즈 진행
   - 전시 정보 조회

## 8. 참고 링크

- [Supabase Docs - Environment Variables](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs#get-the-api-keys)
- [Next.js Docs - Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Docs - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)