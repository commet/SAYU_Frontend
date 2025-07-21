// Art Style Based Animal Personas
export type ArtMovement = 
  | 'RENAISSANCE'
  | 'IMPRESSIONISM'
  | 'ABSTRACT'
  | 'MINIMALISM'
  | 'POP_ART'
  | 'SURREALISM'
  | 'BAROQUE'
  | 'CUBISM'
  | 'ROMANTICISM'
  | 'MODERNISM'
  | 'CONTEMPORARY'
  | 'EXPRESSIONISM'
  | 'REALISM'
  | 'ART_NOUVEAU'
  | 'DADA'
  | 'FUTURISM';

export interface ArtStylePersona {
  id: string;
  animal: string;
  artMovement: ArtMovement;
  emoji: string;
  characteristics: string[];
  colorPalette: string[];
  artisticTraits: {
    detail: number; // 0-100
    emotion: number; // 0-100
    experimentation: number; // 0-100
    tradition: number; // 0-100
  };
  preferredMediums: string[];
  iconicArtists: string[];
  description: string;
}

export interface PrivacyLevel {
  level: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  reveals: string[];
  masks: string[];
}

export interface UserPrivacyState {
  currentLevel: PrivacyLevel['level'];
  artStyleAvatar: string; // Generated art style avatar
  blurLevel: number; // 0-100
  revealedTraits: string[];
  maskedPhoto?: string; // Photo with artistic pattern masking
}

// Privacy Levels Definition
export const PRIVACY_LEVELS: Record<number, PrivacyLevel> = {
  1: {
    level: 1,
    name: 'Anonymous Art Explorer',
    description: 'Complete anonymity with art style avatar',
    reveals: ['Art movement preference', 'Color preferences', 'General interests'],
    masks: ['Personal photos', 'Name', 'Location', 'Age', 'Specific details']
  },
  2: {
    level: 2,
    name: 'Artistic Taste Revealed',
    description: 'Share your artistic preferences and cultural interests',
    reveals: ['Detailed art preferences', 'Museum visit history', 'Favorite artists', 'Cultural interests'],
    masks: ['Personal photos', 'Real name', 'Exact location']
  },
  3: {
    level: 3,
    name: 'Artistic Identity',
    description: 'Partially revealed identity with artistic masking',
    reveals: ['First name', 'City', 'Profession', 'Masked photo with artistic patterns'],
    masks: ['Full photo', 'Last name', 'Exact address']
  },
  4: {
    level: 4,
    name: 'Full Gallery Opening',
    description: 'Complete profile revelation',
    reveals: ['Full photo', 'Complete profile', 'All preferences', 'Contact information'],
    masks: []
  }
};

