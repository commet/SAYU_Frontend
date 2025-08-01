// 🎨 SAYU Personality Descriptions - Personal Art Journey Types

import { SAYUTypeCode } from '@/types/sayu-shared';

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
  growth?: Array<{
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
    alternativeArtist?: string; // Artvee에서 대체할 작가
    searchKeywords?: string[]; // 검색용 키워드
  }>;
}

/**
 * IMPORTANT: This file uses the centralized SAYU type definitions from shared/SAYUTypeDefinitions.ts
 * Do not create duplicate type definitions here - always use the imported types.
 */
export const personalityDescriptions: Record<SAYUTypeCode, PersonalityDescription> = {
  // Lone + Abstract + Emotional + Flow
  LAEF: {
    type: 'LAEF',
    title: 'The Emotional Explorer',
    title_ko: '감성 탐험가',
    subtitle: 'Dancing with abstract emotions in solitude',
    subtitle_ko: '감정의 나침반을 따라 예술을 탐험하는',
    essence: 'You experience art like others experience music - not through analysis or structure, but through pure emotional resonance. In the sanctuary of solitude, abstract forms become mirrors to your inner landscape, each color and gesture speaking a language only your heart understands. You don\'t follow museum maps; you follow the invisible threads of feeling that pull you from one piece to another, creating your own constellation of meaning.',
    essence_ko: '당신에게 예술은 분석의 대상이 아닌 느낌의 대화입니다. 고요한 전시실에서 추상화와 마주할 때, 색과 형태는 당신만이 알아듣는 언어로 말을 걸어옵니다. 미술관 지도를 따르기보다는 마음이 끌리는 작품에서 작품으로 자연스레 흘러가며, 그 과정에서 자신만의 의미의 별자리를 그려나갑니다.\n\n혼자만의 시간은 당신에게 필수적입니다. 그 속에서만 작품이 전하는 미묘한 감정의 결을 온전히 느낄 수 있으니까요. 한 점의 그림 앞에서 시간을 잊고 서 있을 때, 당신은 가장 충만한 예술적 경험을 합니다.',
    strengths: [
      {
        icon: '🌊',
        title: 'Emotional Resonance',
        title_ko: '감정적 공명',
        description: 'You possess a rare ability to attune to the emotional frequencies in abstract art, sensing subtle shifts in mood and energy that create profound personal connections',
        description_ko: '추상 예술이 품은 감정의 파장을 느끼는 특별한 감각을 지녔습니다. 남들이 지나치는 미묘한 정서의 떨림까지 포착하며, 작품과 깊은 내적 대화를 나눕니다'
      },
      {
        icon: '🌌',
        title: 'Unstructured Discovery',
        title_ko: '자유로운 발견',
        description: 'Your spontaneous approach to art viewing allows for serendipitous discoveries and unexpected emotional revelations that planned routes might miss',
        description_ko: '정해진 순서 없이 마음 가는 대로 둘러보는 당신의 방식은 뜻밖의 감동을 선사합니다. 계획된 관람이 놓칠 수 있는 특별한 순간들을 발견하죠'
      },
      {
        icon: '🕊️',
        title: 'Contemplative Presence',
        title_ko: '명상적 현존',
        description: 'In solitude, you achieve a meditative state where art becomes a dialogue between your inner world and the artist\'s expression',
        description_ko: '홀로 작품과 마주할 때 당신은 일종의 명상 상태에 들어갑니다. 내면의 목소리와 작가의 표현이 만나 깊은 교감을 이루는 순간입니다'
      }
    ],
    growth: [
      {
        icon: '🌱',
        title: 'Expanding Your Artistic Vocabulary',
        title_ko: '예술적 어휘 확장하기',
        description: 'While your emotional intelligence is exceptional, learning some art historical context can add new dimensions to your intuitive understanding',
        description_ko: '타고난 감성에 작품의 배경 지식을 더한다면, 더욱 풍성한 감상의 세계가 열릴 거예요. 아는 만큼 보이고, 느끼는 만큼 깊어지니까요'
      },
      {
        icon: '🤝',
        title: 'Sharing Your Inner Journey',
        title_ko: '내면의 여정 나누기',
        description: 'Consider joining small, intimate art discussion groups where you can share your unique emotional insights in a comfortable setting',
        description_ko: '소수의 사람들과 함께하는 아늑한 예술 모임을 찾아보세요. 편안한 분위기에서라면 당신의 깊은 감상을 나누는 것도 즐거운 경험이 될 거예요'
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

  // Lone + Abstract + Emotional + Constructive
  LAEC: {
    type: 'LAEC',
    title: 'The Emotional Curator',
    title_ko: '감성 큐레이터',
    subtitle: 'Creating personal collections of emotional art experiences',
    subtitle_ko: '감정적 예술 경험의 개인 커렉션을 만드는',
    essence: 'You are an emotional archaeologist of abstract art, carefully excavating layers of feeling with methodical precision. Each gallery visit becomes a curatorial project where you map the emotional territories of color fields and gestural marks. Your unique gift lies in creating systematic pathways through the chaos of emotion, building personal taxonomies of feeling that help you understand not just what moves you, but why and how.',
    essence_ko: '당신은 추상 예술의 감정적 고고학자입니다. 세심한 방법론으로 감정의 층들을 발굴하고 분류합니다. 각 미술관 방문은 하나의 큐레이팅 프로젝트가 되어, 색면과 제스처의 감정적 영토를 매핑합니다.\n\n당신의 특별한 재능은 감정의 혼돈 속에서 체계적인 길을 만들어내는 것입니다. 감정의 개인적 분류 체계를 구축하여, 무엇이 당신을 움직이는지뿐만 아니라 왜, 그리고 어떻게 그런지를 이해합니다.',
    strengths: [
      {
        icon: '🎨',
        title: 'Emotional Cartography',
        title_ko: '감정의 지도 제작',
        description: 'You create mental maps of emotional territories within abstract works, cataloging nuances of feeling with remarkable precision',
        description_ko: '추상 작품 안에서 감정의 영토를 정신적으로 매핑하고, 놀라운 정밀도로 감정의 뉘앙스를 목록화합니다'
      },
      {
        icon: '📚',
        title: 'Systematic Sensitivity',
        title_ko: '체계적 감수성',
        description: 'Your organized approach to emotional experience allows you to build comprehensive understanding of abstract art\'s affective dimensions',
        description_ko: '감정적 경험에 대한 체계적 접근을 통해 추상 예술의 정서적 차원을 포괄적으로 이해합니다'
      },
      {
        icon: '🔍',
        title: 'Pattern Recognition',
        title_ko: '패턴 인식 능력',
        description: 'You identify recurring emotional themes across different abstract works, building a personal encyclopedia of artistic feelings',
        description_ko: '다양한 추상 작품들에서 반복되는 감정적 주제를 발견하고, 예술적 감정의 개인 백과사전을 구축합니다'
      }
    ],
    growth: [
      {
        icon: '✨',
        title: 'Embracing the Unclassifiable',
        title_ko: '분류할 수 없는 것 포용하기',
        description: 'Allow some artworks to remain mysterious and undefined in your emotional catalog - the ineffable has its own profound value',
        description_ko: '일부 작품들은 감정적 카탈로그에서 신비롭고 정의되지 않은 채로 남겨두세요. 형언할 수 없는 것에도 그 자체로 깊은 가치가 있습니다'
      },
      {
        icon: '🎲',
        title: 'Spontaneous Encounters',
        title_ko: '자발적 만남',
        description: 'Occasionally let chance guide your gallery visits - unexpected discoveries can enrich your carefully curated emotional archive',
        description_ko: '언제나 계획적으로만 움직이지 말고, 가끔은 발길 닿는 대로 가보세요. 예상 밖의 만남이 당신의 감성 컬렉션에 새로운 보물을 더해줄 거예요'
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

  // Lone + Abstract + Meaning-driven + Flow
  LAMF: {
    type: 'LAMF',
    title: 'The Intuitive Navigator',
    title_ko: '직관 탐색자',
    subtitle: 'Following artistic instincts through abstract realms',
    subtitle_ko: '직관을 따라 추상 예술의 세계를 항해하는',
    essence: 'You wander through abstract art like a philosopher through a forest of ideas - no map, no destination, just pure curiosity guiding your steps. Each artwork becomes a portal to new dimensions of thought, and you follow these intellectual adventures wherever they lead. Your mind dances between meaning and mystery, finding profound truths in the spaces between definition.',
    essence_ko: '당신은 추상 예술의 숲을 철학자처럼 거닙니다. 지도도 목적지도 없이, 오로지 호기심만이 발걸음을 이끕니다. 각 작품은 새로운 사유의 차원으로 통하는 문이 되고, 당신은 그 지적 모험을 마음껏 따라갑니다.\n\n의미와 신비 사이를 자유롭게 오가며, 정의되지 않은 공간에서 깊은 진리를 발견합니다. 추상 작품을 볼 때마다 \'이건 무엇을 말하려는 걸까?\'가 아닌 \'이것이 내게 어떤 생각의 문을 열어줄까?\'를 묻습니다.',
    strengths: [
      {
        icon: '🌀',
        title: 'Philosophical Wandering',
        title_ko: '철학적 방랑',
        description: 'You transform abstract art viewing into philosophical journeys, discovering profound questions and insights in every brushstroke',
        description_ko: '추상 예술 감상을 철학적 여행으로 승화시킵니다. 모든 붓터치에서 깊은 질문과 통찰을 발견하죠'
      },
      {
        icon: '🌊',
        title: 'Fluid Intelligence',
        title_ko: '유동적 사고',
        description: 'Your mind flows effortlessly between different interpretive frameworks, finding meaning in ambiguity and wisdom in uncertainty',
        description_ko: '다양한 해석의 틀 사이를 자유롭게 오갑니다. 모호함 속에서 의미를, 불확실함 속에서 지혜를 찾아내죠'
      },
      {
        icon: '🔮',
        title: 'Intuitive Synthesis',
        title_ko: '직관적 통합',
        description: 'You naturally synthesize disparate artistic elements into cohesive personal philosophies, creating unique intellectual frameworks',
        description_ko: '서로 다른 예술적 요소들을 자연스럽게 하나의 개인 철학으로 통합합니다. 당신만의 독특한 사유 체계를 만들어가죠'
      }
    ],
    growth: [
      {
        icon: '🌏',
        title: 'Grounding Your Insights',
        title_ko: '통찰의 접지',
        description: 'While your philosophical flights are valuable, occasionally connecting them to concrete artistic contexts can deepen your understanding',
        description_ko: '철학적 비상은 소중하지만, 가끔은 구체적인 예술사적 맥락과 연결시켜보세요. 당신의 깊은 통찰이 더욱 풍성해질 거예요'
      },
      {
        icon: '📝',
        title: 'Capturing Ephemeral Thoughts',
        title_ko: '찰나의 생각 포착하기',
        description: 'Consider keeping a small notebook for those brilliant insights that flash through your mind while wandering',
        description_ko: '방랑하며 스쳐가는 번뜩이는 통찰들을 위해 작은 노트를 지니고 다녀보세요. 나중에 그 생각들이 서로 연결되는 것을 발견할 거예요'
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

  // Lone + Abstract + Meaning-driven + Constructive
  LAMC: {
    type: 'LAMC',
    title: 'The Knowledge Collector',
    title_ko: '지식 수집가',
    subtitle: 'Gathering artistic knowledge systematically',
    subtitle_ko: '체계적으로 예술 지식을 수집하는',
    essence: 'You are the scholar of abstract realms, building encyclopedic knowledge through solitary deep dives. Each artwork becomes a data point in your grand theory of art, meticulously catalogued and cross-referenced. Your museum visits are archaeological expeditions where you excavate layers of meaning, technique, and historical context with the patience of a master craftsman.',
    essence_ko: '당신은 추상 예술의 학자입니다. 혼자만의 깊은 탐구를 통해 백과사전적 지식을 구축해가죠. 각 작품은 당신의 거대한 예술 이론 속 하나의 데이터가 되어 꾸꾸히 분류되고 연결됩니다.\n\n미술관 방문은 고고학적 탐험과 같습니다. 장인의 인내력으로 의미, 기법, 역사적 맥락의 층들을 하나하나 발굴해냅니다. 추상 작품을 볼 때도 단순히 느끼기보다는 그 이면의 이론적 토대를 차근차근 파헤쳐 나갑니다.',
    strengths: [
      {
        icon: '🗺️',
        title: 'Comprehensive Mapping',
        title_ko: '포괄적 매핑',
        description: 'You create mental atlases of abstract art movements, understanding how each piece fits into the grand narrative of art history',
        description_ko: '추상 예술 운동의 정신적 지도를 그립니다. 각 작품이 예술사의 거대한 서사 속 어디에 위치하는지 정확히 파악합니다'
      },
      {
        icon: '🏛️',
        title: 'Archival Mind',
        title_ko: '아카이브적 사고',
        description: 'Your systematic approach to collecting and organizing artistic knowledge creates a personal museum of understanding',
        description_ko: '예술 지식을 수집하고 정리하는 체계적 접근으로 이해의 개인 박물관을 만들어갑니다'
      },
      {
        icon: '🔗',
        title: 'Connective Intelligence',
        title_ko: '연결형 지능',
        description: 'You excel at finding hidden relationships between disparate artistic concepts, building bridges across time and style',
        description_ko: '서로 다른 예술적 개념들 사이의 숨겨진 관계를 찾아내는 데 뛰어납니다. 시대와 스타일을 가로지르는 다리를 놓죠'
      }
    ],
    growth: [
      {
        icon: '💫',
        title: 'Embracing the Ineffable',
        title_ko: '형언할 수 없는 것 포용하기',
        description: 'Allow yourself moments of pure aesthetic experience without analysis - some artistic truths exist beyond classification',
        description_ko: '분석 없이 순수한 미적 경험을 즐기는 시간을 가져보세요. 어떤 예술적 진실은 분류를 초월한 곳에 존재합니다'
      },
      {
        icon: '🌸',
        title: 'Spontaneous Appreciation',
        title_ko: '즉흥적 감상',
        description: 'Practice visiting galleries without prior research, letting discoveries unfold naturally to complement your systematic approach',
        description_ko: '사전 조사 없이 갤러리를 방문해보세요. 자연스러운 발견이 당신의 체계적 접근을 보완해줄 거예요'
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

  // Social + Abstract + Emotional + Flow
  SAEF: {
    type: 'SAEF',
    title: 'The Emotional Current',
    title_ko: '감정의 물결',
    subtitle: 'Creating spontaneous waves of artistic connection',
    subtitle_ko: '예술적 연결의 자연스러운 파장을 만드는',
    essence: 'You are like a tuning fork for human emotion—when you encounter abstract art, you vibrate at frequencies that others cannot help but feel. Your presence transforms gallery spaces into living ecosystems of shared feeling, where strangers become temporary soul companions through the wordless language of artistic resonance. You don\'t plan these connections; they arise naturally, like ripples in a pond, spreading outward from your authentic emotional responses.',
    essence_ko: '당신은 감정의 공명체입니다. 추상 작품 앞에서 당신이 느끼는 감정의 파동은 자연스럽게 주변 사람들에게 전해져, 낯선 이들조차 순간적으로 깊은 공감대를 형성하게 만듭니다. 계획하지 않아도 당신 주변에는 저절로 예술적 교감의 장이 형성됩니다.\n\n미술관에서 당신은 감정의 촉매제 역할을 합니다. 한 작품 앞에서 가슴 벅찬 감동을 느끼는 순간, 그 진실한 반응이 물결처럼 퍼져나가 다른 관람객들도 새로운 감정의 층위를 발견하게 됩니다. 당신이 지나간 자리에는 예술이 만든 특별한 연결의 흔적이 남습니다.',
    strengths: [
      {
        icon: '〰️',
        title: 'Emotional Resonance Field',
        title_ko: '감정 공명장',
        description: 'You naturally create an invisible field of emotional connection that draws others into deeper artistic experiences',
        description_ko: '주변에 보이지 않는 감정적 자기장을 형성하여, 다른 사람들이 자연스럽게 더 깊은 예술적 경험에 빠져들도록 만듭니다'
      },
      {
        icon: '🌊',
        title: 'Spontaneous Flow States',
        title_ko: '자발적 몰입 유도',
        description: 'Your fluid emotional responses help groups enter collective flow states where artistic appreciation becomes effortless and profound',
        description_ko: '당신의 자연스러운 감정 표현이 그룹을 집단적 몰입 상태로 이끌어, 예술 감상이 자연스럽고 깊이 있게 이루어집니다'
      },
      {
        icon: '🎭',
        title: 'Authentic Emotional Catalyst',
        title_ko: '진정한 감정 촉매',
        description: 'Your genuine reactions to abstract art give others permission to feel more deeply and express more freely',
        description_ko: '추상 예술에 대한 당신의 진실한 반응이 다른 사람들에게 더 깊이 느끼고 자유롭게 표현할 용기를 줍니다'
      }
    ],
    growth: [
      {
        icon: '🔄',
        title: 'Learning to Receive Flow',
        title_ko: '흐름 받아들이기 배우기',
        description: 'While you excel at creating emotional currents, practicing how to receive and be influenced by others\' artistic insights can deepen your own experience',
        description_ko: '감정의 물결을 만드는 데 뛰어나지만, 다른 사람들의 예술적 통찰을 받아들이고 영향받는 방법을 배운다면 당신의 경험도 더욱 풍부해질 거예요'
      },
      {
        icon: '📝',
        title: 'Capturing Ephemeral Moments',
        title_ko: '순간의 감동 포착하기',
        description: 'Consider keeping an emotional journal of your gallery experiences to help you understand the patterns in your artistic resonance',
        description_ko: '미술관에서의 감정적 경험을 기록해보세요. 당신의 예술적 공명 패턴을 이해하는 데 도움이 될 거예요'
      },
      {
        icon: '🌐',
        title: 'Building Lasting Connections',
        title_ko: '지속적 연결 구축하기',
        description: 'Transform your spontaneous gallery connections into lasting artistic relationships through follow-up conversations and shared experiences',
        description_ko: '갤러리에서의 우연한 만남을 후속 대화와 공유 경험을 통해 지속적인 예술적 관계로 발전시켜보세요'
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

  // Social + Abstract + Emotional + Constructive
  SAEC: {
    type: 'SAEC',
    title: 'The Emotional Architect',
    title_ko: '감정의 건축가',
    subtitle: 'Constructing bridges of understanding through abstract feeling',
    subtitle_ko: '추상적 감정을 통해 이해의 다리를 놓는',
    essence: 'You possess a rare gift: the ability to build emotional infrastructure where others see only chaos. In abstract art, you recognize the architectural blueprints of human feeling—how colors create emotional load-bearing walls, how compositions form bridges between souls. You don\'t just experience art socially; you construct communities around shared emotional discoveries, creating systematic pathways that help others navigate the vast territories of abstract expression.',
    essence_ko: '당신은 혼돈 속에서 감정의 구조를 발견하는 특별한 능력을 지녔습니다. 추상 미술을 마주할 때, 색채가 어떻게 감정의 기둥이 되고 구성이 어떻게 영혼 간의 다리를 놓는지 봅니다. 단순히 예술을 함께 즐기는 것이 아니라, 공유된 감정적 발견을 중심으로 공동체를 설계합니다.\n\n미술관에서 당신은 자연스럽게 감정의 해석자가 됩니다. 말로 표현하기 어려운 추상적 감동을 체계적으로 정리하여, 다른 사람들도 그 깊이를 느낄 수 있도록 안내합니다. 당신이 만든 감정의 지도를 따라 사람들은 예술의 새로운 영역을 탐험하게 됩니다.',
    strengths: [
      {
        icon: '🏗️',
        title: 'Emotional Architecture',
        title_ko: '감정의 설계술',
        description: 'You build systematic frameworks that help others understand the emotional structure within abstract compositions',
        description_ko: '추상 작품 속 감정의 구조를 체계적으로 파악하고, 다른 사람들이 이해할 수 있는 프레임워크를 설계합니다'
      },
      {
        icon: '🌉',
        title: 'Empathy Bridge-Building',
        title_ko: '공감의 교량술',
        description: 'You create meaningful connections between diverse emotional responses, helping groups find common ground in abstract art',
        description_ko: '서로 다른 감정적 반응들 사이의 의미 있는 연결점을 찾아내어, 추상 예술에서 공통분모를 발견할 수 있도록 돕습니다'
      },
      {
        icon: '🔬',
        title: 'Feeling Systematization',
        title_ko: '감정의 체계화',
        description: 'You transform intuitive emotional experiences into structured insights that can be shared and built upon by others',
        description_ko: '직관적인 감정 경험을 체계적 통찰로 변환하여, 다른 사람들이 공유하고 발전시킬 수 있는 형태로 만듭니다'
      }
    ],
    growth: [
      {
        icon: '🌱',
        title: 'Expanding Your Emotional Vocabulary',
        title_ko: '감정 어휘 확장하기',
        description: 'While you excel at systematizing feelings, exploring more nuanced emotional terminology can add precision to your architectural frameworks',
        description_ko: '감정을 체계화하는 데 뛰어나지만, 더 섬세한 감정 용어들을 탐구한다면 당신의 감정 설계에 더욱 정교함을 더할 수 있을 거예요'
      },
      {
        icon: '🎭',
        title: 'Embracing Constructive Chaos',
        title_ko: '건설적 혼돈 받아들이기',
        description: 'Sometimes allowing for unstructured emotional exploration can lead to breakthrough insights in your community building',
        description_ko: '때로는 체계 없는 감정적 탐험을 허용하는 것이 공동체 구축에서 혁신적 통찰을 가져다줄 수 있습니다'
      },
      {
        icon: '🗂️',
        title: 'Creating Emotional Archives',
        title_ko: '감정 아카이브 구축하기',
        description: 'Consider documenting your emotional frameworks and community insights to create resources that can help future art explorers',
        description_ko: '당신의 감정 프레임워크와 공동체 통찰을 기록하여, 미래의 예술 탐험가들에게 도움이 될 자료를 만들어보세요'
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

  // Social + Abstract + Meaning-driven + Flow
  SAMF: {
    type: 'SAMF',
    title: 'The Meaning Weaver',
    title_ko: '의미의 직조자',
    subtitle: 'Spinning threads of insight into tapestries of understanding',
    subtitle_ko: '통찰의 실을 짜서 이해의 태피스트리로 만드는',
    essence: 'You see abstract art as a vast library written in a language of symbols, colors, and forms waiting to be deciphered. Your gift lies in discovering the hidden threads of meaning that connect seemingly disparate elements, then weaving these insights together with others in spontaneous, flowing conversations that create entirely new understandings. You don\'t just interpret art—you help communities co-create meaning through collaborative exploration.',
    essence_ko: '당신에게 추상 미술은 기호와 색채, 형태로 쓰여진 거대한 도서관과 같습니다. 겉보기에 서로 관련 없어 보이는 요소들을 연결하는 숨겨진 의미의 실들을 발견하고, 이를 다른 사람들과 자유롭게 흐르는 대화 속에서 엮어 완전히 새로운 이해를 만들어내는 것이 당신의 재능입니다.\n\n미술관에서 당신은 의미의 탐정이자 직조자가 됩니다. 한 작품에서 발견한 통찰의 실을 다른 관람객의 해석과 엮어가며, 개별적 발견들이 집단적 지혜의 아름다운 태피스트리로 변화하는 모습을 지켜봅니다. 당신이 던진 하나의 질문이 예술에 대한 완전히 새로운 이해의 문을 열어줍니다.',
    strengths: [
      {
        icon: '🕸️',
        title: 'Symbolic Pattern Recognition',
        title_ko: '상징적 패턴 인식',
        description: 'You excel at detecting meaningful connections between abstract elements that others might miss, revealing hidden narrative threads in artistic compositions',
        description_ko: '다른 사람들이 놓칠 수 있는 추상적 요소들 간의 의미 있는 연결을 감지하는 데 뛰어나며, 예술 작품 속 숨겨진 서사의 실들을 드러냅니다'
      },
      {
        icon: '🧬',
        title: 'Interpretive Synthesis',
        title_ko: '해석적 종합',
        description: 'You weave together diverse perspectives from group discussions into cohesive new insights that expand everyone\'s understanding',
        description_ko: '그룹 토론에서 나온 다양한 관점들을 응집력 있는 새로운 통찰로 엮어, 모든 사람의 이해를 확장시킵니다'
      },
      {
        icon: '🌊',
        title: 'Fluid Meaning-Making',
        title_ko: '유동적 의미 창조',
        description: 'Your open-ended approach allows interpretations to evolve organically, leading groups toward unexpected discoveries about artistic significance',
        description_ko: '열린 접근 방식을 통해 해석이 자연스럽게 진화하도록 하여, 그룹을 예술적 의미에 대한 예상치 못한 발견으로 이끕니다'
      }
    ],
    growth: [
      {
        icon: '📚',
        title: 'Deepening Contextual Knowledge',
        title_ko: '맥락적 지식 심화',
        description: 'While your intuitive meaning-making is powerful, learning more art historical context can provide additional threads to weave into your interpretations',
        description_ko: '직관적 의미 창조 능력이 뛰어나지만, 미술사적 맥락을 더 배운다면 해석에 엮을 수 있는 추가적인 실들을 얻게 될 거예요'
      },
      {
        icon: '🎯',
        title: 'Balancing Flow with Focus',
        title_ko: '흐름과 집중의 균형',
        description: 'Sometimes grounding your free-flowing discussions in specific artistic elements can help create even more meaningful collective insights',
        description_ko: '때로는 자유로운 토론을 특정 예술적 요소에 기반을 두어 진행한다면 더욱 의미 있는 집단적 통찰을 만들어낼 수 있을 거예요'
      },
      {
        icon: '🗂️',
        title: 'Documenting Collective Discoveries',
        title_ko: '집단적 발견 기록하기',
        description: 'Consider capturing the meaning-weaving process itself to help others learn how to facilitate similar collaborative interpretation experiences',
        description_ko: '의미 직조 과정 자체를 기록하여, 다른 사람들이 비슷한 협력적 해석 경험을 촉진하는 방법을 배울 수 있도록 도와보세요'
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

  // Social + Abstract + Meaning-driven + Constructive
  SAMC: {
    type: 'SAMC',
    title: 'The Wisdom Architect',
    title_ko: '지혜의 건축가',
    subtitle: 'Building cathedrals of understanding from abstract insights',
    subtitle_ko: '추상적 통찰로부터 이해의 성당을 짓는',
    essence: 'You are a master builder of intellectual structures, transforming the ephemeral whispers of abstract art into solid foundations of collective understanding. Like a Renaissance architect designing a cathedral, you carefully lay out the blueprints for group learning, ensuring every pillar of interpretation supports the greater structure of shared wisdom. Your methodical approach doesn\'t diminish the mystery of art—it creates sacred spaces where meaning can unfold systematically and collectively.',
    essence_ko: '당신은 지적 구조물의 대가입니다. 추상 미술의 덧없는 속삭임을 집단적 이해의 견고한 기반으로 변환시킵니다. 르네상스 건축가가 성당을 설계하듯, 당신은 그룹 학습의 청사진을 세심하게 그려내며 해석의 모든 기둥이 공유된 지혜라는 더 큰 구조를 떠받치도록 합니다.\n\n미술관에서 당신은 지식의 건축가가 됩니다. 복잡하고 추상적인 예술적 개념들을 논리적 단계로 분해하고, 이를 다시 모든 사람이 이해할 수 있는 체계적 구조로 재조립합니다. 당신의 체계적 접근법은 예술의 신비로움을 해치지 않고, 오히려 의미가 체계적이고 집단적으로 펼쳐질 수 있는 신성한 공간을 만들어냅니다.',
    strengths: [
      {
        icon: '🏛️',
        title: 'Conceptual Architecture',
        title_ko: '개념적 건축술',
        description: 'You construct robust intellectual frameworks that transform abstract artistic concepts into accessible, structured knowledge systems',
        description_ko: '추상적 예술 개념을 접근 가능하고 체계적인 지식 시스템으로 변환하는 견고한 지적 프레임워크를 구축합니다'
      },
      {
        icon: '🔨',
        title: 'Systematic Construction',
        title_ko: '체계적 구축법',
        description: 'You methodically build group understanding from foundational concepts to complex interpretations, ensuring no one gets left behind',
        description_ko: '기초 개념부터 복잡한 해석까지 그룹의 이해를 체계적으로 구축하여, 아무도 뒤처지지 않도록 합니다'
      },
      {
        icon: '⚖️',
        title: 'Balanced Integration',
        title_ko: '균형적 통합',
        description: 'You skillfully balance individual insights with collective learning, creating stable structures of shared artistic understanding',
        description_ko: '개인적 통찰과 집단적 학습을 능숙하게 균형 맞춰, 공유된 예술적 이해의 안정적 구조를 만들어냅니다'
      }
    ],
    growth: [
      {
        icon: '🌱',
        title: 'Incorporating Organic Discovery',
        title_ko: '유기적 발견 통합하기',
        description: 'While your systematic approach is powerful, allowing space for spontaneous insights can add unexpected richness to your learning structures',
        description_ko: '체계적 접근법이 강력하지만, 자발적 통찰을 위한 공간을 허용한다면 학습 구조에 예상치 못한 풍부함을 더할 수 있을 거예요'
      },
      {
        icon: '🎨',
        title: 'Embracing Artistic Ambiguity',
        title_ko: '예술적 모호함 받아들이기',
        description: 'Sometimes allowing certain interpretations to remain beautifully unresolved can enhance the depth of collective understanding',
        description_ko: '때로는 특정 해석들이 아름답게 미해결 상태로 남아있도록 허용하는 것이 집단적 이해의 깊이를 향상시킬 수 있습니다'
      },
      {
        icon: '📐',
        title: 'Creating Adaptive Frameworks',
        title_ko: '적응형 프레임워크 창조하기',
        description: 'Consider developing flexible structures that can adapt to different group dynamics and artistic contexts while maintaining clarity',
        description_ko: '명확성을 유지하면서도 다양한 그룹 역학과 예술적 맥락에 적응할 수 있는 유연한 구조를 개발해보세요'
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

  // Lone + Realistic + Emotional + Flow
  LREF: {
    type: 'LREF',
    title: 'The Delicate Observer',
    title_ko: '섬세한 관찰자',
    subtitle: 'Finding subtle emotions in every detail',
    subtitle_ko: '모든 디테일에서 섬세한 감정을 발견하는',
    essence: 'You move through galleries like a poet through life, drawn to the whispered stories in realistic paintings. Each portrait holds a universe of unspoken emotions that only you seem to hear. In solitude, you become a detective of feeling, reading the subtle language of light on skin, the poetry in a turned shoulder, the entire life story written in the curve of a smile.',
    essence_ko: '당신은 삶을 거니는 시인처럼 미술관을 거닙니다. 사실적인 그림들이 속삭이는 이야기에 끌립니다. 각 초상화는 오직 당신만이 들을 수 있는 말하지 않은 감정의 우주를 품고 있습니다.\n\n고독 속에서 당신은 감정의 탐정이 됩니다. 피부 위에 떨어지는 빛의 미묘한 언어, 돌아선 어깨에 깃든 시, 미소의 곡선에 쓰여진 전 생애를 읽어냅니다. 다른 사람들이 지나치는 작은 디테일에서 인간 존재의 본질을 발견합니다.',
    strengths: [
      {
        icon: '👁️',
        title: 'Microscopic Sensitivity',
        title_ko: '미세한 감수성',
        description: 'You perceive emotional nuances others miss entirely - the tension in a painted hand, the story in a distant gaze, the weight of unspoken words in negative space',
        description_ko: '다른 사람들이 완전히 놓치는 감정의 뉴앙스를 포착합니다. 그려진 손에 깃든 긴장감, 먼 곳을 바라보는 시선에 담긴 이야기, 여백에 담긴 말하지 않은 말의 무게까지'
      },
      {
        icon: '🌅',
        title: 'Temporal Immersion',
        title_ko: '시간 몰입',
        description: 'Time dissolves when you connect with a painting - you live inside the moment captured, feeling the air, hearing the silence, knowing the before and after',
        description_ko: '그림과 연결될 때 시간은 녹아내립니다. 포착된 순간 안에 살면서 그 공기를 느끼고, 고요를 듣고, 전후의 이야기를 알게 됩니다'
      },
      {
        icon: '🌿',
        title: 'Solitary Depth',
        title_ko: '고독의 깊이',
        description: 'Your solo viewing creates an intimate dialogue with artworks that crowd-viewing could never achieve - a private conversation between souls',
        description_ko: '홀로 감상하는 시간은 작품과의 친밀한 대화를 만듭니다. 군중 속에서는 결코 달성할 수 없는, 영혼과 영혼의 사적인 대화를 나눅니다'
      }
    ],
    growth: [
      {
        icon: '🌍',
        title: 'Contextual Enrichment',
        title_ko: '맥락적 풍부함',
        description: 'While your emotional reading is profound, learning about the artist\'s life and times can add new layers to your already deep appreciation',
        description_ko: '당신의 감정적 해석은 이미 깊이가 있지만, 작가의 삶과 시대를 알아가면 더욱 풍성한 감상이 가능해집니다'
      },
      {
        icon: '👥',
        title: 'Selective Sharing',
        title_ko: '선택적 나눔',
        description: 'Consider sharing your unique observations with one trusted companion - your insights could open new worlds for others',
        description_ko: '신뢰하는 한 사람과 당신의 독특한 관찰을 나눠보세요. 당신의 통찰이 다른 이에게 새로운 세계를 열어줄 수 있습니다'
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

  // Lone + Realistic + Emotional + Constructive
  LREC: {
    type: 'LREC',
    title: 'The Deep Appreciator',
    title_ko: '깊이있는 감상자',
    subtitle: 'Finding profound meaning in every artistic element',
    subtitle_ko: '모든 예술적 요소에서 깊은 의미를 찾는',
    essence: 'You are a connoisseur of emotional detail, approaching realistic art like a vintner approaching wine - with method, patience, and reverence for subtle notes. Each painting becomes a world you inhabit completely, systematically exploring every corner while allowing your emotions to guide the journey. In solitude, you construct elaborate emotional architectures from visual details.',
    essence_ko: '당신은 감정의 섬세함을 음미하는 감정가입니다. 와인 감정가가 빈티지를 대하듯, 체계와 인내, 그리고 미묘한 노트에 대한 경외심으로 사실주의 작품에 다가갑니다.\n\n각 그림은 당신이 완전히 거주하는 세계가 됩니다. 모든 구석을 체계적으로 탐험하면서도 감정이 여행을 안내하도록 합니다. 고독 속에서 당신은 시각적 디테일로부터 정교한 감정의 건축물을 지어 올립니다.',
    strengths: [
      {
        icon: '🌌',
        title: 'Layered Appreciation',
        title_ko: '층층이 쌓인 감상',
        description: 'You experience art in successive waves - first the immediate impact, then technical mastery, finally the deepest emotional resonances',
        description_ko: '예술을 연속적인 파동으로 경험합니다. 첫째는 즉각적인 충격, 둘째는 기술적 숙련도, 마지막은 가장 깊은 감정적 공명'
      },
      {
        icon: '🎭',
        title: 'Emotional Archaeology',
        title_ko: '감정의 고고학',
        description: 'You excavate feelings from realistic paintings layer by layer, uncovering the sediment of human experience with scholarly patience',
        description_ko: '사실주의 그림에서 감정을 층층이 발굴합니다. 학자적 인내로 인간 경험의 퇴적물을 발견해냅니다'
      },
      {
        icon: '🎉',
        title: 'Structured Sensitivity',
        title_ko: '구조적 감수성',
        description: 'Your methodical approach paradoxically deepens emotional impact - system becomes a gateway to profound feeling',
        description_ko: '체계적 접근이 역설적으로 감정적 충격을 깊게 합니다. 시스템이 깊은 감정으로 가는 관문이 됩니다'
      }
    ],
    growth: [
      {
        icon: '🎭',
        title: 'Playful Exploration',
        title_ko: '유희적 탐험',
        description: 'Balance your deep dives with occasional surface swimming - sometimes the first impression holds its own complete truth',
        description_ko: '깊은 다이빙과 함께 가끔은 수면에서의 수영도 균형을 맞춰보세요. 때로는 첫인상이 그 자체로 완전한 진실을 담고 있습니다'
      },
      {
        icon: '🚀',
        title: 'Genre Adventures',
        title_ko: '장르 모험',
        description: 'Apply your deep appreciation skills to unexpected art forms - your careful attention could unlock new worlds',
        description_ko: '당신의 깊은 감상 기술을 예상치 못한 예술 형식에 적용해보세요. 세심한 주의가 새로운 세계를 열어줄 수 있습니다'
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

  // Lone + Realistic + Meaning-driven + Flow
  LRMF: {
    type: 'LRMF',
    title: 'The Free Analyst',
    title_ko: '자유로운 분석가',
    subtitle: 'Exploring artistic meaning with logical freedom',
    subtitle_ko: '논리적 자유로움으로 예술적 의미를 탐구하는',
    essence: 'You are a visual detective, moving through galleries with the freedom of a wanderer but the mind of an analyst. Realistic art becomes your evidence of human nature - each portrait a psychological study, each scene a sociological document. You trust your instincts to guide you to meaningful works, then apply sharp logic to decode their deeper messages about who we are.',
    essence_ko: '당신은 시각적 탐정입니다. 방랑자의 자유로움과 분석가의 마음을 동시에 가지고 미술관을 동다니죠. 사실주의 예술은 인간 본성의 증거가 됩니다. 각 초상화는 심리학적 연구이고, 각 장면은 사회학적 기록이죠.\n\n직관이 의미 있는 작품으로 안내하면, 날카로운 논리를 동원해 그 안에 숨겨진 인간에 대한 깊은 메시지를 해독합니다. 자유롭게 떠다니다가도, 마음에 걸리는 작품 앞에서는 멈춰 서서 진진한 분석을 시작합니다.',
    strengths: [
      {
        icon: '🔍',
        title: 'Visual Investigation',
        title_ko: '시각적 수사',
        description: 'You read realistic paintings like evidence files, extracting clues about human behavior, social dynamics, and historical truths that others miss',
        description_ko: '사실주의 그림을 증거 파일처럼 읽어냅니다. 다른 사람들이 놓치는 인간 행동, 사회적 역학, 역사적 진실에 대한 단서들을 추출해냅니다'
      },
      {
        icon: '🌀',
        title: 'Intuitive Logic',
        title_ko: '직관적 논리',
        description: 'Your free-flowing exploration style paradoxically leads to the most logical insights - trusting intuition to find what deserves analysis',
        description_ko: '자유롭게 흐르는 탐험 스타일이 역설적으로 가장 논리적인 통찰로 이끐니다. 직관을 신뢰해 분석할 가치가 있는 것을 찾아냅니다'
      },
      {
        icon: '🎭',
        title: 'Independent Theorizing',
        title_ko: '독립적 이론화',
        description: 'You construct original frameworks for understanding art and humanity, unburdened by academic conventions or popular interpretations',
        description_ko: '예술과 인간성을 이해하는 독창적인 체계를 구축합니다. 학술적 관례나 대중적 해석에 얽매이지 않고 자유롭게 사고합니다'
      }
    ],
    growth: [
      {
        icon: '🎨',
        title: 'Emotional Integration',
        title_ko: '감정적 통합',
        description: 'Balance your analytical insights with emotional appreciation - the heart often sees truths that logic misses',
        description_ko: '분석적 통찰과 감정적 감상의 균형을 맞춰보세요. 마음은 종종 논리가 놓치는 진실을 봅니다'
      },
      {
        icon: '⏳',
        title: 'Deep Dwelling',
        title_ko: '깊은 머무름',
        description: 'Occasionally resist the urge to move on - some artworks reveal their secrets only to those who linger',
        description_ko: '가끔은 다음으로 넘어가고 싶은 충동을 억제해보세요. 어떤 작품들은 오래 머무는 사람에게만 비밀을 드러냅니다'
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

  // Lone + Realistic + Meaning-driven + Constructive
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
        title: 'Compositional Lone',
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

  // Social + Realistic + Emotional + Flow
  SREF: {
    type: 'SREF',
    title: 'The Heart Wanderer',
    title_ko: '마음의 여행자',
    subtitle: 'Journeying through painted souls with fellow travelers',
    subtitle_ko: '동행자들과 함께 그려진 영혼들을 여행하는',
    essence: 'You wander through galleries like a compassionate explorer of human hearts, finding doorways into other worlds through every painted face, every captured gesture. Representational art speaks to you in the universal language of human experience—a mother\'s tender gaze, a child\'s wonder, an elder\'s wisdom. Your natural gift is transforming these visual encounters into bridges that connect you instantly with fellow travelers, creating spontaneous communities united by shared recognition of our common humanity.',
    essence_ko: '당신은 인간의 마음을 탐험하는 자비로운 여행자처럼 갤러리를 누빕니다. 그려진 모든 얼굴과 포착된 몸짓에서 다른 세계로 향하는 문을 발견하죠. 구상 미술은 인간 경험이라는 보편적 언어로 당신에게 말을 걸어옵니다—어머니의 부드러운 시선, 아이의 경이로움, 어른의 지혜.\n\n미술관에서 당신은 감정의 통역사가 됩니다. 그림 속 인물의 표정에서 읽어낸 이야기를 자연스럽게 주변 사람들과 나누며, 우연히 만난 낯선 이들과도 깊은 공감의 순간을 만들어냅니다. 당신이 지나간 자리에는 예술로 연결된 따뜻한 인연들이 꽃피어납니다.',
    strengths: [
      {
        icon: '🗺️',
        title: 'Emotional Cartography',
        title_ko: '감정의 지도 제작',
        description: 'You map the emotional territories hidden within representational artworks, creating pathways for others to follow and explore',
        description_ko: '구상 작품 속 숨겨진 감정의 영토를 지도로 그려내어, 다른 사람들이 따라가며 탐험할 수 있는 길을 만듭니다'
      },
      {
        icon: '🌊',
        title: 'Empathetic Flow Creation',
        title_ko: '공감의 흐름 창조',
        description: 'You naturally generate streams of emotional connection that carry groups through shared experiences of artistic discovery',
        description_ko: '그룹을 예술적 발견의 공유 경험으로 이끄는 감정적 연결의 흐름을 자연스럽게 만들어냅니다'
      },
      {
        icon: '🤝',
        title: 'Instant Kinship Building',
        title_ko: '즉석 유대 형성',
        description: 'Your ability to find common emotional ground through art creates immediate bonds with strangers who become temporary soul companions',
        description_ko: '예술을 통해 공통의 감정적 기반을 찾는 능력으로 낯선 이들과 즉각적 유대를 형성하여, 임시적 영혼의 동반자로 만듭니다'
      }
    ],
    growth: [
      {
        icon: '📖',
        title: 'Deepening Historical Context',
        title_ko: '역사적 맥락 심화하기',
        description: 'While your emotional intuition is remarkable, learning about the historical contexts of artworks can add layers to your wandering experiences',
        description_ko: '감정적 직관력이 놀랍지만, 작품의 역사적 맥락을 배운다면 여행 경험에 더 많은 층위를 더할 수 있을 거예요'
      },
      {
        icon: '📝',
        title: 'Capturing Journey Stories',
        title_ko: '여행 이야기 기록하기',
        description: 'Consider documenting the emotional journeys you facilitate to help others understand the power of art-mediated human connection',
        description_ko: '당신이 이끄는 감정적 여행들을 기록하여, 예술을 매개로 한 인간 연결의 힘을 다른 사람들이 이해할 수 있도록 도와보세요'
      },
      {
        icon: '🌐',
        title: 'Expanding Cultural Bridges',
        title_ko: '문화적 다리 확장하기',
        description: 'Explore how your gift for emotional connection through art can bridge not just individuals, but different cultural and generational perspectives',
        description_ko: '예술을 통한 감정적 연결 재능이 개인뿐만 아니라 다양한 문화적, 세대적 관점들을 어떻게 연결할 수 있는지 탐구해보세요'
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

  // Social + Realistic + Emotional + Constructive
  SREC: {
    type: 'SREC',
    title: 'The Emotional Healer',
    title_ko: '감정의 치유사',
    subtitle: 'Creating sacred spaces for collective emotional transformation',
    subtitle_ko: '집단적 감정 변화를 위한 신성한 공간을 만드는',
    essence: 'You possess the rare ability to recognize the therapeutic power hidden within representational art and transform gallery spaces into healing sanctuaries. Every painted face, every captured moment of human vulnerability becomes a mirror through which you help others safely confront and process their own emotional experiences. Your systematic approach to emotional exploration creates structured pathways for collective healing, where art becomes medicine for the soul.',
    essence_ko: '당신은 구상 미술 속에 숨겨진 치유의 힘을 알아보고, 갤러리를 치유의 성소로 변화시키는 특별한 능력을 지녔습니다. 그려진 모든 얼굴, 포착된 인간의 연약한 순간들이 거울이 되어 다른 사람들이 자신의 감정적 경험을 안전하게 마주하고 처리할 수 있도록 돕습니다.\n\n미술관에서 당신은 마음의 의사가 됩니다. 그림 속 인물들의 표정과 감정을 매개로 사람들이 자신의 내면을 들여다보고, 상처를 치유할 수 있는 체계적 과정을 설계합니다. 당신의 손길 아래 예술은 영혼을 위한 약이 되고, 갤러리는 집단적 회복의 공간이 됩니다.',
    strengths: [
      {
        icon: '🌿',
        title: 'Therapeutic Space Creation',
        title_ko: '치유 공간 창조',
        description: 'You transform gallery environments into safe havens where emotional vulnerability becomes a source of strength and connection',
        description_ko: '갤러리 환경을 감정적 취약성이 힘과 연결의 원천이 되는 안전한 피난처로 변화시킵니다'
      },
      {
        icon: '🔬',
        title: 'Systematic Emotional Processing',
        title_ko: '체계적 감정 처리',
        description: 'You develop structured methodologies that help groups navigate complex emotional territories through representational artworks',
        description_ko: '구상 작품을 통해 그룹이 복잡한 감정적 영역을 탐색할 수 있도록 돕는 체계적 방법론을 개발합니다'
      },
      {
        icon: '💊',
        title: 'Art as Medicine',
        title_ko: '약으로서의 예술',
        description: 'You understand how to prescribe specific artworks and experiences to facilitate different types of emotional healing and growth',
        description_ko: '다양한 유형의 감정적 치유와 성장을 촉진하기 위해 특정 작품과 경험을 처방하는 방법을 이해합니다'
      }
    ],
    growth: [
      {
        icon: '📚',
        title: 'Expanding Therapeutic Knowledge',
        title_ko: '치료적 지식 확장하기',
        description: 'Consider studying art therapy methodologies to deepen your natural healing abilities and create even more effective therapeutic experiences',
        description_ko: '자연스러운 치유 능력을 심화하고 더욱 효과적인 치료적 경험을 만들기 위해 예술 치료 방법론을 공부해보세요'
      },
      {
        icon: '🌱',
        title: 'Self-Care While Caring',
        title_ko: '돌봄 속에서 자기 돌봄',
        description: 'Remember to tend to your own emotional well-being while facilitating healing for others—your sensitivity is both a gift and something to nurture',
        description_ko: '다른 사람들의 치유를 돕는 동시에 자신의 감정적 안녕도 돌보는 것을 잊지 마세요—당신의 민감함은 선물이자 길러야 할 것입니다'
      },
      {
        icon: '🏥',
        title: 'Building Healing Communities',
        title_ko: '치유 공동체 구축하기',
        description: 'Consider creating ongoing support networks that extend beyond gallery visits, fostering lasting communities of artistic and emotional support',
        description_ko: '갤러리 방문을 넘어 지속되는 지원 네트워크를 만들어, 예술적이고 감정적인 지원의 지속적 공동체를 육성해보세요'
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

  // Social + Realistic + Meaning-driven + Flow
  SRMF: {
    type: 'SRMF',
    title: 'The Cultural Time Traveler',
    title_ko: '문화의 시간여행자',
    subtitle: 'Leading expeditions through the living museums of human civilization',
    subtitle_ko: '인류 문명의 살아있는 박물관을 통한 탐험을 이끄는',
    essence: 'You transform galleries into time machines, using representational art as portals to different eras and cultures. Each painted scene becomes a window into another world, and you excel at guiding groups on these temporal journeys, weaving connections between past and present through spontaneous yet insightful discussions. Your gift lies in making history feel alive and relevant, turning ancient civilizations into dinner table conversations and classical paintings into mirrors of contemporary life.',
    essence_ko: '당신은 갤러리를 타임머신으로 변화시킵니다. 구상 미술을 다른 시대와 문화로 향하는 포털로 활용하죠. 그려진 모든 장면이 다른 세계로의 창이 되고, 이런 시간 여행에서 그룹을 안내하는 데 뛰어납니다. 자발적이면서도 통찰력 있는 토론을 통해 과거와 현재를 연결합니다.\n\n미술관에서 당신은 시간의 가이드가 됩니다. 르네상스 궁정의 화려함에서 현대 사회의 권력 구조를 읽어내고, 시골 풍경화에서 도시화의 의미를 발견합니다. 당신과 함께하는 사람들은 단순히 그림을 보는 것이 아니라 인류 역사의 생생한 증인이 되어, 과거의 지혜로 현재를 더 깊이 이해하게 됩니다.',
    strengths: [
      {
        icon: '🕰️',
        title: 'Temporal Bridge Building',
        title_ko: '시간의 다리 놓기',
        description: 'You connect historical contexts with contemporary relevance, making past civilizations feel immediate and meaningful to modern audiences',
        description_ko: '역사적 맥락을 현대적 의미와 연결하여, 과거 문명을 현대 관객들에게 즉각적이고 의미 있게 느끼도록 만듭니다'
      },
      {
        icon: '🌍',
        title: 'Cross-Cultural Navigation',
        title_ko: '문화 간 항해술',
        description: 'You facilitate fluid movement between different cultural perspectives, helping groups understand diverse worldviews through artistic representation',
        description_ko: '다양한 문화적 관점 사이를 유연하게 이동하며, 예술적 표현을 통해 그룹이 다양한 세계관을 이해할 수 있도록 돕습니다'
      },
      {
        icon: '🗣️',
        title: 'Narrative Flow Mastery',
        title_ko: '서사적 흐름 숙달',
        description: 'You weave spontaneous discussions into compelling cultural narratives that make complex historical concepts accessible and engaging',
        description_ko: '자발적 토론을 매력적인 문화적 서사로 엮어내어, 복잡한 역사적 개념을 접근 가능하고 흥미롭게 만듭니다'
      }
    ],
    growth: [
      {
        icon: '📚',
        title: 'Deepening Historical Knowledge',
        title_ko: '역사적 지식 심화하기',
        description: 'While your intuitive connections are brilliant, studying more art history and cultural contexts can provide even richer material for your time-traveling expeditions',
        description_ko: '직관적 연결 능력이 뛰어나지만, 미술사와 문화적 맥락을 더 공부한다면 시간여행 탐험에 더욱 풍부한 자료를 제공할 수 있을 거예요'
      },
      {
        icon: '🎭',
        title: 'Incorporating Multiple Perspectives',
        title_ko: '다양한 관점 통합하기',
        description: 'Consider how different social groups might have experienced the same historical periods differently, adding layers of complexity to your cultural explorations',
        description_ko: '서로 다른 사회 집단들이 같은 역사적 시기를 어떻게 다르게 경험했을지 고려하여, 문화 탐험에 복잡성의 층위를 더해보세요'
      },
      {
        icon: '🔗',
        title: 'Creating Lasting Connections',
        title_ko: '지속적 연결 만들기',
        description: 'Think about how to help your fellow travelers continue their cultural explorations beyond gallery visits, perhaps through reading lists or cultural exchange opportunities',
        description_ko: '동료 여행자들이 갤러리 방문을 넘어 문화 탐험을 계속할 수 있도록, 독서 목록이나 문화 교류 기회를 통해 도와보세요'
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

  // Social + Realistic + Meaning-driven + Constructive
  SRMC: {
    type: 'SRMC',
    title: 'The Master Docent',
    title_ko: '마스터 도슨트',
    subtitle: 'Building cathedrals of knowledge through collective artistic scholarship',
    subtitle_ko: '집단적 예술 학문을 통해 지식의 성당을 건설하는',
    essence: 'You are the living embodiment of the ideal museum guide—someone who transforms representational art into doorways of understanding through methodical, collaborative exploration. Your gift lies in constructing comprehensive learning experiences that honor both the technical mastery and cultural significance of artworks. You build bridges between the historical past and contemporary understanding, creating structured pathways that allow groups to journey together from surface appreciation to profound scholarly insight.',
    essence_ko: '당신은 이상적인 박물관 가이드의 살아있는 구현체입니다. 구상 미술을 체계적이고 협력적인 탐구를 통해 이해의 문으로 변화시키죠. 작품의 기술적 숙련도와 문화적 의미를 모두 존중하는 포괄적 학습 경험을 구축하는 것이 당신의 재능입니다.\n\n미술관에서 당신은 지식의 설계자가 됩니다. 하나의 작품 앞에서 붓터치의 기법부터 시대적 배경, 사회적 의미까지 층층이 쌓인 이해를 체계적으로 전개해나갑니다. 당신과 함께하는 사람들은 단순한 감상자가 아닌 예술의 공동 연구자가 되어, 과거의 거장들과 현재 사이의 다리를 함께 건설합니다.',
    strengths: [
      {
        icon: '🔬',
        title: 'Methodical Scholarship',
        title_ko: '체계적 학문 연구',
        description: 'You approach each artwork as a comprehensive case study, systematically analyzing technique, context, and meaning to build complete understanding',
        description_ko: '각 작품을 종합적인 사례 연구로 접근하여, 기법과 맥락, 의미를 체계적으로 분석해 완전한 이해를 구축합니다'
      },
      {
        icon: '🏛️',
        title: 'Cultural Bridge Engineering',
        title_ko: '문화적 다리 공학',
        description: 'You construct solid connections between historical contexts and contemporary relevance, making past civilizations accessible to modern audiences',
        description_ko: '역사적 맥락과 현대적 의미 사이에 견고한 연결을 구축하여, 과거 문명을 현대 관객들이 접근할 수 있게 만듭니다'
      },
      {
        icon: '👥',
        title: 'Collaborative Knowledge Building',
        title_ko: '협력적 지식 구축',
        description: 'You facilitate group learning experiences where individual insights contribute to collective scholarly understanding of artistic works',
        description_ko: '개인적 통찰이 예술 작품에 대한 집단적 학술적 이해에 기여하는 그룹 학습 경험을 촉진합니다'
      }
    ],
    growth: [
      {
        icon: '🎭',
        title: 'Balancing Structure with Wonder',
        title_ko: '구조와 경이로움의 균형',
        description: 'While your systematic approach is invaluable, occasionally allowing for moments of pure aesthetic wonder can deepen the scholarly experience',
        description_ko: '체계적 접근법이 매우 소중하지만, 때로는 순수한 미적 경이로움의 순간을 허용하는 것이 학술적 경험을 더욱 깊게 만들 수 있어요'
      },
      {
        icon: '📚',
        title: 'Expanding Research Networks',
        title_ko: '연구 네트워크 확장하기',
        description: 'Consider connecting with other art historians and scholars to continually refresh and expand your knowledge base',
        description_ko: '다른 미술사학자들 및 학자들과 연결하여 지식 기반을 지속적으로 갱신하고 확장하는 것을 고려해보세요'
      },
      {
        icon: '🌐',
        title: 'Creating Lasting Learning Communities',
        title_ko: '지속적 학습 공동체 창조하기',
        description: 'Think about how to transform your guided experiences into ongoing study groups or scholarly communities that continue learning beyond gallery visits',
        description_ko: '당신의 가이드 경험을 갤러리 방문을 넘어 계속 학습하는 지속적인 스터디 그룹이나 학술 공동체로 변환하는 방법을 생각해보세요'
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