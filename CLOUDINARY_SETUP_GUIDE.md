# Cloudinary 이미지 업로드 시스템 설정 가이드

## 📋 개요

SAYU Artist Portal의 이미지 업로드 시스템은 Cloudinary를 사용하여 완전히 구현되었습니다. 이 가이드에 따라 설정하면 실제 이미지 업로드가 동작합니다.

## 🚀 구현된 기능

### 백엔드 (Node.js/Express)
- ✅ **Cloudinary 서비스** (`/backend/src/services/cloudinaryService.js`)
  - 이미지 최적화 (Sharp)
  - 다양한 크기 썸네일 자동 생성 (thumbnail, small, medium, large)
  - 폴더 구조화 (`sayu-artist-portal/profiles`, `sayu-artist-portal/artworks` 등)
  - 이미지 메타데이터 추출
  - 보안 검증 및 에러 처리

- ✅ **API 엔드포인트** (`/backend/src/routes/artistPortal.js`)
  - `POST /api/artist-portal/upload/image` - 단일 이미지 업로드
  - `POST /api/artist-portal/upload/images` - 다중 이미지 업로드  
  - `DELETE /api/artist-portal/upload/image/:publicId` - 이미지 삭제
  - 파일 검증 (타입, 크기, 시그니처)
  - Rate limiting 및 보안 미들웨어

### 프론트엔드 (Next.js/React)
- ✅ **이미지 업로드 훅** (`/frontend/lib/hooks/useImageUpload.ts`)
  - 업로드 진행률 실시간 추적
  - 에러 처리 및 재시도 로직
  - 파일 검증 (크기, 타입)
  - 다중 파일 업로드 지원

- ✅ **API 클라이언트** (`/frontend/lib/api/`)
  - Axios 기반 HTTP 클라이언트
  - 자동 토큰 관리
  - 에러 인터셉팅
  - TypeScript 타입 정의

- ✅ **UI 컴포넌트**
  - 업로드 진행률 표시
  - 드래그 앤 드롭 지원
  - 실시간 미리보기
  - 에러 상태 표시

## 🔧 설정 방법

### 1. Cloudinary 계정 생성

1. [Cloudinary](https://cloudinary.com/) 회원가입
2. Dashboard에서 다음 정보 확인:
   - `Cloud Name`
   - `API Key` 
   - `API Secret`

### 2. 환경 변수 설정

#### 백엔드 설정 (`/backend/.env`)
```env
# Cloudinary 설정 (필수)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### 프론트엔드 설정 (`/frontend/.env.local`)
```env
# API 연결
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 패키지 설치

#### 백엔드
```bash
cd backend
npm install cloudinary streamifier sharp
```

#### 프론트엔드  
```bash
cd frontend
npm install axios --legacy-peer-deps
```

### 4. 서버 실행

#### 백엔드
```bash
cd backend
npm run dev
```

#### 프론트엔드
```bash
cd frontend  
npm run dev
```

## 🧪 테스트 방법

### 1. 기본 기능 테스트

1. 브라우저에서 `http://localhost:3000/artist-portal` 접속
2. "이미지 업로드 데모" 버튼 클릭
3. 이미지 파일을 드래그하거나 선택하여 업로드
4. 업로드 진행률과 결과 확인

### 2. API 직접 테스트

```bash
# 단일 이미지 업로드 테스트
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@test-image.jpg" \
  -F "category=artist_artworks" \
  -F "description=Test upload" \
  http://localhost:3001/api/artist-portal/upload/image
```

### 3. 프로덕션 배포 시 확인사항

#### Cloudinary
- Upload presets 설정 (선택사항)
- 이미지 변환 정책 설정
- CDN 캐싱 설정

#### 서버 설정
- HTTPS 사용 (Cloudinary는 HTTPS 권장)
- CORS 헤더 올바른 설정
- Rate limiting 조정

## 📁 폴더 구조

업로드된 이미지는 Cloudinary에서 다음과 같이 구조화됩니다:

```
sayu-artist-portal/
├── profiles/          # 아티스트/갤러리 프로필 이미지
├── artworks/          # 작품 이미지
├── gallery-profiles/  # 갤러리 프로필 이미지
└── exhibitions/       # 전시 이미지
```

## 🎯 고급 설정

### 이미지 변환 설정

자동으로 생성되는 썸네일 크기를 수정하려면:

```javascript
// /backend/src/services/cloudinaryService.js
this.imageSizes = {
  thumbnail: { width: 150, height: 150, quality: 80 },
  small: { width: 300, height: 300, quality: 85 },
  medium: { width: 600, height: 600, quality: 90 },
  large: { width: 1200, height: 1200, quality: 95 },
  original: { quality: 100 }
};
```

### 보안 설정

업로드 제한을 조정하려면:

```javascript
// /backend/src/routes/artistPortal.js
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
    files: 10 // 최대 10개 파일
  },
  // ...
});
```

## 🐛 문제 해결

### 일반적인 문제들

1. **업로드 실패: "Image upload service is not configured"**
   - Cloudinary 환경 변수가 올바르게 설정되었는지 확인
   - 서버 재시작 후 다시 시도

2. **CORS 에러**
   - 프론트엔드 URL이 백엔드 CORS 설정에 포함되어 있는지 확인

3. **파일 크기 제한 에러**
   - 파일 크기가 5MB 이하인지 확인
   - 필요시 백엔드 설정에서 제한 조정

4. **인증 에러**
   - JWT 토큰이 localStorage에 저장되어 있는지 확인
   - 토큰이 만료되지 않았는지 확인

### 로그 확인

백엔드 로그에서 상세한 에러 정보를 확인할 수 있습니다:

```bash
# 백엔드 로그 확인
cd backend
npm run dev
```

## 📊 모니터링

### Cloudinary 사용량 확인

1. Cloudinary Dashboard → Media Library
2. 업로드된 이미지 확인
3. 변환 및 대역폭 사용량 모니터링

### 서버 성능 모니터링

- 업로드 응답 시간
- 메모리 사용량 (이미지 처리 시 증가)
- 에러 발생률

## 🚀 배포 가이드

### Vercel (프론트엔드)
```bash
# 환경 변수 설정
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_APP_URL

# 배포
vercel --prod
```

### Railway (백엔드)
```bash
# 환경 변수 설정 (Railway Dashboard에서)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret

# Git push로 자동 배포
git push origin main
```

## 🔒 보안 고려사항

1. **API Key 보안**
   - `.env` 파일을 Git에 커밋하지 않음
   - 프로덕션에서는 환경 변수로 관리

2. **파일 검증**
   - 파일 시그니처 검사 (이미 구현됨)
   - 허용된 MIME 타입만 업로드

3. **Rate Limiting**
   - 사용자당 업로드 제한 (이미 구현됨)
   - IP 기반 제한

4. **인증/인가**
   - JWT 토큰 검증 (이미 구현됨)
   - 사용자별 폴더 접근 제한

---

이 가이드를 따르면 SAYU Artist Portal의 이미지 업로드 시스템을 완전히 설정하고 사용할 수 있습니다. 추가 질문이나 문제가 있으면 개발팀에 문의하세요.