# 🤖 SAYU AI 맞춤 추천 시스템

## 시스템 아키텍처

### 1. 데이터 수집 레이어

#### 명시적 데이터
```javascript
const ExplicitData = {
  // 초기 온보딩
  preferences: {
    genres: ["현대미술", "사진", "설치미술"],
    artists: ["구사마 야요이", "데이비드 호크니"],
    priceRange: { min: 0, max: 20000 },
    travelTime: 30, // 분
  },
  
  // 사용자 액션
  actions: {
    bookmarks: [], // 북마크한 전시
    ratings: [],   // 평점 (1-5)
    reviews: [],   // 작성한 리뷰
  }
}
```

#### 암묵적 데이터
```javascript
const ImplicitData = {
  // 행동 패턴
  behavior: {
    viewDuration: [], // 전시별 관람 시간
    viewFrequency: {}, // 장르별 방문 빈도
    timePatterns: {
    preferredDays: ["토", "일"],
    preferredHours: [14, 15, 16]
    },
    locationPatterns: {
      frequentAreas: ["강남", "성수"],
      maxDistance: 15 // km
    }
  },
  
  // 소셜 신호
  social: {
    followedUsers: [],
    sharedExhibitions: [],
    likedReviews: []
  }
}
```

### 2. AI 추천 알고리즘

#### 하이브리드 추천 모델
```python
class HybridRecommender:
    def __init__(self):
        self.content_based = ContentBasedFilter()
        self.collaborative = CollaborativeFilter()
        self.knowledge_based = KnowledgeBasedFilter()
        
    def recommend(self, user_id, context):
        # 1. 콘텐츠 기반 필터링 (40%)
        content_scores = self.content_based.score(
            user_preferences=user.genres,
            exhibition_features=exhibitions.features
        )
        
        # 2. 협업 필터링 (30%)
        collaborative_scores = self.collaborative.score(
            user_id=user_id,
            similar_users=find_similar_users(user_id)
        )
        
        # 3. 지식 기반 필터링 (20%)
        knowledge_scores = self.knowledge_based.score(
            rules=[
                "같은 작가의 다른 전시",
                "같은 시대/운동의 작품",
                "큐레이터 추천 연관 전시"
            ]
        )
        
        # 4. 컨텍스트 가중치 (10%)
        context_weight = self.calculate_context_weight(
            weather=context.weather,
            time=context.time,
            location=context.location,
            companion=context.with_whom
        )
        
        return self.combine_scores(
            content=content_scores * 0.4,
            collaborative=collaborative_scores * 0.3,
            knowledge=knowledge_scores * 0.2,
            context=context_weight * 0.1
        )
```

#### 실시간 개인화
```javascript
const RealtimePersonalization = {
  // 동적 가중치 조정
  adjustWeights: (userFeedback) => {
    if (userFeedback.clicked && !userFeedback.visited) {
      // 클릭했지만 방문 안함 -> 해당 특성 가중치 감소
      weights[feature] *= 0.95;
    } else if (userFeedback.visited && userFeedback.rating >= 4) {
      // 방문 후 높은 평가 -> 해당 특성 가중치 증가
      weights[feature] *= 1.1;
    }
  },
  
  // A/B 테스트
  experimentalFeatures: {
    "emotion_based": "오늘의 기분에 따른 추천",
    "weather_based": "날씨 기반 추천",
    "crowd_avoiding": "한산한 시간대 우선 추천"
  }
}
```

### 3. 추천 카테고리 상세

#### 3-1. 맞춤 추천 카테고리
```javascript
const RecommendationCategories = {
  // 1. 오늘의 추천 (Daily Pick)
  dailyPick: {
    algorithm: "highest_composite_score",
    factors: {
      matchScore: 0.4,
      proximity: 0.2,
      timing: 0.2,
      novelty: 0.1,
      social: 0.1
    },
    limit: 3,
    refreshInterval: "daily at 9am"
  },
  
  // 2. 놓치면 후회 (Don't Miss)
  dontMiss: {
    criteria: [
      "matchScore > 0.8 AND daysUntilEnd < 7",
      "trending AND notVisited",
      "followedCuratorPick"
    ],
    urgencyBadge: true,
    limit: 5
  },
  
  // 3. 새로운 발견 (Discover)
  discover: {
    algorithm: "exploration_exploitation",
    explorationRate: 0.2, // 20%는 새로운 장르
    criteria: "related_but_different",
    explanation: "why_you_might_like"
  },
  
  // 4. 함께 가면 좋은 (Social)
  social: {
    sources: [
      "friends_visited",
      "friends_bookmarked",
      "similar_taste_users"
    ],
    groupRecommendation: true
  },
  
  // 5. 이번 주 무료/할인
  deals: {
    types: ["free", "discount > 30%", "lastMinute"],
    prioritySort: "matchScore DESC, discount DESC"
  }
}
```

