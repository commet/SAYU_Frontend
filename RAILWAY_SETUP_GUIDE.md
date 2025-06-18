# 🚀 Railway 배포 가이드

## 🔧 Railway 환경변수 설정

Railway 대시보드에서 다음 환경변수들을 설정해주세요:

### ✅ 필수 환경변수 (서버 시작용)

```bash
NODE_ENV=production
PORT=3000
```

### ⚠️ 선택적 환경변수 (기본값 사용 가능)

```bash
# OpenAI (없어도 fallback API 작동)
OPENAI_API_KEY=sk-dummy-key-for-fallback

# Database (없어도 서버 시작됨)
DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy

# Redis (없어도 서버 시작됨)
REDIS_URL=redis://dummy@localhost:6379
```

## 📋 설정 단계

1. **Railway 대시보드 접속**
   - https://railway.app/project/75e9f19f-cb8c-4868-9718-908071329eca

2. **백엔드 서비스 클릭**
   - "remarkable-simplicity" 서비스 선택

3. **Variables 탭 클릭**

4. **환경변수 추가**
   - `NODE_ENV` = `production`
   - `PORT` = `3000`

5. **배포 확인**
   - Deployments 탭에서 배포 로그 확인
   - `https://remarkable-simplicity-production.up.railway.app/` 접속 테스트

## 🧪 테스트 엔드포인트

배포 성공 후 테스트할 수 있는 엔드포인트들:

```bash
# 1. 루트 페이지 (서버 정보)
curl https://remarkable-simplicity-production.up.railway.app/

# 2. 헬스 체크
curl https://remarkable-simplicity-production.up.railway.app/api/health

# 3. Public API 헬스
curl https://remarkable-simplicity-production.up.railway.app/api/public/health

# 4. 성격 유형 조회
curl https://remarkable-simplicity-production.up.railway.app/api/public/personality-types

# 5. API 문서
curl https://remarkable-simplicity-production.up.railway.app/api-docs
```

## 🔍 트러블슈팅

### 404 에러가 계속 나는 경우:
1. Railway 대시보드에서 Deployments 탭 확인
2. 빌드 로그에서 에러 메시지 확인
3. 환경변수가 제대로 설정되었는지 확인

### 서버가 시작 안되는 경우:
1. `NODE_ENV=production` 설정 확인
2. `PORT=3000` 설정 확인
3. 빌드 로그에서 npm install이 성공했는지 확인

### Public API가 작동 안하는 경우:
- Fallback API라도 작동해야 함
- `/api/public/health`에서 `fallback: true` 확인

## ✅ 성공 확인

루트 페이지 접속 시 다음과 같은 응답이 나오면 성공:

```json
{
  "service": "SAYU API Server",
  "version": "1.0.0", 
  "status": "running",
  "lastUpdated": "2024-06-18T21:30:00Z",
  "railway": {
    "deployed": true,
    "simpleServer": true
  }
}
```