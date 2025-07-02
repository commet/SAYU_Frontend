'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

// 기존 LanguageContext와 호환성 유지
interface LanguageContextType {
  language: 'en' | 'ko';
  setLanguage: (lang: 'en' | 'ko') => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const I18nLanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // 초기 언어 설정
  useEffect(() => {
    const savedLanguage = localStorage.getItem('sayu-language-preference');
    if (savedLanguage === 'en' || savedLanguage === 'ko') {
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: 'en' | 'ko') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('sayu-language-preference', lang);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ko' : 'en';
    setLanguage(newLang);
  };

  const value: LanguageContextType = {
    language: (i18n.language as 'en' | 'ko') || 'ko',
    setLanguage,
    toggleLanguage,
  };

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
};

// 기존 useLanguage 훅과 호환성 유지
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};