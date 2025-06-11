# SAYU 퀴즈 시스템 개선 계획

## 1. 질문 타입 혁신

### A. 시나리오 기반 질문 (Scenario-based)
```javascript
// 예시: 미술관 상황극
{
  type: "scenario",
  title: "친구와 미술관 데이트",
  scenario: "친구가 '이 작품 이해가 안 돼'라고 말했을 때, 당신의 반응은?",
  options: [
    {
      text: "작품의 기법과 역사적 배경을 설명해준다",
      personality: { M: 3, E: 1 }, // Methodical + Expert
      reaction: "💡 지식 공유형"
    },
    {
      text: "나도 잘 모르지만 느낌을 함께 나눈다", 
      personality: { E: 3, F: 1 }, // Emotional + Feeling
      reaction: "💭 감정 공유형"
    },
    {
      text: "큐레이터를 찾아가 함께 들어본다",
      personality: { G: 3, A: 1 }, // Group + Active
      reaction: "👥 함께 탐구형"
    }
  ]
}
```

### B. 시각적 선호도 테스트
```javascript
{
  type: "visual-preference",
  title: "첫눈에 끌리는 작품은?",
  displayMode: "grid", // 3x3 그리드로 표시
  images: [
    { src: "abstract1.jpg", tags: ["abstract", "emotional", "modern"] },
    { src: "realistic1.jpg", tags: ["realistic", "traditional", "detailed"] },
    { src: "minimal1.jpg", tags: ["minimal", "conceptual", "clean"] }
  ],
  multiSelect: true, // 복수 선택 가능
  timeLimit: 30 // 30초 내 직관적 선택
}
```

### C. 감정 매핑 질문
```javascript
{
  type: "emotion-mapping",
  title: "이 작품이 주는 느낌을 색으로 표현한다면?",
  artwork: "abstract-painting.jpg",
  colorWheel: true,
  emotions: {
    warm: ["red", "orange", "yellow"],
    cool: ["blue", "green", "purple"],
    neutral: ["gray", "black", "white"]
  }
}
```

## 2. 실시간 피드백 시스템

### A. 즉각적 반응
```javascript
// 각 응답 후 즉시 표시되는 피드백
const instantFeedback = {
  personalityHint: "당신은 혼자 작품을 감상하는 것을 선호하는군요!",
  similarUsers: "전체 사용자의 23%가 같은 선택을 했어요",
  artworkMatch: "이런 취향이라면 칸딘스키 작품을 좋아하실 거예요"
};
```

### B. 진행률 시각화
```javascript
// 성격 차원 실시간 빌드업
const personalityMeter = {
  Group_Solo: { current: 65, direction: "Group" },
  Active_Reflective: { current: 40, direction: "Balanced" },
  Methodical_Emotional: { current: 75, direction: "Methodical" },
  Free_Conventional: { current: 55, direction: "Free" }
};
```

## 3. 게이미피케이션 요소

### A. 단계별 보상
```javascript
const achievements = [
  { milestone: 5, badge: "🎨 예술 탐험가", reward: "첫 5문제 완료!" },
  { milestone: 10, badge: "🖼️ 감상 전문가", reward: "깊이 있는 취향 발견!" },
  { milestone: "complete", badge: "✨ 예술 영혼", reward: "당신만의 예술 DNA 완성!" }
];
```

### B. 친구와 비교
```javascript
const socialFeatures = {
  compatibility: "친구와 예술 취향 궁합 테스트",
  sharedTaste: "공통으로 좋아할 만한 전시 추천",
  differenceHighlight: "서로 다른 관점으로 보는 재미"
};
```

## 4. 16가지 성격 유형 명확화

### 현재: GARM/SEFC → 개선: 직관적 네이밍

```javascript
const improvedTypes = {
  GARM: {
    old: "GARM",
    new: "소셜 큐레이터",
    emoji: "🎭",
    description: "함께 나누는 예술의 즐거움",
    traits: ["사교적", "활동적", "논리적", "자유로운"]
  },
  SEFC: {
    old: "SEFC",
    new: "감성 몽상가", 
    emoji: "🌙",
    description: "혼자만의 예술 명상",
    traits: ["독립적", "감성적", "깊이있는", "전통적"]
  }
  // ... 16개 타입 모두 재정의
};
```

## 5. 커뮤니티 기능

### A. 타입별 라운지
```javascript
const communitySpaces = {
  typeLounge: "16개 성격별 전용 공간",
  artShare: "오늘의 발견 작품 공유",
  exhibition: "이번 주 함께 갈 전시",
  discussion: "작품 해석 토론방"
};
```

### B. 매칭 시스템
```javascript
const matchingFeatures = {
  tasteMatch: "취향 궁합 90% 이상 유저 매칭",
  exhibitionBuddy: "전시 함께 갈 친구 찾기",
  artworkExchange: "서로의 컬렉션 교환 감상"
};
```

## 6. UI/UX 개선사항

### A. 모션 & 인터랙션
- 카드 뒤집기 애니메이션
- 스와이프 제스처 지원
- 햅틱 피드백 (모바일)
- 부드러운 전환 효과

### B. 시각적 개선
- 그라데이션 배경
- 글래스모피즘 효과
- 다크모드 최적화
- 타입별 커스텀 테마

## 7. 구현 우선순위

### Phase 1 (즉시 구현)
1. 시나리오 기반 질문 5개 추가
2. 실시간 성격 미터 표시
3. 즉각적 피드백 시스템

### Phase 2 (2주 내)
1. 16개 타입 리브랜딩
2. 커뮤니티 기본 기능
3. 시각적 UI 개선

### Phase 3 (1개월 내)
1. 친구 매칭 시스템
2. 전시 추천 알고리즘
3. 연간 리포트 기능