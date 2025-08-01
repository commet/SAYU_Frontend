'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/usePersonalizedTheme';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AnimalCursorProvider } from '@/contexts/AnimalCursorContext';
import { EasterEggProvider } from '@/contexts/EasterEggContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
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
    <QueryClientProvider client={queryClient}>
      <PWAProvider>
        <AuthProvider>
          <LanguageProvider>
            <DarkModeProvider>
              <ThemeProvider>
                <OnboardingProvider>
                  <AnimalCursorProvider>
                    <EasterEggProvider>
                      <ClientLayout>
                        {children}
                      </ClientLayout>
                      <PersonalizedToaster />
                    </EasterEggProvider>
                  </AnimalCursorProvider>
                </OnboardingProvider>
              </ThemeProvider>
            </DarkModeProvider>
          </LanguageProvider>
        </AuthProvider>
      </PWAProvider>
    </QueryClientProvider>
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