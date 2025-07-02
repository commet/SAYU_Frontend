// 🎨 SAYU Personality Descriptions - Personal Art Journey Types

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

export const personalityDescriptions: Record<string, PersonalityDescription> = {
  // Lone Wolf + Abstract + Emotional + Flow-oriented
  LAEF: {
    type: 'LAEF',
    title: 'The Dreamy Wanderer',
    title_ko: '몽환적 방랑자',
    subtitle: 'Dancing with abstract emotions in solitude',
    subtitle_ko: '고독 속에서 추상적 감정과 춤추는',
    essence: 'You don\'t just see art, you feel it breathing. In the quiet moments between you and a canvas, entire universes unfold. Your journey through galleries is deeply personal - a meditation where each piece either resonates in your bones or passes by like a gentle breeze.',
    essence_ko: '당신에게 예술은 단순히 바라보는 것이 아니라 숨결을 느끼는 일입니다. 캔버스와 당신 사이에 흐르는 고요한 순간들 속에서 우주가 펼쳐집니다. 갤러리를 거니는 것은 깊은 명상과도 같아서, 어떤 작품은 뼛속까지 울림을 전하고, 어떤 작품은 산들바람처럼 스쳐 지나가죠.',
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
      '미술관의 몽상에 빠진',
      '그림 속에서 친구를 찾는',
      '색채 속에서 분위기를 느끼는',
      '예술과 함께 숨 쉴 공간이 필요한'
    ],
    lifeExtension: 'This way of experiencing beauty extends into how you choose your morning coffee spot (the one with the best light), the music that moves you (often wordless), and the cities that feel like home (those with hidden corners and artistic souls).',
    lifeExtension_ko: '이런 아름다움을 경험하는 방식은 삶 전체로 확장됩니다. 아침 커피를 마실 때도 가장 빛이 아름다운 곳을 찾아가고, 종종 가사 없는 음악에 마음이 움직이며, 숨겨진 골목과 예술적 영혼이 있는 도시에서 집처럼 편안함을 느끼죠.',
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
    title_ko: '캔버스의 철학자',
    subtitle: 'Architecting emotional depth through abstract forms',
    subtitle_ko: '추상적 형태로 감정의 깊이를 설계하는',
    essence: 'You approach art like a poet approaches words - with reverence, patience, and deep attention. Your solitary gallery visits are research expeditions of the soul, where you systematically uncover layers of meaning while allowing yourself to be emotionally moved.',
    essence_ko: '당신이 예술을 대하는 방식은 시인이 언어를 대하는 것과 같습니다. 경외와 인내, 그리고 깊은 주의를 기울이죠. 홀로 떠나는 갤러리 여행은 영혼의 탐사와도 같아서, 체계적으로 의미의 층위를 발견하면서도 감정적으로 움직이는 자신을 허락합니다.',
    strengths: [
      {
        icon: '📖',
        title: 'Deep Analysis',
        description: 'You read between the brushstrokes'
      },
      {
        icon: '🏛️',
        title: 'Methodical Appreciation',
        description: 'Your structured approach reveals hidden depths'
      },
      {
        icon: '💭',
        title: 'Emotional Intelligence',
        description: 'You understand both the feeling and the theory'
      }
    ],
    recognition: [
      'Reading every museum label',
      'Returning to the same painting',
      'Taking mental notes',
      'Seeking the story behind the art'
    ],
    lifeExtension: 'You bring this same thoughtful intensity to your book choices (literary fiction that makes you think and feel), your travel plans (cities with rich cultural histories), and your personal rituals (morning routines that ground you).',
    lifeExtension_ko: '이런 사려 깊은 강렬함은 책을 고를 때도 나타나 생각과 감정을 동시에 자극하는 문학작품을 선택하고, 여행지를 정할 때는 풍부한 문화적 역사를 지닌 도시들을 찾으며, 자신을 안정시키는 아침 의식을 소중히 여깁니다.',
    lifeAreas: [
      {
        title: 'In Learning',
        description: 'You prefer depth over surface, mastering subjects that truly captivate you.'
      },
      {
        title: 'In Collecting',
        description: 'Whether books, music, or memories, you curate constructively and meaningfully.'
      },
      {
        title: 'In Reflection',
        description: 'Journaling, meditation, or quiet walks help you process your rich inner world.'
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
    title: 'The Intuitive Seeker',
    title_ko: '직관적 탐구자',
    title_ko: '개념의 사냥꾼',
    subtitle: 'Chasing ideas through abstract labyrinths',
    subtitle_ko: '추상의 미로를 통해 아이디어를 추적하는',
    essence: 'You float through galleries like a philosopher through ideas - independently, curiously, following threads of meaning wherever they lead. Your approach is both intellectual and free-flowing, finding patterns and concepts in abstract forms while maintaining the flexibility to change course when inspiration strikes.',
    essence_ko: '당신은 철학자가 사상을 탐구하듯 갤러리를 떠돕니다. 독립적이고 호기심 어린 시선으로 의미의 실마리를 따라가죠. 지적이면서도 자유롭게 흐르는 당신의 방식은 추상적 형태에서 패턴과 개념을 발견하면서도, 영감이 떠오르면 언제든 방향을 바꿀 수 있는 유연함을 지니고 있습니다.',
    strengths: [
      {
        icon: '🧭',
        title: 'Conceptual Navigation',
        description: 'You find your own path through artistic ideas'
      },
      {
        icon: '🎭',
        title: 'Intellectual Freedom',
        description: 'Your mind plays with concepts without constraints'
      },
      {
        icon: '✨',
        title: 'Pattern Recognition',
        description: 'You see connections others might miss'
      }
    ],
    recognition: [
      'Creating your own theories',
      'Enjoying conceptual art',
      'Wandering without a map',
      'Finding philosophy in aesthetics'
    ],
    lifeExtension: 'This philosophical wandering extends to your reading habits (from quantum physics to poetry), your conversations (deep dives into abstract ideas), and your lifestyle choices (minimalist but meaningful).',
    lifeExtension_ko: '이런 철학적 방랑은 양자물리학에서 시에 이르는 폭넓은 독서 습관으로 이어지고, 추상적 아이디어로 깊이 빠져드는 대화를 즐기며, 미니멀하지만 의미 있는 삶의 방식을 선택하게 만듭니다.',
    lifeAreas: [
      {
        title: 'In Thinking',
        description: 'You enjoy playing with ideas, turning them over like interesting stones.'
      },
      {
        title: 'In Living',
        description: 'Your lifestyle is unconventional but thoughtfully crafted.'
      },
      {
        title: 'In Creating',
        description: 'Your work often explores conceptual territories others haven\'t mapped.'
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
    title: 'The Philosophical Collector',
    title_ko: '철학적 수집가',
    title_ko: '패턴의 건축가',
    subtitle: 'Building bridges between chaos and order',
    subtitle_ko: '혼돈과 질서 사이에 다리를 놓는',
    essence: 'You approach abstract art like a scientist approaches the universe - with rigorous curiosity and systematic methodology. Your solitary museum visits are research sessions where you build comprehensive understanding of artistic movements, techniques, and theories.',
    essence_ko: '당신은 과학자가 우주를 탐구하듯 추상 예술에 접근합니다. 엄격한 호기심과 체계적인 방법론으로 말이죠. 홀로 떠나는 미술관 방문은 예술 운동과 기법, 이론에 대한 포괄적인 이해를 구축하는 연구 시간입니다.',
    strengths: [
      {
        icon: '🔬',
        title: 'Analytical Precision',
        description: 'You dissect artistic elements with scholarly attention'
      },
      {
        icon: '📊',
        title: 'Systematic Understanding',
        description: 'You build comprehensive mental frameworks'
      },
      {
        icon: '🏗️',
        title: 'Theoretical Construction',
        description: 'You create order from abstract chaos'
      }
    ],
    recognition: [
      'Creating mental taxonomies',
      'Studying technique intensely',
      'Building art theories',
      'Seeking comprehensive understanding'
    ],
    lifeExtension: 'This systematic approach influences your work methods (detailed project planning), your hobbies (perhaps collecting or categorizing), and your learning style (building complete mental models before moving on).',
    lifeExtension_ko: '이런 체계적 접근은 세밀한 프로젝트 계획을 세우는 업무 방식에 영향을 미치고, 수집이나 분류 같은 취미를 갖게 하며, 다음 단계로 넘어가기 전에 완전한 정신적 모델을 구축하는 학습 스타일을 만들어냅니다.',
    lifeAreas: [
      {
        title: 'In Work',
        description: 'You excel at creating systems and solving complex problems.'
      },
      {
        title: 'In Study',
        description: 'You master subjects thoroughly, becoming a quiet expert.'
      },
      {
        title: 'In Organization',
        description: 'Your personal systems are elegant and efficient.'
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
    title: 'The Emotional Sharer',
    title_ko: '감성 나눔이',
    title_ko: '감정의 지휘자',
    subtitle: 'Orchestrating collective feelings through color',
    subtitle_ko: '색채를 통해 집단의 감정을 지휘하는',
    essence: 'Art is your social language - a way to connect deeply with others through shared emotional experiences. You see galleries as spaces for communion, where abstract works become conversation starters for exploring feelings, dreams, and the ineffable aspects of being human.',
    essence_ko: '예술은 당신의 사회적 언어입니다. 공유된 감정적 경험을 통해 타인과 깊이 연결되는 방법이죠. 갤러리는 교감의 공간이며, 추상 작품들은 감정과 꿈, 그리고 인간 존재의 형언할 수 없는 측면들을 탐구하는 대화의 시작점이 됩니다.',
    strengths: [
      {
        icon: '🌈',
        title: 'Emotional Sharing',
        description: 'You create collective experiences from personal feelings'
      },
      {
        icon: '🤝',
        title: 'Intuitive Connection',
        description: 'You find your tribe through artistic resonance'
      },
      {
        icon: '💝',
        title: 'Expressive Joy',
        description: 'Your enthusiasm for art is contagious'
      }
    ],
    recognition: [
      'Bringing friends to galleries',
      'Sharing art on social media',
      'Starting deep conversations',
      'Creating art communities'
    ],
    lifeExtension: 'This connective approach shapes your social life (hosting creative gatherings), your communication style (rich with imagery and emotion), and your spaces (filled with meaningful objects that spark conversation).',
    lifeExtension_ko: '이런 연결적 접근은 창의적인 모임을 주최하는 사교 생활을 형성하고, 이미지와 감정이 풍부한 소통 방식을 만들며, 대화를 불러일으키는 의미 있는 물건들로 가득한 공간을 꾸미게 합니다.',
    lifeAreas: [
      {
        title: 'In Friendships',
        description: 'You bond through shared aesthetic and emotional experiences.'
      },
      {
        title: 'In Expression',
        description: 'You communicate feelings through creative channels.'
      },
      {
        title: 'In Community',
        description: 'You naturally create spaces for artistic connection.'
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
    title_ko: '감정의 지도제작자',
    subtitle: 'Mapping emotional territories for fellow travelers',
    subtitle_ko: '동행자들을 위해 감정의 영토를 그려내는',
    essence: 'You have a gift for helping others understand and feel art deeply. Your structured approach to emotional experiences makes you a natural gallery companion, someone who can articulate why a piece moves you and guide others to their own discoveries.',
    essence_ko: '당신은 다른 사람들이 예술을 깊이 이해하고 느낄 수 있도록 돕는 재능을 가지고 있습니다. 감정적 경험에 대한 체계적 접근은 당신을 자연스러운 갤러리 동반자로 만들어, 작품이 왜 감동을 주는지 명확히 표현하고 다른 이들을 그들만의 발견으로 인도합니다.',
    strengths: [
      {
        icon: '🎨',
        title: 'Emotional Translation',
        description: 'You help others access their feelings through art'
      },
      {
        icon: '🗺️',
        title: 'Guided Discovery',
        description: 'You create pathways for shared understanding'
      },
      {
        icon: '💬',
        title: 'Articulate Feeling',
        description: 'You give words to wordless experiences'
      }
    ],
    recognition: [
      'Natural museum tour guide',
      'Explaining art to friends',
      'Creating emotional maps',
      'Building art communities'
    ],
    lifeExtension: 'This guiding nature extends to your professional life (perhaps teaching, counseling, or creative direction), your relationships (being the emotional anchor), and your creative pursuits (making art accessible to others).',
    lifeExtension_ko: '이런 안내자적 성향은 교육이나 상담, 창의적 디렉션 같은 직업으로 이어지고, 관계에서는 감정적 닻이 되며, 예술을 다른 사람들에게 접근 가능하게 만드는 창작 활동을 추구하게 합니다.',
    lifeAreas: [
      {
        title: 'In Leadership',
        description: 'You lead with empathy and structured compassion.'
      },
      {
        title: 'In Teaching',
        description: 'You excel at making complex emotions understandable.'
      },
      {
        title: 'In Creating',
        description: 'Your work often helps others process their feelings.'
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
    title: 'The Inspiration Evangelist',
    title_ko: '영감 전도사',
    title_ko: '마음의 연금술사',
    subtitle: 'Transforming concepts into collective gold',
    subtitle_ko: '개념을 집단의 금으로 변환시키는',
    essence: 'You transform galleries into think tanks, where abstract art becomes a springboard for fascinating discussions. Your free-flowing intellectual approach combined with social energy creates dynamic experiences where ideas bounce and evolve through collective exploration.',
    essence_ko: '당신은 갤러리를 싱크탱크로 변모시킵니다. 추상 예술이 매혹적인 토론의 발판이 되는 곳으로 말이죠. 자유롭게 흐르는 지적 접근과 사회적 에너지가 결합되어, 아이디어들이 서로 부딪히고 집단적 탐구를 통해 진화하는 역동적인 경험을 만들어냅니다.',
    strengths: [
      {
        icon: '💡',
        title: 'Idea Generation',
        description: 'You spark creative thinking in groups'
      },
      {
        icon: '🎪',
        title: 'Intellectual Play',
        description: 'You make thinking together feel like adventure'
      },
      {
        icon: '🌀',
        title: 'Dynamic Discussion',
        description: 'You facilitate flowing, energetic exchanges'
      }
    ],
    recognition: [
      'Starting gallery debates',
      'Making connections laugh',
      'Proposing wild theories',
      'Creating intellectual energy'
    ],
    lifeExtension: 'This catalytic energy shapes your social circles (full of thinkers and creators), your work style (brainstorming and innovation), and your leisure (intellectual salons and creative gatherings).',
    lifeExtension_ko: '이런 촉매적 에너지는 사상가와 창작자들로 가득한 사교 모임을 형성하고, 브레인스토밍과 혁신이 중심이 되는 업무 스타일을 만들며, 지적 살롱과 창의적 모임으로 여가를 보내게 합니다.',
    lifeAreas: [
      {
        title: 'In Innovation',
        description: 'You excel at generating new ideas through collaboration.'
      },
      {
        title: 'In Social Settings',
        description: 'You create spaces where intellectual play thrives.'
      },
      {
        title: 'In Problem-Solving',
        description: 'You approach challenges with creative, collaborative thinking.'
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
        description: 'You build knowledge structures others can climb'
      },
      {
        icon: '🔗',
        title: 'Logical Connection',
        description: 'You link concepts to create comprehensive understanding'
      },
      {
        icon: '👥',
        title: 'Group Facilitation',
        description: 'You guide collective analytical exploration'
      }
    ],
    recognition: [
      'Leading study groups',
      'Creating learning frameworks',
      'Organizing art discussions',
      'Building art communities'
    ],
    lifeExtension: 'This architectural approach to knowledge shapes your professional path (education, curation, or systematic innovation), your social role (the organizer and explainer), and your personal systems (beautifully structured and shareable).',
    lifeExtension_ko: '지식에 대한 이런 건축적 접근은 교육이나 큐레이션, 체계적 혁신 같은 직업의 길로 인도하고, 조직자이자 설명자라는 사회적 역할을 부여하며, 아름답게 구조화되어 공유 가능한 개인적 시스템을 만들게 합니다.',
    lifeAreas: [
      {
        title: 'In Education',
        description: 'You excel at making complex ideas accessible and structured.'
      },
      {
        title: 'In Organization',
        description: 'You create systems that benefit entire communities.'
      },
      {
        title: 'In Leadership',
        description: 'You guide through clarity and systematic thinking.'
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
    title: 'The Solitary Observer',
    title_ko: '고독한 관찰자',
    title_ko: '침묵의 시인',
    subtitle: 'Reading verses in brushstrokes and shadows',
    subtitle_ko: '붓질과 그림자 속에서 시구를 읽는',
    essence: 'You wander galleries seeking emotional truth in realistic depictions, drawn to works that capture the poetry of everyday moments. Your solitary appreciation allows you to form intimate connections with figurative art, finding personal meaning in painted narratives.',
    essence_ko: '당신은 사실적 묘사 속에서 감정적 진실을 찾으며 갤러리를 거닙니다. 일상의 순간들이 담긴 시적인 작품들에 이끌리죠. 홀로 감상하는 시간은 구상 예술과 친밀한 연결을 맺게 하고, 그려진 이야기 속에서 개인적인 의미를 발견하게 합니다.',
    strengths: [
      {
        icon: '🌹',
        title: 'Emotional Recognition',
        description: 'You see feelings in faces and gestures'
      },
      {
        icon: '📷',
        title: 'Moment Appreciation',
        description: 'You find beauty in captured instants'
      },
      {
        icon: '🕊️',
        title: 'Poetic Perception',
        description: 'You read stories between the lines'
      }
    ],
    recognition: [
      'Drawn to portraits',
      'Finding personal stories',
      'Emotional art pilgrimages',
      'Quiet gallery wandering'
    ],
    lifeExtension: 'This romantic observation extends to your daily life (noticing small beauties others miss), your relationships (deep one-on-one connections), and your creative expression (perhaps photography, writing, or collecting meaningful objects).',
    lifeExtension_ko: '이런 낭만적 관찰력은 다른 사람들이 놓치는 작은 아름다움을 알아차리는 일상으로 확장되고, 깊은 일대일 관계를 추구하며, 사진이나 글쓰기, 의미 있는 물건을 수집하는 창작 활동으로 표현됩니다.',
    lifeAreas: [
      {
        title: 'In Observation',
        description: 'You notice emotional nuances in everyday life.'
      },
      {
        title: 'In Memory',
        description: 'You collect moments like precious photographs.'
      },
      {
        title: 'In Expression',
        description: 'You communicate through imagery and metaphor.'
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
    title: 'The Delicate Appraiser',
    title_ko: '섬세한 감정가',
    title_ko: '질감의 예언자',
    subtitle: 'Divining stories from surface and light',
    subtitle_ko: '표면과 빛으로부터 이야기를 점치는',
    essence: 'You approach realistic art with the patience of a scholar and the heart of a poet. Your structured yet emotional approach allows you to systematically uncover the layers of feeling embedded in figurative works, building deep understanding through constructive, solitary observation.',
    essence_ko: '당신은 학자의 인내심과 시인의 마음으로 사실주의 예술에 접근합니다. 체계적이면서도 감정적인 접근은 구상 작품에 담긴 감정의 층위를 체계적으로 발견하게 하고, 건설적이고 고독한 관찰을 통해 깊은 이해를 구축합니다.',
    strengths: [
      {
        icon: '🔍',
        title: 'Micro-Observation',
        description: 'You see emotions in the smallest details'
      },
      {
        icon: '📚',
        title: 'Narrative Construction',
        description: 'You build complete stories from visual clues'
      },
      {
        icon: '💎',
        title: 'Patient Discovery',
        description: 'You uncover hidden emotional gems'
      }
    ],
    recognition: [
      'Studying paintings closely',
      'Returning multiple times',
      'Reading all contexts',
      'Building emotional maps'
    ],
    lifeExtension: 'This detailed devotion influences your reading choices (character-driven literature), your relationships (deep, patient understanding), and your work (meticulous attention to human factors).',
    lifeExtension_ko: '이런 세밀한 헌신은 인물 중심의 문학을 선택하는 독서 취향에 영향을 미치고, 깊고 인내심 있는 이해를 바탕으로 한 관계를 맺으며, 인간적 요소에 꼼꼼히 주의를 기울이는 업무 방식을 만듭니다.',
    lifeAreas: [
      {
        title: 'In Understanding',
        description: 'You build complete pictures through patient observation.'
      },
      {
        title: 'In Appreciation',
        description: 'You find richness in sustained attention.'
      },
      {
        title: 'In Connection',
        description: 'You form deep bonds through constructive attention.'
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
    title: 'The Digital Explorer',
    title_ko: '디지털 탐험가',
    title_ko: '진실의 수집가',
    subtitle: 'Gathering fragments of human reality',
    subtitle_ko: '인간 현실의 조각들을 모으는',
    essence: 'You drift through galleries like a visual anthropologist, drawn to realistic works that document human experience. Your logical eye combined with flow-oriented exploration leads you to discover patterns and truths in figurative art, building your own understanding of the human condition.',
    essence_ko: '당신은 시각적 인류학자처럼 갤러리를 떠돕니다. 인간의 경험을 기록한 사실적 작품들에 이끌리죠. 논리적 시선과 흐름을 따르는 탐구가 결합되어 구상 예술에서 패턴과 진실을 발견하고, 인간의 조건에 대한 자신만의 이해를 구축합니다.',
    strengths: [
      {
        icon: '📸',
        title: 'Truth Seeking',
        description: 'You find authenticity in artistic documentation'
      },
      {
        icon: '🗺️',
        title: 'Pattern Discovery',
        description: 'You see sociological truths in art'
      },
      {
        icon: '🎯',
        title: 'Independent Analysis',
        description: 'You form your own interpretations'
      }
    ],
    recognition: [
      'Drawn to social realism',
      'Analyzing compositions',
      'Free-form exploration',
      'Building theories'
    ],
    lifeExtension: 'This documentary approach shapes your interests (perhaps photography, journalism, or cultural studies), your travel style (observational and independent), and your worldview (built from collected observations).',
    lifeExtension_ko: '이런 다큐멘터리적 접근은 사진이나 저널리즘, 문화 연구 같은 관심사를 형성하고, 관찰적이고 독립적인 여행 스타일을 만들며, 수집된 관찰들로부터 세계관을 구축하게 합니다.',
    lifeAreas: [
      {
        title: 'In Exploration',
        description: 'You document life through your unique observational lens.'
      },
      {
        title: 'In Analysis',
        description: 'You find patterns in human behavior and culture.'
      },
      {
        title: 'In Creation',
        description: 'You capture truth through your chosen medium.'
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
    title: 'The Scholarly Researcher',
    title_ko: '학구적 연구자',
    title_ko: '기법의 현자',
    subtitle: 'Meditating on the alchemy of craft',
    subtitle_ko: '장인정신의 연금술을 명상하는',
    essence: 'You approach realistic art like a master studying under masters. Your systematic, logical approach to understanding technique and composition is pursued in focused solitude, where you can fully immerse yourself in analyzing the craft behind the creation.',
    essence_ko: '당신은 거장 밑에서 공부하는 장인처럼 사실주의 예술에 접근합니다. 기법과 구성을 이해하는 체계적이고 논리적인 접근은 집중된 고독 속에서 이루어지며, 창작 뒤에 숨은 기예를 분석하는 데 완전히 몰입할 수 있습니다.',
    strengths: [
      {
        icon: '⚙️',
        title: 'Technical Analysis',
        description: 'You understand the how behind the what'
      },
      {
        icon: '📐',
        title: 'Compositional Logic',
        description: 'You see the mathematics in masterpieces'
      },
      {
        icon: '🎓',
        title: 'Scholarly Depth',
        description: 'You build expertise through systematic study'
      }
    ],
    recognition: [
      'Studying techniques',
      'Analyzing methods',
      'Building expertise',
      'Solitary mastery'
    ],
    lifeExtension: 'This technical mastery extends to your professional life (perhaps in fields requiring precision and expertise), your hobbies (likely involving craftsmanship or detailed study), and your learning style (deep, systematic, and thorough).',
    lifeExtension_ko: '이런 기술적 숙달은 정밀함과 전문성이 요구되는 직업으로 확장되고, 장인정신이나 세밀한 연구가 필요한 취미를 갖게 하며, 깊고 체계적이고 철저한 학습 스타일을 형성합니다.',
    lifeAreas: [
      {
        title: 'In Craft',
        description: 'You pursue mastery in your chosen fields.'
      },
      {
        title: 'In Study',
        description: 'You build comprehensive understanding systematically.'
      },
      {
        title: 'In Appreciation',
        description: 'You value skill and technique highly.'
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
    title: 'The Passionate Viewer',
    title_ko: '열정적 관람자',
    title_ko: '이야기의 직조자',
    subtitle: 'Spinning stories from shared gazes',
    subtitle_ko: '공유된 시선으로부터 이야기를 엮어내는',
    essence: 'Art is your bridge to others\' hearts. You see every realistic painting as a story to share, an emotion to explore together. Your flow-oriented approach to gallery visits often includes spontaneous connections with strangers, united by a shared moment of recognition in a painted face.',
    essence_ko: '예술은 다른 사람들의 마음으로 가는 다리입니다. 모든 사실적 그림은 함께 나눌 이야기이자 탐구할 감정이죠. 흐름을 따르는 갤러리 방문은 종종 낯선 이와의 즉흥적인 연결로 이어지며, 그려진 얼굴에서 발견한 공감의 순간으로 하나가 됩니다.',
    strengths: [
      {
        icon: '💕',
        title: 'Emotional Bridge-Building',
        description: 'You connect people through shared feelings'
      },
      {
        icon: '🎭',
        title: 'Story Animation',
        description: 'You bring paintings to life through narrative'
      },
      {
        icon: '🌟',
        title: 'Spontaneous Connection',
        description: 'You create magical moments with others'
      }
    ],
    recognition: [
      'Making friends in galleries',
      'Sharing personal stories',
      'Group gallery adventures',
      'Emotional art discussions'
    ],
    lifeExtension: 'This story-sharing nature influences your social life (rich with meaningful connections), your communication style (narrative and emotionally open), and your creative pursuits (likely involving human stories).',
    lifeExtension_ko: '이런 이야기를 나누는 본성은 의미 있는 연결로 풍부한 사교 생활을 만들고, 서사적이고 감정적으로 열린 소통 방식을 형성하며, 인간의 이야기가 담긴 창작 활동을 추구하게 합니다.',
    lifeAreas: [
      {
        title: 'In Relationships',
        description: 'You bond through shared stories and emotions.'
      },
      {
        title: 'In Communication',
        description: 'You speak in narratives that touch hearts.'
      },
      {
        title: 'In Community',
        description: 'You create spaces for authentic human connection.'
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
    title: 'The Warm Guide',
    title_ko: '따뜻한 안내자',
    title_ko: '마음의 큐레이터',
    subtitle: 'Cultivating gardens of collective emotion',
    subtitle_ko: '집단 감정의 정원을 가꾸는',
    essence: 'You have a gift for guiding others through the emotional landscapes of realistic art. Your structured approach to sharing helps groups process complex feelings through figurative works, creating safe spaces for collective emotional exploration and understanding.',
    essence_ko: '당신은 사실주의 예술의 감정적 풍경을 통해 다른 사람들을 안내하는 재능을 가지고 있습니다. 체계적인 공유 접근법은 그룹이 구상 작품을 통해 복잡한 감정을 처리하도록 돕고, 집단적 감정 탐구와 이해를 위한 안전한 공간을 만듭니다.',
    strengths: [
      {
        icon: '🎨',
        title: 'Emotional Facilitation',
        description: 'You guide group emotional experiences'
      },
      {
        icon: '🏛️',
        title: 'Structured Sharing',
        description: 'You create frameworks for feeling together'
      },
      {
        icon: '❤️',
        title: 'Collective Healing',
        description: 'You use art for group emotional processing'
      }
    ],
    recognition: [
      'Leading emotional tours',
      'Facilitating art therapy',
      'Creating safe spaces',
      'Structured discussions'
    ],
    lifeExtension: 'This curatorial nature extends to your professional calling (perhaps in counseling, teaching, or community work), your social role (the emotional facilitator), and your personal mission (helping others understand their feelings).',
    lifeExtension_ko: '이런 큐레이터적 본성은 상담이나 교육, 커뮤니티 활동 같은 직업적 소명으로 확장되고, 감정적 촉진자라는 사회적 역할을 부여하며, 다른 사람들이 자신의 감정을 이해하도록 돕는 개인적 사명을 갖게 합니다.',
    lifeAreas: [
      {
        title: 'In Facilitation',
        description: 'You excel at guiding group emotional processes.'
      },
      {
        title: 'In Support',
        description: 'You create structures that help others feel safely.'
      },
      {
        title: 'In Healing',
        description: 'You use beauty to help process difficult emotions.'
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
    title: 'The Knowledge Mentor',
    title_ko: '지식 멘토',
    title_ko: '문화의 항해자',
    subtitle: 'Navigating humanity through visual chronicles',
    subtitle_ko: '시각적 연대기를 통해 인류를 항해하는',
    essence: 'You turn gallery visits into cultural expeditions, using realistic art as a lens to explore and discuss human society with others. Your logical yet free-flowing approach creates dynamic group experiences where art becomes a springboard for understanding culture, history, and human nature.',
    essence_ko: '당신은 갤러리 방문을 문화적 탐험으로 바꿉니다. 사실주의 예술을 렌즈 삼아 다른 사람들과 함께 인간 사회를 탐구하고 토론하죠. 논리적이면서도 자유롭게 흐르는 접근은 예술이 문화와 역사, 인간 본성을 이해하는 발판이 되는 역동적인 그룹 경험을 만듭니다.',
    strengths: [
      {
        icon: '🌍',
        title: 'Cultural Analysis',
        description: 'You decode societies through their art'
      },
      {
        icon: '🔄',
        title: 'Dynamic Discussion',
        description: 'You facilitate flowing cultural conversations'
      },
      {
        icon: '🎪',
        title: 'Social Anthropology',
        description: 'You explore humanity through group observation'
      }
    ],
    recognition: [
      'Leading cultural tours',
      'Sparking debates',
      'Cross-cultural connections',
      'Dynamic group energy'
    ],
    lifeExtension: 'This cultural exploration shapes your travel style (immersive and social), your interests (anthropology, sociology, history), and your social circles (diverse and intellectually curious).',
    lifeExtension_ko: '이런 문화적 탐구는 몰입적이고 사회적인 여행 스타일을 형성하고, 인류학이나 사회학, 역사에 대한 관심을 키우며, 다양하고 지적 호기심이 강한 사교 모임을 만들게 합니다.',
    lifeAreas: [
      {
        title: 'In Travel',
        description: 'You explore cultures through their artistic expressions.'
      },
      {
        title: 'In Learning',
        description: 'You understand societies through collective observation.'
      },
      {
        title: 'In Connection',
        description: 'You bridge cultures through shared appreciation.'
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
    title: 'The Systematic Educator',
    title_ko: '체계적 교육자',
    title_ko: '갤러리의 현자',
    subtitle: 'Illuminating paths through visual knowledge',
    subtitle_ko: '시각적 지식을 통해 길을 밝히는',
    essence: 'You transform galleries into classrooms where realistic art becomes a teaching tool. Your structured, logical approach combined with social awareness creates comprehensive learning experiences that help groups understand not just what they\'re seeing, but why it matters.',
    essence_ko: '당신은 갤러리를 교실로 변모시키고 사실주의 예술을 교육 도구로 활용합니다. 체계적이고 논리적인 접근과 사회적 인식이 결합되어, 그룹이 단순히 무엇을 보고 있는지뿐만 아니라 왜 그것이 중요한지 이해할 수 있는 포괄적인 학습 경험을 만듭니다.',
    strengths: [
      {
        icon: '📚',
        title: 'Systematic Teaching',
        description: 'You build knowledge step by step'
      },
      {
        icon: '🎯',
        title: 'Clear Communication',
        description: 'You make complex art history accessible'
      },
      {
        icon: '🌉',
        title: 'Knowledge Building',
        description: 'You create bridges to understanding'
      }
    ],
    recognition: [
      'Natural educator',
      'Creating study guides',
      'Leading workshops',
      'Building curricula'
    ],
    lifeExtension: 'This educational approach defines your professional path (likely in education, museums, or cultural institutions), your communication style (clear and structured), and your mission (democratizing knowledge).',
    lifeExtension_ko: '이런 교육적 접근은 교육이나 박물관, 문화 기관 같은 직업의 길을 정의하고, 명확하고 체계적인 소통 방식을 만들며, 지식을 민주화하는 사명을 부여합니다.',
    lifeAreas: [
      {
        title: 'In Teaching',
        description: 'You excel at making complex information accessible.'
      },
      {
        title: 'In Organization',
        description: 'You create systems that enhance collective learning.'
      },
      {
        title: 'In Leadership',
        description: 'You guide through knowledge and structured thinking.'
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
        name: 'Jacob Lawrence',
        period: 'American Modernism',
        image: '/images/artists/lawrence.jpg',
        whyYouConnect: 'His narrative series perfect for your systematic teaching',
        whyYouConnect_ko: '그의 서사적 시리즈는 당신의 체계적 교육에 완벽합니다',
        emotionalTag: 'Historical clarity',
        emotionalTag_ko: '역사적 명확성'
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