# SAYU i18n 마이그레이션 가이드

## 🎯 목표
기존의 하드코딩된 `language === 'ko' ? ... : ...` 패턴을 i18next 기반 번역 시스템으로 전환

## 📦 설치 완료
```bash
npm install i18next react-i18next
```

## 🏗️ 구조
```
frontend/
├── lib/
│   └── i18n/
│       ├── config.ts          # i18n 설정
│       ├── index.ts           # 메인 export
│       ├── migration-helper.tsx # 마이그레이션 헬퍼
│       └── locales/
│           ├── ko.json        # 한글 번역
│           └── en.json        # 영어 번역
└── scripts/
    └── validate-translations.js # 번역 검증 스크립트
```

## 🔄 마이그레이션 단계

### 1단계: Provider 교체
```tsx
// app/providers.tsx
// 기존
import { LanguageProvider } from '@/contexts/LanguageContext';

// 변경
import { I18nLanguageProvider } from '@/contexts/I18nLanguageProvider';

// LanguageProvider를 I18nLanguageProvider로 교체
```

### 2단계: 컴포넌트 마이그레이션

#### 간단한 텍스트
```tsx
// 기존
{language === 'ko' ? '환영합니다' : 'Welcome'}

// 변경
{t('common.welcome')}
```

#### 조건부 텍스트
```tsx
// 기존
const text = language === 'ko' ? '로그인' : 'Login';

// 변경
const text = t('common.login');
```

#### 복잡한 구조
```tsx
// 기존
<h1>{language === 'ko' ? '당신만의 예술 여정이 시작됩니다' : 'Your Personal Art Journey Awaits'}</h1>

// 변경
<h1>{t('quiz.title')}</h1>
```

### 3단계: 동적 데이터 처리

#### API 응답
```tsx
// 기존
{language === 'ko' && data.title_ko ? data.title_ko : data.title}

// 변경 (헬퍼 사용)
import { localizeContent } from '@/lib/i18n';
{localizeContent(data, language)}
```

## 🛠️ 유용한 도구들

### 번역 검증
```bash
npm run validate-translations
```

### 번역 누락 감지
개발 환경에서 콘솔에 자동으로 경고 표시

### 타입 안전성
```tsx
// 자동완성 지원
t('common.welcome') // ✅
t('common.welcom')  // ❌ 타입 에러
```

## 📝 번역 추가 방법

1. `ko.json`과 `en.json`에 동일한 키 추가
2. `npm run validate-translations` 실행
3. 컴포넌트에서 사용

```json
// ko.json
{
  "newFeature": {
    "title": "새로운 기능",
    "description": "멋진 새 기능입니다"
  }
}

// en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "An awesome new feature"
  }
}
```

## ⚡ 성능 최적화

- Suspense 비활성화로 초기 로딩 속도 향상
- 번역 파일 자동 캐싱
- 필요한 언어만 로드

## 🔍 디버깅

1. 번역 누락 시 콘솔에 경고
2. `debug: true` 옵션으로 상세 로그
3. 번역 검증 스크립트로 사전 체크

## 📊 진행 상황 추적

현재 마이그레이션이 필요한 파일들:
- [ ] app/page.tsx
- [ ] app/quiz/page.tsx
- [ ] app/results/page.tsx
- [ ] components/quiz/AudioGuideQuiz.tsx
- [ ] components/navigation/FloatingNav.tsx
- [ ] 기타 27개 파일...

## 🎯 최종 목표

1. 모든 하드코딩된 텍스트 제거
2. 중앙화된 번역 관리
3. 타입 안전성 확보
4. 번역 누락 자동 감지
5. 외부 콘텐츠도 다국어 지원