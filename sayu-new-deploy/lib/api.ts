const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sayubackend-production.up.railway.app';

export const api = {
  quiz: {
    start: async (data: { userPreferences?: any; language?: string }) => {
      const response = await fetch(`${API_URL}/api/quiz/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start quiz');
      }
      
      return response.json();
    },
    
    answer: async (data: {
      sessionId: string;
      questionId: string;
      choiceId: string;
    }) => {
      const response = await fetch(`${API_URL}/api/quiz/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      return response.json();
    },
  },
  
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
  
  health: async () => {
    const response = await fetch(`${API_URL}/api/health`);
    return response.json();
  },
};

export default api;