// 🎨 SAYU Narrative Quiz - Enhanced Personal Gallery Journey
// 개선된 1인칭 시나리오형 퀴즈 (실제 미술관 경험 기반)

export interface NarrativeQuestion {
  id: number;
  act: 'curiosity' | 'exploration' | 'revelation';
  narrative: {
    setup?: string;
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
      setup: "You've been wanting to visit this exhibition for weeks. The museum stands before you, promising new discoveries.",
      setup_ko: "몇 주째 가보고 싶었던 전시입니다. 미술관이 새로운 발견을 약속하며 당신 앞에 서 있습니다.",
      atmosphere: "anticipation"
    },
    question: "Finally made it to the museum. It's quieter than usual.",
    question_ko: "드디어 시간을 내서 미술관에 왔다.",
    options: [
      {
        id: 'solitary',
        text: "Perfect, it's quiet. I can enjoy everything at my own pace",
        text_ko: "한산한 시간이라 다행이야.\n조용히 나만의 페이스로 볼 수 있겠어",
        weight: { L: 3 },
        narrative: "You breathe deeply, savoring the peaceful atmosphere that allows for undisturbed contemplation.",
        emotional: "peaceful"
      },
      {
        id: 'social',
        text: "Oh, more people than expected. Wonder what brought them here",
        text_ko: "오, 생각보다 사람이 많네.\n다들 뭘 보러 왔는지 궁금한걸",
        weight: { S: 3 },
        narrative: "The collective energy of fellow art lovers adds to your excitement.",
        emotional: "energized"
      }
    ]
  },
  {
    id: 2,
    act: 'curiosity',
    narrative: {
      setup: "At the information desk, they offer exhibition maps and audio guides - small devices that explain each artwork.",
      setup_ko: "안내 데스크에서 전시 지도와 오디오 가이드를 제공합니다. 작품마다 설명을 들을 수 있는 작은 기기입니다.",
      atmosphere: "preparation"
    },
    question: "How would you like to explore the exhibition?",
    question_ko: "어떻게 전시를 둘러보고 싶나요?",
    options: [
      {
        id: 'intuitive',
        text: "I'll just wander freely and follow my feelings",
        text_ko: "그냥 내 느낌대로 자유롭게 돌아다녀야지",
        weight: { F: 3, L: 1 },
        narrative: "You trust your instincts to guide you to what needs to be seen.",
        emotional: "free"
      },
      {
        id: 'structured',
        text: "The guide will help me understand everything systematically",
        text_ko: "가이드 들으면서 체계적으로 이해해야지",
        weight: { C: 3, S: 1 },
        narrative: "You appreciate having expert insights to enrich your understanding.",
        emotional: "prepared"
      }
    ]
  },
  {
    id: 3,
    act: 'curiosity',
    narrative: {
      setup: "The first exhibition room opens before you. White walls, perfect lighting, each artwork given space to breathe.",
      setup_ko: "첫 전시실이 열립니다. 하얀 벽, 완벽한 조명, 각 작품마다 숨 쉴 공간이 주어져 있습니다.",
      atmosphere: "discovery"
    },
    question: "What catches your attention first?",
    question_ko: "무엇이 먼저 눈에 들어오나요?",
    options: [
      {
        id: 'abstract-drawn',
        text: "Those colors on that large canvas... I feel pulled into them",
        text_ko: "저 큰 캔버스의 색들이...\n뭔가 빨려들 것 같아",
        weight: { A: 3, E: 1 },
        narrative: "The abstract forms speak directly to your emotions, bypassing words.",
        emotional: "mesmerized"
      },
      {
        id: 'detail-focused',
        text: "This portrait's eyes seem alive. The details are incredible",
        text_ko: "이 초상화의 눈빛이 살아있는 것 같아. 디테일이 놀라워",
        weight: { R: 3, M: 1 },
        narrative: "You appreciate the technical mastery that brings life to the canvas.",
        emotional: "impressed"
      }
    ]
  },
  {
    id: 4,
    act: 'curiosity',
    narrative: {
      setup: "You've been walking for 15 minutes. One piece suddenly stops you mid-step.",
      setup_ko: "15분쯤 둘러보던 중입니다.\n한 작품이 갑자기 발걸음을 멈추게 합니다.",
      atmosphere: "connection"
    },
    question: "What makes you stop and stare?",
    question_ko: "무엇이 당신을 멈추게 하나요?",
    options: [
      {
        id: 'emotional-impact',
        text: "I can't explain it, but something feels tight in my chest...",
        text_ko: "설명할 순 없는데 뭔가 가슴이 먹먹해져서...",
        weight: { E: 3 },
        narrative: "The artwork has touched something deep within you, beyond rational explanation.",
        emotional: "moved"
      },
      {
        id: 'meaning-seeking',
        text: "I keep thinking about what this piece is trying to say",
        text_ko: "이 작품이 말하려는 게 뭔지 계속 생각하게 돼서",
        weight: { M: 3 },
        narrative: "Your mind engages with the layers of meaning embedded in the work.",
        emotional: "intrigued"
      }
    ]
  },
  {
    id: 5,
    act: 'curiosity',
    narrative: {
      setup: "The exhibition continues upstairs. You can hear footsteps and quiet conversations from above.",
      setup_ko: "전시는 위층에도 계속됩니다. 위에서 발걸음과 조용한 대화 소리가 들려옵니다.",
      atmosphere: "exploration"
    },
    question: "The exhibition is bigger than expected. There's a second floor too...",
    question_ko: "생각보다 전시장이 넓다. 2층도 있다는데...",
    options: [
      {
        id: 'lone-wandering',
        text: "I'll explore quietly on my own route",
        text_ko: "혼자만의 동선으로 조용히 둘러봐야지",
        weight: { L: 3, F: 1 },
        narrative: "You create your own journey through the space, undisturbed and focused.",
        emotional: "independent"
      },
      {
        id: 'crowd-following',
        text: "I'll start with the popular pieces where people gather",
        text_ko: "사람들이 많이 모인 인기 작품부터 봐야지",
        weight: { S: 3, C: 1 },
        narrative: "You're curious about what draws collective attention.",
        emotional: "social"
      }
    ]
  },

  // Act 2: Exploration - Deepening Experience (Questions 6-10)
  {
    id: 6,
    act: 'exploration',
    narrative: {
      setup: "In the second floor gallery, you stand before a large painting alongside another captivated visitor.",
      setup_ko: "2층 갤러리에서 큰 그림 앞에 섰습니다. 똑같이 매료된 다른 관람객이 옆에 있습니다.",
      atmosphere: "encounter"
    },
    question: "Someone looking at the same artwork gasps 'Wow...'",
    question_ko: "같은 작품을 보던 사람이 '와...'하고 감탄한다.",
    options: [
      {
        id: 'preserve-moment',
        text: "(...I thought so too. Let me continue my quiet appreciation)",
        text_ko: "(...나도 그렇게 생각했는데,\n조용히 내 감상을 이어가자)",
        weight: { L: 2, E: 1 },
        narrative: "You hold your experience close, like a personal treasure.",
        emotional: "private"
      },
      {
        id: 'share-moment',
        text: "It really is amazing, right? Especially this part...",
        text_ko: "(미소를 보내며) 정말 대단하죠? 특히 이 부분이...",
        weight: { S: 2, M: 1 },
        narrative: "Sharing perspectives enriches the moment for both of you.",
        emotional: "connected"
      }
    ]
  },
  {
    id: 7,
    act: 'exploration',
    narrative: {
      setup: "A darkened room with video projections and hanging sculptures. The entire space becomes the artwork.",
      setup_ko: "어두운 방에 영상이 투사되고 조각들이 매달려 있습니다. 공간 전체가 작품이 됩니다.",
      atmosphere: "innovation"
    },
    question: "A room with video and installation art. Unfamiliar but intriguing.",
    question_ko: "영상과 설치가 있는 전시실. 낯설지만 흥미롭다.",
    options: [
      {
        id: 'sensory-immersion',
        text: "This feeling of being surrounded by light and sound... like being inside the art",
        text_ko: "빛과 소리에 둘러싸인 이 느낌...\n작품 속에 있는 것 같아",
        weight: { A: 3, F: 1 },
        narrative: "You surrender to the sensory experience, letting it wash over you.",
        emotional: "immersed"
      },
      {
        id: 'technical-curiosity',
        text: "So this is another way to express art. How did they make this?",
        text_ko: "이렇게 표현할 수도 있구나.\n어떻게 만들었을까?",
        weight: { R: 3, C: 1 },
        narrative: "You appreciate the innovative techniques and planning behind the installation.",
        emotional: "analytical"
      }
    ]
  },
  {
    id: 8,
    act: 'exploration',
    narrative: {
      setup: "An artwork made of mirrors creates infinite reflections. A sign reads: 'You complete this work.'",
      setup_ko: "거울로 만든 작품이 무한한 반사를 만듭니다.\n표지판: '당신이 이 작품을 완성합니다.'",
      atmosphere: "participation"
    },
    question: "A piece using mirrors reflects your image within it.",
    question_ko: "거울을 활용한 작품에 내 모습이 비친다.",
    options: [
      {
        id: 'merge-with-art',
        text: "Strange feeling... like the artwork and I have become one",
        text_ko: "작품과 내가 하나가 된 것 같은 묘한 기분이야",
        weight: { A: 2, E: 1 },
        narrative: "The boundary between observer and art dissolves beautifully.",
        emotional: "unified"
      },
      {
        id: 'understand-concept',
        text: "Ah, so viewers become part of the work's structure",
        text_ko: "아, 관람객도 작품의 일부가\n되는 구조구나",
        weight: { R: 2, M: 1 },
        narrative: "You grasp the artist's clever conceptual framework.",
        emotional: "enlightened"
      }
    ]
  },
  {
    id: 9,
    act: 'exploration',
    narrative: {
      setup: "Near the exit of the main exhibition, you pause. The experience is settling into your mind.",
      setup_ko: "메인 전시 출구 근처에서 잠시 멈춥니다.\n경험이 마음속에 가라앉고 있습니다.",
      atmosphere: "resonance"
    },
    question: "Finished the main exhibition. What keeps coming back to mind...",
    question_ko: "메인 전시를 다 봤다. 계속 생각나는 건...",
    options: [
      {
        id: 'emotional-memory',
        text: "The thrill I felt in front of that blue painting still lingers...",
        text_ko: "아까 그 파란색 작품 앞에서의 전율이 아직도...",
        weight: { E: 3 },
        narrative: "Certain moments of pure feeling echo long after the viewing.",
        emotional: "haunted"
      },
      {
        id: 'conceptual-impact',
        text: "The message this exhibition was conveying is really profound",
        text_ko: "이 전시가 말하고자 했던\n메시지가 인상 깊어",
        weight: { M: 3 },
        narrative: "The curator's narrative has given you much to contemplate.",
        emotional: "thoughtful"
      }
    ]
  },
  {
    id: 10,
    act: 'exploration',
    narrative: {
      setup: "Sitting on a bench, you see others taking photos or writing notes. You feel the need to capture this somehow.",
      setup_ko: "벤치에 앉아보니 사진을 찍거나 메모하는 사람들이 보입니다. 뭔가 남기고 싶어집니다.",
      atmosphere: "preservation"
    },
    question: "How do you want to preserve this experience?",
    question_ko: "이 경험을 어떻게 간직하고 싶나요?",
    options: [
      {
        id: 'private-reflection',
        text: "I should quietly record this in my personal notes",
        text_ko: "나만의 수집 노트에\n조용히 기록해둬야지",
        weight: { L: 3, E: 1 },
        narrative: "Some experiences are too precious to share immediately.",
        emotional: "introspective"
      },
      {
        id: 'social-sharing',
        text: "I'll share on SNS and hear what others thought too",
        text_ko: "SNS에 공유하면서 다른\n사람들 감상도 들어봐야지",
        weight: { S: 3, M: 1 },
        narrative: "Art becomes richer through collective dialogue.",
        emotional: "communicative"
      }
    ]
  },

  // Act 3: Revelation - Self-Discovery (Questions 11-15)
  {
    id: 11,
    act: 'revelation',
    narrative: {
      setup: "The museum shop near the exit sells art books, postcards, and prints. Books about the artists catch your eye.",
      setup_ko: "출구 근처 뮤지엄 샵에는 미술 서적, 엽서, 프린트가 있습니다. 작가들에 대한 책이 눈에 들어옵니다.",
      atmosphere: "curiosity"
    },
    question: "Choosing postcards in the art shop, what I'm really curious about is...",
    question_ko: "아트샵에서 작품 엽서를 고르면서 생각한다.\n진짜 궁금한 건...",
    options: [
      {
        id: 'artist-emotion',
        text: "What was the artist feeling when creating this?",
        text_ko: "작가는 이걸 그릴 때 무슨\n마음이었을까",
        weight: { E: 2, A: 1 },
        narrative: "You seek the human story behind the brushstrokes.",
        emotional: "empathetic"
      },
      {
        id: 'technique-history',
        text: "How did this technique develop over time?",
        text_ko: "이 미술 기법은 이름이 뭐고, 어떻게 발전해온 걸까",
        weight: { M: 2, R: 1 },
        narrative: "You appreciate art as an evolving language of expression.",
        emotional: "studious"
      }
    ]
  },
  {
    id: 12,
    act: 'revelation',
    narrative: {
      setup: "Exhibition catalogs from past and upcoming shows are displayed. Each promises a different artistic journey.",
      setup_ko: "과거와 예정 전시 도록들이 진열되어 있습니다.\n각각 다른 예술적 여정을 약속합니다.",
      atmosphere: "preference"
    },
    question: "The pamphlet shows other exhibitions. What draws you more?",
    question_ko: "팸플릿을 보니 다른 전시도 하고 있다.\n내가 끌리는 건...",
    options: [
      {
        id: 'experimental-art',
        text: "Experimental Contemporary Art: New Perspectives Crossing Boundaries",
        text_ko: "실험적 현대미술:\n경계를 넘는 새로운 시각",
        weight: { F: 2, A: 1 },
        narrative: "You're drawn to art that challenges and redefines.",
        emotional: "adventurous"
      },
      {
        id: 'classical-masters',
        text: "Impressionist Masters: Timeless Beauty Revealed",
        text_ko: "인상주의 거장전:\n시대를 초월한 걸작",
        weight: { C: 2, R: 1 },
        narrative: "You seek the enduring wisdom of established greatness.",
        emotional: "reverent"
      }
    ]
  },
  {
    id: 13,
    act: 'revelation',
    narrative: {
      setup: "Looking at art prints for sale, you imagine your own living space with art.",
      setup_ko: "판매 중인 아트 프린트를 보며\n예술과 함께하는 내 공간을 상상합니다.",
      atmosphere: "personal"
    },
    question: "If I could have one artwork...",
    question_ko: "만약 작품을 하나 가질 수 있다면...",
    options: [
      {
        id: 'evolving-abstract',
        text: "An abstract piece that feels different each time I see it",
        text_ko: "매번 다르게 느껴질 것 같은 추상화가 좋아",
        weight: { A: 2, F: 1 },
        narrative: "You want art that grows with your changing perspectives.",
        emotional: "dynamic"
      },
      {
        id: 'narrative-landscape',
        text: "A landscape with a story I'd love to display",
        text_ko: "이야기가 있는 구체적인 풍경화나 인물화를 걸어두고 싶어",
        weight: { R: 2, C: 1 },
        narrative: "You want art that grounds you in narrative and place.",
        emotional: "grounded"
      }
    ]
  },
  {
    id: 14,
    act: 'revelation',
    narrative: {
      setup: "Walking toward the exit, the busy street outside contrasts with the quiet world you're leaving.",
      setup_ko: "출구로 향하며, 바쁜 바깥 거리가\n떠나려는 조용한 세계와 대조됩니다.",
      atmosphere: "integration"
    },
    question: "Leaving the museum, I think about why art matters to me...",
    question_ko: "미술관을 나서면서 생각한다.\n예술이 내게 필요한 이유는...",
    options: [
      {
        id: 'private-sanctuary',
        text: "It provides my own secret sanctuary",
        text_ko: "나만의 은밀하지만 자유로운 위로가 되어주니까",
        weight: { L: 2, F: 1 },
        narrative: "Art is your personal escape from the ordinary world.",
        emotional: "protected"
      },
      {
        id: 'cultural-connection',
        text: "It becomes cultural conversation I share with others",
        text_ko: "사람들과 소통하는 문화적\n대화거리가 되니까",
        weight: { S: 2, C: 1 },
        narrative: "Art connects you to a larger community of appreciation.",
        emotional: "connected"
      }
    ]
  },
  {
    id: 15,
    act: 'revelation',
    narrative: {
      setup: "Outside now, you've been here almost two hours. The afternoon light has changed, and so have you.",
      setup_ko: "이제 밖입니다. 거의 두 시간이 지났습니다.\n오후의 빛이 변했고, 당신도 변했습니다.",
      atmosphere: "transformation"
    },
    question: "If I had to define today's experience in one phrase...",
    question_ko: "오늘 경험을 한마디로 정의한다면...",
    options: [
      {
        id: 'unexpected-discovery',
        text: "A time of unexpected emotion and discovery",
        text_ko: "예상 못한 감동과 발견의 시간",
        weight: { F: 2, E: 1, A: 1 },
        narrative: "You came seeking art but found pieces of yourself.",
        emotional: "transformed"
      },
      {
        id: 'systematic-understanding',
        text: "A time of systematically understanding art",
        text_ko: "체계적으로 예술을 이해하게 된 시간",
        weight: { C: 2, M: 1, R: 1 },
        narrative: "You've built a framework for appreciating beauty.",
        emotional: "accomplished"
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
    // From Q1
    'solitary-2': "In your chosen solitude, you approach the information desk...",
    'social-2': "Energized by the crowd's enthusiasm, you head to get oriented...",
    
    // From Q2
    'intuitive-3': "Trusting your instincts, you drift toward the first room...",
    'structured-3': "With the guide ready, you systematically enter the first space...",
    
    // From Q3
    'abstract-drawn-4': "Still feeling those colors, you continue through the gallery...",
    'detail-focused-4': "Your eye for detail rewards you as you discover more...",
    
    // From Q4
    'emotional-impact-5': "That emotional moment still echoing, you realize the space is vast...",
    'meaning-seeking-5': "Mind buzzing with interpretation, you notice the exhibition's scale...",
    
    // From Q5
    'lone-wandering-6': "On your solitary path, you encounter another viewer...",
    'crowd-following-6': "Among the popular pieces, you share a moment with someone...",
    
    // From Q6
    'preserve-moment-7': "Keeping your experience private, you discover something new...",
    'share-moment-7': "Enriched by sharing, you both notice the contemporary room...",
    
    // From Q7
    'sensory-immersion-8': "Still tingling from the installation, you find an interactive piece...",
    'technical-curiosity-8': "Your analytical mind prepared, you encounter participation art...",
    
    // From Q8
    'merge-with-art-9': "Having become one with art, you complete the main exhibition...",
    'understand-concept-9': "Concept understood, you finish the primary journey...",
    
    // From Q9
    'emotional-memory-10': "Those feelings demand to be preserved somehow...",
    'conceptual-impact-10': "The message needs to be recorded and remembered...",
    
    // From Q10
    'private-reflection-11': "Your private thoughts lead you to the museum shop...",
    'social-sharing-11': "After sharing online, you browse the museum shop...",
    
    // From Q11
    'artist-emotion-12': "Thinking about artists' hearts, you see more exhibitions...",
    'technique-history-12': "Considering artistic evolution, you notice other shows...",
    
    // From Q12
    'experimental-art-13': "Drawn to the experimental, you imagine art at home...",
    'classical-masters-13': "Appreciating the classics, you envision your space...",
    
    // From Q13
    'evolving-abstract-14': "Wanting dynamic art, you consider art's role in life...",
    'narrative-landscape-14': "Seeking stories, you reflect on art's purpose...",
    
    // From Q14
    'private-sanctuary-15': "Art as sanctuary, you summarize your journey...",
    'cultural-connection-15': "Art as connection, you define today's experience..."
  };

  const key = `${previousChoice}-${toQuestion}`;
  return transitions[key] || "You continue through the gallery...";
};

// Korean version of personalized transitions
export const getPersonalizedTransition_ko = (
  fromQuestion: number,
  toQuestion: number,
  previousChoice: string
): string => {
  const transitions_ko: Record<string, string> = {
    // From Q1
    'solitary-2': "선택한 고독 속에서, 안내 데스크로 향합니다...",
    'social-2': "군중의 열기에 힘입어, 안내를 받으러 갑니다...",
    
    // From Q2
    'intuitive-3': "직감을 믿으며, 첫 번째 전시실로 발걸음을 옮깁니다...",
    'structured-3': "가이드를 준비하고, 체계적으로 첫 공간에 들어섭니다...",
    
    // From Q3
    'abstract-drawn-4': "그 색채의 여운 속에서, 갤러리를 계속 둘러봅니다...",
    'detail-focused-4': "세밀한 관찰력이 더 많은 보물을 발견하게 합니다...",
    
    // From Q4
    'emotional-impact-5': "그 감정적 순간이 여전히 울리는 가운데, 공간의 광대함을 깨닫습니다...",
    'meaning-seeking-5': "해석으로 가득한 마음으로, 전시의 규모를 인식합니다...",
    
    // From Q5
    'lone-wandering-6': "홀로 걷는 길에서, 다른 관람객을 만납니다...",
    'crowd-following-6': "인기 작품들 사이에서, 누군가와 순간을 공유합니다...",
    
    // From Q6
    'preserve-moment-7': "경험을 간직한 채, 새로운 것을 발견합니다...",
    'share-moment-7': "나눔으로 풍요로워진 채, 현대적인 방을 알아차립니다...",
    
    // From Q7
    'sensory-immersion-8': "설치 작품의 전율이 남은 채, 인터랙티브 작품을 만납니다...",
    'technical-curiosity-8': "분석적 마음이 준비된 채, 참여 예술을 마주합니다...",
    
    // From Q8
    'merge-with-art-9': "예술과 하나가 되어, 메인 전시를 마칩니다...",
    'understand-concept-9': "개념을 이해하고, 주요 여정을 완성합니다...",
    
    // From Q9
    'emotional-memory-10': "그 감정들을 어떻게든 보존해야 합니다...",
    'conceptual-impact-10': "그 메시지를 기록하고 기억해야 합니다...",
    
    // From Q10
    'private-reflection-11': "개인적인 생각들이 뮤지엄 샵으로 이끕니다...",
    'social-sharing-11': "온라인 공유 후, 뮤지엄 샵을 둘러봅니다...",
    
    // From Q11
    'artist-emotion-12': "작가들의 마음을 생각하며, 다른 전시들을 봅니다...",
    'technique-history-12': "예술적 발전을 고려하며, 다른 전시를 알아차립니다...",
    
    // From Q12
    'experimental-art-13': "실험적인 것에 끌려, 집에서의 예술을 상상합니다...",
    'classical-masters-13': "고전을 감상하며, 당신의 공간을 그려봅니다...",
    
    // From Q13
    'evolving-abstract-14': "역동적인 예술을 원하며, 삶에서 예술의 역할을 생각합니다...",
    'narrative-landscape-14': "이야기를 찾으며, 예술의 목적을 성찰합니다...",
    
    // From Q14
    'private-sanctuary-15': "예술이 성소인 당신, 여정을 요약합니다...",
    'cultural-connection-15': "예술이 연결인 당신, 오늘의 경험을 정의합니다..."
  };

  const key = `${previousChoice}-${toQuestion}`;
  return transitions_ko[key] || "갤러리를 계속 둘러봅니다...";
};

// Encouraging feedback messages (더 자연스럽고 구체적으로)
export const encouragingFeedback = [
  "You're discovering your unique way of seeing art.",
  "Every choice reveals more about your artistic soul.",
  "There's no wrong answer - only your authentic response.",
  "Your art journey is taking shape beautifully.",
  "You're not just viewing art, you're understanding yourself.",
  "Each response adds another layer to your art persona.",
  "Your genuine reactions are creating something special.",
  "The gallery seems to be revealing itself just for you.",
  "You're writing your own story through these choices.",
  "Almost there - your art personality is emerging clearly."
];

export const encouragingFeedback_ko = [
  "당신만의 예술 감상법을 발견하고 있어요.",
  "모든 선택이 당신의 예술적 영혼을 드러냅니다.",
  "틀린 답은 없어요 - 오직 당신의 진솔한 반응만 있을 뿐.",
  "당신의 예술 여정이 아름답게 형성되고 있습니다.",
  "단순히 예술을 보는 게 아니라 자신을 이해하고 있어요.",
  "각 응답이 당신의 예술 페르소나에 새로운 층을 더합니다.",
  "당신의 진정한 반응들이 특별한 무언가를 만들어내고 있어요.",
  "갤러리가 당신만을 위해 모습을 드러내는 것 같네요.",
  "이 선택들을 통해 당신만의 이야기를 쓰고 있습니다.",
  "거의 다 왔어요 - 당신의 예술 성격이 선명하게 드러나고 있습니다."
];

// 축별 점수 계산 도우미 (디버깅용)
export const calculateAxisScores = (answers: string[]): Record<string, number> => {
  const scores = { L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
  
  narrativeQuestions.forEach((question, index) => {
    const chosenOption = question.options.find(opt => opt.id === answers[index]);
    if (chosenOption) {
      Object.entries(chosenOption.weight).forEach(([axis, value]) => {
        scores[axis] += value;
      });
    }
  });
  
  return scores;
};