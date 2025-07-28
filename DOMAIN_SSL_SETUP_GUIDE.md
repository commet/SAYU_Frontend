# 🌐 SAYU 도메인 & SSL 설정 가이드

SAYU 프로젝트의 프로덕션 도메인 및 SSL 인증서 설정 가이드입니다.

## 🎯 설정 목표

### 현재 상황
- **프론트엔드**: Vercel 임시 도메인 (`sayu-frontend.vercel.app`)
- **백엔드**: Railway 임시 도메인 (`sayu-backend.railway.app`)

### 목표 상황
- **메인 도메인**: `sayu.art` (예시)
- **API 도메인**: `api.sayu.art` 
- **관리자**: `admin.sayu.art`
- **SSL 인증서**: 자동 갱신 (Let's Encrypt)

## 🛒 도메인 구매 옵션

### 1. 권장 도메인 등록 업체
1. **Namecheap** (추천) - 저렴하고 관리 쉬움
2. **GoDaddy** - 유명하지만 비쌈
3. **Cloudflare Registrar** - 도메인+DNS 통합
4. **가비아** - 한국 업체 (한국어 지원)

### 2. 도메인명 추천
- `sayu.art` (이상적, 비쌀 수 있음)
- `sayu.io` (개발자 친화적)
- `sayuapp.com` (앱 느낌)
- `sayu.gallery` (갤러리 느낌)
- `mysayu.com` (개인화 느낌)

### 3. 예상 비용
- `.com`: $10-15/년
- `.io`: $30-50/년  
- `.art`: $15-30/년
- `.gallery`: $20-40/년

## 🔧 Vercel 도메인 설정 (프론트엔드)

### 1. Vercel 프로젝트에 도메인 추가

#### 1.1 Vercel 대시보드 접속
1. [Vercel Dashboard](https://vercel.com/dashboard) 로그인
2. SAYU 프론트엔드 프로젝트 선택
3. **Settings** → **Domains** 메뉴

#### 1.2 도메인 추가
```bash
# 메인 도메인
sayu.art

# www 서브도메인 (선택사항)  
www.sayu.art
```

#### 1.3 DNS 설정 (도메인 등록업체에서)
Vercel이 제공하는 DNS 레코드를 도메인 등록업체에 추가:

**A 레코드:**
```
Type: A
Name: @
Value: 76.76.19.61
```

**CNAME 레코드:**
```
Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### 2. 환경 변수 업데이트

#### 2.1 프론트엔드 환경 변수
```bash
# .env.local 및 Vercel 환경 변수
NEXT_PUBLIC_APP_URL=https://sayu.art
NEXT_PUBLIC_API_URL=https://api.sayu.art
```

#### 2.2 Vercel 대시보드에서 환경 변수 설정
1. Settings → Environment Variables
2. 기존 localhost URL들을 실제 도메인으로 변경

## 🚀 Railway 도메인 설정 (백엔드)

### 1. Railway 커스텀 도메인 설정

#### 1.1 Railway 대시보드 접속
1. [Railway Dashboard](https://railway.app/dashboard) 로그인
2. SAYU 백엔드 프로젝트 선택
3. **Settings** → **Domains** 메뉴

#### 1.2 커스텀 도메인 추가
```bash
# API 서브도메인
api.sayu.art
```

#### 1.3 DNS 설정 (도메인 등록업체에서)
Railway가 제공하는 CNAME 레코드 추가:

```
Type: CNAME
Name: api
Value: railway-provided-domain.railway.app
```

### 2. CORS 설정 업데이트

#### 2.1 기존 CORS 설정 확인 ✅
`backend/src/middleware/corsEnhanced.js`에 이미 프로덕션 도메인이 설정되어 있습니다:

```javascript
// 프로덕션 허용 도메인 (이미 설정됨)
const allowedOrigins = [
  'https://sayu.art',
  'https://www.sayu.art', 
  'https://sayu-frontend.vercel.app',
  process.env.FRONTEND_URL
];
```

#### 2.2 환경 변수 업데이트만 필요
```bash
# backend/.env
FRONTEND_URL=https://sayu.art
```

## 🔒 SSL 인증서 자동 설정

### 1. Vercel SSL (자동) ✅
- Vercel은 커스텀 도메인 추가 시 **자동으로 SSL 인증서 발급**
- Let's Encrypt 사용하여 **무료**
- **자동 갱신** (90일마다)

### 2. Railway SSL (자동) ✅  
- Railway도 커스텀 도메인 추가 시 **자동으로 SSL 인증서 발급**
- Let's Encrypt 사용하여 **무료**
- **자동 갱신**

### 3. 추가 설정 필요 없음
SSL 인증서는 플랫폼에서 자동 관리되므로 별도 설정이 필요하지 않습니다!

## 🛡️ 보안 강화설정

### 1. HTTPS 강제 리다이렉트

#### 1.1 Vercel 설정 (자동) ✅
- Vercel은 **자동으로 HTTP → HTTPS 리다이렉트**
- 추가 설정 불필요

#### 1.2 Railway 설정 확인
Railway 백엔드가 HTTPS를 강제하는지 확인 필요

### 2. Security Headers 추가

백엔드에 보안 헤더 미들웨어 추가가 권장됩니다:

```javascript
// backend/src/middleware/securityHeaders.js (생성 권장)
const helmet = require('helmet');

const securityHeaders = helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "https:", "data:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

module.exports = securityHeaders;
```

## 📱 서브도메인 구조 권장

### 1. 메인 서비스
- `sayu.art` - 메인 프론트엔드
- `www.sayu.art` - 메인 도메인 리다이렉트

### 2. API 및 관리
- `api.sayu.art` - 백엔드 API
- `admin.sayu.art` - 관리자 대시보드 (미래)

### 3. 추가 서비스 (미래 확장)
- `blog.sayu.art` - 블로그
- `docs.sayu.art` - 문서
- `status.sayu.art` - 서비스 상태 페이지

## 🚀 배포 후 도메인 설정 순서

### 1단계: 도메인 구매 및 DNS 설정
```bash
1. 도메인 구매 (예: sayu.art)
2. DNS 레코드 설정:
   - A: @ → 76.76.19.61 (Vercel)
   - CNAME: www → cname.vercel-dns.com
   - CNAME: api → [railway-domain].railway.app
```

### 2단계: Vercel 도메인 추가
```bash
1. Vercel Dashboard → 프로젝트 → Settings → Domains  
2. sayu.art 추가
3. www.sayu.art 추가 (선택사항)
4. DNS 설정 확인 대기 (최대 24시간)
```

### 3단계: Railway 도메인 추가  
```bash
1. Railway Dashboard → 프로젝트 → Settings → Domains
2. api.sayu.art 추가  
3. DNS 설정 확인 대기
```

### 4단계: 환경 변수 업데이트
```bash
# Vercel 환경 변수
NEXT_PUBLIC_APP_URL=https://sayu.art
NEXT_PUBLIC_API_URL=https://api.sayu.art

# Railway 환경 변수  
FRONTEND_URL=https://sayu.art
```

### 5단계: 배포 및 테스트
```bash
1. GitHub에 환경 변수 변경사항 push
2. 자동 배포 확인
3. https://sayu.art 접속 테스트
4. API 연결 테스트: https://api.sayu.art/health
```

## 🔍 도메인 설정 검증 체크리스트

### DNS 설정 확인
- [ ] `sayu.art` A 레코드 설정됨
- [ ] `www.sayu.art` CNAME 설정됨  
- [ ] `api.sayu.art` CNAME 설정됨
- [ ] DNS 전파 완료 (dig/nslookup으로 확인)

### SSL 인증서 확인
- [ ] `https://sayu.art` 접속 가능
- [ ] `https://api.sayu.art/health` 접속 가능
- [ ] 브라우저에서 자물쇠 아이콘 표시
- [ ] SSL Labs에서 A+ 등급 (선택사항)

### 기능 테스트
- [ ] 프론트엔드 → 백엔드 API 호출 정상
- [ ] 사용자 인증 (로그인/회원가입) 정상
- [ ] 이미지 업로드/표시 정상  
- [ ] OpenAI API 연동 정상

### 성능 확인  
- [ ] 페이지 로딩 속도 < 3초
- [ ] API 응답 시간 < 1초
- [ ] 이미지 로딩 최적화 확인

## 💰 예상 비용

### 도메인 비용 (연간)
- `.com`: $10-15
- `.art`: $15-30  
- `.io`: $30-50

### 호스팅 비용 (현재와 동일)
- **Vercel**: 무료 (Hobby Plan)
- **Railway**: $5/월 (현재 사용량 기준)
- **Supabase**: $25/월 (Pro Plan)

### SSL 인증서 비용
- **무료** (Let's Encrypt 자동 발급)

### 총 예상 비용
- **첫 해**: 도메인비 $15-50 + 기존 호스팅 비용
- **매년**: 도메인 갱신비만 추가

## 🎯 우선순위 권장사항

### 높음 (필수)
1. **도메인 구매** - 브랜딩의 핵심
2. **메인 도메인 설정** (sayu.art)
3. **API 도메인 설정** (api.sayu.art)

### 중간 (권장)  
1. **www 서브도메인** 설정
2. **보안 헤더** 추가
3. **성능 모니터링** 설정

### 낮음 (선택)
1. **추가 서브도메인** (blog, docs 등)
2. **SSL Labs A+ 등급** 달성
3. **CDN 최적화**

---

## 🎉 완료 후 기대 효과

### 전문성 향상
- `sayu.art` 브랜딩으로 신뢰도 증가
- 커스텀 도메인으로 전문적 이미지

### 보안 강화  
- HTTPS 강제로 데이터 암호화
- 보안 헤더로 웹 취약점 방어

### 성능 최적화
- CDN 활용으로 로딩 속도 개선
- SSL 캐싱으로 응답 시간 단축

### SEO 개선
- 커스텀 도메인으로 검색 엔진 최적화
- HTTPS로 구글 랭킹 점수 향상

**다음 단계**: 도메인을 구매하고 위 가이드를 따라 설정하면 SAYU가 완전한 프로덕션 서비스가 됩니다! 🚀

<function_calls>
<invoke name="Read">
<parameter name="file_path">C:\Users\SAMSUNG\Documents\GitHub\SAYU\backend\src\middleware\corsEnhanced.js