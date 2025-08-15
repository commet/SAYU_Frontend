import { createClient } from './supabase/client';
import { signInWithKakaoCustom } from './kakao-auth';

// Use the singleton client from supabase/client.ts
export const supabase = createClient();

// Auth helper functions
export const signInWithProvider = async (provider: 'google' | 'apple' | 'kakao' | 'discord') => {
  // Special handling for Kakao - use custom OAuth
  if (provider === 'kakao') {
    return signInWithKakaoCustom();
  }
  // Environment-aware redirect URL
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isVercel = window.location.hostname.includes('vercel.app');
  
  let redirectUrl: string;
  
  if (isDev) {
    // Development: always use localhost
    redirectUrl = `${window.location.origin}/auth/callback`;
  } else if (isVercel) {
    // Vercel preview: use current preview URL
    redirectUrl = `${window.location.origin}/auth/callback`;
  } else {
    // Production: use production domain
    redirectUrl = `https://www.sayu.my/auth/callback`;
  }
  
  // Debug logging
  console.log('🔐 Auth Provider:', provider);
  console.log('📍 Window Origin:', window.location.origin);
  console.log('🏠 Environment:', { isDev, isVercel, hostname: window.location.hostname });
  console.log('🔄 Redirect URL:', redirectUrl);
  console.log('📋 Current URL:', window.location.href);
  
  // Set specific options for all providers
  const options: any = {
    redirectTo: redirectUrl,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  };

  // For Google, add specific scopes
  if (provider === 'google') {
    options.scopes = 'email profile';
  }


  console.log('🚀 OAuth Options:', options);
  console.log('🔑 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: options
    });
    
    console.log('✅ OAuth Response:', { data, error });
    
    if (error) {
      console.error('❌ OAuth Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name
      });
      throw error;
    }
    
    // Log the URL being redirected to
    if (data?.url) {
      console.log('🔗 Redirecting to:', data.url);
    }
    
    return data;
  } catch (err) {
    console.error('❌ SignInWithProvider catch error:', err);
    throw err;
  }
};

// Instagram 로그인 - Facebook 앱에서 email 권한 활성화됨
export const signInWithInstagram = async () => {
  // Get the correct redirect URL based on environment
  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    : `${window.location.origin}/auth/callback`;
    
  console.log('Starting Instagram/Facebook login...');
  console.log('Redirect URL:', redirectUrl);
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
        queryParams: {
          scope: 'email,public_profile', // Facebook 앱에서 email 권한 활성화함
        },
      }
    });
    
    console.log('OAuth response:', { data, error });
    
    if (error) {
      console.error('Instagram login error:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Instagram login catch:', err);
    throw err;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};