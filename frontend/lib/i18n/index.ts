import i18n from './config';
import { useTranslation as useTranslationBase } from 'react-i18next';

// 타입 안전성을 위한 커스텀 훅
export const useTranslation = () => {
  const { t, i18n: i18nInstance, ready } = useTranslationBase();
  
  return {
    t,
    i18n: i18nInstance,
    ready,
    language: i18nInstance.language,
    changeLanguage: (lng: 'ko' | 'en') => i18nInstance.changeLanguage(lng),
  };
};

// 번역 키 타입 (자동완성을 위해)
export type TranslationKeys = 
  | 'common.welcome'
  | 'common.login'
  | 'common.logout'
  | 'quiz.title'
  | 'quiz.subtitle'
  | 'results.youAre'
  // ... 필요에 따라 추가

// 번역 헬퍼 함수들
export const getLocalizedData = <T extends { [key: string]: any }>(
  data: T,
  language: string,
  fallbackLanguage: string = 'ko'
): string => {
  const langKey = `${language}` as keyof T;
  const fallbackKey = `${fallbackLanguage}` as keyof T;
  
  return (data[langKey] || data[fallbackKey] || data.ko || data.en || '') as string;
};

// 동적 콘텐츠용 헬퍼
export const localizeContent = (content: any, language: string) => {
  if (typeof content === 'string') return content;
  if (typeof content === 'object' && content !== null) {
    return content[language] || content.ko || content.en || '';
  }
  return '';
};

export default i18n;