import { ArtStyle } from '@/types/art-profile';

export const predefinedStyles: ArtStyle[] = [
  {
    id: 'impressionist',
    name: 'Impressionist',
    nameKo: '인상주의',
    description: 'Soft, dreamy brushstrokes with emphasis on light and color',
    descriptionKo: '빛과 색채를 강조한 부드럽고 몽환적인 붓터치',
    sample: '/samples/impressionist.jpg',
    tags: ['soft', 'dreamy', 'light', 'color'],
    artist: 'Claude Monet',
    movement: 'Impressionism',
    colorPalette: ['#E6D5B8', '#F0A500', '#4A7C7E'],
    intensity: 0.7
  },
  {
    id: 'cubist',
    name: 'Cubist',
    nameKo: '입체파',
    description: 'Geometric shapes and multiple perspectives combined',
    descriptionKo: '기하학적 형태와 다양한 시점의 결합',
    sample: '/samples/cubist.jpg',
    tags: ['geometric', 'angular', 'abstract', 'modern'],
    artist: 'Pablo Picasso',
    movement: 'Cubism',
    colorPalette: ['#2C3E50', '#E74C3C', '#F39C12'],
    intensity: 0.9
  },
  {
    id: 'surrealist',
    name: 'Surrealist',
    nameKo: '초현실주의',
    description: 'Dreamlike imagery with unexpected juxtapositions',
    descriptionKo: '예상치 못한 병치와 함께하는 꿈같은 이미지',
    sample: '/samples/surrealist.jpg',
    tags: ['dreamlike', 'surreal', 'fantasy', 'mysterious'],
    artist: 'Salvador Dalí',
    movement: 'Surrealism',
    colorPalette: ['#9B59B6', '#3498DB', '#E67E22'],
    intensity: 0.8
  },
  {
    id: 'abstract-expressionist',
    name: 'Abstract Expressionist',
    nameKo: '추상 표현주의',
    description: 'Bold, emotional brushwork with abstract forms',
    descriptionKo: '추상적인 형태와 함께하는 대담하고 감정적인 붓질',
    sample: '/samples/abstract-expressionist.jpg',
    tags: ['abstract', 'emotional', 'bold', 'expressive'],
    artist: 'Jackson Pollock',
    movement: 'Abstract Expressionism',
    colorPalette: ['#C0392B', '#2980B9', '#F1C40F', '#27AE60'],
    intensity: 1.0
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    nameKo: '미니멀리즘',
    description: 'Simple forms and reduced color palettes',
    descriptionKo: '단순한 형태와 절제된 색상 팔레트',
    sample: '/samples/minimalist.jpg',
    tags: ['simple', 'clean', 'minimal', 'modern'],
    artist: 'Donald Judd',
    movement: 'Minimalism',
    colorPalette: ['#ECF0F1', '#34495E', '#95A5A6'],
    intensity: 0.3
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    nameKo: '팝 아트',
    description: 'Bright colors and imagery from popular culture',
    descriptionKo: '대중문화에서 가져온 밝은 색상과 이미지',
    sample: '/samples/pop-art.jpg',
    tags: ['bright', 'bold', 'pop', 'colorful'],
    artist: 'Andy Warhol',
    movement: 'Pop Art',
    colorPalette: ['#E74C3C', '#3498DB', '#F1C40F', '#E67E22'],
    intensity: 0.9
  }
];