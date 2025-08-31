'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestOAuthPage() {
  const supabase = createClient();
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testGoogleLogin = async () => {
    setStatus('Testing Google OAuth...');
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        setError(`Google OAuth Error: ${error.message}`);
        console.error('Google OAuth Error:', error);
      } else {
        setStatus('Google OAuth initiated successfully!');
        console.log('Google OAuth Data:', data);
      }
    } catch (err: any) {
      setError(`Google OAuth Exception: ${err.message}`);
      console.error('Google OAuth Exception:', err);
    }
  };

  const testFacebookLogin = async () => {
    setStatus('Testing Facebook/Instagram OAuth...');
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            scope: 'email,public_profile'
          }
        }
      });
      
      if (error) {
        setError(`Facebook OAuth Error: ${error.message}`);
        console.error('Facebook OAuth Error:', error);
      } else {
        setStatus('Facebook OAuth initiated successfully!');
        console.log('Facebook OAuth Data:', data);
      }
    } catch (err: any) {
      setError(`Facebook OAuth Exception: ${err.message}`);
      console.error('Facebook OAuth Exception:', err);
    }
  };

  const checkAuthProviders = async () => {
    setStatus('Checking available auth providers...');
    setError('');
    
    try {
      // Test connection to Supabase
      const { data: session } = await supabase.auth.getSession();
      setStatus(`Supabase connection: OK\nCurrent session: ${session.session ? 'Active' : 'None'}`);
      
      // Check Supabase URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log('Environment Check:', {
        supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
        supabaseAnon: supabaseAnon ? 'Set' : 'Missing',
        appUrl: process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      });
      
    } catch (err: any) {
      setError(`Check Error: ${err.message}`);
      console.error('Check Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          OAuth Test Page
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Test OAuth Providers
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={checkAuthProviders}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Check Supabase Connection
            </button>
            
            <button
              onClick={testGoogleLogin}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-4"
            >
              Test Google OAuth
            </button>
            
            <button
              onClick={testFacebookLogin}
              className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 ml-4"
            >
              Test Facebook/Instagram OAuth
            </button>
          </div>
        </div>
        
        {status && (
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg mb-4">
            <pre className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
              {status}
            </pre>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-4">
            <pre className="text-red-800 dark:text-red-200 whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        )}
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Setup Instructions:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Supabase Dashboard:</strong>
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Go to Authentication → Providers</li>
                <li>• Enable Google provider</li>
                <li>• Enable Facebook provider</li>
                <li>• Add OAuth credentials from Google Cloud Console</li>
                <li>• Add OAuth credentials from Facebook Developer</li>
              </ul>
            </li>
            <li className="mt-4">
              <strong>Google Cloud Console:</strong>
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Create OAuth 2.0 Client ID</li>
                <li>• Add authorized redirect URI: {`${window.location.origin}/auth/callback`}</li>
                <li>• Copy Client ID and Secret to Supabase</li>
              </ul>
            </li>
            <li className="mt-4">
              <strong>Facebook Developer:</strong>
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Create Facebook App</li>
                <li>• Add Facebook Login product</li>
                <li>• Add valid OAuth redirect URI</li>
                <li>• Copy App ID and Secret to Supabase</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}