import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the supported languages
export type Language = 'en' | 'ko';

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Local storage key for persisting language preference
const LANGUAGE_STORAGE_KEY = 'sayu-language-preference';

// Provider component props
interface LanguageProviderProps {
  children: ReactNode;
}

// Language Provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Initialize state with Korean as default
  const [language, setLanguageState] = useState<Language>('ko');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage === 'en' || savedLanguage === 'ko') {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Function to set language and persist to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  // Function to toggle between languages
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ko' : 'en';
    setLanguage(newLang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Optional: Helper hook to get translated text
export const useTranslation = () => {
  const { language } = useLanguage();
  
  // This is a simple translation function - you can expand this based on your needs
  const t = (translations: { en: string; ko: string }): string => {
    return translations[language];
  };

  return { t, language };
};