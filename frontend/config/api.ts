/**
 * Centralized API configuration
 * All API endpoints and base URLs should be imported from this file
 */

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  endpoints: {
    // Auth
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile',
    
    // OAuth
    oauth: {
      instagram: {
        callback: '/api/oauth/instagram/callback'
      },
      google: {
        callback: '/api/oauth/google/callback'
      },
      kakao: {
        callback: '/api/oauth/kakao/callback'
      }
    },
    
    // Quiz
    quiz: {
      analyze: '/api/quiz/analyze',
      results: '/api/quiz/results'
    },
    
    // Art Profile
    artProfile: {
      generate: '/api/art-profile/generate',
      get: '/api/art-profile',
      update: '/api/art-profile'
    },
    
    // Artvee
    artvee: {
      base: '/api/artvee',
      personality: (type: string) => `/api/artvee/personality/${type}`,
      quiz: '/api/artvee/quiz/random',
      artwork: (id: string) => `/api/artvee/artwork/${id}`,
      recommendations: '/api/artvee/recommendations',
      search: '/api/artvee/search',
      stats: '/api/artvee/stats',
      images: (id: string) => `/api/artvee/images/${id}`
    },
    
    // Follow
    follow: {
      follow: '/api/follow',
      unfollow: '/api/follow',
      followers: (userId: string) => `/api/follow/followers/${userId}`,
      following: (userId: string) => `/api/follow/following/${userId}`,
      status: (userId: string) => `/api/follow/status/${userId}`
    }
  }
};

/**
 * Get full API URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}

/**
 * Get OAuth redirect URI
 */
export function getOAuthRedirectUri(provider: 'instagram' | 'google' | 'kakao'): string {
  return `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.oauth[provider].callback}`;
}