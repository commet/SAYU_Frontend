import { NextRequest, NextResponse } from 'next/server';

const imageConfigs = {
  backgrounds: {
    'city-view': { 
      title: '도시 전경', 
      gradient: ['#667eea', '#764ba2'],
      icon: '🏙️',
      shapes: [
        { type: 'rect', x: 20, y: 60, width: 15, height: 30, opacity: 0.3 },
        { type: 'rect', x: 40, y: 50, width: 20, height: 40, opacity: 0.3 },
        { type: 'rect', x: 65, y: 55, width: 18, height: 35, opacity: 0.3 },
      ]
    },
    'museum-entrance': { 
      title: '미술관 입구', 
      gradient: ['#f093fb', '#f5576c'],
      icon: '🏛️',
      shapes: [
        { type: 'rect', x: 30, y: 40, width: 40, height: 50, opacity: 0.2 },
        { type: 'circle', cx: 50, cy: 35, r: 15, opacity: 0.2 },
      ]
    },
    'gallery-space': { 
      title: '갤러리 공간', 
      gradient: ['#e0e0e0', '#f5f5f5'],
      icon: '🖼️',
      shapes: [
        { type: 'rect', x: 15, y: 30, width: 20, height: 25, opacity: 0.3 },
        { type: 'rect', x: 45, y: 35, width: 15, height: 20, opacity: 0.3 },
        { type: 'rect', x: 70, y: 32, width: 18, height: 23, opacity: 0.3 },
      ]
    },
    'viewing-art': { 
      title: '작품 감상', 
      gradient: ['#4facfe', '#00f2fe'],
      icon: '👥',
      shapes: [
        { type: 'circle', cx: 30, cy: 70, r: 8, opacity: 0.3 },
        { type: 'circle', cx: 70, cy: 70, r: 8, opacity: 0.3 },
        { type: 'rect', x: 40, y: 20, width: 20, height: 30, opacity: 0.2 },
      ]
    },
    'special-moment': { 
      title: '특별한 순간', 
      gradient: ['#fa709a', '#fee140'],
      icon: '✨',
      shapes: [
        { type: 'star', cx: 50, cy: 50, size: 30, opacity: 0.2 },
      ]
    },
    'museum-cafe': { 
      title: '미술관 카페', 
      gradient: ['#a8edea', '#fed6e3'],
      icon: '☕',
      shapes: [
        { type: 'circle', cx: 50, cy: 60, r: 20, opacity: 0.2 },
        { type: 'rect', x: 35, y: 70, width: 30, height: 5, opacity: 0.3 },
      ]
    },
    'museum-shop': { 
      title: '아트샵', 
      gradient: ['#ff9a9e', '#fecfef'],
      icon: '🛍️',
      shapes: [
        { type: 'rect', x: 20, y: 50, width: 15, height: 20, opacity: 0.3 },
        { type: 'rect', x: 40, y: 45, width: 20, height: 25, opacity: 0.3 },
        { type: 'rect', x: 65, y: 48, width: 18, height: 22, opacity: 0.3 },
      ]
    },
    'sunset-street': { 
      title: '노을 거리', 
      gradient: ['#ffecd2', '#fcb69f'],
      icon: '🌅',
      shapes: [
        { type: 'circle', cx: 80, cy: 20, r: 15, opacity: 0.3 },
        { type: 'rect', x: 10, y: 70, width: 80, height: 20, opacity: 0.2 },
      ]
    }
  },
  choices: {
    'modern-museum': { 
      title: '현대미술관', 
      gradient: ['#43e97b', '#38f9d7'],
      icon: '🏢'
    },
    'classical-museum': { 
      title: '국립미술관', 
      gradient: ['#d299c2', '#fef9d7'],
      icon: '🏛️'
    },
    'alone-viewing': { 
      title: '혼자서 감상', 
      gradient: ['#89f7fe', '#66a6ff'],
      icon: '🚶'
    },
    'docent-tour': { 
      title: '도슨트 투어', 
      gradient: ['#f6d365', '#fda085'],
      icon: '👥'
    },
    'emotional-response': { 
      title: '감정적 반응', 
      gradient: ['#f77062', '#fe5196'],
      icon: '💝'
    },
    'analytical-response': { 
      title: '분석적 반응', 
      gradient: ['#96e6a1', '#d4fc79'],
      icon: '🤔'
    },
    'flow-viewing': { 
      title: '자유로운 감상', 
      gradient: ['#fbc2eb', '#a6c1ee'],
      icon: '🌊'
    },
    'reading-labels': { 
      title: '작품 설명 읽기', 
      gradient: ['#84fab0', '#8fd3f4'],
      icon: '📖'
    },
    'abstract-art': { 
      title: '추상 미술', 
      gradient: ['#a1c4fd', '#c2e9fb'],
      icon: '🎨'
    },
    'portrait-art': { 
      title: '인물화', 
      gradient: ['#ffeaa7', '#dfe6e9'],
      icon: '👤'
    },
    'writing-journal': { 
      title: '일기 쓰기', 
      gradient: ['#dfe9f3', '#ffffff'],
      icon: '✍️'
    },
    'sharing-phone': { 
      title: 'SNS 공유', 
      gradient: ['#50cc7f', '#f5d100'],
      icon: '📱'
    },
    'art-postcard': { 
      title: '아트 엽서', 
      gradient: ['#ff6e7f', '#bfe9ff'],
      icon: '💌'
    },
    'art-book': { 
      title: '전시 도록', 
      gradient: ['#e8b4b8', '#a67c90'],
      icon: '📚'
    },
    'emotional-memory': { 
      title: '감동의 기억', 
      gradient: ['#ff758c', '#ff7eb3'],
      icon: '💭'
    },
    'new-perspective': { 
      title: '새로운 시각', 
      gradient: ['#7028e4', '#e5b2ca'],
      icon: '🔮'
    }
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'backgrounds' | 'choices';
  const name = searchParams.get('name') || '';
  
  const config = imageConfigs[type]?.[name];
  if (!config) {
    return new NextResponse('Not found', { status: 404 });
  }

  const width = type === 'backgrounds' ? 1200 : 600;
  const height = type === 'backgrounds' ? 675 : 400;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${config.gradient[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${config.gradient[1]};stop-opacity:1" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#grad)" />
      
      <!-- Decorative shapes -->
      ${config.shapes ? config.shapes.map((shape: any) => {
        if (shape.type === 'rect') {
          return `<rect x="${shape.x}%" y="${shape.y}%" width="${shape.width}%" height="${shape.height}%" 
                   fill="white" opacity="${shape.opacity}" filter="url(#blur)" />`;
        } else if (shape.type === 'circle') {
          return `<circle cx="${shape.cx}%" cy="${shape.cy}%" r="${shape.r}%" 
                   fill="white" opacity="${shape.opacity}" filter="url(#blur)" />`;
        } else if (shape.type === 'star') {
          const points = Array.from({ length: 10 }, (_, i) => {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? shape.size : shape.size / 2;
            const x = shape.cx + radius * Math.cos(angle - Math.PI / 2);
            const y = shape.cy + radius * Math.sin(angle - Math.PI / 2);
            return `${x}%,${y}%`;
          }).join(' ');
          return `<polygon points="${points}" fill="white" opacity="${shape.opacity}" filter="url(#blur)" />`;
        }
        return '';
      }).join('') : ''}
      
      <!-- Dark overlay -->
      <rect width="${width}" height="${height}" fill="black" opacity="0.3" />
      
      <!-- Icon -->
      <text x="50%" y="40%" text-anchor="middle" font-size="${height * 0.15}" fill="white" opacity="0.9">
        ${config.icon}
      </text>
      
      <!-- Title -->
      <text x="50%" y="60%" text-anchor="middle" font-size="${height * 0.05}" font-weight="bold" fill="white">
        ${config.title}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}