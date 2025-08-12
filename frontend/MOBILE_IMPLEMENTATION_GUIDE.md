# 📱 SAYU 모바일 구현 가이드

## 🎯 핵심 원칙

### 1. 데스크톱 보호 최우선
- **절대 규칙**: 데스크톱 레이아웃/스타일은 절대 건드리지 않음
- **분리 전략**: 768px 기준으로 완전 분리
- **테스트 필수**: 모든 변경 후 데스크톱 확인

### 2. 현재 구조 유지
SAYU는 이미 좋은 분리 구조를 가지고 있음:
```tsx
// ✅ 현재 방식 유지
if (isMobile) {
  return <MobileHomePage />;  // 완전 독립 컴포넌트
}
return <DesktopHomePage />;    // 데스크톱 그대로
```

## 📐 뷰포트 기준

### 기본 설정
- **기준 너비**: 360px (Samsung Galaxy 표준)
- **목표 범위**: 360px ~ 412px
- **동적 스케일링**: 화면 크기에 비례하여 자동 확대

### 주요 뷰포트
```css
/* 브레이크포인트 */
360px - Samsung Galaxy (11.28% 점유율)
390px - iPhone 15/16 (6.29% 점유율) 
412px - 큰 안드로이드 (4.26% 점유율)
768px - 태블릿/데스크톱 경계
```

## 🛠 구현 전략

### 1. 컴포넌트 분리 패턴

#### A. 완전 분리 (권장 - 복잡한 페이지)
```tsx
// app/page.tsx
import MobileHomePage from './MobileHomePage';
import DesktopHomePage from './DesktopHomePage';

export default function Page() {
  const { isMobile } = useResponsive();
  
  if (isMobile) {
    return <MobileHomePage />;
  }
  return <DesktopHomePage />;
}
```

#### B. 조건부 렌더링 (중간 복잡도)
```tsx
// components/Gallery.tsx
export default function Gallery() {
  const { isMobile } = useResponsive();
  
  return (
    <div className={isMobile ? 'mobile-gallery' : 'desktop-gallery'}>
      {isMobile ? <MobileGalleryGrid /> : <DesktopGalleryGrid />}
    </div>
  );
}
```

#### C. Tailwind 반응형 (단순한 스타일 차이)
```tsx
// ✅ 안전한 방식 - 데스크톱 기본값 유지
<div className="p-8 text-2xl max-md:p-4 max-md:text-lg">
  {/* 기본: 데스크톱 스타일 */}
  {/* 768px 미만: 모바일 스타일 */}
</div>

// ❌ 위험한 방식 - 데스크톱도 변경됨
<div className="p-4 md:p-8">
  {/* 이렇게 하면 데스크톱 스타일이 바뀜! */}
</div>
```

### 2. 동적 스케일링 시스템

#### 사용 방법
```tsx
// lib/mobile-scale.ts
import { useMobileScale } from '@/lib/mobile-scale';

function MobileComponent() {
  const scale = useMobileScale();
  
  // 360px: 16px → 390px: 17.3px → 412px: 18.3px
  return (
    <div style={{ 
      padding: scale.spacing.md,
      fontSize: scale.fontSize.base 
    }}>
      {/* 화면 크기에 비례하여 자동 조정 */}
    </div>
  );
}
```

#### CSS 변수 활용
```css
/* 모바일에서만 적용 */
@media (max-width: 767px) {
  .mobile-container {
    /* 360px 기준 vw 단위 사용 */
    padding: min(4.44vw, 18px);  /* 16px → 18px */
    font-size: clamp(14px, 3.89vw, 16px);
    gap: min(2.22vw, 9px);
  }
}
```

### 3. 스타일 적용 우선순위

```tsx
// 1순위: 모바일 전용 컴포넌트
if (isMobile) return <MobileComponent />;

// 2순위: 조건부 클래스
<div className={cn(
  "desktop-styles",
  isMobile && "mobile-styles"
)}>

// 3순위: max- 접두사 (안전)
<div className="p-8 max-md:p-4">

// 4순위: CSS 모듈
.button { padding: 16px; }
@media (max-width: 767px) {
  .button { padding: 12px; }
}
```

## 📋 체크리스트

