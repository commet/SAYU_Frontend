import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== API Route Debug Start ===');
  try {
    const { base64Image, styleId } = await request.json();
    console.log('✅ Request parsed successfully');
    console.log('Style ID:', styleId);
    console.log('Base64 image length:', base64Image?.length || 'undefined');
    
    // Replicate API 키 확인
    const apiKey = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
    console.log('API Key available:', !!apiKey);
    console.log('API Key starts with:', apiKey ? apiKey.substring(0, 8) + '...' : 'none');
    
    if (!apiKey) {
      console.error('❌ Replicate API key not found');
      return NextResponse.json({ 
        success: false, 
        error: 'Replicate API key not configured' 
      }, { status: 500 });
    }

    console.log('🎨 Art generation started with style:', styleId);
    
    // 스타일별 모델 설정
    const modelConfig = getReplicateModelForStyle(styleId);
    console.log('✅ Using model:', modelConfig.name);
    console.log('Model config:', JSON.stringify(modelConfig, null, 2));
    
    // Replicate API 호출 준비
    const prompt = getPromptForStyle(styleId);
    const negativePrompt = getNegativePromptForStyle(styleId);
    console.log('✅ Prompt:', prompt);
    console.log('✅ Negative prompt:', negativePrompt);
    
    const requestBody = {
      version: modelConfig.version,
      input: {
        ...modelConfig.baseInput,
        image: base64Image,
        prompt: prompt,
        ...(modelConfig.supportNegativePrompt && {
          negative_prompt: negativePrompt
        })
      }
    };
    console.log('✅ Request body prepared:', JSON.stringify(requestBody, null, 2));
    
    // Replicate API 호출
    console.log('🚀 Calling Replicate API...');
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 Replicate API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Replicate API error:', response.status, errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Replicate API error: ${response.status} - ${errorText}` 
      }, { status: response.status });
    }

    const prediction = await response.json();
    console.log('✅ Prediction started:', prediction.id);
    console.log('Initial prediction status:', prediction.status);
    
    // 결과 폴링
    let result = prediction;
    const maxAttempts = 60; // 최대 60회 시도 (60초)
    let attempts = 0;
    
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${apiKey}`
          }
        }
      );
      
      if (pollResponse.ok) {
        result = await pollResponse.json();
        console.log(`Polling attempt ${attempts}:`, result.status);
      } else {
        console.error('Polling failed:', pollResponse.status);
        break;
      }
    }

    if (result.status === 'succeeded' && result.output && result.output.length > 0) {
      console.log('✅ Art generation successful!');
      return NextResponse.json({
        success: true,
        data: {
          transformedImage: result.output[0]
        }
      });
    } else {
      console.error('Art generation failed:', result.status, result.error);
      return NextResponse.json({ 
        success: false, 
        error: `Generation failed: ${result.status}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ API Route error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// 스타일별 프롬프트 - 원본 보존에 중점
function getPromptForStyle(styleId: string): string {
  const prompts: Record<string, string> = {
    'vangogh-postimpressionism': 'Van Gogh painting style, swirling brushstrokes, thick paint texture, keep original composition and pose',
    'monet-impressionism': 'Monet impressionist style, soft brushwork, light and shadow, maintain original subject and layout',
    'picasso-cubism': 'Picasso cubist style, geometric shapes, angular forms, preserve original figure and pose',
    'warhol-popart': 'Andy Warhol pop art style, bright colors, high contrast, keep original portrait composition',
    'klimt-artnouveau': 'Gustav Klimt art nouveau style, golden patterns, decorative elements, maintain original pose and figure',
    'anime-style': 'Anime art style, cel shading, clean lines, preserve original facial features and pose',
    'cyberpunk-digital': 'Cyberpunk style, neon lighting effects, futuristic colors, keep original composition',
    'pixelart-digital': 'Pixel art style, 16-bit aesthetic, pixelated effect, maintain original figure'
  };
  
  return prompts[styleId] || 'Apply artistic style while keeping original composition and pose';
}

// 스타일별 부정 프롬프트 - 원본 형태 보존 강화
function getNegativePromptForStyle(styleId: string): string {
  const negativePrompts: Record<string, string> = {
    'vangogh-postimpressionism': 'different person, different pose, different composition, new scene, different background, extra people',
    'monet-impressionism': 'different person, different pose, different composition, new scene, different background, extra people',
    'picasso-cubism': 'different person, different pose, different composition, new scene, different background, extra people', 
    'warhol-popart': 'different person, different pose, different composition, new scene, different background, extra people',
    'klimt-artnouveau': 'different person, different pose, different composition, new scene, different background, extra people',
    'anime-style': 'different person, different pose, different composition, new scene, different background, extra people',
    'cyberpunk-digital': 'different person, different pose, different composition, new scene, different background, extra people',
    'pixelart-digital': 'different person, different pose, different composition, new scene, different background, extra people'
  };
  
  return negativePrompts[styleId] || 'different person, different pose, different composition, new scene, low quality';
}

// 스타일별 모델 설정
function getReplicateModelForStyle(styleId: string): any {
  const models = {
    'default': {
      name: 'SDXL-Lightning Image-to-Image',
      version: '527d2a6296facb8e47ba1eaf17f142c240c19a30894f437feee9b91cc29d8e4f',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 6,
        guidance_scale: 3,
        strength: 0.15,
        scheduler: 'K_EULER'
      }
    },
    
    'vangogh-postimpressionism': {
      name: 'Stable Diffusion Img2Img',
      version: '15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 30,
        guidance_scale: 3.5,
        prompt_strength: 0.2,
        scheduler: 'DPMSolverMultistep'
      }
    },
    
    'monet-impressionism': {
      name: 'SDXL Img2Img',
      version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 25,
        guidance_scale: 3.5,
        strength: 0.2,
        refine: 'expert_ensemble_refiner'
      }
    },
    
    'warhol-popart': {
      name: 'SDXL-Lightning Fast',
      version: '527d2a6296facb8e47ba1eaf17f142c240c19a30894f437feee9b91cc29d8e4f',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 6,
        guidance_scale: 3,
        strength: 0.15,
        scheduler: 'K_EULER'
      }
    },
    
    'anime-style': {
      name: 'Anything V5 (Anime)',
      version: '42a996d39a96aedc57b2e0aa8105dea39c9c89d9d266caf6bb4327a1c191b061',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 25,
        guidance_scale: 4,
        strength: 0.25,
        scheduler: 'K_EULER_ANCESTRAL'
      }
    }
  };
  
  return models[styleId as keyof typeof models] || models['default'];
}