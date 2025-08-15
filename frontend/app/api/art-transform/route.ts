import { NextRequest, NextResponse } from 'next/server';

// 무료로 사용 가능한 Image-to-Image 모델들
const FREE_MODELS = {
  'style-transfer': 'ghoskno/Comics-Lora-image-to-image',
  'cartoon': 'nitrosocke/Ghibli-Diffusion',
  'anime': 'hakurei/waifu-diffusion',
  'artistic': 'CompVis/stable-diffusion-v1-4',
  'painting': 'runwayml/stable-diffusion-v1-5'
};

// 스타일별 프롬프트
const STYLE_PROMPTS = {
  'monet-impressionism': 'impressionist painting, claude monet style, soft brushstrokes, pastel colors, water lilies',
  'vangogh-postimpressionism': 'van gogh style painting, bold brushstrokes, vibrant colors, swirling patterns, starry night',
  'picasso-cubism': 'cubist art, pablo picasso style, geometric shapes, fragmented forms, abstract',
  'warhol-popart': 'pop art, andy warhol style, bright colors, high contrast, screen print',
  'klimt-artnouveau': 'art nouveau, gustav klimt style, gold patterns, decorative, ornamental',
  'pixelart-digital': '8-bit pixel art, retro gaming, pixelated, low resolution, digital art',
  'anime-manga': 'anime style, manga art, japanese animation, cel shading, colorful',
  'cyberpunk-future': 'cyberpunk style, neon lights, futuristic, tech noir, blade runner',
  'watercolor-soft': 'watercolor painting, soft edges, flowing colors, transparent, artistic',
  'oilpainting-classic': 'oil painting, classical art, renaissance, detailed brushwork, realistic'
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const styleId = formData.get('styleId') as string;

    if (!image || !styleId) {
      return NextResponse.json(
        { error: 'Image and style are required' },
        { status: 400 }
      );
    }

    // 이미지를 base64로 변환
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // 스타일 프롬프트 선택
    const stylePrompt = STYLE_PROMPTS[styleId] || STYLE_PROMPTS['watercolor-soft'];
    
    console.log('🎨 Transforming image with style:', styleId);
    console.log('📝 Using prompt:', stylePrompt);

    // 무료 Text-to-Image 모델 사용 (스타일 프롬프트와 함께)
    const model = 'runwayml/stable-diffusion-v1-5';
    
    try {
      // Hugging Face API 호출 with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: `${stylePrompt}, masterpiece, high quality, detailed`,
            parameters: {
              negative_prompt: 'blurry, bad quality, distorted, ugly, low resolution',
              num_inference_steps: 20,
              guidance_scale: 7.5,
              width: 512,
              height: 512,
              seed: Math.floor(Math.random() * 1000000)
            },
            options: {
              wait_for_model: true
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Hugging Face API error:', errorText);
        
        // 모델이 로딩 중인 경우
        if (response.status === 503) {
          return NextResponse.json(
            { 
              error: 'Model is loading, please try again in 20 seconds',
              retryAfter: 20 
            },
            { status: 503 }
          );
        }

        // 권한 문제인 경우 Canvas 기반 변환 사용
        if (response.status === 403 || errorText.includes('permissions')) {
          console.log('🔄 Using client-side transformation due to API limitations');
          return NextResponse.json({
            success: true,
            transformedImage: `data:${image.type};base64,${base64Image}`,
            styleUsed: styleId,
            modelUsed: 'client-canvas',
            useClientTransform: true,
            message: 'API 제한으로 인해 클라이언트 변환을 사용합니다'
          });
        }

        return NextResponse.json(
          { error: `Failed to transform image: ${errorText}` },
          { status: response.status }
        );
      }

      // 변환된 이미지 받기
      const imageBlob = await response.blob();
      const transformedBase64 = await blobToBase64(imageBlob);

      return NextResponse.json({
        success: true,
        transformedImage: transformedBase64,
        styleUsed: styleId,
        modelUsed: model
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('⏱️ Request timeout, using client transformation...');
        return NextResponse.json({
          success: true,
          transformedImage: `data:${image.type};base64,${base64Image}`,
          styleUsed: styleId,
          modelUsed: 'client-canvas',
          useClientTransform: true,
          message: '서버 타임아웃으로 클라이언트 변환을 사용합니다'
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Art transformation error:', error);
    return NextResponse.json(
      { error: 'Failed to transform image' },
      { status: 500 }
    );
  }
}

// Blob을 base64로 변환
async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${blob.type};base64,${base64}`;
}