import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
  try {
    const { userType, exhibitions, preferences } = await request.json();

    if (!userType || !exhibitions || !Array.isArray(exhibitions)) {
      return NextResponse.json(
        { error: 'UserType and exhibitions array are required' },
        { status: 400 }
      );
    }

    if (exhibitions.length === 0) {
      return NextResponse.json({
        success: true,
        recommendation: "현재 추천할 전시가 없습니다."
      });
    }

    // 서버사이드에서만 API 키 사용
    const apiKey = process.env.GROQ_API_KEY; // NEXT_PUBLIC_ 없음!
    
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        recommendation: "전시 추천 서비스가 일시적으로 이용할 수 없습니다."
      });
    }

    const groq = new Groq({
      apiKey: apiKey
    });

    const prompt = `다음 전시 목록에서 ${userType} 성격 유형과 "${preferences}" 선호도에 맞는 전시 3개를 추천해주세요:

전시 목록:
${exhibitions.map(ex => 
  `- ${ex.title_local || ex.title} (${ex.venue_name}, ${ex.tags || ''})`
).join('\n')}

간단한 추천 이유와 함께 3개만 선택해서 알려주세요.`;
    
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: '당신은 예술 전시 큐레이터입니다.' },
        { role: 'user', content: prompt }
      ],
      model: 'mixtral-8x7b-32768', // 더 큰 컨텍스트가 필요한 경우
      temperature: 0.6,
      max_tokens: 300
    });
    
    const recommendation = completion.choices[0]?.message?.content || "추천을 생성할 수 없습니다.";

    return NextResponse.json({
      success: true,
      recommendation
    });

  } catch (error) {
    console.error('Exhibition recommendation API Route error:', error);
    return NextResponse.json({
      success: true,
      recommendation: "전시 추천을 생성하는 중 문제가 발생했습니다."
    });
  }
}