/**
 * API Client for SAYU
 * Provides a unified interface for all API calls
 * Supports both Supabase direct calls and Vercel Functions
 */
import { supabaseAPI } from '../supabase/api';
import { createClient } from '../supabase/client';

// Get auth token from Supabase
async function getAuthToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Base fetch with auth
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

// Quiz API
export const quizAPI = {
  start: async (sessionType: 'exhibition' | 'artwork', language = 'ko') => {
    return fetchWithAuth('/api/quiz/start', {
      method: 'POST',
      body: JSON.stringify({ sessionType, language })
    });
  },

  submitAnswer: async (sessionId: string, questionId: string, answer: string, timeSpent?: number) => {
    return fetchWithAuth('/api/quiz/answer', {
      method: 'POST',
      body: JSON.stringify({ sessionId, questionId, answer, timeSpent })
    });
  },

  getResults: async () => {
    // Direct Supabase call
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    return supabaseAPI.quiz.getResults(user.id);
  }
};

// Exhibition API
export const exhibitionAPI = {
  list: async (params?: {
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    
    return fetchWithAuth(`/api/exhibitions?${queryParams}`);
  },

  get: async (id: string) => {
    return fetchWithAuth(`/api/exhibitions/${id}`);
  },

  like: async (id: string) => {
    return fetchWithAuth(`/api/exhibitions/${id}/like`, {
      method: 'POST'
    });
  },

  unlike: async (id: string) => {
    return fetchWithAuth(`/api/exhibitions/${id}/like`, {
      method: 'DELETE'
    });
  },

  // Direct Supabase calls for better performance
  search: async (query: string) => {
    return supabaseAPI.exhibitions.search(query);
  }
};

// Art Profile API
export const artProfileAPI = {
  generate: async (regenerate = false) => {
    return fetchWithAuth('/api/art-profile/generate', {
      method: 'POST',
      body: JSON.stringify({ regenerate })
    });
  },

  checkStatus: async (generationId: string) => {
    return fetchWithAuth(`/api/art-profile/status?generationId=${generationId}`);
  },

  // Direct Supabase call
  get: async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();
    
    if (!profile) throw new Error('Profile not found');
    
    return supabaseAPI.artProfiles.get(profile.id);
  }
};

// Perception Exchange API
export const perceptionAPI = {
  create: async (data: {
    artworkId: string;
    phase: number;
    emotionPrimary: string;
    emotionSecondary?: string;
    emotionIntensity?: number;
    perceptionText: string;
  }) => {
    return fetchWithAuth('/api/perception-exchange/create', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  list: async (artworkId: string, params?: {
    phase?: number;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    
    return fetchWithAuth(`/api/perception-exchange/${artworkId}?${queryParams}`);
  },

  // Direct Supabase calls
  addReaction: async (exchangeId: string, reactionType: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();
    
    if (!profile) throw new Error('Profile not found');
    
    return supabaseAPI.perceptionExchange.addReaction(exchangeId, profile.id, reactionType);
  }
};

// Social API
export const socialAPI = {
  follow: async (userId: string) => {
    return fetchWithAuth('/api/social/follow', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  unfollow: async (userId: string) => {
    return fetchWithAuth('/api/social/follow', {
      method: 'DELETE',
      body: JSON.stringify({ userId })
    });
  },

  getFollowData: async (targetUserId?: string) => {
    const params = targetUserId ? `?targetUserId=${targetUserId}` : '';
    return fetchWithAuth(`/api/social/follow${params}`);
  },

  // Direct Supabase calls
  searchUsers: async (query: string) => {
    return supabaseAPI.users.searchUsers(query);
  }
};

// Auth API (direct Supabase)
export const authAPI = {
  signIn: supabaseAPI.auth.signIn,
  signUp: supabaseAPI.auth.signUp,
  signOut: supabaseAPI.auth.signOut,
  getSession: supabaseAPI.auth.getSession,
  
  updateProfile: async (updates: any) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();
    
    if (!profile) throw new Error('Profile not found');
    
    return supabaseAPI.users.updateProfile(profile.id, updates);
  }
};

// Realtime subscriptions
export const realtimeAPI = {
  subscribeToExhibition: supabaseAPI.realtime.subscribeToExhibition,
  subscribeToPerceptionExchange: supabaseAPI.realtime.subscribeToPerceptionExchange,
  unsubscribe: supabaseAPI.realtime.unsubscribe
};

// Export all APIs
const api = {
  quiz: quizAPI,
  exhibitions: exhibitionAPI,
  artProfile: artProfileAPI,
  perception: perceptionAPI,
  social: socialAPI,
  auth: authAPI,
  realtime: realtimeAPI
};

export { api };
export default api;