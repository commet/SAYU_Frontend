# SAYU 게이미피케이션 시스템 구현 가이드

## 🎮 시스템 개요

SAYU의 레벨/포인트 시스템이 Supabase 기반으로 구현되었습니다.

### 레벨 체계
- **레벨 공식**: 레벨 n 달성에 필요한 총 포인트 = n × (n+1) × 500
- **예시**:
  - Lv1 → Lv2: 1,000p 필요
  - Lv2 → Lv3: 2,000p 추가 필요 (총 3,000p)
  - Lv3 → Lv4: 3,000p 추가 필요 (총 6,000p)

### 포인트 획득 체계

#### 1. 일회성 활동
- 회원가입: 500p
- APT 검사 완료: 300p
- AI 프로필 생성: 200p
- 프로필 완성: 100p

#### 2. 일일 활동 (제한 있음)
- 일일 로그인: 10p (하루 1회)
- 작품 좋아요: 5p (하루 최대 10회, 50p)
- 작품 저장: 10p (하루 최대 5회, 50p)
- 댓글 작성: 10p (하루 최대 3회, 30p)
- 프로필 공유: 30p (하루 1회)

#### 3. 전시 활동
- 전시 기록 작성: 100p
- 상세 리뷰 (100자 이상): +50p
- 사진 업로드: 20p/장 (최대 5장, 100p)
- 전시 평가: 30p

#### 4. 소셜 활동
- 팔로워 획득: 20p
- 사용자 팔로우: 10p
- 친구 초대 성공: 100p

## 📊 데이터베이스 구조

### 1. Supabase 테이블 생성
```bash
# SQL 스크립트 실행
psql -h your-supabase-host -U postgres -d your-database < scripts/create-gamification-tables.sql
```

### 2. 주요 테이블
- `user_game_profiles`: 사용자 게임 프로필
- `point_transactions`: 포인트 거래 내역
- `daily_activity_limits`: 일일 활동 제한
- `level_definitions`: 레벨 정의
- `point_rules`: 포인트 규칙

## 🔧 백엔드 설정

### 1. 환경 변수 설정
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. 서버 라우트 등록
```javascript
// backend/src/server.js
const gamificationV2Routes = require('./routes/gamificationV2');
app.use('/api/gamification-v2', gamificationV2Routes);
```

## 💻 프론트엔드 사용법

### 1. Hook 사용
```typescript
import { useGamificationV2 } from '@/hooks/useGamificationV2';

function MyComponent() {
  const {
    stats,
    loading,
    handleLikeArtwork,
    handleCreateExhibitionRecord
  } = useGamificationV2();

  // 레벨과 포인트 표시
  if (!loading && stats) {
    return (
      <div>
        <p>레벨: {stats.level}</p>
        <p>포인트: {stats.total_points}</p>
        <p>진행도: {stats.levelProgress}%</p>
      </div>
    );
  }
}
```

### 2. 포인트 획득 이벤트 예시

#### 로그인 시
```typescript
// app/login/page.tsx 또는 인증 콜백
const { handleDailyLogin } = useGamificationV2();

const onLoginSuccess = async () => {
  const result = await handleDailyLogin();
  if (result.success) {
    toast.success(`일일 로그인 보너스 ${result.pointsAdded}p 획득!`);
  }
};
```

#### APT 테스트 완료
```typescript
// app/quiz/page.tsx
const { handleAptTestComplete } = useGamificationV2();

const onQuizComplete = async () => {
  const result = await handleAptTestComplete();
  if (result.success) {
    toast.success(`APT 테스트 완료! ${result.pointsAdded}p 획득!`);
    if (result.leveledUp) {
      toast.success(`레벨업! 현재 레벨: ${result.newLevel}`);
    }
  }
};
```

#### 작품 좋아요
```typescript
// components/gallery/ArtworkCard.tsx
const { handleLikeArtwork } = useGamificationV2();

const onLikeClick = async (artworkId: string) => {
  const result = await handleLikeArtwork(artworkId);
  if (result.success) {
    toast.success(`+${result.pointsAdded}p`);
  } else if (result.message === 'Daily limit reached') {
    toast.info('오늘의 좋아요 포인트를 모두 획득했습니다');
  }
};
```

#### 전시 기록 작성
```typescript
// components/exhibition/ExhibitionArchiveForm.tsx
const { handleCreateExhibitionRecord, handleWriteDetailedReview } = useGamificationV2();

const onSaveExhibition = async (data: ExhibitionData) => {
  // 기본 포인트
  const recordResult = await handleCreateExhibitionRecord(data.exhibitionId);
  
  // 상세 리뷰 보너스
  if (data.notes && data.notes.length >= 100) {
    const reviewResult = await handleWriteDetailedReview(
      data.exhibitionId,
      data.notes.length
    );
  }
  
  toast.success(`전시 기록 완료! 총 ${totalPoints}p 획득!`);
};
```

## 🎯 통합 체크리스트

### 필수 구현 항목
- [ ] Supabase 테이블 생성
- [ ] 백엔드 라우트 등록
- [ ] 환경 변수 설정
- [ ] 프로필 페이지에 실제 데이터 연동
- [ ] 로그인 시 포인트 지급
- [ ] APT 테스트 완료 시 포인트 지급
- [ ] 갤러리 좋아요/저장 시 포인트 지급
- [ ] 전시 기록 작성 시 포인트 지급
- [ ] 리더보드 페이지 구현
- [ ] 포인트 히스토리 표시

### 선택 구현 항목
- [ ] 레벨업 애니메이션
- [ ] 포인트 획득 토스트 메시지
- [ ] 일일 활동 제한 UI
- [ ] 친구 초대 시스템
- [ ] 배지/칭호 시스템

## 🐛 트러블슈팅

### 1. 포인트가 추가되지 않는 경우
- Supabase RLS 정책 확인
- 서비스 역할 키 확인
- 일일 제한 확인

### 2. 레벨이 업데이트되지 않는 경우
- `add_points` SQL 함수 확인
- 레벨 계산 로직 확인

### 3. API 호출 실패
- CORS 설정 확인
- 인증 토큰 확인
- 네트워크 연결 확인

## 📝 추가 개발 계획

1. **배지 시스템**: 특정 조건 달성 시 배지 획득
2. **시즌 시스템**: 3개월 단위 시즌제 도입
3. **길드 시스템**: 사용자 그룹 경쟁
4. **스페셜 이벤트**: 기간 한정 포인트 배수 이벤트
5. **포인트 샵**: 포인트로 구매 가능한 아이템

## 🔗 관련 파일

- SQL 스키마: `/scripts/create-gamification-tables.sql`
- 백엔드 서비스: `/backend/src/services/supabaseGamificationService.js`
- 백엔드 라우트: `/backend/src/routes/gamificationV2.js`
- 프론트엔드 API: `/frontend/lib/gamification-v2-api.ts`
- 프론트엔드 Hook: `/frontend/hooks/useGamificationV2.ts`