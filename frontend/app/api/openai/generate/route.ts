import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 서버 사이드에서만 실행 - API 키가 브라우저에 노출되지 않음!
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // NEXT_PUBLIC_ 없음!
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, size = "1024x1024" } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // OpenAI DALL-E API 호출
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size as "1024x1024" | "1792x1024" | "1024x1792",
      quality: "hd",
      style: style || "vivid",
    });

    return NextResponse.json({ 
      imageUrl: response.data[0].url 
    });
    
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}