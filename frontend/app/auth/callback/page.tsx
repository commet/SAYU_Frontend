'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      
      // Check if we have hash parameters (for implicit flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        // Handle the OAuth callback
        const { error } = await supabase.auth.getSession();
        
        if (!error) {
          // Successfully authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          console.error('Auth callback error:', error);
          router.push('/login?error=auth_failed');
        }
      } else {
        // No access token, redirect to login
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-400 mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm">인증 처리 중...</p>
      </div>
    </div>
  );
}