export interface ArtStyle {
  id: string;
  name: string;
  nameKo?: string;
  description: string;
  descriptionKo?: string;
  sample?: string;
  tags?: string[];
  artist?: string;
  movement?: string;
  colorPalette: string[];
  intensity?: number;
  examples: string[];
  characteristics: string[];
}

export interface ArtProfileRequest {
  userId: string;
  imageUrl: string;
  styleId: string;
  customSettings?: {
    brushStroke?: number; // 0-100
    saturation?: number;  // 0-100
    abstraction?: number; // 0-100
  };
}

export interface ArtProfileResult {
  id: string;
  userId: string;
  originalImage: string;
  transformedImage: string;
  styleUsed: ArtStyle;
  createdAt: string;
  likes?: number;
  shared?: boolean;
}

export interface ArtProfileGalleryItem {
  id: string;
  user: {
    id: string;
    nickname: string;
    personalityType?: string;
  };
  artProfile: ArtProfileResult;
  isLiked?: boolean;
  likeCount: number;
}

export const predefinedStyles: ArtStyle[] = [
  {
    id: 'monet-impressionism',
    name: 'Monet Impressionism',
    nameKo: '모네 인상파',
    description: 'Light and color in harmony',
    descriptionKo: '빛과 색의 향연',
    sample: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/300px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg',
    tags: ['impressionism', 'pastel', 'brushstroke'],
    artist: 'Claude Monet',
    movement: 'Impressionism',
    colorPalette: ['#E6E6FA', '#87CEEB', '#98FB98'],
    examples: ['Water Lilies', 'Impression, Sunrise', 'Haystacks'],
    characteristics: ['soft brushstrokes', 'natural light', 'atmospheric effects']
  },
  {
    id: 'picasso-cubism',
    name: 'Picasso Cubism',
    nameKo: '피카소 큐비즘',
    description: 'Multiple perspectives of self',
    descriptionKo: '다각도의 나',
    sample: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Pablo_Picasso%2C_1910%2C_Girl_with_a_Mandolin_%28Fanny_Tellier%29%2C_oil_on_canvas%2C_100.3_x_73.6_cm%2C_Museum_of_Modern_Art_New_York..jpg/300px-Pablo_Picasso%2C_1910%2C_Girl_with_a_Mandolin_%28Fanny_Tellier%29%2C_oil_on_canvas%2C_100.3_x_73.6_cm%2C_Museum_of_Modern_Art_New_York..jpg',
    tags: ['cubism', 'geometric', 'abstract'],
    artist: 'Pablo Picasso',
    movement: 'Cubism',
    colorPalette: ['#8B4513', '#D2691E', '#F4A460'],
    examples: ['Les Demoiselles d\'Avignon', 'Guernica', 'Girl with a Mandolin'],
    characteristics: ['geometric shapes', 'multiple perspectives', 'fragmentation']
  },
  {
    id: 'vangogh-postimpressionism',
    name: 'Van Gogh Style',
    nameKo: '반 고흐 화풍',
    description: 'Emotional whirlwind',
    descriptionKo: '감정의 소용돌이',
    sample: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/300px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    tags: ['postimpressionism', 'expressive', 'swirls'],
    artist: 'Vincent van Gogh',
    movement: 'Post-Impressionism',
    colorPalette: ['#1E90FF', '#FFD700', '#FF8C00'],
    examples: ['Starry Night', 'Sunflowers', 'The Bedroom'],
    characteristics: ['expressive brushwork', 'vibrant colors', 'emotional intensity']
  },
  {
    id: 'warhol-popart',
    name: 'Warhol Pop Art',
    nameKo: '워홀 팝아트',
    description: 'Pop culture icon',
    descriptionKo: '대중문화 아이콘',
    sample: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Marilyndiptych.jpg/300px-Marilyndiptych.jpg',
    tags: ['popart', 'colorful', 'repetition'],
    artist: 'Andy Warhol',
    movement: 'Pop Art',
    colorPalette: ['#FF1493', '#00CED1', '#FFD700'],
    examples: ['Campbell\'s Soup Cans', 'Marilyn Diptych', 'Elvis'],
    characteristics: ['repetition', 'bright colors', 'commercial imagery']
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    nameKo: '픽셀 아트',
    description: 'Digital nostalgia',
    descriptionKo: '디지털 감성',
    sample: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAARElEQVQYV2NkYGD4z0ABYKJAAdGKGBgYGP7//w9nMzIyYmVjKkC3AKcCZBNwKkA2AacCZBNwKkA2AacCZBNwKqBgNQMAW6AJCb3J3ekAAAAASUVORK5CYII=',
    tags: ['digital', '8bit', 'retro'],
    movement: 'Digital Art',
    colorPalette: ['#FF0000', '#00FF00', '#0000FF'],
    examples: ['8-bit games', 'pixel portraits', 'retro graphics'],
    characteristics: ['pixelated', 'limited palette', 'nostalgic']
  },
  {
    id: 'korean-minhwa',
    name: 'Korean Minhwa',
    nameKo: '한국 민화',
    description: 'Traditional Korean folk art',
    descriptionKo: '전통의 멋',
    sample: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Kkachi_horangi.jpg/300px-Kkachi_horangi.jpg',
    tags: ['korean', 'traditional', 'folk'],
    movement: 'Korean Traditional',
    colorPalette: ['#DC143C', '#4682B4', '#FFD700'],
    examples: ['Tiger and Magpie', 'Ten Longevity Symbols', 'Flowers and Birds'],
    characteristics: ['symbolic imagery', 'vibrant colors', 'folk motifs']
  },
  {
    id: 'klimt-artnouveau',
    name: 'Klimt Gold',
    nameKo: '클림트 황금빛',
    description: 'Golden elegance',
    descriptionKo: '황금빛 우아함',
    sample: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/300px-Gustav_Klimt_016.jpg',
    tags: ['artnouveau', 'gold', 'decorative'],
    artist: 'Gustav Klimt',
    movement: 'Art Nouveau',
    colorPalette: ['#FFD700', '#B8860B', '#CD853F'],
    examples: ['The Kiss', 'Portrait of Adele Bloch-Bauer I', 'The Tree of Life'],
    characteristics: ['gold leaf', 'decorative patterns', 'symbolism']
  },
  {
    id: 'mondrian-neoplasticism',
    name: 'Mondrian Grid',
    nameKo: '몬드리안 그리드',
    description: 'Primary colors in harmony',
    descriptionKo: '원색의 조화',
    sample: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Tableau_I%2C_by_Piet_Mondriaan.jpg/300px-Tableau_I%2C_by_Piet_Mondriaan.jpg',
    tags: ['abstract', 'geometric', 'primary'],
    artist: 'Piet Mondrian',
    movement: 'Neoplasticism',
    colorPalette: ['#FF0000', '#0000FF', '#FFFF00', '#000000', '#FFFFFF'],
    examples: ['Composition with Red Blue and Yellow', 'Broadway Boogie Woogie', 'Victory Boogie Woogie'],
    characteristics: ['grid composition', 'primary colors', 'geometric abstraction']
  }
];

export interface UserArtPreference {
  userId: string;
  favoriteStyles: string[];
  recentlyViewed: {
    exhibitionId: string;
    artistName: string;
    movement: string;
    date: string;
  }[];
  generatedCount: number;
  monthlyCredits: number;
  isPremium: boolean;
}