### 새 기능 추가 시
- [ ] 데스크톱 먼저 구현
- [ ] 768px 이상에서 완벽 동작 확인
- [ ] 모바일 버전 별도 구현
- [ ] 360px, 390px, 412px에서 테스트
- [ ] 데스크톱 재확인 (영향 없는지)

### 스타일 수정 시
- [ ] `max-md:` 접두사 사용 (md: 아님!)
- [ ] 전역 CSS 수정 금지
- [ ] 미디어 쿼리는 max-width: 767px 사용
- [ ] vw 단위 사용 시 max() 함수로 제한

### 컴포넌트 수정 시
- [ ] useResponsive() 훅 사용
- [ ] 모바일 로직은 if (isMobile) 블록 안에
- [ ] 공통 데이터는 별도 파일로 분리
- [ ] 터치 타겟 최소 44px 확인

## 🚫 하지 말아야 할 것들

### 1. 전역 스타일 수정
```css
/* ❌ 절대 금지 */
button {
  padding: 10px;  /* 모든 버튼 영향 */
}

/* ✅ 올바른 방법 */
@media (max-width: 767px) {
  .mobile-button {
    padding: 10px;
  }
}
```

### 2. 데스크톱 기준 미디어 쿼리
```css
/* ❌ 위험 */
@media (min-width: 768px) {
  .container { padding: 20px; }
}

/* ✅ 안전 */
.container { padding: 20px; }  /* 데스크톱 기본 */
@media (max-width: 767px) {
  .container { padding: 10px; }  /* 모바일만 변경 */
}
```

### 3. 고정 픽셀값 남용
```tsx
/* ❌ 반응형 아님 */
<div style={{ width: '360px' }}>

/* ✅ 반응형 */
<div style={{ width: '100%', maxWidth: '360px' }}>
```

## 📊 현재 상태 요약

### 잘 되어있는 부분 ✅
- MobileHomePage 완전 분리
- useResponsive() 훅 시스템
- 기본적인 반응형 구조

### 개선 필요 부분 ⚠️
- 코드 중복 (작품 데이터 등)
- 일관성 없는 브레이크포인트
- 터치 인터랙션 부족

### 즉시 수정 필요 🔴
- 44px 미만 터치 타겟
- 400vh 스크롤 높이
- hover 효과 의존성

## 🎯 구현 우선순위

### Phase 1: 기본 최적화 (1-2일)
1. 터치 타겟 크기 수정 (44px 최소)
2. 동적 스케일링 시스템 적용
3. 기본 레이아웃 안정화

### Phase 2: UX 개선 (3-4일)
1. 터치 제스처 추가
2. 스크롤 최적화
3. 이미지 로딩 개선

### Phase 3: 성능 최적화 (5-7일)
1. 코드 스플리팅
2. 번들 크기 최적화
3. 애니메이션 경량화

## 📝 코드 예시

### 완벽한 모바일 컴포넌트
```tsx
// components/MobilePerfectButton.tsx
export function MobilePerfectButton({ children, onClick }) {
  const { isMobile } = useResponsive();
  const scale = useMobileScale();
  
  // 데스크톱은 원본 유지
  if (!isMobile) {
    return (
      <button 
        className="px-6 py-3 text-lg hover:bg-gray-100"
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
  
  // 모바일 최적화
  return (
    <button
      className="max-md:min-h-[44px] max-md:px-4 max-md:py-2"
      style={{
        fontSize: scale.fontSize.base,
        padding: `${scale.spacing.sm}px ${scale.spacing.md}px`
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}
```

## 🔍 테스트 방법

### Chrome DevTools
1. F12 → Toggle Device Toolbar
2. Responsive → 360x800 선택
3. 390x844 (iPhone), 412x915 (큰 안드로이드) 테스트
4. 768px로 전환하여 데스크톱 확인

### 실제 디바이스
1. ngrok으로 로컬 터널링
2. 실제 모바일에서 테스트
3. 터치 반응성 확인
4. 스크롤 성능 체크

---

**Remember**: 데스크톱을 보호하면서 모바일을 최적화하는 것이 핵심!
모든 변경은 768px 미만에서만 적용되도록 하세요.