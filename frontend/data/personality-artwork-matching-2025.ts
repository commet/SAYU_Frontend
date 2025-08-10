/**
 * SAYU 성격 유형별 작가-작품 매칭 시스템 (2025)
 * 
 * 16가지 성격 유형의 심리적 특성을 완벽하게 반영한 작가-작품 큐레이션
 * 각 유형별로 2명의 거장 + 1명의 숨겨진 보석 작가와 구체적 작품 제시
 * 
 * 기반 데이터: Artvee 4,000+ 마스터피스 컬렉션
 * - Renoir (695작품), Sargent (648작품), Munch (472작품), Rembrandt (402작품)
 * - Van Gogh (283작품), Monet (333작품), Cézanne (356작품), Kandinsky (298작품)
 */

export interface ArtworkMatch {
  title: string;
  year?: string;
  description: string;
  personalityResonance: string; // 해당 성격 유형과의 공명점
}

export interface ArtistMatch {
  name: string;
  period: string;
  style: string;
  keyArtwork: ArtworkMatch;
  alternativeWorks: ArtworkMatch[];
  personalityAlignment: string; // 성격 유형과 맞는 이유
}

export interface PersonalityArtistMatching {
  primary: ArtistMatch;      // 최고의 매칭 (초거장)
  secondary: ArtistMatch;    // 보완적 매칭 (거장)
  tertiary: ArtistMatch;     // 발견의 기쁨 (숨겨진 보석)
  matchingRationale: string; // 전체적인 매칭 근거
}

/**
 * 16가지 SAYU 성격 유형별 완벽한 작가-작품 매칭
 * 
 * 각 성격 유형의 4차원 특성을 모두 고려:
 * - L/S: 관람 선호도 (혼자 vs 함께)
 * - A/R: 인식 스타일 (추상 vs 구상)  
 * - E/M: 성찰 유형 (감정 vs 의미)
 * - F/C: 탐색 스타일 (흐름 vs 구조)
 */
