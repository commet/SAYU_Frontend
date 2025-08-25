import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Kakao 사용자 정보 조회 API 호출
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Kakao user info error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get user information' },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();

    // 필요한 정보만 반환 (보안상 전체 응답을 그대로 전달하지 않음)
    const user = {
      id: userData.id,
      properties: {
        nickname: userData.properties?.nickname,
        profile_image: userData.properties?.profile_image,
        thumbnail_image: userData.properties?.thumbnail_image,
      }
    };

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Kakao user info API Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}