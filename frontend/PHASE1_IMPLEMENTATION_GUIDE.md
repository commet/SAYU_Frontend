# SAYU Phase 1 페이지별 구현 가이드

## 📋 Phase 1 개요
**목표**: SAYU의 핵심 MVP 4개 페이지 완성
**기간**: 즉시 구현 (다음 세션부터)
**페이지**: 메인 홈, APT 테스트 시작, APT 결과, 갤러리 메인

---

## 🏠 1. 메인 홈페이지 (`/`)

### **목적**: 첫 방문자를 위한 SAYU 소개 및 주요 기능 탐색

### **페이지 구조**
```
Header (고정 네비게이션)
├── Hero Section (전체 화면)
├── Features Overview (3-4개 섹션)
├── User Testimonials (후기 슬라이더)
├── Call to Action (APT 테스트 유도)
└── Footer
```

### **컴포넌트 매칭 (우선순위별)**

#### 🔥 **필수 구현 (1순위)**
1. **`hero-with-video`** 
   - **위치**: 페이지 최상단
   - **용도**: SAYU 브랜드 소개 영상 + 메인 CTA
   - **커스터마이징**: 
     - 배경 영상: 아름다운 갤러리/미술관 영상
     - 헤드라인: "당신만의 예술적 감성을 발견하세요"
     - CTA 버튼: "APT 테스트 시작하기" (rainbow-button 스타일)
   - **SAYU 브랜딩**: 보라-핑크 그라디언트 오버레이

2. **`feature-section`** 
   - **위치**: Hero 바로 아래
   - **용도**: SAYU 주요 기능 4단계 소개
   - **Step 1**: APT 테스트 → Step 2: AI 큐레이션 → Step 3: 커뮤니티 → Step 4: 개인화 갤러리
   - **커스터마이징**: 각 스텝별 아이콘과 설명 SAYU 맞춤

3. **`animated-testimonials`**
   - **위치**: Features 아래
   - **용도**: 실제 사용자 후기 3D 카드 슬라이더
   - **커스터마이징**: 
     - 후기 내용: APT 테스트 체험담, 갤러리 투어 후기
     - 프로필: 동물 캐릭터 아바타 사용
   - **SAYU 브랜딩**: 16가지 성격 유형별 테마 색상

#### ⚡ **개선 구현 (2순위)**
4. **`bento-grid)`** 
   - **위치**: Testimonials 아래
   - **용도**: 주요 기능들을 카드 그리드로 배치
   - **카드 구성**: APT 테스트, AI 큐레이터, 갤러리 투어, 커뮤니티, 팔로우 시스템
   - **인터랙션**: 호버 시 3D 틸트 효과

5. **`sparkles`**
   - **위치**: 전체 페이지 배경
   - **용도**: 마법적인 예술 경험 연출
   - **설정**: 보라-핑크 파티클, 낮은 density

#### 🎨 **고급 효과 (3순위)**
6. **`link-preview`**
   - **위치**: Footer 근처 파트너 섹션
   - **용도**: 유명 미술관/갤러리 링크 미리보기
   - **파트너**: 루브르, MoMA, 국립현대미술관 등

### **레이아웃 코드 구조**
```tsx
// app/page.tsx
import { HeroWithVideo } from '@/components/ui/hero-with-video'
import { FeatureSteps } from '@/components/ui/feature-section'
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials'
import { BentoGrid } from '@/components/ui/bento-grid'
import { Sparkles } from '@/components/ui/sparkles'

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <Sparkles />
      <HeroWithVideo {...sayuHeroConfig} />
      <FeatureSteps {...sayuFeaturesConfig} />
      <AnimatedTestimonials {...sayuTestimonialsConfig} />
      <BentoGrid {...sayuBentoConfig} />
    </div>
  )
}
```

---

## 🧠 2. APT 테스트 시작 페이지 (`/apt-test`)

### **목적**: 사용자가 테스트에 몰입할 수 있는 환경 조성

### **페이지 구조**
```
Full Screen Immersive Layout
├── Background Animation
├── Test Introduction (단계별 등장)
├── Start Button (프리미엄 스타일)
└── Progress Indicator
```

