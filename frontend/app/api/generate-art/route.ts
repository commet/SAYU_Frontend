import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== API Route Debug Start ===');
  try {
    const { base64Image, styleId } = await request.json();
    console.log('✅ Request parsed successfully');
    console.log('Style ID:', styleId);
    console.log('Original Base64 image length:', base64Image?.length || 'undefined');
    
    // 이미지 압축 - 메모리 절약을 위해 크기를 더욱 줄임
    let compressedImage = base64Image;
    if (base64Image?.length > 1000000) { // 1MB 이상이면 압축
      try {
        // base64에서 일부만 사용 (품질 저하 대신 메모리 절약)
        const compressionRatio = Math.min(0.3, 500000 / base64Image.length); // 최대 30% 또는 500KB
        const targetLength = Math.floor(base64Image.length * compressionRatio);
        compressedImage = base64Image.substring(0, targetLength);
        console.log('🗜️ Image compressed from', base64Image.length, 'to', compressedImage.length);
      } catch (compressionError) {
        console.warn('Image compression failed, using original:', compressionError);
        compressedImage = base64Image;
      }
    }
    
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
        image: compressedImage,  // 압축된 이미지 사용
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

// 스타일별 프롬프트 - 원본 완전 보존에 중점 (ULTRA CONSERVATIVE)
function getPromptForStyle(styleId: string): string {
  const prompts: Record<string, string> = {
    'vangogh-postimpressionism': 'PRESERVE EXACT same face, PRESERVE EXACT same pose, PRESERVE EXACT same clothing, PRESERVE EXACT same background, PRESERVE EXACT same composition, PRESERVE EXACT same person identity, ONLY apply Van Gogh swirling brushstrokes and thick paint texture as overlay effect',
    'monet-impressionism': 'PRESERVE EXACT same face, PRESERVE EXACT same pose, PRESERVE EXACT same clothing, PRESERVE EXACT same background, PRESERVE EXACT same composition, PRESERVE EXACT same person identity, ONLY apply Monet impressionist soft brushwork and light effects as overlay',
    'picasso-cubism': 'PRESERVE EXACT same face, PRESERVE EXACT same pose, PRESERVE EXACT same clothing, PRESERVE EXACT same background, PRESERVE EXACT same composition, PRESERVE EXACT same person identity, ONLY apply Picasso geometric patterns as subtle overlay effect',
    'warhol-popart': 'PRESERVE EXACT same face, PRESERVE EXACT same pose, PRESERVE EXACT same clothing, PRESERVE EXACT same background, PRESERVE EXACT same composition, PRESERVE EXACT same person identity, ONLY apply Andy Warhol bright colors and high contrast as overlay effect',
    'klimt-artnouveau': 'PRESERVE EXACT same face, PRESERVE EXACT same pose, PRESERVE EXACT same clothing, PRESERVE EXACT same background, PRESERVE EXACT same composition, PRESERVE EXACT same person identity, ONLY apply Gustav Klimt golden patterns as decorative overlay',
    'anime-style': 'PRESERVE EXACT same face, PRESERVE EXACT same pose, PRESERVE EXACT same clothing, PRESERVE EXACT same background, PRESERVE EXACT same composition, PRESERVE EXACT same person identity, ONLY apply anime cel shading and clean line art style',
    'cyberpunk-digital': 'PRESERVE EXACT same face, PRESERVE EXACT same pose, PRESERVE EXACT same clothing, PRESERVE EXACT same background, PRESERVE EXACT same composition, PRESERVE EXACT same person identity, ONLY apply cyberpunk neon lighting effects as overlay',
    'pixelart-digital': 'PRESERVE EXACT same face, PRESERVE EXACT same pose, PRESERVE EXACT same clothing, PRESERVE EXACT same background, PRESERVE EXACT same composition, PRESERVE EXACT same person identity, ONLY apply pixel art texture as overlay effect'
  };
  
  return prompts[styleId] || 'PRESERVE EXACT original image, ONLY apply artistic style as subtle overlay effect';
}

// 스타일별 부정 프롬프트 - 원본 형태 완전 보존 (ULTRA STRICT)
function getNegativePromptForStyle(styleId: string): string {
  const negativePrompts: Record<string, string> = {
    'vangogh-postimpressionism': 'different person, different identity, different face, different facial features, different pose, different body position, different clothing, different background, different composition, different scene, extra people, extra objects, new elements, changing the subject, altering the pose, modifying facial structure, different lighting setup, different camera angle, different framing',
    'monet-impressionism': 'different person, different identity, different face, different facial features, different pose, different body position, different clothing, different background, different composition, different scene, extra people, extra objects, new elements, changing the subject, altering the pose, modifying facial structure, different lighting setup, different camera angle, different framing',
    'picasso-cubism': 'different person, different identity, different face, different facial features, different pose, different body position, different clothing, different background, different composition, different scene, extra people, extra objects, new elements, changing the subject, altering the pose, modifying facial structure, different lighting setup, different camera angle, different framing',
    'warhol-popart': 'different person, different identity, different face, different facial features, different pose, different body position, different clothing, different background, different composition, different scene, extra people, extra objects, new elements, changing the subject, altering the pose, modifying facial structure, different lighting setup, different camera angle, different framing',
    'klimt-artnouveau': 'different person, different identity, different face, different facial features, different pose, different body position, different clothing, different background, different composition, different scene, extra people, extra objects, new elements, changing the subject, altering the pose, modifying facial structure, different lighting setup, different camera angle, different framing',
    'anime-style': 'different person, different identity, different face, different facial features, different pose, different body position, different clothing, different background, different composition, different scene, extra people, extra objects, new elements, changing the subject, altering the pose, modifying facial structure, different lighting setup, different camera angle, different framing',
    'cyberpunk-digital': 'different person, different identity, different face, different facial features, different pose, different body position, different clothing, different background, different composition, different scene, extra people, extra objects, new elements, changing the subject, altering the pose, modifying facial structure, different lighting setup, different camera angle, different framing',
    'pixelart-digital': 'different person, different identity, different face, different facial features, different pose, different body position, different clothing, different background, different composition, different scene, extra people, extra objects, new elements, changing the subject, altering the pose, modifying facial structure, different lighting setup, different camera angle, different framing'
  };
  
  return negativePrompts[styleId] || 'different person, different identity, different pose, different composition, changing the subject, new elements, low quality';
}

// 스타일별 모델 설정 - IMG2IMG 전용 검증된 모델
function getReplicateModelForStyle(styleId: string): any {
  // 경량 SD 1.5 IMG2IMG 모델 - 극도로 메모리 효율적
  const verifiedImg2ImgModel = {
    name: 'Stable Diffusion 1.5 (Ultra Lightweight)',
    version: '15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d',
    supportNegativePrompt: true,
    baseInput: {
      width: 256,               // 최소 해상도로 극한 메모리 절약
      height: 256,              // 최소 해상도로 극한 메모리 절약
      num_inference_steps: 5,   // 최소 steps
      guidance_scale: 7.5,      // 표준값
      prompt_strength: 0.03,    // 최소 변형도
      num_outputs: 1,           // 단일 출력
      scheduler: 'K_EULER_ANCESTRAL'  // 가장 가벼운 스케줄러
    }
  };
  
  // 모든 스타일에 검증된 IMG2IMG 모델 사용
  const models = {
    'default': verifiedImg2ImgModel,
    
    'vangogh-postimpressionism': {
      ...verifiedImg2ImgModel,
      baseInput: {
        ...verifiedImg2ImgModel.baseInput,
        prompt_strength: 0.04,  // 붓터치 효과
        guidance_scale: 9.0
      }
    },
    
    'monet-impressionism': {
      ...verifiedImg2ImgModel,
      baseInput: {
        ...verifiedImg2ImgModel.baseInput,
        prompt_strength: 0.03,  // 가장 미묘하게
        guidance_scale: 8.5
      }
    },
    
    'picasso-cubism': {
      ...verifiedImg2ImgModel,
      baseInput: {
        ...verifiedImg2ImgModel.baseInput,
        prompt_strength: 0.02,  // 극단적으로 낮게
        guidance_scale: 10.0     // 매우 강한 제약
      }
    },
    
    'warhol-popart': {
      ...verifiedImg2ImgModel,
      baseInput: {
        ...verifiedImg2ImgModel.baseInput,
        prompt_strength: 0.05,  // 색상 변화
        guidance_scale: 8.0
      }
    },
    
    'klimt-artnouveau': {
      ...verifiedImg2ImgModel,
      baseInput: {
        ...verifiedImg2ImgModel.baseInput,
        prompt_strength: 0.04,  // 장식 요소
        guidance_scale: 8.5
      }
    },
    
    'anime-style': {
      ...verifiedImg2ImgModel,
      baseInput: {
        ...verifiedImg2ImgModel.baseInput,
        prompt_strength: 0.06,  // 애니메 스타일
        guidance_scale: 8.0
      }
    },
    
    'cyberpunk-digital': {
      ...verifiedImg2ImgModel,
      baseInput: {
        ...verifiedImg2ImgModel.baseInput,
        prompt_strength: 0.04,  // 조명 효과
        guidance_scale: 8.5
      }
    },
    
    'pixelart-digital': {
      ...verifiedImg2ImgModel,
      baseInput: {
        ...verifiedImg2ImgModel.baseInput,
        prompt_strength: 0.07,  // 픽셀 텍스처
        guidance_scale: 8.0
      }
    }
  };
  
  return models[styleId as keyof typeof models] || models['default'];
}