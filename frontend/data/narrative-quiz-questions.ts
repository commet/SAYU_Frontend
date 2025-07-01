// 🎨 SAYU Narrative Quiz - A Personal Gallery Journey

export interface NarrativeQuestion {
  id: number;
  act: 'curiosity' | 'exploration' | 'revelation';
  narrative: {
    setup: string;
    setup_ko?: string;
    transition?: string;
    transition_ko?: string;
    atmosphere?: string;
  };
  question: string;
  question_ko?: string;
  options: Array<{
    id: string;
    text: string;
    text_ko?: string;
    subtext?: string;
    subtext_ko?: string;
    weight: Record<string, number>;
    narrative: string;
    emotional: string;
  }>;
}

export const narrativeQuestions: NarrativeQuestion[] = [
  // Act 1: Curiosity - Entering the Space (Questions 1-5)
  {
    id: 1,
    act: 'curiosity',
    narrative: {
      setup: "You receive an invitation to a mysterious gallery opening. The envelope is sealed with burgundy wax, and inside, the card simply reads: 'Your presence is requested for a journey of discovery.'",
      setup_ko: "신비로운 갤러리 오프닝 초대장을 받았습니다. 버건디색 밀랍으로 봉인된 봉투 안에는 '발견의 여정을 위해 당신을 초대합니다'라고 적혀 있습니다.",
      atmosphere: "anticipation"
    },
    question: "The heavy oak doors open before you. Two paths diverge in the entrance hall...",
    question_ko: "무거운 참나무 문이 당신 앞에 열립니다. 입구 홀에서 두 갈래의 길이 나뉩니다...",
    options: [
      {
        id: 'solitary',
        text: "A quiet corridor bathed in morning light",
        text_ko: "아침 햇살이 비추는 조용한 복도",
        subtext: "You can hear your own footsteps echoing softly",
        subtext_ko: "당신의 발자국 소리가 부드럽게 메아리칩니다",
        weight: { L: 3 },
        narrative: "You choose solitude, drawn to the peaceful promise of undisturbed contemplation.",
        emotional: "introspective"
      },
      {
        id: 'social',
        text: "A bustling atrium with voices and laughter",
        text_ko: "목소리와 웃음소리로 가득한 북적이는 아트리움",
        subtext: "Other visitors move in animated conversation",
        subtext_ko: "다른 방문객들이 활기찬 대화를 나누며 움직입니다",
        weight: { S: 3 },
        narrative: "You're energized by the collective excitement, eager to share this journey.",
        emotional: "connected"
      }
    ]
  },
  {
    id: 2,
    act: 'curiosity',
    narrative: {
      transition: "As you move deeper into the gallery, the walls seem to breathe with artistic energy.",
      atmosphere: "wonder"
    },
    question: "A curator in a velvet jacket approaches. Their eyes hold centuries of art wisdom...",
    options: [
      {
        id: 'intuitive',
        text: "Please, let me wander and discover on my own",
        subtext: "You prefer to let the art speak directly to your soul",
        weight: { F: 3 },
        narrative: "The curator nods knowingly, 'Some journeys are meant to be unguided.'",
        emotional: "free"
      },
      {
        id: 'structured',
        text: "I'd love to hear about the exhibition's design",
        subtext: "You appreciate understanding the curator's vision",
        weight: { C: 3 },
        narrative: "Their face lights up as they begin to share the careful choreography of the collection.",
        emotional: "grounded"
      }
    ]
  },
  {
    id: 3,
    act: 'curiosity',
    narrative: {
      transition: "The first room beckons. As you cross the threshold, the atmosphere shifts palpably.",
      atmosphere: "threshold"
    },
    question: "The gallery's first chamber reveals itself. What captures your attention?",
    options: [
      {
        id: 'atmosphere',
        text: "The room's emotional atmosphere washes over me",
        subtext: "Colors and light create an almost tangible mood",
        weight: { A: 3, E: 1 },
        narrative: "You breathe deeply, letting the space's energy fill your lungs and lift your spirit.",
        emotional: "absorbed"
      },
      {
        id: 'details',
        text: "A specific painting's intricate brushwork draws me close",
        subtext: "You notice techniques and textures others might miss",
        weight: { R: 3, M: 1 },
        narrative: "Your eyes trace each deliberate stroke, marveling at the artist's technical mastery.",
        emotional: "focused"
      }
    ]
  },

  // Act 2: Exploration - Deepening Experience
  {
    id: 4,
    act: 'exploration',
    narrative: {
      transition: "Time seems to slow as you find your rhythm in the gallery's flow.",
      atmosphere: "immersion"
    },
    question: "A painting stops you in your tracks. It's as if it was waiting for you...",
    options: [
      {
        id: 'emotional',
        text: "Tears threaten to form - it touches something deep",
        subtext: "The artwork resonates with an unnamed feeling",
        weight: { E: 3, A: 1 },
        narrative: "You stand transfixed, feeling seen by something that has no eyes.",
        emotional: "moved"
      },
      {
        id: 'analytical',
        text: "You step back to decode its symbolic language",
        subtext: "There's meaning here to be uncovered",
        weight: { M: 3, R: 1 },
        narrative: "Your mind becomes a key, unlocking layers of intentional meaning.",
        emotional: "enlightened"
      }
    ]
  },
  {
    id: 5,
    act: 'exploration',
    narrative: {
      transition: "In a sunlit alcove, you discover a series of works that seem to tell a story.",
      atmosphere: "discovery"
    },
    question: "Time has become elastic. How do you navigate this temporal gallery dance?",
    options: [
      {
        id: 'flowing',
        text: "Let intuition guide me from piece to piece",
        subtext: "Each artwork calls to the next in an organic flow",
        weight: { F: 3, A: 1 },
        narrative: "You become a leaf on an artistic stream, trusting the current completely.",
        emotional: "surrendered"
      },
      {
        id: 'methodical',
        text: "Move systematically through each room",
        subtext: "Ensuring no masterpiece goes unseen",
        weight: { C: 3, R: 1 },
        narrative: "Your careful progression reveals the curator's hidden narrative arc.",
        emotional: "complete"
      }
    ]
  },
  {
    id: 6,
    act: 'exploration',
    narrative: {
      transition: "Another visitor stands beside you, drawn to the same magnetic piece.",
      atmosphere: "connection"
    },
    question: "A stranger's presence enters your artistic bubble. The moment asks for a choice...",
    options: [
      {
        id: 'preserve',
        text: "You maintain your private communion with the art",
        subtext: "Some experiences are too personal to share",
        weight: { L: 3, E: 1 },
        narrative: "You close your eyes briefly, holding the moment like a secret.",
        emotional: "protected"
      },
      {
        id: 'share',
        text: "You exchange a knowing glance and begin to speak",
        subtext: "Shared wonder doubles the joy",
        weight: { S: 3, M: 1 },
        narrative: "Your perspectives interweave, creating a richer tapestry of understanding.",
        emotional: "expanded"
      }
    ]
  },
  {
    id: 7,
    act: 'exploration',
    narrative: {
      transition: "The gallery seems to be revealing itself to you, layer by layer.",
      atmosphere: "depth"
    },
    question: "An experimental installation challenges your perception. How do you engage?",
    options: [
      {
        id: 'immerse',
        text: "Surrender to the sensory experience",
        subtext: "Let it wash over you without trying to understand",
        weight: { A: 3, F: 1 },
        narrative: "You become part of the artwork, your presence completing its purpose.",
        emotional: "transformed"
      },
      {
        id: 'analyze',
        text: "Circle it slowly, understanding its construction",
        subtext: "Appreciating the artist's technical achievement",
        weight: { R: 3, C: 1 },
        narrative: "Each angle reveals new insights into the artist's methodical genius.",
        emotional: "impressed"
      }
    ]
  },

  // Act 3: Revelation - Self-Discovery (Questions 8-10)
  {
    id: 8,
    act: 'revelation',
    narrative: {
      transition: "You've reached the gallery's heart. The final room awaits.",
      atmosphere: "anticipation"
    },
    question: "In the last room, a mirror-like installation reflects not your face, but your artistic soul...",
    options: [
      {
        id: 'abstract',
        text: "You see swirling colors and emotions",
        subtext: "Your reflection is pure feeling and energy",
        weight: { A: 3, E: 2 },
        narrative: "The mirror shows your inner landscape - beautiful, complex, ever-changing.",
        emotional: "recognized"
      },
      {
        id: 'concrete',
        text: "You see precise patterns and clear forms",
        subtext: "Your reflection reveals structure and clarity",
        weight: { R: 3, M: 2 },
        narrative: "The mirror reflects your mind's architecture - organized, purposeful, strong.",
        emotional: "understood"
      }
    ]
  },
  {
    id: 9,
    act: 'revelation',
    narrative: {
      transition: "The journey nears its end, but something has fundamentally shifted within you.",
      atmosphere: "transformation"
    },
    question: "As you prepare to leave, you realize what you've been seeking all along...",
    options: [
      {
        id: 'connection',
        text: "A deeper connection to your own emotions",
        subtext: "Art as a mirror to your inner world",
        weight: { E: 3, L: 1 },
        narrative: "You've found a language for feelings you couldn't name before.",
        emotional: "whole"
      },
      {
        id: 'understanding',
        text: "A framework for understanding beauty",
        subtext: "Art as a system to be comprehended",
        weight: { M: 3, S: 1 },
        narrative: "You've discovered the keys to a vast kingdom of meaning.",
        emotional: "empowered"
      }
    ]
  },
  {
    id: 10,
    act: 'revelation',
    narrative: {
      transition: "At the exit, a guest book lies open. Your hand hovers over the page.",
      atmosphere: "reflection"
    },
    question: "What will you carry with you from this gallery of the soul?",
    options: [
      {
        id: 'fluid',
        text: "The freedom to experience art without boundaries",
        subtext: "Each encounter will be a new adventure",
        weight: { F: 3, A: 1, L: 1 },
        narrative: "You write: 'I came seeking art, but found myself in every frame.'",
        emotional: "liberated"
      },
      {
        id: 'structured',
        text: "A deeper appreciation for artistic craft and intention",
        subtext: "Each piece now speaks in a language you understand",
        weight: { C: 3, R: 1, S: 1 },
        narrative: "You write: 'I leave with eyes that see not just beauty, but the hands that shaped it.'",
        emotional: "enriched"
      }
    ]
  },

  // Additional Questions for Deeper Insight (Questions 11-15)
  {
    id: 11,
    act: 'exploration',
    narrative: {
      transition: "In the contemporary wing, you encounter an artist statement on the wall.",
      atmosphere: "curiosity"
    },
    question: "What draws you most to understanding an artist?",
    options: [
      {
        id: 'life-story',
        text: "Their personal journey and struggles",
        subtext: "How their life shaped their vision",
        weight: { E: 2, S: 1 },
        narrative: "You believe art is inseparable from the human story behind it.",
        emotional: "empathetic"
      },
      {
        id: 'technique',
        text: "Their methods and innovations",
        subtext: "How they pushed boundaries of their medium",
        weight: { M: 2, R: 1 },
        narrative: "You're fascinated by the mastery and craft behind creation.",
        emotional: "appreciative"
      }
    ]
  },
  {
    id: 12,
    act: 'exploration',
    narrative: {
      transition: "You pause before choosing between two exhibitions.",
      atmosphere: "decision"
    },
    question: "Which exhibition calls to you more strongly?",
    options: [
      {
        id: 'contemporary',
        text: "Emerging Voices: New perspectives in art",
        subtext: "Fresh, experimental, challenging conventions",
        weight: { F: 2, A: 1 },
        narrative: "You're drawn to the cutting edge, where art is still being defined.",
        emotional: "adventurous"
      },
      {
        id: 'classical',
        text: "Masters Revisited: Timeless beauty revealed",
        subtext: "Proven greatness, historical significance",
        weight: { C: 2, R: 1 },
        narrative: "You seek the wisdom and beauty that has stood the test of time.",
        emotional: "reverent"
      }
    ]
  },
  {
    id: 13,
    act: 'revelation',
    narrative: {
      transition: "In the museum gift shop, you're drawn to take something home.",
      atmosphere: "memory"
    },
    question: "What kind of art would you want in your personal space?",
    options: [
      {
        id: 'emotional-abstract',
        text: "Something that evokes a feeling",
        subtext: "A piece that changes meaning with your mood",
        weight: { A: 2, E: 2 },
        narrative: "You want art that converses with your emotional states.",
        emotional: "resonant"
      },
      {
        id: 'meaningful-concrete',
        text: "Something with a clear story or message",
        subtext: "A piece that speaks to specific ideas",
        weight: { R: 2, M: 2 },
        narrative: "You want art that enriches your understanding of the world.",
        emotional: "thoughtful"
      }
    ]
  },
  {
    id: 14,
    act: 'revelation',
    narrative: {
      transition: "As you step outside, the city looks different somehow.",
      atmosphere: "integration"
    },
    question: "How does art fit into your everyday life?",
    options: [
      {
        id: 'essential',
        text: "It's the lens through which I see everything",
        subtext: "Beauty and meaning are everywhere",
        weight: { A: 1, E: 1, F: 1 },
        narrative: "Art isn't separate from life - it IS life, seen clearly.",
        emotional: "integrated"
      },
      {
        id: 'sanctuary',
        text: "It's my escape and my sanctuary",
        subtext: "A special realm I visit for renewal",
        weight: { L: 1, C: 1, M: 1 },
        narrative: "Art is your sacred space, distinct from daily routine.",
        emotional: "renewed"
      }
    ]
  },
  {
    id: 15,
    act: 'revelation',
    narrative: {
      transition: "Walking away, you realize this journey has changed something fundamental.",
      atmosphere: "transformation"
    },
    question: "What kind of art lover have you discovered yourself to be?",
    options: [
      {
        id: 'seeker',
        text: "An eternal seeker of new experiences",
        subtext: "Always searching for the next revelation",
        weight: { F: 2, S: 1, A: 1 },
        narrative: "Your artistic journey has just begun - infinite discoveries await.",
        emotional: "excited"
      },
      {
        id: 'cultivator',
        text: "A patient cultivator of deep appreciation",
        subtext: "Building lasting relationships with art",
        weight: { C: 2, L: 1, R: 1 },
        narrative: "You'll return to favorites, finding new depths each time.",
        emotional: "grounded"
      }
    ]
  }
];

