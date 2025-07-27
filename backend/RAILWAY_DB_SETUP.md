# Railway PostgreSQL 데이터베이스 설정 가이드

## 1. Railway에서 PostgreSQL 서비스 생성

1. [Railway Dashboard](https://railway.app) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. **New Service** 클릭
4. **Database** → **PostgreSQL** 선택
5. 서비스 이름: `sayu-postgres` (또는 원하는 이름)

## 2. 데이터베이스 연결 정보 확인

PostgreSQL 서비스 생성 후:

1. PostgreSQL 서비스 클릭
2. **Variables** 탭 선택
3. 다음 변수들 확인:
   - `DATABASE_URL` - 전체 연결 문자열
   - `PGDATABASE` - 데이터베이스 이름
   - `PGHOST` - 호스트 주소
   - `PGPASSWORD` - 비밀번호
   - `PGPORT` - 포트 번호
   - `PGUSER` - 사용자명

## 3. 백엔드 서비스에 DATABASE_URL 연결

1. 백엔드 서비스로 이동
2. **Variables** 탭 선택
3. **Add Variable Reference** 클릭
4. PostgreSQL 서비스의 `DATABASE_URL` 선택
5. 자동으로 연결됨

## 4. Redis 서비스 추가 (선택사항)

캐싱을 위한 Redis 추가:

1. **New Service** → **Database** → **Redis**
2. 서비스 이름: `sayu-redis`
3. 백엔드 서비스에서 `REDIS_URL` 변수 참조 추가

## 5. 필수 환경 변수 설정

백엔드 서비스의 **Variables** 탭에서 다음 변수들 추가:

```
NODE_ENV=production
JWT_SECRET=[32자 이상의 랜덤 문자열]
JWT_REFRESH_SECRET=[다른 32자 이상의 랜덤 문자열]
SESSION_SECRET=[또 다른 32자 이상의 랜덤 문자열]
FRONTEND_URL=https://your-vercel-app.vercel.app
OPENAI_API_KEY=sk-your-openai-api-key
```

## 6. 데이터베이스 초기화

Railway의 **Query** 탭 또는 로컬에서:

```bash
# 로컬에서 실행할 경우
cd backend
node src/scripts/setupDatabase.js

# 또는 수동으로 마이그레이션 실행
psql $DATABASE_URL < migrations/00-initial-schema.sql
```

## 7. 확인사항

- [ ] PostgreSQL 서비스가 active 상태인지 확인
- [ ] DATABASE_URL이 백엔드 서비스에 연결되었는지 확인
- [ ] 필수 환경 변수가 모두 설정되었는지 확인
- [ ] 데이터베이스 연결 테스트 성공

## 트러블슈팅

### SSL 연결 오류
```
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

### 메모리 부족
Railway 서비스 설정에서 메모리 증가

### 연결 타임아웃
네트워크 설정 확인 및 재시도