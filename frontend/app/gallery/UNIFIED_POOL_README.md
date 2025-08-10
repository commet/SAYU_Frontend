# SAYU 통합 작품 풀 시스템 🎨

1,800+ 작품으로 구성된 SAYU의 통합 작품 추천 시스템입니다.

## 🎯 시스템 구성

### 데이터 소스
- **Cloudinary 작품**: 1,761개 (Art Institute of Chicago, Met Museum, Cleveland Museum, Artvee)
- **Wikimedia 걸작**: 45개 (세계적으로 유명한 퍼블릭 도메인 작품들)
- **총 작품 수**: 1,806개

### 핵심 파일들
```
frontend/app/gallery/
├── artwork-pool-builder.ts      # 통합 풀 구성 및 변환 로직
├── unified-pool-integration.ts  # SAYU 추천 시스템 연결
├── usage-example.tsx           # 실제 사용 예시 컴포넌트
├── test-unified-pool.js        # 시스템 테스트 스크립트
└── UNIFIED_POOL_README.md      # 이 문서
```

## 🚀 빠른 시작

### 1. 기본 사용법

```typescript
import { 
  getAllArtworks, 
  getCloudinaryArtworks,
  getArtworksForPersonalityType 
} from './artwork-pool-builder';

// 전체 작품 풀 로드
const pool = await getAllArtworks();
console.log(`총 ${pool.total}개 작품 로드됨`);

// 개성 유형별 추천 (SAYU 16가지 동물 유형)
const foxWorks = await getArtworksForPersonalityType('LAEF'); // 여우
const dogWorks = await getArtworksForPersonalityType('SREF'); // 강아지
```

### 2. SAYU 추천 시스템 연결

```typescript
import { 
  unifiedRecommendationEngine,
  getRecommendationsForUser 
} from './unified-pool-integration';

// 사용자 개성에 맞춤 추천
const recommendations = await getRecommendationsForUser('LAEF', 12);

// 테마별 검색
const impressionistWorks = await unifiedRecommendationEngine
  .getThemeRecommendations('impressionist', 8);
```

### 3. React 컴포넌트에서 사용

```tsx
'use client';
import React, { useState, useEffect } from 'react';
import { getRecommendationsForUser, SayuRecommendation } from './unified-pool-integration';

export function MyGallery() {
  const [recommendations, setRecommendations] = useState<SayuRecommendation[]>([]);
  
  useEffect(() => {
    const loadArtworks = async () => {
      const recs = await getRecommendationsForUser('LAEF', 10);
      setRecommendations(recs);
    };
    loadArtworks();
  }, []);

  return (
    <div className="gallery">
      {recommendations.map((rec, index) => (
        <div key={index} className="artwork-card">
          <img src={rec.image} alt={rec.title} />
          <h3>{rec.title}</h3>
          <p>{rec.artist} • {rec.year}</p>
          <p>{rec.curatorNote}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🎭 SAYU 16가지 개성 유형별 추천

각 동물 유형별로 최적화된 작품 추천이 제공됩니다:

```typescript
// 여우 (LAEF) - 몽환적 방랑자
await getArtworksForPersonalityType('LAEF');
// → 추상, 신비로운, 복잡한, 개인적인 작품들

// 강아지 (SREF) - 사교적 탐험가  
await getArtworksForPersonalityType('SREF');
// → 사회적, 즐거운, 따뜻한, 공공적인 작품들

// 고양이 (LAEC) - 독립적 예술가
await getArtworksForPersonalityType('LAEC');
// → 섬세한, 미적인, 개인적인, 단순한 작품들
```

## 🔍 검색 및 필터링

### 유형별 필터링
```typescript
import { getArtworksByType } from './artwork-pool-builder';

// 시대별 필터링
const renaissanceWorks = await getArtworksByType('period', 'renaissance');

// 매체별 필터링  
const oilPaintings = await getArtworksByType('medium', 'oil');

// 복잡도별 필터링
const complexWorks = await getArtworksByType('complexity', 'complex');

// 사회적 맥락별 필터링
const intimateWorks = await getArtworksByType('social_context', 'intimate');
```

### 키워드 검색
```typescript
import { searchArtworks } from './artwork-pool-builder';

// 작가명으로 검색
const vanGoghWorks = await searchArtworks('van gogh');

// 테마로 검색
const portraitWorks = await searchArtworks('portrait');

// 무드로 검색
const peacefulWorks = await searchArtworks('peaceful');
```

## 📊 작품 데이터 구조

### UnifiedArtwork 인터페이스
```typescript
interface UnifiedArtwork {
  id: string;                    // 고유 식별자
  title: string;                 // 작품명
  artist: string;                // 작가명 (정리됨)
  year?: string;                 // 제작년도
  period?: string;               // 시대 구분
  movement?: string;             // 미술 사조
  medium: string;                // 매체/기법
  source: 'cloudinary' | 'wikimedia'; // 소스 구분
  
  // 이미지
  imageUrl: string;              // 메인 이미지 URL
  thumbnailUrl?: string;         // 썸네일 이미지
  
  // 메타데이터
  description?: string;          // 작품 설명
  classification?: string;       // 분류 (painting, sculpture 등)
  department?: string;           // 소장 기관
  
