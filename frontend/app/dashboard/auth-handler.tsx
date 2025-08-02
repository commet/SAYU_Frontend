'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('AuthHandler: Starting auth check...');
        const supabase = createClient();
        
        // Check if we have auth params in URL (OAuth redirect)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        console.log('AuthHandler: URL hash params:', window.location.hash);
        console.log('AuthHandler: Access token found:', !!accessToken);
        
        if (accessToken) {
          console.log('AuthHandler: Setting session from URL params...');
          // Set the session from URL params
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
          
          if (error) {
            console.error('AuthHandler: Error setting session:', error);
            router.push('/login');
          } else if (data.session) {
            console.log('AuthHandler: Session set successfully:', data.session.user);
            // Clean up URL and redirect
            window.history.replaceState({}, document.title, '/dashboard');
            router.push('/dashboard');
          }
        } else {
          // Check existing session
          console.log('AuthHandler: Checking existing session...');
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            console.log('AuthHandler: No session found, redirecting to login');
            router.push('/login');
          } else {
            console.log('AuthHandler: Session found, staying on dashboard');
          }
        }
      } catch (error) {
        console.error('AuthHandler: Auth error:', error);
        router.push('/login');
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">인증 확인 중...</p>
      </div>
    </div>
  );
}