#### 3-2. 추천 이유 설명
```javascript
const ExplanationEngine = {
  generateExplanation: (exhibition, user, score) => {
    const reasons = [];
    
    // 취향 매칭
    if (score.genreMatch > 0.8) {
      reasons.push(`좋아하시는 ${user.topGenre}과 비슷해요`);
    }
    
    // 작가 연관성
    if (score.artistConnection) {
      reasons.push(`${user.favoriteArtist}와 같은 시대 작가예요`);
    }
    
    // 소셜 신호
    if (score.friendsVisited > 3) {
      reasons.push(`친구 ${score.friendsVisited}명이 다녀왔어요`);
    }
    
    // 위치/시간
    if (score.proximity < 2) {
      reasons.push(`지금 위치에서 ${score.proximity}km`);
    }
    
    return reasons.slice(0, 2).join(' · ');
  }
}
```

### 4. 프론트엔드 구현

#### 추천 페이지 UI
```tsx
// app/recommendations/page.tsx
'use client';

import { useRecommendations } from '@/hooks/useRecommendations';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { CategoryTabs } from '@/components/recommendations/CategoryTabs';

export default function RecommendationsPage() {
  const { recommendations, isLoading } = useRecommendations();
  const [activeCategory, setActiveCategory] = useState('dailyPick');
  
  return (
    <div className="recommendations-container">
      {/* 메인 추천 - 큰 카드 */}
      <section className="hero-recommendation">
        <div className="match-badge">
          {recommendations.topPick.matchScore}% 매치
        </div>
        <RecommendationCard 
          exhibition={recommendations.topPick}
          size="large"
          showExplanation
        />
      </section>
      
      {/* 카테고리 탭 */}
      <CategoryTabs 
        active={activeCategory}
        onChange={setActiveCategory}
        categories={[
          { id: 'dailyPick', label: '오늘의 추천', icon: '☀️' },
          { id: 'dontMiss', label: '놓치면 후회', icon: '🔥' },
          { id: 'discover', label: '새로운 발견', icon: '🔍' },
          { id: 'social', label: '함께 가요', icon: '👥' },
          { id: 'deals', label: '무료/할인', icon: '🎫' }
        ]}
      />
      
      {/* 카테고리별 리스트 */}
      <section className="category-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {recommendations[activeCategory]?.map(item => (
              <RecommendationCard
                key={item.id}
                exhibition={item}
                showUrgency={activeCategory === 'dontMiss'}
                showDiscount={activeCategory === 'deals'}
                showSocial={activeCategory === 'social'}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
```

#### 추천 카드 컴포넌트
```tsx
// components/recommendations/RecommendationCard.tsx
export function RecommendationCard({ 
  exhibition, 
  size = 'medium',
  showExplanation = false,
  showUrgency = false,
  showDiscount = false,
  showSocial = false 
}) {
  return (
    <Card className={`recommendation-card ${size}`}>
      {/* 매치 스코어 */}
      <div className="match-score">
        <CircularProgress value={exhibition.matchScore} />
        <span>{exhibition.matchScore}%</span>
      </div>
      
      {/* 긴급도 표시 */}
      {showUrgency && exhibition.daysLeft <= 7 && (
        <Badge variant="urgent">D-{exhibition.daysLeft}</Badge>
      )}
      
      {/* 전시 이미지 */}
      <div className="exhibition-image">
        <Image src={exhibition.poster} />
        {showDiscount && (
          <div className="discount-badge">
            {exhibition.discountRate}% OFF
          </div>
        )}
      </div>
      
      {/* 전시 정보 */}
      <div className="exhibition-info">
        <h3>{exhibition.title}</h3>
        <p className="venue">{exhibition.venue}</p>
        
        {/* 추천 이유 */}
        {showExplanation && (
          <div className="explanation">
            💡 {exhibition.explanation}
          </div>
        )}
        
        {/* 소셜 정보 */}
        {showSocial && (
          <div className="social-info">
            <AvatarGroup users={exhibition.friendsVisited} />
            <span>{exhibition.friendsVisited.length}명의 친구가 다녀왔어요</span>
          </div>
        )}
        
        {/* 빠른 정보 */}
        <div className="quick-info">
          <span>📍 {exhibition.distance}km</span>
          <span>💰 {exhibition.price.toLocaleString()}원</span>
          <span>📅 ~{exhibition.endDate}</span>
        </div>
      </div>
      
      {/* 액션 버튼 */}
      <div className="actions">
        <Button variant="ghost" onClick={handleBookmark}>
          <BookmarkIcon filled={exhibition.isBookmarked} />
        </Button>
        <Button variant="primary" onClick={handleDetail}>
          자세히 보기
        </Button>
      </div>
    </Card>
  );
}
```

