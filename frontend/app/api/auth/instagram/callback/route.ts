import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  // Handle errors
  if (error) {
    console.error('Instagram OAuth error:', error);
    return NextResponse.redirect(
      new URL('/quiz/results?error=instagram_auth_failed', request.url)
    );
  }
  
  if (!code) {
    return NextResponse.redirect(
      new URL('/quiz/results?error=no_code', request.url)
    );
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch(authConfig.instagram.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: authConfig.instagram.clientId,
        client_secret: authConfig.instagram.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: authConfig.instagram.redirectUri,
        code: code,
      }),
    });
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }
    
    const tokenData = await tokenResponse.json();
    const { access_token, user_id } = tokenData;
    
    // Get user profile
    const profileResponse = await fetch(
      `https://graph.instagram.com/${user_id}?fields=id,username,account_type&access_token=${access_token}`
    );
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const profile = await profileResponse.json();
    
    // Here you would typically:
    // 1. Create or update user in your database
    // 2. Create a session
    // 3. Set cookies
    
    // For now, we'll redirect back with the user info
    const redirectUrl = new URL('/quiz/results', request.url);
    redirectUrl.searchParams.set('instagram_auth', 'success');
    redirectUrl.searchParams.set('username', profile.username);
    
    // Set a temporary cookie with the auth info
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('instagram_user', JSON.stringify({
      id: profile.id,
      username: profile.username,
      authenticated: true,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('Instagram OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/quiz/results?error=auth_failed', request.url)
    );
  }
}