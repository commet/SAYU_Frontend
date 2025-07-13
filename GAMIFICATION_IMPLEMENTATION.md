# 🎮 SAYU 게이미피케이션 시스템 구현 가이드

## 📋 시스템 개요

### 핵심 컨셉
- **레벨 시스템**: 첫 발걸음(1-10) → 호기심 가득(11-25) → 눈뜨는 중(26-50) → 감성 충만(51-75) → 예술혼(76-100)
- **포인트 시스템**: 활동별 포인트 획득 및 레벨업
- **칭호 시스템**: 활동 패턴에 따른 칭호 획득
- **전시 관람 모드**: 실시간 관람 시간 측정 및 포인트 획득

## 🗂️ 파일 구조

### Frontend
```
/frontend/components/gamification/
├── ExhibitionMode.tsx          # 전시 관람 모드 플로팅 위젯
├── ProfileLevel.tsx            # 프로필 레벨 표시 컴포넌트
├── TitleBadges.tsx            # 칭호 뱃지 시스템
└── GamificationDashboard.tsx  # 통합 대시보드

/frontend/lib/
├── gamification-api.ts        # API 클라이언트

/frontend/hooks/
└── useGamification.ts         # React 커스텀 훅
```

### Backend
```
/backend/src/services/
└── gamificationService.js     # 핵심 비즈니스 로직

/backend/src/routes/
└── gamificationRoutes.js      # API 라우트 정의

/backend/src/controllers/
└── gamificationController.js  # 컨트롤러 구현

/backend/migrations/
└── gamification-schema.sql    # 데이터베이스 스키마
```

## 🚀 구현 단계

### Phase 1: 백엔드 설정 (Day 1)

#### 1-1. 데이터베이스 마이그레이션
```bash
cd backend
psql $DATABASE_URL < migrations/gamification-schema.sql
```

#### 1-2. 필요 패키지 설치
```bash
npm install ioredis
```

#### 1-3. 서버 라우트 추가
```javascript
// src/server.js에 추가
const gamificationRoutes = require('./routes/gamificationRoutes');
app.use('/api/gamification', gamificationRoutes);
```

#### 1-4. Redis 설정
```javascript
// .env 파일에 추가
REDIS_URL=redis://localhost:6379
GAMIFICATION_ENABLED=true
```

### Phase 2: Frontend 기초 구현 (Day 2)

#### 2-1. 패키지 설치
```bash
cd frontend
npm install canvas-confetti @tanstack/react-query
```

#### 2-2. 환경 변수 설정
```bash
# .env.local에 추가
NEXT_PUBLIC_GAMIFICATION_ENABLED=true
```

#### 2-3. API 클라이언트 설정
```typescript
// lib/api-client.ts 확인 및 업데이트
// gamification-api.ts가 제대로 연결되는지 확인
```

### Phase 3: UI 컴포넌트 통합 (Day 3-4)

#### 3-1. 메인 레이아웃에 전시 모드 추가
```tsx
// app/layout.tsx 또는 _app.tsx
import ExhibitionMode from '@/components/gamification/ExhibitionMode';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ExhibitionMode /> {/* 플로팅 위젯 */}
      </body>
    </html>
  );
}
```

#### 3-2. 프로필 페이지 업데이트
```tsx
// app/profile/page.tsx
import ProfileLevel from '@/components/gamification/ProfileLevel';
import TitleBadges from '@/components/gamification/TitleBadges';

export default function ProfilePage() {
  return (
    <div>
      <ProfileLevel size="large" />
      <TitleBadges showProgress={true} />
    </div>
  );
}
```

#### 3-3. 대시보드 페이지 생성
```tsx
// app/gamification/page.tsx
import GamificationDashboard from '@/components/gamification/GamificationDashboard';

export default function GamificationPage() {
  return <GamificationDashboard />;
}
```

### Phase 4: 기능 연동 (Day 5-6)

#### 4-1. 전시 페이지에 관람 시작 버튼 추가
```tsx
// 전시 상세 페이지
import { useExhibitionSession } from '@/hooks/useGamification';

function ExhibitionDetail({ exhibitionId, exhibitionName }) {
  const { startSession, isActive } = useExhibitionSession();
  
  const handleVisitStart = () => {
    startSession({
      exhibitionId,
      exhibitionName,
      location: { lat: 37.5665, lng: 126.9780 } // 선택적
    });
  };
  
  return (
    <button onClick={handleVisitStart} disabled={isActive}>
      관람 시작
    </button>
  );
}
```

#### 4-2. 리뷰 작성 시 포인트 연동
```tsx
// 리뷰 작성 컴포넌트
import { useEarnPoints } from '@/hooks/useGamification';

function ReviewForm() {
  const { earnPoints } = useEarnPoints();
  
  const handleSubmit = async (reviewData) => {
    // 리뷰 저장 로직
    await saveReview(reviewData);
    
    // 포인트 획득
    earnPoints({
      activity: 'WRITE_REVIEW',
      metadata: {
        reviewLength: reviewData.content.length,
        exhibitionId: reviewData.exhibitionId
      }
    });
  };
}
```

