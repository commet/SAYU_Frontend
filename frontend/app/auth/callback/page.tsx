'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('Auth callback - Starting...');
      console.log('Full URL:', window.location.href);
      
      const supabase = createClient();
      
      // Handle Facebook's #_=_ artifact
      if (window.location.hash === '#_=_') {
        console.log('Removing Facebook artifact');
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      
      // Check if we have access_token in hash (implicit flow)
      if (window.location.hash && window.location.hash.includes('access_token')) {
        console.log('Found access token in hash - implicit flow successful!');
        setStatus('Authentication successful! Redirecting...');
        
        // Supabase will automatically detect and process the hash
        // Wait for it to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check for session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Session created from implicit flow!');
          console.log('User:', session.user.email);
          
          // Migrate quiz results
          try {
            const { migrateLocalQuizResults } = await import('@/lib/quiz-api');
            await migrateLocalQuizResults();
            console.log('Quiz results migrated');
          } catch (error) {
            console.error('Failed to migrate quiz results:', error);
          }
          
          router.push('/dashboard');
          return;
        } else if (error) {
          console.error('Error getting session:', error);
        }
      }
      
      // Check for OAuth code (authorization code flow)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        router.push(`/login?error=${error}`);
        return;
      }
      
      if (code) {
        console.log('Found OAuth code, but using implicit flow instead');
        // For implicit flow, we don't need to exchange code
      }
      
      // Final check for session
      setStatus('Verifying authentication...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Session found!');
        router.push('/dashboard');
      } else {
        console.log('No session found');
        router.push('/login?error=no_session');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 dark:border-gray-700 border-t-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{status}</p>
      </div>
    </div>
  );
}