import { NextRequest, NextResponse } from 'next/server';

// Museum background gradients based on location/mood
const backgroundGradients: Record<string, string[]> = {
  'city-view': ['#1a1a2e', '#16213e', '#0f3460'],
  'museum-entrance': ['#2d3561', '#5d4e60', '#7d5a5a'],
  'gallery-space': ['#f5f5f5', '#e8e8e8', '#d4d4d4'],
  'viewing-art': ['#faf8f3', '#f0e6d2', '#e6d5b8'],
  'special-moment': ['#ff6b6b', '#ee5a6f', '#c44569'],
  'museum-cafe': ['#a8dadc', '#457b9d', '#1d3557'],
  'museum-shop': ['#f1faee', '#a8dadc', '#457b9d'],
  'sunset-street': ['#ff9a76', '#ff6348', '#ff304f']
};

// Choice image gradients based on theme
const choiceGradients: Record<string, string[]> = {
  'modern-museum': ['#00b4d8', '#0077b6', '#03045e'],
  'classical-museum': ['#d4a574', '#a68a64', '#936639'],
  'alone-viewing': ['#cdb4db', '#ffc8dd', '#ffafcc'],
  'docent-tour': ['#bde0fe', '#a2d2ff', '#8bb4f7'],
  'emotional-response': ['#e63946', '#f1faee', '#a8dadc'],
  'analytical-response': ['#457b9d', '#1d3557', '#0d1b2a'],
  'flow-viewing': ['#f4a261', '#e76f51', '#e9c46a'],
  'systematic-viewing': ['#264653', '#2a9d8f', '#e9c46a'],
  'abstract-art': ['#e56b6f', '#b56576', '#6d597a'],
  'realistic-art': ['#355070', '#6d597a', '#b56576'],
  'portrait-art': ['#355070', '#6d597a', '#b56576'],
  'writing-journal': ['#f8edeb', '#f9dcc4', '#fec89a'],
  'sharing-phone': ['#fec5bb', '#fcd5ce', '#fae1dd'],
  'art-postcard': ['#ece4db', '#d5bdaf', '#b79492'],
  'art-book': ['#5e503f', '#a9927d', '#f2e9e4'],
  'emotional-memory': ['#ffb5a7', '#fcd5ce', '#f8edeb'],
  'new-perspective': ['#f9dcc4', '#fec89a', '#ffd60a'],
  'reading-labels': ['#264653', '#2a9d8f', '#e9c46a']
};

function generateSVGGradient(colors: string[], width: number = 800, height: number = 600, name: string = ''): string {
  const gradientId = `grad_${Math.random().toString(36).substr(2, 9)}`;
  
  // Add text overlay for the name to make it more informative
  const displayName = name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          ${colors.map((color, i) => `
            <stop offset="${(i / (colors.length - 1)) * 100}%" style="stop-color:${color};stop-opacity:1" />
          `).join('')}
        </linearGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 .1 .1 .1 .1 .1 .1 .1 .1 .1 .1 .1 .1 .1 .1 .1 .1 .1 1"/>
          </feComponentTransfer>
          <feComposite operator="over" in2="SourceGraphic"/>
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#${gradientId})" />
      <rect width="${width}" height="${height}" fill="url(#${gradientId})" filter="url(#grain)" opacity="0.1" />
      
      ${/* Add some artistic elements for museum feel */
      Array.from({ length: 3 }, (_, i) => `
        <circle 
          cx="${Math.random() * width}" 
          cy="${Math.random() * height}" 
          r="${50 + Math.random() * 100}" 
          fill="${colors[Math.floor(Math.random() * colors.length)]}"
          opacity="0.05"
        />
      `).join('')}
      
      <!-- Add text overlay -->
      <text x="${width / 2}" y="${height / 2}" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 15}" 
            fill="white" opacity="0.3">
        ${displayName}
      </text>
    </svg>
  `;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'backgrounds';
  const name = searchParams.get('name') || 'city-view';
  
  const gradients = type === 'backgrounds' ? backgroundGradients : choiceGradients;
  const colors = gradients[name] || ['#667eea', '#764ba2', '#f093fb']; // fallback gradient
  
  const width = type === 'backgrounds' ? 1920 : 800;
  const height = type === 'backgrounds' ? 1080 : 600;
  
  const svg = generateSVGGradient(colors, width, height, name);
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}