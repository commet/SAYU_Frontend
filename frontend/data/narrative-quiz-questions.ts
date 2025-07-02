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
    question: "The heavy oak doors open before you.\nTwo paths diverge in the entrance hall...",
    question_ko: "무거운 참나무 문이 당신 앞에 열립니다.\n입구 홀에서 두 갈래의 길이 나뉩니다...",
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
    question: "A curator in a velvet jacket approaches.\nTheir eyes hold centuries of art wisdom...",
    question_ko: "벨벳 재킷을 입은 큐레이터가 다가옵니다.\n그들의 눈빛에는 수 세기의 예술적 지혜가 담겨 있습니다...",
    options: [
      {
        id: 'intuitive',
        text: "Please, let me wander and discover on my own",
        text_ko: "자유롭게 돌아다니며 스스로 발견하고 싶어요",
        subtext: "You prefer to let the art speak directly to your soul",
        subtext_ko: "예술이 당신의 영혼에 직접 말하기를 원합니다",
        weight: { F: 3 },
        narrative: "The curator nods knowingly, 'Some journeys are meant to be unguided.'",
        emotional: "free"
      },
      {
        id: 'structured',
        text: "I'd love to hear about the exhibition's design",
        text_ko: "전시 구성에 대해 듣고 싶습니다",
        subtext: "You appreciate understanding the curator's vision",
        subtext_ko: "큐레이터의 비전을 이해하는 것을 소중히 여깁니다",
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
    question: "The gallery's first chamber reveals itself.\nWhat captures your attention?",
    question_ko: "갤러리의 첫 번째 전시실이 모습을 드러냅니다.\n무엇이 당신의 시선을 사로잡나요?",
    options: [
      {
        id: 'atmosphere',
        text: "The room's emotional atmosphere washes over me",
        text_ko: "공간의 감정적인 분위기가 나를 감싸안습니다",
        subtext: "Colors and light create an almost tangible mood",
        subtext_ko: "색채와 빛이 거의 만질 수 있을 듯한 분위기를 만들어냅니다",
        weight: { A: 3, E: 1 },
        narrative: "You breathe deeply, letting the space's energy fill your lungs and lift your spirit.",
        emotional: "absorbed"
      },
      {
        id: 'details',
        text: "A specific painting's intricate brushwork draws me close",
        text_ko: "특정 작품의 섬세한 붓터치가 나를 가까이 끌어당깁니다",
        subtext: "You notice techniques and textures others might miss",
        subtext_ko: "다른 사람들이 놓칠 수 있는 기법과 질감을 알아차립니다",
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
    question: "A painting stops you in your tracks.\nIt's as if it was waiting for you...",
    question_ko: "한 그림이 당신의 발걸음을 멈춥니다.\n마치 당신을 기다리고 있었던 것처럼...",
    options: [
      {
        id: 'emotional',
        text: "Tears threaten to form - it touches something deep",
        text_ko: "눈물이 맺히려 합니다 - 무언가 깊은 곳을 건드립니다",
        subtext: "The artwork resonates with an unnamed feeling",
        subtext_ko: "작품이 이름 붙일 수 없는 감정과 공명합니다",
        weight: { E: 3, A: 1 },
        narrative: "You stand transfixed, feeling seen by something that has no eyes.",
        emotional: "moved"
      },
      {
        id: 'analytical',
        text: "You step back to decode its symbolic language",
        text_ko: "한 걸음 물러서서 상징적 언어를 해독합니다",
        subtext: "There's meaning here to be uncovered",
        subtext_ko: "여기엔 발견해야 할 의미가 있습니다",
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
    question: "Time has become elastic.\nHow do you navigate this temporal gallery dance?",
    question_ko: "시간이 유연해졌습니다.\n이 시간의 갤러리 춤을 어떻게 헤쳐나가시겠습니까?",
    options: [
      {
        id: 'flowing',
        text: "Let intuition guide me from piece to piece",
        text_ko: "직관이 작품에서 작품으로 나를 이끌게 합니다",
        subtext: "Each artwork calls to the next in an organic flow",
        subtext_ko: "각 작품이 자연스러운 흐름으로 다음 작품을 부릅니다",
        weight: { F: 3, A: 1 },
        narrative: "You become a leaf on an artistic stream, trusting the current completely.",
        emotional: "surrendered"
      },
      {
        id: 'methodical',
        text: "Move systematically through each room",
        text_ko: "각 방을 체계적으로 이동합니다",
        subtext: "Ensuring no masterpiece goes unseen",
        subtext_ko: "어떤 걸작도 놓치지 않도록 합니다",
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
    question: "A stranger's presence enters your artistic bubble.\nThe moment asks for a choice...",
    question_ko: "낯선 이의 존재가 당신의 예술적 공간에 들어옵니다.\n순간이 선택을 요구합니다...",
    options: [
      {
        id: 'preserve',
        text: "You maintain your private communion with the art",
        text_ko: "작품과의 사적인 교감을 지켜냅니다",
        subtext: "Some experiences are too personal to share",
        subtext_ko: "어떤 경험은 나누기에 너무 개인적입니다",
        weight: { L: 2 },
        narrative: "You close your eyes briefly, holding the moment like a secret.",
        emotional: "protected"
      },
      {
        id: 'share',
        text: "You exchange a knowing glance and begin to speak",
        text_ko: "서로를 이해하는 눈빛을 나누고 대화를 시작합니다",
        subtext: "Shared wonder doubles the joy",
        subtext_ko: "함께 나누는 경이로움은 기쁨을 배가시킵니다",
        weight: { S: 2 },
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
    question: "An experimental installation challenges your perception.\nHow do you engage?",
    question_ko: "실험적인 설치 작품이 당신의 인식에 도전합니다.\n어떻게 마주하시겠습니까?",
    options: [
      {
        id: 'immerse',
        text: "Surrender to the sensory experience",
        text_ko: "감각적 경험에 몸을 맡깁니다",
        subtext: "Let it wash over you without trying to understand",
        subtext_ko: "이해하려 하지 않고 그대로 받아들입니다",
        weight: { A: 3, F: 1 },
        narrative: "You become part of the artwork, your presence completing its purpose.",
        emotional: "transformed"
      },
      {
        id: 'analyze',
        text: "Circle it slowly, understanding its construction",
        text_ko: "천천히 둘러보며 구조를 파악합니다",
        subtext: "Appreciating the artist's technical achievement",
        subtext_ko: "작가의 기술적 성취를 음미합니다",
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
        text_ko: "예술적 기법과 의도에 대한 더 깊은 이해",
        subtext: "Each piece now speaks in a language you understand",
        subtext_ko: "이제 각 작품이 당신이 이해하는 언어로 말을 겁니다",
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
      transition: "As you wander toward the museum shop, artistic merchandise catches your eye.",
      transition_ko: "뮤지엄 샵으로 향하던 중, 예술 상품들이 눈길을 끕니다.",
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
      transition: "In the gift shop, you contemplate which artistic memory to take with you.",
      transition_ko: "기념품 가게에서 어떤 예술적 기억을 가져갈지 고민합니다.",
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
      transition: "Back in your personal space, you imagine how art could transform your daily environment.",
      transition_ko: "당신의 개인 공간으로 돌아와, 예술이 일상 환경을 어떻게 변화시킬 수 있을지 상상합니다.",
      atmosphere: "memory"
    },
    question: "What kind of art would you want in your personal space?",
    question_ko: "당신의 개인 공간에 어떤 예술 작품을 두고 싶나요?",
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
      transition: "In your daily life, you notice artistic beauty in unexpected places.",
      transition_ko: "일상 생활 속에서 예상치 못한 곳에서 예술적 아름다움을 발견합니다.",
      atmosphere: "integration"
    },
    question: "How does art fit into your everyday life?",
    question_ko: "예술은 당신의 일상에 어떻게 스며들어 있나요?",
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
      transition: "At home, reflecting on your journey, you realize this experience has changed something fundamental.",
      transition_ko: "집에서 여정을 되돌아보며, 이 경험이 근본적인 무언가를 바꿨다는 것을 깨닫습니다.",
      atmosphere: "transformation"
    },
    question: "What kind of art lover have you discovered yourself to be?",
    question_ko: "당신은 어떤 예술 애호가임을 발견했나요?",
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
    'fluid-11': "Your free spirit guides you toward the museum shop's treasures...",
    'structured-11': "Your systematic journey leads you to the gift shop's curated collection...",
    'life-story-12': "In the shop, you seek pieces that tell human stories...",
    'technique-12': "Among the merchandise, you appreciate the craft on display...",
    'contemporary-13': "Leaving the museum, you carry fresh perspectives into your personal space...",
    'classical-13': "Taking timeless beauty with you, you envision it in your home...",
    'emotional-abstract-14': "In daily life, your fluid artistic soul finds beauty everywhere...",
    'meaningful-concrete-14': "Your everyday world becomes enriched with purpose and meaning...",
    'essential-15': "At home, you realize art has become inseparable from your life...",
    'sanctuary-15': "In your personal sanctuary, the artistic journey finds its home..."
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

export const encouragingFeedback_ko = [
  "당신만의 독특한 시각이 아름답게 드러나고 있습니다.",
  "예술을 경험하는 잘못된 방법은 없습니다 - 당신이 그걸 증명하고 있어요.",
  "당신의 예술적 영혼이 빛나기 시작합니다.",
  "각각의 선택이 당신이 누구인지 그려내고 있습니다.",
  "단순히 예술을 보는 것이 아니라 - 자신을 발견하고 있습니다.",
  "당신의 여정은 캔버스 위의 지문처럼 독특합니다.",
  "갤러리가 당신의 존재에 반응하는 것 같습니다.",
  "이 공간에서 당신만의 이야기를 써내려가고 있습니다.",
  "당신의 진솔한 반응들이 아름다운 무언가를 만들어내고 있습니다.",
  "이것은 자기 발견의 걸작입니다."
];