// Art Style Based Personas
export const ART_STYLE_PERSONAS: Record<ArtMovement, ArtStylePersona> = {
  RENAISSANCE: {
    id: 'renaissance-rabbit',
    animal: 'Rabbit',
    artMovement: 'RENAISSANCE',
    emoji: '🐰',
    characteristics: ['Detail-oriented', 'Classical beauty', 'Harmonious', 'Intellectual'],
    colorPalette: ['#8B4513', '#DAA520', '#CD853F', '#F4A460'],
    artisticTraits: {
      detail: 95,
      emotion: 60,
      experimentation: 30,
      tradition: 90
    },
    preferredMediums: ['Oil painting', 'Fresco', 'Sculpture', 'Drawing'],
    iconicArtists: ['Leonardo da Vinci', 'Michelangelo', 'Raphael'],
    description: 'Seeks perfection in form and intellectual depth in art'
  },
  IMPRESSIONISM: {
    id: 'impressionist-fox',
    animal: 'Fox',
    artMovement: 'IMPRESSIONISM',
    emoji: '🦊',
    characteristics: ['Spontaneous', 'Emotional', 'Color-focused', 'Light-chasing'],
    colorPalette: ['#87CEEB', '#FFB6C1', '#E6E6FA', '#F0E68C'],
    artisticTraits: {
      detail: 40,
      emotion: 85,
      experimentation: 70,
      tradition: 40
    },
    preferredMediums: ['Oil painting', 'Watercolor', 'Pastel'],
    iconicArtists: ['Claude Monet', 'Pierre-Auguste Renoir', 'Edgar Degas'],
    description: 'Captures fleeting moments and emotional impressions'
  },
  ABSTRACT: {
    id: 'abstract-tiger',
    animal: 'Tiger',
    artMovement: 'ABSTRACT',
    emoji: '🐅',
    characteristics: ['Bold', 'Experimental', 'Conceptual', 'Non-conformist'],
    colorPalette: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A1A2E'],
    artisticTraits: {
      detail: 20,
      emotion: 70,
      experimentation: 95,
      tradition: 15
    },
    preferredMediums: ['Mixed media', 'Acrylic', 'Digital art', 'Installation'],
    iconicArtists: ['Wassily Kandinsky', 'Jackson Pollock', 'Mark Rothko'],
    description: 'Breaks boundaries and explores pure form and color'
  },
  MINIMALISM: {
    id: 'minimalist-crane',
    animal: 'Crane',
    artMovement: 'MINIMALISM',
    emoji: '🦢',
    characteristics: ['Clean aesthetic', 'Thoughtful', 'Essential', 'Meditative'],
    colorPalette: ['#FFFFFF', '#000000', '#F5F5F5', '#808080'],
    artisticTraits: {
      detail: 30,
      emotion: 40,
      experimentation: 60,
      tradition: 50
    },
    preferredMediums: ['Sculpture', 'Installation', 'Photography', 'Design'],
    iconicArtists: ['Donald Judd', 'Dan Flavin', 'Agnes Martin'],
    description: 'Finds beauty in simplicity and essential forms'
  },
  POP_ART: {
    id: 'popart-peacock',
    animal: 'Peacock',
    artMovement: 'POP_ART',
    emoji: '🦚',
    characteristics: ['Vibrant', 'Culture-aware', 'Trendy', 'Playful'],
    colorPalette: ['#FF1493', '#00FFFF', '#FFFF00', '#FF69B4'],
    artisticTraits: {
      detail: 60,
      emotion: 65,
      experimentation: 75,
      tradition: 25
    },
    preferredMediums: ['Screen printing', 'Digital art', 'Collage', 'Mixed media'],
    iconicArtists: ['Andy Warhol', 'Roy Lichtenstein', 'Keith Haring'],
    description: 'Celebrates popular culture and contemporary life'
  },
  SURREALISM: {
    id: 'surrealist-octopus',
    animal: 'Octopus',
    artMovement: 'SURREALISM',
    emoji: '🐙',
    characteristics: ['Dreamlike', 'Imaginative', 'Mysterious', 'Subconscious'],
    colorPalette: ['#4B0082', '#8A2BE2', '#9400D3', '#9932CC'],
    artisticTraits: {
      detail: 70,
      emotion: 80,
      experimentation: 90,
      tradition: 30
    },
    preferredMediums: ['Oil painting', 'Collage', 'Photography', 'Film'],
    iconicArtists: ['Salvador Dalí', 'René Magritte', 'Max Ernst'],
    description: 'Explores the unconscious mind and dreamscapes'
  },
  BAROQUE: {
    id: 'baroque-lion',
    animal: 'Lion',
    artMovement: 'BAROQUE',
    emoji: '🦁',
    characteristics: ['Dramatic', 'Ornate', 'Emotional', 'Grand'],
    colorPalette: ['#8B0000', '#FFD700', '#2F4F4F', '#8B4513'],
    artisticTraits: {
      detail: 85,
      emotion: 90,
      experimentation: 40,
      tradition: 80
    },
    preferredMediums: ['Oil painting', 'Sculpture', 'Architecture'],
    iconicArtists: ['Caravaggio', 'Rembrandt', 'Bernini'],
    description: 'Loves drama, emotion, and grandeur in art'
  },
  CUBISM: {
    id: 'cubist-elephant',
    animal: 'Elephant',
    artMovement: 'CUBISM',
    emoji: '🐘',
    characteristics: ['Analytical', 'Multi-perspective', 'Geometric', 'Intellectual'],
    colorPalette: ['#A0522D', '#BC8F8F', '#F4A460', '#DEB887'],
    artisticTraits: {
      detail: 75,
      emotion: 50,
      experimentation: 85,
      tradition: 35
    },
    preferredMediums: ['Oil painting', 'Collage', 'Sculpture'],
    iconicArtists: ['Pablo Picasso', 'Georges Braque', 'Juan Gris'],
    description: 'Sees multiple perspectives and deconstructs reality'
  },
  ROMANTICISM: {
    id: 'romantic-deer',
    animal: 'Deer',
    artMovement: 'ROMANTICISM',
    emoji: '🦌',
    characteristics: ['Emotional', 'Nature-loving', 'Idealistic', 'Passionate'],
    colorPalette: ['#FF6347', '#CD5C5C', '#DC143C', '#B22222'],
    artisticTraits: {
      detail: 65,
      emotion: 95,
      experimentation: 50,
      tradition: 60
    },
    preferredMediums: ['Oil painting', 'Watercolor', 'Poetry', 'Music'],
    iconicArtists: ['Caspar David Friedrich', 'William Turner', 'Delacroix'],
    description: 'Seeks emotional depth and connection with nature'
  },
  MODERNISM: {
    id: 'modernist-wolf',
    animal: 'Wolf',
    artMovement: 'MODERNISM',
    emoji: '🐺',
    characteristics: ['Progressive', 'Independent', 'Innovative', 'Questioning'],
    colorPalette: ['#2E4053', '#34495E', '#5D6D7E', '#85929E'],
    artisticTraits: {
      detail: 55,
      emotion: 60,
      experimentation: 80,
      tradition: 20
    },
    preferredMediums: ['Mixed media', 'Photography', 'Film', 'Performance'],
    iconicArtists: ['Georgia O\'Keeffe', 'Edward Hopper', 'Frida Kahlo'],
    description: 'Challenges conventions and embraces new forms'
  },
  CONTEMPORARY: {
    id: 'contemporary-chameleon',
    animal: 'Chameleon',
    artMovement: 'CONTEMPORARY',
    emoji: '🦎',
    characteristics: ['Adaptive', 'Diverse', 'Socially-aware', 'Multimedia'],
    colorPalette: ['#00BCD4', '#E91E63', '#FFC107', '#4CAF50'],
    artisticTraits: {
      detail: 50,
      emotion: 70,
      experimentation: 90,
      tradition: 10
    },
    preferredMediums: ['Digital art', 'Installation', 'Video', 'NFTs'],
    iconicArtists: ['Banksy', 'Yayoi Kusama', 'Jeff Koons'],
    description: 'Embraces current issues and new technologies'
  },
  EXPRESSIONISM: {
    id: 'expressionist-eagle',
    animal: 'Eagle',
    artMovement: 'EXPRESSIONISM',
    emoji: '🦅',
    characteristics: ['Intense', 'Emotional', 'Raw', 'Personal'],
    colorPalette: ['#FF4500', '#FF8C00', '#FF6347', '#DC143C'],
    artisticTraits: {
      detail: 45,
      emotion: 100,
      experimentation: 70,
      tradition: 30
    },
    preferredMediums: ['Oil painting', 'Woodcut', 'Lithography'],
    iconicArtists: ['Edvard Munch', 'Egon Schiele', 'Ernst Ludwig Kirchner'],
    description: 'Expresses raw emotion and inner turmoil'
  },
  REALISM: {
    id: 'realist-horse',
    animal: 'Horse',
    artMovement: 'REALISM',
    emoji: '🐴',
    characteristics: ['Observant', 'Truthful', 'Detailed', 'Social-conscious'],
    colorPalette: ['#8B7355', '#A0522D', '#BC8F8F', '#CD853F'],
    artisticTraits: {
      detail: 90,
      emotion: 55,
      experimentation: 25,
      tradition: 70
    },
    preferredMediums: ['Oil painting', 'Drawing', 'Photography'],
    iconicArtists: ['Gustave Courbet', 'Jean-François Millet', 'Ilya Repin'],
    description: 'Depicts life as it truly is, without idealization'
  },
  ART_NOUVEAU: {
    id: 'artnouveau-butterfly',
    animal: 'Butterfly',
    artMovement: 'ART_NOUVEAU',
    emoji: '🦋',
    characteristics: ['Organic', 'Decorative', 'Flowing', 'Nature-inspired'],
    colorPalette: ['#9ACD32', '#6B8E23', '#BDB76B', '#F0E68C'],
    artisticTraits: {
      detail: 80,
      emotion: 70,
      experimentation: 60,
      tradition: 50
    },
    preferredMediums: ['Decorative arts', 'Architecture', 'Jewelry', 'Poster'],
    iconicArtists: ['Gustav Klimt', 'Alphonse Mucha', 'Antoni Gaudí'],
    description: 'Finds beauty in natural forms and flowing lines'
  },
  DADA: {
    id: 'dada-monkey',
    animal: 'Monkey',
    artMovement: 'DADA',
    emoji: '🐵',
    characteristics: ['Rebellious', 'Absurd', 'Anti-art', 'Provocative'],
    colorPalette: ['#000000', '#FFFFFF', '#FF0000', '#0000FF'],
    artisticTraits: {
      detail: 20,
      emotion: 60,
      experimentation: 100,
      tradition: 0
    },
    preferredMediums: ['Ready-mades', 'Collage', 'Performance', 'Photomontage'],
    iconicArtists: ['Marcel Duchamp', 'Hannah Höch', 'Tristan Tzara'],
    description: 'Questions the very nature of art itself'
  },
  FUTURISM: {
    id: 'futurist-cheetah',
    animal: 'Cheetah',
    artMovement: 'FUTURISM',
    emoji: '🐆',
    characteristics: ['Dynamic', 'Speed-obsessed', 'Technology-loving', 'Revolutionary'],
    colorPalette: ['#1E90FF', '#00CED1', '#00BFFF', '#4682B4'],
    artisticTraits: {
      detail: 40,
      emotion: 75,
      experimentation: 85,
      tradition: 10
    },
    preferredMediums: ['Painting', 'Sculpture', 'Architecture', 'Performance'],
    iconicArtists: ['Umberto Boccioni', 'Giacomo Balla', 'Filippo Marinetti'],
    description: 'Celebrates speed, technology, and the future'
  }
};

