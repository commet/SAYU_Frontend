import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // 서버사이드에서만 클라이언트 시크릿 사용
    const kakaoClientId = process.env.KAKAO_CLIENT_ID; // NEXT_PUBLIC_ 없음!
    const kakaoClientSecret = process.env.KAKAO_CLIENT_SECRET; // NEXT_PUBLIC_ 없음!
    
    if (!kakaoClientId) {
      return NextResponse.json(
        { error: 'Kakao credentials not configured' },
        { status: 500 }
      );
    }

    // 환경에 따른 redirect URI 설정
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
      ? process.env.NEXT_PUBLIC_APP_URL || 'https://www.sayu.my' 
      : 'http://localhost:3000';
    
    const redirectUri = `${baseUrl}/auth/kakao/callback`;

    // Kakao 토큰 교환 API 호출
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: kakaoClientId,
        client_secret: kakaoClientSecret || '',
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Kakao token exchange error:', errorText);
      return NextResponse.json(
        { error: 'Failed to exchange code for token' },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();

    return NextResponse.json({
      success: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    });

  } catch (error) {
    console.error('Kakao token exchange API Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}