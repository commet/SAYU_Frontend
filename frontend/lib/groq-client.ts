// Groq API Client - 무료 고속 LLM
import Groq from 'groq-sdk';

// Groq 클라이언트 초기화
export function createGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.warn('GROQ_API_KEY not configured');
    return null;
  }
  
  return new Groq({
    apiKey: apiKey
  });
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

// Groq로 응답 생성
export async function generateGroqResponse(
  message: string,
  userType: string,
  context: any,
  conversationHistory: any[] = []
): Promise<string> {
  const groq = createGroqClient();
  
  if (!groq) {
    // Fallback 응답
    return getFallbackResponse(userType);
  }
  
  try {
    const messages = [
      {
        role: 'system',
        content: createSystemPrompt(userType, context)
      },
      // 최근 대화 히스토리 (최대 5개)
      ...conversationHistory.slice(-5).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];
    
    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: 'llama3-8b-8192', // 빠르고 무료인 Llama 3 8B 모델
      temperature: 0.7,
      max_tokens: 500, // 토큰 제한
      top_p: 1,
      stream: false
    });
    
    return completion.choices[0]?.message?.content || getFallbackResponse(userType);
    
  } catch (error) {
    console.error('Groq API error:', error);
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

// 전시 추천용 특화 프롬프트
export async function generateExhibitionRecommendation(
  userType: string,
  exhibitions: any[],
  preferences: string
): Promise<string> {
  const groq = createGroqClient();
  
  if (!groq || exhibitions.length === 0) {
    return "현재 추천할 전시가 없습니다.";
  }
  
  const prompt = `다음 전시 목록에서 ${userType} 성격 유형과 "${preferences}" 선호도에 맞는 전시 3개를 추천해주세요:

전시 목록:
${exhibitions.slice(0, 10).map(ex => 
  `- ${ex.title_local} (${ex.venue_name}, ${ex.tags || ''})`
).join('\n')}

간단한 추천 이유와 함께 3개만 선택해서 알려주세요.`;
  
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: '당신은 예술 전시 큐레이터입니다.' },
        { role: 'user', content: prompt }
      ],
      model: 'mixtral-8x7b-32768', // 더 큰 컨텍스트가 필요한 경우
      temperature: 0.6,
      max_tokens: 300
    });
    
    return completion.choices[0]?.message?.content || "추천을 생성할 수 없습니다.";
  } catch (error) {
    console.error('Exhibition recommendation error:', error);
    return "전시 추천을 생성하는 중 문제가 발생했습니다.";
  }
}