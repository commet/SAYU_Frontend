import { NextRequest, NextResponse } from 'next/server';

const AI_ART_STYLES: Record<string, any> = {
  'vangogh-postimpressionism': {
    id: 'vangogh-postimpressionism',
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    prompt: 'in the style of Vincent van Gogh, swirling brushstrokes, vibrant colors, post-impressionist masterpiece, thick impasto technique',
    negativePrompt: 'blurry, low quality, distorted, amateur',
    params: {
      guidance_scale: 7.5,
      num_inference_steps: 50,
      strength: 0.8
    }
  },
  'monet-impressionism': {
    id: 'monet-impressionism',
    model: 'runwayml/stable-diffusion-v1-5',
    prompt: 'Claude Monet impressionist painting, soft brushstrokes, natural lighting, plein air style, beautiful color harmony',
    negativePrompt: 'sharp edges, digital art, photography',
    params: {
      guidance_scale: 8.0,
      num_inference_steps: 40,
      strength: 0.75
    }
  },
  'anime-style': {
    id: 'anime-style',
    model: 'prompthero/openjourney-v4',
    prompt: 'beautiful anime art style, detailed character design, vibrant colors, studio ghibli inspired, high quality anime illustration',
    negativePrompt: 'realistic, photographic, western cartoon',
    params: {
      guidance_scale: 7.5,
      num_inference_steps: 40,
      strength: 0.75
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const { base64Image, styleId, model, prompt, negativePrompt, params } = await request.json();

    if (!base64Image || !styleId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 서버사이드에서 API 키 사용 (환경변수에서)
    const apiKey = process.env.HUGGINGFACE_API_KEY; // NEXT_PUBLIC_ 없음!
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'HuggingFace API key not configured' },
        { status: 500 }
      );
    }

    const style = AI_ART_STYLES[styleId] || AI_ART_STYLES['anime-style'];
    
    // Hugging Face API 호출
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${style.model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            prompt: style.prompt,
            negative_prompt: style.negativePrompt || '',
            image: base64Image.replace(/^data:image\/[a-z]+;base64,/, ''),
            ...style.params
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        })
      }
    );

    if (!response.ok) {
      console.error('HuggingFace API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `HuggingFace API error: ${response.status}` },
        { status: response.status }
      );
    }

    // 결과를 Blob으로 받고 Base64로 변환
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64Result = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${blob.type};base64,${base64Result}`;

    return NextResponse.json({
      success: true,
      dataUrl
    });

  } catch (error) {
    console.error('API Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Rate limiting을 위한 간단한 구현 (선택사항)
const rateLimit = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1분
  const maxRequests = 10; // 분당 10회

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