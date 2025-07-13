# Railway 연결 가이드

## 1. Railway CLI 설치

### Windows (PowerShell)
```powershell
npm install -g @railway/cli
```

### macOS/Linux
```bash
npm install -g @railway/cli
# 또는
curl -fsSL https://railway.app/install.sh | sh
```

## 2. Railway 로그인
```bash
railway login
# 브라우저가 열리면 Railway 계정으로 로그인
```

## 3. 프로젝트 연결

### 옵션 A: 기존 프로젝트가 있는 경우
```bash
cd backend
railway link
# 프로젝트 목록에서 선택
```

### 옵션 B: 새 프로젝트 생성
```bash
cd backend
railway init
# 프로젝트 이름 입력
```

## 4. 환경 변수 확인
```bash
# 모든 환경 변수 보기
railway variables

# DATABASE_URL 확인
railway variables | grep DATABASE_URL
```

## 5. 환경 변수 설정 (웹 대시보드 추천)

1. https://railway.app 접속
2. 프로젝트 선택
3. Variables 탭 클릭
4. 다음 변수 추가:

```
REPLICATE_API_TOKEN=your-replicate-api-token
ART_PROFILE_FREE_MONTHLY_LIMIT=3
ART_PROFILE_PREMIUM_MONTHLY_LIMIT=30

# Cloudinary (이미지 저장용)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 6. 로컬에서 Railway 환경 변수 사용

### 방법 1: railway run 사용
```bash
# Railway 환경 변수로 서버 실행
railway run npm run dev
```

### 방법 2: .env 파일에 복사
```bash
# Railway 환경 변수를 .env 파일로 내보내기
railway variables > .env.railway

# 수동으로 .env 파일 편집
# DATABASE_URL을 Railway URL로 변경
```

## 7. 데이터베이스 마이그레이션

```bash
# Railway 환경 변수로 마이그레이션 실행
railway run psql $DATABASE_URL < migrations/art-profiles.sql

# 또는 직접 연결
psql "postgresql://postgres:xxxxx@xxxxx.railway.app:xxxx/railway" < migrations/art-profiles.sql
```

## 8. 배포

### 자동 배포 (GitHub 연동)
1. Railway 대시보드에서 Settings → Deploy
2. GitHub repo 연결
3. main 브랜치 push 시 자동 배포

### 수동 배포
```bash
railway up
```

## 트러블슈팅

### "Project not found" 오류
```bash
railway link
# 프로젝트 다시 선택
```

### DATABASE_URL이 없는 경우
1. Railway 대시보드에서 PostgreSQL 서비스 추가
2. PostgreSQL 서비스 클릭 → Variables 탭
3. DATABASE_URL 복사

### 연결 실패
- VPN 끄기
- 방화벽 확인
- Railway 서비스가 활성화되어 있는지 확인