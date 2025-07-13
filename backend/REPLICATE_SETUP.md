# Replicate API 설정 가이드

## 1. Replicate 계정 생성 및 API 토큰 발급

1. [Replicate.com](https://replicate.com) 방문
2. GitHub 계정으로 가입 (무료)
3. 로그인 후 [Account Settings](https://replicate.com/account/api-tokens) 이동
4. "Create token" 클릭하여 새 API 토큰 생성
5. 생성된 토큰 복사 (r8_로 시작하는 토큰)

## 2. 환경 변수 설정

### 로컬 개발 환경
```bash
# backend/.env 파일 생성 (없으면)
cp .env.example .env

# .env 파일 편집하여 토큰 추가
REPLICATE_API_TOKEN=r8_your_actual_token_here
```

### Railway 배포 환경
1. Railway 대시보드에서 프로젝트 선택
2. Variables 탭 이동
3. 다음 변수 추가:
   - `REPLICATE_API_TOKEN`: 발급받은 토큰
   - `ART_PROFILE_FREE_MONTHLY_LIMIT`: 3
   - `ART_PROFILE_PREMIUM_MONTHLY_LIMIT`: 30

## 3. 무료 티어 제한사항

Replicate 무료 티어:
- 월 $5 크레딧 무료 제공
- 약 1,250개 이미지 생성 가능
- 초과 시 자동 과금 (카드 등록 필요)

## 4. 비용 모니터링

Replicate 대시보드에서 사용량 확인:
- https://replicate.com/account/billing

## 5. 테스트

```bash
# 백엔드 서버 실행
npm run dev

# API 테스트 (Postman 또는 curl)
curl -X POST http://localhost:3001/api/art-profile/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "data:image/jpeg;base64,...",
    "styleId": "monet-impressionism"
  }'
```

## 주의사항

- API 토큰은 절대 GitHub에 커밋하지 마세요
- .env 파일은 .gitignore에 포함되어 있습니다
- 프로덕션에서는 반드시 환경 변수로 관리하세요