// API configuration for SAYU backend (using Next.js API proxy to avoid CORS)

// API helper functions
export const api = {
  // Quiz endpoints (using proxy APIs)
  quiz: {
    start: async (data: { userPreferences?: any; language?: string }) => {
      const response = await fetch('/api/test-backend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start quiz');
      }
      
      const result = await response.json();
      // Extract data from proxy response
      return result.data || result;
    },
    
    answer: async (data: {
      sessionId: string;
      questionId: string;
      choiceId: string;
    }) => {
      const response = await fetch('/api/quiz-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      const result = await response.json();
      // Extract data from proxy response
      return result.data || result;
    },
  },
  
  // Recommendations
  recommendations: {
    get: async (personalityType: string, language: string = 'en') => {
      const response = await fetch(
        `${API_URL}/api/recommendations/${personalityType}?language=${language}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }
      
      return response.json();
    },
  },
  
  // Personality types
  personalityTypes: {
    getAll: async (language: string = 'en') => {
      const response = await fetch(
        `${API_URL}/api/personality-types?language=${language}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get personality types');
      }
      
      return response.json();
    },
  },
  
  // Health check
  health: async () => {
    const response = await fetch(`${API_URL}/api/health`);
    return response.json();
  },
};

export default api;