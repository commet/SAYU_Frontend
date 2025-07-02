// 🎨 SAYU Narrative Quiz - A Personal Gallery Journey
// 개선된 한글 번역 버전

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
      setup_ko: "신비로운 갤러리 오프닝 초대장이 도착했습니다. 짙은 와인빛 밀랍으로 봉인된 봉투 안, 카드에는 단지 이렇게 적혀 있습니다: '발견의 여정에 당신을 초대합니다.'",
      atmosphere: "anticipation"
    },
    question: "The heavy oak doors open before you.\nTwo paths diverge in the entrance hall...",
    question_ko: "묵직한 참나무 문이 열립니다.\n입구에서 두 갈래 길이 나타납니다...",
    options: [
      {
        id: 'solitary',
        text: "A quiet corridor bathed in morning light",
        text_ko: "아침 햇살이 스며든 고요한 복도",
        subtext: "You can hear your own footsteps echoing softly",
        subtext_ko: "발걸음 소리가 부드럽게 울려 퍼집니다",
        weight: { L: 3 },
        narrative: "You choose solitude, drawn to the peaceful promise of undisturbed contemplation.",
        emotional: "introspective"
      },
      {
        id: 'social',
        text: "A bustling atrium with voices and laughter",
        text_ko: "웃음소리와 대화로 활기찬 중앙 홀",
        subtext: "Other visitors move in animated conversation",
        subtext_ko: "다른 관람객들이 생동감 있게 대화를 나눕니다",
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
      transition_ko: "갤러리 깊숙이 들어서자, 벽들이 예술적 에너지로 숨 쉬는 듯합니다.",
      atmosphere: "wonder"
    },
    question: "A curator in a velvet jacket approaches.\nTheir eyes hold centuries of art wisdom...",
    question_ko: "벨벳 재킷의 큐레이터가 다가옵니다.\n그의 눈빛엔 오랜 예술의 지혜가 담겨 있습니다...",
    options: [
      {
        id: 'intuitive',
        text: "Please, let me wander and discover on my own",
        text_ko: "혼자서 천천히 둘러보고 싶어요",
        subtext: "You prefer to let the art speak directly to your soul",
        subtext_ko: "작품이 영혼에 직접 말을 걸기를 바랍니다",
        weight: { F: 3 },
        narrative: "The curator nods knowingly, 'Some journeys are meant to be unguided.'",
        emotional: "free"
      },
      {
        id: 'structured',
        text: "I'd love to hear about the exhibition's design",
        text_ko: "전시 구성에 대해 들어보고 싶습니다",
        subtext: "You appreciate understanding the curator's vision",
        subtext_ko: "큐레이터의 시각을 이해하는 것이 중요합니다",
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
      transition_ko: "첫 번째 전시실이 손짓합니다. 문턱을 넘자 분위기가 확연히 달라집니다.",
      atmosphere: "threshold"
    },
    question: "The gallery's first chamber reveals itself.\nWhat captures your attention?",
    question_ko: "갤러리의 첫 전시실이 모습을 드러냅니다.\n무엇이 먼저 눈에 들어오나요?",
    options: [
      {
        id: 'atmosphere',
        text: "The room's emotional atmosphere washes over me",
        text_ko: "공간 전체의 정서적 분위기에 젖어듭니다",
        subtext: "Colors and light create an almost tangible mood",
        subtext_ko: "색과 빛이 만들어내는 분위기가 손에 잡힐 듯합니다",
        weight: { A: 3, E: 1 },
        narrative: "You breathe deeply, letting the space's energy fill your lungs and lift your spirit.",
        emotional: "absorbed"
      },
      {
        id: 'details',
        text: "A specific painting's intricate brushwork draws me close",
        text_ko: "한 작품의 섬세한 붓질에 이끌려 다가갑니다",
        subtext: "You notice techniques and textures others might miss",
        subtext_ko: "남들이 놓칠 법한 기법과 질감을 발견합니다",
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
      transition_ko: "갤러리의 흐름 속에서 자신만의 리듬을 찾자, 시간이 느려지는 듯합니다.",
      atmosphere: "immersion"
    },
    question: "A painting stops you in your tracks.\nIt's as if it was waiting for you...",
    question_ko: "하나의 그림 앞에 발걸음이 멈춰 섭니다.\n마치 당신을 기다리고 있었던 것처럼...",
    options: [
      {
        id: 'emotional',
        text: "Tears threaten to form - it touches something deep",
        text_ko: "눈시울이 뜨거워집니다 - 마음 깊은 곳을 건드렸어요",
        subtext: "The artwork resonates with an unnamed feeling",
        subtext_ko: "이름 붙일 수 없는 감정이 작품과 공명합니다",
        weight: { E: 3, A: 1 },
        narrative: "You stand transfixed, feeling seen by something that has no eyes.",
        emotional: "moved"
      },
      {
        id: 'analytical',
        text: "You step back to decode its symbolic language",
        text_ko: "한 걸음 물러서서 작품의 상징을 읽어냅니다",
        subtext: "There's meaning here to be uncovered",
        subtext_ko: "여기엔 발견해야 할 의미가 숨어 있습니다",
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
      transition_ko: "햇살이 비치는 작은 공간에서 하나의 이야기를 들려주는 연작을 발견합니다.",
      atmosphere: "discovery"
    },
    question: "Time has become elastic.\nHow do you navigate this temporal gallery dance?",
    question_ko: "시간의 흐름이 달라졌습니다.\n이 갤러리에서 어떻게 움직이시겠어요?",
    options: [
      {
        id: 'flowing',
        text: "Let intuition guide me from piece to piece",
        text_ko: "직감을 따라 자유롭게 작품을 둘러봅니다",
        subtext: "Each artwork calls to the next in an organic flow",
        subtext_ko: "작품들이 자연스럽게 다음을 향해 이끕니다",
        weight: { F: 3, A: 1 },
        narrative: "You become a leaf on an artistic stream, trusting the current completely.",
        emotional: "surrendered"
      },
      {
        id: 'methodical',
        text: "Move systematically through each room",
        text_ko: "전시실을 차례대로 꼼꼼히 둘러봅니다",
        subtext: "Ensuring no masterpiece goes unseen",
        subtext_ko: "어떤 작품도 놓치지 않도록 합니다",
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
      transition_ko: "같은 작품에 이끌린 또 다른 관람객이 옆에 섭니다.",
      atmosphere: "connection"
    },
    question: "A stranger's presence enters your artistic bubble.\nThe moment asks for a choice...",
    question_ko: "낯선 이가 당신의 감상 공간에 들어섭니다.\n이 순간, 어떻게 하시겠어요?",
    options: [
      {
        id: 'preserve',
        text: "You maintain your private communion with the art",
        text_ko: "작품과의 조용한 대화를 이어갑니다",
        subtext: "Some experiences are too personal to share",
        subtext_ko: "너무 개인적인 순간은 나누기 어렵습니다",
        weight: { L: 2, E: 1 },
        narrative: "You close your eyes briefly, holding the moment like a secret.",
        emotional: "protected"
      },
      {
        id: 'share',
        text: "You exchange a knowing glance and begin to speak",
        text_ko: "눈빛을 나누고 대화를 시작합니다",
        subtext: "Shared wonder doubles the joy",
        subtext_ko: "함께 느끼는 감동은 배가 됩니다",
        weight: { S: 2, M: 1 },
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
      transition_ko: "갤러리가 한 겹씩 자신을 드러내는 듯합니다.",
      atmosphere: "depth"
    },
    question: "An experimental installation challenges your perception.\nHow do you engage?",
    question_ko: "실험적인 설치 작품이 인식의 경계를 시험합니다.\n어떻게 받아들이시겠어요?",
    options: [
      {
        id: 'immerse',
        text: "Surrender to the sensory experience",
        text_ko: "감각적 경험에 온전히 몸을 맡깁니다",
        subtext: "Let it wash over you without trying to understand",
        subtext_ko: "이해하려 애쓰지 않고 그저 받아들입니다",
        weight: { A: 3, F: 1 },
        narrative: "You become part of the artwork, your presence completing its purpose.",
        emotional: "transformed"
      },
      {
        id: 'analyze',
        text: "Circle it slowly, understanding its construction",
        text_ko: "천천히 돌며 작품의 구조를 파악합니다",
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
      transition_ko: "갤러리의 중심부에 도착했습니다. 마지막 전시실이 기다립니다.",
      atmosphere: "anticipation"
    },
    question: "In the last room, a mirror-like installation reflects not your face, but your artistic soul...",
    question_ko: "마지막 방의 거울 같은 설치 작품은 얼굴이 아닌 당신의 예술적 영혼을 비춥니다...",
    options: [
      {
        id: 'abstract',
        text: "You see swirling colors and emotions",
        text_ko: "소용돌이치는 색채와 감정이 보입니다",
        subtext: "Your reflection is pure feeling and energy",
        subtext_ko: "순수한 느낌과 에너지가 반사됩니다",
        weight: { A: 3, E: 2 },
        narrative: "The mirror shows your inner landscape - beautiful, complex, ever-changing.",
        emotional: "recognized"
      },
      {
        id: 'concrete',
        text: "You see precise patterns and clear forms",
        text_ko: "정확한 패턴과 명확한 형태가 보입니다",
        subtext: "Your reflection reveals structure and clarity",
        subtext_ko: "구조와 명료함이 드러납니다",
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
      transition_ko: "여정이 끝나가지만, 내면에서 무언가 근본적인 변화가 일어났습니다.",
      atmosphere: "transformation"
    },
    question: "As you prepare to leave, you realize what you've been seeking all along...",
    question_ko: "떠날 준비를 하며, 처음부터 찾고 있던 것이 무엇인지 깨닫습니다...",
    options: [
      {
        id: 'connection',
        text: "A deeper connection to your own emotions",
        text_ko: "내 감정과의 더 깊은 연결",
        subtext: "Art as a mirror to your inner world",
        subtext_ko: "내면을 비추는 거울로서의 예술",
        weight: { E: 3, L: 1 },
        narrative: "You've found a language for feelings you couldn't name before.",
        emotional: "whole"
      },
      {
        id: 'understanding',
        text: "A framework for understanding beauty",
        text_ko: "아름다움을 이해하는 틀",
        subtext: "Art as a system to be comprehended",
        subtext_ko: "이해할 수 있는 체계로서의 예술",
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
      transition_ko: "출구에 방명록이 펼쳐져 있습니다. 펜을 든 손이 잠시 머뭇거립니다.",
      atmosphere: "reflection"
    },
    question: "What will you carry with you from this gallery of the soul?",
    question_ko: "영혼의 갤러리에서 무엇을 가지고 돌아가시겠어요?",
    options: [
      {
        id: 'fluid',
        text: "The freedom to experience art without boundaries",
        text_ko: "경계 없이 예술을 경험하는 자유",
        subtext: "Each encounter will be a new adventure",
        subtext_ko: "모든 만남이 새로운 모험이 될 것입니다",
        weight: { F: 3, A: 1, L: 1 },
        narrative: "You write: 'I came seeking art, but found myself in every frame.'",
        emotional: "liberated"
      },
      {
        id: 'structured',
        text: "A deeper appreciation for artistic craft and intention",
        text_ko: "예술적 기법과 의도에 대한 깊은 이해",
        subtext: "Each piece now speaks in a language you understand",
        subtext_ko: "이제 모든 작품이 이해할 수 있는 언어로 말합니다",
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
    question_ko: "작가를 이해할 때 무엇이 가장 중요한가요?",
    options: [
      {
        id: 'life-story',
        text: "Their personal journey and struggles",
        text_ko: "작가의 개인적 여정과 고민",
        subtext: "How their life shaped their vision",
        subtext_ko: "삶이 어떻게 시각을 형성했는지",
        weight: { E: 2, S: 1 },
        narrative: "You believe art is inseparable from the human story behind it.",
        emotional: "empathetic"
      },
      {
        id: 'technique',
        text: "Their methods and innovations",
        text_ko: "작가의 기법과 혁신",
        subtext: "How they pushed boundaries of their medium",
        subtext_ko: "매체의 한계를 어떻게 넓혔는지",
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
    question_ko: "어떤 전시가 더 끌리나요?",
    options: [
      {
        id: 'contemporary',
        text: "Emerging Voices: New perspectives in art",
        text_ko: "신진 작가전: 예술의 새로운 시각",
        subtext: "Fresh, experimental, challenging conventions",
        subtext_ko: "신선하고 실험적이며 관습에 도전하는",
        weight: { F: 2, A: 1 },
        narrative: "You're drawn to the cutting edge, where art is still being defined.",
        emotional: "adventurous"
      },
      {
        id: 'classical',
        text: "Masters Revisited: Timeless beauty revealed",
        text_ko: "거장 재조명: 시대를 초월한 아름다움",
        subtext: "Proven greatness, historical significance",
        subtext_ko: "검증된 위대함과 역사적 의미",
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
      transition_ko: "일상의 공간으로 돌아와, 예술이 환경을 어떻게 바꿀 수 있을지 상상해 봅니다.",
      atmosphere: "memory"
    },
    question: "What kind of art would you want in your personal space?",
    question_ko: "당신의 공간에는 어떤 예술 작품을 두고 싶나요?",
    options: [
      {
        id: 'emotional-abstract',
        text: "Something that evokes a feeling",
        text_ko: "감정을 불러일으키는 작품",
        subtext: "A piece that changes meaning with your mood",
        subtext_ko: "기분에 따라 의미가 달라지는 작품",
        weight: { A: 2, E: 2 },
        narrative: "You want art that converses with your emotional states.",
        emotional: "resonant"
      },
      {
        id: 'meaningful-concrete',
        text: "Something with a clear story or message",
        text_ko: "명확한 이야기나 메시지가 있는 작품",
        subtext: "A piece that speaks to specific ideas",
        subtext_ko: "특정한 생각을 전달하는 작품",
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
      transition_ko: "일상 속에서 예상치 못한 곳에서 예술적 아름다움을 발견합니다.",
      atmosphere: "integration"
    },
    question: "How does art fit into your everyday life?",
    question_ko: "예술은 당신의 일상에 어떻게 자리하고 있나요?",
    options: [
      {
        id: 'essential',
        text: "It's the lens through which I see everything",
        text_ko: "모든 것을 바라보는 렌즈입니다",
        subtext: "Beauty and meaning are everywhere",
        subtext_ko: "아름다움과 의미는 어디에나 있습니다",
        weight: { A: 1, E: 1, F: 1 },
        narrative: "Art isn't separate from life - it IS life, seen clearly.",
        emotional: "integrated"
      },
      {
        id: 'sanctuary',
        text: "It's my escape and my sanctuary",
        text_ko: "나만의 도피처이자 안식처입니다",
        subtext: "A special realm I visit for renewal",
        subtext_ko: "재충전을 위해 찾는 특별한 영역입니다",
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
      transition_ko: "집에서 여정을 되돌아보며, 이 경험이 무언가 근본적인 것을 바꿨음을 깨닫습니다.",
      atmosphere: "transformation"
    },
    question: "What kind of art lover have you discovered yourself to be?",
    question_ko: "당신은 어떤 예술 애호가임을 발견했나요?",
    options: [
      {
        id: 'seeker',
        text: "An eternal seeker of new experiences",
        text_ko: "끊임없이 새로운 경험을 찾는 탐구자",
        subtext: "Always searching for the next revelation",
        subtext_ko: "항상 다음 발견을 기대하는",
        weight: { F: 2, S: 1, A: 1 },
        narrative: "Your artistic journey has just begun - infinite discoveries await.",
        emotional: "excited"
      },
      {
        id: 'cultivator',
        text: "A patient cultivator of deep appreciation",
        text_ko: "깊은 감상을 천천히 가꾸는 사람",
        subtext: "Building lasting relationships with art",
        subtext_ko: "예술과 오래 지속되는 관계를 만드는",
        weight: { C: 2, L: 1, R: 1 },
        narrative: "You'll return to favorites, finding new depths each time.",
        emotional: "grounded"
      }
    ]
  }
];

// 가중치 조정 제안:
// Q6의 경우 L:2로 줄여서 한 번의 선택으로 너무 강하게 분류되지 않도록 함
// 전체적으로 3점 가중치를 주요 특성에만 부여하고, 보조 특성은 1-2점으로 조정