### Phase 5: 테스트 및 최적화 (Day 7)

#### 5-1. 기능 테스트 체크리스트
- [ ] 전시 관람 시작/종료 정상 작동
- [ ] 포인트 획득 및 레벨업 알림
- [ ] 칭호 획득 및 표시
- [ ] 리더보드 정렬 및 표시
- [ ] 실시간 업데이트 (SSE)

#### 5-2. 성능 최적화
- React Query 캐싱 설정 확인
- 불필요한 리렌더링 방지
- 이미지 최적화

## 📊 포인트 시스템 상세

### 기본 활동 포인트
```javascript
const POINT_VALUES = {
  EXHIBITION_START: 10,      // 전시 관람 시작
  EXHIBITION_COMPLETE: 50,   // 전시 관람 완료
  WRITE_REVIEW: 30,          // 감상 작성
  UPLOAD_PHOTO: 20,          // 사진 업로드
  DAILY_CHECKIN: 20,         // 일일 체크인
  WEEKLY_STREAK: 100,        // 주간 연속 방문
  SHARE_SOCIAL: 15,          // 소셜 공유
  FOLLOW_USER: 10,           // 사용자 팔로우
  RECEIVE_LIKE: 5            // 좋아요 받기
};
```

### 보너스 배수
- 연속 방문: 3일(1.2x), 7일(1.5x)
- 시간대: 오전 10-14시(1.3x), 저녁 18-20시(1.2x)
- 프리미엄 회원: 1.2x

## 🏆 칭호 시스템

### 획득 가능 칭호
1. **얼리버드** - 오전 10시 이전 관람 5회
2. **야행성 올빼미** - 야간 개장 관람 3회
3. **느긋한 산책자** - 평균 관람 시간 2시간 이상
4. **열정 관람러** - 하루 3개 이상 전시 관람
5. **현대미술 마니아** - 현대미술 전시 20회
6. **사진전 애호가** - 사진전 15회
7. **K-아트 서포터** - 한국 작가전 10회

## 🔧 API 엔드포인트

### 주요 엔드포인트
```
GET  /api/gamification/dashboard         # 대시보드 데이터
POST /api/gamification/earn-points       # 포인트 획득
POST /api/gamification/exhibition/start  # 전시 세션 시작
POST /api/gamification/exhibition/end    # 전시 세션 종료
GET  /api/gamification/titles            # 칭호 목록
PUT  /api/gamification/titles/main       # 메인 칭호 설정
GET  /api/gamification/challenges        # 도전 과제
GET  /api/gamification/leaderboard       # 리더보드
```

## 🐛 문제 해결

### 일반적인 이슈
1. **포인트가 반영되지 않음**
   - Redis 연결 확인
   - 트랜잭션 롤백 여부 확인

2. **실시간 업데이트 안됨**
   - SSE 연결 상태 확인
   - CORS 설정 확인

3. **레벨업 알림 안뜸**
   - canvas-confetti 설치 확인
   - 이벤트 리스너 등록 확인

## 📈 모니터링 지표

### 추적할 주요 지표
- DAU/MAU (일간/월간 활성 사용자)
- 평균 세션 시간
- 레벨별 사용자 분포
- 칭호 획득률
- 포인트 획득 패턴

### 로깅 설정
```javascript
// 모든 포인트 획득 활동 로깅
log.info('Points earned', {
  userId,
  activity,
  points,
  multipliers,
  timestamp
});
```

## 🚀 향후 확장 계획

### Phase 6: 매칭 시스템 연동
- 레벨별 매칭 범위 확대
- 칭호 기반 관심사 매칭

### Phase 7: 보상 시스템
- 포인트 상점 구현
- 전시 할인 쿠폰
- 특별 이벤트 초대

### Phase 8: 소셜 기능
- 친구 리더보드
- 함께 관람 챌린지
- 칭호 공유하기

## 📝 체크리스트

### 구현 전 준비
- [ ] 데이터베이스 백업
- [ ] Redis 서버 준비
- [ ] 환경 변수 설정

### 구현 중
- [ ] 백엔드 서비스 구현
- [ ] 프론트엔드 컴포넌트 통합
- [ ] API 연동 테스트
- [ ] UI/UX 검토

### 구현 후
- [ ] 성능 테스트
- [ ] 사용자 피드백 수집
- [ ] 모니터링 대시보드 설정
- [ ] A/B 테스트 준비

## 🎯 성공 지표

- 사용자 참여도 20% 증가
- 평균 세션 시간 15% 증가
- 재방문율 30% 향상
- 리뷰 작성률 25% 증가

---

이 문서는 게이미피케이션 시스템의 완전한 구현을 위한 가이드입니다.
문제가 발생하거나 추가 기능이 필요한 경우 이슈를 등록해주세요.