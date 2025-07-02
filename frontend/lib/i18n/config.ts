import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.json';
import en from './locales/en.json';

// 번역 누락 감지를 위한 커스텀 핸들러
const missingKeyHandler = (lng: string[], ns: string, key: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`🌐 Missing translation: [${lng}] ${key}`);
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en }
    },
    lng: 'ko', // 기본 언어
    fallbackLng: 'ko', // 번역 없을 때 대체 언어
    
    interpolation: {
      escapeValue: false // React는 자체적으로 XSS 방지
    },
    
    // 개발 환경에서만 디버그
    debug: process.env.NODE_ENV === 'development',
    
    // 번역 누락 핸들러
    missingKeyHandler,
    
    // 성능 최적화
    react: {
      useSuspense: false // Suspense 사용 안함 (더 가벼움)
    }
  });

export default i18n;