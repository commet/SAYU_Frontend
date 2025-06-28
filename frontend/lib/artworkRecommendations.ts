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