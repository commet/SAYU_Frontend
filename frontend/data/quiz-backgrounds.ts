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
      '/images/backgrounds/museum-entrance-columns-warm-afternoon.jpg',
      '/images/backgrounds/baroque-entrance-arch-golden-sunlight.jpg',
      '/images/backgrounds/stone-gallery-entrance-solitary-figure.jpg'
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
      '/images/backgrounds/minimal-white-gallery-photography-bright.jpg',
      '/images/backgrounds/classic-gallery-warm-lighting-seating.jpg',
      '/images/backgrounds/warm-corner-gallery-solitary-contemplation.jpg',
      '/images/backgrounds/solitary-viewing-minimal-white-meditative.jpg'
    ],
    ambiance: 'exploration',
    overlay: {
      color: 'from-[hsl(var(--journey-lavender)/0.3)] to-[hsl(var(--journey-dusty-rose)/0.4)]',
      opacity: 0.35
    }
  },
  
  phase3_deeper: {
    questions: [8, 9, 10],
    backgrounds: [
      '/images/backgrounds/contemporary-gallery-motion-blur-minimal.jpg',
      '/images/backgrounds/immersive-lantern-installation-dark-dreamlike.jpg',
      '/images/backgrounds/monumental-metal-sculpture-industrial-scale.jpg',
      '/images/backgrounds/neon-corridor-gradient-light-installation.jpg'
    ],
    ambiance: 'revelation',
    overlay: {
      color: 'from-[hsl(var(--journey-amber)/0.3)] to-[hsl(var(--journey-twilight)/0.4)]',
      opacity: 0.4
    }
  },
  
  phase4_shop: {
    questions: [11, 12],
    backgrounds: [
      '/images/backgrounds/green-wall-photography-interactive-viewing.jpg',
      '/images/backgrounds/yellow-gallery-mixed-media-playful.jpg',
      '/images/backgrounds/hidden-kiosk-ivy-wall-secret-spot.jpg'
    ],
    ambiance: 'selection',
    overlay: {
      color: 'from-[hsl(var(--journey-mauve)/0.3)] to-[hsl(var(--journey-dusty-rose)/0.4)]',
      opacity: 0.35
    }
  },
  
  phase5_personal: {
    questions: [13, 14, 15],
    backgrounds: [
      '/images/backgrounds/home-studio-abstract-art-warm-vintage.jpg',
      '/images/backgrounds/midcentury-modern-living-green-cozy.jpg',
      '/images/backgrounds/home-stairway-family-photos-guitar-warm.jpg'
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
  phase4_shop: 'bg-gradient-to-br from-[hsl(var(--journey-mauve))] via-[hsl(var(--gallery-pearl))] to-[hsl(var(--journey-lavender))]',
  phase5_personal: 'bg-gradient-to-br from-[hsl(var(--journey-twilight))] via-[hsl(var(--journey-amber))] to-[hsl(var(--journey-midnight))]'
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