# SAYU UI 디자인 시스템

## 색상 팔레트 사용 지침

### 1. 주요 색상 조합

SAYU의 감성 기반 아트 탐색 플랫폼 특성에 맞춰, 아래 색상 조합들을 상황에 맞게 활용하세요:

#### 따뜻하고 부드러운 조합
- **Peach Breeze** (#F5D9C4) + **Lavender Dream** (#BA98D4)
- **Apricot Whisper** (#F4CFA3) + **Tangerine Zest** (#F57B28)
- **Peppermint Pink** (#F6C6C2) + **Silent Night** (#62709F)
- **Tea Rose** (#E5C8CD) + **Fern Green** (#4E724C)

#### 차분하고 세련된 조합
- **Sage** (#C3C98D) + **Dark Purple** (#31243E)
- **Dusty Jupiter** (#40554B) + **Lime Cream** (#D6EF84)
- **Dusty Mauve** (#776B75) + **Ivory Mist** (#F0EDE9)
- **Powder Blue** (#A9C7EC) + **Urban Smoke** (#535350)

#### 대비가 강한 활기찬 조합
- **Match Point** (#DADE55) + **Double Bounce** (#F05692)
- **Soft Melon** (#F6CFB5) + **Astral Blue** (#191B47)
- **UCLA Blue** (#536895) + **Pearl** (#DBDABE)

### 2. 배경색 사용 지침
순백색(#FFFFFF) 대신 아래의 부드러운 색상들을 사용:
- **Ivory Mist** (#F0EDE9) - 메인 배경
- **Pearl** (#DBDABE) - 보조 배경
- **Soft White** (#FAFAF8) - 카드 배경

### 3. APT 타입별 색상 테마

#### 열정적/외향적 타입 (예: ENFP)
- Primary: **Tangerine Zest** (#F57B28)
- Secondary: **Match Point** (#DADE55)
- Accent: **Double Bounce** (#F05692)

#### 신중한/내향적 타입 (예: INFJ)
- Primary: **Silent Night** (#62709F)
- Secondary: **Dusty Mauve** (#776B75)
- Accent: **Lavender Dream** (#BA98D4)

#### 논리적/분석적 타입 (예: INTJ)
- Primary: **Dark Purple** (#31243E)
- Secondary: **Urban Smoke** (#535350)
- Accent: **UCLA Blue** (#536895)

#### 감성적/창의적 타입 (예: ISFP)
- Primary: **Tea Rose** (#E5C8CD)
- Secondary: **Peach Breeze** (#F5D9C4)
- Accent: **Peppermint Pink** (#F6C6C2)

### 4. 기능별 색상 활용

#### 퍼셉션 익스체인지 (감상 교환)
- 배경: **Ivory Mist** (#F0EDE9)
- 카드: **Soft White** (#FAFAF8)
- 강조: **Lavender Dream** (#BA98D4)
- 텍스트: **Dark Purple** (#31243E)

#### 갤러리 뷰
- 배경: **Pearl** (#DBDABE)
- 호버: **Powder Blue** (#A9C7EC)
- 선택: **UCLA Blue** (#536895)

#### 전시 동행 매칭
- 매칭 대기: **Sage** (#C3C98D)
- 매칭 진행: **Lime Cream** (#D6EF84)
- 매칭 완료: **Fern Green** (#4E724C)

### 5. 감정 상태별 색상

#### 평온한 상태
- **Powder Blue** (#A9C7EC)
- **Sage** (#C3C98D)
- **Ivory Mist** (#F0EDE9)

#### 호기심/탐색 상태
- **Apricot Whisper** (#F4CFA3)
- **Match Point** (#DADE55)

#### 영감받은 상태
- **Lavender Dream** (#BA98D4)
- **Double Bounce** (#F05692)

#### 향수/추억 상태
- **Tea Rose** (#E5C8CD)
- **Dusty Mauve** (#776B75)

### 6. 구현 시 주의사항

1. **접근성**: 모든 색상은 WCAG 2.1 가이드라인 준수 (최소 4.5:1 대비)
2. **다크모드**: 각 색상에 대응하는 어두운 변형 준비
3. **일관성**: 동일한 기능/상태는 항상 같은 색상 사용
4. **성능**: 그라데이션 사용 시 CSS 변수로 최적화

### 7. CSS 변수 정의 예시

```css
:root {
  /* Primary Colors */
  --sayu-peach-breeze: #F5D9C4;
  --sayu-lavender-dream: #BA98D4;
  --sayu-apricot-whisper: #F4CFA3;
  --sayu-tangerine-zest: #F57B28;
  
  /* Secondary Colors */
  --sayu-sage: #C3C98D;
  --sayu-dark-purple: #31243E;
  --sayu-dusty-jupiter: #40554B;
  --sayu-lime-cream: #D6EF84;
  
  /* Background Colors */
  --sayu-bg-primary: #F0EDE9;
  --sayu-bg-secondary: #DBDABE;
  --sayu-bg-card: #FAFAF8;
  
  /* Text Colors */
  --sayu-text-primary: #31243E;
  --sayu-text-secondary: #535350;
  --sayu-text-muted: #776B75;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --sayu-bg-primary: #1A1B26;
    --sayu-bg-secondary: #24283B;
    --sayu-bg-card: #2E3346;
    /* ... dark mode variants ... */
  }
}
```

### 8. Tailwind 확장 설정

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'sayu': {
          'peach-breeze': '#F5D9C4',
          'lavender-dream': '#BA98D4',
          'apricot-whisper': '#F4CFA3',
          'tangerine-zest': '#F57B28',
          'sage': '#C3C98D',
          'dark-purple': '#31243E',
          // ... 모든 색상 추가
        }
      }
    }
  }
}
```