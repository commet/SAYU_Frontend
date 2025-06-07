export interface User {
  id: string;
  email: string;
  nickname: string;
  agencyLevel: string;
  journeyStage: string;
  hasProfile: boolean;
  typeCode?: string;
  archetypeName?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface Profile {
  id: string;
  typeCode: string;
  archetypeName: string;
  archetypeDescription: string;
  emotionalTags: string[];
  exhibitionScores: Record<string, number>;
  artworkScores: Record<string, number>;
  uiCustomization: {
    mode: string;
    pace: string;
    depth: string;
  };
  generatedImageUrl?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'text' | 'visual';
  question: string;
  options: {
    id: string;
    text?: string;
    image?: string;
    tags?: string[];
  }[];
}

export interface QuizSession {
  sessionId: string;
  sessionType: 'exhibition' | 'artwork';
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
}
