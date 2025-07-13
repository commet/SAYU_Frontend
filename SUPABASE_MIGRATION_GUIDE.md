# 🚀 SAYU Supabase 마이그레이션 가이드

## 📋 현재 진행 상황
- ✅ 마이그레이션 계획 검토 완료
- 🔄 Supabase 프로젝트 생성 대기 중

## 1️⃣ Supabase 프로젝트 생성 (수동 작업 필요)

1. [Supabase](https://app.supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `sayu-production`
   - Database Password: 강력한 비밀번호 생성 (저장 필수!)
   - Region: `Northeast Asia (Seoul)`
   - Pricing Plan: Free tier

4. 프로젝트 생성 후 다음 정보를 복사:
   ```bash
   # Supabase 대시보드 > Settings > API
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
   
   # Settings > Database
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

## 2️⃣ 환경 변수 파일 준비

프로젝트를 생성한 후, 위의 정보를 아래 파일들에 추가해주세요:

### Frontend 환경 변수 (`/frontend/.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Backend 환경 변수 (`/backend/.env`)
```bash
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DATABASE_URL=your-database-url
```

## 3️⃣ 다음 단계

Supabase 프로젝트를 생성하고 환경 변수를 설정한 후:

1. 데이터베이스 스키마 마이그레이션
2. 기존 데이터 이전
3. 인증 시스템 전환
4. API 엔드포인트 마이그레이션

## 🚨 중요 사항

- **비밀번호 안전하게 보관**: Database Password는 복구가 불가능합니다
- **Service Role Key 보안**: 이 키는 절대 클라이언트 코드에 포함하면 안 됩니다
- **환경 변수 Git 제외**: `.env` 파일들이 `.gitignore`에 포함되어 있는지 확인

## 📝 체크리스트

- [ ] Supabase 계정 생성
- [ ] 프로젝트 생성
- [ ] 환경 변수 복사
- [ ] `.env.local` 파일 생성 (frontend)
- [ ] `.env` 파일 업데이트 (backend)

프로젝트 생성 완료 후 알려주시면 다음 단계를 진행하겠습니다!