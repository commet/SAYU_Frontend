// 🎨 SAYU Quiz Background System - Dynamic Atmosphere Progression

export interface BackgroundPhase {
  questions: number[];
  backgrounds: string[];
  ambiance: string;
  overlay: {
    color: string;
    opacity: number;
  };
}

export const backgroundProgression: Record<string, BackgroundPhase> = {
  phase1_outside: {
    questions: [1, 2],
    backgrounds: [
      '/images/backgrounds/museum-exterior-dawn.jpg',
      '/images/backgrounds/gallery-entrance-warm.jpg',
      '/images/backgrounds/museum-steps-morning.jpg'
    ],
    ambiance: 'anticipation',
    overlay: {
      color: 'from-[hsl(var(--journey-dawn-cream)/0.3)] to-[hsl(var(--journey-dawn-peach)/0.4)]',
      opacity: 0.4
    }
  },
  
  phase2_inside: {
    questions: [3, 4, 5, 6, 7],
    backgrounds: [
      '/images/backgrounds/gallery-interior-minimal.jpg',
      '/images/backgrounds/exhibition-hall-natural-light.jpg',
      '/images/backgrounds/intimate-gallery-corner.jpg',
      '/images/backgrounds/white-cube-space.jpg'
    ],
    ambiance: 'exploration',
    overlay: {
      color: 'from-[hsl(var(--journey-lavender)/0.3)] to-[hsl(var(--journey-dusty-rose)/0.4)]',
      opacity: 0.35
    }
  },
  
  phase3_deeper: {
    questions: [8, 9, 10, 11],
    backgrounds: [
      '/images/backgrounds/contemporary-wing.jpg',
      '/images/backgrounds/installation-room.jpg',
      '/images/backgrounds/sculpture-garden.jpg',
      '/images/backgrounds/video-art-space.jpg'
    ],
    ambiance: 'immersion',
    overlay: {
      color: 'from-[hsl(var(--journey-amber)/0.3)] to-[hsl(var(--journey-twilight)/0.4)]',
      opacity: 0.4
    }
  },
  
  phase4_transition: {
    questions: [12, 13],
    backgrounds: [
      '/images/backgrounds/museum-shop-cozy.jpg',
      '/images/backgrounds/gallery-bookstore.jpg',
      '/images/backgrounds/gift-shop-artistic.jpg'
    ],
    ambiance: 'reflection',
    overlay: {
      color: 'from-[hsl(var(--journey-mauve)/0.3)] to-[hsl(var(--journey-dusty-rose)/0.4)]',
      opacity: 0.35
    }
  },
  
  phase5_departure: {
    questions: [14, 15],
    backgrounds: [
      '/images/backgrounds/museum-cafe-sunset.jpg',
      '/images/backgrounds/city-street-evening.jpg',
      '/images/backgrounds/gallery-exit-twilight.jpg'
    ],
    ambiance: 'integration',
    overlay: {
      color: 'from-[hsl(var(--journey-twilight)/0.4)] to-[hsl(var(--journey-midnight)/0.5)]',
      opacity: 0.45
    }
  }
};

export const getPhaseByQuestion = (questionNumber: number): string => {
  for (const [phase, data] of Object.entries(backgroundProgression)) {
    if (data.questions.includes(questionNumber)) {
      return phase;
    }
  }
  return 'phase2_inside'; // Default fallback
};

export const getBackgroundForQuestion = (questionNumber: number): BackgroundPhase => {
  const phase = getPhaseByQuestion(questionNumber);
  return backgroundProgression[phase];
};

// Fallback gradients for when images aren't loaded
export const fallbackGradients = {
  phase1_outside: 'bg-gradient-to-br from-[hsl(var(--journey-dawn-cream))] via-[hsl(var(--journey-dawn-peach))] to-[hsl(var(--journey-dawn-blush))]',
  phase2_inside: 'bg-gradient-to-br from-[hsl(var(--journey-lavender))] via-[hsl(var(--gallery-white))] to-[hsl(var(--journey-dusty-rose))]',
  phase3_deeper: 'bg-gradient-to-br from-[hsl(var(--journey-amber))] via-[hsl(var(--journey-dusty-rose))] to-[hsl(var(--journey-mauve))]',
  phase4_transition: 'bg-gradient-to-br from-[hsl(var(--journey-mauve))] via-[hsl(var(--gallery-pearl))] to-[hsl(var(--journey-lavender))]',
  phase5_departure: 'bg-gradient-to-br from-[hsl(var(--journey-twilight))] via-[hsl(var(--journey-amber))] to-[hsl(var(--journey-midnight))]'
};

// Unsplash collection IDs for dynamic backgrounds (if using API)
export const unsplashCollections = {
  museums: '1163637', // Museums & galleries
  architecture: '1885471', // Architectural spaces
  minimalist: '778914', // Minimal interiors
  artGalleries: '2203755', // Art galleries specifically
};

// Background image requirements
export const imageRequirements = {
  dimensions: {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9'
  },
  format: ['jpg', 'webp'],
  maxSize: '500KB',
  style: [
    'Natural lighting',
    'Minimal people or empty',
    'Professional quality',
    'Warm, inviting tones',
    'Not too busy or distracting'
  ]
};