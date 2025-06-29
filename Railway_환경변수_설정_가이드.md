# 🔧 Railway 대시보드 환경변수 설정 가이드

## 📍 Railway 대시보드 접속

1. **Railway 웹사이트 접속**: https://railway.app/
2. **로그인** 후 **SAYU 프로젝트 클릭**
3. **직접 링크**: https://railway.app/project/75e9f19f-cb8c-4868-9718-908071329eca

---

## 🔧 1단계: valiant-nature (백엔드) 서비스 환경변수 설정

### 1-1. 서비스 선택
- 대시보드에서 **"valiant-nature"** 서비스 클릭
- 상단 탭에서 **"Variables"** 클릭

### 1-2. 기본 환경변수 추가
**"Add Variable" 버튼을 클릭하고 다음 변수들을 하나씩 추가:**

```bash
# 기본 설정
NODE_ENV=production
PORT=3000

# 보안 키들 (미리 생성된 새로운 키들)
JWT_SECRET=Zt9AcbmG/9/U5wJNQbJvR9338SpxfLYQ9zbamKn657I=
SESSION_SECRET=5DST9H9NTuluxIUTlmHsdR4jWWIcqmpDDzAUkN85aE0=

# 프론트엔드 연결
FRONTEND_URL=https://sayu.up.railway.app

# OpenAI API 키 (본인의 키로 교체 필요!)
OPENAI_API_KEY=본인의_OpenAI_API_키_여기에_입력
```

### 1-3. 데이터베이스 연결 (PostgreSQL)
**PostgreSQL 서비스가 이미 추가되어 있으므로:**

```bash
# PostgreSQL 연결 (Railway에서 자동 제공)
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**⚠️ 중요**: `${{Postgres.DATABASE_URL}}`를 정확히 입력하세요!

### 1-4. Redis 연결 (선택사항)
**Redis 서비스가 추가되어 있다면:**

```bash
# Redis 연결 (Railway에서 자동 제공)
REDIS_URL=${{Redis.REDIS_URL}}
```

---

## 🎨 2단계: sayu (프론트엔드) 서비스 환경변수 설정

### 2-1. 서비스 선택
- 대시보드에서 **"sayu"** 서비스 클릭
- 상단 탭에서 **"Variables"** 클릭

### 2-2. 프론트엔드 환경변수 추가

```bash
# 기본 설정
NODE_ENV=production

# 백엔드 API 연결
NEXT_PUBLIC_API_URL=https://valiant-nature-production.up.railway.app

# NextAuth 설정
NEXTAUTH_URL=https://sayu.up.railway.app
NEXTAUTH_SECRET=l6dNJw6ZbezjJLXArO4gbw0ttQ/Z+1nkiWKecnWllOE=

# 빌드 최적화
SKIP_ENV_VALIDATION=true
NEXT_TELEMETRY_DISABLED=1
```

### 2-3. OAuth 제공자 (선택사항)
**소셜 로그인을 원한다면 추가:**

```bash
# Google OAuth (선택사항)
GOOGLE_CLIENT_ID=본인의_구글_클라이언트_ID
GOOGLE_CLIENT_SECRET=본인의_구글_클라이언트_시크릿

# GitHub OAuth (선택사항)
GITHUB_CLIENT_ID=본인의_깃허브_클라이언트_ID
GITHUB_CLIENT_SECRET=본인의_깃허브_클라이언트_시크릿

# Apple OAuth (선택사항)
APPLE_CLIENT_ID=본인의_애플_클라이언트_ID
APPLE_CLIENT_SECRET=본인의_애플_클라이언트_시크릿
```

---

## 📊 3단계: 환경변수 입력 방법

### Railway 대시보드에서 변수 추가하는 방법:

1. **"Add Variable" 버튼 클릭**
2. **Variable Name**: 환경변수 이름 입력 (예: `NODE_ENV`)
3. **Variable Value**: 값 입력 (예: `production`)
4. **"Add" 버튼 클릭**
5. **반복**: 모든 환경변수가 추가될 때까지 반복

### 🔗 데이터베이스 연결 변수 입력 시 주의사항:

**PostgreSQL 연결 시:**
- Variable Name: `DATABASE_URL`
- Variable Value: `${{Postgres.DATABASE_URL}}` (정확히 이렇게 입력!)

**Redis 연결 시:**
- Variable Name: `REDIS_URL`  
- Variable Value: `${{Redis.REDIS_URL}}` (정확히 이렇게 입력!)

---

## 🔄 4단계: 서비스 재시작

환경변수 추가 후:

1. **각 서비스에서 "Deploy" 탭 클릭**
2. **"Redeploy" 버튼 클릭** (또는 자동으로 재배포됨)
3. **배포 로그 확인** (Build Logs에서 오류 없는지 확인)

---

## ✅ 5단계: 설정 완료 후 테스트

### 백엔드 테스트:
```
https://valiant-nature-production.up.railway.app/api/health
```
**응답 예시:** `{"status":"healthy","timestamp":"2025-XX-XX","environment":"production"}`

### 프론트엔드 테스트:
```
https://sayu.up.railway.app
```
**확인사항:** 페이지가 정상 로드되고 API 연결이 작동하는지

---

## 🚨 중요한 참고사항

### ⚠️ 반드시 교체해야 할 값들:
1. **`OPENAI_API_KEY`**: 본인의 실제 OpenAI API 키로 교체
2. **OAuth 클라이언트 ID/Secret**: 본인의 실제 OAuth 앱 정보로 교체

### 💡 팁:
- 환경변수 추가 후 서비스가 자동으로 재배포됩니다
- 오타가 없는지 꼼꼼히 확인하세요
- `${{Service.VARIABLE}}` 형식을 정확히 지켜주세요

### 🔍 문제 해결:
- 서비스가 시작되지 않으면 Deploy 탭의 Build Logs 확인
- API 연결이 안 되면 CORS 설정 및 URL 확인
- 데이터베이스 연결 오류 시 `DATABASE_URL` 형식 재확인

---

## 🎯 완료 체크리스트

- [ ] valiant-nature 서비스에 모든 백엔드 환경변수 추가
- [ ] sayu 서비스에 모든 프론트엔드 환경변수 추가  
- [ ] PostgreSQL 연결 설정 완료
- [ ] Redis 연결 설정 완료 (선택사항)
- [ ] 백엔드 health check 테스트 성공
- [ ] 프론트엔드 로딩 테스트 성공
- [ ] API 연결 테스트 성공

**모든 체크리스트 완료 후 완벽한 SAYU 프로덕션 완성! 🎉**