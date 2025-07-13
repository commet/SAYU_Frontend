# 🔍 Railway DATABASE_URL 가져오기

호스트명: `postgres-production-808c7.up.railway.app` ✅

## 완전한 DATABASE_URL 가져오기

### 1. Railway 대시보드 접속
1. [Railway.app](https://railway.app) 로그인
2. SAYU 프로젝트 선택

### 2. PostgreSQL 서비스에서 DATABASE_URL 복사

#### 방법 A: Variables 탭 (권장)
1. **PostgreSQL** 서비스 클릭
2. **Variables** 탭 클릭
3. `DATABASE_URL` 찾기
4. 값을 클릭하면 전체가 선택됩니다
5. 복사 (Ctrl+C 또는 Cmd+C)

#### 방법 B: Connect 탭
1. **PostgreSQL** 서비스 클릭
2. **Connect** 탭 클릭
3. **Postgres Connection URL** 섹션 확인
4. 전체 URL 복사

### 3. 예상되는 DATABASE_URL 형식
```
postgresql://postgres:랜덤비밀번호@postgres-production-808c7.up.railway.app:포트번호/railway
```

구성 요소:
- 프로토콜: `postgresql://`
- 사용자명: `postgres`
- 비밀번호: Railway가 자동 생성한 긴 문자열
- 호스트: `postgres-production-808c7.up.railway.app`
- 포트: 보통 `5432` 또는 Railway가 지정한 포트
- 데이터베이스명: `railway`

### 4. 빠른 설정

DATABASE_URL을 복사했으면:

```bash
cd backend

# 설정 스크립트 실행
./setup-railway-quick.sh

# 또는 수동으로 .env 편집
nano .env
# DATABASE_URL= 라인을 찾아서 Railway URL로 교체
```

### 5. 스크린샷 가이드

Railway 대시보드에서:

```
┌─────────────────────────────────────┐
│ PostgreSQL                          │
│ ┌─────────────────────────────────┐ │
│ │ Variables  Connect  Logs  Query │ │
│ └─────────────────────────────────┘ │
│                                     │
│ DATABASE_URL                        │
│ postgresql://postgres:xxxx@xxx...   │  ← 이 부분 클릭하여 복사
│                                     │
└─────────────────────────────────────┘
```

## ❓ 자주 묻는 질문

**Q: 비밀번호를 모르겠어요**
A: Railway가 자동으로 생성합니다. Variables 탭에서 전체 URL을 복사하면 비밀번호가 포함되어 있습니다.

**Q: 포트 번호를 모르겠어요**
A: DATABASE_URL에 포함되어 있습니다. 보통 5432 또는 다른 번호입니다.

**Q: pgAdmin으로 연결하고 싶어요**
A: Connect 탭에서 개별 연결 정보(호스트, 포트, 사용자명, 비밀번호)를 확인할 수 있습니다.

## 다음 단계

DATABASE_URL을 가져온 후:
1. `.env` 파일 업데이트
2. 데이터베이스 마이그레이션 실행
3. Railway 환경 변수 추가
4. 서버 재시작

도움이 필요하면 전체 DATABASE_URL을 공유해주세요 (비밀번호는 가려도 됩니다)!