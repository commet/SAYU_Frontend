// Representative artworks for each personality type
// Based on personality traits and art preferences

export const personalityArtworks = {
  // L-A-E-F: The Dreaming Wanderer (몽상가)
  LAEF: {
    representativeWork: {
      title: "Water Lilies",
      artist: "Claude Monet",
      year: "1906",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Claude_Monet%2C_Water_Lilies%2C_1906%2C_Ryerson.jpg/1280px-Claude_Monet%2C_Water_Lilies%2C_1906%2C_Ryerson.jpg",
      description: {
        en: "Dreamlike impressions of nature, perfect for solitary contemplation",
        ko: "자연의 꿈같은 인상, 홀로 사색하기에 완벽한 작품"
      },
      recommendationReason: {
        en: "As someone who values solitude and abstract beauty, Monet's ethereal water lilies offer endless depths for your emotional and imaginative exploration. The flowing, dreamlike quality mirrors your flow-oriented nature.",
        ko: "고독과 추상적 아름다움을 중시하는 당신에게 모네의 몽환적인 수련은 감정적이고 상상력 넘치는 탐구를 위한 무한한 깊이를 제공합니다. 흐르는 듯한 꿈같은 특질이 당신의 자유로운 영혼과 닮아있습니다."
      },
      museum: "Art Institute of Chicago"
    },
    additionalWorks: [
      {
        title: "The Starry Night",
        artist: "Vincent van Gogh",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg"
      },
      {
        title: "The Kiss",
        artist: "Gustav Klimt",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Gustav_Klimt_016.jpg/800px-Gustav_Klimt_016.jpg"
      }
    ]
  },

  // L-A-E-C: The Intuitive Analyst (직관적 분석가)
  LAEC: {
    representativeWork: {
      title: "Composition VIII",
      artist: "Wassily Kandinsky",
      year: "1923",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Vassily_Kandinsky%2C_1923_-_Composition_8%2C_huile_sur_toile%2C_140_cm_x_201_cm%2C_Mus%C3%A9e_Guggenheim%2C_New_York.jpg/1280px-Vassily_Kandinsky%2C_1923_-_Composition_8%2C_huile_sur_toile%2C_140_cm_x_201_cm%2C_Mus%C3%A9e_Guggenheim%2C_New_York.jpg",
      description: {
        en: "Systematic exploration of color and form with emotional depth",
        ko: "색채와 형태의 체계적 탐구와 감정적 깊이"
      },
      recommendationReason: {
        en: "Your analytical mind and emotional depth find perfect expression in Kandinsky's structured yet passionate compositions. The balance between constructive planning and intuitive expression reflects your unique personality.",
        ko: "당신의 분석적 사고와 감정적 깊이는 칸딘스키의 구조적이면서도 열정적인 구성에서 완벽한 표현을 찾습니다. 신중한 계획과 직관적 표현 사이의 균형이 당신의 독특한 성격을 반영합니다."
      },
      museum: "Solomon R. Guggenheim Museum"
    },
    additionalWorks: [
      {
        title: "Several Circles",
        artist: "Wassily Kandinsky",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Vassily_Kandinsky%2C_1926_-_Several_Circles%2C_Gugg_0910_25.jpg/1024px-Vassily_Kandinsky%2C_1926_-_Several_Circles%2C_Gugg_0910_25.jpg"
      }
    ]
  },

  // L-A-M-F: The Philosophical Drifter (철학적 방랑자)
  LAMF: {
    representativeWork: {
      title: "The Thinker",
      artist: "Auguste Rodin",
      year: "1904",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/The_Thinker%2C_Rodin.jpg/800px-The_Thinker%2C_Rodin.jpg",
      description: {
        en: "Deep contemplation and search for meaning in solitude",
        ko: "고독 속에서의 깊은 사색과 의미 탐구"
      },
      recommendationReason: {
        en: "Your philosophical nature and love for solitary wandering find perfect embodiment in Rodin's contemplative figure. This sculpture captures your deep search for meaning and your preference for thoughtful, introspective journeys through life.",
        ko: "당신의 철학적 성향과 고독한 방랑에 대한 사랑은 로댕의 사색적인 형상에서 완벽한 구현을 찾습니다. 이 조각은 당신의 깊은 의미 탐구와 사려 깊고 내성적인 삶의 여정에 대한 선호를 포착합니다."
      },
      museum: "Musée Rodin"
    },
    additionalWorks: [
      {
        title: "The Persistence of Memory",
        artist: "Salvador Dalí",
        image: "https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg"
      }
    ]
  },

  // L-A-M-C: The Contemplative Scholar (명상적 학자)
  LAMC: {
    representativeWork: {
      title: "Las Meninas",
      artist: "Diego Velázquez",
      year: "1656",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg/1024px-Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg",
      description: {
        en: "Complex composition inviting scholarly analysis and deep contemplation",
        ko: "학문적 분석과 깊은 명상을 불러일으키는 복잡한 구성"
      },
      recommendationReason: {
        en: "As a contemplative scholar, you'll appreciate the intellectual depth and multiple layers of meaning in Velázquez's masterpiece. The painting's complex perspectives and philosophical questions about reality and representation align perfectly with your analytical and meditative approach to art.",
        ko: "명상적 학자로서 당신은 벨라스케스의 걸작에 담긴 지적 깊이와 다층적 의미를 높이 평가할 것입니다. 이 그림의 복잡한 관점과 현실과 재현에 대한 철학적 질문들은 예술에 대한 당신의 분석적이고 명상적인 접근과 완벽하게 일치합니다."
      },
      museum: "Museo del Prado"
    },
    additionalWorks: [
      {
        title: "The School of Athens",
        artist: "Raphael",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg"
      }
    ]
  },

  // L-R-E-F: The Emotional Purist (감정적 순수주의자)
  LREF: {
    representativeWork: {
      title: "Girl with a Pearl Earring",
      artist: "Johannes Vermeer",
      year: "1665",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg",
      description: {
        en: "Pure emotional connection through realistic portrayal",
        ko: "사실적 묘사를 통한 순수한 감정적 연결"
      },
      recommendationReason: {
        en: "Your pursuit of emotional purity through realistic expression finds its perfect match in Vermeer's intimate portrait. The direct gaze and subtle emotions captured with technical precision reflect your own desire for authentic, unfiltered emotional experiences.",
        ko: "사실적 표현을 통한 감정적 순수성 추구는 베르메르의 친밀한 초상화에서 완벽한 일치를 찾습니다. 기술적 정확성으로 포착된 직접적인 시선과 미묘한 감정들은 진정하고 여과되지 않은 감정적 경험에 대한 당신의 욕구를 반영합니다."
      },
      museum: "Mauritshuis"
    },
    additionalWorks: [
      {
        title: "The Birth of Venus",
        artist: "Sandro Botticelli",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg"
      }
    ]
  },

  // L-R-E-C: The Methodical Emotionalist (체계적 감정가)
  LREC: {
    representativeWork: {
      title: "The Anatomy Lesson of Dr. Nicolaes Tulp",
      artist: "Rembrandt",
      year: "1632",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/The_Anatomy_Lesson_of_Dr_Nicolaes_Tulp.jpg/1280px-The_Anatomy_Lesson_of_Dr_Nicolaes_Tulp.jpg",
      description: {
        en: "Technical mastery conveying deep human emotion",
        ko: "깊은 인간의 감정을 전달하는 기술적 숙련"
      },
      recommendationReason: {
        en: "Your methodical approach to understanding emotions is perfectly reflected in Rembrandt's masterful technique. The painting demonstrates how systematic study and technical precision can enhance rather than diminish emotional impact, mirroring your own balanced nature.",
        ko: "감정을 이해하는 당신의 체계적인 접근은 렘브란트의 숙련된 기법에 완벽하게 반영됩니다. 이 그림은 체계적인 연구와 기술적 정확성이 감정적 영향력을 감소시키기보다 오히려 강화할 수 있음을 보여주며, 당신의 균형 잡힌 성격을 반영합니다."
      },
      museum: "Mauritshuis"
    }
  },

  // L-R-M-F: The Solitary Interpreter (고독한 해석자)
  LRMF: {
    representativeWork: {
      title: "American Gothic",
      artist: "Grant Wood",
      year: "1930",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg/800px-Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg",
      description: {
        en: "Personal interpretation of everyday life and meaning",
        ko: "일상과 의미에 대한 개인적 해석"
      },
      recommendationReason: {
        en: "As a solitary interpreter, you connect deeply with Wood's personal vision of American life. The painting's quiet dignity and layers of meaning invite your individual contemplation while remaining grounded in realistic observation.",
        ko: "고독한 해석자로서 당신은 우드의 미국 생활에 대한 개인적 비전과 깊이 연결됩니다. 이 그림의 조용한 품위와 의미의 층들은 현실적 관찰에 기반을 두면서도 당신의 개인적 사색을 이끌어냅니다."
      },
      museum: "Art Institute of Chicago"
    }
  },

  // L-R-M-C: The Detailed Researcher (세밀한 연구자)
  LRMC: {
    representativeWork: {
      title: "The Arnolfini Portrait",
      artist: "Jan van Eyck",
      year: "1434",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Van_Eyck_-_Arnolfini_Portrait.jpg/800px-Van_Eyck_-_Arnolfini_Portrait.jpg",
      description: {
        en: "Meticulous detail inviting deep research and analysis",
        ko: "깊은 연구와 분석을 요구하는 세심한 디테일"
      },
      recommendationReason: {
        en: "Your love for detailed research finds endless satisfaction in van Eyck's incredibly precise work. Every symbol and reflection rewards constructive study, perfectly matching your methodical approach to uncovering hidden meanings in realistic art.",
        ko: "세밀한 연구에 대한 당신의 사랑은 반 에이크의 놀랍도록 정확한 작품에서 끝없는 만족을 찾습니다. 모든 상징과 반사는 신중한 연구에 보상을 주며, 사실적 예술에서 숨겨진 의미를 발견하는 당신의 체계적인 접근과 완벽하게 일치합니다."
      },
      museum: "National Gallery, London"
    }
  },

  // S-A-E-F: The Social Dreamer (사회적 몽상가)
  SAEF: {
    representativeWork: {
      title: "A Sunday on La Grande Jatte",
      artist: "Georges Seurat",
      year: "1886",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1280px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg",
      description: {
        en: "Social gathering in dreamlike atmosphere",
        ko: "꿈같은 분위기 속의 사회적 모임"
      },
      recommendationReason: {
        en: "Your social nature combined with abstract thinking finds perfect expression in Seurat's pointillist masterpiece. The painting captures both the vibrancy of social life and the dreamlike quality you bring to interpersonal connections.",
        ko: "추상적 사고와 결합된 당신의 사회적 성향은 쇠라의 점묘법 걸작에서 완벽한 표현을 찾습니다. 이 그림은 사회적 삶의 활기와 당신이 대인관계에 가져오는 꿈같은 특질을 모두 포착합니다."
      },
      museum: "Art Institute of Chicago"
    }
  },

  // S-A-E-C: The Collaborative Curator (협력적 큐레이터)
  SAEC: {
    representativeWork: {
      title: "The Dance",
      artist: "Henri Matisse",
      year: "1910",
      image: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Matissedance.jpg/1024px-Matissedance.jpg",
      description: {
        en: "Systematic exploration of emotion through collective movement",
        ko: "집단적 움직임을 통한 감정의 체계적 탐구"
      },
      recommendationReason: {
        en: "As a collaborative curator, you appreciate how Matisse systematically explores emotional expression through group dynamics. The painting's organized yet fluid composition mirrors your ability to bring structure to creative collaboration.",
        ko: "협력적 큐레이터로서 당신은 마티스가 집단 역학을 통해 감정적 표현을 체계적으로 탐구하는 방식을 높이 평가합니다. 조직적이면서도 유동적인 구성은 창의적 협업에 구조를 가져오는 당신의 능력을 반영합니다."
      },
      museum: "Hermitage Museum"
    }
  },

  // S-A-M-F: The Inspirational Guide (영감을 주는 안내자)
  SAMF: {
    representativeWork: {
      title: "The Creation of Adam",
      artist: "Michelangelo",
      year: "1512",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1280px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
      description: {
        en: "Inspiring spiritual connection and shared meaning",
        ko: "영감을 주는 영적 연결과 공유된 의미"
      },
      recommendationReason: {
        en: "Your role as an inspirational guide resonates deeply with Michelangelo's transcendent vision. This iconic work embodies your ability to help others find profound meaning through shared artistic and spiritual experiences.",
        ko: "영감을 주는 안내자로서의 당신의 역할은 미켈란젤로의 초월적 비전과 깊이 공명합니다. 이 상징적인 작품은 공유된 예술적, 영적 경험을 통해 다른 사람들이 심오한 의미를 찾도록 돕는 당신의 능력을 구현합니다."
      },
      museum: "Sistine Chapel"
    }
  },

  // S-A-M-C: The Systematic Teacher (체계적 교사)
  SAMC: {
    representativeWork: {
      title: "Nighthawks",
      artist: "Edward Hopper",
      year: "1942",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/1280px-Nighthawks_by_Edward_Hopper_1942.jpg",
      description: {
        en: "Structured narrative inviting educational discussion",
        ko: "교육적 토론을 이끄는 구조화된 서사"
      },
      recommendationReason: {
        en: "As a systematic teacher, you excel at using Hopper's carefully constructed scenes to facilitate meaningful discussions. The painting's clear structure and open-ended narrative provide the perfect framework for your educational approach.",
        ko: "체계적 교사로서 당신은 호퍼의 신중하게 구성된 장면을 사용하여 의미 있는 토론을 촉진하는 데 탁월합니다. 그림의 명확한 구조와 열린 서사는 당신의 교육적 접근을 위한 완벽한 틀을 제공합니다."
      },
      museum: "Art Institute of Chicago"
    }
  },

  // S-R-E-F: The Authentic Connector (진정한 연결자)
  SREF: {
    representativeWork: {
      title: "The Night Watch",
      artist: "Rembrandt",
      year: "1642",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1280px-The_Night_Watch_-_HD.jpg",
      description: {
        en: "Authentic human connections captured in realistic detail",
        ko: "사실적 디테일로 포착된 진정한 인간 관계"
      },
      recommendationReason: {
        en: "Your gift for authentic connection shines through Rembrandt's dynamic group portrait. The painting's realistic detail and emotional depth mirror your ability to forge genuine relationships while appreciating individual uniqueness.",
        ko: "진정한 연결에 대한 당신의 재능은 렘브란트의 역동적인 집단 초상화를 통해 빛납니다. 그림의 사실적 디테일과 감정적 깊이는 개인의 독특성을 인정하면서 진정한 관계를 형성하는 당신의 능력을 반영합니다."
      },
      museum: "Rijksmuseum"
    }
  },

  // S-R-E-C: The Technical Discussant (기술적 토론자)
  SREC: {
    representativeWork: {
      title: "Liberty Leading the People",
      artist: "Eugène Delacroix",
      year: "1830",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/1280px-Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg",
      description: {
        en: "Technical mastery sparking emotional and analytical discussion",
        ko: "감정적이고 분석적인 토론을 이끄는 기술적 숙련"
      },
      recommendationReason: {
        en: "As a technical discussant, you thrive on Delacroix's combination of masterful technique and passionate expression. This work provides rich material for both emotional response and technical analysis in group settings.",
        ko: "기술적 토론자로서 당신은 들라크루아의 숙련된 기법과 열정적 표현의 조합에서 번창합니다. 이 작품은 집단 환경에서 감정적 반응과 기술적 분석 모두를 위한 풍부한 자료를 제공합니다."
      },
      museum: "Louvre Museum"
    }
  },

  // S-R-M-F: The Community Storyteller (공동체 이야기꾼)
  SRMF: {
    representativeWork: {
      title: "The Potato Eaters",
      artist: "Vincent van Gogh",
      year: "1885",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Van-willem-vincent-gogh-die-kartoffelesser-03850.jpg/1280px-Van-willem-vincent-gogh-die-kartoffelesser-03850.jpg",
      description: {
        en: "Sharing stories of everyday life and community",
        ko: "일상과 공동체의 이야기를 나누는 작품"
      },
      recommendationReason: {
        en: "Your talent for community storytelling finds resonance in van Gogh's humble yet profound depiction of shared life. The painting celebrates the simple dignity of everyday moments, reflecting your ability to find and share meaning in communal experiences.",
        ko: "공동체 이야기꾼으로서의 당신의 재능은 반 고흐의 겸손하면서도 심오한 공동 생활 묘사에서 공명을 찾습니다. 이 그림은 일상의 순간들의 단순한 품위를 기념하며, 공동체 경험에서 의미를 찾고 공유하는 당신의 능력을 반영합니다."
      },
      museum: "Van Gogh Museum"
    }
  },

  // S-R-M-C: The Systematic Lecturer (체계적 강연자)
  SRMC: {
    representativeWork: {
      title: "Guernica",
      artist: "Pablo Picasso",
      year: "1937",
      image: "https://upload.wikimedia.org/wikipedia/en/thumb/7/74/PicassoGuernica.jpg/1280px-PicassoGuernica.jpg",
      description: {
        en: "Systematic analysis of social meaning through structured composition",
        ko: "구조화된 구성을 통한 사회적 의미의 체계적 분석"
      },
      recommendationReason: {
        en: "As a systematic lecturer, you excel at unpacking Picasso's complex symbolism and structured chaos. This masterpiece provides endless material for your methodical approach to teaching about social meaning and artistic expression.",
        ko: "체계적 강연자로서 당신은 피카소의 복잡한 상징주의와 구조화된 혼돈을 풀어내는 데 탁월합니다. 이 걸작은 사회적 의미와 예술적 표현에 대한 당신의 체계적인 교육 접근을 위한 끝없는 자료를 제공합니다."
      },
      museum: "Museo Reina Sofía"
    }
  }
};

// Function to get artwork recommendations for a personality type
export function getArtworkRecommendations(personalityType: string) {
  return personalityArtworks[personalityType as keyof typeof personalityArtworks] || null;
}

// Function to get all personality types with their main artwork
export function getAllPersonalityArtworks() {
  return Object.entries(personalityArtworks).map(([type, data]) => ({
    type,
    artwork: data.representativeWork
  }));
}