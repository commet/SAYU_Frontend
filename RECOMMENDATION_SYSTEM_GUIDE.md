# SAYU 추천 시스템 가이드

## 개요

SAYU는 사용자의 16가지 예술 성격 유형을 기반으로 맞춤형 작품, 전시, 작가 추천을 제공하는 AI 기반 추천 시스템을 구현하고 있습니다. 이 문서는 추천 로직의 구조와 작동 원리를 상세히 설명합니다.

## 시스템 아키텍처

### 1. 핵심 구성 요소

#### 백엔드 서비스
- **aiRecommendationService.js** - 메인 추천 엔진
- **artworkScoring.js** - 작품 선호도 점수 시스템
- **vectorSimilarityService.js** - 벡터 기반 유사도 매칭
- **artProfileService.js** - AI 아트 프로필 생성
- **artist-preference-system.js** - 작가 관계 및 선호도 학습

#### 프론트엔드 컴포넌트
- **ArtworkRecommendations.tsx** - 작품 추천 표시
- **recommendation-engine.ts** - 프론트엔드 추천 로직
- **exhibitionRecommendations.ts** - 전시 매핑 시스템
- **artworkRecommendations.ts** - 성격-작품 매핑

### 2. 데이터 모델
- **sayuArtworkMatcher.js** - 성격-작품 매칭 로직
- **personality-style-mapping.ts** - 성격별 스타일 선호도
- **personality-descriptions.ts** - 상세 성격 프로필

## 추천 유형별 로직

### 1. 작품 추천 시스템

#### 알고리즘: 태그 기반 점수 시스템
8개 핵심 차원으로 분석:
- `symbolic_complexity` - 추상/상징적 내용
- `clear_narrative` - 명확한 스토리/의미
- `material_detail` - 물질적 질감/재료 중심
- `spatial_complexity` - 3D 깊이와 공간적 관계
- `vivid_color` - 밝고 채도 높은 색상
- `calm_mood` - 평화롭고 명상적인 분위기
- `emotional_resonance` - 감정적 임팩트와 깊이
- `representational_form` - 현실적 표현

#### 점수 계산 과정
1. 퀴즈 응답(Q1-Q12)을 8개 태그로 매핑
2. 사용자 답변에 따라 태그 점수 누적
3. 상위 태그 조합으로 AI 아트 프롬프트 생성
4. 최고 점수 태그 조합 기반 추천

#### 성격 유형 통합
```javascript
// 예시: LAEF (몽환적 방랑자)
personalityMappings = {
  'LAEF': {
    genres: ['contemporary', 'abstract', 'conceptual'],
    styles: ['impressionism', 'expressionism'],
    moods: ['peaceful', 'dreamy', 'introspective']
  }
}
```

### 2. 전시 추천 시스템

#### 하이브리드 접근법 (가중치 조합)
- **콘텐츠 기반 (40%)**: 사용자 선호도와 전시 특성 매칭
- **협업 필터링 (30%)**: 유사한 사용자의 추천
- **지식 기반 (20%)**: 규칙 기반 추천 (계절, 위치 등)
- **실시간 컨텍스트 (10%)**: 현재 시간, 위치, 날씨 요소

#### 성격 매핑 예시
```javascript
'SRMC': {
  title: '현대미술의 거장들: 추상과 구상의 경계',
  recommendationReason: '사회적이고 현실적인 당신에게 현대 사회의 이슈를 다루는...'
}
```

### 3. 작가 추천 시스템

#### 주요 기능
- **작가 관계 매핑**: 역사적 작가 간 연결성
- **학습 시스템**: 사용자 상호작용 기반 선호도 업데이트
- **협업 필터링**: 유사한 취향의 사용자 발견
- **탐색적 추천**: 새로운 스타일/시대 제안

#### SAYU 유형 통합
```javascript
'LAEF': { // 여우 - 몽환적 방랑자
  artists: ['van-gogh', 'turner', 'blake', 'redon', 'moreau'],
  genres: ['dreamlike', 'visionary', 'emotional', 'mystical'],
  movements: ['symbolism', 'romanticism', 'surrealism']
}
```

## 성격 유형 매핑 시스템

### 16가지 SAYU 성격 유형

4차원 모델 사용:
- **L/S**: 개인(Lone) vs 사회(Social) 관람 선호
- **A/R**: 추상(Abstract) vs 구상(Representational) 인식 스타일
- **E/M**: 감정(Emotional) vs 의미(Meaning-driven) 반영 유형
- **F/C**: 흐름(Flow) vs 구조적(Constructive) 탐색 스타일

### 성격-예술 매핑 예시

#### 스타일 선호도
```typescript
'LAEF': {
  recommendedStyles: ['vangogh-postimpressionism', 'klimt-artnouveau', 'korean-minhwa'],
  reason: '내면의 감정을 풍부하게 표현하는 스타일이 어울려요'
}
```

#### 대표 작품
각 성격 유형마다:
- 대표 명작 1점
- 상세한 추천 이유
- 관련 작품들
- 미술관 정보

## 고급 기능

### 1. 벡터 유사도 서비스

#### 기능
- **의미적 검색**: 자연어 쿼리를 작품에 매칭
- **사용자 유사도**: 비슷한 취향 프로필 사용자 발견
- **작품 유사도**: 콘텐츠 기반 작품 관계성
- **실시간 업데이트**: 동적 선호도 학습

#### 벡터 유형
- 인지적 유사성 (사고 패턴)
- 감정적 유사성 (감정 패턴)
- 미적 유사성 (시각적 선호도)

