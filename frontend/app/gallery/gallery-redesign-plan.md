# 갤러리 페이지 리디자인 계획

## 레이아웃 구조

```
┌─────────────────────────────────────────────────────┐
│  Header (Sticky)                                    │
│  ┌───────────────┬─────────────────┬──────────────┐│
│  │ Back + Title  │  Search Bar     │ User Actions ││
│  └───────────────┴─────────────────┴──────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │ Feature-108 Category Filter (Horizontal Pills) ││
│  └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│  Background: background-beams (subtle, animated)    │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ 3D Carousel - Featured/Recommended Section      ││
│  │ (APT 기반 추천 작품 5-7개)                      ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ Gallery Grid with Image Cards                   ││
│  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           ││
│  │ │      │ │      │ │      │ │      │           ││
│  │ │ Card │ │ Card │ │ Card │ │ Card │           ││
│  │ └──────┘ └──────┘ └──────┘ └──────┘           ││
│  │ (Masonry layout with hover effects)            ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ Floating Dock (우하단)                          ││
│  │ [Shuffle] [Filter] [View Mode] [Stats]         ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## 컴포넌트 배치 상세

### 1. Header Section
- **구성**: 네비게이션 + 검색 + 액션 버튼
- **스타일**: glassmorphism 효과의 sticky header
- **Badge**: 좋아요/조회수 표시

### 2. Category Filter (feature-108)
- **위치**: 헤더 바로 아래
- **스타일**: 알약 모양의 가로 스크롤 필터
- **인터랙션**: 클릭으로 즉시 카테고리 전환
- **개선점**: 현재 Button 컴포넌트 대신 더 부드러운 전환

### 3. Background Effect
- **background-beams**: 전체 배경에 은은한 빛줄기 애니메이션
- **투명도**: 0.1-0.2로 매우 은은하게
- **색상**: APT 타입에 따라 색상 커스터마이징

### 4. 3D Carousel Section (추천)
- **위치**: 상단 히어로 영역
- **내용**: APT 기반 맞춤 추천 작품 5-7개
- **인터랙션**: 드래그로 회전, 클릭으로 상세 보기
- **높이**: 300-400px

### 5. Gallery Grid
- **레이아웃**: Masonry (작품 비율에 따라 동적)
- **카드 효과**: 
  - hover 시 scale + shadow
  - glare effect on premium artworks
  - 감상 미리보기 오버레이
- **로딩**: 스켈레톤 → 페이드인
- **무한 스크롤**: Intersection Observer 활용

### 6. Floating Dock
- **위치**: 우하단 고정
- **기능**: 
  - Shuffle: 작품 순서 랜덤화
  - Filter: 고급 필터 모달
  - View: 그리드/리스트 전환
  - Stats: 갤러리 통계

## 색상 및 스타일 가이드

### 라이트 모드
- 배경: #fafafa → white (gradient)
- 카드: white with subtle shadow
- 호버: scale(1.03) + stronger shadow
- 빔: rgba(239, 68, 68, 0.05)

### 다크 모드
- 배경: #0a0a0a → #1a1a1a (gradient)
- 카드: #1a1a1a with glow border
- 호버: scale(1.03) + glow effect
- 빔: rgba(239, 68, 68, 0.1)

## 반응형 대응

### 모바일 (< 768px)
- 그리드: 2 columns
- 3D Carousel: 스와이프 제스처
- Dock: 하단 중앙, 아이콘만 표시

### 태블릿 (768px - 1024px)
- 그리드: 3 columns
- 3D Carousel: 5개 아이템

### 데스크톱 (> 1024px)
- 그리드: 4-5 columns
- 3D Carousel: 7개 아이템
- 고급 호버 효과 활성화

## 성능 최적화

1. **이미지 로딩**
   - Next.js Image 컴포넌트 활용
   - blur placeholder
   - lazy loading
   - 적절한 sizes 속성

2. **애니메이션**
   - GPU 가속 활용 (transform, opacity)
   - will-change 신중하게 사용
   - 모바일에서 효과 간소화

3. **데이터 페칭**
   - 초기 20개 로드
   - 무한 스크롤로 추가 로드
   - 캐싱 전략 구현

## 구현 우선순위

1. **Phase 1**: 기본 레이아웃 + background-beams
2. **Phase 2**: gallery-with-image-cards 적용
3. **Phase 3**: feature-108 필터 통합
4. **Phase 4**: 3D carousel 추가
5. **Phase 5**: floating dock 구현
6. **Phase 6**: 세부 인터랙션 및 애니메이션