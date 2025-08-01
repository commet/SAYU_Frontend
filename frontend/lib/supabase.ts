import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        scope: 'email,public_profile', // Facebook 앱에서 email 권한 활성화함
      },
    }
  });
  
  if (error) throw error;
  return data;
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