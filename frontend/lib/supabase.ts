import { createClient } from './supabase/client';

// Use the singleton client from supabase/client.ts
export const supabase = createClient();

// Auth helper functions
export const signInWithProvider = async (provider: 'google' | 'apple' | 'kakao' | 'discord') => {
  // Set specific options for Kakao
  const options: any = {
    redirectTo: `${window.location.origin}/auth/callback`,
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: options
  });
  
  if (error) throw error;
  return data;
};

// Instagram 로그인 - Facebook 앱에서 email 권한 활성화됨
export const signInWithInstagram = async () => {
  console.log('Starting Instagram/Facebook login...');
  console.log('Redirect URL:', `${window.location.origin}/auth/callback`);
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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