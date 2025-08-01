// Kakao OAuth without email - Ultra Solution
export interface KakaoUser {
  id: number;
  properties: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
}

export const getKakaoAuthUrl = () => {
  const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  
  // 환경에 따른 redirect URI 설정
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction 
    ? process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com' 
    : 'http://localhost:3000';
  
  const redirectUri = `${baseUrl}/auth/kakao/callback`;
  
  if (!kakaoClientId) {
    throw new Error('Kakao Client ID not found');
  }

  const params = new URLSearchParams({
    client_id: kakaoClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'profile_nickname,profile_image', // Only request nickname and image, NO EMAIL
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
};

export const exchangeKakaoCode = async (code: string): Promise<string> => {
  const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  
  // 환경에 따른 redirect URI 설정 (getKakaoAuthUrl과 동일하게)
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction 
    ? process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com' 
    : 'http://localhost:3000';
  
  const redirectUri = `${baseUrl}/auth/kakao/callback`;

  if (!kakaoClientId) {
    throw new Error('Kakao Client ID not found');
  }

  const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: kakaoClientId,
      redirect_uri: redirectUri,
      code: code,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange Kakao code for token');
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
};

export const getKakaoUser = async (accessToken: string): Promise<KakaoUser> => {
  const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to get Kakao user info');
  }

  return await userResponse.json();
};

// Generate virtual email from Kakao user ID
export const generateVirtualEmail = (kakaoUserId: number): string => {
  return `kakao_${kakaoUserId}@sayu.local`;
};

// Custom Kakao login function
export const signInWithKakaoCustom = async () => {
  const authUrl = getKakaoAuthUrl();
  window.location.href = authUrl;
};