  // SAYU 맞춤형 태그
  themes: string[];              // 테마 태그들
  mood: string[];                // 무드 태그들
  complexity: 'simple' | 'moderate' | 'complex'; // 복잡도
  social_context: 'intimate' | 'social' | 'public' | 'solitary'; // 사회적 맥락
}
```

### SayuRecommendation 인터페이스
```typescript
interface SayuRecommendation {
  title: string;
  artist: string;
  year: string;
  description: string;
  category?: string[];           // 카테고리 태그
  image?: string;                // 이미지 URL
  matchPercent?: number;         // 매칭 퍼센트 (75-98)
  curatorNote?: string;          // AI 생성 큐레이터 노트
  source?: 'cloudinary' | 'wikimedia' | 'manual';
}
```

## 🎨 테마 매핑 시스템

artworks.json의 searchTerm을 SAYU 테마로 자동 변환:

```typescript
// 예시: searchTerm → SAYU 테마들
'impressionist' → ['light', 'nature', 'atmospheric', 'fleeting']
'van gogh' → ['expressive', 'emotional', 'passionate', 'textural']  
'portrait' → ['human', 'identity', 'intimate', 'psychological']
'still life' → ['domestic', 'contemplative', 'symbolic', 'quiet']
```

## 📈 시스템 통계 및 분석

```typescript
import { evaluatePoolQuality } from './artwork-pool-builder';

const stats = await evaluatePoolQuality();
console.log(stats);
/*
{
  total: 1806,
  sources: { cloudinary: 1761, wikimedia: 45 },
  diversity: {
    periods: 15,      // 시대 다양성
    movements: 25,    // 사조 다양성  
    mediums: 30,      // 매체 다양성
    artists: 800+,    // 작가 다양성
    themes: 60+,      // 테마 다양성
    moods: 25+        // 무드 다양성
  },
  complexity: { simple: 400, moderate: 900, complex: 506 },
  socialContext: { intimate: 600, social: 500, public: 400, solitary: 306 },
  qualityScore: 955+  // 전체 품질 점수
}
*/
```

## 🛠️ 개발 및 테스트

### 테스트 실행
```bash
# Node.js 환경에서 테스트
cd frontend/app/gallery
node test-unified-pool.js
```

### 통합 풀 내보내기
```typescript
import { exportUnifiedPool } from './artwork-pool-builder';

// JSON 파일로 내보내기 (개발용)
await exportUnifiedPool('./my-artwork-pool.json');
```

### 실시간 통계 확인
```typescript
import { getArtworkPoolStatistics } from './unified-pool-integration';

const liveStats = await getArtworkPoolStatistics();
console.log('인기 작가:', liveStats.topArtists.slice(0, 5));
console.log('인기 테마:', liveStats.topThemes.slice(0, 8));
console.log('인기 무드:', liveStats.topMoods.slice(0, 6));
```

## 🎯 성능 최적화

### 메모이제이션
- 풀 데이터는 한 번 로드되면 메모리에 캐시됩니다
- `unifiedRecommendationEngine.initialize()`로 사전 초기화 가능

### 이미지 최적화
- Cloudinary 이미지는 자동 최적화됨
- Wikimedia 이미지는 다양한 해상도 제공
- lazy loading 및 error handling 권장

### 배치 처리
```typescript
// 여러 유형을 한 번에 처리
const personalityTypes = ['LAEF', 'SREF', 'LAEC'];
const allRecs = await Promise.all(
  personalityTypes.map(type => getRecommendationsForUser(type, 6))
);
```

## 🔮 향후 확장 계획

1. **더 많은 데이터 소스 추가**
   - 국립현대미술관, 서울시립미술관 API 연동
   - 구글 아트 앤 컬처 데이터 통합
   - 개별 갤러리 크롤링 데이터 추가

2. **AI 큐레이터 고도화**
   - GPT 기반 개인화된 큐레이터 노트 생성
   - 감정 분석 기반 매칭 알고리즘 개선
   - 사용자 피드백 학습 시스템

3. **성능 개선**
   - 벡터 데이터베이스 연동 (Pinecone, Weaviate)
   - 실시간 추천 API 구축
   - 이미지 유사도 검색 기능

## 💡 사용 팁

1. **최적의 추천을 위해**: 사용자의 animalType을 정확히 파악하는 것이 중요
2. **다양성 확보**: 개성 맞춤(70%) + 랜덤(30%) 비율로 구성 권장  
3. **이미지 로딩**: error handling과 placeholder 이미지 필수
4. **반응형 설계**: 모바일에서도 최적화된 UX 고려
5. **접근성**: alt text와 키보드 네비게이션 지원

## 🤝 기여하기

새로운 데이터 소스나 개선 아이디어가 있다면:

1. 새로운 매핑 규칙을 `SEARCH_TERM_TO_THEMES`에 추가
2. 개성 유형별 선호도를 `personalityPreferences`에 확장  
3. 테스트 케이스를 `test-unified-pool.js`에 추가
4. 사용 예시를 `usage-example.tsx`에 확장

---

**SAYU 통합 작품 풀 시스템**으로 1,800+ 작품의 개성 맞춤 추천을 경험해보세요! 🎨✨