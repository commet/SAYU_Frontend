import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 서버 사이드에서만 API 키 사용
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // NEXT_PUBLIC_ 없음!
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting 체크 (간단한 예시)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    const { prompt, size = '1024x1024' } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // OpenAI API 호출
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: size as '1024x1024' | '1792x1024' | '1024x1792',
    });

    return NextResponse.json({ 
      imageUrl: response.data[0].url 
    });
    
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}