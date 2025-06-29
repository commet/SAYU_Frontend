# 🚀 SAYU 새로운 프로덕션 배포 가이드

기존 프로덕션의 오류를 해결하기 위해 처음부터 새로 구축하는 완전한 가이드입니다.

## 📋 준비사항

- [x] Railway CLI 설치됨 ✅
- [x] Railway 계정 로그인됨 ✅
- [x] GitHub 레포지토리 준비됨 ✅
- [x] 코드 최적화 완료 ✅

---

## 🗂️ 1단계: 새로운 Railway 프로젝트 생성

### 1-1. 기존 프로젝트와 연결 해제
```bash
# 현재 디렉토리에서 기존 연결 해제
cd /mnt/c/Users/SAMSUNG/Documents/GitHub/SAYU
rm -f .railway.json  # 기존 연결 파일 삭제
```

### 1-2. 새 프로젝트 생성
```bash
# Railway에서 새 프로젝트 생성
railway login  # 이미 로그인 되어있지만 확인
railway create "SAYU-New"  # 새 프로젝트 생성
```

**또는 Railway 웹 대시보드에서:**
1. https://railway.app/ 접속
2. "New Project" 클릭
3. "Empty Project" 선택
4. 프로젝트명: `SAYU-New` 입력

---

## 🗄️ 2단계: 데이터베이스 서비스 설정

### 2-1. PostgreSQL 추가
Railway 대시보드에서:
1. "New Service" 클릭
2. "Database" 선택
3. "PostgreSQL" 선택
4. 자동으로 생성 완료

### 2-2. Redis 추가 (선택사항이지만 권장)
1. "New Service" 클릭
2. "Database" 선택  
3. "Redis" 선택
4. 자동으로 생성 완료

---

## ⚙️ 3단계: 백엔드 배포

### 3-1. 백엔드 디렉토리로 이동
```bash
cd /mnt/c/Users/SAMSUNG/Documents/GitHub/SAYU/backend
```

### 3-2. Railway 프로젝트 연결
```bash
railway link  # 새로 생성한 SAYU-New 프로젝트 선택
```

### 3-3. 백엔드 배포
```bash
railway up
```

---

## 🎨 4단계: 프론트엔드 배포

### 4-1. 새 서비스 생성
Railway 대시보드에서:
1. "New Service" 클릭
2. "Deploy from GitHub repo" 선택
3. 본인의 SAYU 레포지토리 선택
4. Service name: `frontend`
5. Root Directory: `frontend` 설정

### 4-2. 또는 CLI로 배포
```bash
cd /mnt/c/Users/SAMSUNG/Documents/GitHub/SAYU/frontend
railway up --service frontend
```

---

## 🔐 5단계: 환경변수 설정

### 5-1. 시크릿 키 생성
```bash
# 이 명령들로 새로운 시크릿 생성
openssl rand -base64 32  # NEXTAUTH_SECRET용
openssl rand -base64 32  # JWT_SECRET용  
openssl rand -base64 32  # SESSION_SECRET용
```

### 5-2. 백엔드 환경변수 설정
Railway 대시보드 → Backend Service → Variables에 추가:

```bash
NODE_ENV=production
PORT=3000

# PostgreSQL (Railway에서 자동 제공)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (Railway에서 자동 제공)
REDIS_URL=${{Redis.REDIS_URL}}

# 보안 키들 (위에서 생성한 값들 사용)
JWT_SECRET=새로_생성한_JWT_시크릿
SESSION_SECRET=새로_생성한_SESSION_시크릿

# OpenAI API 키 (필수)
OPENAI_API_KEY=본인의_OpenAI_API_키

# 프론트엔드 URL (프론트엔드 배포 후 업데이트)
FRONTEND_URL=https://frontend-XXXXX.railway.app

# 선택사항
SENTRY_DSN=본인의_Sentry_DSN
EMAIL_SERVICE_API_KEY=이메일_서비스_키
```

### 5-3. 프론트엔드 환경변수 설정
Railway 대시보드 → Frontend Service → Variables에 추가:

