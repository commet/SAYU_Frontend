// 기존 코드를 i18n으로 쉽게 마이그레이션하기 위한 헬퍼

import { useTranslation } from './index';

// 기존 조건문 스타일을 i18n으로 변환하는 컴포넌트
export const LocalizedText = ({ 
  ko, 
  en,
  fallback = ''
}: { 
  ko?: string; 
  en?: string;
  fallback?: string;
}) => {
  const { language } = useTranslation();
  
  if (language === 'ko' && ko) return <>{ko}</>;
  if (language === 'en' && en) return <>{en}</>;
  return <>{fallback}</>;
};

// 동적 데이터를 위한 헬퍼
export const useLocalizedData = () => {
  const { language } = useTranslation();
  
  return <T extends Record<string, any>>(data: T): string => {
    if (typeof data === 'string') return data;
    
    // 언어별 키 확인
    if (data[language]) return data[language];
    if (data[`${language}_${language.toUpperCase()}`]) return data[`${language}_${language.toUpperCase()}`];
    
    // 폴백
    if (data.ko) return data.ko;
    if (data.en) return data.en;
    
    // 첫 번째 문자열 값 반환
    const firstString = Object.values(data).find(v => typeof v === 'string');
    return firstString as string || '';
  };
};

// 기존 language === 'ko' ? ... : ... 패턴을 대체하는 훅
export const useConditionalText = (koText: string, enText: string) => {
  const { language } = useTranslation();
  return language === 'ko' ? koText : enText;
};

// 점진적 마이그레이션을 위한 래퍼
export const withI18n = <P extends object>(
  Component: React.ComponentType<P & { t: any; language: string }>
) => {
  const WrappedComponent = (props: P) => {
    const { t, language } = useTranslation();
    return <Component {...props} t={t} language={language} />;
  };
  
  WrappedComponent.displayName = `withI18n(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
};