export const PERSONALITY_ARTIST_MATCHING_2025: Record<string, PersonalityArtistMatching> = {

  // ===== L (LONE) 계열 - 고독한 내면 탐구자들 =====

  /**
   * LAEF (여우) - 몽환적 방랑자
   * 특성: 혼자서 추상적 감정을 자유롭게 탐구
   * 키워드: 꿈, 환상, 직감, 신비로움, 감정의 자유로운 흐름
   */
  LAEF: {
    primary: {
      name: "Odilon Redon",
      period: "1840-1916",
      style: "Symbolism",
      keyArtwork: {
        title: "The Cyclops",
        year: "1914",
        description: "거대한 외눈박이가 잠든 님프를 바라보는 신화적 장면. 꿈과 현실의 경계가 모호한 환상적 세계.",
        personalityResonance: "LAEF의 몽환적 상상력과 신비로운 직관력이 작품 속 초현실적 분위기와 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "The Eye Like a Strange Balloon",
          year: "1882",
          description: "하늘을 떠다니는 거대한 눈알. 의식과 무의식의 경계를 탐구하는 초현실적 비전.",
          personalityResonance: "내면 세계의 자유로운 탐험과 직관적 통찰력을 상징"
        }
      ],
      personalityAlignment: "고독한 상상 속에서 감정의 자유로운 흐름을 추구하는 LAEF의 본성과 Redon의 꿈같은 상징주의가 완벽 일치"
    },
    secondary: {
      name: "Edvard Munch",
      period: "1863-1944", 
      style: "Expressionism",
      keyArtwork: {
        title: "The Scream",
        year: "1893",
        description: "인간 실존의 불안과 고독을 표현한 20세기 가장 유명한 작품. 감정의 원시적 울림.",
        personalityResonance: "LAEF의 깊은 내면 감정과 고독한 성찰이 작품의 실존적 불안과 강렬하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "The Dance of Life",
          year: "1899-1900",
          description: "인생의 단계를 춤추는 인물들로 표현. 삶과 죽음, 사랑의 순환을 감정적으로 탐구.",
          personalityResonance: "인생에 대한 철학적이면서도 감정적인 접근이 LAEF의 성향과 일치"
        }
      ],
      personalityAlignment: "내면의 감정을 자유롭게 표출하며 인간 조건에 대해 깊이 성찰하는 점에서 LAEF와 공명"
    },
    tertiary: {
      name: "Paul Klee",
      period: "1879-1940",
      style: "Abstract Expressionism",
      keyArtwork: {
        title: "Twittering Machine",
        year: "1922",
        description: "기계적 새들이 지저귀는 환상적 장치. 현대 문명에 대한 시적 비판과 순수한 상상력의 발현.",
        personalityResonance: "LAEF의 유쾌한 상상력과 현실에 대한 독특한 관점이 Klee의 시적 추상과 만난다."
      },
      alternativeWorks: [
        {
          title: "Fish Magic",
          year: "1925",
          description: "밤하늘 아래 물고기들이 헤엄치는 신비로운 세계. 꿈과 현실이 자연스럽게 융합.",
          personalityResonance: "환상과 현실의 자유로운 결합이 LAEF의 몽환적 세계관과 완벽 매치"
        }
      ],
      personalityAlignment: "아이같은 순수함과 깊은 철학이 결합된 Klee의 작품 세계가 LAEF의 자유로운 정신과 공명"
    },
    matchingRationale: "혼자만의 시간에 추상적 이미지를 통해 감정의 자유로운 흐름을 경험하고 싶어하는 LAEF에게, 꿈과 환상의 세계를 탐구하는 상징주의와 표현주의 거장들이 완벽한 영감을 제공한다."
  },

  /**
   * LAEC (고양이) - 감성 큐레이터
   * 특성: 혼자서 추상적 감정을 체계적으로 탐구
   * 키워드: 정제된 감성, 미적 완성도, 절제된 아름다움, 우아한 구조
   */
  LAEC: {
    primary: {
      name: "Paul Cézanne", 
      period: "1839-1906",
      style: "Post-Impressionism",
      keyArtwork: {
        title: "Mont Sainte-Victoire",
        year: "1904-1906",
        description: "프로방스의 성산을 기하학적 형태로 재해석. 자연을 구조적으로 분석하되 감정적 온기를 잃지 않음.",
        personalityResonance: "LAEC의 체계적 미감과 절제된 감정 표현이 세잔의 구조적이면서도 서정적인 접근과 완벽 일치"
      },
      alternativeWorks: [
        {
          title: "The Large Bathers",
          year: "1895-1906", 
          description: "인체와 자연의 조화를 기하학적으로 구성. 고전적 아름다움을 현대적 시각으로 재해석.",
          personalityResonance: "전통적 아름다움을 개인적 미학으로 정제하는 LAEC의 큐레이터 정신과 공명"
        }
      ],
      personalityAlignment: "감정을 체계적으로 구조화하면서도 따뜻함을 잃지 않는 세잔의 접근이 LAEC의 감성 큐레이션과 완벽 매치"
    },
    secondary: {
      name: "Wassily Kandinsky",
      period: "1866-1944",
      style: "Abstract Art", 
      keyArtwork: {
        title: "Composition VII",
        year: "1913",
        description: "순수 추상의 걸작. 색채와 형태의 정교한 조화로 음악적 리듬과 감정을 표현.",
        personalityResonance: "LAEC의 추상적 감수성과 체계적 미학 구성이 칸딘스키의 이론적이면서도 감성적인 추상과 만난다."
      },
      alternativeWorks: [
        {
          title: "Yellow-Red-Blue", 
          year: "1925",
          description: "색채 이론을 바탕으로 한 감정의 스펙트럼. 좌측의 따뜻함에서 우측의 차가움으로의 여행.",
          personalityResonance: "색채를 통한 감정의 체계적 표현이 LAEC의 정제된 감성과 공명"
        }
      ],
      personalityAlignment: "예술의 정신적 가치를 추구하며 감정을 추상적 언어로 체계화하는 칸딘스키의 철학이 LAEC와 일치"
    },
    tertiary: {
      name: "Henri Matisse",
      period: "1869-1954", 
      style: "Fauvism/Collage",
      keyArtwork: {
        title: "The Dance",
        year: "1910",
        description: "단순한 형태와 순수한 색채로 춤의 환희를 표현. 원시적 에너지를 세련된 조형언어로 번역.",
        personalityResonance: "LAEC의 정제된 감성과 우아한 표현력이 마티스의 세련된 단순함과 만난다."
      },
      alternativeWorks: [
        {
          title: "Blue Nude",
          year: "1952",
          description: "컷아웃 기법으로 만든 추상적 인체. 최소한의 요소로 최대한의 아름다움을 구현.",
          personalityResonance: "불필요한 것을 제거하고 본질만 남기는 LAEC의 큐레이터 정신과 완벽 일치"
        }
      ],
      personalityAlignment: "복잡한 것을 단순하고 아름답게 정제하는 마티스의 미학이 LAEC의 감성 큐레이션 능력과 공명"
    },
    matchingRationale: "혼자만의 공간에서 추상적 아름다움을 체계적으로 분석하고 정제된 감정으로 승화시키고 싶어하는 LAEC에게, 구조와 감성이 완벽하게 균형을 이룬 거장들의 작품이 최고의 영감을 제공한다."
  },

  /**
   * LAMF (올빼미) - 직관적 탐구자
   * 특성: 혼자서 추상적 의미를 자유롭게 탐구
   * 키워드: 철학적 직관, 상징의 해석, 깊은 성찰, 신비로운 지혜
   */
  LAMF: {
    primary: {
      name: "Vincent van Gogh",
      period: "1853-1890",
      style: "Post-Impressionism",
      keyArtwork: {
        title: "The Starry Night",
        year: "1889",
        description: "밤하늘의 소용돌이치는 별들과 사이프러스 나무. 우주의 신비와 인간 영혼의 갈망을 표현.",
        personalityResonance: "LAMF의 우주적 사고와 깊은 철학적 성찰이 반 고흐의 영적 탐구와 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "Wheatfield with Crows",
          year: "1890",
          description: "어두운 하늘 아래 까마귀들이 날아가는 밀밭. 삶과 죽음의 경계에서 느끼는 실존적 깨달음.",
          personalityResonance: "인생의 깊은 의미를 자연을 통해 직관적으로 탐구하는 LAMF의 본성과 일치"
        }
      ],
      personalityAlignment: "예술을 통해 인생과 우주의 근본적 의미를 탐구하려는 반 고흐의 열정이 LAMF의 철학적 탐구심과 완벽 매치"
    },
    secondary: {
      name: "Gustav Klimt",
      period: "1862-1918",
      style: "Art Nouveau/Symbolism",
      keyArtwork: {
        title: "The Tree of Life",
        year: "1905-1909",
        description: "생명의 나무를 황금으로 장식한 상징적 작품. 삶, 죽음, 재생의 영원한 순환을 표현.",
        personalityResonance: "LAMF의 생명과 존재에 대한 깊은 성찰이 클림트의 상징적 철학과 만난다."
      },
      alternativeWorks: [
        {
          title: "The Kiss",
          year: "1907-1908",
          description: "황금빛 로브에 싸인 연인들. 사랑을 통한 영적 합일과 초월의 순간을 포착.",
          personalityResonance: "사랑과 미의 본질적 의미를 탐구하는 LAMF의 직관적 이해력과 공명"
        }
      ],
      personalityAlignment: "장식적 아름다움 너머의 깊은 상징적 의미를 탐구하는 클림트의 철학이 LAMF의 의미 추구와 일치"
    },
    tertiary: {
      name: "Michelangelo",
      period: "1475-1564",
      style: "Renaissance",
      keyArtwork: {
        title: "The Creation of Adam",
        year: "1512",
        description: "시스티나 성당의 천장화 중 신이 아담에게 생명을 불어넣는 순간. 창조와 신성의 본질을 탐구.",
        personalityResonance: "LAMF의 창조와 존재에 대한 근본적 질문이 미켈란젤로의 종교철학적 탐구와 만난다."
      },
      alternativeWorks: [
        {
          title: "Pietà",
          year: "1498-1499",
          description: "성모 마리아가 죽은 예수를 품고 있는 조각상. 사랑과 고통, 희생의 깊은 의미를 탐구.",
          personalityResonance: "인간 조건의 깊은 의미를 예술로 승화시키는 LAMF의 철학적 성향과 공명"
        }
      ],
      personalityAlignment: "예술을 통해 신성과 인간성의 본질을 탐구하려는 미켈란젤로의 철학적 접근이 LAMF와 완벽 일치"
    },
    matchingRationale: "밤의 고요함 속에서 추상적 상징들을 통해 존재와 우주의 깊은 의미를 직관적으로 탐구하고 싶어하는 LAMF에게, 예술을 철학적 탐구의 도구로 사용한 거장들이 최고의 영적 동반자가 된다."
  },

  /**
   * LAMC (거북이) - 철학적 수집가
   * 특성: 혼자서 추상적 의미를 체계적으로 탐구
   * 키워드: 지식의 축적, 체계적 분석, 역사적 맥락, 깊은 학문적 탐구
   */
  LAMC: {
    primary: {
      name: "Leonardo da Vinci",
      period: "1452-1519",
      style: "Renaissance",
      keyArtwork: {
        title: "Mona Lisa",
        year: "1503-1519",
        description: "신비로운 미소의 초상화. 과학적 관찰과 예술적 직관이 결합된 르네상스 이상의 구현.",
        personalityResonance: "LAMC의 체계적 탐구심과 깊은 지적 호기심이 레오나르도의 다학제적 천재성과 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "Vitruvian Man",
          year: "1490",
          description: "인간 비례의 이상을 기하학적으로 분석한 드로잉. 예술과 과학의 완벽한 결합.",
          personalityResonance: "지식을 체계화하고 패턴을 발견하려는 LAMC의 학자적 본성과 일치"
        }
      ],
      personalityAlignment: "예술, 과학, 철학을 통합적으로 탐구하는 레오나르도의 르네상스적 정신이 LAMC의 포괄적 지식 추구와 일치"
    },
    secondary: {
      name: "Piet Mondrian",
      period: "1872-1944",
      style: "De Stijl/Neo-Plasticism",
      keyArtwork: {
        title: "Composition with Red, Blue and Yellow",
        year: "1930",
        description: "직선과 원색만으로 구성된 순수 추상. 우주의 근본 원리를 기하학적으로 탐구.",
        personalityResonance: "LAMC의 본질 추구와 체계적 사고가 몬드리안의 순수주의 철학과 만난다."
      },
      alternativeWorks: [
        {
          title: "Broadway Boogie Woogie",
          year: "1942-1943",
          description: "뉴욕의 리듬을 기하학적 패턴으로 번역. 현대 도시의 역동성을 추상 언어로 체계화.",
          personalityResonance: "복잡한 현실을 단순한 원리로 환원하려는 LAMC의 분석적 사고와 공명"
        }
      ],
      personalityAlignment: "예술을 통해 우주의 근본 법칙을 탐구하려는 몬드리안의 철학적 체계성이 LAMC의 학문적 접근과 일치"
    },
    tertiary: {
      name: "Johannes Vermeer",
      period: "1632-1675",
      style: "Dutch Baroque",
      keyArtwork: {
        title: "Girl with a Pearl Earring",
        year: "1665",
        description: "신비로운 시선의 소녀. 빛과 색채의 과학적 연구가 시적 아름다움으로 승화.",
        personalityResonance: "LAMC의 세밀한 관찰력과 완벽주의가 베르메르의 정밀한 기법과 만난다."
      },
      alternativeWorks: [
        {
          title: "The Art of Painting",
          year: "1666-1668",
          description: "화가가 그림을 그리는 알레고리. 예술 창작의 본질에 대한 메타적 성찰.",
          personalityResonance: "예술의 본질을 체계적으로 탐구하려는 LAMC의 철학적 관심과 공명"
        }
      ],
      personalityAlignment: "완벽한 기법을 통해 일상의 깊은 의미를 탐구하는 베르메르의 접근이 LAMC의 깊이 있는 분석과 일치"
    },
    matchingRationale: "고요한 서재에서 예술사와 철학서를 통해 작품의 깊은 의미와 역사적 맥락을 체계적으로 탐구하고 싶어하는 LAMC에게, 지식과 예술을 통합한 거장들의 작품이 최고의 학문적 동반자가 된다."
  },

  /**
   * LREF (카멜레온) - 고독한 관찰자  
   * 특성: 혼자서 구상적 감정을 자유롭게 탐구
   * 키워드: 미묘한 감정, 자연스러운 적응, 순간의 포착, 섬세한 관찰
   */
  LREF: {
    primary: {
      name: "Claude Monet",
      period: "1840-1926",
      style: "Impressionism", 
      keyArtwork: {
        title: "Water Lilies",
        year: "1915-1926",
        description: "지베르니 정원의 수련 연작. 빛과 색채의 변화를 통해 시간의 흐름과 자연의 순환을 포착.",
        personalityResonance: "LREF의 미묘한 변화 감지 능력과 자연과의 교감이 모네의 빛의 순간 포착과 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "Impression, Sunrise",
          year: "1872",
          description: "안개 낀 항구의 일출. 순간의 인상을 자유로운 붓터치로 포착한 인상주의의 출발점.",
          personalityResonance: "순간의 감정과 분위기를 자연스럽게 흡수하는 LREF의 특성과 일치"
        }
      ],
      personalityAlignment: "자연의 미묘한 변화를 민감하게 포착하고 감정적으로 반응하는 모네의 접근이 LREF의 적응적 관찰과 완벽 매치"
    },
    secondary: {
      name: "John Singer Sargent",
      period: "1856-1925",
      style: "Realism/Impressionism",
      keyArtwork: {
        title: "Madame X",
        year: "1884",
        description: "우아한 여성의 초상. 순간의 자세와 표정을 통해 인물의 내면을 섬세하게 포착.",
        personalityResonance: "LREF의 인간 관찰력과 미묘한 감정 읽기가 사전트의 심리적 초상화법과 만난다."
      },
      alternativeWorks: [
        {
          title: "Carnation, Lily, Lily, Rose",
          year: "1885-1886", 
          description: "정원에서 등불을 켜는 소녀들. 황혼의 미묘한 빛을 포착한 서정적 순간.",
          personalityResonance: "일상의 아름다운 순간을 자연스럽게 포착하는 LREF의 관찰력과 공명"
        }
      ],
      personalityAlignment: "인물의 내면과 분위기를 자연스럽게 포착하는 사전트의 기법이 LREF의 적응적 감수성과 일치"
    },
    tertiary: {
      name: "Pierre-Auguste Renoir",
      period: "1841-1919",
      style: "Impressionism",
      keyArtwork: {
        title: "Luncheon of the Boating Party",
        year: "1880-1881",
        description: "보트 파티의 여유로운 점심 시간. 자연스러운 인간관계와 빛의 조화를 포착.",
        personalityResonance: "LREF의 사회적 상황 적응력과 자연스러운 감정 표현이 르누아르의 따뜻한 인간성과 만난다."
      },
      alternativeWorks: [
        {
          title: "Dance at Moulin de la Galette",
          year: "1876",
          description: "파리 몽마르트르의 야외 무도회. 햇빛이 나뭇잎 사이로 스며드는 자연스러운 순간.",
          personalityResonance: "사회적 분위기에 자연스럽게 녹아드는 LREF의 카멜레온 같은 특성과 공명"
        }
      ],
      personalityAlignment: "인간의 따뜻함과 자연의 아름다움을 자연스럽게 결합하는 르누아르의 감성이 LREF의 조화로운 적응과 일치"
    },
    matchingRationale: "조용한 자연 속에서 빛과 색채의 미묘한 변화를 감지하며 순간의 감정에 자연스럽게 동화되고 싶어하는 LREF에게, 자연과 인간의 아름다운 순간들을 포착한 인상주의 거장들이 완벽한 공명을 제공한다."
  },

  /**
   * LREC (고슴도치) - 섬세한 감정가
   * 특성: 혼자서 구상적 감정을 체계적으로 탐구
   * 키워드: 보호된 감정, 세밀한 분석, 안전한 거리, 절제된 표현
   */
  LREC: {
    primary: {
      name: "Rembrandt van Rijn",
      period: "1606-1669",
      style: "Dutch Baroque",
      keyArtwork: {
        title: "Self-Portrait with Two Circles",
        year: "1665-1669",
        description: "노년의 자화상. 깊은 성찰과 인생의 무게가 담긴 시선으로 자신을 응시.",
        personalityResonance: "LREC의 내면 깊숙한 감정 탐구와 신중한 자기 성찰이 렘브란트의 깊이 있는 자화상과 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "The Return of the Prodigal Son", 
          year: "1669",
          description: "탕자의 귀향을 그린 종교화. 용서와 사랑의 깊은 감정을 절제된 표현으로 형상화.",
          personalityResonance: "복잡한 감정을 신중하게 분석하고 절제되게 표현하는 LREC의 특성과 일치"
        }
      ],
      personalityAlignment: "인간 감정의 깊이를 세밀하게 관찰하고 절제된 방식으로 표현하는 렘브란트의 접근이 LREC의 신중한 감정 탐구와 일치"
    },
    secondary: {
      name: "Edgar Degas",
      period: "1834-1917",
      style: "Impressionism/Realism",
      keyArtwork: {
        title: "The Ballet Class",
        year: "1874",
        description: "발레 교실의 연습 장면. 인물들의 자연스러운 동작과 감정을 섬세하게 관찰하여 포착.",
        personalityResonance: "LREC의 안전한 거리에서의 세밀한 관찰과 인간 행동의 미묘한 분석이 드가의 관찰자적 시선과 만난다."
      },
      alternativeWorks: [
        {
          title: "Woman Combing Her Hair",
          year: "1885",
          description: "사적인 순간의 여성. 은밀하고 자연스러운 일상의 아름다움을 포착.",
          personalityResonance: "타인의 사적 감정을 존중하며 관찰하는 LREC의 세심한 배려와 공명"
        }
      ],
      personalityAlignment: "적절한 거리를 유지하며 인간의 자연스러운 모습을 세밀하게 관찰하는 드가의 방식이 LREC의 신중한 접근과 일치"
    },
    tertiary: {
      name: "Jean-Baptiste-Siméon Chardin",
      period: "1699-1779",
      style: "Rococo/Still Life",
      keyArtwork: {
        title: "The Ray",
        year: "1728",
        description: "부엌의 정물화. 일상적 사물들을 통해 고요한 아름다움과 깊은 성찰을 표현.",
        personalityResonance: "LREC의 일상 속 깊은 감정 발견과 조용한 아름다움에 대한 감수성이 샤르댕의 정물화와 공명한다."
      },
      alternativeWorks: [
        {
          title: "The House of Cards",
          year: "1737",
          description: "카드를 쌓고 있는 소년. 집중과 신중함, 그리고 덧없음에 대한 성찰.",
          personalityResonance: "신중하고 집중력 있는 태도와 삶의 덧없음에 대한 성찰이 LREC의 성향과 일치"
        }
      ],
      personalityAlignment: "일상의 사소한 것들에서 깊은 의미와 감정을 발견하는 샤르댕의 세밀한 시선이 LREC의 섬세한 감수성과 완벽 매치"
    },
    matchingRationale: "안전한 개인 공간에서 현실의 구체적 이미지들을 통해 감정의 미묘한 층위들을 체계적으로 분석하고 싶어하는 LREC에게, 인간 감정의 깊이를 절제되고 세밀하게 탐구한 거장들이 최고의 동반자가 된다."
  },

  /**
   * LRMF (문어) - 디지털 탐험가
   * 특성: 혼자서 구상적 의미를 자유롭게 탐구  
   * 키워드: 다층적 사고, 현실 분석, 진실 추구, 독립적 탐험
   */
  LRMF: {
    primary: {
      name: "M.C. Escher",
      period: "1898-1972",
      style: "Surrealism/Mathematical Art",
      keyArtwork: {
        title: "Relativity",
        year: "1953",
        description: "서로 다른 중력을 가진 세계들이 공존하는 건축물. 현실의 다층적 가능성을 탐구.",
        personalityResonance: "LRMF의 다차원적 사고와 현실에 대한 독창적 분석이 에셔의 수학적 상상력과 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "Drawing Hands",
          year: "1948",
          description: "서로를 그리고 있는 두 손. 현실과 환상의 경계에 대한 철학적 질문.",
          personalityResonance: "현실의 본질을 다각도로 분석하려는 LRMF의 탐구 정신과 일치"
        }
      ],
      personalityAlignment: "논리와 상상력을 결합하여 현실의 숨겨진 차원을 탐구하는 에셔의 접근이 LRMF의 독립적 사고와 완벽 매치"
    },
    secondary: {
      name: "Giuseppe Arcimboldo",
      period: "1526-1593", 
      style: "Mannerism",
      keyArtwork: {
        title: "Vertumnus",
        year: "1590",
        description: "과일과 채소로 구성된 루돌프 2세의 초상. 현실의 요소들을 재조합한 창의적 분석.",
        personalityResonance: "LRMF의 현실 해체 및 재구성 능력과 창의적 연결 사고가 아르침볼도의 조합 예술과 만난다."
      },
      alternativeWorks: [
        {
          title: "The Librarian",
          year: "1566",
          description: "책들로 구성된 도서관장의 초상. 지식과 정체성의 관계에 대한 유머러스한 탐구.",
          personalityResonance: "지식의 다층적 조합과 정보의 창의적 재해석이 LRMF의 디지털 네이티브 성향과 공명"
        }
      ],
      personalityAlignment: "현실의 요소들을 분해하고 재조합하여 새로운 의미를 창출하는 아르침볼도의 방식이 LRMF의 탐험적 사고와 일치"
    },
    tertiary: {
      name: "Giorgio de Chirico",
      period: "1888-1978",
      style: "Metaphysical Art",
      keyArtwork: {
        title: "The Enigma of an Autumn Afternoon",
        year: "1910",
        description: "텅 빈 광장과 신비로운 조각상. 현실 너머의 숨겨진 의미를 암시하는 초현실적 풍경.",
        personalityResonance: "LRMF의 현실 이면 탐구와 숨겨진 진실 추구가 키리코의 형이상학적 탐험과 만난다."
      },
      alternativeWorks: [
        {
          title: "The Song of Love",
          year: "1914",
          description: "고전 조각과 현대 사물이 어우러진 초현실적 공간. 시간과 맥락의 경계를 해체.",
          personalityResonance: "서로 다른 맥락의 요소들을 자유롭게 연결하는 LRMF의 네트워킹 사고와 공명"
        }
      ],
      personalityAlignment: "현실의 표면 아래 숨겨진 의미들을 독립적으로 탐구하는 키리코의 철학이 LRMF의 진실 추구와 일치"
    },
    matchingRationale: "혼자만의 공간에서 디지털과 현실을 넘나들며 정보의 다층적 연결과 숨겨진 패턴을 자유롭게 탐구하고 싶어하는 LRMF에게, 현실을 창의적으로 분석하고 재구성한 거장들이 최고의 영감을 제공한다."
  },

  /**
   * LRMC (비버) - 학구적 연구자
   * 특성: 혼자서 구상적 의미를 체계적으로 탐구
   * 키워드: 체계적 구축, 논리적 분석, 지식 건축, 완벽한 구조  
   */
  LRMC: {
    primary: {
      name: "Albrecht Dürer",
      period: "1471-1528",
      style: "Northern Renaissance", 
      keyArtwork: {
        title: "Melencolia I",
        year: "1514",
        description: "우울증에 빠진 천사와 기하학적 도구들. 예술, 수학, 철학의 관계에 대한 깊은 성찰.",
        personalityResonance: "LRMC의 학문적 완벽주의와 체계적 지식 추구가 뒤러의 정밀한 상징주의와 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "Young Hare",
          year: "1502",
          description: "토끼의 정밀한 수채화. 자연에 대한 과학적 관찰과 예술적 표현의 완벽한 결합.",
          personalityResonance: "세밀한 관찰과 체계적 기록을 통한 지식 구축이 LRMC의 연구자 정신과 일치"
        }
      ],
      personalityAlignment: "예술과 학문을 체계적으로 결합하여 완벽한 작품을 구축하려는 뒤러의 접근이 LRMC의 건축가적 사고와 완벽 매치"
    },
    secondary: {
      name: "Jan van Eyck",
      period: "1390-1441",
      style: "Early Netherlandish",
      keyArtwork: {
        title: "The Arnolfini Portrait",
        year: "1434",
        description: "부부의 초상화에 담긴 수많은 상징들. 종교적, 사회적 의미를 세밀하게 구조화.",
        personalityResonance: "LRMC의 디테일에 대한 완벽주의와 의미의 층층 구조 분석이 반 에이크의 상징적 정밀함과 만난다."
      },
      alternativeWorks: [
        {
          title: "The Ghent Altarpiece",
          year: "1432",
          description: "복잡한 종교적 프로그램을 가진 제단화. 신학적 지식을 체계적으로 시각화.",
          personalityResonance: "방대한 지식을 체계적으로 조직하고 구현하는 LRMC의 건축가적 능력과 공명"
        }
      ],
      personalityAlignment: "세밀한 기법과 체계적 상징 체계를 통해 완벽한 의미 구조를 구축하는 반 에이크의 방식이 LRMC의 학문적 완벽주의와 일치"
    },
    tertiary: {
      name: "Giorgio Vasari",
      period: "1511-1574", 
      style: "Mannerism/Art History",
      keyArtwork: {
        title: "The Lives of the Artists",
        year: "1550-1568",
        description: "르네상스 예술가들의 전기 모음집. 예술사를 체계적으로 기록하고 분석한 기념비적 작업.",
        personalityResonance: "LRMC의 지식 아카이브 구축과 체계적 문서화 능력이 바사리의 예술사 연구와 완벽하게 일치한다."
      },
      alternativeWorks: [
        {
          title: "Perseus and Andromeda",
          year: "1570",
          description: "신화적 주제를 매너리즘 양식으로 해석. 고전 지식과 현대적 해석의 체계적 결합.",
          personalityResonance: "전통 지식을 현대적 관점으로 재해석하고 체계화하는 LRMC의 학문적 접근과 공명"
        }
      ],
      personalityAlignment: "예술을 학문적으로 체계화하고 후대에 전승하려는 바사리의 사명감이 LRMC의 지식 건축가 정신과 완벽 일치"
    },
    matchingRationale: "조용한 연구실에서 예술사와 이론서를 통해 작품의 의미와 맥락을 체계적으로 분석하고 완벽한 지식 체계를 구축하고 싶어하는 LRMC에게, 학문과 예술을 정밀하게 결합한 거장들이 최고의 동반자가 된다."
  },

  // ===== S (SOCIAL) 계열 - 공유하는 연결자들 =====

  /**
   * SAEF (나비) - 감성 나눔이
   * 특성: 함께 추상적 감정을 자유롭게 탐구
   * 키워드: 감정 전파, 자유로운 교류, 아름다운 변화, 영감의 확산
   */
  SAEF: {
    primary: {
      name: "Marc Chagall",
      period: "1887-1985",
      style: "Surrealism/Expressionism",
      keyArtwork: {
        title: "The Birthday",
        year: "1915",
        description: "공중을 떠다니는 연인들. 사랑의 환희와 꿈같은 행복감을 시적으로 표현.",
        personalityResonance: "SAEF의 감정 전파력과 꿈같은 상상력이 샤갈의 서정적 초현실주의와 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "I and the Village",
          year: "1911",
          description: "고향에 대한 향수를 환상적으로 표현. 개인적 기억이 보편적 감동으로 확산.",
          personalityResonance: "개인적 감정을 타인과 자연스럽게 공유하는 SAEF의 소통 능력과 일치"
        }
      ],
      personalityAlignment: "사랑과 행복의 감정을 시적이고 자유로운 방식으로 표현하여 모든 이에게 전달하는 샤갈의 방식이 SAEF의 감정 나눔과 완벽 매치"
    },
    secondary: {
      name: "Paul Klee",
      period: "1879-1940",
      style: "Expressionism/Abstract",
      keyArtwork: {
        title: "Senecio",
        year: "1922", 
        description: "기하학적 요소로 구성된 얼굴. 단순한 형태에서 우러나오는 따뜻한 인간성.",
        personalityResonance: "SAEF의 단순하면서도 깊은 감정 전달력과 보편적 소통이 클레의 순수한 표현과 만난다."
      },
      alternativeWorks: [
        {
          title: "Castle and Sun",
          year: "1928",
          description: "아이 같은 순수함으로 그린 성과 태양. 원시적 순수성이 주는 감동.",
          personalityResonance: "순수한 감정을 자유롭게 표현하고 나누는 SAEF의 나비 같은 특성과 공명"
        }
      ],
      personalityAlignment: "복잡한 감정을 단순하고 순수한 언어로 번역하여 모든 이가 공감할 수 있게 만드는 클레의 접근이 SAEF의 감성 나눔과 일치"
    },
    tertiary: {
      name: "Raoul Dufy",
      period: "1877-1953",
      style: "Fauvism",
      keyArtwork: {
        title: "The Regatta",
        year: "1930s",
        description: "밝고 경쾌한 색채로 그린 요트 경주. 삶의 기쁨과 자유로움을 경쾌하게 표현.",
        personalityResonance: "SAEF의 긍정적 에너지와 자유로운 감정 표현이 뒤피의 경쾌한 파브리즘과 완벽하게 일치한다."
      },
      alternativeWorks: [
        {
          title: "The Beach at Sainte-Adresse",
          year: "1904",
          description: "해변의 여유로운 풍경. 일상의 즐거움을 밝고 자유롭게 포착.",
          personalityResonance: "일상의 아름다운 순간들을 타인과 나누고 싶어하는 SAEF의 특성과 공명"
        }
      ],
      personalityAlignment: "삶의 즐거움과 아름다움을 밝고 자유로운 방식으로 표현하여 보는 이를 행복하게 만드는 뒤피의 감성이 SAEF의 감정 전파와 일치"
    },
    matchingRationale: "친구들과 함께하는 갤러리에서 추상적 아름다움에 대한 감정을 자유롭게 나누고 서로의 감상을 통해 영감을 확산시키고 싶어하는 SAEF에게, 순수한 감정과 꿈을 시적으로 표현한 거장들이 최고의 소통 파트너가 된다."
  },

  /**
   * SAEC (펭귄) - 예술 네트워커  
   * 특성: 함께 추상적 감정을 체계적으로 탐구
   * 키워드: 감정의 체계화, 그룹 하모니, 조직적 미감, 집단 창의성
   */
  SAEC: {
    primary: {
      name: "Wassily Kandinsky",
      period: "1866-1944",
      style: "Abstract Expressionism",
      keyArtwork: {
        title: "Composition IV",
        year: "1911",
        description: "음악적 구조를 가진 추상화. 감정을 색채와 형태의 체계적 조화로 표현.",
        personalityResonance: "SAEC의 감정 체계화와 그룹 내 조화 추구가 칸딘스키의 체계적 추상 이론과 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "Blue Rider",
          year: "1903",
          description: "청기사파 운동의 상징작. 개인의 영감이 집단의 예술 운동으로 발전.",
          personalityResonance: "개인의 감정을 집단의 예술 활동으로 발전시키는 SAEC의 네트워킹 능력과 일치"
        }
      ],
      personalityAlignment: "예술의 정신적 가치를 이론화하고 동료들과 공유하여 새로운 예술 운동을 만든 칸딘스키의 접근이 SAEC의 조직력과 완벽 매치"
    },
    secondary: {
      name: "Paul Cézanne",
      period: "1839-1906", 
      style: "Post-Impressionism",
      keyArtwork: {
        title: "The Card Players",
        year: "1890-1895",
        description: "카드놀이하는 농부들. 인간관계의 조화와 구조적 아름다움을 동시에 표현.",
        personalityResonance: "SAEC의 사회적 조화와 구조적 미감이 세잔의 인물 구성과 기하학적 질서와 만난다."
      },
      alternativeWorks: [
        {
          title: "The Large Bathers",
          year: "1895-1906",
          description: "집단 목욕 장면을 고전적 조화로 구성. 개인들이 전체의 조화를 이루는 이상적 구조.",
          personalityResonance: "개인들을 조화로운 전체로 조직하는 SAEC의 그룹 리더십과 공명"
        }
      ],
      personalityAlignment: "개별 요소들을 체계적으로 조직하여 완벽한 전체 구조를 만드는 세잔의 방식이 SAEC의 조직적 미감과 일치"
    },
    tertiary: {
      name: "Georges Seurat",
      period: "1859-1891",
      style: "Neo-Impressionism/Pointillism", 
      keyArtwork: {
        title: "A Sunday on La Grande Jatte",
        year: "1884-1886",
        description: "점묘법으로 그린 공원의 일요일 풍경. 개별 점들이 모여 완벽한 전체를 구성.",
        personalityResonance: "SAEC의 체계적 조직력과 개별 구성원들의 조화 추구가 쇠라의 점묘법 이론과 완벽하게 일치한다."
      },
      alternativeWorks: [
        {
          title: "Bathers at Asnières",
          year: "1884",
          description: "강변에서 휴식하는 사람들. 개인의 자유와 전체의 조화가 균형을 이룬 이상적 사회.",
          personalityResonance: "개인의 개성을 존중하면서도 전체 조화를 만드는 SAEC의 리더십과 공명"
        }
      ],
      personalityAlignment: "과학적 방법론을 통해 개별 요소들을 체계적으로 조직하여 아름다운 전체를 만드는 쇠라의 접근이 SAEC의 체계적 네트워킹과 일치"
    },
    matchingRationale: "아트 모임에서 구성원들의 다양한 감정과 해석을 체계적으로 정리하고 조화롭게 통합하여 집단의 창의적 시너지를 만들어내고 싶어하는 SAEC에게, 이론과 실제를 결합한 체계적 예술가들이 최고의 멘토가 된다."
  },

  /**
   * SAMF (앵무새) - 영감 전도사
   * 특성: 함께 추상적 의미를 자유롭게 탐구  
   * 키워드: 아이디어 전파, 다성대 대화, 상징의 통역, 집단 영감
   */
  SAMF: {
    primary: {
      name: "Pablo Picasso",
      period: "1881-1973",
      style: "Cubism/Multiple Periods",
      keyArtwork: {
        title: "Les Demoiselles d'Avignon", 
        year: "1907",
        description: "입체주의의 출발점. 전통적 미술 관념을 해체하고 새로운 시각 언어를 제시.",
        personalityResonance: "SAMF의 혁신적 아이디어 전파와 새로운 관점 제시가 피카소의 예술 혁명과 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "Guernica",
          year: "1937",
          description: "전쟁의 참혹함을 추상적 언어로 고발. 정치적 메시지를 예술로 승화.",
          personalityResonance: "중요한 메시지를 예술적 언어로 번역하여 전달하는 SAMF의 통역사 역할과 일치"
        }
      ],
      personalityAlignment: "끊임없이 새로운 양식을 실험하며 예술의 가능성을 확장하고 동시대인들에게 영감을 준 피카소의 접근이 SAMF의 영감 전도와 완벽 매치"
    },
    secondary: {
      name: "Salvador Dalí",
      period: "1904-1989", 
      style: "Surrealism",
      keyArtwork: {
        title: "The Persistence of Memory",
        year: "1931",
        description: "녹아내리는 시계들. 시간과 현실에 대한 새로운 관점을 상징적으로 제시.",
        personalityResonance: "SAMF의 상징 해석과 복잡한 아이디어의 시각적 번역이 달리의 초현실주의적 상징과 만난다."
      },
      alternativeWorks: [
        {
          title: "Dream Caused by the Flight of a Bee Around a Pomegranate a Second Before Awakening",
          year: "1944", 
          description: "꿈과 현실의 경계를 탐구. 무의식의 메시지를 시각적으로 번역.",
          personalityResonance: "복잡한 심리적 내용을 명료한 이미지로 전달하는 SAMF의 소통 능력과 공명"
        }
      ],
      personalityAlignment: "무의식과 꿈의 세계를 예술적 언어로 번역하여 대중에게 새로운 인식을 전달하는 달리의 방식이 SAMF의 상징 통역과 일치"
    },
    tertiary: {
      name: "Andy Warhol", 
      period: "1928-1987",
      style: "Pop Art",
      keyArtwork: {
        title: "Campbell's Soup Cans",
        year: "1962",
        description: "일상적 상품을 예술로 승격. 대중문화와 순수예술의 경계에 대한 질문.",
        personalityResonance: "SAMF의 대중과의 소통과 문화적 메시지 전달이 워홀의 팝아트 철학과 완벽하게 일치한다."
      },
      alternativeWorks: [
        {
          title: "Marilyn Diptych",
          year: "1962",
          description: "마릴린 먼로의 반복된 이미지. 대중문화 아이콘의 의미를 탐구.",
          personalityResonance: "문화적 상징들을 재해석하고 새로운 의미로 전파하는 SAMF의 역할과 공명"
        }
      ],
      personalityAlignment: "대중문화의 상징들을 예술로 번역하고 새로운 의미를 부여하여 사회와 소통하는 워홀의 접근이 SAMF의 영감 전도와 일치"
    },
    matchingRationale: "다양한 사람들과 함께 모여 추상적 아이디어와 상징들을 자유롭게 해석하고 새로운 관점들을 서로 나누며 집단 지성을 형성하고 싶어하는 SAMF에게, 예술을 통해 시대와 소통한 혁신가들이 최고의 영감을 제공한다."
  },

  /**
   * SAMC (사슴) - 문화 기획자
   * 특성: 함께 추상적 의미를 체계적으로 탐구
   * 키워드: 문화 아카이빙, 집단 기억, 전통과 혁신, 사회적 의미
   */
  SAMC: {
    primary: {
      name: "Diego Rivera",
      period: "1886-1957", 
      style: "Muralism",
      keyArtwork: {
        title: "Man, Controller of the Universe",
        year: "1934",
        description: "록펠러 센터 벽화의 재제작. 인류의 진보와 사회적 이상을 체계적으로 형상화.",
        personalityResonance: "SAMC의 사회적 의미 구축과 집단 기억 아카이빙이 리베라의 벽화 프로그램과 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "Dream of a Sunday Afternoon in Alameda Park",
          year: "1947-1948",
          description: "멕시코 역사의 인물들이 한자리에 모인 환상. 역사적 기억을 통합적으로 재구성.",
          personalityResonance: "역사와 문화를 체계적으로 정리하고 집단 기억으로 승화하는 SAMC의 기획력과 일치"
        }
      ],
      personalityAlignment: "개인의 예술적 비전을 사회적 프로젝트로 확장하여 집단의 문화적 정체성을 구축하는 리베라의 접근이 SAMC의 문화 기획과 완벽 매치"
    },
    secondary: {
      name: "Raphael",
      period: "1483-1520",
      style: "High Renaissance", 
      keyArtwork: {
        title: "The School of Athens",
        year: "1509-1511",
        description: "바티칸 서명의 방 프레스코. 고대 철학자들을 체계적으로 배치한 지식의 성전.",
        personalityResonance: "SAMC의 지식 체계화와 문화적 전통 계승이 라파엘로의 종합적 프로그램과 만난다."
      },
      alternativeWorks: [
        {
          title: "The Sistine Madonna", 
          year: "1512",
          description: "성모자와 성인들의 완벽한 조화. 종교적 이상을 예술적 완성으로 승화.",
          personalityResonance: "이상적 가치를 체계적으로 구현하고 사회와 공유하는 SAMC의 문화 사명과 공명"
        }
      ],
      personalityAlignment: "인문학적 지식을 체계적으로 종합하여 시대의 문화적 이상을 구현하는 라파엘로의 방식이 SAMC의 문화 아키텍팅과 일치"
    },
    tertiary: {
      name: "Gustav Klimt",
      period: "1862-1918",
      style: "Art Nouveau/Symbolism",
      keyArtwork: {
        title: "The Beethoven Frieze",
        year: "1902",
        description: "베토벤의 9번 교향곡을 시각화한 연작. 음악과 미술의 종합예술을 추구.",
        personalityResonance: "SAMC의 문화 간 융합과 종합적 기획이 클림트의 총체예술 추구와 완벽하게 일치한다."
      },
      alternativeWorks: [
        {
          title: "University of Vienna Ceiling Paintings",
          year: "1900-1907",
          description: "철학, 의학, 법학을 상징하는 천장화. 학문과 예술의 통합적 비전.",
          personalityResonance: "다양한 지식 영역을 예술로 통합하는 SAMC의 학제 간 기획력과 공명"
        }
      ],
      personalityAlignment: "예술을 통해 문화의 다양한 영역을 통합하고 새로운 문화적 가치를 창조하려는 클림트의 비전이 SAMC의 문화 기획과 일치"
    },
    matchingRationale: "문화 기관에서 동료들과 함께 추상적 개념들을 체계적으로 연구하고 사회적 의미로 발전시켜 집단의 문화적 자산으로 구축하고 싶어하는 SAMC에게, 문화 통합과 사회적 비전을 실현한 거장들이 최고의 멘토가 된다."
  },

  /**
   * SREF (강아지) - 열정적 관람자
   * 특성: 함께 구상적 감정을 자유롭게 탐구
   * 키워드: 순수한 감동, 즉각적 공감, 따뜻한 연결, 자연스러운 소통
   */
  SREF: {
    primary: {
      name: "Pierre-Auguste Renoir",
      period: "1841-1919",
      style: "Impressionism",
      keyArtwork: {
        title: "Dance at Moulin de la Galette", 
        year: "1876",
        description: "몽마르트르 야외 무도회의 즐거운 분위기. 사람들의 자연스러운 기쁨과 교감을 포착.",
        personalityResonance: "SREF의 순수한 즐거움과 자연스러운 인간관계 형성이 르누아르의 따뜻한 인간애와 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "Two Sisters (On the Terrace)",
          year: "1881",
          description: "테라스의 두 여성. 자연스러운 친밀감과 일상의 아름다움을 따뜻하게 표현.",
          personalityResonance: "일상의 소중한 관계들을 자연스럽게 소중히 여기는 SREF의 따뜻함과 일치"
        }
      ],
      personalityAlignment: "인간의 기본적인 기쁨과 사랑을 자연스럽고 따뜻하게 표현하여 모든 이가 공감할 수 있게 만드는 르누아르의 감성이 SREF의 순수함과 완벽 매치"
    },
    secondary: {
      name: "John Singer Sargent",
      period: "1856-1925",
      style: "Realism",
      keyArtwork: {
        title: "The Daughters of Edward Darley Boit",
        year: "1882",
        description: "네 자매의 자연스러운 순간. 아이들의 순수함과 가족의 따뜻함을 생생하게 포착.",
        personalityResonance: "SREF의 즉각적 감정 반응과 순수한 마음이 사전트의 생생한 인물 표현과 만난다."
      },
      alternativeWorks: [
        {
          title: "Carnation, Lily, Lily, Rose",
          year: "1885-1886",
          description: "정원에서 등불을 켜는 아이들. 일상의 마법 같은 순간을 생생하게 재현.",
          personalityResonance: "일상 속 아름다운 순간들에 대한 즉각적 감동이 SREF의 감수성과 공명"
        }
      ],
      personalityAlignment: "인간의 자연스러운 모습과 순간의 감동을 생생하게 포착하는 사전트의 직관력이 SREF의 열정적 반응과 일치"
    },
    tertiary: {
      name: "Mary Cassatt",
      period: "1844-1926",
      style: "Impressionism",
      keyArtwork: {
        title: "The Child's Bath",
        year: "1893",
        description: "아이를 씻기는 어머니. 일상의 돌봄 속에서 발견되는 깊은 사랑을 표현.",
        personalityResonance: "SREF의 순수한 애정과 돌봄의 마음이 카사트의 모성적 따뜻함과 완벽하게 일치한다."
      },
      alternativeWorks: [
        {
          title: "Little Girl in a Blue Armchair",
          year: "1878",
          description: "의자에 앉은 소녀의 자연스러운 모습. 아이의 순수함을 따뜻하게 포착.",
          personalityResonance: "순수함과 자연스러움을 소중히 여기는 SREF의 마음과 공명"
        }
      ],
      personalityAlignment: "인간의 가장 순수하고 자연스러운 감정들을 따뜻하게 표현하는 카사트의 접근이 SREF의 열정적 공감과 일치"
    },
    matchingRationale: "친구들과 함께 갤러리를 돌아다니며 따뜻하고 아름다운 인간 관계를 그린 작품들 앞에서 즉각적으로 감동받고 그 기쁨을 자연스럽게 나누고 싶어하는 SREF에게, 인간의 순수한 감정을 따뜻하게 그린 거장들이 최고의 동반자가 된다."
  },

  /**
   * SREC (오리) - 따뜻한 안내자
   * 특성: 함께 구상적 감정을 체계적으로 탐구
   * 키워드: 안전한 환경, 체계적 돌봄, 감정의 안정화, 포용적 분위기
   */
  SREC: {
    primary: {
      name: "Johannes Vermeer",
      period: "1632-1675", 
      style: "Dutch Baroque",
      keyArtwork: {
        title: "The Milkmaid",
        year: "1658-1661",
        description: "우유를 따르는 하녀의 일상. 평범한 노동에서 발견되는 존엄과 아름다움.",
        personalityResonance: "SREC의 일상적 돌봄의 가치 인식과 안정적 환경 조성이 베르메르의 정적 아름다움과 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "Woman Holding a Balance",
          year: "1664",
          description: "저울을 든 여인. 균형과 조화, 그리고 깊은 성찰이 담긴 고요한 순간.",
          personalityResonance: "균형잡힌 감정 상태와 안정적 분위기 조성을 추구하는 SREC의 특성과 일치"
        }
      ],
      personalityAlignment: "일상의 고요한 순간들 속에서 깊은 감정적 안정과 아름다움을 발견하는 베르메르의 시선이 SREC의 따뜻한 돌봄과 완벽 매치"
    },
    secondary: {
      name: "Jean-Baptiste-Siméon Chardin",
      period: "1699-1779",
      style: "Rococo",
      keyArtwork: {
        title: "The Governess",
        year: "1739",
        description: "가정교사가 아이를 가르치는 장면. 교육과 돌봄의 체계적이고 따뜻한 결합.",
        personalityResonance: "SREC의 체계적 돌봄과 교육적 안내가 샤르댕의 가정적 따뜻함과 만난다."
      },
      alternativeWorks: [
        {
          title: "Grace Before a Meal",
          year: "1740",
          description: "식사 전 기도하는 가족. 일상적 의례 속에서 발견되는 평화로운 안정감.",
          personalityResonance: "안정적 환경에서의 체계적 일상과 따뜻한 가족애가 SREC의 돌봄 정신과 공명"
        }
      ],
      personalityAlignment: "일상의 소중한 순간들을 체계적으로 관찰하고 따뜻하게 표현하는 샤르댕의 접근이 SREC의 안정적 돌봄과 일치"
    },
    tertiary: {
      name: "Berthe Morisot",
      period: "1841-1895",
      style: "Impressionism",
      keyArtwork: {
        title: "The Cradle",
        year: "1872",
        description: "요람 옆의 어머니. 모성의 따뜻함과 보호 본능을 섬세하게 표현.",
        personalityResonance: "SREC의 보호하고 돌보려는 본능과 체계적 케어가 모리조의 모성적 따뜻함과 완벽하게 일치한다."
      },
      alternativeWorks: [
        {
          title: "Young Woman Knitting",
          year: "1883",
          description: "뜨개질하는 젊은 여성. 일상의 손작업을 통한 평온함과 생산적 활동.",
          personalityResonance: "일상의 체계적 활동을 통해 안정감을 조성하는 SREC의 특성과 공명"
        }
      ],
      personalityAlignment: "여성의 일상과 모성적 돌봄을 섬세하고 체계적으로 표현하는 모리조의 시각이 SREC의 따뜻한 안내와 일치"
    },
    matchingRationale: "박물관에서 동행자들에게 작품의 감정적 의미를 체계적으로 설명하며 모든 이가 편안하게 감상할 수 있는 안전한 분위기를 조성하고 싶어하는 SREC에게, 일상의 따뜻한 돌봄을 예술로 승화한 거장들이 최고의 멘토가 된다."
  },

  /**
   * SRMF (코끼리) - 지식 멘토
   * 특성: 함께 구상적 의미를 자유롭게 탐구
   * 키워드: 집단 기억, 스토리텔링, 지혜 전수, 역사적 맥락
   */
  SRMF: {
    primary: {
      name: "Peter Paul Rubens",
      period: "1577-1640",
      style: "Baroque", 
      keyArtwork: {
        title: "The Garden of Love",
        year: "1630-1631",
        description: "사랑의 정원에서 벌어지는 축제. 인생의 풍요로움과 기쁨을 장대한 서사로 표현.",
        personalityResonance: "SRMF의 풍부한 경험 전달과 생생한 스토리텔링이 루벤스의 역동적 서사와 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "Marie de' Medici Cycle",
          year: "1625",
          description: "마리 드 메디치의 일생을 그린 연작. 역사를 알레고리적 서사로 재구성.",
          personalityResonance: "역사적 사건을 의미 있는 이야기로 재구성하여 전달하는 SRMF의 스토리텔링 능력과 일치"
        }
      ],
      personalityAlignment: "방대한 지식과 경험을 역동적이고 매력적인 시각적 서사로 전달하는 루벤스의 능력이 SRMF의 지식 멘토 역할과 완벽 매치"
    },
    secondary: {
      name: "Paolo Veronese",
      period: "1528-1588",
      style: "Venetian Renaissance", 
      keyArtwork: {
        title: "The Wedding Feast at Cana",
        year: "1563",
        description: "가나의 혼인 잔치. 성경 이야기를 16세기 베네치아의 화려한 연회로 재해석.",
        personalityResonance: "SRMF의 과거와 현재 연결하기와 문화적 맥락 제공이 베로네세의 시대적 해석과 만난다."
      },
      alternativeWorks: [
        {
          title: "The Family of Darius before Alexander",
          year: "1565-1570",
          description: "알렉산더 대왕 앞의 다리우스 가족. 역사적 교훈을 극적으로 시각화.",
          personalityResonance: "역사적 사건의 교훈적 의미를 생생하게 전달하는 SRMF의 멘토십과 공명"
        }
      ],
      personalityAlignment: "역사와 신화를 현대적 맥락으로 해석하여 교훈과 감동을 전달하는 베로네세의 방식이 SRMF의 지혜 전수와 일치"
    },
    tertiary: {
      name: "Eugène Delacroix",
      period: "1798-1863",
      style: "Romanticism",
      keyArtwork: {
        title: "Liberty Leading the People",
        year: "1830",
        description: "자유의 여신이 시민들을 이끄는 장면. 역사적 이상을 영감적 이미지로 형상화.",
        personalityResonance: "SRMF의 집단 영감 제공과 역사적 가치 전달이 들라크루아의 낭만주의적 이상과 완벽하게 일치한다."
      },
      alternativeWorks: [
        {
          title: "The Death of Sardanapalus",
          year: "1827",
          description: "사르다나팔루스의 죽음. 문학을 시각적 드라마로 번역한 역동적 서사.",
          personalityResonance: "복잡한 이야기를 감동적인 시각적 경험으로 번역하는 SRMF의 스토리텔링과 공명"
        }
      ],
      personalityAlignment: "역사와 문학의 교훈을 감정적으로 전달하여 집단의 영감과 각성을 이끄는 들라크루아의 접근이 SRMF의 멘토 역할과 일치"
    },
    matchingRationale: "박물관 투어에서 동행자들에게 작품 속 역사적 배경과 문화적 맥락을 흥미진진한 이야기로 들려주며 집단의 지적 호기심을 자극하고 싶어하는 SRMF에게, 지식을 감동적인 서사로 전달한 거장들이 최고의 롤모델이 된다."
  },

  /**
   * SRMC (독수리) - 체계적 교육자
   * 특성: 함께 구상적 의미를 체계적으로 탐구
   * 키워드: 객관적 분석, 교육적 체계, 통합적 시각, 학문적 엄정성
   */
  SRMC: {
    primary: {
      name: "Jacques-Louis David",
      period: "1748-1825",
      style: "Neoclassicism",
      keyArtwork: {
        title: "The School of Athens (after Raphael)",
        year: "Various studies",
        description: "라파엘로의 명작을 연구한 드로잉들. 고전 작품의 체계적 분석과 교육적 해석.",
        personalityResonance: "SRMC의 체계적 교육 방법론과 객관적 분석이 다비드의 신고전주의적 질서와 완벽하게 공명한다."
      },
      alternativeWorks: [
        {
          title: "The Death of Socrates",
          year: "1787",
          description: "소크라테스의 죽음. 철학적 이상과 교육적 희생을 장엄하게 형상화.",
          personalityResonance: "교육자의 사명감과 진리 추구의 숭고함이 SRMC의 교육적 이상과 일치"
        }
      ],
      personalityAlignment: "고전적 질서와 도덕적 교훈을 체계적으로 구현하여 사회 교육에 기여하려는 다비드의 사명감이 SRMC의 교육자 정신과 완벽 매치"
    },
    secondary: {
      name: "Nicolas Poussin",
      period: "1594-1665", 
      style: "Baroque/Classicism",
      keyArtwork: {
        title: "Et in Arcadia Ego",
        year: "1638-1640",
        description: "아르카디아의 목동들. 고전적 알레고리를 통한 인생의 교훈을 체계적으로 구성.",
        personalityResonance: "SRMC의 알레고리적 교육법과 체계적 의미 구성이 푸생의 고전주의적 완성도와 만난다."
      },
      alternativeWorks: [
        {
          title: "The Inspiration of the Poet",
          year: "1630",
          description: "시인에게 영감을 주는 아폴로. 예술 창작의 신성한 과정을 체계적으로 시각화.",
          personalityResonance: "창작과 교육의 신성함을 체계적으로 표현하는 SRMC의 교육철학과 공명"
        }
      ],
      personalityAlignment: "고전적 지식을 체계적으로 종합하여 완벽한 조형 언어로 교육하는 푸생의 방식이 SRMC의 학문적 엄정성과 일치"
    },
    tertiary: {
      name: "Annibale Carracci",
      period: "1560-1609",
      style: "Baroque",
      keyArtwork: {
        title: "Farnese Gallery Ceiling",
        year: "1597-1608",
        description: "파르네세 궁 천장화. 고전 신화를 체계적으로 배치한 바로크 교육 프로그램.",
        personalityResonance: "SRMC의 통합적 교육 설계와 체계적 지식 전달이 카라치의 아카데미적 완성도와 완벽하게 일치한다."
      },
      alternativeWorks: [
        {
          title: "The Bean Eater",
          year: "1585",
          description: "콩을 먹는 농부. 현실적 관찰과 고전적 이상의 교육적 결합.",
          personalityResonance: "현실과 이상을 교육적으로 통합하는 SRMC의 균형감과 공명"
        }
      ],
      personalityAlignment: "고전적 전통과 현실적 관찰을 체계적으로 통합하여 교육 체계를 구축한 카라치의 아카데미 정신이 SRMC의 교육자 사명과 일치"
    },
    matchingRationale: "미술사 강의나 전시 기획에서 작품들의 역사적 맥락과 예술사적 의미를 체계적으로 정리하고 객관적으로 분석하여 전문적 지식을 정확하게 전달하고 싶어하는 SRMC에게, 교육과 학문을 예술로 승화한 거장들이 최고의 동반자가 된다."
  }
};

