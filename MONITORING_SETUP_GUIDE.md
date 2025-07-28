# SAYU 모니터링 시스템 설정 가이드

SAYU 프로젝트의 포괄적인 모니터링 시스템을 구축하는 가이드입니다.

## 🎯 모니터링 목표

### 1. 에러 추적 (Sentry)
- 런타임 에러 실시간 감지
- 사용자 세션 리플레이
- 성능 모니터링

### 2. 메트릭 수집
- API 응답 시간
- 메모리 사용량
- 사용자 활동 패턴

### 3. 알림 시스템
- 크리티컬 에러 즉시 알림
- 성능 저하 감지
- 서비스 다운타임 모니터링

## 🔧 Sentry 설정

### 1. Sentry 계정 생성 및 프로젝트 설정

#### 1.1 계정 생성
1. [Sentry.io](https://sentry.io) 가입 (무료 플랜으로 시작)
2. 새 프로젝트 생성
   - Platform: **Node.js** (백엔드용)
   - Platform: **Next.js** (프론트엔드용)

#### 1.2 DSN 복사
- 프로젝트 생성 후 DSN 키를 복사
- 형식: `https://abc123@o123456.ingest.sentry.io/123456`

### 2. 백엔드 Sentry 설정

#### 2.1 Sentry 의존성 설치
```bash
cd backend
npm install @sentry/node @sentry/profiling-node @sentry/tracing
```

#### 2.2 환경 변수 추가
```bash
# Backend .env
SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=sayu-backend@1.0.0
```

### 3. 프론트엔드 Sentry 설정

#### 3.1 Next.js Sentry 설치
```bash
cd frontend
npx @sentry/wizard@latest -i nextjs
```

#### 3.2 환경 변수 추가
```bash
# Frontend .env.local
NEXT_PUBLIC_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=sayu-frontend
SENTRY_AUTH_TOKEN=your-auth-token
```

## 📊 OpenTelemetry 메트릭 수집

### 1. 백엔드 메트릭 설정

#### 1.1 OpenTelemetry 설치
```bash
cd backend
npm install @opentelemetry/api @opentelemetry/resources @opentelemetry/auto-instrumentations-node
```

### 2. 사용자 정의 메트릭

#### 2.1 API 성능 메트릭
```javascript
// 응답 시간 추적
const responseTimeHistogram = meter.createHistogram('http_request_duration', {
  description: 'Duration of HTTP requests in milliseconds',
  unit: 'ms',
});

// 활성 사용자 카운터
const activeUsersGauge = meter.createUpDownCounter('active_users', {
  description: 'Number of active users',
});
```

#### 2.2 비즈니스 메트릭
```javascript
// APT 테스트 완료 수
const aptTestsCompleted = meter.createCounter('apt_tests_completed', {
  description: 'Number of completed APT tests',
});

// 아트 프로필 생성 수
const artProfilesCreated = meter.createCounter('art_profiles_created', {
  description: 'Number of created art profiles',
});
```

## 🚨 알림 시스템

### 1. Sentry 알림 설정

#### 1.1 알림 규칙 생성
1. Sentry 프로젝트 → Alerts → Create Alert Rule
2. 조건 설정:
   - **High Priority**: Error rate > 5% in 5 minutes
   - **Critical**: Any error with tag `level:fatal`
   - **Performance**: Transaction duration > 2 seconds

#### 1.2 알림 채널
- **이메일**: 즉시 알림
- **Slack**: 팀 채널 연동 (선택사항)
- **Discord**: 개발자 커뮤니티 (선택사항)

### 2. 헬스체크 엔드포인트

#### 2.1 백엔드 헬스체크
```javascript
// backend/src/routes/health.js
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      openai: await checkOpenAI(),
      memory: checkMemoryUsage()
    }
  };
  
  const hasErrors = Object.values(health.checks).some(check => !check.status);
  res.status(hasErrors ? 503 : 200).json(health);
});
```

#### 2.2 프론트엔드 헬스체크
```javascript
// frontend/app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      supabase: await checkSupabase(),
      openai: await checkOpenAI(),
      build: checkBuildHealth()
    }
  };
  
  const hasErrors = Object.values(health.checks).some(check => !check.status);
  return Response.json(health, { status: hasErrors ? 503 : 200 });
}
```

## 📈 대시보드 설정

### 1. Grafana 대시보드 (선택사항)

#### 1.1 Grafana Cloud 계정
1. [Grafana Cloud](https://grafana.com/cloud/) 가입
2. 새 스택 생성

#### 1.2 대시보드 구성
- **시스템 메트릭**: CPU, Memory, Disk
- **애플리케이션 메트릭**: Response time, Error rate
- **비즈니스 메트릭**: User signups, APT completions

### 2. Sentry Performance 대시보드

#### 2.1 트랜잭션 모니터링
- API 엔드포인트별 성능
- 데이터베이스 쿼리 성능
- 외부 API 호출 시간

#### 2.2 사용자 경험 모니터링
- 페이지 로드 시간
- Core Web Vitals
- 사용자 세션 리플레이

## 🔍 로깅 시스템

### 1. 구조화된 로깅

#### 1.1 Winston 로거 설정 (이미 구현됨)
```javascript
// backend/src/config/logger.js - 이미 존재
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

#### 1.2 요청 로깅 미들웨어
```javascript
// 모든 API 요청 로깅
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      userId: req.userId
    });
  });
  
  next();
});
```

## 📊 모니터링 메트릭 목록

### 1. 시스템 메트릭
- **CPU 사용률**: 평균, 최대값
- **메모리 사용량**: 힙, RSS, 외부 메모리
- **디스크 I/O**: 읽기/쓰기 속도
- **네트워크**: 인바운드/아웃바운드 트래픽

### 2. 애플리케이션 메트릭
- **API 응답 시간**: 95th percentile
- **에러율**: 4xx, 5xx 에러 비율
- **처리량**: 초당 요청 수 (RPS)
- **동시 접속자**: 활성 사용자 수

### 3. 비즈니스 메트릭
- **사용자 등록**: 신규 가입자
- **APT 테스트**: 완료율, 중단율
- **아트 프로필**: 생성 수, 공유 수
- **전시 매칭**: 매칭 성공률

### 4. 데이터베이스 메트릭
- **연결 풀**: 활성/유휴 연결 수
- **쿼리 성능**: 느린 쿼리 감지
- **락 대기**: 데드락 모니터링

## 🚨 알림 임계값

### 1. Critical Alerts (즉시 대응)
- **에러율** > 5% (5분간)
- **응답시간** > 5초 (3분간)
- **메모리 사용률** > 90%
- **디스크 사용률** > 90%
- **데이터베이스 연결 실패**

### 2. Warning Alerts (모니터링)
- **에러율** > 2% (10분간)
- **응답시간** > 2초 (5분간)
- **메모리 사용률** > 80%
- **CPU 사용률** > 80% (5분간)

### 3. Info Alerts (트렌드 분석)
- **일간 사용자 증가율** > 50%
- **신규 기능 사용률** < 5%
- **API 호출량** 급증/급감

## 🔧 구현 우선순위

### Phase 1: 기본 모니터링 (즉시)
1. ✅ **Sentry 에러 추적** 설정
2. ✅ **헬스체크 엔드포인트** 구현
3. ✅ **기본 로깅** (Winston - 이미 구현됨)

### Phase 2: 고급 메트릭 (1주일 후)
1. **OpenTelemetry** 메트릭 수집
2. **사용자 정의 메트릭** 구현
3. **성능 모니터링** 대시보드

### Phase 3: 종합 분석 (2주일 후)
1. **Grafana 대시보드** 구축
2. **비즈니스 메트릭** 분석
3. **자동화된 리포트** 생성

## 📋 체크리스트

### Sentry 설정
- [ ] Sentry 계정 생성
- [ ] 백엔드 프로젝트 생성
- [ ] 프론트엔드 프로젝트 생성
- [ ] DSN 환경변수 설정
- [ ] 알림 규칙 생성

### 헬스체크 구현
- [ ] 백엔드 `/health` 엔드포인트
- [ ] 프론트엔드 `/api/health` 엔드포인트
- [ ] 데이터베이스 연결 체크
- [ ] 외부 API 연결 체크

### 로깅 최적화
- [ ] 구조화된 로그 포맷
- [ ] 로그 레벨 설정
- [ ] 로그 로테이션
- [ ] 민감정보 마스킹

---

## 🎯 다음 단계

모니터링 시스템 설정 완료 후:
1. ✅ **ESLint 설정** (완료)
2. ✅ **빌드 오류 해결** (완료)  
3. ✅ **환경 변수 설정** (완료)
4. ✅ **CI/CD 파이프라인** (완료)
5. 🔧 **모니터링 시스템** (이 가이드)
6. 🌐 **도메인 & SSL** (다음)

이 가이드를 따라 설정하면 SAYU의 모든 시스템을 실시간으로 모니터링할 수 있습니다!