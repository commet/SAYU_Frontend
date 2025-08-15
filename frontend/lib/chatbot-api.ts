import { apiClient } from './api-client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatbotResponse {
  success: boolean;
  message: string;
  suggestions?: string[];
  sessionId?: string;
  action?: string;
  error?: boolean;
}

export interface ConversationHistory {
  success: boolean;
  history: Array<{
    role: string;
    message: string;
  }>;
  startTime: number;
  interactions: number;
}

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl?: string;
  medium?: string;
  description?: string;
}

export interface ChatContext {
  pageContext?: {
    type: string;
    metadata?: any;
  };
  personalityType?: string;
  userId?: string;
}

class ChatbotAPI {
  // Send a message to the chatbot
  async sendMessage(
    message: string, 
    artworkId: string,
    artwork?: Artwork,
    context?: ChatContext
  ): Promise<ChatbotResponse> {
    // Next.js API Route 직접 호출 (배포 환경에서도 작동)
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId: context?.userId || 'guest',
        artwork,
        userType: context?.personalityType || 'LAEF',
        page: context?.pageContext?.type || 'default',
        context: context?.pageContext?.metadata || {}
      })
    });

    const data = await response.json();
    
    // 응답 형식 맞추기
    return {
      success: data.success,
      message: data.data?.response || data.message || '',
      suggestions: data.data?.suggestions,
      sessionId: data.data?.sessionId,
      action: data.action,
      error: data.error
    };
  }

  // Get conversation history for a specific artwork
  async getHistory(artworkId: string): Promise<ConversationHistory> {
    return apiClient.get<ConversationHistory>(`/api/chatbot/history/${artworkId}`);
  }

  // Clear all chat sessions
  async clearSessions(): Promise<{ success: boolean; message: string; cleared: number }> {
    return apiClient.post('/api/chatbot/clear-sessions', {});
  }

  // Submit feedback on a chatbot response
  async submitFeedback(
    sessionId: string,
    rating: number,
    feedback?: string,
    messageId?: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/api/chatbot/feedback', {
      sessionId,
      messageId,
      rating,
      feedback
    });
  }

  // Get suggested questions for an artwork
  async getSuggestions(
    artworkId: string,
    artworkDetails?: { title?: string; artist?: string; year?: number }
  ): Promise<{
    success: boolean;
    suggestions: string[];
    personality: string;
  }> {
    const params = new URLSearchParams();
    if (artworkDetails?.title) params.append('title', artworkDetails.title);
    if (artworkDetails?.artist) params.append('artist', artworkDetails.artist);
    if (artworkDetails?.year) params.append('year', artworkDetails.year.toString());

    const queryString = params.toString();
    const url = `/api/chatbot/suggestions/${artworkId}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  }

  // Check chatbot health status
  async checkHealth(): Promise<{
    success: boolean;
    status: 'operational' | 'unavailable' | 'error';
    message: string;
  }> {
    return apiClient.get('/api/chatbot/health');
  }
}

export const chatbotAPI = new ChatbotAPI();