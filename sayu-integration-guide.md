# SAYU x 문화포털 API 통합 가이드

## 🎯 개요

SAYU 플랫폼에 한국문화포털 API를 통합하여 감정 기반 문화 콘텐츠 추천 시스템을 구축합니다.

## 📋 필수 준비사항

### 1. API 키 발급
- [공공데이터포털](https://www.data.go.kr) 가입
- "한눈에보는문화정보" 서비스 활용 신청
- 발급받은 서비스 키를 환경변수에 저장

### 2. 기술 스택
- **Backend**: Node.js + Express (Railway 배포)
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **Frontend**: React + Tailwind CSS

## 🏗️ 아키텍처

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  SAYU API    │────▶│ Culture API │
│    React    │     │   Railway    │     │  data.go.kr │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
               ┌────────┐    ┌────────┐
               │Supabase│    │ Redis  │
               └────────┘    └────────┘
```

## 🚀 구현 단계

### Step 1: 백엔드 설정

```bash
# 프로젝트 생성
mkdir sayu-backend && cd sayu-backend
npm init -y

# 의존성 설치
npm install express axios @supabase/supabase-js redis express-rate-limit cors helmet dotenv fast-xml-parser

# 개발 의존성
npm install -D nodemon jest eslint
```

### Step 2: API 서비스 구현

1. **CulturePortalService 생성**
   - XML 응답 파싱
   - 에러 핸들링 및 캐싱
   - 감정 태그 분석

2. **API 엔드포인트 구현**
   - `/api/culture/recommendations` - 맞춤 추천
   - `/api/culture/explore/location` - 위치 기반
   - `/api/culture/search/emotion` - 감정 검색
   - `/api/culture/quest/available` - 퀘스트
   - `/api/culture/performance/:id` - 상세 정보

### Step 3: 데이터베이스 설계

```sql
-- Supabase에서 실행
CREATE TABLE performance_emotions (
  performance_id VARCHAR(20) PRIMARY KEY,
  emotion_tags TEXT[],
  user_type_match JSONB
);

CREATE TABLE user_interactions (
  user_id UUID,
  performance_id VARCHAR(20),
  interaction_type VARCHAR(50),
  emotion_state JSONB
);
```

### Step 4: 감정 매핑 로직

```javascript
// 문화포털 분류 코드 → SAYU 감정 매핑
const realmToEmotion = {
  'A000': ['contemplative', 'introspective'], // 연극
  'B000': ['joy', 'energetic'],               // 음악
  'C000': ['energetic', 'expressive'],        // 무용
  'D000': ['contemplative', 'curious'],       // 전시
  'E000': ['joy', 'playful'],                 // 아동
  'F000': ['social', 'festive']               // 행사
};
```

### Step 5: Railway 배포

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인 및 프로젝트 생성
railway login
railway init

# 환경변수 설정
railway variables set CULTURE_PORTAL_API_KEY=your_key
railway variables set SUPABASE_URL=your_url
railway variables set SUPABASE_ANON_KEY=your_key

# 배포
railway up
```

## 🔧 주요 기능 구현

### 1. 사용자 타입별 추천 알고리즘

```javascript
function calculateUserTypeMatch(performance, userType) {
  const scores = {
    'GAMF': calculateGAMFScore(performance),
    'SEMS': calculateSEMSScore(performance),
    // ... 16가지 타입
  };
  return scores[userType] || 0;
}
```

### 2. 감정 상태 분석

```javascript
async function analyzeEmotionalContext(userId) {
  // 최근 상호작용 분석
  const recentInteractions = await getRecentInteractions(userId);
  
  // 감정 패턴 추출
  const emotionPattern = extractEmotionPattern(recentInteractions);
  
  // 추천 가중치 조정
  return adjustRecommendationWeights(emotionPattern);
}
```

### 3. 실시간 캐싱 전략

```javascript
// Redis 캐싱
const cacheKey = `culture:${endpoint}:${JSON.stringify(params)}`;
const cached = await redis.get(cacheKey);

if (cached) return JSON.parse(cached);

const data = await fetchFromAPI();
await redis.setex(cacheKey, 3600, JSON.stringify(data));
```

## 📊 성능 최적화

### 1. API 호출 최적화
- 병렬 요청 처리 (`Promise.all`)
- 응답 데이터 압축
- 페이지네이션 구현

### 2. 데이터베이스 최적화
- 인덱스 생성
- 쿼리 최적화
- 커넥션 풀링

### 3. 캐싱 전략
- Redis: 1시간 TTL
- 브라우저: 15분 캐시
- CDN: 정적 자원

## 🔍 모니터링

### 1. 로깅
```javascript
// 구조화된 로깅
logger.info('API_CALL', {
  endpoint,
  userId,
  responseTime,
  status
});
```

### 2. 메트릭 수집
- API 응답 시간
- 캐시 히트율
- 사용자 타입별 매치율

## 🚨 에러 처리

### 1. API 에러 코드 매핑
```javascript
const errorMap = {
  '1': 'APPLICATION_ERROR',
  '4': 'HTTP_ERROR',
  '12': 'NO_OPENAPI_SERVICE_ERROR',
  '20': 'SERVICE_ACCESS_DENIED_ERROR',
  '22': 'LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR',
  '30': 'SERVICE_KEY_IS_NOT_REGISTERED_ERROR',
  '31': 'DEADLINE_HAS_EXPIRED_ERROR',
  '32': 'UNREGISTERED_IP_ERROR',
  '99': 'UNKNOWN_ERROR'
};
```

### 2. 폴백 전략
- 캐시된 데이터 사용
- 기본 추천 목록 제공
- 사용자 친화적 에러 메시지

## 📱 프론트엔드 통합

### 1. API 훅 생성
```javascript
// hooks/useCultureAPI.js
export function useCultureRecommendations() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchRecommendations = useCallback(async (params) => {
    setLoading(true);
    try {
      const response = await apiService.getRecommendations(params);
      setData(response.data);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { data, loading, fetchRecommendations };
}
```

### 2. 상태 관리
```javascript
// stores/cultureStore.js
const cultureStore = create((set) => ({
  performances: [],
  selectedEmotion: 'joy',
  userTypeMatch: {},
  
  setPerformances: (performances) => set({ performances }),
  setEmotion: (emotion) => set({ selectedEmotion: emotion })
}));
```

## 🎯 다음 단계

1. **고급 기능**
   - AI 기반 감정 분석
   - 협업 필터링
   - 실시간 알림

2. **성능 개선**
   - GraphQL 도입
   - 마이크로서비스 분리
   - 엣지 컴퓨팅

3. **사용자 경험**
   - AR 미리보기
   - 소셜 기능
   - 게이미피케이션

## 📚 참고 자료

- [문화포털 API 문서](https://www.culture.go.kr/guide/docs/new_ppds_guide.zip)
- [Railway 문서](https://docs.railway.app)
- [Supabase 문서](https://supabase.com/docs)
- [Redis 문서](https://redis.io/docs)

---

**문의사항이 있으시면 언제든 도움 드리겠습니다!** 🚀