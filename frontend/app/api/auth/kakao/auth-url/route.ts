import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 서버사이드에서만 클라이언트 ID 사용
    const kakaoClientId = process.env.KAKAO_CLIENT_ID; // NEXT_PUBLIC_ 없음!
    
    if (!kakaoClientId) {
      return NextResponse.json(
        { error: 'Kakao Client ID not configured' },
        { status: 500 }
      );
    }

    // 환경에 따른 redirect URI 설정
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
      ? process.env.NEXT_PUBLIC_APP_URL || 'https://www.sayu.my' 
      : 'http://localhost:3000';
    
    const redirectUri = `${baseUrl}/auth/kakao/callback`;

    const params = new URLSearchParams({
      client_id: kakaoClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'profile_nickname,profile_image', // Only request nickname and image, NO EMAIL
    });

    const authUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;

    return NextResponse.json({
      success: true,
      authUrl
    });

  } catch (error) {
    console.error('Kakao auth URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Kakao auth URL' },
      { status: 500 }
    );
  }
}