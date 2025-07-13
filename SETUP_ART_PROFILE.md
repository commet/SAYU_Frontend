# 🎨 AI 아트 프로필 기능 설정 가이드

이 가이드는 SAYU의 AI 아트 프로필 기능을 설정하는 방법을 설명합니다.

## 📋 필요 사항

- Node.js 18+ 
- PostgreSQL 데이터베이스
- Replicate API 토큰
- Cloudinary 계정 (이미지 저장용)

## 🚀 백엔드 설정

### 1. 패키지 설치
```bash
cd backend
npm install
```

### 2. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일에 다음 추가:
REPLICATE_API_TOKEN=r8_your_token_here
ART_PROFILE_FREE_MONTHLY_LIMIT=3
ART_PROFILE_PREMIUM_MONTHLY_LIMIT=30
```

### 3. 데이터베이스 마이그레이션
```bash
# 방법 1: 스크립트 사용
./scripts/migrate-art-profiles.sh

# 방법 2: 직접 실행
psql $DATABASE_URL < migrations/art-profiles.sql
```

### 4. 서버 실행
```bash
npm run dev
```

## 🎨 프론트엔드 설정

### 1. 환경 변수 설정
```bash
cd ../frontend

# .env.local 파일 생성
cp .env.local.example .env.local

# .env.local 파일 편집:
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. 개발 서버 실행
```bash
npm run dev
```

## 🔑 Replicate API 토큰 받기

1. [Replicate.com](https://replicate.com) 가입
2. [API Tokens](https://replicate.com/account/api-tokens) 페이지에서 토큰 생성
3. 무료 티어: 월 $5 크레딧 (약 1,250개 이미지)

## 🧪 기능 테스트

### 1. 프론트엔드에서 테스트
- http://localhost:3000/profile/art-profile 접속
- 로그인 후 사진 업로드
- 원하는 화풍 선택
- 생성 버튼 클릭

### 2. API 직접 테스트
```bash
# 로그인하여 JWT 토큰 받기
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# 아트 프로필 생성
curl -X POST http://localhost:3001/api/art-profile/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "data:image/jpeg;base64,...",
    "styleId": "monet-impressionism"
  }'
```

## 🚀 프로덕션 배포

### Vercel (프론트엔드)
환경 변수 추가:
- `NEXT_PUBLIC_API_URL`: Railway 백엔드 URL

### Railway (백엔드)
환경 변수 추가:
- `REPLICATE_API_TOKEN`: Replicate API 토큰
- `CLOUDINARY_CLOUD_NAME`: Cloudinary 클라우드 이름
- `CLOUDINARY_API_KEY`: Cloudinary API 키
- `CLOUDINARY_API_SECRET`: Cloudinary API 시크릿

## 📊 사용 가능한 화풍

1. **모네 인상파** (`monet-impressionism`)
2. **피카소 큐비즘** (`picasso-cubism`)
3. **반 고흐** (`vangogh-postimpressionism`)
4. **워홀 팝아트** (`warhol-popart`)
5. **픽셀 아트** (`pixel-art`)
6. **한국 민화** (`korean-minhwa`)
7. **클림트** (`klimt-artnouveau`)
8. **몬드리안** (`mondrian-neoplasticism`)

## ❓ 문제 해결

### "No credits remaining" 오류
- 월간 무료 횟수(3회)를 모두 사용했습니다
- 다음 달 1일에 초기화됩니다

### 이미지 생성 실패
- Replicate API 토큰이 올바른지 확인
- 이미지 크기가 10MB 이하인지 확인
- 네트워크 연결 확인

### 데이터베이스 오류
- PostgreSQL이 실행 중인지 확인
- DATABASE_URL이 올바른지 확인
- 마이그레이션이 실행되었는지 확인

## 💰 비용 예측

- Replicate API: 이미지당 약 $0.004
- 월 1,000명 × 3회 = $12/월
- Cloudinary: 무료 티어로 충분 (월 25GB)

## 📞 지원

문제가 있으면 GitHub Issues에 등록해주세요!