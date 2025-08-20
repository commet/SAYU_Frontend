import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // 간단한 테스트 프롬프트 - 최소한의 토큰 사용
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: "A simple red circle on white background, minimalist design",
      n: 1,
      size: "1024x1024",
      quality: "standard", // HD 대신 standard로 비용 절감
      response_format: "url"
    });

    // DALL-E 3 가격 정보 (2024년 기준)
    // Standard quality:
    // - 1024x1024: $0.040 per image
    // HD quality:
    // - 1024x1024: $0.080 per image
    // - 1024x1792 or 1792x1024: $0.120 per image

    return NextResponse.json({
      success: true,
      imageUrl: response.data[0].url,
      cost: {
        model: "DALL-E 3",
        quality: "standard",
        size: "1024x1024",
        estimatedCost: "$0.04",
        note: "HD quality would cost $0.08 per image"
      }
    });

  } catch (error: any) {
    console.error('DALL-E test error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        details: error.response?.data || 'No additional details'
      },
      { status: 500 }
    );
  }
}