### **컴포넌트 매칭 (우선순위별)**

#### 🔥 **필수 구현 (1순위)**
1. **`lamp`**
   - **위치**: 전체 페이지 배경
   - **용도**: 테스트 시작 전 몰입감 있는 조명 효과
   - **커스터마이징**: 보라-핑크 그라디언트 빛

2. **`text-reveal`**
   - **위치**: 화면 중앙
   - **용도**: 테스트 설명 텍스트 단계별 등장
   - **순서**: 
     - "16가지 동물 캐릭터 중..." 
     - "당신의 예술적 성향을..." 
     - "개인화된 갤러리 경험을..."

3. **`rainbow-button`**
   - **위치**: 텍스트 아래 중앙
   - **용도**: "테스트 시작하기" 메인 CTA
   - **크기**: 대형 (px-12 py-6)

#### ⚡ **개선 구현 (2순위)**
4. **`badge-new`**
   - **위치**: 상단
   - **용도**: "새로운 APT 2.0" 또는 진행 상황 표시
   - **스타일**: Purple variant

### **레이아웃 코드 구조**
```tsx
// app/apt-test/page.tsx
import { Lamp } from '@/components/ui/lamp'
import { TextRevealByWord } from '@/components/ui/text-reveal'
import { RainbowButton } from '@/components/ui/rainbow-button'

export default function APTTestPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Lamp />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <TextRevealByWord text={aptIntroText} />
        <RainbowButton onClick={startTest}>
          APT 테스트 시작하기
        </RainbowButton>
      </div>
    </div>
  )
}
```

---

## 🏆 3. APT 결과 페이지 (`/apt-test/result`)

### **목적**: 결과 발표와 개인화된 추천 제공

### **페이지 구조**
```
Celebration Layout
├── Background Effect
├── Result Announcement
├── Personality Badge/Certificate
├── Recommended Artworks Carousel
├── Detailed Analysis Modal
└── Next Steps CTA
```

### **컴포넌트 매칭 (우선순위별)**

#### 🔥 **필수 구현 (1순위)**
1. **`aurora-background`**
   - **위치**: 전체 페이지 배경
   - **용도**: 결과 발표에 맞는 축하 배경
   - **색상**: 사용자 성격 유형별 맞춤 색상

2. **`award`**
   - **위치**: 페이지 상단 중앙
   - **용도**: 성격 유형 인증서/배지
   - **변형**: certificate 스타일
   - **커스터마이징**: 16가지 동물 캐릭터별 디자인

3. **`perspective-carousel`**
   - **위치**: 결과 아래
   - **용도**: 추천 작품들 3D 캐러셀
   - **데이터**: 해당 성격 유형에 맞는 작품들
   - **인터랙션**: 마우스 추적 3D 효과

#### ⚡ **개선 구현 (2순위)**
4. **`dialog`**
   - **용도**: 상세 결과 분석 모달
   - **내용**: 성격 특성, 추천 이유, 맞춤 활동

5. **`animated-tooltip`**
   - **위치**: 성격 특성 아이콘들
   - **용도**: 각 특성 설명

### **레이아웃 코드 구조**
```tsx
// app/apt-test/result/page.tsx
import { AuroraBackground } from '@/components/ui/aurora-background'
import { Awards } from '@/components/ui/award'
import { PerspectiveCarousel } from '@/components/ui/perspective-carousel'
import { Dialog } from '@/components/ui/sayu-dialog'

export default function APTResultPage() {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="relative z-10 py-20">
        <Awards type="certificate" result={userResult} />
        <PerspectiveCarousel slides={recommendedArtworks} />
        <Dialog>{/* 상세 분석 */}</Dialog>
      </div>
    </div>
  )
}
```

---

## 🎨 4. 갤러리 메인 페이지 (`/gallery`)

### **목적**: 개인화된 아트 컬렉션 탐색

### **페이지 구조**
```
Gallery Layout
├── Animated Introduction
├── Interactive Art Grid
├── Category Navigation Dock
├── Featured Collections
└── Personalized Recommendations
```

### **컴포넌트 매칭 (우선순위별)**

