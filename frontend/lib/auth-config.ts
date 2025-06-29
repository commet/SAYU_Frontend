export const authConfig = {
  instagram: {
    clientId: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
    authorizationUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    scope: 'user_profile,user_media',
    redirectUri: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/auth/instagram/callback`
  },
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  kakao: {
    clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || '',
    clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
  }
};

export function getInstagramAuthUrl(): string {
  const { clientId, redirectUri, scope } = authConfig.instagram;
  const state = Math.random().toString(36).substring(7);
  
  // Store state for CSRF protection
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('instagram_auth_state', state);
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
    response_type: 'code',
    state: state
  });
  
  return `${authConfig.instagram.authorizationUrl}?${params.toString()}`;
}