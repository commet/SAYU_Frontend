# Railway 새 프로젝트 배포 가이드

## 1단계: Railway 새 프로젝트 생성
1. https://railway.app → "New Project"
2. "Deploy from GitHub repo" → SAYU 선택
3. Service name: `sayu-living-identity`

## 2단계: 환경변수 설정
```
NODE_ENV=production
PORT=3000
```

## 3단계: 배포 확인
- 자동 빌드/배포 시작
- URL: https://sayu-living-identity-[random].up.railway.app
- Health check: /api/health

## 4단계: 테스트 엔드포인트
- `GET /` - 서비스 소개
- `GET /api/health` - 헬스 체크
- `GET /api/quiz/questions` - 몰입형 퀴즈
- `POST /api/quiz/submit` - 퀴즈 제출
- `GET /api/villages/CONTEMPLATIVE` - 마을 정보

## 현재 기능 상태
✅ SAYU Living Identity Server (sayu-living-server.js)
✅ 몰입형 퀴즈 시스템
✅ 4개 마을 클러스터링
✅ 토큰 이코노미
✅ 진화 추적 시스템
✅ 정체성 카드 시스템

## 다음 단계
1. Backend 배포 완료 후 URL 확인
2. Frontend를 Vercel에 배포하여 백엔드 연결
3. 전체 시스템 테스트