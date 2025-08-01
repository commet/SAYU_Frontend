import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { 
  exchangeKakaoCode, 
  getKakaoUser, 
  generateVirtualEmail, 
  type KakaoUser 
} from '@/lib/kakao-auth';

export async function GET(request: Request) {
  console.log('Kakao callback triggered');
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  
  if (error) {
    console.error('Kakao OAuth error:', error);
    return NextResponse.redirect(new URL(`/login?error=kakao_error`, requestUrl.origin));
  }

  if (!code) {
    console.error('No code provided from Kakao');
    return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin));
  }

  try {
    console.log('🔄 Processing Kakao login...');
    
    // Step 1: Exchange code for access token
    const accessToken = await exchangeKakaoCode(code);
    console.log('✅ Got Kakao access token');
    
    // Step 2: Get user info from Kakao
    const kakaoUser: KakaoUser = await getKakaoUser(accessToken);
    console.log('✅ Got Kakao user info:', kakaoUser.id, kakaoUser.properties?.nickname);
    
    // Step 3: Generate virtual email
    const virtualEmail = generateVirtualEmail(kakaoUser.id);
    console.log('✅ Virtual email generated:', virtualEmail);
    
    // Step 4: Create or sign in user with Supabase
    const supabase = createRouteHandlerClient({ cookies });
    
    // Use a consistent password for all Kakao users based on their ID
    const kakaoPassword = `kakao_${kakaoUser.id}_sayu2024!`;
    
    // First try to sign in (for existing users)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: virtualEmail,
      password: kakaoPassword,
    });
    
    if (signInData.user) {
      console.log('✅ Existing Kakao user signed in successfully');
      
      // Update user metadata with latest info from Kakao
      await supabase.auth.updateUser({
        data: {
          kakao_nickname: kakaoUser.properties?.nickname,
          kakao_profile_image: kakaoUser.properties?.profile_image,
          full_name: kakaoUser.properties?.nickname,
          avatar_url: kakaoUser.properties?.profile_image,
        },
      });
      
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
    
    // If sign in failed, try to sign up (for new users)
    console.log('✅ New Kakao user, creating account...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: virtualEmail,
      password: kakaoPassword,
      options: {
        data: {
          provider: 'kakao',
          kakao_id: kakaoUser.id,
          kakao_nickname: kakaoUser.properties?.nickname,
          kakao_profile_image: kakaoUser.properties?.profile_image,
          kakao_thumbnail_image: kakaoUser.properties?.thumbnail_image,
          full_name: kakaoUser.properties?.nickname || `카카오 사용자 ${kakaoUser.id}`,
          avatar_url: kakaoUser.properties?.profile_image,
          virtual_email: true,
        },
        emailRedirectTo: `${requestUrl.origin}/dashboard`,
      },
    });
    
    if (signUpError) {
      console.error('❌ Failed to sign up Kakao user:', signUpError);
      return NextResponse.redirect(new URL('/login?error=kakao_signup_failed', requestUrl.origin));
    }
    
    if (signUpData.user) {
      console.log('✅ Kakao user signed up successfully');
      // If email confirmation is disabled, user should be signed in automatically
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } else {
      console.error('❌ No user data returned from signup');
      return NextResponse.redirect(new URL('/login?error=no_user_data', requestUrl.origin));
    }
    
  } catch (error) {
    console.error('❌ Kakao login error:', error);
    return NextResponse.redirect(new URL('/login?error=kakao_failed', requestUrl.origin));
  }
}