import { NextRequest, NextResponse } from 'next/server';
import { stableImages } from '@/lib/stableImageUrls';

// Curated museum and art-related images - properly matched to simulation stages
const unsplashImages = {
  backgrounds: {
    // Stage 1: 도시에서 미술관 선택 - 도시 전경에 미술관이 보이는 장면
    'city-view': 'https://images.unsplash.com/photo-1569163139394-de4798aa62ea?w=1920&h=1080&fit=crop&q=80', // NYC with museums
    
    // Stage 2: 미술관 도착 - 미술관 입구/로비
    'museum-entrance': 'https://images.unsplash.com/photo-1565034946487-077786996e27?w=1920&h=1080&fit=crop&q=80', // Museum lobby
    
    // Stage 3: 전시장 입장 - 흰 벽의 갤러리 공간
    'gallery-space': 'https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?w=1920&h=1080&fit=crop&q=80', // White gallery
    
    // Stage 4: 작품 감상 - 사람들이 작품을 보고 있는 모습
    'viewing-art': 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1920&h=1080&fit=crop&q=80', // People viewing art
    
    // Stage 5: 특별한 순간 - 한 작품 앞에서의 사색
    'special-moment': 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1920&h=1080&fit=crop&q=80', // Person contemplating art
    
    // Stage 6: 휴식 - 미술관 카페
    'museum-cafe': 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=1920&h=1080&fit=crop&q=80', // Museum cafe
    
    // Stage 7: 기념품 - 미술관 아트샵
    'museum-shop': 'https://images.unsplash.com/photo-1569105002844-dc5012fda999?w=1920&h=1080&fit=crop&q=80', // Museum shop
    
    // Stage 8: 마무리 - 석양의 거리
    'sunset-street': 'https://images.unsplash.com/photo-1470219556762-1771e7f9427d?w=1920&h=1080&fit=crop&q=80' // Sunset city
  },
  choices: {
    // Stage 1: 현대미술관 vs 고전미술관
    'modern-museum': 'https://images.unsplash.com/photo-1575223970966-76ae61ee7838?w=800&h=600&fit=crop&q=80', // MoMA style
    'classical-museum': 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&h=600&fit=crop&q=80', // Met style
    
    // Stage 2: 혼자 vs 도슨트 투어
    'alone-viewing': 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&q=80', // Solo viewer
    'docent-tour': 'https://images.unsplash.com/photo-1568827999250-3f6afff96e66?w=800&h=600&fit=crop&q=80', // Tour guide with group
    
    // Stage 3: 감정적 vs 분석적 반응
    'emotional-response': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80', // Emotional viewer
    'analytical-response': 'https://images.unsplash.com/photo-1565716875607-76e76a88ac71?w=800&h=600&fit=crop&q=80', // Studying artwork
    
    // Stage 4: 자유로운 흐름 vs 체계적 감상
    'flow-viewing': 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=600&fit=crop&q=80', // Casual walking
    'reading-labels': 'https://images.unsplash.com/photo-1580847097346-72d80f164702?w=800&h=600&fit=crop&q=80', // Reading museum label
    
    // Stage 5: 추상화 vs 구상화
    'abstract-art': 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=600&fit=crop&q=80', // Abstract painting
    'portrait-art': 'https://images.unsplash.com/photo-1566132127697-4524fea60007?w=800&h=600&fit=crop&q=80', // Classic portrait
    
    // Stage 6: 일기 작성 vs SNS 공유
    'writing-journal': 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=600&fit=crop&q=80', // Writing in notebook
    'sharing-phone': 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=600&fit=crop&q=80', // Sharing on phone
    
    // Stage 7: 엽서 vs 도록
    'art-postcard': 'https://images.unsplash.com/photo-1584448141569-133f57996e00?w=800&h=600&fit=crop&q=80', // Art postcards
    'art-book': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&q=80', // Art books
    
    // Stage 8: 감동 vs 새로운 시각
    'emotional-memory': 'https://images.unsplash.com/photo-1576504677598-1ff6e8395b08?w=800&h=600&fit=crop&q=80', // Emotional moment
    'new-perspective': 'https://images.unsplash.com/photo-1545989253-02cc26577f88?w=800&h=600&fit=crop&q=80' // New insight
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'backgrounds' | 'choices';
  const name = searchParams.get('name') || '';
  
  // First try stable images
  const stableImage = stableImages[type]?.[name];
  let imageUrlToTry = stableImage?.primary || unsplashImages[type]?.[name];
  
  if (!imageUrlToTry) {
    // Fallback to placeholder API
    return NextResponse.redirect(new URL(`/api/placeholder-image?type=${type}&name=${name}`, request.url));
  }

  // Try primary URL first, then fallback
  const urlsToTry = [
    stableImage?.primary,
    unsplashImages[type]?.[name],
    stableImage?.fallback
  ].filter(Boolean);

  for (const url of urlsToTry) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        continue; // Try next URL
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('image')) {
        continue; // Try next URL
      }
      
      const imageBuffer = await response.arrayBuffer();
      
      // Check if buffer is valid
      if (imageBuffer.byteLength === 0) {
        continue; // Try next URL
      }
      
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
      });
    } catch (error) {
      console.error(`Image fetch error for ${url}:`, error);
      // Continue to next URL
    }
  }
  
  // If all URLs fail, fallback to placeholder
  console.error(`All image URLs failed for ${type}/${name}`);
  return NextResponse.redirect(new URL(`/api/placeholder-image?type=${type}&name=${name}`, request.url));
}