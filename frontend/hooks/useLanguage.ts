'use client';

import { useState, useEffect } from 'react';

export type Language = 'ko' | 'en';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('ko');

  useEffect(() => {
    // localStorage에서 언어 설정 로드
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['ko', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // 브라우저 언어 감지
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('en')) {
        setLanguage('en');
      } else {
        setLanguage('ko');
      }
    }
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // 페이지 새로고침이 필요한 경우 (선택사항)
    // window.location.reload();
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'ko' ? 'en' : 'ko';
    changeLanguage(newLanguage);
  };

  return {
    language,
    changeLanguage,
    toggleLanguage,
    isKorean: language === 'ko',
    isEnglish: language === 'en'
  };
}