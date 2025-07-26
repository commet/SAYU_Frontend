# SAYU 게이미피케이션 시스템 🎮

## 개요
SAYU의 게이미피케이션 시스템은 사용자 참여도를 높이고 지속적인 활동을 유도하기 위한 보상 시스템입니다. Redis를 활용한 실시간 리더보드와 최적화된 쿼리로 고성능을 보장합니다.

## 🏗️ 시스템 아키텍처

### 1. 레벨 시스템 (5단계)
```javascript
레벨 1: 예술 입문자 (0-100 XP) 🌱
레벨 2: 예술 탐험가 (100-300 XP) 🔍
레벨 3: 예술 애호가 (300-600 XP) 💜
레벨 4: 예술 전문가 (600-1000 XP) ⭐
레벨 5: 예술 마스터 (1000+ XP) 👑
```

### 2. XP 획득 방법
- **일일 로그인**: 10 XP
- **작품 감상**: 5 XP
- **퀴즈 완료**: 20 XP
- **팔로우**: 10 XP
- **작품 공유**: 15 XP
- **AI 프로필 생성**: 30 XP (1회)
- **전시 방문**: 25 XP
- **리뷰 작성**: 20 XP
- **좋아요 받기**: 5 XP
- **7일 연속 접속**: 50 XP (보너스)

### 3. 일일 퀘스트
- 매일 접속하기 (10 XP)
- 작품 3개 감상하기 (15 XP)
- 퀴즈 참여하기 (20 XP)
- 새로운 친구 만들기 (10 XP)
- 작품 공유하기 (15 XP)

### 4. 스트릭 시스템
- 연속 접속일 추적
- 7일 연속 접속 시 보너스 XP
- 최장 스트릭 기록 보관

### 5. 리더보드
- **주간**: 매주 월요일 리셋
- **월간**: 매월 1일 리셋
- **전체**: 누적 XP 순위
- Redis를 활용한 실시간 업데이트

## 🚀 성능 최적화

### 1. Redis 캐싱 전략
```javascript
// 사용자 통계: 5분 캐시
user:stats:{userId} → TTL: 300s

// 일일 퀘스트: 1시간 캐시
quests:{userId}:{date} → TTL: 3600s

// 주간 리더보드: 7일 캐시
leaderboard:weekly:{weekStart} → TTL: 604800s
```

### 2. 데이터베이스 인덱스
```sql
-- 최적화된 인덱스
CREATE INDEX idx_user_levels_level ON user_levels(level);
CREATE INDEX idx_user_levels_total_xp ON user_levels(total_xp DESC);
CREATE INDEX idx_user_quests_user_date ON user_quests(user_id, date);
CREATE INDEX idx_weekly_leaderboard_week ON weekly_leaderboard(week_start, week_end);
CREATE INDEX idx_weekly_leaderboard_rank ON weekly_leaderboard(week_start, rank);
```

### 3. 쿼리 최적화
- 단일 트랜잭션으로 XP 업데이트 및 퀘스트 진행도 처리
- 배치 업데이트로 리더보드 갱신
- React Query를 통한 프론트엔드 캐싱

## 📊 데이터베이스 구조

### 주요 테이블
1. **user_levels**: 사용자 레벨 정보
2. **user_quests**: 일일 퀘스트 진행도
3. **user_streaks**: 연속 접속 정보
4. **xp_transactions**: XP 획득 로그
5. **weekly_leaderboard**: 주간 리더보드 캐시
6. **user_leagues**: 리그 시스템
7. **reward_definitions**: 보상 정의
8. **user_rewards**: 사용자 보상

## 🔧 구현 파일

### Backend
- `/backend/src/services/optimizedGamificationService.js` - 핵심 서비스 로직
- `/backend/src/controllers/gamificationOptimizedController.js` - API 컨트롤러
- `/backend/src/routes/gamificationOptimizedRoutes.js` - API 라우트
- `/backend/src/scripts/createGamificationTables.js` - DB 스키마
- `/backend/src/cron/gamificationCron.js` - 크론 작업

### Frontend
- `/frontend/src/types/gamification.ts` - TypeScript 타입 정의
- `/frontend/src/lib/gamification-api.ts` - API 클라이언트
- `/frontend/src/hooks/useGamification.ts` - React Query 훅
- `/frontend/src/components/gamification/*` - UI 컴포넌트

## 🎯 사용 방법

### 1. 데이터베이스 설정
```bash
cd backend
node src/scripts/createGamificationTables.js
```

### 2. 서버 라우트 추가
```javascript
// server.js에 추가
const { router: gamificationOptimizedRoutes } = require('./routes/gamificationOptimizedRoutes');
app.use('/api/gamification', gamificationOptimizedRoutes);
```

### 3. 크론 작업 시작
```javascript
// 프로덕션 환경에서
const { startGamificationCron } = require('./cron/gamificationCron');
startGamificationCron();
```

### 4. 프론트엔드 통합
```typescript
// 사용자 통계 표시
import { useUserStats } from '@/hooks/useGamification';

function Profile() {
  const { data: stats } = useUserStats();
  // ...
}
```

## 📈 모니터링

### Redis 모니터링
```bash
# 리더보드 확인
redis-cli ZREVRANGE leaderboard:weekly:2024-01-01 0 10 WITHSCORES

# 캐시 상태 확인
redis-cli INFO stats
```

### 성능 메트릭
- 평균 API 응답시간: < 50ms
- 캐시 히트율: > 85%
- 동시 사용자: 1000+

## 🔮 향후 계획

### Supabase 마이그레이션 시
1. **Realtime 리더보드**: Supabase Realtime으로 실시간 업데이트
2. **Edge Functions**: XP 계산 로직을 Edge Functions로 이전
3. **Row Level Security**: 사용자별 데이터 접근 제어
4. **Database Functions**: 복잡한 쿼리를 PostgreSQL 함수로 최적화

### 추가 기능
- 월간 시즌 시스템
- 특별 이벤트 XP 부스터
- 친구 간 경쟁 시스템
- 커스텀 배지 시스템

## 🐛 트러블슈팅

### Redis 연결 실패
```javascript
// Redis 없이도 작동하도록 폴백 처리됨
if (redis) {
  // Redis 사용
} else {
  // DB 직접 조회
}
```

### XP 중복 획득 방지
- 일일 로그인: 날짜별 Redis 키로 중복 체크
- 작품 감상: 사용자-작품 조합으로 중복 체크

## 📞 문의
게이미피케이션 시스템 관련 문의는 GitHub Issues를 통해 접수해주세요.