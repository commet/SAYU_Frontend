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
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for session multiple times
        let retries = 3;
        let session = null;
        
        while (retries > 0 && !session) {
          const { data, error } = await supabase.auth.getSession();
          session = data.session;
          
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
            
            router.push('/profile');
            return;
          } else if (error) {
            console.error('Error getting session:', error);
          }
          
          retries--;
          if (retries > 0) {
            console.log(`Retrying... ${retries} attempts left`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // If still no session, try refreshing the session
        console.log('Attempting to refresh session...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshData?.session) {
          console.log('Session refreshed successfully!');
          router.push('/profile');
          return;
        } else {
          console.error('Failed to refresh session:', refreshError);
        }
      }
      
      // Check for OAuth code (authorization code flow / PKCE)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        router.push(`/login?error=${error}`);
        return;
      }
      
      if (code) {
        console.log('Found OAuth code:', code);
        console.log('Full URL:', window.location.href);
        setStatus('Exchanging authorization code...');
        
        try {
          // Exchange code for session (PKCE flow)
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          console.log('Exchange response:', { data, error: exchangeError });
          
          if (exchangeError) {
            console.error('Exchange error details:', {
              message: exchangeError.message,
              status: exchangeError.status,
              name: exchangeError.name,
              cause: exchangeError.cause
            });
            setStatus(`Authentication failed: ${exchangeError.message}`);
            
            // Wait a bit before redirecting to login
            await new Promise(resolve => setTimeout(resolve, 3000));
            router.push(`/login?error=${encodeURIComponent(exchangeError.message)}`);
            return;
          }
          
          if (data?.session) {
            console.log('Session created from code exchange!');
            console.log('User:', data.session.user.email || data.session.user.user_metadata?.email || 'No email');
            console.log('Provider:', data.session.user.app_metadata?.provider);
            
            // Migrate quiz results
            try {
              const { migrateLocalQuizResults } = await import('@/lib/quiz-api');
              await migrateLocalQuizResults();
              console.log('Quiz results migrated');
            } catch (error) {
              console.error('Failed to migrate quiz results:', error);
            }
            
            router.push('/profile');
            return;
          } else {
            console.log('No session in exchange response');
            setStatus('No session created. Please try again.');
          }
        } catch (err) {
          console.error('Unexpected error during code exchange:', err);
          setStatus('Unexpected error. Please try again.');
          await new Promise(resolve => setTimeout(resolve, 3000));
          router.push('/login?error=exchange_failed');
        }
      }
      
      // Final check for session
      setStatus('Verifying authentication...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Session found!');
        router.push('/profile');
      } else {
        console.log('No session found after all attempts');
        console.log('Full URL for debugging:', window.location.href);
        setStatus('Authentication failed. Redirecting to login...');
        await new Promise(resolve => setTimeout(resolve, 2000));
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