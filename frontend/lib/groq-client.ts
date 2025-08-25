// Groq API Client - 무료 고속 LLM
import Groq from 'groq-sdk';

// Groq는 이제 API Route를 통해서만 사용 (보안상)
export function createGroqClient() {
  // 클라이언트에서는 직접 생성하지 않음
  console.warn('Groq client should be used via API Routes only');
  return null;
}

// APT 유형별 시스템 프롬프트 생성
export function createSystemPrompt(userType: string, context: any): string {
  return `당신은 SAYU 플랫폼의 ${userType} 유형 AI 큐레이터입니다.
사용자의 예술적 취향과 성격을 이해하고 맞춤형 예술 경험을 제공합니다.

현재 컨텍스트:
- 페이지: ${context.page}
- 사용자 상태: ${context.userBehavior?.currentMood || 'exploring'}
- 참여도: ${context.userBehavior?.engagementLevel || 'new'}

응답 지침:
1. 간결하고 친근하게 대답하세요
2. ${userType} 유형의 특성에 맞는 톤으로 대화하세요
3. 예술 작품과 전시에 대한 구체적인 정보를 제공하세요
4. 사용자의 감정과 선호도를 고려하세요`;
}

// API Route를 통한 안전한 Groq 응답 생성
export async function generateGroqResponse(
  message: string,
  userType: string,
  context: any,
  conversationHistory: any[] = []
): Promise<string> {
  try {
    const response = await fetch('/api/groq/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userType,
        context,
        conversationHistory: conversationHistory.slice(-5) // 최근 5개만
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API Route error:', errorData);
      return getFallbackResponse(userType);
    }
    
    const data = await response.json();
    return data.success ? data.response : getFallbackResponse(userType);
    
  } catch (error) {
    console.error('Groq API Route request error:', error);
    return getFallbackResponse(userType);
  }
}

// APT 유형별 폴백 응답
function getFallbackResponse(userType: string): string {
  const fallbacks: Record<string, string> = {
    'LAEF': "색채와 감정의 흐름 속에서 답을 찾고 있어요... 잠시만 기다려주세요.",
    'SAEF': "흥미로운 질문이네요! 다시 한 번 말씀해주시겠어요?",
    'LAMC': "체계적으로 정리 중입니다. 조금만 기다려주세요.",
    'TAMF': "새로운 관점에서 접근해보고 있어요!",
    'default': "잠시 생각을 정리하고 있어요. 다시 한 번 말씀해주세요."
  };
  
  return fallbacks[userType] || fallbacks.default;
}

// API Route를 통한 전시 추천
export async function generateExhibitionRecommendation(
  userType: string,
  exhibitions: any[],
  preferences: string
): Promise<string> {
  if (exhibitions.length === 0) {
    return "현재 추천할 전시가 없습니다.";
  }
  
  try {
    const response = await fetch('/api/groq/exhibition-recommendation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userType,
        exhibitions: exhibitions.slice(0, 10), // 처리 가능한 범위로 제한
        preferences
      })
    });
    
    if (!response.ok) {
      console.error('Exhibition recommendation API error:', response.status);
      return "전시 추천을 생성하는 중 문제가 발생했습니다.";
    }
    
    const data = await response.json();
    return data.success ? data.recommendation : "추천을 생성할 수 없습니다.";
    
  } catch (error) {
    console.error('Exhibition recommendation request error:', error);
    return "전시 추천을 생성하는 중 문제가 발생했습니다.";
  }
}