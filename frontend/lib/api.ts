/**
 * Legacy API wrapper - redirects to new Supabase-based API
 * This file maintains backward compatibility during migration
 * @deprecated Use lib/api/client.ts for new code
 */

import apiClient from './api/client';

// Re-export the new API client with legacy interface
export const api = {
  // Quiz endpoints
  quiz: {
    start: async (data: { userPreferences?: any; language?: string; sessionType?: string }) => {
      // Map legacy format to new format
      const sessionType = data.sessionType || 'exhibition';
      const language = data.language || 'ko';
      
      const response = await apiClient.quiz.start(sessionType as 'exhibition' | 'artwork', language);
      return response.data || response;
    },
    
    answer: async (data: {
      sessionId: string;
      questionId: string;
      choiceId: string;
    }) => {
      const response = await apiClient.quiz.submitAnswer(
        data.sessionId,
        data.questionId,
        data.choiceId
      );
      return response.data || response;
    },
    
    getResults: apiClient.quiz.getResults,
  },
  
  // Exhibitions
  exhibitions: apiClient.exhibitions,
  
  // Art Profile
  artProfile: apiClient.artProfile,
  
  // Perception Exchange
  perception: apiClient.perception,
  
  // Social
  social: apiClient.social,
  
  // Auth
  auth: apiClient.auth,
  
  // Recommendations (legacy compatibility)
  recommendations: {
    get: async (personalityType: string, language: string = 'en') => {
      // This would need to be implemented based on your recommendation logic
      const exhibitions = await apiClient.exhibitions.list({
        status: 'ongoing',
        limit: 10
      });
      
      // Simple filter based on personality type
      return {
        exhibitions: exhibitions.data?.exhibitions || [],
        personalityType,
        language
      };
    },
  },
  
  // Personality types (legacy compatibility)
  personalityTypes: {
    getAll: async (language: string = 'en') => {
      // Return static personality types data
      return {
        types: [
          { code: 'GAMF', name: '호랑이', nameEn: 'Tiger' },
          { code: 'GAMC', name: '사자', nameEn: 'Lion' },
          { code: 'GRMF', name: '늑대', nameEn: 'Wolf' },
          { code: 'GRMC', name: '표범', nameEn: 'Leopard' },
          { code: 'GAEF', name: '독수리', nameEn: 'Eagle' },
          { code: 'GAEC', name: '매', nameEn: 'Hawk' },
          { code: 'GREF', name: '올빼미', nameEn: 'Owl' },
          { code: 'GREC', name: '까마귀', nameEn: 'Raven' },
          { code: 'SAMF', name: '돌고래', nameEn: 'Dolphin' },
          { code: 'SAMC', name: '코끼리', nameEn: 'Elephant' },
          { code: 'SRMF', name: '여우', nameEn: 'Fox' },
          { code: 'SRMC', name: '고양이', nameEn: 'Cat' },
          { code: 'SAEF', name: '나비', nameEn: 'Butterfly' },
          { code: 'SAEC', name: '벌새', nameEn: 'Hummingbird' },
          { code: 'SREF', name: '사슴', nameEn: 'Deer' },
          { code: 'SREC', name: '토끼', nameEn: 'Rabbit' }
        ],
        language
      };
    },
  },
  
  // Health check
  health: async () => {
    // Simple health check
    try {
      await apiClient.auth.getSession();
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'error', timestamp: new Date().toISOString() };
    }
  },
};

export default api;