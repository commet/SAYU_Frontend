# SAYU UI 컴포넌트 의존성 분석 및 설치 가이드

## 수집 완료 현황
- **총 46개 컴포넌트 수집 완료** ✅
- **수집 기간**: 2025-01-28
- **소스**: 21st.dev, v0.dev, custom components

## 전체 의존성 목록

### 핵심 UI 라이브러리
```bash
# Radix UI 컴포넌트 (접근성 기반)
@radix-ui/react-slot
@radix-ui/react-icons  
@radix-ui/react-separator
@radix-ui/react-dialog
@radix-ui/react-hover-card

# 애니메이션 & 모션
framer-motion

# 아이콘 시스템
lucide-react
@tabler/icons-react

# 스타일 & CSS
class-variance-authority
clsx
tailwind-merge

# 파티클 & 3D 효과
@tsparticles/slim
@tsparticles/react
@tsparticles/engine

# 캐러셀 & 슬라이더
embla-carousel-react

# 날짜 & 시간
date-fns
react-day-picker
little-date

# 테마 관리
next-themes

# 기타 유틸리티
qss  # URL query string encoding
```

## 통합 설치 명령어

### 1. 모든 의존성 한번에 설치
```bash
npm install framer-motion lucide-react @radix-ui/react-slot class-variance-authority @tsparticles/slim @tsparticles/react next-themes @tabler/icons-react @radix-ui/react-icons @tsparticles/engine embla-carousel-react date-fns @radix-ui/react-separator react-day-picker little-date clsx tailwind-merge @radix-ui/react-dialog @radix-ui/react-hover-card qss
```

### 2. 카테고리별 분할 설치 (권장)
```bash
# 핵심 UI & 접근성
npm install @radix-ui/react-slot @radix-ui/react-icons @radix-ui/react-separator @radix-ui/react-dialog @radix-ui/react-hover-card

# 애니메이션 & 인터랙션  
npm install framer-motion

# 아이콘 시스템
npm install lucide-react @tabler/icons-react

# 스타일링 유틸리티
npm install class-variance-authority clsx tailwind-merge

# 고급 효과 (파티클, 3D)
npm install @tsparticles/slim @tsparticles/react @tsparticles/engine

# 캐러셀 & 슬라이더
npm install embla-carousel-react

# 날짜 & 시간 관리
npm install date-fns react-day-picker little-date

# 테마 & 기타
npm install next-themes qss
```

## 컴포넌트별 의존성 매핑

### 애니메이션 집약 컴포넌트 (24개)
- **framer-motion 사용**: aurora, heroHighlight, beamsBackground, animatedGridPattern, backgroundBeams, sparkles, customersSection, retroTestimonial, aboutUsSection, shuffleGrid, compare, imageComparison, dock, dockTwo, animatedDock, featureSection, sectionWithMockup, lamp, scrollExpansionHero, etheralShadow, containerScrollAnimation, textReveal, animatedTestimonials, textEffect, animatedAiChat, threeDCarousel

### Radix UI 기반 컴포넌트 (8개)  
- **@radix-ui/* 사용**: gallery4, bentoGrid, featureWithImageComparison, radialOrbitalTimeline, fullscreenCalendar, sayu-dialog, linkPreview

### 파티클 효과 컴포넌트 (2개)
- **@tsparticles/* 사용**: sparkles, compare

### 날짜 관리 컴포넌트 (2개)
- **date-fns/react-day-picker 사용**: calendarWithEventSlots, fullscreenCalendar

## 설치 후 확인사항

### 1. Tailwind CSS 설정 업데이트
```js
// tailwind.config.js
module.exports = {
  // ... 기존 설정
  theme: {
    extend: {
      // Rainbow button 애니메이션 색상
      colors: {
        "color-1": "hsl(var(--color-1))",
        "color-2": "hsl(var(--color-2))",
        "color-3": "hsl(var(--color-3))",
        "color-4": "hsl(var(--color-4))",
        "color-5": "hsl(var(--color-5))",
      },
      animation: {
        rainbow: "rainbow var(--speed, 2s) infinite linear",
      },
      keyframes: {
        rainbow: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
    },
  },
}
```

### 2. CSS 변수 추가
```css
/* app/globals.css */
:root {
  --color-1: 0 100% 63%;
  --color-2: 270 100% 63%; 
  --color-3: 210 100% 63%;
  --color-4: 195 100% 63%;
  --color-5: 90 100% 63%;
}
```

### 3. 지원 파일 확인
- ✅ `@/lib/utils` (cn 함수)
- ✅ `@/components/ui/button` 
- ✅ `@/components/ui/input`
- ✅ `@/components/ui/label`

## 메모리 사용량 고려사항

### 큰 용량 패키지들
- `@tsparticles/*`: ~2MB (파티클 효과용)
- `framer-motion`: ~1.5MB (애니메이션 엔진)
- `embla-carousel-react`: ~500KB (캐러셀)

### 최적화 권장사항
- 파티클 효과가 필요 없는 경우 `@tsparticles/*` 제외
- 기본 애니메이션만 필요한 경우 `framer-motion` 대신 CSS transitions 고려
- 트리 쉐이킹을 위해 개별 import 사용

## 버전 호환성
- **React**: 18+ (React 19 호환)
- **Next.js**: 13+ (App Router 지원)
- **TypeScript**: 4.9+
- **Tailwind CSS**: 3.3+

## 다음 단계
1. ✅ 의존성 설치 완료
2. 🔄 **SAYU 페이지별 UI 요구사항 분석**
3. 🔄 **실제 페이지에 컴포넌트 적용**
4. 🔄 **통합 테스트 및 성능 최적화**