import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const STYLE_CONFIGS = {
  'vangogh-postimpressionism': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'in the style of van gogh, post-impressionist painting, bold swirling brushstrokes, vibrant yellows and blues, thick impasto texture, emotional intensity, starry night aesthetic',
    strength: 0.65,
    guidance_scale: 7.5,
  },
  'monet-impressionism': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'in the style of claude monet, impressionist painting, soft brushstrokes, delicate light effects, water lily aesthetic, pastel colors, atmospheric perspective',
    strength: 0.6,
    guidance_scale: 7,
  },
  'picasso-cubism': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'in the style of pablo picasso, cubist art, geometric fragmentation, multiple perspectives, angular forms, bold colors, abstract deconstruction',
    strength: 0.7,
    guidance_scale: 8,
  },
  'anime-style': {
    model: 'cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65',
    prompt: 'anime style, high quality anime art, cel-shading, detailed character design, vibrant colors, beautiful backgrounds',
    strength: 0.55,
    guidance_scale: 7,
  },
  'cyberpunk-digital': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'cyberpunk style, neon colors, futuristic, holographic effects, dystopian atmosphere, blade runner aesthetic, high-tech',
    strength: 0.7,
    guidance_scale: 8,
  }
};

export async function POST(request: NextRequest) {
  try {
    const { base64Image, styleId } = await request.json();

    if (!base64Image || !styleId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 서버사이드에서만 API 키 사용
    const apiToken = process.env.REPLICATE_API_TOKEN; // NEXT_PUBLIC_ 없음!
    
    if (!apiToken) {
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      );
    }

    const replicate = new Replicate({
      auth: apiToken,
    });

    const styleConfig = STYLE_CONFIGS[styleId as keyof typeof STYLE_CONFIGS] || STYLE_CONFIGS['anime-style'];

    // Prepare input for Replicate
    const input: any = {
      image: base64Image,
      prompt: `${styleConfig.prompt}, masterpiece, best quality, highly detailed`,
      negative_prompt: 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality',
      num_inference_steps: 30,
      guidance_scale: styleConfig.guidance_scale,
      prompt_strength: styleConfig.strength,
      num_outputs: 1,
    };

    // Special handling for SDXL model
    if (styleConfig.model.includes('sdxl')) {
      input.refine = 'expert_ensemble_refiner';
      input.scheduler = 'K_EULER';
      input.refine_steps = 10;
    }

    console.log('Starting Replicate prediction with model:', styleConfig.model);
    
    // Run the model
    const output = await replicate.run(styleConfig.model, { input });

    // Handle output - it can be a string URL or array of URLs
    let resultUrl: string;
    if (Array.isArray(output)) {
      resultUrl = output[0] as string;
    } else {
      resultUrl = output as string;
    }

    // If it's a URL, fetch and convert to data URL
    let dataUrl = resultUrl;
    if (resultUrl.startsWith('http')) {
      try {
        const response = await fetch(resultUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64Result = Buffer.from(arrayBuffer).toString('base64');
        dataUrl = `data:${blob.type};base64,${base64Result}`;
      } catch (fetchError) {
        console.error('Error converting result to data URL:', fetchError);
        // Return the URL as-is if conversion fails
      }
    }

    return NextResponse.json({
      success: true,
      dataUrl
    });

  } catch (error) {
    console.error('Replicate API Route error:', error);
    return NextResponse.json(
      { error: `Replicate API error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Rate limiting
const rateLimit = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5분
  const maxRequests = 5; // 5분당 5회 (Replicate는 비싼 API)

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