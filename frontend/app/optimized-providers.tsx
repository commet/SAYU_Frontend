'use client';

import { createContext, use, ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context들을 더 효율적으로 구성
interface AppContextType {
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  user: any;
  settings: any;
}

const AppContext = createContext<AppContextType | null>(null);

// 단일 Provider로 통합하여 렌더링 최적화
interface OptimizedProvidersProps {
  children: ReactNode;
  initialData?: {
    theme?: 'light' | 'dark';
    language?: 'ko' | 'en';
    user?: any;
  };
}

export function OptimizedProviders({ 
  children, 
  initialData = {} 
}: OptimizedProvidersProps) {
  // QueryClient는 한 번만 생성
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 30 * 60 * 1000, // 30분
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // 404 에러는 재시도하지 않음
          if ((error as any)?.status === 404) return false;
          return failureCount < 3;
        }
      },
      mutations: {
        retry: 1
      }
    }
  });

  // 앱 전역 상태를 단일 객체로 관리
  const contextValue: AppContextType = {
    theme: initialData.theme || 'light',
    language: initialData.language || 'ko',
    user: initialData.user || null,
    settings: {
      animationsEnabled: true,
      performanceMode: 'auto'
    }
  };

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={contextValue}>
          {children}
        </AppContext.Provider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

// 커스텀 훅으로 컨텍스트 사용
export function useAppContext() {
  const context = use(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within OptimizedProviders');
  }
  return context;
}

// 개별 상태 접근용 훅들
export function useTheme() {
  const { theme } = useAppContext();
  return theme;
}

export function useLanguage() {
  const { language } = useAppContext();
  return language;
}

export function useUser() {
  const { user } = useAppContext();
  return user;
}