// Personalized transitions based on previous choices
export const getPersonalizedTransition = (
  fromQuestion: number,
  toQuestion: number,
  previousChoice: string
): string => {
  const transitions: Record<string, string> = {
    'solitary-2': "In your chosen solitude, each step echoes with purpose...",
    'social-2': "Energized by the crowd's enthusiasm, you move forward...",
    'intuitive-3': "Trusting your instincts, you drift toward a doorway that seems to call...",
    'structured-3': "Following the curator's suggested path, you approach the first chamber...",
    'atmosphere-4': "Still wrapped in that emotional atmosphere, you float deeper into the gallery...",
    'details-4': "Your attention to detail rewards you as you discover more treasures...",
    'emotional-5': "Your heart still resonating from that encounter, you continue...",
    'analytical-5': "Your mind buzzing with insights, you seek the next puzzle...",
    'flowing-6': "Your intuitive journey brings an unexpected companion...",
    'methodical-6': "Your systematic exploration is noticed by another careful observer...",
    'preserve-7': "In your protected bubble of experience, you encounter something new...",
    'share-7': "Enriched by shared perspectives, you both discover something challenging...",
    'immerse-8': "Still tingling from that sensory experience, you reach the final space...",
    'analyze-8': "Your technical appreciation has prepared you for this culmination...",
    'abstract-9': "Seeing your emotional truth reflected, you understand your journey...",
    'concrete-9': "Your structured soul recognized, the path becomes clear...",
    'connection-10': "With emotions now given form and name, one gesture remains...",
    'understanding-10': "Armed with new frameworks of beauty, you approach the end...",
    'fluid-11': "Your free spirit leads you to explore more corners of this vast world...",
    'structured-11': "Your systematic approach reveals new layers to explore...",
    'life-story-12': "Understanding the human element, you seek more connections...",
    'technique-12': "Appreciating the craft, you look for more innovation...",
    'contemporary-13': "The fresh perspectives have opened your eyes to new possibilities...",
    'classical-13': "The timeless beauty has grounded you in artistic tradition...",
    'emotional-abstract-14': "Your choice reflects the fluid nature of your artistic soul...",
    'meaningful-concrete-14': "Your selection shows how you value clarity and purpose...",
    'essential-15': "Art as life itself - this understanding transforms everything...",
    'sanctuary-15': "Art as sacred space - this recognition completes your journey..."
  };

  const key = `${previousChoice}-${toQuestion}`;
  return transitions[key] || "You continue your journey through the gallery...";
};

// Encouraging feedback messages
export const encouragingFeedback = [
  "Your unique perspective is revealing itself beautifully.",
  "There's no wrong way to experience art - you're proving that.",
  "Your artistic soul is beginning to shine through.",
  "Each choice paints another stroke of who you are.",
  "You're not just viewing art - you're discovering yourself.",
  "Your journey is as unique as a fingerprint on canvas.",
  "The gallery seems to be responding to your presence.",
  "You're writing your own story through these halls.",
  "Your authentic responses are creating something beautiful.",
  "This is your masterpiece of self-discovery."
];