```bash
NODE_ENV=production

# 백엔드 API URL (백엔드 배포 후 URL 확인하여 설정)
NEXT_PUBLIC_API_URL=https://backend-XXXXX.railway.app

# NextAuth 설정 (위에서 생성한 시크릿 사용)
NEXTAUTH_URL=https://frontend-XXXXX.railway.app
NEXTAUTH_SECRET=새로_생성한_NEXTAUTH_시크릿

# OAuth 제공자 (선택사항)
GOOGLE_CLIENT_ID=구글_클라이언트_ID
GOOGLE_CLIENT_SECRET=구글_클라이언트_시크릿
GITHUB_CLIENT_ID=깃허브_클라이언트_ID
GITHUB_CLIENT_SECRET=깃허브_클라이언트_시크릿

# 빌드 설정
SKIP_ENV_VALIDATION=true
NEXT_TELEMETRY_DISABLED=1
```

---

## 🗃️ 6단계: 데이터베이스 초기화

### 6-1. PostgreSQL 연결
Railway 대시보드에서:
1. PostgreSQL 서비스 클릭
2. "Connect" 탭에서 connection string 복사

### 6-2. 스키마 생성
```bash
# psql 명령어로 연결 (connection string 사용)
psql "postgresql://postgres:password@host:port/railway"

# 또는 Railway CLI 사용
railway connect postgres
```

### 6-3. SQL 파일들 순서대로 실행
```sql
-- 1. 메인 스키마
\i /backend/schema.sql

-- 2. 마이그레이션 파일들
\i /backend/migrations/add-oauth-accounts.sql
\i /backend/migrations/add-user-roles.sql
\i /backend/migrations/add-community-features.sql
\i /backend/migrations/add-email-system.sql
\i /backend/migrations/performance-indexes.sql
```

---

## 🔗 7단계: URL 업데이트

### 7-1. 서비스 URL 확인
Railway 대시보드에서 각 서비스의 URL 확인:
- Backend: `https://backend-XXXXX.railway.app`
- Frontend: `https://frontend-XXXXX.railway.app`

### 7-2. 환경변수 업데이트
1. **백엔드 서비스**에서 `FRONTEND_URL` 업데이트
2. **프론트엔드 서비스**에서 `NEXT_PUBLIC_API_URL`과 `NEXTAUTH_URL` 업데이트

---

## ✅ 8단계: 배포 테스트

### 8-1. 기본 기능 테스트
1. 프론트엔드 URL 접속
2. 회원가입 테스트
3. 로그인 테스트
4. 퀴즈 기능 테스트
5. 프로필 생성 테스트

### 8-2. API 연결 확인
```bash
# 백엔드 health check
curl https://backend-XXXXX.railway.app/api/health

# 응답 예시:
# {"status":"healthy","timestamp":"2024-01-XX","version":"1.0.0"}
```

---

## 🚨 트러블슈팅

### 문제 1: 빌드 실패
**해결책:**
- Railway 대시보드에서 빌드 로그 확인
- 환경변수가 모두 설정되었는지 확인
- `package.json`의 스크립트 확인

### 문제 2: 데이터베이스 연결 실패
**해결책:**
- `DATABASE_URL` 환경변수 확인
- PostgreSQL 서비스가 실행 중인지 확인
- 연결 문자열 형식 확인

### 문제 3: 프론트엔드에서 API 호출 실패
**해결책:**
- `NEXT_PUBLIC_API_URL` 확인
- CORS 설정 확인
- 백엔드 서비스 상태 확인

---

## 📱 9단계: 도메인 설정 (선택사항)

### 9-1. 커스텀 도메인 추가
Railway 대시보드에서:
1. Frontend 서비스 → Settings → Domains
2. "Custom Domain" 추가
3. DNS 설정에서 CNAME 추가

### 9-2. 환경변수 업데이트
커스텀 도메인 사용 시 `NEXTAUTH_URL`을 새 도메인으로 업데이트

---

## 🎉 완료!

새로운 SAYU 프로덕션이 성공적으로 배포되었습니다!

### 최종 체크리스트:
- [ ] 새 Railway 프로젝트 생성
- [ ] PostgreSQL/Redis 서비스 추가
- [ ] 백엔드 배포 완료
- [ ] 프론트엔드 배포 완료
- [ ] 모든 환경변수 설정
- [ ] 데이터베이스 스키마 생성
- [ ] URL 상호 참조 업데이트
- [ ] 기능 테스트 완료

### 유용한 링크:
- Railway 프로젝트: https://railway.app/project/your-project-id
- 프론트엔드: https://frontend-XXXXX.railway.app
- 백엔드 API: https://backend-XXXXX.railway.app

**축하합니다! 🎊 깔끔한 새 SAYU 프로덕션이 준비되었습니다!**