// Matching function from existing personality type to art movement
export function mapPersonalityToArtMovement(personalityType: string): ArtMovement {
  const mappings: Record<string, ArtMovement> = {
    'LAEF': 'IMPRESSIONISM', // Fox - already impressionist
    'LAEC': 'ART_NOUVEAU', // Cat - decorative and flowing
    'LAMF': 'SURREALISM', // Owl - mysterious and deep
    'LAMC': 'RENAISSANCE', // Turtle - traditional and thoughtful
    'LREF': 'CONTEMPORARY', // Chameleon - adaptive
    'LREC': 'ROMANTICISM', // Hedgehog - sensitive
    'LRMF': 'ABSTRACT', // Octopus - already surrealist/abstract
    'LRMC': 'REALISM', // Beaver - detail-oriented
    'SAEF': 'ART_NOUVEAU', // Butterfly - already art nouveau
    'SAEC': 'POP_ART', // Penguin - social and trendy
    'SAMF': 'FUTURISM', // Parrot - dynamic and expressive
    'SAMC': 'ROMANTICISM', // Deer - already romantic
    'SREF': 'POP_ART', // Dog - enthusiastic and popular
    'SREC': 'IMPRESSIONISM', // Duck - warm and emotional
    'SRMF': 'MODERNISM', // Elephant - knowledgeable and progressive
    'SRMC': 'EXPRESSIONISM' // Eagle - already expressionist
  };
  
  return mappings[personalityType] || 'CONTEMPORARY';
}