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
    title: 'The Color Whisperer',
    title_ko: '색채의 속삭임',
    subtitle: 'Dancing with abstract emotions in solitude',
    subtitle_ko: '고독 속에서 추상적 감정과 춤추는',
    essence: 'You don\'t just see art, you feel it breathing. In the quiet moments between you and a canvas, entire universes unfold. Your journey through galleries is deeply personal - a meditation where each piece either resonates in your bones or passes by like a gentle breeze.',
    essence_ko: '당신은 예술을 단순히 보는 것이 아니라 숨 쉬는 것을 느낍니다. 캔버스와 당신 사이의 고요한 순간에 전 우주가 펼쳐집니다. 갤러리를 통한 당신의 여정은 깊이 개인적인 것입니다 - 각 작품이 당신의 뼈 속에서 울리거나 부드러운 산들바람처럼 지나가는 명상.',
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
    lifeExtension_ko: '이런 아름다움을 경험하는 방식은 아침 커피를 마실 장소(가장 빛이 좋은 곳)를 고르는 방법, 당신을 움직이는 음악(종종 가사 없는), 그리고 집처럼 느껴지는 도시(숨겨진 모퉁이와 예술적 영혼을 가진)로 확장됩니다.',
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
        emotionalTag: 'Meditative depth'
      },
      {
        name: 'Agnes Martin',
        period: 'Minimalism',
        image: '/images/artists/martin.jpg',
        whyYouConnect: 'Her quiet grids create space for your contemplation',
        emotionalTag: 'Gentle presence'
      },
      {
        name: 'Hilma af Klint',
        period: 'Spiritual Abstraction',
        image: '/images/artists/klint.jpg',
        whyYouConnect: 'Her mystical symbols speak to your intuitive nature',
        emotionalTag: 'Hidden meanings'
      }
    ]
  },

  // Lone Wolf + Abstract + Emotional + Structured
  LAEC: {
    type: 'LAEC',
    title: 'The Canvas Philosopher',
    subtitle: 'Architecting emotional depth through abstract forms',
    essence: 'You approach art like a poet approaches words - with reverence, patience, and deep attention. Your solitary gallery visits are research expeditions of the soul, where you systematically uncover layers of meaning while allowing yourself to be emotionally moved.',
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
        emotionalTag: 'Profound complexity'
      },
      {
        name: 'Lee Bae',
        period: 'Contemporary',
        image: '/images/artists/bae.jpg',
        whyYouConnect: 'His charcoal meditations resonate with your contemplative nature',
        emotionalTag: 'Structured serenity'
      },
      {
        name: 'Gerhard Richter',
        period: 'Contemporary',
        image: '/images/artists/richter.jpg',
        whyYouConnect: 'His systematic exploration of painting speaks to your methodical soul',
        emotionalTag: 'Intellectual emotion'
      }
    ]
  },

  // Lone Wolf + Abstract + Logical + Flow-oriented
  LAMF: {
    type: 'LAMF',
    title: 'The Concept Hunter',
    subtitle: 'Chasing ideas through abstract labyrinths',
    essence: 'You float through galleries like a philosopher through ideas - independently, curiously, following threads of meaning wherever they lead. Your approach is both intellectual and free-flowing, finding patterns and concepts in abstract forms while maintaining the flexibility to change course when inspiration strikes.',
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
        emotionalTag: 'Conceptual play'
      },
      {
        name: 'James Turrell',
        period: 'Light and Space',
        image: '/images/artists/turrell.jpg',
        whyYouConnect: 'His perceptual experiments align with your philosophical nature',
        emotionalTag: 'Mind expansion'
      },
      {
        name: 'Lee Ufan',
        period: 'Mono-ha',
        image: '/images/artists/ufan.jpg',
        whyYouConnect: 'His minimal gestures speak volumes to your contemplative mind',
        emotionalTag: 'Zen philosophy'
      }
    ]
  },

  // Lone Wolf + Abstract + Logical + Structured
  LAMC: {
    type: 'LAMC',
    title: 'The Pattern Architect',
    subtitle: 'Building bridges between chaos and order',
    essence: 'You approach abstract art like a scientist approaches the universe - with rigorous curiosity and systematic methodology. Your solitary museum visits are research sessions where you build comprehensive understanding of artistic movements, techniques, and theories.',
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
        emotionalTag: 'Pure structure'
      },
      {
        name: 'Frank Stella',
        period: 'Minimalism',
        image: '/images/artists/stella.jpg',
        whyYouConnect: 'His logical progressions appeal to your systematic nature',
        emotionalTag: 'Geometric logic'
      },
      {
        name: 'Bridget Riley',
        period: 'Op Art',
        image: '/images/artists/riley.jpg',
        whyYouConnect: 'Her precise optical experiments engage your analytical eye',
        emotionalTag: 'Systematic sensation'
      }
    ]
  },

  // Social + Abstract + Emotional + Flow-oriented
  SAEF: {
    type: 'SAEF',
    title: 'The Emotion Conductor',
    subtitle: 'Orchestrating collective feelings through color',
    essence: 'Art is your social language - a way to connect deeply with others through shared emotional experiences. You see galleries as spaces for communion, where abstract works become conversation starters for exploring feelings, dreams, and the ineffable aspects of being human.',
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
        emotionalTag: 'Shared nostalgia'
      },
      {
        name: 'Yayoi Kusama',
        period: 'Contemporary',
        image: '/images/artists/kusama.jpg',
        whyYouConnect: 'Her immersive installations create the communal experiences you crave',
        emotionalTag: 'Collective wonder'
      },
      {
        name: 'David Hockney',
        period: 'Pop Art',
        image: '/images/artists/hockney.jpg',
        whyYouConnect: 'His joyful colors and social scenes resonate with your expressive nature',
        emotionalTag: 'Vibrant connection'
      }
    ]
  },

  // Social + Abstract + Emotional + Structured
  SAEC: {
    type: 'SAEC',
    title: 'The Feeling Cartographer',
    subtitle: 'Mapping emotional territories for fellow travelers',
    essence: 'You have a gift for helping others understand and feel art deeply. Your structured approach to emotional experiences makes you a natural gallery companion, someone who can articulate why a piece moves you and guide others to their own discoveries.',
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
        emotionalTag: 'Therapeutic power'
      },
      {
        name: 'Wolfgang Tillmans',
        period: 'Contemporary Photography',
        image: '/images/artists/tillmans.jpg',
        whyYouConnect: 'His intimate yet universal images foster collective feeling',
        emotionalTag: 'Shared intimacy'
      },
      {
        name: 'Felix Gonzalez-Torres',
        period: 'Conceptual Art',
        image: '/images/artists/gonzalez-torres.jpg',
        whyYouConnect: 'His participatory works create structured emotional experiences',
        emotionalTag: 'Collective mourning'
      }
    ]
  },

  // Social + Abstract + Logical + Flow-oriented
  SAMF: {
    type: 'SAMF',
    title: 'The Mind Alchemist',
    subtitle: 'Transforming concepts into collective gold',
    essence: 'You transform galleries into think tanks, where abstract art becomes a springboard for fascinating discussions. Your free-flowing intellectual approach combined with social energy creates dynamic experiences where ideas bounce and evolve through collective exploration.',
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
        emotionalTag: 'Collective experiment'
      },
      {
        name: 'Tomás Saraceno',
        period: 'Contemporary',
        image: '/images/artists/saraceno.jpg',
        whyYouConnect: 'His web-like structures mirror your networked thinking',
        emotionalTag: 'Connected ideas'
      },
      {
        name: 'Tino Sehgal',
        period: 'Contemporary Performance',
        image: '/images/artists/sehgal.jpg',
        whyYouConnect: 'His constructed situations align with your social conceptual nature',
        emotionalTag: 'Living philosophy'
      }
    ]
  },

  // Social + Abstract + Logical + Structured
  SAMC: {
    type: 'SAMC',
    title: 'The Theory Weaver',
    subtitle: 'Spinning abstract wisdom into social fabric',
    essence: 'You orchestrate collective learning experiences in galleries, creating structured frameworks that help groups understand complex artistic concepts together. Your logical approach combined with social awareness makes abstract art accessible and engaging for diverse audiences.',
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
        emotionalTag: 'Ordered clarity'
      },
      {
        name: 'Dan Flavin',
        period: 'Minimalism',
        image: '/images/artists/flavin.jpg',
        whyYouConnect: 'His modular light works appeal to your systematic aesthetic',
        emotionalTag: 'Structured radiance'
      },
      {
        name: 'Carl Andre',
        period: 'Minimalism',
        image: '/images/artists/andre.jpg',
        whyYouConnect: 'His mathematical arrangements resonate with your logical social approach',
        emotionalTag: 'Collective order'
      }
    ]
  },

  // Lone Wolf + Realistic + Emotional + Flow-oriented
  LREF: {
    type: 'LREF',
    title: 'The Silent Poet',
    subtitle: 'Reading verses in brushstrokes and shadows',
    essence: 'You wander galleries seeking emotional truth in realistic depictions, drawn to works that capture the poetry of everyday moments. Your solitary appreciation allows you to form intimate connections with figurative art, finding personal meaning in painted narratives.',
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
        emotionalTag: 'Quiet longing'
      },
      {
        name: 'Lucian Freud',
        period: 'Contemporary Realism',
        image: '/images/artists/freud.jpg',
        whyYouConnect: 'His psychological portraits match your emotional depth',
        emotionalTag: 'Raw intimacy'
      },
      {
        name: 'Edward Hopper',
        period: 'American Realism',
        image: '/images/artists/hopper.jpg',
        whyYouConnect: 'His isolated figures speak to your solitary appreciation',
        emotionalTag: 'Beautiful loneliness'
      }
    ]
  },

  // Lone Wolf + Realistic + Emotional + Structured
  LREC: {
    type: 'LREC',
    title: 'The Texture Oracle',
    subtitle: 'Divining stories from surface and light',
    essence: 'You approach realistic art with the patience of a scholar and the heart of a poet. Your structured yet emotional approach allows you to systematically uncover the layers of feeling embedded in figurative works, building deep understanding through constructive, solitary observation.',
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
        emotionalTag: 'Intimate precision'
      },
      {
        name: 'Jenny Saville',
        period: 'Contemporary',
        image: '/images/artists/saville.jpg',
        whyYouConnect: 'Her monumental flesh studies match your detailed emotional exploration',
        emotionalTag: 'Visceral detail'
      },
      {
        name: 'Antonio López García',
        period: 'Contemporary Realism',
        image: '/images/artists/garcia.jpg',
        whyYouConnect: 'His patient observation mirrors your methodical appreciation',
        emotionalTag: 'Meditative precision'
      }
    ]
  },

  // Lone Wolf + Realistic + Logical + Flow-oriented
  LRMF: {
    type: 'LRMF',
    title: 'The Truth Collector',
    subtitle: 'Gathering fragments of human reality',
    essence: 'You drift through galleries like a visual anthropologist, drawn to realistic works that document human experience. Your logical eye combined with flow-oriented exploration leads you to discover patterns and truths in figurative art, building your own understanding of the human condition.',
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
        emotionalTag: 'Honest witness'
      },
      {
        name: 'Diego Rivera',
        period: 'Mexican Muralism',
        image: '/images/artists/rivera.jpg',
        whyYouConnect: 'His social narratives appeal to your analytical wandering',
        emotionalTag: 'Epic documentation'
      },
      {
        name: 'Kehinde Wiley',
        period: 'Contemporary',
        image: '/images/artists/wiley.jpg',
        whyYouConnect: 'His reimagined portraits speak to your fresh perspective on tradition',
        emotionalTag: 'Contemporary truth'
      }
    ]
  },

  // Lone Wolf + Realistic + Logical + Structured
  LRMC: {
    type: 'LRMC',
    title: 'The Technique Sage',
    subtitle: 'Meditating on the alchemy of craft',
    essence: 'You approach realistic art like a master studying under masters. Your systematic, logical approach to understanding technique and composition is pursued in focused solitude, where you can fully immerse yourself in analyzing the craft behind the creation.',
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
        emotionalTag: 'Masterful precision'
      },
      {
        name: 'Chuck Close',
        period: 'Photorealism',
        image: '/images/artists/close.jpg',
        whyYouConnect: 'His systematic approach to portraiture matches your methodical nature',
        emotionalTag: 'Systematic mastery'
      },
      {
        name: 'Gottfried Helnwein',
        period: 'Hyperrealism',
        image: '/images/artists/helnwein.jpg',
        whyYouConnect: 'His technical precision appeals to your appreciation of craft',
        emotionalTag: 'Disturbing perfection'
      }
    ]
  },

  // Social + Realistic + Emotional + Flow-oriented
  SREF: {
    type: 'SREF',
    title: 'The Narrative Weaver',
    subtitle: 'Spinning stories from shared gazes',
    essence: 'Art is your bridge to others\' hearts. You see every realistic painting as a story to share, an emotion to explore together. Your flow-oriented approach to gallery visits often includes spontaneous connections with strangers, united by a shared moment of recognition in a painted face.',
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
        emotionalTag: 'Tender moments'
      },
      {
        name: 'Norman Rockwell',
        period: 'American Illustration',
        image: '/images/artists/rockwell.jpg',
        whyYouConnect: 'His storytelling matches your narrative sharing spirit',
        emotionalTag: 'Shared nostalgia'
      },
      {
        name: 'Amy Sherald',
        period: 'Contemporary',
        image: '/images/artists/sherald.jpg',
        whyYouConnect: 'Her powerful portraits inspire the connections you seek',
        emotionalTag: 'Dignified stories'
      }
    ]
  },

  // Social + Realistic + Emotional + Structured
  SREC: {
    type: 'SREC',
    title: 'The Heart Curator',
    subtitle: 'Cultivating gardens of collective emotion',
    essence: 'You have a gift for guiding others through the emotional landscapes of realistic art. Your structured approach to sharing helps groups process complex feelings through figurative works, creating safe spaces for collective emotional exploration and understanding.',
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
        emotionalTag: 'Shared pain'
      },
      {
        name: 'Alice Neel',
        period: 'American Portraiture',
        image: '/images/artists/neel.jpg',
        whyYouConnect: 'Her psychological portraits facilitate emotional discussions',
        emotionalTag: 'Human complexity'
      },
      {
        name: 'Kara Walker',
        period: 'Contemporary',
        image: '/images/artists/walker.jpg',
        whyYouConnect: 'Her challenging narratives create space for difficult conversations',
        emotionalTag: 'Collective reckoning'
      }
    ]
  },

  // Social + Realistic + Logical + Flow-oriented
  SRMF: {
    type: 'SRMF',
    title: 'The Culture Voyager',
    subtitle: 'Navigating humanity through visual chronicles',
    essence: 'You turn gallery visits into cultural expeditions, using realistic art as a lens to explore and discuss human society with others. Your logical yet free-flowing approach creates dynamic group experiences where art becomes a springboard for understanding culture, history, and human nature.',
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
        emotionalTag: 'Cultural critique'
      },
      {
        name: 'JR',
        period: 'Contemporary Photography',
        image: '/images/artists/jr.jpg',
        whyYouConnect: 'His global projects match your cultural exploration spirit',
        emotionalTag: 'Human connection'
      },
      {
        name: 'Ai Weiwei',
        period: 'Contemporary',
        image: '/images/artists/weiwei.jpg',
        whyYouConnect: 'His political art fuels your analytical discussions',
        emotionalTag: 'Social consciousness'
      }
    ]
  },

  // Social + Realistic + Logical + Structured
  SRMC: {
    type: 'SRMC',
    title: 'The Gallery Sage',
    subtitle: 'Illuminating paths through visual knowledge',
    essence: 'You transform galleries into classrooms where realistic art becomes a teaching tool. Your structured, logical approach combined with social awareness creates comprehensive learning experiences that help groups understand not just what they\'re seeing, but why it matters.',
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
        emotionalTag: 'Accessible truth'
      },
      {
        name: 'Jacob Lawrence',
        period: 'American Modernism',
        image: '/images/artists/lawrence.jpg',
        whyYouConnect: 'His narrative series perfect for your systematic teaching',
        emotionalTag: 'Historical clarity'
      },
      {
        name: 'Judy Chicago',
        period: 'Feminist Art',
        image: '/images/artists/chicago.jpg',
        whyYouConnect: 'Her collaborative works match your collective education approach',
        emotionalTag: 'Shared learning'
      }
    ]
  }
};