#### 🔥 **필수 구현 (1순위)**
1. **`container-scroll-animation`**
   - **위치**: 페이지 진입부
   - **용도**: 갤러리 소개 스크롤 애니메이션
   - **콘텐츠**: "당신만의 갤러리로 입장합니다..." 메시지

2. **`interactive-bento-gallery`**
   - **위치**: 메인 콘텐츠 영역
   - **용도**: 드래그 가능한 작품 그리드
   - **데이터**: 사용자 맞춤 작품들
   - **기능**: 드래그, 확대, 모달 뷰

3. **`mac-os-dock`**
   - **위치**: 하단 고정
   - **용도**: 갤러리 카테고리 네비게이션
   - **카테고리**: 인상주의, 현대미술, 조각, 사진, 디지털아트 등

#### ⚡ **개선 구현 (2순위)**
4. **`empty-state`**
   - **위치**: 빈 갤러리일 때
   - **용도**: 첫 방문자를 위한 가이드
   - **액션**: APT 테스트 유도

### **레이아웃 코드 구조**
```tsx
// app/gallery/page.tsx
import { ContainerScrollAnimation } from '@/components/ui/container-scroll-animation'
import { InteractiveBentoGallery } from '@/components/ui/interactive-bento-gallery'
import { MacOSDock } from '@/components/ui/mac-os-dock'
import { EmptyState } from '@/components/ui/empty-state'

export default function GalleryPage() {
  return (
    <div className="relative min-h-screen">
      <ContainerScrollAnimation {...galleryIntroConfig} />
      {artworks.length > 0 ? (
        <InteractiveBentoGallery artworks={personalizedArtworks} />
      ) : (
        <EmptyState {...emptyGalleryConfig} />
      )}
      <MacOSDock categories={artCategories} />
    </div>
  )
}
```

---

## 📝 구현 순서 및 체크리스트

### **Week 1: 메인 홈페이지**
- [ ] `hero-with-video` SAYU 커스터마이징
- [ ] `feature-section` 4단계 기능 소개
- [ ] `animated-testimonials` 사용자 후기
- [ ] 반응형 디자인 적용
- [ ] 모바일 최적화

### **Week 2: APT 테스트 페이지들**
- [ ] `/apt-test` 시작 페이지 구현
- [ ] `/apt-test/result` 결과 페이지 구현
- [ ] 16가지 성격 유형별 커스터마이징
- [ ] 결과 데이터 연동

### **Week 3: 갤러리 페이지**
- [ ] `container-scroll-animation` 갤러리 소개
- [ ] `interactive-bento-gallery` 작품 그리드
- [ ] `mac-os-dock` 카테고리 네비게이션
- [ ] 개인화 알고리즘 연동

### **Week 4: 통합 및 최적화**
- [ ] 페이지 간 네비게이션 연결
- [ ] 성능 최적화 (이미지 lazy loading)
- [ ] SEO 최적화
- [ ] 통합 테스트

---

## 🎯 성공 지표

1. **사용자 경험**
   - 페이지 로딩 시간 < 3초
   - 모바일 완벽 대응
   - 부드러운 애니메이션 (60fps)

2. **비즈니스 목표**
   - APT 테스트 완주율 > 80%
   - 갤러리 체류 시간 > 5분
   - 다음 페이지 전환율 > 60%

3. **기술적 목표**
   - 모든 컴포넌트 정상 동작
   - 다크/라이트 모드 지원
   - 접근성 기준 준수

---

## 🚀 다음 세션 시작 가이드

**1단계**: 메인 홈페이지 `/app/page.tsx` 생성
**2단계**: `hero-with-video` 컴포넌트부터 차례대로 적용
**3단계**: SAYU 브랜딩 커스터마이징 적용
**4단계**: 반응형 및 모바일 최적화

### **필요한 에셋**
- SAYU 로고 파일들
- 브랜드 컬러 팔레트 확정
- 더미 이미지/영상 URL 목록
- 16가지 성격 유형별 설정 데이터

---

**✅ Phase 1 구현 가이드 완성!**
다음 세션부터 이 가이드를 바탕으로 실제 구현을 시작하면 됩니다 🎯