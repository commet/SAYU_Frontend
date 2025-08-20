import { NextRequest, NextResponse } from 'next/server';
import { replicateArtService } from '@/lib/replicate-art-service';

// Vercel timeout 설정
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const styleId = formData.get('styleId') as string;

    if (!imageFile || !styleId) {
      return NextResponse.json(
        { error: 'Image and style ID are required' },
        { status: 400 }
      );
    }

    // 파일 크기 체크 (10MB 제한)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 10MB' },
        { status: 400 }
      );
    }

    console.log(`Processing art generation: style=${styleId}, size=${imageFile.size}`);

    // Replicate로 스타일 변환
    const artworkUrl = await replicateArtService.generateArt(
      imageFile,
      styleId,
      (progress) => {
        console.log(`Progress: ${progress}%`);
      }
    );

    // 예상 비용 계산
    const estimatedCost = replicateArtService.getEstimatedCost(styleId);

    return NextResponse.json({
      success: true,
      artworkUrl,
      styleId,
      estimatedCost,
      service: 'replicate',
      message: 'Art profile generated successfully'
    });

  } catch (error: any) {
    console.error('Art generation error:', error);
    
    // Replicate API 토큰 미설정 에러
    if (error.message?.includes('API token not configured')) {
      return NextResponse.json(
        { 
          error: 'Replicate API not configured',
          message: 'Please add REPLICATE_API_TOKEN to your environment variables',
          instructions: 'Get your token from https://replicate.com/account/api-tokens'
        },
        { status: 503 }
      );
    }

    // Rate limit 에러
    if (error.response?.status === 429) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.'
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate art profile',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

// GET 요청으로 사용 가능한 스타일 목록 조회
export async function GET() {
  try {
    const styles = replicateArtService.getAvailableStyles();
    
    return NextResponse.json({
      success: true,
      styles,
      service: 'replicate',
      costInfo: {
        average: '$0.002 per image',
        currency: 'USD',
        note: 'Actual cost depends on processing time (2-5 seconds)'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get styles' },
      { status: 500 }
    );
  }
}