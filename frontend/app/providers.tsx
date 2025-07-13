'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/usePersonalizedTheme';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
// TODO: 점진적 마이그레이션을 위해 임시로 둘 다 import
// import { I18nLanguageProvider } from '@/contexts/I18nLanguageProvider';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import ClientLayout from '@/components/layouts/ClientLayout';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <PWAProvider>
          <AuthProvider>
            <LanguageProvider>
              <ThemeProvider>
                <OnboardingProvider>
                  <ClientLayout>
                    {children}
                  </ClientLayout>
                  <PersonalizedToaster />
                </OnboardingProvider>
              </ThemeProvider>
            </LanguageProvider>
          </AuthProvider>
        </PWAProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

// Personalized toaster that adapts to user theme
function PersonalizedToaster() {
  return (
    <Toaster 
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
        },
        duration: 4000,
      }}
    />
  );
}