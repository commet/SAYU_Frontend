'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('Auth callback - Starting...');
      console.log('URL:', window.location.href);
      
      const supabase = createClient();
      
      // Supabase redirects with hash fragment
      if (window.location.hash) {
        console.log('Auth callback - Found hash fragment:', window.location.hash);
        
        // Wait for Supabase to process the hash
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback - Error getting session:', error);
          router.push('/login?error=' + encodeURIComponent(error.message));
          return;
        }
        
        if (data.session) {
          console.log('Auth callback - Session found:', data.session.user.email);
          
          // Migrate quiz results after successful login
          try {
            const { migrateLocalQuizResults } = await import('@/lib/quiz-api');
            await migrateLocalQuizResults();
            console.log('Quiz results migrated successfully');
          } catch (error) {
            console.error('Failed to migrate quiz results:', error);
          }
          
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          console.log('Auth callback - No session found after waiting');
          router.push('/login');
        }
      } else {
        console.log('Auth callback - No hash fragment found');
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