### 2. 머신러닝 통합

#### AI 아트 프로필 생성
- Replicate API 활용한 개인화 작품 생성
- 사용자 선호도 기반 프롬프트 생성
- 성격 유형별 고유한 시각적 표현

#### 지속적 학습
- 상호작용 추적 (조회, 좋아요, 저장, 방문)
- 선호도 가중치 조정
- 실시간 추천 업데이트

### 3. 추천 품질 향상

#### 다양성 메커니즘
- 장르 다양화
- 작가 다양성 강제
- 지리적 분포
- 시대적 균형

#### 설명 생성
- 각 추천에 대한 이유 코드
- 개인화된 설명 텍스트
- 신뢰도 점수

## 성능 및 확장성

### 1. 캐싱 전략

#### Redis 통합
- 사용자 추천 캐시 (5분 TTL)
- 전시 데이터 캐시 (24시간 TTL)
- 사용자 프로필 캐시 (1시간 TTL)

#### 캐시 무효화
- 사용자 선호도 변경 시 자동 갱신
- 사용자 행동 기반 실시간 업데이트

### 2. 데이터베이스 최적화

#### 성능 인덱스
- 사용자 선호도 인덱스
- 전시 검색 인덱스
- 벡터 유사도 인덱스 (pgvector)

#### 배치 처리
- 야간 추천 사전 계산
- 대량 선호도 업데이트
- 분석 데이터 집계

## API 아키텍처

### 주요 엔드포인트

#### 전시 추천
- `GET /api/recommendations/exhibitions` - 개인화 전시 목록
- 쿼리 매개변수: limit, location, genres, includeVisited

#### 작품 추천
- `GET /api/recommendations/artworks` - 개인화 작품 목록
- 쿼리 매개변수: personalityType, mood, colorMood

#### 피드백 시스템
- `POST /api/recommendations/feedback` - 사용자 피드백 수집
- `POST /api/recommendations/view` - 조회 추적

### 실시간 업데이트

#### 활동 추적
- 조회 시간 기록
- 상호작용 유형 분류
- 선호도 학습 통합

#### 추천 갱신
- 자동 캐시 무효화
- 백그라운드 추천 업데이트
- A/B 테스트 지원

## 현재 구현 상태

### ✅ 완전 구현
- 성격 기반 작품 추천
- 전시 매핑 시스템
- 기본 협업 필터링
- 작가 관계 데이터베이스
- 벡터 유사도 검색
- AI 아트 프로필 생성

### 🔄 부분 구현
- 실시간 선호도 학습
- 고급 협업 필터링
- 컨텍스트 추천 (날씨, 시간)
- 추천 설명 시스템

### ❌ 미구현
- 완전한 의미적 검색 기능
- 고급 ML 모델
- A/B 테스트 프레임워크
- 성능 분석 대시보드
- 모바일 앱 통합

## 개선 권장사항

### 단기 개선사항
1. **의미적 검색 구현 완료**
2. **설명 생성 기능 강화**
3. **모바일 최적화 추천 UI**
4. **성능 모니터링 대시보드**

### 장기 개선사항
1. **딥러닝 모델** 도입으로 선호도 예측 향상
2. **소셜 기능** 통합 (친구 추천)
3. **증강현실** 작품 시각화
4. **다국어** 추천 설명

### 기술적 부채
1. **중복된 성격 정의 통합**
2. **추천 서비스 오류 처리 개선**
3. **포괄적 단위 테스트 추가**
4. **데이터베이스 쿼리 최적화**

## 핵심 강점

1. **정교한 성격 매핑** - 16가지 구별되는 유형
2. **다중 모드 추천** - 작품, 전시, 작가
3. **하이브리드 알고리즘** - 여러 기법 조합
4. **실시간 학습 기능**
5. **풍부한 설명 시스템** - 문화적 맥락 제공
6. **확장 가능한 아키텍처** - 적절한 캐싱

## 잠재적 과제

1. **콜드 스타트 문제** - 신규 사용자 대상
2. **데이터 희소성** - 일부 성격 유형
3. **추천 버블 효과**
4. **문화적 편향** - 예술 선택
5. **확장성** - 대규모 사용자 기반

이 포괄적인 추천 시스템은 예술 감상 심리학과 현대 추천 알고리즘에 대한 정교한 이해를 보여주며, SAYU를 개인화된 문화 경험의 리더로 자리매김시킵니다.

## 개발자 가이드

### 새로운 추천 로직 추가 방법

1. **백엔드 서비스 확장**
   ```javascript
   // aiRecommendationService.js에 새로운 함수 추가
   async function getNewRecommendationType(userId, preferences) {
     // 추천 로직 구현
   }
   ```

2. **프론트엔드 컴포넌트 업데이트**
   ```typescript
   // 새로운 추천 타입 컴포넌트 생성
   export function NewRecommendationType() {
     // UI 구현
   }
   ```

3. **데이터베이스 스키마 업데이트**
   ```sql
   -- 필요한 새로운 테이블 또는 컬럼 추가
   ```

### 성능 최적화 팁

1. **캐싱 전략**
   - Redis 활용한 빈번한 쿼리 캐싱
   - 사용자별 추천 결과 캐싱

2. **데이터베이스 최적화**
   - 적절한 인덱스 생성
   - 쿼리 최적화

3. **API 응답 최적화**
   - 페이지네이션 구현
   - 필요한 데이터만 전송

이 문서는 SAYU 추천 시스템의 완전한 이해를 제공하며, 향후 개발 및 개선 작업의 기반이 됩니다.