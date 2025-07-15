// 🎨 SAYU Personality Descriptions - Personal Art Journey Types

import { SAYUTypeCode } from '../shared/SAYUTypeDefinitions';

export interface PersonalityDescription {
  type: string;
  title: string;
  title_ko?: string;
  subtitle: string;
  subtitle_ko?: string;
  essence: string;
  essence_ko?: string;
  strengths: Array<{
    icon: string;
    title: string;
    title_ko?: string;
    description: string;
    description_ko?: string;
  }>;
  recognition: string[];
  recognition_ko?: string[];
  lifeExtension: string;
  lifeExtension_ko?: string;
  lifeAreas: Array<{
    title: string;
    title_ko?: string;
    description: string;
    description_ko?: string;
  }>;
  recommendedArtists: Array<{
    name: string;
    period: string;
    image: string;
    whyYouConnect: string;
    whyYouConnect_ko?: string;
    emotionalTag: string;
    emotionalTag_ko?: string;
  }>;
}

/**
 * IMPORTANT: This file uses the centralized SAYU type definitions from shared/SAYUTypeDefinitions.ts
 * Do not create duplicate type definitions here - always use the imported types.
 */
export const personalityDescriptions: Record<SAYUTypeCode, PersonalityDescription> = {
  // Lone Wolf + Abstract + Emotional + Flow-oriented
  LAEF: {
    type: 'LAEF',
    title: 'The Emotional Explorer',
    title_ko: '감성 탐험가',
    subtitle: 'Dancing with abstract emotions in solitude',
    subtitle_ko: '감정의 나침반을 따라 예술을 탐험하는',
    essence: 'You don\'t just see art, you feel it breathing. In the quiet moments between you and a canvas, entire universes unfold. Your journey through galleries is deeply personal - a meditation where each piece either resonates in your bones or passes by like a gentle breeze.',
    essence_ko: '당신은 미술관을 감정의 지도로 탐험합니다. 작품 앞에서 느끼는 감정이 다음 작품으로 이끄는 나침반이 되죠.\n\n혼자만의 시간 속에서 예술과 깊이 교감하며, 각 작품이 전하는 감정의 파장을 온전히 받아들입니다. 때로는 한 작품 앞에서 오래 머물며 그 안에 담긴 감정의 여정을 따라가기도 합니다.',
    strengths: [
      {
        icon: '🌙',
        title: 'Emotional Depth',
        title_ko: '감정의 깊이',
        description: 'You feel art in layers others might miss',
        description_ko: '다른 사람들이 놓칠 수 있는 층들에서 예술을 느낍니다'
      },
      {
        icon: '🍃',
        title: 'Intuitive Navigation',
        title_ko: '직관적 탐색',
        description: 'You trust your instincts to guide you to meaningful encounters',
        description_ko: '의미 있는 만남으로 인도하는 본능을 신뢰합니다'
      },
      {
        icon: '💫',
        title: 'Present Moment Awareness',
        title_ko: '현재 순간의 인식',
        description: 'You can lose yourself completely in a single brushstroke',
        description_ko: '한 번의 붓터치에 완전히 빠져들 수 있습니다'
      }
    ],
    recognition: [
      'Lost in museum reveries',
      'Finding friends in paintings',
      'Sensing moods in colors',
      'Needing space to breathe with art'
    ],
    recognition_ko: [
      '작품이 주는 감정에 깊이 빠져드는',
      '미술관에서 감정의 여행을 떠나는',
      '색채와 형태에서 느낌을 발견하는',
      '혼자만의 감상 시간이 필요한'
    ],
    lifeExtension: 'This way of experiencing beauty extends into how you choose your morning coffee spot (the one with the best light), the music that moves you (often wordless), and the cities that feel like home (those with hidden corners and artistic souls).',
    lifeExtension_ko: '감성 탐험가로서의 예술 감상 방식은 일상으로 확장됩니다.\n\n전시회를 선택할 때도 유명세보다는 감정적 끌림을 따르고, 작품을 볼 때마다 새로운 감정의 층위를 발견합니다. 미술관은 당신에게 감정을 탐험하고 정리하는 특별한 공간이 됩니다.',
    lifeAreas: [
      {
        title: 'In Relationships',
        title_ko: '관계에서',
        description: 'You seek depth over breadth, preferring few meaningful connections to many surface ones.',
        description_ko: '넓이보다 깊이를 추구하며, 많은 표면적 관계보다 소수의 의미 있는 연결을 선호합니다.'
      },
      {
        title: 'In Spaces',
        title_ko: '공간에서',
        description: 'You\'re drawn to places with soul - vintage bookshops, quiet cafes, rooms with stories.',
        description_ko: '영혼이 있는 장소에 끌립니다 - 빈티지 서점, 조용한 카페, 이야기가 있는 방들.'
      },
      {
        title: 'In Creativity',
        title_ko: '창의성에서',
        description: 'Your creative process is intuitive and emotional, often surprising even yourself.',
        description_ko: '당신의 창작 과정은 직관적이고 감정적이며, 종종 스스로도 놀랄 정도입니다.'
      }
    ],
    recommendedArtists: [
      {
        name: 'Mark Rothko',
        period: 'Abstract Expressionism',
        image: '/images/artists/rothko.jpg',
        whyYouConnect: 'His color fields mirror your emotional landscapes',
        whyYouConnect_ko: '그의 색면들은 당신의 감정적 풍경을 비추어 보여줍니다',
        emotionalTag: 'Meditative depth',
        emotionalTag_ko: '명상적 깊이'
      },
      {
        name: 'Agnes Martin',
        period: 'Minimalism',
        image: '/images/artists/martin.jpg',
        whyYouConnect: 'Her quiet grids create space for your contemplation',
        whyYouConnect_ko: '그녀의 고요한 격자들은 당신의 사색을 위한 공간을 만들어줍니다',
        emotionalTag: 'Gentle presence',
        emotionalTag_ko: '부드러운 존재감'
      },
      {
        name: 'Hilma af Klint',
        period: 'Spiritual Abstraction',
        image: '/images/artists/klint.jpg',
        whyYouConnect: 'Her mystical symbols speak to your intuitive nature',
        whyYouConnect_ko: '그녀의 신비로운 상징들은 당신의 직관적 본성에 말을 건넹니다',
        emotionalTag: 'Hidden meanings',
        emotionalTag_ko: '숨겨진 의미'
      }
    ]
  },

  // Lone Wolf + Abstract + Emotional + Structured
  LAEC: {
    type: 'LAEC',
    title: 'The Emotional Curator',
    title_ko: '감성 큐레이터',
    subtitle: 'Creating personal collections of emotional art experiences',
    subtitle_ko: '감정적 예술 경험의 개인 커렉션을 만드는',
    essence: 'You approach art like a poet approaches words - with reverence, patience, and deep attention. Your solitary gallery visits are research expeditions of the soul, where you systematically uncover layers of meaning while allowing yourself to be emotionally moved.',
    essence_ko: '당신은 마치 큐레이터처럼 자신만의 감성적 기준으로 작품을 선별하고 수집합니다. 각 작품이 주는 감정을 체계적으로 분류하고, 그 의미를 깊이 탐구합니다. 미술관에서의 시간은 감정의 아카이브를 만들어가는 과정이며, 작품마다 담긴 정서적 메시지를 자신만의 방식으로 해석하고 보관합니다.',
    strengths: [
      {
        icon: '📖',
        title: 'Deep Analysis',
        title_ko: '깊이 있는 분석',
        description: 'You read between the brushstrokes and find hidden narratives in artistic techniques',
        description_ko: '붓터치 사이를 읽으며 예술적 기법에 숨겨진 서사를 발견합니다'
      },
      {
        icon: '🏛️',
        title: 'Methodical Appreciation',
        title_ko: '체계적 감상',
        description: 'Your structured approach reveals layers of meaning that others miss',
        description_ko: '체계적인 접근을 통해 다른 사람들이 놓치는 의미의 층위를 드러냅니다'
      },
      {
        icon: '💭',
        title: 'Emotional Intelligence',
        title_ko: '감정적 지능',
        description: 'You bridge the gap between feeling and understanding in art',
        description_ko: '예술에서 감정과 이해 사이의 간극을 메워줍니다'
      }
    ],
    recognition: [
      'Reading every museum label',
      'Returning to the same painting',
      'Taking mental notes',
      'Seeking the story behind the art'
    ],
    recognition_ko: [
      '작품별 감정을 분류하고 정리하는',
      '개인적인 전시 루트를 만드는',
      '감정적 연결고리를 찾아 커렉션을 구성하는',
      '작품에 대한 감상을 체계적으로 기록하는'
    ],
    lifeExtension: 'You bring this same thoughtful intensity to your book choices (literary fiction that makes you think and feel), your travel plans (cities with rich cultural histories), and your personal rituals (morning routines that ground you).',
    lifeExtension_ko: '감성 큐레이터로서의 예술 경험 방식은 삶의 다른 영역에도 적용됩니다. 음악을 들을 때도 감정별로 플레이리스트를 만들고, 공간을 꾸밀 때도 감정적 의미가 담긴 오브제들로 채웁니다. 미술관에서의 큐레이팅 경험은 일상에서도 계속됩니다.',
    lifeAreas: [
      {
        title: 'In Learning',
        title_ko: '학습에서',
        description: 'You dive deep into subjects that fascinate you, building comprehensive understanding through patient study.',
        description_ko: '매혹적인 주제를 깊이 파고들어 인내심 있는 연구를 통해 포괄적인 이해를 구축합니다.'
      },
      {
        title: 'In Collecting',
        title_ko: '수집에서',
        description: 'You curate meaningful objects, books, or experiences that create a cohesive personal narrative.',
        description_ko: '개인적인 서사를 일관되게 만들어가는 의미 있는 물건, 책, 경험들을 큐레이팅합니다.'
      },
      {
        title: 'In Reflection',
        title_ko: '성찰에서',
        description: 'You process experiences through writing, meditation, or quiet contemplation to extract deeper meanings.',
        description_ko: '글쓰기, 명상, 조용한 사색을 통해 경험을 소화하고 더 깊은 의미를 끌어냅니다.'
      }
    ],
    recommendedArtists: [
      {
        name: 'Anselm Kiefer',
        period: 'Neo-Expressionism',
        image: '/images/artists/kiefer.jpg',
        whyYouConnect: 'His layered histories match your depth of inquiry',
        whyYouConnect_ko: '그의 층층이 쌓인 역사는 당신의 탐구 깊이와 맞닿아 있습니다',
        emotionalTag: 'Profound complexity',
        emotionalTag_ko: '깊은 복잡함'
      },
      {
        name: 'Lee Bae',
        period: 'Contemporary',
        image: '/images/artists/bae.jpg',
        whyYouConnect: 'His charcoal meditations resonate with your contemplative nature',
        whyYouConnect_ko: '그의 목탄 명상은 당신의 사색적 본성과 공명합니다',
        emotionalTag: 'Structured serenity',
        emotionalTag_ko: '구조적 평온'
      },
      {
        name: 'Gerhard Richter',
        period: 'Contemporary',
        image: '/images/artists/richter.jpg',
        whyYouConnect: 'His systematic exploration of painting speaks to your methodical soul',
        whyYouConnect_ko: '그의 체계적인 회화 탐구는 당신의 방법론적 영혼에 말을 건넩니다',
        emotionalTag: 'Intellectual emotion',
        emotionalTag_ko: '지적 감정'
      }
    ]
  },

  // Lone Wolf + Abstract + Logical + Flow-oriented
  LAMF: {
    type: 'LAMF',
    title: 'The Intuitive Navigator',
    title_ko: '직관 탐색자',
    subtitle: 'Following artistic instincts through abstract realms',
    subtitle_ko: '직관을 따라 추상 예술의 세계를 항해하는',
    essence: 'You float through galleries like a philosopher through ideas - independently, curiously, following threads of meaning wherever they lead. Your approach is both intellectual and free-flowing, finding patterns and concepts in abstract forms while maintaining the flexibility to change course when inspiration strikes.',
    essence_ko: '당신은 미술관을 직관의 나침반만으로 항해합니다. 작품이 불러일으키는 직관적 느낌을 따라 자유롭게 이동하며, 각 작품에서 새로운 사고의 길을 발견합니다. 추상 예술 앞에서는 특히 더 깊은 직관적 교감을 느끼며, 작품이 제시하는 개념적 여행을 자유롭게 따라갑니다.',
    strengths: [
      {
        icon: '🧭',
        title: 'Conceptual Navigation',
        title_ko: '개념적 내비게이션',
        description: 'You create your own intellectual pathways through complex artistic ideas',
        description_ko: '복잡한 예술적 아이디어들을 통해 당신만의 지적 경로를 창조합니다'
      },
      {
        icon: '🎭',
        title: 'Intellectual Freedom',
        title_ko: '지적 자유',
        description: 'You explore artistic concepts without being bound by conventional interpretations',
        description_ko: '기존의 해석에 얽매이지 않고 예술적 개념들을 자유롭게 탐구합니다'
      },
      {
        icon: '✨',
        title: 'Pattern Recognition',
        title_ko: '패턴 인식',
        description: 'You discover hidden connections between artistic movements and ideas',
        description_ko: '예술 운동과 아이디어 사이의 숨겨진 연결고리를 발견합니다'
      }
    ],
    recognition: [
      'Creating your own theories',
      'Enjoying conceptual art',
      'Wandering without a map',
      'Finding philosophy in aesthetics'
    ],
    recognition_ko: [
      '직관을 따라 전시를 돌아보는',
      '작품이 주는 첫인상을 신뢰하는',
      '계획 없이 자유롭게 감상하는',
      '추상 예술에서 새로운 사고를 발견하는'
    ],
    lifeExtension: 'This philosophical wandering extends to your reading habits (from quantum physics to poetry), your conversations (deep dives into abstract ideas), and your lifestyle choices (minimalist but meaningful).',
    lifeExtension_ko: '직관 탐색자로서의 예술 감상은 일상에도 영향을 미쳐, 첫느낌이 좋은 전시회를 선택하고, 직관적으로 끌리는 작품을 오래 감상합니다. 미술관에서의 경험은 당신에게 새로운 사고의 길을 열어주는 특별한 탐험이 됩니다.',
    lifeAreas: [
      {
        title: 'In Thinking',
        title_ko: '사고에서',
        description: 'You enjoy exploring abstract ideas, making unexpected connections between different concepts.',
        description_ko: '추상적 아이디어를 탐구하고 서로 다른 개념들 사이에서 예상치 못한 연결고리를 만드는 것을 즐깁니다.'
      },
      {
        title: 'In Living',
        title_ko: '삶에서',
        description: 'You create an authentic lifestyle that reflects your unique perspective and values.',
        description_ko: '당신만의 독특한 관점과 가치관을 반영한 진정성 있는 라이프스타일을 만들어갑니다.'
      },
      {
        title: 'In Creating',
        title_ko: '창작에서',
        description: 'You venture into unexplored creative territories, pioneering new approaches and ideas.',
        description_ko: '아직 탐구되지 않은 창작 영역으로 떠나 새로운 접근과 아이디어를 개척합니다.'
      }
    ],
    recommendedArtists: [
      {
        name: 'Sol LeWitt',
        period: 'Conceptual Art',
        image: '/images/artists/lewitt.jpg',
        whyYouConnect: 'His systematic yet playful approach mirrors your intellectual freedom',
        whyYouConnect_ko: '그의 체계적이면서도 유희적인 접근은 당신의 지적 자유를 반영합니다',
        emotionalTag: 'Conceptual play',
        emotionalTag_ko: '개념적 유희'
      },
      {
        name: 'James Turrell',
        period: 'Light and Space',
        image: '/images/artists/turrell.jpg',
        whyYouConnect: 'His perceptual experiments align with your philosophical nature',
        whyYouConnect_ko: '그의 지각 실험들은 당신의 철학적 본성과 일치합니다',
        emotionalTag: 'Mind expansion',
        emotionalTag_ko: '의식의 확장'
      },
      {
        name: 'Lee Ufan',
        period: 'Mono-ha',
        image: '/images/artists/ufan.jpg',
        whyYouConnect: 'His minimal gestures speak volumes to your contemplative mind',
        whyYouConnect_ko: '그의 미니멀한 제스처는 당신의 사색적 마음에 큰 울림을 줍니다',
        emotionalTag: 'Zen philosophy',
        emotionalTag_ko: '선 철학'
      }
    ]
  },

  // Lone Wolf + Abstract + Logical + Structured
  LAMC: {
    type: 'LAMC',
    title: 'The Knowledge Collector',
    title_ko: '지식 수집가',
    subtitle: 'Gathering artistic knowledge systematically',
    subtitle_ko: '체계적으로 예술 지식을 수집하는',
    essence: 'You approach abstract art like a scientist approaches the universe - with rigorous curiosity and systematic methodology. Your solitary museum visits are research sessions where you build comprehensive understanding of artistic movements, techniques, and theories.',
    essence_ko: '당신은 미술관을 거대한 지식의 보고로 여깁니다. 각 작품에 대한 정보를 체계적으로 수집하고, 예술사적 맥락과 기법을 꾸준히 연구합니다. 추상 예술 앞에서도 그 이면의 이론과 철학을 탐구하며, 당신만의 예술 지식 체계를 구축해 나갑니다.',
    strengths: [
      {
        icon: '🔬',
        title: 'Analytical Precision',
        title_ko: '분석적 정밀성',
        description: 'You examine artistic elements with scientific rigor, uncovering technical and theoretical foundations',
        description_ko: '예술적 요소들을 과학적 엄격성으로 검토하여 기술적, 이론적 기반을 발견합니다'
      },
      {
        icon: '📊',
        title: 'Systematic Understanding',
        title_ko: '체계적 이해',
        description: 'You construct comprehensive mental models that connect artistic movements and concepts',
        description_ko: '예술 운동과 개념들을 연결하는 포괄적인 정신적 모델을 구축합니다'
      },
      {
        icon: '🏗️',
        title: 'Theoretical Construction',
        title_ko: '이론적 구축',
        description: 'You organize complex artistic ideas into coherent, logical frameworks',
        description_ko: '복잡한 예술적 아이디어들을 일관성 있고 논리적인 체계로 정리합니다'
      }
    ],
    recognition: [
      'Creating mental taxonomies',
      'Studying technique intensely',
      'Building art theories',
      'Seeking comprehensive understanding'
    ],
    recognition_ko: [
      '작품의 모든 정보를 꾼꾼히 수집하는',
      '예술사적 맥락을 철저히 조사하는',
      '작가별, 시대별로 지식을 정리하는',
      '미술관 도슨트나 자료를 모으는'
    ],
    lifeExtension: 'This systematic approach influences your work methods (detailed project planning), your hobbies (perhaps collecting or categorizing), and your learning style (building complete mental models before moving on).',
    lifeExtension_ko: '지식 수집가로서의 예술 감상은 삶의 다른 영역에도 영향을 미쳤습니다. 전시회를 방문할 때도 철저한 사전 조사를 하고, 작품 정보를 체계적으로 기록합니다. 미술관은 당신에게 지식을 탐구하고 수집하는 특별한 학습 공간이 됩니다.',
    lifeAreas: [
      {
        title: 'In Work',
        title_ko: '업무에서',
        description: 'You create efficient systems and solve complex problems through methodical analysis.',
        description_ko: '방법론적 분석을 통해 효율적인 시스템을 만들고 복잡한 문제를 해결합니다.'
      },
      {
        title: 'In Study',
        title_ko: '학습에서',
        description: 'You become a thorough expert by systematically mastering every aspect of your chosen subjects.',
        description_ko: '선택한 주제의 모든 측면을 체계적으로 습듁하여 철저한 전문가가 됩니다.'
      },
      {
        title: 'In Organization',
        title_ko: '조직에서',
        description: 'You design elegant personal systems that maximize efficiency and minimize complexity.',
        description_ko: '효율성을 극대화하고 복잡성을 최소화하는 우아한 개인 시스템을 설계합니다.'
      }
    ],
    recommendedArtists: [
      {
        name: 'Piet Mondrian',
        period: 'De Stijl',
        image: '/images/artists/mondrian.jpg',
        whyYouConnect: 'His systematic reduction to essentials matches your analytical mind',
        whyYouConnect_ko: '그의 본질로의 체계적 환원은 당신의 분석적 마음과 맞아떨어집니다',
        emotionalTag: 'Pure structure',
        emotionalTag_ko: '순수한 구조'
      },
      {
        name: 'Frank Stella',
        period: 'Minimalism',
        image: '/images/artists/stella.jpg',
        whyYouConnect: 'His logical progressions appeal to your systematic nature',
        whyYouConnect_ko: '그의 논리적 진행은 당신의 체계적 본성에 호소합니다',
        emotionalTag: 'Geometric logic',
        emotionalTag_ko: '기하학적 논리'
      },
      {
        name: 'Bridget Riley',
        period: 'Op Art',
        image: '/images/artists/riley.jpg',
        whyYouConnect: 'Her precise optical experiments engage your analytical eye',
        whyYouConnect_ko: '그녀의 정밀한 시각 실험들은 당신의 분석적 시선을 사로잡습니다',
        emotionalTag: 'Systematic sensation',
        emotionalTag_ko: '체계적 감각'
      }
    ]
  },

  // Social + Abstract + Emotional + Flow-oriented
  SAEF: {
    type: 'SAEF',
    title: 'The Emotion Sharer',
    title_ko: '감성 공유자',
    subtitle: 'Creating emotional connections through art',
    subtitle_ko: '예술을 통해 감정적 연결을 만드는',
    essence: 'Art is your social language - a way to connect deeply with others through shared emotional experiences. You see galleries as spaces for communion, where abstract works become conversation starters for exploring feelings, dreams, and the ineffable aspects of being human.',
    essence_ko: '당신은 예술을 통해 감정을 공유합니다. 추상 작품 앞에서 느낀 감정을 다른 사람들과 나누며, 함께 감상하는 과정에서 깊은 교감을 형성합니다. 미술관은 당신에게 감정적 소통이 일어나는 특별한 만남의 장소가 됩니다.',
    strengths: [
      {
        icon: '🌈',
        title: 'Emotional Sharing',
        title_ko: '감정 공유',
        description: 'You create collective experiences from personal feelings',
        description_ko: '개인적인 감정으로부터 집단적 경험을 만들어냅니다'
      },
      {
        icon: '🤝',
        title: 'Intuitive Connection',
        title_ko: '직관적 연결',
        description: 'You find your tribe through artistic resonance',
        description_ko: '예술적 공명을 통해 같은 마음을 가진 사람들을 찾아냅니다'
      },
      {
        icon: '💝',
        title: 'Expressive Joy',
        title_ko: '표현적 기쁨',
        description: 'Your enthusiasm for art is contagious',
        description_ko: '예술에 대한 당신의 열정은 전염력이 있습니다'
      }
    ],
    recognition: [
      'Bringing friends to galleries',
      'Sharing art on social media',
      'Starting deep conversations',
      'Creating art communities'
    ],
    recognition_ko: [
      '작품에서 느낀 감정을 즉시 공유하는',
      '함께 감상하며 감정적 공감대를 형성하는',
      '추상 예술을 통해 감정을 표현하는',
      '미술관에서의 만남을 소중히 여기는'
    ],
    lifeExtension: 'This connective approach shapes your social life (hosting creative gatherings), your communication style (rich with imagery and emotion), and your spaces (filled with meaningful objects that spark conversation).',
    lifeExtension_ko: '감성 공유자로서의 예술 경험은 삶의 다른 영역에도 영향을 미쳤습니다. 추상 예술에서 느낀 감정을 일상에서도 적극적으로 표현하고 공유합니다. 미술관은 당신에게 감정적 연대가 형성되는 특별한 공간이 됩니다.',
    lifeAreas: [
      {
        title: 'In Friendships',
        title_ko: '인간관계에서',
        description: 'You bond through shared aesthetic and emotional experiences, creating deep connections through art discussions.',
        description_ko: '미적 경험과 감정을 공유하며 유대를 형성하고, 예술 토론을 통해 깊은 연결을 만듭니다.'
      },
      {
        title: 'In Communication',
        title_ko: '소통에서',
        description: 'You express complex feelings through visual references and creative metaphors that others find relatable.',
        description_ko: '시각적 참조와 창의적 비유를 통해 복잡한 감정을 표현하며, 다른 사람들이 공감할 수 있게 합니다.'
      },
      {
        title: 'In Leadership',
        title_ko: '리더십에서',
        description: 'You inspire others by fostering inclusive environments where everyone feels comfortable sharing their perspectives.',
        description_ko: '모든 사람이 자신의 관점을 편안하게 공유할 수 있는 포용적 환경을 조성하여 다른 사람들에게 영감을 줍니다.'
      }
    ],
    recommendedArtists: [
      {
        name: 'KAWS',
        period: 'Contemporary Street Art',
        image: '/images/artists/kaws.jpg',
        whyYouConnect: 'His accessible yet emotional work mirrors your connective spirit',
        whyYouConnect_ko: '그의 접근 가능하면서도 감정적인 작품은 당신의 연결적 정신을 반영합니다',
        emotionalTag: 'Shared nostalgia',
        emotionalTag_ko: '공유된 향수'
      },
      {
        name: 'Yayoi Kusama',
        period: 'Contemporary',
        image: '/images/artists/kusama.jpg',
        whyYouConnect: 'Her immersive installations create the communal experiences you crave',
        whyYouConnect_ko: '그녀의 몰입형 설치 작품들은 당신이 갈망하는 공동체적 경험을 만들어냅니다',
        emotionalTag: 'Collective wonder',
        emotionalTag_ko: '집단적 경이'
      },
      {
        name: 'David Hockney',
        period: 'Pop Art',
        image: '/images/artists/hockney.jpg',
        whyYouConnect: 'His joyful colors and social scenes resonate with your expressive nature',
        whyYouConnect_ko: '그의 기쁨에 찬 색채와 사회적 장면들은 당신의 표현적 본성과 공명합니다',
        emotionalTag: 'Vibrant connection',
        emotionalTag_ko: '생동감 있는 연결'
      }
    ]
  },

  // Social + Abstract + Emotional + Structured
  SAEC: {
    type: 'SAEC',
    title: 'The Art Networker',
    title_ko: '예술 네트워커',
    subtitle: 'Building artistic communities through emotional connection',
    subtitle_ko: '감정적 연결을 통해 예술 커뮤니티를 구축하는',
    essence: 'You have a gift for helping others understand and feel art deeply. Your structured approach to emotional experiences makes you a natural gallery companion, someone who can articulate why a piece moves you and guide others to their own discoveries.',
    essence_ko: '당신은 예술을 통해 사람들을 연결합니다. 추상 작품이 주는 감정을 체계적으로 분석하고 공유하며, 예술을 매개로 한 네트워킹을 만들어갑니다. 전시회나 미술관에서 만난 사람들과 깊은 예술적 교류를 나누며, 지속적인 예술 커뮤니티를 구축합니다.',
    strengths: [
      {
        icon: '🎨',
        title: 'Emotional Translation',
        title_ko: '감정 번역',
        description: 'You help others discover what moves them in paintings and sculptures, making abstract feelings tangible',
        description_ko: '회화와 조각에서 무엇이 사람들을 움직이는지 발견하도록 도와 추상적 감정을 구체화합니다'
      },
      {
        icon: '🗺️',
        title: 'Guided Discovery',
        title_ko: '안내된 발견',
        description: 'You create structured pathways through gallery spaces that lead to meaningful artistic encounters',
        description_ko: '의미 있는 예술적 만남으로 이끄는 갤러리 공간의 체계적 경로를 만들어냅니다'
      },
      {
        icon: '💬',
        title: 'Articulate Feeling',
        title_ko: '감정 표현',
        description: 'You give language to the wordless power of brushstrokes, colors, and artistic compositions',
        description_ko: '붓터치, 색채, 예술적 구성이 주는 무언의 힘에 언어를 부여합니다'
      }
    ],
    recognition: [
      'Natural museum tour guide',
      'Explaining art to friends',
      'Creating emotional maps',
      'Building art communities'
    ],
    recognition_ko: [
      '자연스러운 미술관 투어 가이드',
      '친구들에게 예술을 설명하는',
      '감정의 지도를 만드는',
      '예술 공동체를 구축하는'
    ],
    lifeExtension: 'This guiding nature extends to your professional life (perhaps teaching, counseling, or creative direction), your relationships (being the emotional anchor), and your creative pursuits (making art accessible to others).',
    lifeExtension_ko: '이런 안내자적 성향은 교육이나 상담, 창의적 디렉션 같은 직업으로 이어지고, 관계에서는 감정적 닻이 되며, 예술을 다른 사람들에게 접근 가능하게 만드는 창작 활동을 추구하게 합니다.',
    lifeAreas: [
      {
        title: 'In Leadership',
        title_ko: '리더십에서',
        description: 'You lead gallery groups with empathy, creating safe spaces where everyone feels comfortable expressing their artistic interpretations.',
        description_ko: '공감으로 갤러리 그룹을 이끌며, 모든 사람이 자신의 예술적 해석을 편안하게 표현할 수 있는 안전한 공간을 만듭니다.'
      },
      {
        title: 'In Teaching',
        title_ko: '교육에서',
        description: 'You excel at helping others understand why certain artworks evoke powerful emotions, breaking down complex artistic concepts into accessible insights.',
        description_ko: '특정 예술 작품이 왜 강렬한 감정을 불러일으키는지 이해할 수 있도록 돕는 데 뛰어나며, 복잡한 예술적 개념을 접근 가능한 통찰로 분해합니다.'
      },
      {
        title: 'In Creating',
        title_ko: '창작에서',
        description: 'Your artistic work often serves as a bridge between feelings and understanding, helping others process their emotional responses to art.',
        description_ko: '당신의 예술 작업은 종종 감정과 이해 사이의 다리 역할을 하며, 다른 사람들이 예술에 대한 감정적 반응을 처리하도록 돕습니다.'
      }
    ],
    recommendedArtists: [
      {
        name: 'Louise Bourgeois',
        period: 'Contemporary Sculpture',
        image: '/images/artists/bourgeois.jpg',
        whyYouConnect: 'Her psychological depth provides rich material for emotional exploration',
        whyYouConnect_ko: '그녀의 심리적 깊이는 감정 탐구를 위한 풍부한 재료를 제공합니다',
        emotionalTag: 'Therapeutic power',
        emotionalTag_ko: '치유의 힘'
      },
      {
        name: 'Wolfgang Tillmans',
        period: 'Contemporary Photography',
        image: '/images/artists/tillmans.jpg',
        whyYouConnect: 'His intimate yet universal images foster collective feeling',
        whyYouConnect_ko: '그의 친밀하면서도 보편적인 이미지들은 집단적 감정을 길러냅니다',
        emotionalTag: 'Shared intimacy',
        emotionalTag_ko: '공유된 친밀함'
      },
      {
        name: 'Felix Gonzalez-Torres',
        period: 'Conceptual Art',
        image: '/images/artists/gonzalez-torres.jpg',
        whyYouConnect: 'His participatory works create structured emotional experiences',
        whyYouConnect_ko: '그의 참여형 작품들은 구조화된 감정적 경험을 만들어냅니다',
        emotionalTag: 'Collective mourning',
        emotionalTag_ko: '집단적 애도'
      }
    ]
  },

  // Social + Abstract + Logical + Flow-oriented
  SAMF: {
    type: 'SAMF',
    title: 'The Insight Sharer',
    title_ko: '통찰 공유자',
    subtitle: 'Transforming concepts into collective gold',
    subtitle_ko: '개념을 집단의 금으로 변환시키는',
    essence: 'You transform galleries into think tanks, where abstract art becomes a springboard for fascinating discussions. Your free-flowing intellectual approach combined with social energy creates dynamic experiences where ideas bounce and evolve through collective exploration.',
    essence_ko: '당신은 갤러리를 싱크탱크로 변모시킵니다. 추상 예술이 매혹적인 토론의 발판이 되는 곳으로 말이죠. 자유롭게 흐르는 지적 접근과 사회적 에너지가 결합되어, 아이디어들이 서로 부딪히고 집단적 탐구를 통해 진화하는 역동적인 경험을 만들어냅니다.',
    strengths: [
      {
        icon: '💡',
        title: 'Idea Generation',
        title_ko: '아이디어 생성',
        description: 'You spark creative interpretations by connecting abstract art to unexpected concepts, inspiring fresh perspectives in group discussions',
        description_ko: '추상 예술을 예상치 못한 개념들과 연결하여 창의적 해석을 촉발하고, 그룹 토론에서 새로운 관점을 영감으로 제공합니다'
      },
      {
        icon: '🎪',
        title: 'Intellectual Play',
        title_ko: '지적 놀이',
        description: 'You transform art analysis into joyful exploration, making complex artistic concepts feel like exciting discoveries',
        description_ko: '예술 분석을 기쁜 탐구로 변화시키며, 복잡한 예술적 개념을 흥미로운 발견처럼 느끼게 만듭니다'
      },
      {
        icon: '🌀',
        title: 'Dynamic Discussion',
        title_ko: '역동적 토론',
        description: 'You facilitate flowing exchanges where artistic interpretations build on each other, creating collective insights',
        description_ko: '예술적 해석들이 서로 발전해나가며 집단적 통찰을 만들어내는 흐름 있는 교환을 촉진합니다'
      }
    ],
    recognition: [
      'Starting gallery debates',
      'Making connections laugh',
      'Proposing wild theories',
      'Creating intellectual energy'
    ],
    recognition_ko: [
      '갤러리에서 토론을 시작하는',
      '사람들을 웃게 만드는',
      '과감한 이론을 제안하는',
      '지적 에너지를 만들어내는'
    ],
    lifeExtension: 'This catalytic energy shapes your social circles (full of thinkers and creators), your work style (brainstorming and innovation), and your leisure (intellectual salons and creative gatherings).',
    lifeExtension_ko: '이런 촉매적 에너지는 사상가와 창작자들로 가득한 사교 모임을 형성하고, 브레인스토밍과 혁신이 중심이 되는 업무 스타일을 만들며, 지적 살롱과 창의적 모임으로 여가를 보내게 합니다.',
    lifeAreas: [
      {
        title: 'In Innovation',
        title_ko: '혁신에서',
        description: 'You excel at generating breakthrough artistic concepts through collaborative brainstorming, turning gallery visits into idea laboratories.',
        description_ko: '협업 브레인스토밍을 통해 획기적인 예술적 개념을 생성하는 데 뛰어나며, 갤러리 방문을 아이디어 실험실로 변화시킵니다.'
      },
      {
        title: 'In Social Settings',
        title_ko: '사회적 환경에서',
        description: 'You create dynamic environments where people feel inspired to share unconventional interpretations of art and explore creative possibilities.',
        description_ko: '사람들이 예술에 대한 관습적이지 않은 해석을 공유하고 창의적 가능성을 탐구하도록 영감을 주는 역동적 환경을 만듭니다.'
      },
      {
        title: 'In Problem-Solving',
        title_ko: '문제 해결에서',
        description: 'You approach artistic challenges with playful experimentation, using collaborative thinking to find innovative solutions.',
        description_ko: '예술적 도전을 즐거운 실험으로 접근하며, 협업적 사고를 통해 혁신적인 해결책을 찾아냅니다.'
      }
    ],
    recommendedArtists: [
      {
        name: 'Olafur Eliasson',
        period: 'Contemporary Installation',
        image: '/images/artists/eliasson.jpg',
        whyYouConnect: 'His participatory installations match your interactive intellectual style',
        whyYouConnect_ko: '그의 참여형 설치 작품들은 당신의 상호작용적 지적 스타일과 맞아떨어집니다',
        emotionalTag: 'Collective experiment',
        emotionalTag_ko: '집단적 실험'
      },
      {
        name: 'Tomás Saraceno',
        period: 'Contemporary',
        image: '/images/artists/saraceno.jpg',
        whyYouConnect: 'His web-like structures mirror your networked thinking',
        whyYouConnect_ko: '그의 거미줄 같은 구조들은 당신의 네트워크적 사고를 반영합니다',
        emotionalTag: 'Connected ideas',
        emotionalTag_ko: '연결된 아이디어'
      },
      {
        name: 'Tino Sehgal',
        period: 'Contemporary Performance',
        image: '/images/artists/sehgal.jpg',
        whyYouConnect: 'His constructed situations align with your social conceptual nature',
        whyYouConnect_ko: '그의 구성된 상황들은 당신의 사회적 개념적 본성과 일치합니다',
        emotionalTag: 'Living philosophy',
        emotionalTag_ko: '살아있는 철학'
      }
    ]
  },

  // Social + Abstract + Logical + Structured
  SAMC: {
    type: 'SAMC',
    title: 'The Cultural Organizer',
    title_ko: '문화 기획자',
    title_ko: '이론의 직조자',
    subtitle: 'Spinning abstract wisdom into social fabric',
    subtitle_ko: '추상적 지혜를 사회적 직물로 엮어내는',
    essence: 'You orchestrate collective learning experiences in galleries, creating structured frameworks that help groups understand complex artistic concepts together. Your logical approach combined with social awareness makes abstract art accessible and engaging for diverse audiences.',
    essence_ko: '당신은 갤러리에서 집단적 학습 경험을 조율합니다. 그룹이 복잡한 예술적 개념을 함께 이해할 수 있도록 체계적인 틀을 만들죠. 논리적 접근과 사회적 인식의 결합은 추상 예술을 다양한 관객들에게 접근 가능하고 매력적으로 만듭니다.',
    strengths: [
      {
        icon: '🏗️',
        title: 'Systematic Teaching',
        title_ko: '체계적 교육',
        description: 'You build comprehensive frameworks that help groups understand artistic movements, techniques, and cultural contexts step by step',
        description_ko: '그룹이 예술 운동, 기법, 문화적 맥락을 단계적으로 이해할 수 있도록 돕는 포괄적인 틀을 구축합니다'
      },
      {
        icon: '🔗',
        title: 'Logical Connection',
        title_ko: '논리적 연결',
        description: 'You link abstract artistic concepts to concrete examples, creating clear pathways from theory to visual experience',
        description_ko: '추상적 예술 개념을 구체적 예시와 연결하여 이론에서 시각적 경험으로 향하는 명확한 경로를 만듭니다'
      },
      {
        icon: '👥',
        title: 'Group Facilitation',
        title_ko: '그룹 촉진',
        description: 'You guide collective analysis of artworks, ensuring everyone contributes to building shared understanding',
        description_ko: '예술 작품의 집단적 분석을 안내하며, 모든 사람이 공유된 이해를 구축하는 데 기여하도록 합니다'
      }
    ],
    recognition: [
      'Leading study groups',
      'Creating learning frameworks',
      'Organizing art discussions',
      'Building art communities'
    ],
    recognition_ko: [
      '스터디 그룹을 이끄는',
      '학습 프레임워크를 만드는',
      '예술 토론을 조직하는',
      '예술 공동체를 구축하는'
    ],
    lifeExtension: 'This architectural approach to knowledge shapes your professional path (education, curation, or systematic innovation), your social role (the organizer and explainer), and your personal systems (beautifully structured and shareable).',
    lifeExtension_ko: '지식에 대한 이런 건축적 접근은 교육이나 큐레이션, 체계적 혁신 같은 직업의 길로 인도하고, 조직자이자 설명자라는 사회적 역할을 부여하며, 아름답게 구조화되어 공유 가능한 개인적 시스템을 만들게 합니다.',
    lifeAreas: [
      {
        title: 'In Education',
        title_ko: '교육에서',
        description: 'You excel at making complex artistic theories accessible through structured learning experiences that build from basic concepts to advanced interpretation.',
        description_ko: '기초 개념에서 고급 해석까지 구축하는 체계적 학습 경험을 통해 복잡한 예술 이론을 접근 가능하게 만드는 데 뛰어납니다.'
      },
      {
        title: 'In Organization',
        title_ko: '조직에서',
        description: 'You create systematic approaches to art appreciation that benefit entire communities, developing programs that make galleries welcoming for all skill levels.',
        description_ko: '전체 공동체에 도움이 되는 예술 감상의 체계적 접근법을 만들고, 모든 수준의 갤러리 방문자를 환영하는 프로그램을 개발합니다.'
      },
      {
        title: 'In Leadership',
        title_ko: '리더십에서',
        description: 'You guide artistic communities through clarity and systematic thinking, helping groups develop collective expertise in art appreciation.',
        description_ko: '명확성과 체계적 사고를 통해 예술 공동체를 이끌며, 그룹이 예술 감상에서 집단적 전문성을 개발하도록 돕습니다.'
      }
    ],
    recommendedArtists: [
      {
        name: 'Donald Judd',
        period: 'Minimalism',
        image: '/images/artists/judd.jpg',
        whyYouConnect: 'His systematic approach to space and form matches your structured thinking',
        whyYouConnect_ko: '그의 공간과 형태에 대한 체계적 접근은 당신의 구조적 사고와 맞아떨어집니다',
        emotionalTag: 'Ordered clarity',
        emotionalTag_ko: '질서 있는 명료함'
      },
      {
        name: 'Dan Flavin',
        period: 'Minimalism',
        image: '/images/artists/flavin.jpg',
        whyYouConnect: 'His modular light works appeal to your systematic aesthetic',
        whyYouConnect_ko: '그의 모듈형 빛 작품들은 당신의 체계적 미학에 호소합니다',
        emotionalTag: 'Structured radiance',
        emotionalTag_ko: '구조화된 광휘'
      },
      {
        name: 'Carl Andre',
        period: 'Minimalism',
        image: '/images/artists/andre.jpg',
        whyYouConnect: 'His mathematical arrangements resonate with your logical social approach',
        whyYouConnect_ko: '그의 수학적 배치는 당신의 논리적 사회적 접근과 공명합니다',
        emotionalTag: 'Collective order',
        emotionalTag_ko: '집단적 질서'
      }
    ]
  },

  // Lone Wolf + Realistic + Emotional + Flow-oriented
  LREF: {
    type: 'LREF',
    title: 'The Delicate Observer',
    title_ko: '섬세한 관찰자',
    subtitle: 'Finding subtle emotions in every detail',
    subtitle_ko: '모든 디테일에서 섬세한 감정을 발견하는',
    essence: 'You wander galleries seeking emotional truth in realistic depictions, drawn to works that capture the poetry of everyday moments. Your solitary appreciation allows you to form intimate connections with figurative art, finding personal meaning in painted narratives.',
    essence_ko: '당신은 작품의 가장 작은 디테일에서도 감정을 포착합니다. 사실적인 넘사 속에 숨겨진 섬세한 감정의 결을 읽어내며, 그려진 인물의 표정이나 빛의 미묘한 변화에서 깊은 의미를 찾습니다. 혼자만의 조용한 감상 시간은 작품과 더 깊은 교감을 가능하게 합니다.',
    strengths: [
      {
        icon: '🌹',
        title: 'Emotional Recognition',
        title_ko: '감정 인식',
        description: 'You read subtle emotions in painted faces and gestures, connecting with the human stories behind artistic portraits',
        description_ko: '그려진 얼굴과 제스처에서 미묘한 감정을 읽어내며, 예술적 초상화 뒤에 숨은 인간의 이야기와 연결됩니다'
      },
      {
        icon: '📷',
        title: 'Moment Appreciation',
        title_ko: '순간 감상',
        description: 'You find profound beauty in captured instants, seeing poetry in everyday scenes painted with careful attention',
        description_ko: '포착된 순간들에서 깊은 아름다움을 발견하며, 세심한 주의로 그려진 일상 장면에서 시적 감성을 봅니다'
      },
      {
        icon: '🕊️',
        title: 'Poetic Perception',
        title_ko: '시적 지각',
        description: 'You discover untold stories in brushstrokes and shadows, finding narrative depth in realistic paintings',
        description_ko: '붓터치와 그림자에서 말하지 않은 이야기를 발견하며, 사실적 그림에서 서사적 깊이를 찾아냅니다'
      }
    ],
    recognition: [
      'Drawn to portraits',
      'Finding personal stories',
      'Emotional art pilgrimages',
      'Quiet gallery wandering'
    ],
    recognition_ko: [
      '작품의 세부 디테일을 천천히 관찰하는',
      '그림 속 인물의 감정을 섬세하게 읽는',
      '빛과 그림자의 미묘한 변화를 포착하는',
      '혼자만의 감상 시간을 소중히 여기는'
    ],
    lifeExtension: 'This romantic observation extends to your daily life (noticing small beauties others miss), your relationships (deep one-on-one connections), and your creative expression (perhaps photography, writing, or collecting meaningful objects).',
    lifeExtension_ko: '섬세한 관찰자로서의 예술 감상은 일상에도 영향을 미쳤습니다. 사실주의 작품에서 느낀 것처럼, 일상에서도 작은 디테일에 주목하고 그 안에 담긴 감정을 섬세하게 포착합니다. 미술관은 당신에게 감정의 뉘앙스를 탐구하는 특별한 공간이 됩니다.',
    lifeAreas: [
      {
        title: 'In Observation',
        title_ko: '관찰에서',
        description: 'You notice emotional nuances in people\'s expressions and body language, reading the unspoken stories in everyday interactions.',
        description_ko: '사람들의 표정과 몸짓에서 감정적 뉘앙스를 알아차리며, 일상적 상호작용에서 말하지 않은 이야기를 읽습니다.'
      },
      {
        title: 'In Memory',
        title_ko: '기억에서',
        description: 'You collect meaningful moments like precious photographs, preserving emotional experiences that others might overlook.',
        description_ko: '소중한 사진처럼 의미 있는 순간들을 수집하며, 다른 사람들이 놓칠 수 있는 감정적 경험을 보존합니다.'
      },
      {
        title: 'In Expression',
        title_ko: '표현에서',
        description: 'You communicate through vivid imagery and metaphor, using visual language to convey complex emotions and experiences.',
        description_ko: '생생한 이미지와 은유를 통해 소통하며, 복잡한 감정과 경험을 전달하기 위해 시각적 언어를 사용합니다.'
      }
    ],
    recommendedArtists: [
      {
        name: 'Andrew Wyeth',
        period: 'American Realism',
        image: '/images/artists/wyeth.jpg',
        whyYouConnect: 'His solitary figures mirror your contemplative nature',
        whyYouConnect_ko: '그의 고독한 인물들은 당신의 사색적 본성을 반영합니다',
        emotionalTag: 'Quiet longing',
        emotionalTag_ko: '고요한 그리움'
      },
      {
        name: 'Lucian Freud',
        period: 'Contemporary Realism',
        image: '/images/artists/freud.jpg',
        whyYouConnect: 'His psychological portraits match your emotional depth',
        whyYouConnect_ko: '그의 심리적 초상화들은 당신의 감정적 깊이와 맞아떨어집니다',
        emotionalTag: 'Raw intimacy',
        emotionalTag_ko: '날것의 친밀함'
      },
      {
        name: 'Edward Hopper',
        period: 'American Realism',
        image: '/images/artists/hopper.jpg',
        whyYouConnect: 'His isolated figures speak to your solitary appreciation',
        whyYouConnect_ko: '그의 고립된 인물들은 당신의 고독한 감상에 말을 건넵니다',
        emotionalTag: 'Beautiful loneliness',
        emotionalTag_ko: '아름다운 고독'
      }
    ]
  },

  // Lone Wolf + Realistic + Emotional + Structured
  LREC: {
    type: 'LREC',
    title: 'The Deep Appreciator',
    title_ko: '깊이있는 감상자',
    subtitle: 'Finding profound meaning in every artistic element',
    subtitle_ko: '모든 예술적 요소에서 깊은 의미를 찾는',
    essence: 'You approach realistic art with the patience of a scholar and the heart of a poet. Your structured yet emotional approach allows you to systematically uncover the layers of feeling embedded in figurative works, building deep understanding through constructive, solitary observation.',
    essence_ko: '당신은 작품을 깊이 있게 감상하는 데 충분한 시간을 할애합니다. 사실주의 작품의 명반과 세부 묘사를 체계적으로 분석하면서도, 그 안에 담긴 감정적 메시지를 깊이 이해합니다. 혼자만의 고요한 감상 시간을 통해 작품의 본질에 다가갑니다.',
    strengths: [
      {
        icon: '🔍',
        title: 'Micro-Observation',
        title_ko: '미세 관찰',
        description: 'You discover emotions in the smallest details - a tear\'s highlight, a fabric\'s texture, the way light falls on skin',
        description_ko: '가장 작은 세부에서 감정을 발견합니다 - 눈물의 하이라이트, 직물의 질감, 피부에 떨어지는 빛의 방식'
      },
      {
        icon: '📚',
        title: 'Narrative Construction',
        title_ko: '서사 구성',
        description: 'You build complete emotional stories from visual clues, understanding the full context behind each painted moment',
        description_ko: '시각적 단서들로부터 완전한 감정적 이야기를 구축하며, 그려진 각 순간 뒤의 전체 맥락을 이해합니다'
      },
      {
        icon: '💎',
        title: 'Patient Discovery',
        title_ko: '인내심 있는 발견',
        description: 'You uncover hidden emotional gems through sustained attention, revealing layers others rush past',
        description_ko: '지속적인 주의를 통해 숨겨진 감정의 보석을 발견하며, 다른 사람들이 성급히 지나치는 층위를 드러냅니다'
      }
    ],
    recognition: [
      'Studying paintings closely',
      'Returning multiple times',
      'Reading all contexts',
      'Building emotional maps'
    ],
    recognition_ko: [
      '그림을 자세히 연구하는',
      '여러 번 다시 찾아가는',
      '모든 맥락을 읽는',
      '감정의 지도를 만드는'
    ],
    lifeExtension: 'This detailed devotion influences your reading choices (character-driven literature), your relationships (deep, patient understanding), and your work (meticulous attention to human factors).',
    lifeExtension_ko: '깊이있는 감상자로서의 예술 경험은 삶의 다른 영역에도 적용됩니다. 사실주의 작품을 깊이 있게 분석하듯, 일상에서도 현상의 이면을 깊이 탐구합니다. 미술관은 당신에게 깊이 있는 사색과 감상의 공간이 됩니다.',
    lifeAreas: [
      {
        title: 'In Understanding',
        title_ko: '이해에서',
        description: 'You build complete pictures of people and situations through patient observation, noticing details that reveal character and truth.',
        description_ko: '인내심 있는 관찰을 통해 사람과 상황의 완전한 그림을 구축하며, 성격과 진실을 드러내는 세부사항을 알아챕니다.'
      },
      {
        title: 'In Appreciation',
        title_ko: '감상에서',
        description: 'You find richness in sustained attention to beauty, discovering new layers of meaning through careful, repeated observation.',
        description_ko: '아름다움에 대한 지속적인 주의를 통해 풍부함을 찾으며, 세심하고 반복적인 관찰을 통해 새로운 의미의 층위를 발견합니다.'
      },
      {
        title: 'In Connection',
        title_ko: '연결에서',
        description: 'You form deep bonds through constructive attention to others, building relationships based on genuine understanding and care.',
        description_ko: '다른 사람들에 대한 건설적인 주의를 통해 깊은 유대를 형성하며, 진정한 이해와 배려를 바탕으로 관계를 구축합니다.'
      }
    ],
    recommendedArtists: [
      {
        name: 'Johannes Vermeer',
        period: 'Dutch Golden Age',
        image: '/images/artists/vermeer.jpg',
        whyYouConnect: 'His quiet domesticity rewards your patient observation',
        whyYouConnect_ko: '그의 고요한 가정성은 당신의 인내심 있는 관찰에 보상을 줍니다',
        emotionalTag: 'Intimate precision',
        emotionalTag_ko: '친밀한 정밀함'
      },
      {
        name: 'Jenny Saville',
        period: 'Contemporary',
        image: '/images/artists/saville.jpg',
        whyYouConnect: 'Her monumental flesh studies match your detailed emotional exploration',
        whyYouConnect_ko: '그녀의 기념비적인 육체 연구는 당신의 세밀한 감정 탐구와 맞아떨어집니다',
        emotionalTag: 'Visceral detail',
        emotionalTag_ko: '본능적 세부'
      },
      {
        name: 'Antonio López García',
        period: 'Contemporary Realism',
        image: '/images/artists/garcia.jpg',
        whyYouConnect: 'His patient observation mirrors your methodical appreciation',
        whyYouConnect_ko: '그의 인내심 있는 관찰은 당신의 체계적인 감상을 반영합니다',
        emotionalTag: 'Meditative precision',
        emotionalTag_ko: '명상적 정밀함'
      }
    ]
  },

  // Lone Wolf + Realistic + Logical + Flow-oriented
  LRMF: {
    type: 'LRMF',
    title: 'The Free Analyst',
    title_ko: '자유로운 분석가',
    subtitle: 'Exploring artistic meaning with logical freedom',
    subtitle_ko: '논리적 자유로움으로 예술적 의미를 탐구하는',
    essence: 'You drift through galleries like a visual anthropologist, drawn to realistic works that document human experience. Your logical eye combined with flow-oriented exploration leads you to discover patterns and truths in figurative art, building your own understanding of the human condition.',
    essence_ko: '당신은 자유롭게 미술관을 탐험하면서도 작품을 논리적으로 분석합니다. 사실주의 작품에서 인간 현실의 패턴을 발견하고, 자신만의 독특한 해석을 만들어갑니다. 계획 없이 자유롭게 이동하면서도 각 작품의 의미를 깊이 탐구합니다.',
    strengths: [
      {
        icon: '📸',
        title: 'Truth Seeking',
        title_ko: '진실 추구',
        description: 'You find authenticity in artistic documentation',
        description_ko: '예술적 기록에서 진정성을 발견합니다'
      },
      {
        icon: '🗺️',
        title: 'Pattern Discovery',
        title_ko: '패턴 발견',
        description: 'You see sociological truths in art',
        description_ko: '예술에서 사회학적 진실을 읽어냅니다'
      },
      {
        icon: '🎯',
        title: 'Independent Analysis',
        title_ko: '독립적 분석',
        description: 'You form your own interpretations',
        description_ko: '자신만의 해석을 형성합니다'
      }
    ],
    recognition: [
      'Drawn to social realism',
      'Analyzing compositions',
      'Free-form exploration',
      'Building theories'
    ],
    recognition_ko: [
      '자유롭게 전시를 돌며 분석하는',
      '사실주의 작품의 의미를 논리적으로 해석하는',
      '계획 없이 흐름을 따라 감상하는',
      '자신만의 독특한 관점을 만들어가는'
    ],
    lifeExtension: 'This documentary approach shapes your interests (perhaps photography, journalism, or cultural studies), your travel style (observational and independent), and your worldview (built from collected observations).',
    lifeExtension_ko: '자유로운 분석가로서의 예술 감상은 삶의 다른 영역에도 영향을 미쳤습니다. 사실주의 작품을 자유롭게 탐구하듯, 일상에서도 현상을 다각도로 분석합니다. 미술관은 당신에게 자유로운 사고와 분석의 공간이 됩니다.',
    lifeAreas: [
      {
        title: 'In Exploration',
        title_ko: '탐구 영역',
        description: 'You document life through your unique observational lens.',
        description_ko: '독특한 관찰 렌즈로 삶을 기록합니다'
      },
      {
        title: 'In Analysis',
        title_ko: '분석 영역',
        description: 'You find patterns in human behavior and culture.',
        description_ko: '인간 행동과 문화에서 패턴을 발견합니다'
      },
      {
        title: 'In Creation',
        title_ko: '창작 영역',
        description: 'You capture truth through your chosen medium.',
        description_ko: '선택한 매체로 진실을 포착합니다'
      }
    ],
    recommendedArtists: [
      {
        name: 'Dorothea Lange',
        period: 'Documentary Photography',
        image: '/images/artists/lange.jpg',
        whyYouConnect: 'Her social documentation matches your truth-seeking nature',
        whyYouConnect_ko: '그녀의 사회적 기록은 당신의 진실 추구 본성과 맞아떨어집니다',
        emotionalTag: 'Honest witness',
        emotionalTag_ko: '정직한 목격자'
      },
      {
        name: 'Diego Rivera',
        period: 'Mexican Muralism',
        image: '/images/artists/rivera.jpg',
        whyYouConnect: 'His social narratives appeal to your analytical wandering',
        whyYouConnect_ko: '그의 사회적 서사들은 당신의 분석적 방랑에 호소합니다',
        emotionalTag: 'Epic documentation',
        emotionalTag_ko: '서사적 기록'
      },
      {
        name: 'Kehinde Wiley',
        period: 'Contemporary',
        image: '/images/artists/wiley.jpg',
        whyYouConnect: 'His reimagined portraits speak to your fresh perspective on tradition',
        whyYouConnect_ko: '그의 재해석된 초상화들은 전통에 대한 당신의 새로운 관점에 말을 건넩니다',
        emotionalTag: 'Contemporary truth',
        emotionalTag_ko: '동시대의 진실'
      }
    ]
  },

  // Lone Wolf + Realistic + Logical + Structured
  LRMC: {
    type: 'LRMC',
    title: 'The Systematic Researcher',
    title_ko: '체계적 연구자',
    subtitle: 'Building comprehensive understanding through methodical study',
    subtitle_ko: '체계적 연구로 포괄적 이해를 구축하는',
    essence: 'You approach realistic art like a master studying under masters. Your systematic, logical approach to understanding technique and composition is pursued in focused solitude, where you can fully immerse yourself in analyzing the craft behind the creation.',
    essence_ko: '당신은 미술관을 연구소처럼 활용합니다. 사실주의 작품의 기법과 구성을 체계적으로 연구하고, 각 작품의 역사적 맥락과 기술적 특성을 꾼꾼히 분석합니다. 혼자만의 집중된 연구 시간을 통해 예술에 대한 포괄적 이해를 구축합니다.',
    strengths: [
      {
        icon: '⚙️',
        title: 'Technical Analysis',
        title_ko: '기술적 분석',
        description: 'You understand the how behind the what',
        description_ko: '작품 뒤에 숨은 기법을 이해합니다'
      },
      {
        icon: '📐',
        title: 'Compositional Logic',
        title_ko: '구성의 논리',
        description: 'You see the mathematics in masterpieces',
        description_ko: '걸작에서 수학적 원리를 발견합니다'
      },
      {
        icon: '🎓',
        title: 'Scholarly Depth',
        title_ko: '학구적 깊이',
        description: 'You build expertise through systematic study',
        description_ko: '체계적 학습으로 전문성을 구축합니다'
      }
    ],
    recognition: [
      'Studying techniques',
      'Analyzing methods',
      'Building expertise',
      'Solitary mastery'
    ],
    recognition_ko: [
      '작품의 기법을 체계적으로 연구하는',
      '사실주의 회화의 구성 원리를 분석하는',
      '혼자만의 연구 노트를 작성하는',
      '예술사와 기법을 체계적으로 정리하는'
    ],
    lifeExtension: 'This technical mastery extends to your professional life (perhaps in fields requiring precision and expertise), your hobbies (likely involving craftsmanship or detailed study), and your learning style (deep, systematic, and thorough).',
    lifeExtension_ko: '체계적 연구자로서의 예술 감상은 삶의 다른 영역에도 영향을 미쳤습니다. 사실주의 작품을 체계적으로 연구하듯, 모든 분야에서 깊이 있는 탐구를 추구합니다. 미술관은 당신에게 지식을 체계화하는 연구실이 됩니다.',
    lifeAreas: [
      {
        title: 'In Craft',
        title_ko: '기예 영역',
        description: 'You pursue mastery in your chosen fields.',
        description_ko: '선택한 분야에서 장인의 경지를 추구합니다'
      },
      {
        title: 'In Study',
        title_ko: '학습 영역',
        description: 'You build comprehensive understanding systematically.',
        description_ko: '체계적으로 포괄적 이해를 구축합니다'
      },
      {
        title: 'In Appreciation',
        title_ko: '감상 영역',
        description: 'You value skill and technique highly.',
        description_ko: '기량과 기법의 가치를 높이 평가합니다'
      }
    ],
    recommendedArtists: [
      {
        name: 'John Singer Sargent',
        period: 'American Realism',
        image: '/images/artists/sargent.jpg',
        whyYouConnect: 'His technical brilliance rewards your analytical eye',
        whyYouConnect_ko: '그의 기술적 탁월함은 당신의 분석적 시선에 보상을 줍니다',
        emotionalTag: 'Masterful precision',
        emotionalTag_ko: '대가의 정밀함'
      },
      {
        name: 'Chuck Close',
        period: 'Photorealism',
        image: '/images/artists/close.jpg',
        whyYouConnect: 'His systematic approach to portraiture matches your methodical nature',
        whyYouConnect_ko: '그의 초상화에 대한 체계적 접근은 당신의 방법론적 본성과 맞아떨어집니다',
        emotionalTag: 'Systematic mastery',
        emotionalTag_ko: '체계적 숙달'
      },
      {
        name: 'Gottfried Helnwein',
        period: 'Hyperrealism',
        image: '/images/artists/helnwein.jpg',
        whyYouConnect: 'His technical precision appeals to your appreciation of craft',
        whyYouConnect_ko: '그의 기술적 정밀함은 장인정신에 대한 당신의 감상에 호소합니다',
        emotionalTag: 'Disturbing perfection',
        emotionalTag_ko: '불편한 완벽함'
      }
    ]
  },

  // Social + Realistic + Emotional + Flow-oriented
  SREF: {
    type: 'SREF',
    title: 'The Emotional Storyteller',
    title_ko: '감성 이야기꾼',
    subtitle: 'Spinning stories from shared gazes',
    subtitle_ko: '공유된 시선으로부터 이야기를 엮어내는',
    essence: 'Art is your bridge to others\' hearts. You see every realistic painting as a story to share, an emotion to explore together. Your flow-oriented approach to gallery visits often includes spontaneous connections with strangers, united by a shared moment of recognition in a painted face.',
    essence_ko: '예술은 다른 사람들의 마음으로 가는 다리입니다. 모든 사실적 그림은 함께 나눌 이야기이자 탐구할 감정이죠. 흐름을 따르는 갤러리 방문은 종종 낯선 이와의 즉흥적인 연결로 이어지며, 그려진 얼굴에서 발견한 공감의 순간으로 하나가 됩니다.',
    strengths: [
      {
        icon: '💕',
        title: 'Emotional Bridge-Building',
        title_ko: '감정의 다리 놓기',
        description: 'You connect people through shared feelings',
        description_ko: '공유된 감정으로 사람들을 연결합니다'
      },
      {
        icon: '🎭',
        title: 'Story Animation',
        title_ko: '이야기에 생명 불어넣기',
        description: 'You bring paintings to life through narrative',
        description_ko: '서사를 통해 그림에 생명을 불어넣습니다'
      },
      {
        icon: '🌟',
        title: 'Spontaneous Connection',
        title_ko: '즉흥적 연결',
        description: 'You create magical moments with others',
        description_ko: '다른 사람들과 마법 같은 순간을 만들어냅니다'
      }
    ],
    recognition: [
      'Making friends in galleries',
      'Sharing personal stories',
      'Group gallery adventures',
      'Emotional art discussions'
    ],
    recognition_ko: [
      '갤러리에서 친구를 만드는 모습',
      '개인적 이야기를 나누는 태도',
      '그룹 갤러리 모험',
      '감정적인 예술 토론'
    ],
    lifeExtension: 'This story-sharing nature influences your social life (rich with meaningful connections), your communication style (narrative and emotionally open), and your creative pursuits (likely involving human stories).',
    lifeExtension_ko: '이런 이야기를 나누는 본성은 의미 있는 연결로 풍부한 사교 생활을 만들고, 서사적이고 감정적으로 열린 소통 방식을 형성하며, 인간의 이야기가 담긴 창작 활동을 추구하게 합니다.',
    lifeAreas: [
      {
        title: 'In Relationships',
        title_ko: '관계 영역',
        description: 'You bond through shared stories and emotions.',
        description_ko: '공유한 이야기와 감정으로 유대감을 형성합니다'
      },
      {
        title: 'In Communication',
        title_ko: '소통 영역',
        description: 'You speak in narratives that touch hearts.',
        description_ko: '마음을 움직이는 서사로 말합니다'
      },
      {
        title: 'In Community',
        title_ko: '공동체 영역',
        description: 'You create spaces for authentic human connection.',
        description_ko: '진정한 인간적 연결을 위한 공간을 만듭니다'
      }
    ],
    recommendedArtists: [
      {
        name: 'Mary Cassatt',
        period: 'Impressionism',
        image: '/images/artists/cassatt.jpg',
        whyYouConnect: 'Her intimate family scenes mirror your connective nature',
        whyYouConnect_ko: '그녀의 친밀한 가족 장면들은 당신의 연결적 본성을 반영합니다',
        emotionalTag: 'Tender moments',
        emotionalTag_ko: '부드러운 순간들'
      },
      {
        name: 'Norman Rockwell',
        period: 'American Illustration',
        image: '/images/artists/rockwell.jpg',
        whyYouConnect: 'His storytelling matches your narrative sharing spirit',
        whyYouConnect_ko: '그의 이야기 전달력은 당신의 서사적 공유 정신과 맞아떨어집니다',
        emotionalTag: 'Shared nostalgia',
        emotionalTag_ko: '공유된 향수'
      },
      {
        name: 'Amy Sherald',
        period: 'Contemporary',
        image: '/images/artists/sherald.jpg',
        whyYouConnect: 'Her powerful portraits inspire the connections you seek',
        whyYouConnect_ko: '그녀의 강렬한 초상화들은 당신이 추구하는 연결에 영감을 줍니다',
        emotionalTag: 'Dignified stories',
        emotionalTag_ko: '품위 있는 이야기'
      }
    ]
  },

  // Social + Realistic + Emotional + Structured
  SREC: {
    type: 'SREC',
    title: 'The Heart Curator',
    title_ko: '마음의 큐레이터',
    subtitle: 'Cultivating gardens of collective emotion',
    subtitle_ko: '집단 감정의 정원을 가꾸는',
    essence: 'You have a gift for guiding others through the emotional landscapes of realistic art. Your structured approach to sharing helps groups process complex feelings through figurative works, creating safe spaces for collective emotional exploration and understanding.',
    essence_ko: '당신은 사실주의 예술의 감정적 풍경을 통해 다른 사람들을 안내하는 재능을 가지고 있습니다. 체계적인 공유 접근법은 그룹이 구상 작품을 통해 복잡한 감정을 처리하도록 돕고, 집단적 감정 탐구와 이해를 위한 안전한 공간을 만듭니다.',
    strengths: [
      {
        icon: '🎨',
        title: 'Emotional Facilitation',
        title_ko: '감정 촉진',
        description: 'You guide group emotional experiences',
        description_ko: '그룹의 감정적 경험을 안내합니다'
      },
      {
        icon: '🏛️',
        title: 'Structured Sharing',
        title_ko: '체계적 공유',
        description: 'You create frameworks for feeling together',
        description_ko: '함께 느끼기 위한 틀을 만들어냅니다'
      },
      {
        icon: '❤️',
        title: 'Collective Healing',
        title_ko: '집단적 치유',
        description: 'You use art for group emotional processing',
        description_ko: '예술을 통해 그룹의 감정을 처리합니다'
      }
    ],
    recognition: [
      'Leading emotional tours',
      'Facilitating art therapy',
      'Creating safe spaces',
      'Structured discussions'
    ],
    recognition_ko: [
      '감정적 투어를 이끌는 모습',
      '예술 치료를 촉진하는 태도',
      '안전한 공간을 만드는 능력',
      '체계적인 토론 진행'
    ],
    lifeExtension: 'This curatorial nature extends to your professional calling (perhaps in counseling, teaching, or community work), your social role (the emotional facilitator), and your personal mission (helping others understand their feelings).',
    lifeExtension_ko: '이런 큐레이터적 본성은 상담이나 교육, 커뮤니티 활동 같은 직업적 소명으로 확장되고, 감정적 촉진자라는 사회적 역할을 부여하며, 다른 사람들이 자신의 감정을 이해하도록 돕는 개인적 사명을 갖게 합니다.',
    lifeAreas: [
      {
        title: 'In Facilitation',
        title_ko: '촉진 영역',
        description: 'You excel at guiding group emotional processes.',
        description_ko: '그룹의 감정적 과정을 안내하는 데 뛰어납니다'
      },
      {
        title: 'In Support',
        title_ko: '지원 영역',
        description: 'You create structures that help others feel safely.',
        description_ko: '다른 사람들이 안전하게 느낄 수 있는 구조를 만듭니다'
      },
      {
        title: 'In Healing',
        title_ko: '치유 영역',
        description: 'You use beauty to help process difficult emotions.',
        description_ko: '아름다움을 통해 어려운 감정을 처리하도록 돕습니다'
      }
    ],
    recommendedArtists: [
      {
        name: 'Frida Kahlo',
        period: 'Mexican Surrealism',
        image: '/images/artists/kahlo.jpg',
        whyYouConnect: 'Her emotional honesty provides rich material for group processing',
        whyYouConnect_ko: '그녀의 감정적 솔직함은 그룹 처리를 위한 풍부한 재료를 제공합니다',
        emotionalTag: 'Shared pain',
        emotionalTag_ko: '공유된 고통'
      },
      {
        name: 'Alice Neel',
        period: 'American Portraiture',
        image: '/images/artists/neel.jpg',
        whyYouConnect: 'Her psychological portraits facilitate emotional discussions',
        whyYouConnect_ko: '그녀의 심리적 초상화들은 감정적 토론을 촉진합니다',
        emotionalTag: 'Human complexity',
        emotionalTag_ko: '인간의 복잡함'
      },
      {
        name: 'Kara Walker',
        period: 'Contemporary',
        image: '/images/artists/walker.jpg',
        whyYouConnect: 'Her challenging narratives create space for difficult conversations',
        whyYouConnect_ko: '그녀의 도전적인 서사들은 어려운 대화를 위한 공간을 만들어냅니다',
        emotionalTag: 'Collective reckoning',
        emotionalTag_ko: '집단적 성찰'
      }
    ]
  },

  // Social + Realistic + Logical + Flow-oriented
  SRMF: {
    type: 'SRMF',
    title: 'The Social Explorer',
    title_ko: '사회적 탐험가',
    subtitle: 'Navigating humanity through visual chronicles',
    subtitle_ko: '시각적 연대기를 통해 인류를 항해하는',
    essence: 'You turn gallery visits into cultural expeditions, using realistic art as a lens to explore and discuss human society with others. Your logical yet free-flowing approach creates dynamic group experiences where art becomes a springboard for understanding culture, history, and human nature.',
    essence_ko: '당신은 갤러리 방문을 문화적 탐험으로 바꿉니다. 사실주의 예술을 렌즈 삼아 다른 사람들과 함께 인간 사회를 탐구하고 토론하죠. 논리적이면서도 자유롭게 흐르는 접근은 예술이 문화와 역사, 인간 본성을 이해하는 발판이 되는 역동적인 그룹 경험을 만듭니다.',
    strengths: [
      {
        icon: '🌍',
        title: 'Cultural Analysis',
        title_ko: '문화적 분석',
        description: 'You decode societies through their art',
        description_ko: '예술을 통해 사회를 해독합니다'
      },
      {
        icon: '🔄',
        title: 'Dynamic Discussion',
        title_ko: '역동적 토론',
        description: 'You facilitate flowing cultural conversations',
        description_ko: '흐르는 문화적 대화를 촉진합니다'
      },
      {
        icon: '🎪',
        title: 'Social Anthropology',
        title_ko: '사회적 인류학',
        description: 'You explore humanity through group observation',
        description_ko: '그룹 관찰을 통해 인류를 탐구합니다'
      }
    ],
    recognition: [
      'Leading cultural tours',
      'Sparking debates',
      'Cross-cultural connections',
      'Dynamic group energy'
    ],
    recognition_ko: [
      '문화적 투어를 이끌는 모습',
      '토론을 촉발하는 태도',
      '문화 간 연결을 만드는 능력',
      '역동적인 그룹 에너지'
    ],
    lifeExtension: 'This cultural exploration shapes your travel style (immersive and social), your interests (anthropology, sociology, history), and your social circles (diverse and intellectually curious).',
    lifeExtension_ko: '이런 문화적 탐구는 몰입적이고 사회적인 여행 스타일을 형성하고, 인류학이나 사회학, 역사에 대한 관심을 키우며, 다양하고 지적 호기심이 강한 사교 모임을 만들게 합니다.',
    lifeAreas: [
      {
        title: 'In Travel',
        title_ko: '여행 영역',
        description: 'You explore cultures through their artistic expressions.',
        description_ko: '예술적 표현을 통해 문화를 탐험합니다'
      },
      {
        title: 'In Learning',
        title_ko: '학습 영역',
        description: 'You understand societies through collective observation.',
        description_ko: '집단적 관찰을 통해 사회를 이해합니다'
      },
      {
        title: 'In Connection',
        title_ko: '연결 영역',
        description: 'You bridge cultures through shared appreciation.',
        description_ko: '공유된 감상을 통해 문화를 연결합니다'
      }
    ],
    recommendedArtists: [
      {
        name: 'Banksy',
        period: 'Contemporary Street Art',
        image: '/images/artists/banksy.jpg',
        whyYouConnect: 'His social commentary sparks the discussions you love',
        whyYouConnect_ko: '그의 사회적 논평은 당신이 사랑하는 토론을 촉발합니다',
        emotionalTag: 'Cultural critique',
        emotionalTag_ko: '문화적 비평'
      },
      {
        name: 'JR',
        period: 'Contemporary Photography',
        image: '/images/artists/jr.jpg',
        whyYouConnect: 'His global projects match your cultural exploration spirit',
        whyYouConnect_ko: '그의 글로벌 프로젝트들은 당신의 문화 탐구 정신과 맞아떨어집니다',
        emotionalTag: 'Human connection',
        emotionalTag_ko: '인간적 연결'
      },
      {
        name: 'Ai Weiwei',
        period: 'Contemporary',
        image: '/images/artists/weiwei.jpg',
        whyYouConnect: 'His political art fuels your analytical discussions',
        whyYouConnect_ko: '그의 정치적 예술은 당신의 분석적 토론에 활력을 불어넣습니다',
        emotionalTag: 'Social consciousness',
        emotionalTag_ko: '사회적 의식'
      }
    ]
  },

  // Social + Realistic + Logical + Structured
  SRMC: {
    type: 'SRMC',
    title: 'The Culture Guide',
    title_ko: '문화 안내자',
    subtitle: 'Illuminating art through systematic exploration',
    subtitle_ko: '체계적 탐구를 통해 예술을 밝히는',
    essence: 'You experience art as a structured journey of discovery. Your methodical approach to viewing realistic works creates layers of understanding - from technical mastery to cultural context. You naturally guide others through these layers, transforming shared gallery visits into rich educational experiences.',
    essence_ko: '당신에게 예술은 체계적인 발견의 여정입니다. 사실적 작품을 보는 방법론적 접근은 기술적 숙달부터 문화적 맥락까지 층층이 쌓인 이해를 만듭니다. 자연스럽게 다른 사람들을 이러한 층위로 안내하여 공유된 갤러리 방문을 풍부한 교육적 경험으로 변화시킵니다.',
    strengths: [
      {
        icon: '🎨',
        title: 'Technical Analysis',
        title_ko: '기술적 분석',
        description: 'You decode the craft behind masterpieces',
        description_ko: '걸작 뒤에 숨겨진 기법을 해독합니다'
      },
      {
        icon: '📖',
        title: 'Art Historical Context',
        title_ko: '미술사적 맥락',
        description: 'You place works within their cultural moment',
        description_ko: '작품을 그들의 문화적 순간 안에 위치시킵니다'
      },
      {
        icon: '🌍',
        title: 'Collaborative Learning',
        title_ko: '협력적 학습',
        description: 'You create shared understanding through discussion',
        description_ko: '토론을 통해 공유된 이해를 만들어냅니다'
      }
    ],
    recognition: [
      'Explaining brushwork techniques',
      'Connecting art to history',
      'Leading gallery discussions',
      'Creating art appreciation guides'
    ],
    recognition_ko: [
      '붓터치 기법을 설명하는',
      '예술을 역사와 연결하는',
      '갤러리 토론을 이끄는',
      '예술 감상 가이드를 만드는'
    ],
    lifeExtension: 'Your systematic approach to art appreciation shapes how you navigate life. You naturally organize your workspace for maximum productivity, choose quality items that last, and build relationships through shared learning experiences. Your eye for detail and structured thinking make you the go-to person for planning memorable experiences.',
    lifeExtension_ko: '예술을 체계적으로 감상하는 방식이 삶을 살아가는 태도로 이어집니다. 업무 공간을 자연스럽게 효율적으로 정리하고, 오래가는 품질 좋은 물건을 선택하며, 함께 배우는 경험을 통해 관계를 쌓아갑니다. 세심한 관찰력과 체계적인 사고로 기억에 남는 경험을 기획하는 사람이 되죠.',
    lifeAreas: [
      {
        title: 'In Teaching',
        title_ko: '가르침에서',
        description: 'You break down complex ideas into clear, digestible steps, making learning enjoyable and accessible.',
        description_ko: '복잡한 개념을 명확하고 이해하기 쉬운 단계로 나누어 학습을 즐겁고 접근 가능하게 만듭니다.'
      },
      {
        title: 'In Organization',
        title_ko: '조직에서',
        description: 'You create systems that help teams work efficiently while maintaining quality and attention to detail.',
        description_ko: '품질과 세심함을 유지하면서 팀이 효율적으로 일할 수 있는 시스템을 만듭니다.'
      },
      {
        title: 'In Leadership',
        title_ko: '리더십에서',
        description: 'You guide others by sharing knowledge and creating structured environments where everyone can contribute.',
        description_ko: '지식을 공유하고 모든 사람이 기여할 수 있는 체계적인 환경을 만들어 다른 사람들을 이끕니다.'
      }
    ],
    recommendedArtists: [
      {
        name: 'Gustave Courbet',
        period: 'Realism',
        image: '/images/artists/courbet.jpg',
        whyYouConnect: 'His democratic realism aligns with your educational mission',
        whyYouConnect_ko: '그의 민주적 사실주의는 당신의 교육적 사명과 일치합니다',
        emotionalTag: 'Accessible truth',
        emotionalTag_ko: '접근 가능한 진실'
      },
      {
        name: 'Leonardo da Vinci',
        period: 'Renaissance',
        image: '/images/artists/davinci.jpg',
        whyYouConnect: 'His systematic approach to art, science, and teaching embodies your methodical nature',
        whyYouConnect_ko: '예술, 과학, 교육에 대한 그의 체계적 접근은 당신의 방법론적 성격을 구현합니다',
        emotionalTag: 'Universal genius',
        emotionalTag_ko: '만능 천재'
      },
      {
        name: 'Judy Chicago',
        period: 'Feminist Art',
        image: '/images/artists/chicago.jpg',
        whyYouConnect: 'Her collaborative works match your collective education approach',
        whyYouConnect_ko: '그녀의 협업 작품들은 당신의 집단적 교육 접근과 맞아떨어집니다',
        emotionalTag: 'Shared learning',
        emotionalTag_ko: '공유된 학습'
      }
    ]
  }
};