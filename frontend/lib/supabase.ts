import { createClient } from './supabase/client';

// Use the singleton client from supabase/client.ts
export const supabase = createClient();

// Auth helper functions
export const signInWithProvider = async (provider: 'google' | 'apple' | 'kakao' | 'discord') => {
  // Get the correct redirect URL based on environment
  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    : `${window.location.origin}/auth/callback`;
  
  // Debug logging
  console.log('🔐 Auth Provider:', provider);
  console.log('📍 App URL:', process.env.NEXT_PUBLIC_APP_URL);
  console.log('🔄 Redirect URL:', redirectUrl);
  
  // Set specific options for Kakao
  const options: any = {
    redirectTo: redirectUrl,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  };

  // For Kakao, explicitly set scopes without email and use queryParams
  if (provider === 'kakao') {
    options.queryParams = {
      ...options.queryParams,
      scope: 'profile_nickname profile_image',
    };
    // Remove scopes property as it might not work with Kakao
    delete options.scopes;
  }

  console.log('🚀 OAuth Options:', options);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: options
  });
  
  console.log('✅ OAuth Response:', { data, error });
  
  if (error) {
    console.error('❌ OAuth Error:', error);
    throw error;
  }
  return data;
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