import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// APT 유형별 시스템 프롬프트 생성
function createSystemPrompt(userType: string, context: any): string {
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

export async function POST(request: NextRequest) {
  try {
    const { message, userType, context, conversationHistory } = await request.json();

    if (!message || !userType) {
      return NextResponse.json(
        { error: 'Message and userType are required' },
        { status: 400 }
      );
    }

    // 서버사이드에서만 API 키 사용
    const apiKey = process.env.GROQ_API_KEY; // NEXT_PUBLIC_ 없음!
    
    if (!apiKey) {
      console.warn('GROQ_API_KEY not configured, using fallback');
      return NextResponse.json({
        success: true,
        response: getFallbackResponse(userType)
      });
    }

    const groq = new Groq({
      apiKey: apiKey
    });

    const messages = [
      {
        role: 'system',
        content: createSystemPrompt(userType, context || {})
      },
      // 최근 대화 히스토리 (최대 5개)
      ...(conversationHistory || []).map((msg: any) => ({
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
    
    const response = completion.choices[0]?.message?.content || getFallbackResponse(userType);

    return NextResponse.json({
      success: true,
      response
    });

  } catch (error) {
    console.error('Groq API Route error:', error);
    
    // 에러 발생시 사용자 유형별 폴백 응답
    const { userType } = await request.json().catch(() => ({ userType: 'default' }));
    
    return NextResponse.json({
      success: true,
      response: getFallbackResponse(userType)
    });
  }
}

// Rate limiting
const rateLimit = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1분
  const maxRequests = 20; // 분당 20회 (Groq는 무료지만 제한 필요)

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const record = rateLimit.get(ip);
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}