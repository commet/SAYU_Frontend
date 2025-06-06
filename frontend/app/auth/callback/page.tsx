'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const provider = searchParams.get('provider');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        router.push(`/login?error=${error}`);
        return;
      }

      if (accessToken && refreshToken) {
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Update auth context
        setTokens(accessToken, refreshToken);

        // Redirect to dashboard or onboarding
        router.push('/');
      } else {
        router.push('/login?error=missing_tokens');
      }
    };

    handleCallback();
  }, [searchParams, router, setTokens]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Authenticating...</h2>
          <p className="mt-2 text-gray-600">Please wait while we complete your login.</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}