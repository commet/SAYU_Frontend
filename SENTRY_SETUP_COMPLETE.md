# ✅ SAYU Sentry 설정 완료 가이드

SAYU 프로젝트의 Sentry 에러 추적 시스템이 완전히 설정되었습니다.

## 🔧 설정 완료 사항

### 1. 백엔드 Sentry (✅ 완료)
- `@sentry/node`, `@sentry/profiling-node` 패키지 설치됨
- `backend/src/config/sentry.js` 설정 파일 완성
- 프로덕션 환경에서 10% 샘플링 레이트 적용
- 민감 데이터 필터링 구현
- 사용자 컨텍스트 및 요청 추적 기능

### 2. 프론트엔드 Sentry (✅ 완료) 
- `@sentry/nextjs` 패키지 설치됨
- Sentry 설정 파일들 생성:
  - `sentry.client.config.ts` - 브라우저 사이드
  - `sentry.server.config.ts` - 서버 사이드  
  - `sentry.edge.config.ts` - Edge 런타임
- `next.config.js`에 Sentry 통합 추가
- Session Replay 기능 활성화 (프로덕션에서 1% 샘플링)

### 3. 헬스체크 엔드포인트 (✅ 완료)
- **백엔드**: `/health` - 포괄적 시스템 모니터링
  - 데이터베이스 연결 상태 (Supabase/Railway)
  - Redis 연결 상태
  - OpenAI API 상태
  - 메모리 사용량
  - 프로세스 건강도
- **프론트엔드**: `/api/health` - 클라이언트 사이드 모니터링
  - Supabase 연결
  - OpenAI API 연결
  - 빌드 상태
  - 환경 변수 검증
  - 백엔드 연결성

## 🚨 Sentry 실제 연결 방법

### 1. Sentry 계정 생성
1. [Sentry.io](https://sentry.io) 무료 계정 생성
2. 새 조직 생성 (예: "sayu-team")

### 2. 프로젝트 생성
**백엔드 프로젝트:**
1. Create Project → Platform: **Node.js** 선택
2. 프로젝트명: `sayu-backend`
3. DSN 복사 (예: `https://abc123@o123456.ingest.sentry.io/456789`)

**프론트엔드 프로젝트:**
1. Create Project → Platform: **Next.js** 선택  
2. 프로젝트명: `sayu-frontend`
3. DSN 복사 (예: `https://def456@o123456.ingest.sentry.io/789012`)

### 3. 환경 변수 설정
**백엔드 `.env`:**
```bash
# Sentry Configuration
SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=sayu-backend@1.0.0
```

**프론트엔드 `.env.local`:**
```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id
SENTRY_ORG=your-org-name
SENTRY_PROJECT=sayu-frontend
SENTRY_AUTH_TOKEN=your-auth-token
```

### 4. Auth Token 생성 (소스맵 업로드용)
1. Sentry → Settings → Auth Tokens
2. Create New Token
3. Scopes 선택:
   - `org:read`
   - `project:read`
   - `project:releases`
   - `project:write`
4. 토큰을 `SENTRY_AUTH_TOKEN`에 설정

## 📊 알림 설정 권장사항

### 1. 알림 규칙 생성
**Critical Alerts (즉시 대응):**
- Error rate > 5% in 5 minutes
- Any error with tag `level:fatal`
- Memory usage > 90%
- Database connection failure

**Warning Alerts (모니터링):**
- Error rate > 2% in 10 minutes  
- Response time > 2 seconds
- Memory usage > 80%

### 2. 알림 채널 설정
- **이메일**: 개발자에게 즉시 알림
- **Slack**: 팀 채널 연동 (선택사항)
- **Discord**: 커뮤니티 채널 (선택사항)

## 🔍 모니터링 대시보드

### Sentry 대시보드에서 확인 가능한 메트릭:
1. **에러 추적**: 실시간 에러 발생 현황
2. **성능 모니터링**: API 응답 시간, 트랜잭션 추적
3. **릴리즈**: 배포별 에러 발생 추이
4. **사용자 영향**: 에러가 사용자에게 미치는 영향 분석
5. **Session Replay**: 에러 발생 시 사용자 세션 재현

### Health Check 모니터링:
- **백엔드**: `https://your-backend-url/health`
- **프론트엔드**: `https://your-frontend-url/api/health`

## 🧪 테스트 방법

### 1. Sentry 에러 테스트
**백엔드:**
```javascript
// 테스트 에러 발생
const { captureException } = require('./src/config/sentry');
captureException(new Error('Test error from backend'));
```

**프론트엔드:**
```javascript
// 테스트 에러 발생  
import * as Sentry from '@sentry/nextjs';
Sentry.captureException(new Error('Test error from frontend'));
```

### 2. Health Check 테스트
```bash
# 백엔드 헬스체크
curl http://localhost:3001/health

# 프론트엔드 헬스체크  
curl http://localhost:3000/api/health
```

## 📈 성능 최적화

### 샘플링 레이트 설정:
- **개발 환경**: 100% (모든 에러/성능 데이터 수집)
- **프로덕션 환경**: 
  - 에러: 100% 
  - 성능: 10%
  - Session Replay: 1% (일반), 100% (에러 발생 시)

### 데이터 필터링:
- 민감한 데이터 자동 마스킹
- Development 노이즈 필터링
- Next.js 특정 에러 제외

## 🎯 다음 단계

1. ✅ **Sentry 설정** (완료)
2. 🔧 **실제 DSN 연결** (Sentry 계정 생성 후)
3. 📊 **알림 규칙 설정**
4. 🌐 **도메인 & SSL 설정**

## 🚀 프로덕션 배포 시 자동 활성화

CI/CD 파이프라인에서 환경 변수가 설정되면 Sentry가 자동으로 활성화됩니다:

- GitHub Actions에 Sentry secrets 추가
- Railway/Vercel에 환경 변수 설정  
- 배포 시 자동으로 릴리스 추적 시작

---

**🎉 축하합니다!** SAYU의 모니터링 시스템이 완전히 준비되었습니다!