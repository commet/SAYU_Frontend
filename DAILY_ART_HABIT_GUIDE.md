# SAYU Daily Art Habit - 완전 구현 가이드

## 개요

SAYU의 Daily Art Habit 기능은 사용자가 매일 예술 작품을 감상하는 습관을 만들 수 있도록 도와주는 PWA 기반 시스템입니다.

## 주요 기능

### 1. 시간대별 예술 활동

#### 출근길 3분 (오전 7-9시)
- 오늘의 작품 + 한 가지 질문
- "이 작품이 당신의 하루를 시작하는 색이라면?"
- 색상 선택 + 간단한 응답

#### 점심시간 5분 (오후 12-1시)
- 감정 체크인
- "지금 느끼는 감정과 어울리는 작품 고르기"
- 8가지 감정 옵션 + 작품 선택 + 이유 작성

#### 잠들기 전 10분 (밤 9-11시)
- 하루 돌아보기
- "오늘 하루를 한 작품으로 표현한다면?"
- 자유로운 성찰 + 감정 태그 추가

### 2. PWA 기능
- 네이티브 앱 같은 경험
- 오프라인 지원
- 홈 화면 설치 가능
- 푸시 알림

### 3. 스트릭 시스템
- 연속 기록 추적
- 마일스톤 보상:
  - 7일: 사유 뱃지
  - 30일: 특별 전시 초대
  - 100일: 아트 멘토 매칭

### 4. 개인화된 알림
- 사용자 맞춤 시간 설정
- 시간대별 다른 메시지
- 요일별 활성화 설정

## 기술 구조

### 백엔드

#### 데이터베이스 스키마
```sql
-- 사용자 습관 설정
user_habit_settings

-- 일일 예술 기록
daily_art_entries

-- 스트릭 추적
user_streaks

-- 감정 체크인
emotion_checkins

-- 푸시 알림 구독
push_subscriptions

-- 알림 로그
notification_logs

-- 습관 보상
habit_rewards

-- 일일 추천 작품 큐
daily_artwork_queue
```

#### API 엔드포인트
```
GET  /api/daily-habit/settings          # 습관 설정 조회
PUT  /api/daily-habit/settings          # 습관 설정 업데이트
GET  /api/daily-habit/today             # 오늘 기록 조회
POST /api/daily-habit/morning           # 아침 활동 기록
POST /api/daily-habit/lunch             # 점심 활동 기록
POST /api/daily-habit/night             # 밤 활동 기록
GET  /api/daily-habit/recommendation/:timeSlot  # 추천 작품
POST /api/daily-habit/push/subscribe    # 푸시 구독
GET  /api/daily-habit/streak            # 스트릭 조회
```

#### 크론 작업
```javascript
// 매일 오전 8시 - 아침 알림
cron.schedule('0 8 * * *', sendMorningNotifications);

// 매일 오후 12:30 - 점심 알림
cron.schedule('30 12 * * *', sendLunchNotifications);

// 매일 밤 10시 - 밤 알림
cron.schedule('0 22 * * *', sendNightNotifications);

// 매일 새벽 2시 - 추천 작품 큐 생성
cron.schedule('0 2 * * *', generateDailyArtworkQueue);
```

### 프론트엔드

#### 주요 컴포넌트
```typescript
// 메인 대시보드
DailyHabitDashboard

// 시간대별 세션
MorningSession
LunchSession  
NightSession

// 스트릭 표시
StreakDisplay

// 설정
HabitSettings
```

#### PWA 설정
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true
});

// manifest.json
{
  "name": "SAYU - Art Life Platform",
  "short_name": "SAYU",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#FF6B6B"
}
```

## 설치 및 설정

### 1. 백엔드 설정

#### 의존성 설치
```bash
cd backend
npm install web-push node-cron
```

#### 환경 변수 설정
```bash
# VAPID 키 생성
node scripts/generateVapidKeys.js

# .env 파일에 추가
ENABLE_DAILY_HABIT_JOBS=true
VAPID_PUBLIC_KEY=your-generated-public-key
VAPID_PRIVATE_KEY=your-generated-private-key
```

#### 데이터베이스 마이그레이션
```bash
# PostgreSQL에서 실행
psql -d your_database -f migrations/daily-art-habit-schema.sql
```

### 2. 프론트엔드 설정

#### 의존성 설치
```bash
cd frontend
npm install next-pwa
```

#### 환경 변수 설정
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_VAPID_KEY=your-generated-public-key
```

### 3. PWA 아이콘 생성
```bash
cd frontend
node scripts/generate-simple-icon.js
```

## 사용법

### 1. 사용자 등록 및 설정
1. `/daily-art` 페이지 접속
2. 알림 권한 허용
3. 푸시 알림 구독
4. 시간대 및 요일 설정

### 2. 일일 활동
1. 설정된 시간에 알림 수신
2. 해당 시간대 세션 참여
3. 작품 감상 및 기록
4. 스트릭 유지

### 3. 관리자 기능
```bash
# 테스트 알림 전송
curl -X POST http://localhost:3001/api/daily-habit/push/test \
  -H "Authorization: Bearer YOUR_TOKEN"

# 스트릭 통계 조회
curl http://localhost:3001/api/daily-habit/streak \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 배포

### Vercel (프론트엔드)
```bash
# 자동 배포 - main 브랜치 push 시
git push origin main
```

### Railway (백엔드)
```bash
# 환경 변수 설정
railway variables set ENABLE_DAILY_HABIT_JOBS=true
railway variables set VAPID_PUBLIC_KEY=your-key
railway variables set VAPID_PRIVATE_KEY=your-key

# 배포
railway deploy
```

## 모니터링

### 알림 전송 로그
```sql
SELECT * FROM notification_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### 사용자 활동 통계
```sql
SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN current_streak > 0 THEN 1 ELSE 0 END) as active_users,
  AVG(current_streak) as avg_streak
FROM user_streaks;
```

### 시스템 상태 확인
```bash
# 서버 상태
curl http://localhost:3001/api/health

# 크론 작업 상태
curl http://localhost:3001/api/metrics
```

## 문제 해결

### 1. 푸시 알림이 작동하지 않는 경우
- VAPID 키 확인
- 브라우저 권한 확인
- Service Worker 등록 상태 확인

### 2. 크론 작업이 실행되지 않는 경우
- `ENABLE_DAILY_HABIT_JOBS=true` 설정 확인
- 서버 시간대 확인
- 로그 파일 확인

### 3. 데이터베이스 연결 오류
- DATABASE_URL 확인
- 마이그레이션 실행 여부 확인
- pgvector 확장 설치 확인

## 성능 최적화

### 1. 캐싱 전략
- 추천 작품 미리 생성
- Redis 캐싱 활용
- 이미지 CDN 사용

### 2. 배치 처리
- 알림 전송 배치화
- 데이터 정리 자동화
- 분석 데이터 사전 계산

### 3. 모바일 최적화
- PWA 오프라인 지원
- 이미지 압축
- 네트워크 상태 감지

## 향후 개선사항

### 1. AI 개인화
- 사용자 선호도 학습
- 감정 기반 추천 개선
- 시간대별 최적화

### 2. 소셜 기능
- 친구와 스트릭 공유
- 그룹 챌린지
- 커뮤니티 갤러리

### 3. 고급 분석
- 감정 패턴 분석
- 예술 취향 진화 추적
- 개인 리포트 생성

## 기여하기

1. 이슈 리포팅: GitHub Issues 사용
2. 기능 제안: Discussions 활용
3. 코드 기여: Pull Request 제출

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.