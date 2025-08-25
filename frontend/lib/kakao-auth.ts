// Kakao OAuth without email - Ultra Solution
export interface KakaoUser {
  id: number;
  properties: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
}

export const getKakaoAuthUrl = async (): Promise<string> => {
  // 보안상 서버사이드에서 URL 생성
  try {
    const response = await fetch('/api/auth/kakao/auth-url', {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get Kakao auth URL');
    }
    
    const data = await response.json();
    return data.authUrl;
  } catch (error) {
    console.error('Error getting Kakao auth URL:', error);
    throw error;
  }
};

export const exchangeKakaoCode = async (code: string): Promise<string> => {
  // 보안상 서버사이드에서 토큰 교환
  try {
    const response = await fetch('/api/auth/kakao/exchange-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to exchange Kakao code: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error('Error exchanging Kakao code:', error);
    throw error;
  }
};

export const getKakaoUser = async (accessToken: string): Promise<KakaoUser> => {
  // 보안상 서버사이드에서 사용자 정보 조회
  try {
    const response = await fetch('/api/auth/kakao/user-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to get Kakao user info: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting Kakao user info:', error);
    throw error;
  }
};

// Generate virtual email from Kakao user ID
export const generateVirtualEmail = (kakaoUserId: number): string => {
  return `kakao_${kakaoUserId}@sayu.local`;
};

// Custom Kakao login function
export const signInWithKakaoCustom = async () => {
  try {
    const authUrl = await getKakaoAuthUrl();
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error initiating Kakao login:', error);
    throw error;
  }
};