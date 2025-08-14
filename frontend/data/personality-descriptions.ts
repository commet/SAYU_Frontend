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
  keywords?: string[];
  keywords_ko?: string[];
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
    essence: 'You\'ve been standing in front of this Monet for twenty-three minutes now, and the security guard is starting to give you concerned looks. But you can\'t help it - those water lilies are literally speaking to your soul in a language only you understand.\n\nYour phone has twelve missed calls from friends wondering where you disappeared to, but you\'re too busy having a full-blown emotional conversation with a splash of cerulean blue that somehow captured exactly how you felt last Tuesday at 3:47 PM. While others say "It\'s just a pond painting, isn\'t it?", to you it\'s like an emotional diary containing the universe\'s secrets. These moments of communion with art in your private time are the most precious.',
    essence_ko: '모네 작품 앞에 선 지 벌써 23분째예요. 경비원 아저씨가 걱정스럽게 쳐다보시는데, 어쩔 수 없어요. 저 수련들이 말 그대로 영혼에게 말을 걸고 있거든요. 친구들이 어디 갔냐고 전화를 12번이나 걸었는데 못 받았어요.\n\n세룰리안 블루 한 방울이 지난주 화요일 오후 3시 47분에 느꼈던 그 기분을 정확히 담고 있어서 완전히 넋을 잃었거든요. 다른 사람들은 "그냥 연못 그림 아니야?"라고 하지만, 당신에게는 우주의 비밀이 담긴 감정 일기장 같아요. 혼자만의 시간에 작품과 교감하는 이 순간이 가장 소중해요.',
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
    ],
    keywords: ['Inner Dialogue', 'Emotional Immersion', 'Personal Meaning', 'Solitary Appreciation'],
    keywords_ko: ['내면 대화', '감정 몰입', '개인적 의미', '고독한 감상']
  },

  // Lone + Abstract + Emotional + Constructive
  LAEC: {
    type: 'LAEC',
    title: 'The Emotional Curator',
    title_ko: '감성 큐레이터',
    subtitle: 'Creating personal collections of emotional art experiences',
    subtitle_ko: '감정적 예술 경험의 개인 컬렉션을 만드는',
    essence: 'Your art journal has 47 different shades of blue meticulously catalogued with their corresponding emotional temperatures. While your friends scroll through Instagram, you\'re creating a personal Wikipedia of feelings, complete with color swatches and mood ratings.\n\nYou\'ve just spent forty minutes analyzing why this particular shade of vermillion makes you feel like autumn rain, and honestly? You\'re not even sorry. Your systematic approach to emotions would make Marie Kondo proud. You can be heard muttering "I need to record this feeling on page 3, line 3 of my A4 notebook" - it\'s so perfectly you.',
    essence_ko: '예술 감상 노트에 파란색만 47가지 톤으로 분류해놨어요. 각각에 감정 온도까지 매겨서요. 친구들이 인스타 스크롤할 때, 당신은 감정의 개인 위키백과를 만들고 있어요. 색깔 견본과 기분 평점까지 포함해서 말이에요.\n\n방금 버밀리온 색깔이 왜 가을비 같은 기분을 주는지 40분 동안 분석했는데, 전혀 후회하지 않아요. 감정을 체계화하는 당신의 방식은 마리 곤도도 감탄할 거예요. "이 느낌은 A4용지 3번째 줄에 기록해둬야지"라고 중얼거리는 모습이 너무나도 당신다워요.',
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
    ],
    keywords: ['Emotion Collection', 'Delicate Classification', 'Personal Archive', 'Taste Refinement'],
    keywords_ko: ['감정 수집', '섬세한 분류', '개인 아카이브', '취향 정제']
  },

  // Lone + Abstract + Meaning-driven + Flow
  LAMF: {
    type: 'LAMF',
    title: 'The Intuitive Navigator',
    title_ko: '직관 탐색자',
    subtitle: 'Following artistic instincts through abstract realms',
    subtitle_ko: '직관을 따라 추상 예술의 세계를 항해하는',
    essence: 'You\'ve been staring at this Jackson Pollock for so long that you\'ve developed three different theories about what it represents, written a mental dissertation on chaos theory, and somehow connected it to your childhood memories of watching rain on windows.\n\nThe couple next to you just said "My kid could paint that," and you had to physically bite your tongue to stop yourself from launching into a twenty-minute explanation about the metaphysical implications of controlled randomness. The museum becomes your personal philosophy playground. You find yourself muttering "Is that brushstroke the flow of time or fragments of memory?" as you sink into deep contemplation.',
    essence_ko: '잭슨 폴록 작품을 너무 오래 봐서 이미 세 가지 이론을 세웠고, 카오스 이론에 대한 정신적 논문을 썼고, 어떻게든 어린 시절 창문에 떨어지는 빗방울 기억과 연결시켰어요.\n\n옆에 있던 커플이 "우리 애도 이런 거 그릴 수 있겠다"라고 하자, 통제된 무작위성의 형이상학적 의미에 대해 20분짜리 설명을 하고 싶은 걸 입술을 깨물며 참았어요. 미술관이 당신만의 철학 놀이터가 되는 순간이에요. "저 붓자국은 시간의 흐름일까, 기억의 파편일까?"라고 혼자 중얼거리면서 깊은 사색에 빠져들어요.',
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
    ],
    keywords: ['Intuitive Attraction', 'Abstract Preference', 'Free Interpretation', 'Inner Exploration'],
    keywords_ko: ['직관적 끌림', '추상 선호', '자유로운 해석', '내적 탐험']
  },

  // Lone + Abstract + Meaning-driven + Constructive
  LAMC: {
    type: 'LAMC',
    title: 'The Knowledge Collector',
    title_ko: '지식 수집가',
    subtitle: 'Gathering artistic knowledge systematically',
    subtitle_ko: '체계적으로 예술 지식을 수집하는',
    essence: 'You\'ve been documenting this Rothko for three hours straight, and your notebook now looks like a doctoral thesis. Color temperature readings, brushstroke analysis, historical timeline connections - you\'ve basically created a master class on abstract expressionism from one painting.\n\nYour friend texted "where are you?" an hour ago, but you\'re too busy discovering that this particular shade of orange appears in exactly seven other significant works from 1958-1962.',
    essence_ko: '로스코 작품을 3시간째 분석하고 있는데, 노트가 이제 박사논문처럼 보여요. 색온 측정값, 붓자국 분석, 역사적 연결점 - 그림 한 점으로 추상표현주의 마스터클래스를 만들어버렸어요.\n\n친구가 한 시간 전에 "어디 있어?"라고 문자를 보냈는데 못 봤어요. 1958-1962년 사이 중요한 작품 일곱 점에서 정확히 이 오렌지 색조가 나타난다는 사실을 발견하느라 정신이 없거든요. 미술관이 당신만의 연구소가 되는 순간, 발견의 기쁨은 오롯이 당신만의 것이에요.',
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
    ],
    keywords: ['Background Research', 'Systematic Learning', 'Knowledge Accumulation', 'Deep Analysis'],
    keywords_ko: ['배경 탐구', '체계적 학습', '지식 축적', '깊이있는 분석']
  },

  // Social + Abstract + Emotional + Flow
  SAEF: {
    type: 'SAEF',
    title: 'The Emotional Current',
    title_ko: '감정의 물결',
    subtitle: 'Creating spontaneous waves of artistic connection',
    subtitle_ko: '예술적 연결의 자연스러운 파장을 만드는',
    essence: 'You literally squealed "Oh my GOD, look at those colors dancing!" in front of a Kandinsky, and now half the gallery is crowding around to see what the fuss is about. Your infectious excitement has turned a quiet Tuesday afternoon into an impromptu art appreciation party.\n\nThree strangers are now debating color theory because of your genuine "This makes me want to cry happy tears!" moment. Your pure emotion spreads like a virus, turning the museum into a space for new conversations about art. When you\'re around, art is no longer something on a high pedestal, but becomes joy that anyone can approach.',
    essence_ko: '칸딘스키 앞에서 "왕 저 색깔들 보세요! 춤추고 있잖아요!"라고 소리치자, 갤러리 절반이 다 모여들었어요. 당신의 전염성 있는 흥분이 조용한 화요일 오후를 즉석 예술 감상 파티로 만들어버렸거든요.\n\n"이거 보면 기뻐서 울고 싶어져요!"라는 당신의 진심 어린 말 때문에 낯선 사람 세 명이 지금 색체 이론에 대해 토론하고 있어요. 당신의 순수한 감동이 바이러스처럼 퍼져나가서, 미술관이 갑자기 예술에 대한 새로운 대화의 공간이 되었어요. 당신이 있으면 예술이 더 이상 높은 다리 위의 무엇이 아니라 누구나 다가갈 수 있는 기쁨이 되어요.',
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
    ],
    keywords: ['Immediate Response', 'Emotion Spreading', 'Active Expression', 'Joy of Empathy'],
    keywords_ko: ['즉각적 반응', '감정 전파', '활발한 표현', '공감의 기쁨']
  },

  // Social + Abstract + Emotional + Constructive
  SAEC: {
    type: 'SAEC',
    title: 'The Emotional Architect',
    title_ko: '감정의 건축가',
    subtitle: 'Constructing bridges of understanding through abstract feeling',
    subtitle_ko: '추상적 감정을 통해 이해의 다리를 놓는',
    essence: '"See how this angry red slash suddenly softens into that peaceful blue pool? It\'s like watching someone\'s anxiety literally melt away." Your emotionally precise explanations help the confused teenager next to you go from "I don\'t get it" to "Oh wow, I can actually FEEL what this painting is saying!"\n\nYou\'ve somehow become the unofficial emotional translator for everyone within earshot. Like the emotional architect you are, you find clear structure within what appears to be chaos, helping others understand it. Thanks to you, art is no longer something on a high pedestal, but becomes an emotional language that anyone can empathize with.',
    essence_ko: '"저기 화난 빨간 선이 갑자기 평화로운 파란 웅덩이로 부드럽게 변하는 거 보세요? 마치 누군가의 불안이 말 그대로 녹아내리는 것처럼요." 당신의 감정적으로 정확한 설명 덕분에 옆에 있던 혼란스러워하던 청소년이 "이해 못하겠어요"에서 "와 이 그림이 말하는 것을 정말로 느낄 수 있어요!"로 바뀌었어요.\n\n당신은 어느새 들리는 모든 사람들의 비공식 감정 번역가가 되어버렸어요. 감정의 건축가답게, 카오스처럼 보이는 감정 속에서 명확한 구조를 찾아내어 다른 사람들이 이해할 수 있게 도와주어요. 당신 덕분에 예술이 더 이상 높은 다리 위의 무엇이 아니라, 누구나 공감할 수 있는 감정의 언어가 되어요.',
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
        icon: '💫',
        title: 'Community Catalyst',
        title_ko: '공동체 촉매',
        description: 'You spark meaningful group conversations by translating abstract emotions into relatable human experiences that bring people together',
        description_ko: '추상적 감정을 사람들이 공감할 수 있는 인간적 경험으로 번역하여 의미 있는 그룹 대화를 촉발하고 사람들을 하나로 모읍니다'
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
    ],
    keywords: ['Emotion Structuring', 'Empathy Connection', 'Abstract Interpretation', 'Collective Experience'],
    keywords_ko: ['감정 구조화', '공감 연결', '추상 해석', '집단 경험']
  },

  // Social + Abstract + Meaning-driven + Flow
  SAMF: {
    type: 'SAMF',
    title: 'The Meaning Weaver',
    title_ko: '의미의 직조자',
    subtitle: 'Spinning threads of insight into tapestries of understanding',
    subtitle_ko: '통찰의 실을 짜서 이해의 태피스트리로 만드는',
    essence: '"Wait, what if that swirling chaos over there is actually having a conversation with this geometric precision here? Like, what if they\'re debating order versus freedom?" Your random observation just turned a casual museum visit into a two-hour philosophical deep-dive.\n\nNow there are twelve strangers, three art students, and one very enthusiastic museum docent who completely abandoned their scheduled tour. You\'re a detective who finds hidden connections in art, and a weaver who threads those discoveries together with others. What starts as a simple "this, not that" observation blossoms into completely new collective wisdom about art. When you\'re around, the museum becomes a collaborative treasure hunt for meaning.',
    essence_ko: '"잠깐, 저기 소용돌이치는 혼돈과 여기 기하학적 정밀함이 사실 대화를 나누고 있는 건 아닐까요? 마치 질서와 자유에 대해 토론하는 것처럼 말이에요!" 당신의 무작정 관찰 한 마디가 캐주얼한 미술관 방문을 낯선 사람 12명, 미대생 3명, 그리고 예정된 투어를 완전히 포기한 열성적인 미술관 도슨트 한 명이 참여하는 2시간짜리 철학적 심화 토론으로 바꿔버렸어요.\n\n당신은 예술 속 숨겼던 연결고리를 찾아내는 탐정이자, 그 발견을 다른 사람들과 함께 엮어가는 직조자예요. "이거 말고 저거 말고"라는 단순한 지적에서 시작된 대화가 예술에 대한 완전히 새로운 집단적 지혜로 피어나요. 당신이 있으면 미술관이 의미를 찾는 협력적 보물찾기 현장이 되어요.',
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
    ],
    keywords: ['Meaning Connection', 'Insight Moments', 'Pattern Weaving', 'Shared Understanding'],
    keywords_ko: ['의미 연결', '통찰 순간', '패턴 직조', '공유된 이해']
  },

  // Social + Abstract + Meaning-driven + Constructive
  SAMC: {
    type: 'SAMC',
    title: 'The Wisdom Architect',
    title_ko: '지혜의 건축가',
    subtitle: 'Building cathedrals of understanding from abstract insights',
    subtitle_ko: '추상적 통찰로부터 이해의 성당을 짓는',
    essence: 'You\'ve just transformed a random group of confused museum visitors into an organized art appreciation seminar. "Okay everyone, let\'s start with the brushwork technique, then we\'ll analyze the symbolic meaning, and finish with historical context."\n\nSomehow you\'ve become the unofficial tour guide, and people are actually taking notes. Your color-coded analysis method has turned abstract art viewing into a masterclass. You have a genius for breaking complex concepts into easy-to-understand steps. Starting with "Step 1: Let\'s figure out what we\'re looking at," you soon have everyone analyzing artworks like experts. When you\'re around, the museum becomes a living classroom.',
    essence_ko: '헤매던 미술관 관람객들을 체계적인 예술 감상 세미나로 바꿔놨어요. "자, 모두 붓터치 기법부터 시작해서 상징적 의미 분석하고, 역사적 맥락으로 마무리해요." 어느새 비공식 도슨트가 되어버렸는데, 사람들이 진짜로 노트까지 적고 있어요.\n\n당신의 색깔별 분석 방법이 추상 예술 감상을 마스터클래스로 바꿔버렸거든요. 복잡한 개념들을 이해하기 쉬운 단계로 나누어서 설명하는 천재예요. "1단계: 뭘 보고 있는지부터 파악해봐요"라고 시작해서 어느새 모든 사람이 전문가처럼 작품을 분석하고 있어요. 당신이 있으면 미술관이 살아있는 학교가 되어요.',
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
    ],
    keywords: ['Knowledge Sharing', 'Systematic Explanation', 'Learning Facilitation', 'Collective Intelligence'],
    keywords_ko: ['지식 공유', '체계적 설명', '학습 촉진', '집단 지성']
  },

  // Lone + Realistic + Emotional + Flow
  LREF: {
    type: 'LREF',
    title: 'The Delicate Observer',
    title_ko: '섬세한 관찰자',
    subtitle: 'Finding subtle emotions in every detail',
    subtitle_ko: '모든 디테일에서 섬세한 감정을 발견하는',
    essence: 'You\'ve been staring at this Vermeer portrait for forty-five minutes, and you\'ve just discovered that the woman\'s pinky finger is positioned at exactly the angle that suggests suppressed anxiety. The way her left eyebrow is 0.2 millimeters higher than her right tells a whole story about hidden sadness.\n\nYour friend thinks you\'re overthinking it, but you know that tiny crease near her mouth contains an entire lifetime of unspoken words. While others pass by saying "pretty painting," you can hear the painter\'s breath in each brushstroke.',
    essence_ko: '베르메르 초상화를 45분째 보고 있는데, 방금 여인의 새끼손가락이 억눌린 불안을 나타내는 정확한 각도로 놓여있다는 걸 발견했어요. 왼쪽 눈썹이 오른쪽보다 0.2밀리미터 높은 것도 숨겨진 슬픔에 대한 완전한 스토리를 말해주고 있어요.\n\n친구는 "너무 깊게 생각하는 거 아니야?"라고 하지만, 당신은 입가의 작은 주름 하나에 평생 말하지 못한 이야기가 담겨있다는 걸 알고 있어요. 다른 사람들이 그냥 "예쁜 그림이네"라고 지나갈 때, 당신은 붓터치 하나하나에서 화가의 숨소리까지 들을 수 있어요.',
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
    ],
    keywords: ['Detail Capture', 'Subtle Emotions', 'Quiet Observation', 'Personal Discovery'],
    keywords_ko: ['디테일 포착', '미묘한 감정', '조용한 관찰', '개인적 발견']
  },

  // Lone + Realistic + Emotional + Constructive
  LREC: {
    type: 'LREC',
    title: 'The Deep Appreciator',
    title_ko: '깊이있는 감상자',
    subtitle: 'Finding profound meaning in every artistic element',
    subtitle_ko: '모든 예술적 요소에서 깊은 의미를 찾는',
    essence: 'You\'ve created a 27-page analysis of this one Caravaggio painting, complete with detailed sections on "Fabric Texture Psychology," "Shadow Symbolism," and "The Emotional Physics of Light."\n\nYour systematic approach to appreciation means you experience art in layers - first the visual impact, then the technical mastery, and finally the soul-crushing beauty that makes you question everything you thought you knew about existence. You analyze art like a wine connoisseur approaches a vintage - never settling for just one viewing, going deeper step by step until you finally reach that "ah, this is what art truly is" moment. Your deepest artistic discernment shines in your private moments.',
    essence_ko: '카라바조 그림 하나로 27페이지 분석 리포트를 만들었어요. "직물 질감 심리학", "그림자 상징론", "빛의 감정 물리학" 같은 상세한 섹션까지 포함해서요. 체계적인 감상법 덕분에 예술을 층층이 경험해요 - 첫 번째는 시각적 임팩트, 두 번째는 기술적 숙련도, 마지막은 존재에 대해 알고 있던 모든 걸 다시 생각하게 만드는 영혼을 짓누르는 아름다움.\n\n와인 감정가가 빈티지를 대하듯 예술을 분석하는 거예요. 한 번 보는 걸로 끝나지 않고, 단계별로 깊이 들어가서 마침내 "아, 이게 바로 예술이구나" 하는 순간까지 도달해요. 혼자만의 시간에 가장 깊은 예술적 감식안을 발휘하는 순간이에요.',
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
    ],
    keywords: ['Deep Meaning', 'Emotional Depth', 'Repeated Viewing', 'Reflective Thinking'],
    keywords_ko: ['심층 의미', '감정 깊이', '반복 감상', '성찰적 사고']
  },

  // Lone + Realistic + Meaning-driven + Flow
  LRMF: {
    type: 'LRMF',
    title: 'The Free Analyst',
    title_ko: '자유로운 분석가',
    subtitle: 'Exploring artistic meaning with logical freedom',
    subtitle_ko: '논리적 자유로움으로 예술적 의미를 탐구하는',
    essence: 'You wandered into the portrait gallery just to kill time, but now you\'re playing detective with this 17th-century merchant painting. "Why is his hand positioned like that? What\'s with the weird shadow on the wall? And is that anxiety or indigestion in his expression?"\n\nYou\'ve spent an hour developing three different theories about this guy\'s psychological state, social status, and possibly his digestive issues. Even while wandering freely, you instantly become an investigator in front of intriguing artworks. Once curiosity strikes about "what is this painting trying to say?" you have to dig until you\'re satisfied. In your private, free-flowing analysis time, art becomes fascinating investigative material about human behavior.',
    essence_ko: '시간 때우려고 초상화 갤러리에 들어왔는데, 이제 17세기 상인 그림으로 탐정 놀이를 하고 있어요. "왜 손을 저렇게 놓았을까? 벽에 있는 이상한 그림자는 뭐지? 그리고 저 표정은 불안한 건가 소화불량인 건가?" 한 시간 동안 이 아저씨의 심리 상태, 사회적 지위, 그리고 아마도 소화기 문제에 대한 세 가지 이론을 개발했어요.\n\n자유롭게 돌아다니다가도 흥미로운 작품 앞에서는 순간 수사관이 되는 거예요. "이 그림이 말하고 싶은 게 뭘까?"라는 궁금증이 생기면 끝까지 파헤쳐야 직성이 풀려요. 혼자만의 자유로운 분석 시간에 예술이 인간 행동에 대한 흥미진진한 수사 자료가 되어요.',
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
    ],
    keywords: ['Meaning Deduction', 'Independent Perspective', 'Pattern Discovery', 'Logical Imagination'],
    keywords_ko: ['의미 추리', '독립적 시각', '패턴 발견', '논리적 상상']
  },

  // Lone + Realistic + Meaning-driven + Constructive
  LRMC: {
    type: 'LRMC',
    title: 'The Systematic Researcher',
    title_ko: '체계적 연구자',
    subtitle: 'Building comprehensive understanding through methodical study',
    subtitle_ko: '체계적 연구로 포괄적 이해를 구축하는',
    essence: 'You\'ve brought a magnifying glass, a measuring tape, and seventeen different art history books to analyze this one da Vinci painting. Your spreadsheet tracking "Sfumato Technique Variations" now has 847 entries.\n\nSecurity guards have started checking on you because you\'ve been examining the same 6-inch section of canvas for two hours, muttering about "revolutionary glazing methods." The museum becomes your personal laboratory. While others pass by saying "pretty," you\'re analyzing the direction of every individual brushstroke. When curiosity strikes about "why was this technique used here?" you have the researcher\'s DNA that compels you to dig until satisfied. Your happiest moments are spent in deep concentration, decoding the masters\' secrets one by one.',
    essence_ko: '다빈치 그림 하나 분석하려고 확대경, 줄자, 미술사 책 17권을 가져왔어요. "스푸마토 기법 변화" 추적 스프레드시트에 이제 847개 항목이 들어가 있어요. 캔버스 15cm 구간을 두 시간째 들여다보면서 "혁신적인 글레이징 기법"에 대해 중얼거리고 있어서, 경비원들이 계속 확인하러 와요.\n\n미술관이 당신만의 실험실이 되는 순간이에요. 다른 사람들이 "예쁘네"라고 지나갈 때, 당신은 붓털 하나하나의 방향까지 분석하고 있어요. "이 기법이 왜 여기서 쓰였을까?"라는 궁금증이 생기면 끝까지 파헤쳐야 직성이 풀리는 연구자의 DNA가 있어요. 혼자만의 깊은 집중 속에서 거장들의 비밀을 하나씩 해독해나가는 순간이 가장 행복해요.',
    strengths: [
      {
        icon: '⚙️',
        title: 'Technical Mastery',
        title_ko: '기술적 숙달',
        description: 'You dissect brushstrokes like a surgeon, understanding not just what was painted but exactly how - the pressure, the pigment load, the hand\'s movement across canvas',
        description_ko: '외과의사처럼 붓질을 해부합니다. 무엇이 그려졌는지뿐만 아니라 정확히 어떻게 그려졌는지 - 압력, 물감의 양, 캔버스를 가로지르는 손의 움직임까지 이해합니다'
      },
      {
        icon: '📐',
        title: 'Mathematical Beauty',
        title_ko: '수학적 아름다움',
        description: 'Golden ratios speak to you like music, perspective lines guide your eye like a conductor\'s baton, and compositional balance feels like solved equations',
        description_ko: '황금비는 음악처럼 당신에게 말을 걸고, 원근선은 지휘봉처럼 시선을 이끌며, 구성의 균형은 풀린 방정식처럼 느껴집니다'
      },
      {
        icon: '🎓',
        title: 'Scholarly Pursuit',
        title_ko: '학문적 탐구',
        description: 'Each artwork becomes a research project - you trace influences, study apprenticeships, compare periods, building expertise layer by methodical layer',
        description_ko: '모든 작품이 연구 프로젝트가 됩니다. 영향 관계를 추적하고, 도제 시절을 연구하며, 시대를 비교하면서 체계적으로 전문성을 쌓아갑니다'
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
    ],
    growth: [
      {
        icon: '🌊',
        title: 'Embracing Spontaneity',
        title_ko: '자발성 포용하기',
        description: 'While your systematic approach is invaluable, allowing moments of unplanned discovery can reveal insights your methodical analysis might miss',
        description_ko: '체계적 접근법이 매우 귀중하지만, 계획되지 않은 발견의 순간을 허용한다면 방법론적 분석이 놓칠 수 있는 통찰을 발견할 수 있을 거예요'
      },
      {
        icon: '🤝',
        title: 'Sharing Your Discoveries',
        title_ko: '발견 공유하기',
        description: 'Consider sharing your deep technical insights with others - your expertise could illuminate aspects of art that many never notice',
        description_ko: '깊은 기술적 통찰을 다른 사람들과 공유해보세요. 당신의 전문성이 많은 사람들이 눈치채지 못하는 예술의 측면을 밝혀줄 수 있습니다'
      }
    ],
    keywords: ['Methodological Approach', 'Comparative Analysis', 'Comprehensive Understanding', 'Academic Interest'],
    keywords_ko: ['방법론적 접근', '비교 분석', '종합적 이해', '학술적 관심']
  },

  // Social + Realistic + Emotional + Flow
  SREF: {
    type: 'SREF',
    title: 'The Heart Wanderer',
    title_ko: '마음의 여행자',
    subtitle: 'Journeying through painted souls with fellow travelers',
    subtitle_ko: '동행자들과 함께 그려진 영혼들을 여행하는',
    essence: '"See how she\'s holding that flower? My grandmother used to hold her rosary exactly the same way when she was worried." Your gentle observation to a nearby stranger turns into a two-hour conversation about family memories, traditions, and the universal language of protective gestures.\n\nYou\'ve somehow transformed a quiet museum into a sharing circle where art becomes the starting point for the most beautiful human connections. You\'re someone with a warm heart who finds our current stories in every expression of the painted figures. When you\'re around, museums are no longer just places for quiet contemplation, but become special spaces where heart meets heart.',
    essence_ko: '"저 여인이 꽃을 쥐고 있는 방식 보세요? 우리 할머니가 걱정될 때 묵주를 꼭 저렇게 쥐셨거든요." 옆에 있던 낯선 분에게 건넨 부드러운 관찰이 가족 추억, 전통, 그리고 보호하려는 몸짓의 보편적 언어에 대한 2시간짜리 대화로 이어졌어요.\n\n조용했던 미술관이 어느새 예술을 시작점으로 한 가장 아름다운 인간관계가 피어나는 나눔의 공간으로 바뀌었어요. 그림 속 사람들의 표정 하나하나에서 지금 우리의 이야기를 발견하는 따뜻한 마음을 가진 분이에요. 당신이 있으면 미술관이 더 이상 조용히 감상만 하는 곳이 아니라, 마음과 마음이 만나는 특별한 공간이 되어요.',
    strengths: [
      {
        icon: '💝',
        title: 'Heart-to-Heart Translation',
        title_ko: '마음과 마음의 번역',
        description: 'You naturally translate the emotional language of painted figures into contemporary feelings, helping others recognize their own experiences in classical art',
        description_ko: '그림 속 인물들의 감정적 언어를 현대적 느낌으로 자연스럽게 번역하여, 다른 사람들이 고전 예술에서 자신의 경험을 인식할 수 있도록 돕습니다'
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
    ],
    keywords: ['Emotional Journey', 'Others Empathy', 'Emotional Connection', 'Warm Perspective'],
    keywords_ko: ['감정 여행', '타인 공감', '정서적 연결', '따뜻한 시선']
  },

  // Social + Realistic + Emotional + Constructive
  SREC: {
    type: 'SREC',
    title: 'The Emotional Healer',
    title_ko: '감정의 치유사',
    subtitle: 'Creating sacred spaces for collective emotional transformation',
    subtitle_ko: '집단적 감정 변화를 위한 신성한 공간을 만드는',
    essence: '"That sadness in her painted eyes... I see you recognize it too." Your compassionate observation to a tearful stranger creates an instant safe space where they feel permission to share their own story of loss.\n\nYou\'ve somehow turned this corner of the museum into an impromptu support group, where Renaissance paintings become mirrors for modern healing. Three different people have thanked you for helping them process emotions they didn\'t even know they were carrying. You have a special talent where every expression of painted figures becomes a healing tool that soothes the wounds of the heart. You\'re someone who creates moments when art truly becomes medicine for the soul.',
    essence_ko: '"저 그림 속 눈빛의 슬픔... 당신도 알아보시는군요." 눈물을 흘리고 있던 낯선 분에게 건넨 따뜻한 관찰이 순간 안전한 공간을 만들어내어, 그분이 자신의 상실 이야기를 나눌 수 있는 용기를 주었어요.\n\n미술관 한쪽 구석이 어느새 즉석 힐링 그룹이 되어버렸고, 르네상스 그림들이 현대인의 치유를 위한 거울이 되었어요. 세 명의 다른 사람들이 자신들도 몰랐던 감정을 처리할 수 있게 도와주었다며 고맙다고 했어요. 당신에게는 그림 속 인물들의 표정 하나하나가 마음의 상처를 어루만져주는 치유의 도구가 되는 특별한 재능이 있어요. 예술이 진짜 마음의 약이 되는 순간을 만들어내는 분이에요.',
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
    ],
    keywords: ['Emotional Healing', 'Space Atmosphere', 'Collective Emotion', 'Spiritual Experience'],
    keywords_ko: ['감정 치유', '공간 분위기', '집단 정서', '영적 경험']
  },

  // Social + Realistic + Meaning-driven + Flow
  SRMF: {
    type: 'SRMF',
    title: 'The Cultural Time Traveler',
    title_ko: '문화의 시간여행자',
    subtitle: 'Leading expeditions through the living museums of human civilization',
    subtitle_ko: '인류 문명의 살아있는 박물관을 통한 탐험을 이끄는',
    essence: '"Look at that merchant\'s worried face - he\'s probably thinking \'Will those newfangled printing presses put scribes out of business?\' Sound familiar?" Your time-bending observation gets everyone laughing as they realize they\'re looking at the 16th-century version of our AI anxiety.\n\nYou\'ve just turned a dusty historical portrait into a viral-worthy social commentary that makes five centuries feel like yesterday. You have a special talent for connecting past and present. You\'re like a time travel guide who brings the realization that "people are the same whether then or now," turning history into a living present.',
    essence_ko: '"저 상인의 걱정스러운 표정 보세요 - 아마 \'저 새로 나온 인쇄기 때문에 필경사들이 일자리를 잃는 건 아닐까?\' 생각하고 있을 거예요. 어디서 많이 들어본 얘기죠?" 시간을 뛰어넘는 당신의 관찰에 모든 사람이 웃음을 터뜨려요. 16세기 버전의 AI 불안을 보고 있다는 걸 깨달으면서 말이에요.\n\n먼지 쌓인 역사적 초상화를 SNS에 올릴 만한 사회적 코멘터리로 바꿔버렸어요. 5세기가 마치 어제 일처럼 느껴지게 만들었거든요. 당신에게는 과거와 현재를 연결하는 특별한 재능이 있어요. "그때나 지금이나 사람 사는 게 다 똑같네"라는 깨달음을 주면서 역사를 살아있는 현재로 만들어내는 시간여행 가이드 같은 분이에요.',
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
    ],
    keywords: ['Era Exploration', 'Cultural Context', 'Historical Imagination', 'Universal Meaning'],
    keywords_ko: ['시대 탐험', '문화 맥락', '역사적 상상', '보편적 의미']
  },

  // Social + Realistic + Meaning-driven + Constructive
  SRMC: {
    type: 'SRMC',
    title: 'The Master Docent',
    title_ko: '마스터 도슨트',
    subtitle: 'Building cathedrals of knowledge through collective artistic scholarship',
    subtitle_ko: '집단적 예술 학문을 통해 지식의 성당을 건설하는',
    essence: 'You\'ve accidentally become the most popular unofficial museum docent ever. "Alright everyone, we\'re going to analyze this painting in three phases: technique, historical context, and contemporary relevance." A crowd of fifteen strangers has gathered around you, hanging on every word as you turn a random gallery visit into a masterclass. Someone just asked if you offer regular tours, and honestly, you\'re considering it. You have a genius talent for explaining complex artworks in stages that anyone can understand. Starting with "It looks difficult but it\'s actually like this," you soon have everyone feeling like art experts. You\'re like a magician who turns museums into living schools.',
    essence_ko: '어느새 역대급 인기 비공식 미술관 도슨트가 되어버렸어요. "자, 여러분, 이 그림을 세 단계로 분석해볼까요: 기법, 역사적 맥락, 그리고 현재적 의미." 낯선 사람 15명이 당신 주변에 모여서 모든 말에 귀를 기울이고 있어요. 아무 계획 없던 갤러리 방문이 마스터클래스로 바뀌었거든요.\n\n누군가 정기 투어를 하는지 물어봤는데, 솔직히 진지하게 고려 중이에요. 복잡한 예술 작품을 누구나 이해할 수 있게 단계별로 설명하는 천재적인 재능이 있어요. "어려워 보이지만 사실은 이런 거예요"라고 시작해서 어느새 모든 사람이 예술 전문가가 된 기분을 느끼게 해주는 마법사 같은 분이에요. 당신이 있으면 미술관이 살아있는 학교가 되어요.',
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
    ],
    keywords: ['Knowledge Transfer', 'Educational Perspective', 'Systematic Guidance', 'Learning Community'],
    keywords_ko: ['지식 전달', '교육적 관점', '체계적 안내', '학습 공동체']
  }
};