/**
 * 성격 유형별 추천 작가-작품 정보 반환
 */
export function getArtworkMatchingForPersonality(personalityType: string): PersonalityArtistMatching | null {
  return PERSONALITY_ARTIST_MATCHING_2025[personalityType as keyof typeof PERSONALITY_ARTIST_MATCHING_2025] || null;
}

/**
 * 성격 유형별 핵심 키워드 추출
 */
export function getPersonalityArtKeywords(personalityType: string): string[] {
  const matching = getArtworkMatchingForPersonality(personalityType);
  if (!matching) return [];
  
  // 각 작가의 개인성향 정렬 키워드를 추출
  return [
    ...matching.primary.personalityAlignment.split(' ').filter(word => word.length > 2),
    ...matching.secondary.personalityAlignment.split(' ').filter(word => word.length > 2),
    ...matching.tertiary.personalityAlignment.split(' ').filter(word => word.length > 2)
  ].slice(0, 8); // 최대 8개 키워드
}

/**
 * 작가별 대표 작품 정보
 */
export const MASTERPIECE_DATABASE = {
  "Odilon Redon": ["The Cyclops", "The Eye Like a Strange Balloon", "The Buddha"],
  "Edvard Munch": ["The Scream", "The Dance of Life", "Madonna"],
  "Paul Klee": ["Twittering Machine", "Fish Magic", "Senecio"],
  "Paul Cézanne": ["Mont Sainte-Victoire", "The Large Bathers", "The Card Players"],
  "Wassily Kandinsky": ["Composition VII", "Yellow-Red-Blue", "Blue Rider"],
  "Henri Matisse": ["The Dance", "Blue Nude", "Woman with a Hat"],
  "Vincent van Gogh": ["The Starry Night", "Wheatfield with Crows", "Sunflowers"],
  "Gustav Klimt": ["The Tree of Life", "The Kiss", "The Beethoven Frieze"],
  "Michelangelo": ["The Creation of Adam", "Pietà", "David"],
  "Leonardo da Vinci": ["Mona Lisa", "Vitruvian Man", "The Last Supper"],
  "Piet Mondrian": ["Composition with Red, Blue and Yellow", "Broadway Boogie Woogie", "Tree Series"],
  "Johannes Vermeer": ["Girl with a Pearl Earring", "The Art of Painting", "The Milkmaid"],
  "Claude Monet": ["Water Lilies", "Impression, Sunrise", "Rouen Cathedral"],
  "John Singer Sargent": ["Madame X", "The Daughters of Edward Darley Boit", "Carnation, Lily, Lily, Rose"],
  "Pierre-Auguste Renoir": ["Dance at Moulin de la Galette", "Luncheon of the Boating Party", "Two Sisters"],
  "Rembrandt van Rijn": ["Self-Portrait with Two Circles", "The Return of the Prodigal Son", "The Night Watch"],
  "Edgar Degas": ["The Ballet Class", "Woman Combing Her Hair", "The Absinthe Drinker"],
  "Pablo Picasso": ["Les Demoiselles d'Avignon", "Guernica", "The Old Guitarist"],
  "Salvador Dalí": ["The Persistence of Memory", "Dream Caused by the Flight of a Bee", "The Elephants"],
  "Marc Chagall": ["The Birthday", "I and the Village", "The Fiddler"],
  "Diego Rivera": ["Man, Controller of the Universe", "Dream of a Sunday Afternoon in Alameda Park"],
  "Raphael": ["The School of Athens", "The Sistine Madonna", "The Transfiguration"]
};