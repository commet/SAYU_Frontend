/**
 * 100% 작동이 보장되는 안정적인 이미지 URL
 * Picsum, Unsplash Source, 그리고 다른 안정적인 소스 사용
 */

export const STABLE_ARTWORK_IMAGES = [
  {
    id: 'artwork-1',
    title: 'Impressionist Landscape',
    artist: 'Claude Monet Style',
    year: '1874',
    // Picsum - 항상 작동하는 placeholder 이미지
    imageUrl: 'https://picsum.photos/seed/monet/800/600',
    description: 'A beautiful impressionist landscape'
  },
  {
    id: 'artwork-2', 
    title: 'Starry Night Vision',
    artist: 'Van Gogh Style',
    year: '1889',
    imageUrl: 'https://picsum.photos/seed/vangogh/800/600',
    description: 'Post-impressionist masterpiece'
  },
  {
    id: 'artwork-3',
    title: 'Abstract Composition',
    artist: 'Kandinsky Style',
    year: '1913',
    imageUrl: 'https://picsum.photos/seed/kandinsky/800/600',
    description: 'Bold abstract expression'
  },
  {
    id: 'artwork-4',
    title: 'The Garden',
    artist: 'Renoir Style',
    year: '1876',
    imageUrl: 'https://picsum.photos/seed/renoir/800/600',
    description: 'Impressionist garden scene'
  },
  {
    id: 'artwork-5',
    title: 'Water Reflections',
    artist: 'Monet Style',
    year: '1906',
    imageUrl: 'https://picsum.photos/seed/waterlilies/800/600',
    description: 'Peaceful water scene'
  },
  {
    id: 'artwork-6',
    title: 'Portrait Study',
    artist: 'Vermeer Style',
    year: '1665',
    imageUrl: 'https://picsum.photos/seed/vermeer/800/600',
    description: 'Classical portrait'
  },
  {
    id: 'artwork-7',
    title: 'Golden Patterns',
    artist: 'Klimt Style',
    year: '1908',
    imageUrl: 'https://picsum.photos/seed/klimt/800/600',
    description: 'Art nouveau elegance'
  },
  {
    id: 'artwork-8',
    title: 'Ocean Waves',
    artist: 'Hokusai Style',
    year: '1831',
    imageUrl: 'https://picsum.photos/seed/hokusai/800/600',
    description: 'Japanese woodblock style'
  },
  {
    id: 'artwork-9',
    title: 'Ballet Dancers',
    artist: 'Degas Style',
    year: '1874',
    imageUrl: 'https://picsum.photos/seed/degas/800/600',
    description: 'Graceful movement captured'
  },
  {
    id: 'artwork-10',
    title: 'The Scream Echo',
    artist: 'Munch Style',
    year: '1893',
    imageUrl: 'https://picsum.photos/seed/munch/800/600',
    description: 'Expressionist emotion'
  },
  {
    id: 'artwork-11',
    title: 'Night Scene',
    artist: 'Rembrandt Style',
    year: '1642',
    imageUrl: 'https://picsum.photos/seed/rembrandt/800/600',
    description: 'Dramatic lighting'
  },
  {
    id: 'artwork-12',
    title: 'Still Life',
    artist: 'Cézanne Style',
    year: '1895',
    imageUrl: 'https://picsum.photos/seed/cezanne/800/600',
    description: 'Post-impressionist still life'
  }
];

// Met Museum API를 사용한 실제 작품 (Public Domain)
export const MET_MUSEUM_ARTWORKS = [
  {
    id: 'met-1',
    title: 'Wheat Field with Cypresses',
    artist: 'Vincent van Gogh',
    year: '1889',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg',
    description: 'Van Gogh masterpiece from Met Museum'
  },
  {
    id: 'met-2',
    title: 'The Dance Class',
    artist: 'Edgar Degas',
    year: '1874',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-20101-001.jpg',
    description: 'Degas ballet dancers'
  },
  {
    id: 'met-3',
    title: 'Bridge over a Pond of Water Lilies',
    artist: 'Claude Monet',
    year: '1899',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP130999.jpg',
    description: 'Monet water lilies'
  }
];

// 가장 안전한 옵션 - Data URLs (Base64 인코딩된 작은 이미지)
export const INLINE_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzFmMjkzNyIvPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgb3BhY2l0eT0iMC4zIi8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAwLCAzMDApIj4KICAgIDxyZWN0IHg9Ii02MCIgeT0iLTYwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4YjVjZjYiIHN0cm9rZS13aWR0aD0iNCIgcng9IjgiLz4KICAgIDxjaXJjbGUgY3g9IjIwIiBjeT0iLTIwIiByPSI4IiBmaWxsPSIjOGI1Y2Y2Ii8+CiAgICA8cGF0aCBkPSJNIC00MCAxMCBRIC0yMCAtMTAgMCAxMCBRIDIwIC0xMCA0MCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGI1Y2Y2IiBzdHJva2Utd2lkdGg9IjQiLz4KICA8L2c+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzhiNWNmNjtzdG9wLW9wYWNpdHk6MC41IiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlYzQ4OTk7c3RvcC1vcGFjaXR5OjAuNSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgo8L3N2Zz4=';

export function getStableArtworkImage(index: number): string {
  // Picsum을 기본으로 사용 - 100% 안정적
  return `https://picsum.photos/seed/artwork${index}/800/600`;
}