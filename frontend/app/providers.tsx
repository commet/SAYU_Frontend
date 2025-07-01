'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/usePersonalizedTheme';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PWAProvider>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <OnboardingProvider>
                {children}
                <PersonalizedToaster />
              </OnboardingProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </PWAProvider>
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