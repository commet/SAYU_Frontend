import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const STYLE_PROMPTS: Record<string, string> = {
  'vangogh-postimpressionism': 'Vincent van Gogh post-impressionist style with bold swirling brushstrokes, vibrant yellows and blues, thick impasto texture, emotional intensity, starry night aesthetic',
  'monet-impressionism': 'Claude Monet impressionist painting with soft brushstrokes, delicate light effects, water lily pond aesthetic, pastel colors, atmospheric perspective, plein air feeling',
  'picasso-cubism': 'Pablo Picasso cubist style with geometric fragmentation, multiple simultaneous perspectives, angular forms, bold colors, abstract deconstruction, analytical cubism',
  'warhol-popart': 'Andy Warhol pop art style with bright vivid colors, screen printing effect, commercial art aesthetic, bold contrast, repetitive patterns, celebrity portrait style',
  'klimt-artnouveau': 'Gustav Klimt art nouveau style with golden decorative patterns, ornamental elements, byzantine mosaics influence, sensual elegance, symbolic imagery',
  'anime-style': 'high-quality anime art style with vibrant colors, cel-shading, detailed character design, Studio Ghibli quality, beautiful backgrounds, emotional expression',
  'cyberpunk-digital': 'cyberpunk digital art with neon colors, futuristic cityscape, holographic effects, dystopian atmosphere, blade runner aesthetic, high-tech low-life',
  'pixelart-digital': 'pixel art style with 16-bit aesthetic, retro gaming feel, limited color palette, crisp pixel definition, nostalgic video game art',
  'rembrandt-baroque': 'Rembrandt baroque style with dramatic chiaroscuro lighting, rich earth tones, psychological depth, masterful brushwork, Dutch Golden Age painting',
  'dali-surrealism': 'Salvador Dali surrealist style with melting objects, dreamlike imagery, precise technique, bizarre juxtapositions, subconscious symbolism',
  'hokusai-ukiyoe': 'Katsushika Hokusai ukiyo-e style with Japanese woodblock print aesthetic, wave patterns, Mount Fuji elements, bold outlines, traditional Japanese art',
  'rothko-abstract': 'Mark Rothko abstract expressionist style with color field painting, emotional color blocks, soft edges, meditative quality, spiritual depth'
};

export async function POST(request: NextRequest) {
  try {
    const { base64Image, styleId } = await request.json();

    if (!base64Image || !styleId) {
      return NextResponse.json(
        { error: 'Base64 image and styleId are required' },
        { status: 400 }
      );
    }

    // 서버사이드에서만 API 키 사용
    const apiKey = process.env.OPENAI_API_KEY; // NEXT_PUBLIC_ 없음!
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    const stylePrompt = STYLE_PROMPTS[styleId] || 'artistic masterpiece painting with enhanced colors and creative interpretation';

    try {
      // Method 1: Try direct image generation with DALL-E 3
      const prompt = `Transform this uploaded image into ${stylePrompt}. Maintain the general composition and subject matter but apply the artistic style completely. High quality, masterpiece level artwork.`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
        response_format: "b64_json"
      });

      if (!response.data[0].b64_json) {
        throw new Error('No image generated from DALL-E');
      }

      // Convert base64 to data URL
      const dataUrl = `data:image/png;base64,${response.data[0].b64_json}`;
      
      return NextResponse.json({
        success: true,
        dataUrl,
        method: 'dall-e-direct'
      });

    } catch (dalleError) {
      console.log('DALL-E direct method failed, trying GPT-4 Vision + DALL-E...', dalleError);

      // Method 2: Use GPT-4 Vision to describe the image, then generate with DALL-E
      try {
        const visionResponse = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Describe this image in detail for recreation in ${stylePrompt} style. Focus on composition, subjects, colors, and mood.`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: base64Image
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        });

        const imageDescription = visionResponse.choices[0].message.content;
        
        // Generate new image based on the description
        const enhancedPrompt = `${imageDescription}\n\nRecreate this scene in ${stylePrompt} style. Masterpiece quality, highly detailed, museum-worthy artwork.`;
        
        const dalleResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "vivid",
          response_format: "b64_json"
        });

        if (!dalleResponse.data[0].b64_json) {
          throw new Error('No image generated from DALL-E vision method');
        }

        const dataUrl = `data:image/png;base64,${dalleResponse.data[0].b64_json}`;
        
        return NextResponse.json({
          success: true,
          dataUrl,
          method: 'gpt4-vision-dalle',
          description: imageDescription
        });

      } catch (visionError) {
        console.error('Both OpenAI methods failed:', { dalleError, visionError });
        
        return NextResponse.json({
          error: 'OpenAI image generation failed with both methods',
          details: {
            dalle: dalleError instanceof Error ? dalleError.message : 'Unknown DALL-E error',
            vision: visionError instanceof Error ? visionError.message : 'Unknown Vision error'
          }
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('OpenAI API Route error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('content_policy_violation')) {
        return NextResponse.json(
          { error: '이미지 생성이 콘텐츠 정책에 의해 거부되었습니다. 다른 이미지를 시도해주세요.' },
          { status: 400 }
        );
      } else if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'API 호출 한도에 도달했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'OpenAI 이미지 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Rate limiting
const rateLimit = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10분
  const maxRequests = 3; // 10분당 3회 (OpenAI는 매우 비싼 API)

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