# Supabase 환경 변수 설정 가이드

## 1. Supabase에서 복사할 정보

### Supabase 대시보드에서 찾는 방법:

1. **프로젝트 URL과 API 키**
   - Supabase 대시보드 접속
   - 왼쪽 메뉴에서 `Settings` 클릭
   - `API` 섹션 클릭
   - 다음 정보를 복사:
     ```
     Project URL: https://xxxxxxxxxxxxx.supabase.co
     anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
     service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
     ```

2. **데이터베이스 연결 정보**
   - Settings > Database 섹션
   - Connection string > URI 복사:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
     ```

## 2. 복사한 정보를 붙여넣을 위치

### Frontend 설정 (`/frontend/.env.local` 파일 생성)
```bash
# Supabase Project URL 붙여넣기
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# anon public 키 붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...

# 기존 환경 변수들도 유지
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend 설정 (`/backend/.env` 파일에 추가)
```bash
# 기존 환경 변수들 유지하고 아래 추가

# Supabase Project URL 붙여넣기
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# service_role 키 붙여넣기 (보안 중요!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...

# Database URI 붙여넣기
SUPABASE_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

## 3. 파일 생성/수정 방법

### Windows에서:
1. 파일 탐색기에서 `frontend` 폴더로 이동
2. 마우스 우클릭 > 새로 만들기 > 텍스트 문서
3. 파일명을 `.env.local`로 변경 (확장자 포함)
4. 메모장으로 열어서 위 내용 붙여넣기

### 또는 VS Code에서:
1. VS Code에서 프로젝트 열기
2. `frontend` 폴더 우클릭 > New File
3. `.env.local` 입력
4. 위 내용 붙여넣기

## 중요 사항
- ⚠️ `.env` 파일들은 절대 Git에 커밋하면 안됩니다
- ⚠️ service_role 키는 백엔드에서만 사용 (프론트엔드 X)
- ⚠️ 비밀번호는 안전한 곳에 별도 보관

## 확인 방법
파일이 제대로 생성되었는지 확인:
```bash
# frontend 폴더에서
ls -la | grep .env

# 다음 파일들이 보여야 함:
# .env.local (새로 생성)
# .env.example (원래 있던 것)
```