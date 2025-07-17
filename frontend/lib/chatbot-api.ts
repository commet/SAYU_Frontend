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

class ChatbotAPI {
  // Send a message to the chatbot
  async sendMessage(
    message: string, 
    artworkId: string,
    artwork?: Artwork
  ): Promise<ChatbotResponse> {
    return apiClient.post<ChatbotResponse>('/api/chatbot/message', {
      message,
      artworkId,
      artwork
    });
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