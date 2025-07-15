# Railway Cron Jobs 배포 가이드

## 🚀 Railway에 Cron Service 배포하기

### 1. Railway 프로젝트 설정

#### A. 새로운 Service 생성
1. Railway 대시보드에서 기존 프로젝트 선택
2. "Add Service" → "GitHub Repo" 선택
3. SAYU 레포지토리 선택
4. Service 이름: `sayu-cron-jobs`

#### B. 환경변수 설정
Railway 대시보드에서 다음 환경변수들을 설정하세요:

```env
# 기본 설정
NODE_ENV=production
PORT=8080

# 데이터베이스
DATABASE_URL=postgresql://[Railway PostgreSQL URL]
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_KEY=[your-service-role-key]

# 크론 작업 설정
ENABLED_CRON_JOBS=all
# 또는 선택적으로: exhibition-collection,data-backup,system-maintenance,status-update

# API 키들
NAVER_CLIENT_ID=[네이버 API 클라이언트 ID]
NAVER_CLIENT_SECRET=[네이버 API 클라이언트 시크릿]

# 로깅
LOG_LEVEL=info

# Redis (선택사항)
REDIS_URL=[Railway Redis URL]

# 모니터링 (선택사항)
SENTRY_DSN=[Sentry DSN]
```

### 2. Build 및 Start 명령 설정

Railway 설정에서:
- **Build Command**: `npm install`
- **Start Command**: `node railway-cron.js`

### 3. 배포 과정

#### A. 코드 푸시
```bash
git add .
git commit -m "feat: Railway cron jobs service 추가"
git push origin main
```

#### B. Railway 자동 배포
- Railway가 자동으로 변경사항을 감지하고 배포 시작
- 빌드 로그를 통해 배포 상태 확인

#### C. 배포 확인
```bash
# 헬스체크
curl https://[your-cron-service].railway.app/health

# 응답 예시:
{
  "status": "healthy",
  "timestamp": "2025-07-15T12:00:00.000Z",
  "jobs": {
    "exhibition-collection": {
      "running": true,
      "scheduled": true
    },
    "data-backup": {
      "running": true,
      "scheduled": true
    }
  },
  "environment": "production",
  "enabledJobs": ["exhibition-collection", "data-backup", "system-maintenance", "status-update"]
}
```

### 4. Cron Job 스케줄

| 작업 | 스케줄 | 설명 |
|------|--------|------|
| `exhibition-collection` | 매일 오전 6시 | Naver API에서 새로운 전시 수집 |
| `data-backup` | 매일 오전 2시 | 전시 데이터 백업 및 정리 |
| `system-maintenance` | 매주 일요일 오전 3시 | 시스템 유지보수 작업 |
| `status-update` | 매일 오전 9시 | 전시 상태 자동 업데이트 |

### 5. 수동 작업 실행 (테스트용)

```bash
# 전시 수집 수동 실행
curl https://[your-cron-service].railway.app/jobs/trigger/exhibition-collection

# 백업 수동 실행
curl https://[your-cron-service].railway.app/jobs/trigger/data-backup
```

### 6. 모니터링 및 로그

#### A. Railway 로그 확인
Railway 대시보드 → Your Service → Logs

#### B. 데이터베이스 로그 확인
```sql
-- 최근 cron job 실행 기록
SELECT * FROM cron_job_logs 
ORDER BY executed_at DESC 
LIMIT 20;

-- 실패한 작업 확인
SELECT * FROM cron_job_logs 
WHERE status = 'failed' 
ORDER BY executed_at DESC;

-- 작업별 성공률
SELECT 
    job_name,
    COUNT(*) as total_runs,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_runs,
    ROUND(COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM cron_job_logs 
WHERE executed_at >= NOW() - INTERVAL '30 days'
GROUP BY job_name;
```

### 7. 문제 해결

#### A. 서비스가 시작되지 않는 경우
1. Railway 로그에서 에러 메시지 확인
2. 환경변수 설정 검증
3. 데이터베이스 연결 확인

#### B. Cron 작업이 실행되지 않는 경우
1. 헬스체크 엔드포인트 확인
2. `ENABLED_CRON_JOBS` 환경변수 확인
3. 시간대 설정 확인 (Asia/Seoul)

#### C. 메모리 부족 오류
Railway 서비스 설정에서 메모리 할당량 증가:
- Settings → Resources → Memory: 512MB 이상

### 8. 보안 고려사항

#### A. 환경변수 보안
- 모든 API 키와 DB 연결 정보는 Railway 환경변수로 관리
- `.env` 파일은 절대 커밋하지 않음

#### B. API 엑세스 제한
- 헬스체크 엔드포인트 외에는 공개 접근 제한
- 필요시 API 키 인증 추가

#### C. 로그 보안
- 민감한 정보는 로그에 기록하지 않음
- 정기적으로 오래된 로그 정리

### 9. 비용 최적화

#### A. Railway 리소스 설정
- CPU: 0.5 vCPU (cron 작업에 충분)
- Memory: 512MB
- 네트워크: 기본값

#### B. 작업 빈도 조정
- 개발 환경에서는 더 적은 빈도로 실행
- `ENABLED_CRON_JOBS` 환경변수로 필요한 작업만 활성화

### 10. 업데이트 및 배포

#### A. 코드 업데이트
```bash
git add .
git commit -m "update: cron job improvements"
git push origin main
```

#### B. 무중단 배포
Railway는 자동으로 무중단 배포를 수행하며, 기존 cron 작업은 계속 실행됩니다.

---

## 📊 성공 메트릭

배포 성공 후 다음을 확인하세요:

- ✅ 헬스체크 엔드포인트 응답 정상
- ✅ 모든 cron 작업 스케줄링 완료
- ✅ 데이터베이스 로그 테이블 생성
- ✅ 첫 번째 작업 실행 완료
- ✅ Railway 대시보드에서 서비스 상태 정상

배포 완료 후 **24시간 내**에 모든 cron 작업이 최소 1회씩 실행되어야 합니다.