### 5. 백엔드 API

#### 추천 서비스
```javascript
// services/recommendationService.js
class RecommendationService {
  constructor() {
    this.userProfiler = new UserProfiler();
    this.recommender = new HybridRecommender();
    this.explainer = new ExplanationEngine();
  }
  
  async getRecommendations(userId, options = {}) {
    // 1. 사용자 프로필 로드
    const userProfile = await this.userProfiler.getProfile(userId);
    
    // 2. 컨텍스트 수집
    const context = {
      time: new Date(),
      location: options.location,
      weather: await this.getWeather(options.location),
      companion: options.withWhom
    };
    
    // 3. 후보 전시 필터링
    const candidates = await this.getCandidateExhibitions({
      maxDistance: userProfile.maxTravelDistance,
      priceRange: userProfile.priceRange,
      excludeVisited: true
    });
    
    // 4. 스코어링
    const scored = await this.recommender.score(
      userProfile,
      candidates,
      context
    );
    
    // 5. 카테고리별 정렬
    const categorized = this.categorizeRecommendations(scored);
    
    // 6. 설명 생성
    const explained = this.addExplanations(categorized, userProfile);
    
    // 7. 캐싱
    await this.cache.set(
      `recommendations:${userId}`,
      explained,
      { ttl: 3600 } // 1시간
    );
    
    return explained;
  }
  
  // 실시간 피드백 학습
  async updateFromFeedback(userId, exhibitionId, action) {
    const feedback = {
      userId,
      exhibitionId,
      action, // 'click', 'bookmark', 'visit', 'rate'
      timestamp: new Date()
    };
    
    // 이벤트 스트림에 전송
    await this.eventStream.publish('recommendation.feedback', feedback);
    
    // 모델 재학습 큐에 추가
    if (action === 'visit' || action === 'rate') {
      await this.retrainQueue.add({
        userId,
        type: 'incremental'
      });
    }
  }
}
```

### 6. 데이터베이스 스키마

```sql
-- 사용자 선호도 테이블
CREATE TABLE user_preferences (
  user_id UUID REFERENCES users(id),
  preference_type VARCHAR(50), -- 'genre', 'artist', 'style'
  preference_value VARCHAR(200),
  score FLOAT DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 추천 로그 테이블
CREATE TABLE recommendation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  exhibition_id UUID REFERENCES exhibitions(id),
  score FLOAT,
  category VARCHAR(50),
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 피드백 테이블
CREATE TABLE recommendation_feedback (
  user_id UUID REFERENCES users(id),
  exhibition_id UUID REFERENCES exhibitions(id),
  action VARCHAR(50), -- 'view', 'click', 'bookmark', 'visit'
  action_value JSONB, -- 추가 데이터 (예: rating)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_recommendation_logs_user_date ON recommendation_logs(user_id, created_at DESC);
CREATE INDEX idx_feedback_user_exhibition ON recommendation_feedback(user_id, exhibition_id);
```

### 7. 성능 최적화

```javascript
const PerformanceOptimization = {
  // 1. 캐싱 전략
  caching: {
    userProfile: { ttl: 3600 }, // 1시간
    recommendations: { ttl: 1800 }, // 30분
    exhibitions: { ttl: 86400 } // 24시간
  },
  
  // 2. 배치 처리
  batchProcessing: {
    // 새벽 시간 사전 계산
    precompute: async () => {
      const activeUsers = await getActiveUsers();
      for (const userId of activeUsers) {
        await computeRecommendations(userId);
      }
    },
    schedule: '0 3 * * *' // 매일 새벽 3시
  },
  
  // 3. 점진적 로딩
  lazyLoading: {
    initialLoad: 5, // 처음 5개만
    scrollLoad: 10, // 스크롤시 10개씩
    maxItems: 50 // 최대 50개
  }
}
```

### 8. 모니터링 & 분석

```javascript
const RecommendationAnalytics = {
  // KPI 추적
  metrics: {
    ctr: "Click-Through Rate",
    conversionRate: "추천 -> 방문 전환율",
    satisfactionScore: "추천 만족도",
    diversityIndex: "추천 다양성 지수"
  },
  
  // A/B 테스트
  experiments: {
    "algorithm_v2": {
      control: "current_algorithm",
      variant: "new_neural_network",
      metrics: ["ctr", "conversion"],
      sampleSize: 0.1 // 10% 사용자
    }
  }
}
```

## 다음 단계

1. **Phase 1**: 기본 추천 알고리즘 구현
2. **Phase 2**: UI/UX 구현 및 통합
3. **Phase 3**: 피드백 루프 구축
4. **Phase 4**: ML 모델 고도화
5. **Phase 5**: A/B 테스트 및 최적화