# SAYU 환경 변수 설정 가이드

이 가이드는 SAYU 프로젝트를 실제 배포하기 위해 필요한 환경 변수들을 설정하는 방법을 설명합니다.

## 🔧 현재 상태

### ✅ 이미 설정된 서비스
- **Supabase**: Database, Auth, Storage 모두 설정 완료
- **데이터베이스**: PostgreSQL (Supabase) 연결 완료
- **84% 비용 절감**: Railway → Supabase 마이그레이션 완료

### ❌ 설정 필요한 서비스

## 1. OpenAI API 키 설정 (필수)

### 1.1 API 키 생성
1. [OpenAI 플랫폼](https://platform.openai.com/api-keys)에 로그인
2. "Create new secret key" 클릭
3. 키 이름을 "SAYU-Production"으로 설정
4. 생성된 키를 복사 (한 번만 표시됨)

### 1.2 환경 변수 업데이트
```bash
# Backend (.env)
OPENAI_API_KEY=sk-proj-새로운키여기에입력

# Frontend (.env.local)  
OPENAI_API_KEY=sk-proj-새로운키여기에입력
```

### 1.3 비용 관리
- OpenAI 계정에서 사용량 제한 설정 권장 (월 $50 이하)
- SAYU는 효율적인 API 사용을 위해 캐싱 시스템 구현됨

## 2. Cloudinary 설정 (이미지 업로드)

### 2.1 계정 생성
1. [Cloudinary](https://cloudinary.com) 가입 (무료 계정으로 시작)
2. Dashboard에서 API 정보 확인

### 2.2 환경 변수 설정
```bash
# Backend (.env)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## 3. JWT Secret 보안 강화

### 3.1 안전한 Secret 생성
```bash
# Node.js로 안전한 키 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.2 환경 변수 업데이트
```bash
# Backend (.env)
JWT_SECRET=생성된64자리헥스키
JWT_REFRESH_SECRET=다른64자리헥스키
SESSION_SECRET=또다른64자리헥스키
```

## 4. Google AI API (선택사항)

### 4.1 API 키 생성
1. [Google AI Studio](https://aistudio.google.com/app/apikey)에서 키 생성
2. 생성된 키 복사

### 4.2 환경 변수 설정
```bash
# Backend (.env) & Frontend (.env.local)
GOOGLE_AI_API_KEY=AIzaSy새로운구글AI키
```

## 5. Replicate API (AI 이미지 생성)

### 5.1 API 토큰 생성
1. [Replicate](https://replicate.com) 계정 생성
2. Account → API tokens에서 새 토큰 생성

### 5.2 환경 변수 설정
```bash
# Frontend (.env.local)
REPLICATE_API_TOKEN=r8_새로운토큰키
```

## 6. Sentry 모니터링 (선택사항)

### 6.1 프로젝트 생성
1. [Sentry](https://sentry.io) 계정 생성
2. 새 프로젝트 생성 (Next.js 선택)
3. DSN 복사

### 6.2 환경 변수 설정
```bash
# Backend (.env) & Frontend (.env.local)
SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
```

## 🚀 배포별 환경 설정

### Railway 배포 (Backend)
1. Railway 대시보드 → Variables 탭
2. 위의 모든 환경 변수를 추가
3. `NODE_ENV=production` 설정

### Vercel 배포 (Frontend)
1. Vercel 프로젝트 설정 → Environment Variables
2. `NEXT_PUBLIC_*` 변수들 추가
3. 빌드 시 `SKIP_ENV_VALIDATION=true` 설정

## 🔒 보안 주의사항

### DO NOT COMMIT
- 절대 실제 API 키를 Git에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있음

### 키 관리
- 각 환경(dev/staging/prod)마다 다른 키 사용
- 정기적으로 키 로테이션 (3-6개월)
- 의심스러운 활동 시 즉시 키 교체

## 📊 비용 예상

### 예상 월 비용 (소규모 서비스)
- **Supabase**: $0 (무료 티어)
- **OpenAI**: $10-30 (사용량 기반)
- **Cloudinary**: $0 (무료 티어)
- **Replicate**: $5-15 (이미지 생성량)
- **합계**: ~$15-45/월

### 비용 최적화 팁
- API 호출 캐싱 활용 (이미 구현됨)
- 사용량 모니터링 설정
- 알림 설정으로 예산 초과 방지

## 🧪 테스트 방법

### 1. Backend API 테스트
```bash
cd backend
npm test
```

### 2. Frontend 빌드 테스트
```bash
cd frontend
npm run build
```

### 3. 전체 연동 테스트
```bash
# Backend 실행
cd backend && npm run dev

# Frontend 실행 (새 터미널)
cd frontend && npm run dev
```

## 🆘 문제 해결

### 자주 발생하는 문제들

1. **OpenAI API 429 에러**
   - 사용량 한도 초과
   - 요금제 업그레이드 또는 사용량 줄이기

2. **Cloudinary 업로드 실패**
   - API 키 확인
   - 업로드 한도 확인

3. **Supabase 연결 오류**
   - URL과 키 정확성 확인
   - IP 화이트리스트 설정 확인

### 지원 요청
- GitHub Issues에 문제 보고
- 민감한 정보(API 키 등)는 절대 포함하지 마세요

---

## 🎯 다음 단계

환경 변수 설정 완료 후:
1. ✅ **ESLint 설정** (완료)
2. ✅ **빌드 오류 해결** (완료)  
3. 🔧 **환경 변수 설정** (이 가이드)
4. 🚀 **CI/CD 파이프라인** (다음)
5. 📊 **모니터링 연결** (다음)
6. 🌐 **도메인 & SSL** (다음)

이 가이드를 따라 설정하면 SAYU가 완전한 프로덕션 환경에서 실행될 준비가 됩니다!