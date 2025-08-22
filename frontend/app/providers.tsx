'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/usePersonalizedTheme';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { OnboardingProviderV2 } from '@/contexts/OnboardingContextV2';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AnimalCursorProvider } from '@/contexts/AnimalCursorContext';
import { EasterEggProvider } from '@/contexts/EasterEggContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { ArtworkViewingProvider } from '@/contexts/ArtworkViewingContext';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import ClientLayout from '@/components/layouts/ClientLayout';
import { SmartChatbot } from '@/components/chatbot/SmartChatbot';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { initializePerformance } from '@/lib/performance-config';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  useEffect(() => {
    initializePerformance();
    
    // Handle font loading
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
      });
    } else {
      // Fallback for browsers that don't support Font Loading API
      setTimeout(() => {
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
      }, 1000);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PWAProvider>
        <AuthProvider>
          <LanguageProvider>
            <DarkModeProvider>
              <ThemeProvider>
                <OnboardingProvider>
                  <OnboardingProviderV2>
                    <AnimalCursorProvider>
                      <EasterEggProvider>
                        <ArtworkViewingProvider>
                          <ClientLayout>
                            {children}
                          </ClientLayout>
                          <PersonalizedToaster />
                          <SmartChatbot />
                        </ArtworkViewingProvider>
                      </EasterEggProvider>
                    </AnimalCursorProvider>
                  </OnboardingProviderV2>
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
          background: '#1f2937',
          color: '#f3f4f6', 
          border: '1px solid #374151',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '8px'
        },
        duration: 3000,
        success: {
          style: {
            background: '#065f46',
            color: '#ecfdf5',
            border: '1px solid #047857'
          }
        },
        error: {
          style: {
            background: '#7f1d1d',
            color: '#fef2f2', 
            border: '1px solid #dc2626'
          }
        }
      }}
    />
  );
}