// SAYU 16x16 성격 유형 시너지 테이블
// 4개 축: L/S(관람 선호도), A/R(인식 스타일), E/M(성찰 유형), F/C(탐색 스타일)

export interface SynergyData {
  compatibilityScore: number; // 0-100
  viewingStyle: { ko: string; en: string };
  conversationChemistry: { ko: string; en: string };
  recommendedActivities: { ko: string; en: string };
}

// 매칭 키 생성 함수 (항상 알파벳 순서로 정렬하여 중복 방지)
export function getSynergyKey(type1: string, type2: string): string {
  return [type1, type2].sort().join('-');
}

// 시너지 점수 계산 로직
// 같은 축: +20점, 보완적 축: +15점, 상반된 축: +10점
function calculateBaseScore(type1: string, type2: string): number {
  let score = 40; // 기본 점수
  
  // L/S 축 - 관람 선호도
  if (type1[0] === type2[0]) score += 20; // 같은 선호도는 편안함
  else score += 15; // 다른 선호도는 새로운 경험
  
  // A/R 축 - 인식 스타일  
  if (type1[1] === type2[1]) score += 15; // 같은 스타일은 공감대
  else score += 20; // 다른 스타일은 시야 확장
  
  // E/M 축 - 성찰 유형
  if (type1[2] === type2[2]) score += 15; // 같은 성찰은 깊은 이해
  else score += 20; // 다른 성찰은 균형잡힌 감상
  
  // F/C 축 - 탐색 스타일
  if (type1[3] === type2[3]) score += 10; // 같은 탐색은 조화
  else score += 15; // 다른 탐색은 적응력 향상
  
  return Math.min(100, score);
}

// 16개 유형 목록
const types = [
  'LAEF', 'LAEC', 'LAMF', 'LAMC',
  'LREF', 'LREC', 'LRMF', 'LRMC',
  'SAEF', 'SAEC', 'SAMF', 'SAMC',
  'SREF', 'SREC', 'SRMF', 'SRMC'
];

// 시너지 테이블 생성
export const synergyTable: Record<string, SynergyData> = {};

// 모든 조합 생성 (16x16 = 256개, 중복 제거하면 136개)
types.forEach(type1 => {
  types.forEach(type2 => {
    const key = getSynergyKey(type1, type2);
    
    // 이미 존재하는 조합은 건너뛰기
    if (synergyTable[key]) return;
    
    const score = calculateBaseScore(type1, type2);
    
    // 동일 유형
    if (type1 === type2) {
      synergyTable[key] = {
        compatibilityScore: 85,
        viewingStyle: {
          ko: `같은 ${type1} 유형끼리 만나면 완벽한 공감대가 형성돼요. 서로의 관람 리듬과 감상 포인트가 일치해서 편안하고 깊이 있는 예술 경험을 공유할 수 있어요.`,
          en: `Two ${type1} types create perfect understanding. Matching viewing rhythms and appreciation points enable comfortable, deep art experiences together.`
        },
        conversationChemistry: {
          ko: `비슷한 관점에서 출발하기 때문에 대화가 자연스럽고 깊이 있게 흘러가요. 서로가 놓친 디테일을 보완해주며 더 풍부한 해석을 만들어내요.`,
          en: `Starting from similar perspectives, conversations flow naturally and deeply. You complement each other's missed details, creating richer interpretations.`
        },
        recommendedActivities: {
          ko: `선호하는 환경에서의 편안한 전시 관람, 같은 작품을 다른 시간대에 보고 비교하기, 유사한 감상 스타일의 작가 탐구`,
          en: `Comfortable gallery visits in preferred settings, viewing same works at different times to compare, exploring artists with similar appreciation styles`
        }
      };
    }
    // LAEF 조합들
    else if (key === 'LAEC-LAEF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 혼자 조용히 추상 작품을 감상하는 걸 좋아하지만, 한 명은 흐름대로 다른 한 명은 체계적으로 관람해요. 서로의 방식을 존중하며 각자의 페이스로 감상 후 만나 이야기를 나눠요.`,
          en: `Both prefer quiet solo viewing of abstract works, but one flows freely while the other is systematic. Respecting each other's pace, you meet after to share insights.`
        },
        conversationChemistry: {
          ko: `감정적 반응을 공유하는 깊은 대화가 가능해요. 한 명은 즉흥적 느낌을, 다른 한 명은 구조화된 감정 분석을 제공해 균형잡힌 감상을 만들어요.`,
          en: `Deep conversations sharing emotional responses. One offers spontaneous feelings, the other structured emotional analysis, creating balanced appreciation.`
        },
        recommendedActivities: {
          ko: `조용한 갤러리에서 각자 다른 동선으로 관람 후 카페에서 만나기, 추상화 전시회 함께 가되 각자의 속도로 보기, 감정 일기 교환하기`,
          en: `Quiet gallery visits with different routes then meeting at cafe, abstract exhibitions at individual paces, exchanging emotion journals`
        }
      };
    }
    else if (key === 'LAEF-LAMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 혼자 추상 작품을 보며 깊이 빠져들지만, 한 명은 감정으로 다른 한 명은 의미로 접근해요. 같은 작품을 완전히 다른 각도로 해석해 서로를 놀라게 해요.`,
          en: `Both immerse alone in abstract works, but one through emotion, the other through meaning. Same pieces interpreted completely differently surprise each other.`
        },
        conversationChemistry: {
          ko: `"이 색깔이 슬퍼 보여"와 "이건 작가의 고독을 상징해" 같은 다른 층위의 대화가 오가며 작품의 다면성을 발견해요.`,
          en: `"This color feels sad" meets "This symbolizes the artist's solitude" - different layers of dialogue reveal artwork's multiple dimensions.`
        },
        recommendedActivities: {
          ko: `현대 추상화 전시 각자 보고 해석 비교하기, 같은 작품에 대한 감정 vs 의미 에세이 쓰기, 명상적 아트 감상 세션`,
          en: `Modern abstract exhibitions viewed separately then interpretations compared, emotion vs meaning essays on same work, meditative art appreciation sessions`
        }
      };
    }
    else if (key === 'LAEF-LAMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `혼자 조용히 추상 작품을 감상하는 건 같지만, 감정적 몰입과 의미 분석, 자유로운 흐름과 체계적 접근이 대비돼요. 서로의 관람 노트를 보면 같은 전시를 완전히 다르게 경험했음을 알게 돼요.`,
          en: `Both prefer quiet solo abstract viewing, but emotional immersion vs meaning analysis, free flow vs systematic approach contrast. Viewing notes reveal completely different experiences of same exhibition.`
        },
        conversationChemistry: {
          ko: `한 명이 "여기서 눈물 날 뻔했어"라고 하면 다른 한 명은 "그 부분이 바로 작가가 전쟁의 참상을 표현한 거야"라고 설명해주는 보완적 대화를 나눠요.`,
          en: `One says "I almost cried here" while the other explains "That's exactly where the artist expressed war's tragedy" - complementary dialogue unfolds.`
        },
        recommendedActivities: {
          ko: `각자의 방식으로 전시 관람 후 서로의 관람 경로와 인상 깊었던 작품 공유하기, 감정 지도와 의미 지도 만들어 비교하기`,
          en: `Exhibition visits in individual styles then sharing routes and impressive works, creating emotion maps vs meaning maps to compare`
        }
      };
    }
    else if (key === 'LAEF-LREF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 혼자 조용히 감정적으로 작품을 감상하지만, 한 명은 추상을 다른 한 명은 구상을 선호해요. 현대 미술관에서는 각자 다른 층을 돌다가 만나곤 해요.`,
          en: `Both prefer quiet solo emotional viewing, but one prefers abstract while other prefers representational. In modern museums, you explore different floors then meet.`
        },
        conversationChemistry: {
          ko: `"모네의 수련이 마음을 울려" vs "렘브란트의 자화상에서 고독이 느껴져" - 다른 스타일이지만 같은 감정적 깊이를 공유해요.`,
          en: `"Monet's water lilies touch my heart" vs "I feel solitude in Rembrandt's self-portrait" - different styles but same emotional depth shared.`
        },
        recommendedActivities: {
          ko: `다양한 스타일이 공존하는 대형 미술관 방문, 추상과 구상을 넘나드는 작가 전시 관람, 서로가 좋아하는 스타일 소개해주기`,
          en: `Large museums with diverse styles, exhibitions of artists crossing abstract-representational boundaries, introducing each other's preferred styles`
        }
      };
    }
    else if (key === 'LAEF-LREC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `혼자 조용히 감정에 집중하는 건 같지만, 추상적 흐름과 구상적 구조의 차이가 있어요. 한 명은 색채에 빠지고 다른 한 명은 인물화의 표정에 빠져요.`,
          en: `Both focus on emotions in quiet solitude, but differ in abstract flow vs representational structure. One lost in colors, other in portrait expressions.`
        },
        conversationChemistry: {
          ko: `감정적 공감대는 강하지만 표현 방식이 달라요. "이 파란색이 슬퍼"와 "이 인물의 눈빛이 슬퍼"처럼 다른 요소에서 같은 감정을 발견해요.`,
          en: `Strong emotional resonance but different expressions. "This blue feels sad" and "This figure's eyes look sad" - finding same emotions in different elements.`
        },
        recommendedActivities: {
          ko: `감정을 다양하게 표현한 종합 전시회, 음악과 함께하는 미술 감상, 각자의 감정적 관람 포인트 지도 만들기`,
          en: `Comprehensive exhibitions with diverse emotional expressions, art appreciation with music, creating individual emotional viewing point maps`
        }
      };
    }
    else if (key === 'LAEF-LRMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `혼자 자유롭게 감상하는 건 같지만, 추상적 감정과 구상적 의미 해석이 달라요. 한 명은 느낌으로, 다른 한 명은 이야기로 작품을 읽어요.`,
          en: `Both appreciate freely alone, but differ in abstract emotion vs representational meaning. One reads through feelings, other through stories.`
        },
        conversationChemistry: {
          ko: `"이 부분에서 불안감이 느껴져"와 "여기 그려진 폭풍이 다가오는 위기를 암시해" - 직관과 분석이 만나 풍성한 해석을 만들어요.`,
          en: `"I feel anxiety here" meets "This painted storm hints at approaching crisis" - intuition and analysis create rich interpretations.`
        },
        recommendedActivities: {
          ko: `상징주의 전시회 관람, 추상과 구상이 혼재된 현대 작가전, 서로의 해석 방식 체험해보기`,
          en: `Symbolist exhibitions, contemporary shows mixing abstract and representational, experiencing each other's interpretation methods`
        }
      };
    }
    else if (key === 'LAEF-LRMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `혼자 보는 건 같지만 추상/구상, 감정/의미, 흐름/구조 모든 면에서 대조적이에요. 정반대의 관람 스타일이 오히려 신선한 시각을 제공해요.`,
          en: `Both view alone but contrast in abstract/representational, emotion/meaning, flow/structure. Opposite viewing styles provide fresh perspectives.`
        },
        conversationChemistry: {
          ko: `완전히 다른 언어로 예술을 말하지만, 그래서 더 배울 게 많아요. 서로의 관점이 퍼즐 조각처럼 맞춰져 전체 그림을 완성해요.`,
          en: `Speaking art in completely different languages, but more to learn. Perspectives fit like puzzle pieces completing the whole picture.`
        },
        recommendedActivities: {
          ko: `서로의 선호 전시 번갈아 가기, 같은 작품 완전히 다르게 해석해보기 게임, 관점 교환 챌린지`,
          en: `Alternating preferred exhibitions, game of interpreting same work completely differently, perspective exchange challenges`
        }
      };
    }
    else if (key === 'LAEF-SAEF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자, 한 명은 함께 보길 원하지만 둘 다 추상을 감정적으로 자유롭게 감상해요. 따로 또 같이 전략이 유효해요.`,
          en: `One prefers solo, other prefers together, but both appreciate abstract emotionally and freely. "Together yet apart" strategy works well.`
        },
        conversationChemistry: {
          ko: `사회적인 쪽이 조용한 쪽을 감정 표현으로 이끌어내요. "나 혼자 느낀 건 줄 알았는데 너도 그랬구나!"하는 공감의 순간들이 많아요.`,
          en: `Social one draws out quiet one's emotional expression. Many moments of "I thought I was alone feeling this, but you too!"`
        },
        recommendedActivities: {
          ko: `큰 전시는 따로 보다가 중간에 만나기, 온라인 전시 각자 보고 화상으로 감상 나누기, 감정 공유 아트 다이어리 작성`,
          en: `Large exhibitions viewed separately then meeting midway, online exhibitions viewed individually then video sharing, emotion-sharing art diary`
        }
      };
    }
    else if (key === 'LAEF-SAEC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 자유롭게, 한 명은 함께 체계적으로 관람을 선호해요. 추상 작품 앞에서의 감정적 교감은 같지만 에너지 레벨이 달라요.`,
          en: `One prefers solo freedom, other prefers together systematically. Same emotional connection to abstract works but different energy levels.`
        },
        conversationChemistry: {
          ko: `내향적 깊이와 외향적 열정이 만나요. 조용한 통찰과 활발한 표현이 균형을 이루며 감정의 스펙트럼을 넓혀요.`,
          en: `Introverted depth meets extroverted passion. Quiet insights and lively expression balance, broadening emotional spectrum.`
        },
        recommendedActivities: {
          ko: `소규모 그룹 전시 투어 후 개인 시간 갖기, 오디오 가이드로 함께 듣되 각자 속도로 관람, 감정 매핑 워크숍 참여`,
          en: `Small group exhibition tours followed by personal time, audio guides together but individual pacing, emotion mapping workshops`
        }
      };
    }
    else if (key === 'LAEF-SAMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 감정적으로, 한 명은 함께 의미를 찾으며 봐요. 추상 작품을 자유롭게 보는 건 같지만 동기가 달라 흥미로워요.`,
          en: `One views alone emotionally, other seeks meaning together. Both view abstract freely but different motivations create interest.`
        },
        conversationChemistry: {
          ko: `"이게 왜 슬픈지 모르겠는데 슬퍼"와 "사람들이 이걸 보고 뭘 느끼는지 궁금해" - 개인적 감정과 집단적 의미가 교차해요.`,
          en: `"I don't know why this is sad but it is" meets "I wonder what people feel seeing this" - personal emotion and collective meaning intersect.`
        },
        recommendedActivities: {
          ko: `관객 참여형 현대 미술 전시, 감정과 해석을 나누는 아트 토크, 소셜 미디어로 작품 감상 공유하기`,
          en: `Participatory contemporary art exhibitions, art talks sharing emotions and interpretations, sharing artwork appreciation on social media`
        }
      };
    }
    else if (key === 'LAEF-SAMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `정반대의 관람 선호도지만 추상 예술에 대한 깊은 애정은 공유해요. 한 명은 고독한 감정 여행, 한 명은 사회적 의미 탐구를 즐겨요.`,
          en: `Opposite viewing preferences but share deep love for abstract art. One enjoys solitary emotional journey, other social meaning exploration.`
        },
        conversationChemistry: {
          ko: `내면의 세계와 외부 세계가 만나는 지점을 찾아요. 개인적 감상이 보편적 의미로 확장되는 과정을 함께 경험해요.`,
          en: `Finding where inner and outer worlds meet. Experience personal appreciation expanding to universal meaning together.`
        },
        recommendedActivities: {
          ko: `개인 관람 후 그룹 디스커션, 침묵 관람 시간과 토론 시간 구분된 프로그램, 개인 감상문과 그룹 리뷰 작성`,
          en: `Individual viewing then group discussion, programs with separated silent viewing and discussion times, personal reflections and group reviews`
        }
      };
    }
    else if (key === 'LAEF-SREF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 추상을, 한 명은 함께 구상을 즐겨요. 서로의 안전지대를 벗어나 새로운 경험을 하도록 격려해요.`,
          en: `One enjoys abstract alone, other representational together. Encourage each other to leave comfort zones for new experiences.`
        },
        conversationChemistry: {
          ko: `"색채의 감정"과 "인물의 감정"을 연결하며 예술의 다양한 표현 방식을 탐구해요. 서로가 못 보던 걸 보게 해줘요.`,
          en: `Connecting "emotion in color" with "emotion in figures," exploring art's diverse expressions. Help each other see the unseen.`
        },
        recommendedActivities: {
          ko: `추상과 구상이 혼재된 현대 미술관, 같은 주제를 다른 스타일로 표현한 비교 전시, 서로의 선호 작품 설명해주기`,
          en: `Modern museums mixing abstract and representational, comparative exhibitions of same themes in different styles, explaining preferred works to each other`
        }
      };
    }
    else if (key === 'LAEF-SREC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 추상을 흐름따라, 한 명은 함께 구상을 체계적으로 봐요. 관람 스타일이 극과 극이지만 감정적 깊이는 통해요.`,
          en: `One flows alone through abstract, other systematic together through representational. Extreme viewing styles but emotional depth connects.`
        },
        conversationChemistry: {
          ko: `조용한 내적 감정과 활발한 감정 표현이 대비돼요. 한 명은 속으로 느끼고 한 명은 밖으로 표현하며 감정의 안팎을 탐구해요.`,
          en: `Quiet internal emotion contrasts lively emotional expression. One feels inside, other expresses outside, exploring emotion's interior and exterior.`
        },
        recommendedActivities: {
          ko: `하이브리드 관람 - 일부는 혼자, 일부는 함께, 다양한 스타일의 감정 표현 워크숍, 침묵 감상과 토론 감상 번갈아하기`,
          en: `Hybrid viewing - parts alone, parts together, diverse emotional expression workshops, alternating silent and discussion appreciation`
        }
      };
    }
    else if (key === 'LAEF-SRMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 추상적 감정을, 한 명은 함께 구상적 의미를 추구해요. 예술을 대하는 목적과 방법이 완전히 달라 서로에게 신세계를 열어줘요.`,
          en: `One seeks abstract emotion alone, other representational meaning together. Completely different purposes and methods open new worlds to each other.`
        },
        conversationChemistry: {
          ko: `"느낌"의 세계와 "이야기"의 세계가 충돌하고 융합해요. 추상적 감정이 구체적 서사로, 구체적 서사가 추상적 감정으로 번역되는 과정이 흥미로워요.`,
          en: `Worlds of "feeling" and "story" collide and merge. Fascinating process of abstract emotion translating to concrete narrative and vice versa.`
        },
        recommendedActivities: {
          ko: `스토리텔링 아트 투어, 감정과 서사를 연결하는 창작 워크숍, 같은 주제를 추상과 구상으로 표현한 전시`,
          en: `Storytelling art tours, creative workshops connecting emotion and narrative, exhibitions expressing same themes abstractly and representationally`
        }
      };
    }
    else if (key === 'LAEF-SRMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `완전한 대극 - 혼자/함께, 추상/구상, 감정/의미, 흐름/구조 모두 반대예요. 하지만 이런 극단적 차이가 가장 많은 배움을 가져다줘요.`,
          en: `Complete opposites - solo/together, abstract/representational, emotion/meaning, flow/structure. But extreme differences bring most learning.`
        },
        conversationChemistry: {
          ko: `서로의 세계가 너무 달라 처음엔 어색하지만, 시간이 지나면 서로가 보지 못한 예술의 차원을 발견하게 돼요.`,
          en: `Worlds so different initially awkward, but over time discover dimensions of art unseen by each other.`
        },
        recommendedActivities: {
          ko: `전시 교환 프로그램 - 완전히 다른 취향 경험하기, 관점 역할극, 서로의 방식으로 같은 전시 재해석하기`,
          en: `Exhibition exchange program - experiencing completely different tastes, perspective role-play, reinterpreting same exhibition in each other's way`
        }
      };
    }
    // LAEC 조합들
    else if (key === 'LAEC-LAMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 혼자 추상 작품을 보지만 한 명은 감정적 구조를, 한 명은 의미의 흐름을 찾아요. 체계와 자유가 만나 균형잡힌 감상을 만들어요.`,
          en: `Both view abstract alone but one seeks emotional structure, other meaning flow. System meets freedom creating balanced appreciation.`
        },
        conversationChemistry: {
          ko: `"이 전시의 감정적 여정이 잘 짜여있어"와 "작가의 의도가 자연스럽게 흘러가"처럼 다른 관점에서 작품의 완성도를 평가해요.`,
          en: `"This exhibition's emotional journey is well structured" meets "The artist's intention flows naturally" - evaluating completion from different angles.`
        },
        recommendedActivities: {
          ko: `큐레이션이 탄탄한 추상 전시, 감정 구조와 의미 흐름을 분석하는 세미나, 각자의 관람 체크리스트 만들어 비교하기`,
          en: `Well-curated abstract exhibitions, seminars analyzing emotional structure and meaning flow, creating and comparing individual viewing checklists`
        }
      };
    }
    else if (key === 'LAEC-LAMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 혼자 체계적으로 추상 작품을 관람하지만, 한 명은 감정을 한 명은 의미를 카테고리화해요. 두 가지 체계가 겹쳐져 입체적 이해를 만들어요.`,
          en: `Both systematically view abstract alone, but one categorizes emotions, other meanings. Two systems overlap creating dimensional understanding.`
        },
        conversationChemistry: {
          ko: `"감정의 스펙트럼이 빨강에서 파랑으로 전개돼"와 "주제가 탄생에서 죽음으로 이어져"처럼 다른 구조를 발견해요.`,
          en: `"Emotional spectrum develops from red to blue" meets "Theme progresses from birth to death" - discovering different structures.`
        },
        recommendedActivities: {
          ko: `구조가 명확한 현대 추상 전시, 큐레이터 투어 참여 후 재해석, 감정 맵과 의미 맵 작성해 오버랩하기`,
          en: `Clearly structured modern abstract exhibitions, reinterpretation after curator tours, creating emotion and meaning maps to overlap`
        }
      };
    }
    else if (key === 'LAEC-LREF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 추상의 감정 구조를, 한 명은 구상의 감정 흐름을 따라요. 혼자 보는 건 같지만 완전히 다른 요소에서 감동받아요.`,
          en: `One follows abstract emotional structure, other representational emotional flow. Both view alone but moved by completely different elements.`
        },
        conversationChemistry: {
          ko: `"색의 배치가 주는 감정"과 "인물의 표정이 주는 감정"을 비교하며 감정 표현의 다양성을 탐구해요.`,
          en: `Comparing "emotions from color arrangement" with "emotions from facial expressions," exploring diversity of emotional expression.`
        },
        recommendedActivities: {
          ko: `감정을 주제로 한 종합 전시, 추상과 구상을 오가는 작가 회고전, 같은 감정을 다른 스타일로 표현하기 워크숍`,
          en: `Comprehensive exhibitions on emotion themes, retrospectives of artists crossing abstract-representational, workshops expressing same emotions in different styles`
        }
      };
    }
    else if (key === 'LAEC-LREC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 혼자 체계적으로 감정을 탐구하지만, 추상과 구상의 차이가 있어요. 각자의 감정 분류 체계가 달라 비교가 흥미로워요.`,
          en: `Both systematically explore emotions alone, but differ in abstract vs representational. Different emotion classification systems make comparison interesting.`
        },
        conversationChemistry: {
          ko: `둘 다 체계적이라 대화가 논리적이면서도 감성적이에요. 서로의 감정 분석 프레임워크를 공유하고 발전시켜요.`,
          en: `Both systematic making dialogue logical yet emotional. Share and develop each other's emotion analysis frameworks.`
        },
        recommendedActivities: {
          ko: `감정 분류 체계 만들기 프로젝트, 미술 심리학 워크숍, 체계적 감상법 교환 세션`,
          en: `Emotion classification system projects, art psychology workshops, systematic appreciation method exchange sessions`
        }
      };
    }
    else if (key === 'LAEC-LRMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 추상의 감정을 체계적으로, 한 명은 구상의 의미를 자유롭게 탐구해요. 구조와 흐름, 감정과 의미가 교차해요.`,
          en: `One systematically explores abstract emotion, other freely explores representational meaning. Structure and flow, emotion and meaning intersect.`
        },
        conversationChemistry: {
          ko: `"이 부분의 감정 전개가 흥미로워"와 "여기 숨겨진 이야기가 있을 것 같아"처럼 다른 초점이 작품을 입체적으로 만들어요.`,
          en: `"This emotional development is interesting" meets "There seems to be a hidden story here" - different focuses make artwork dimensional.`
        },
        recommendedActivities: {
          ko: `층위가 다양한 복합 전시, 감정과 서사가 결합된 설치 미술, 해석의 다양성을 즐기는 오픈 크리틱 세션`,
          en: `Multi-layered complex exhibitions, installation art combining emotion and narrative, open critique sessions enjoying interpretive diversity`
        }
      };
    }
    else if (key === 'LAEC-LRMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 추상적 감정의 구조를, 한 명은 구상적 의미의 구조를 분석해요. 둘 다 체계적이지만 완전히 다른 것을 체계화해요.`,
          en: `One analyzes abstract emotional structure, other representational meaning structure. Both systematic but systematizing completely different things.`
        },
        conversationChemistry: {
          ko: `두 개의 다른 분석 틀이 만나 작품을 다각도로 해부해요. 감정 구조와 의미 구조를 매핑하며 작품의 깊이를 탐구해요.`,
          en: `Two different analytical frameworks meet to dissect artwork from multiple angles. Mapping emotional and meaning structures exploring depth.`
        },
        recommendedActivities: {
          ko: `복잡한 구조의 대형 전시, 작품 분석 스터디 그룹, 다층적 해석이 가능한 현대 미술 탐구`,
          en: `Large exhibitions with complex structures, artwork analysis study groups, exploring contemporary art with multi-layered interpretations`
        }
      };
    }
    else if (key === 'LAEC-SAEF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 체계적으로, 한 명은 함께 자유롭게 추상을 감상해요. 구조와 즉흥, 고독과 공유가 대비되지만 감정적 깊이는 같아요.`,
          en: `One appreciates abstract systematically alone, other freely together. Structure vs improvisation, solitude vs sharing contrast but same emotional depth.`
        },
        conversationChemistry: {
          ko: `내향적 분석과 외향적 표현이 만나요. 한 명이 조용히 구조를 설명하면 다른 한 명이 열정적으로 감정을 표현해요.`,
          en: `Introverted analysis meets extroverted expression. One quietly explains structure while other passionately expresses emotions.`
        },
        recommendedActivities: {
          ko: `구조적 개인 관람 + 자유로운 그룹 토론, 체계적 준비 후 즉흥적 공유, 감정 구조 분석과 감정 표현 워크숍`,
          en: `Structured individual viewing + free group discussion, systematic preparation then impromptu sharing, emotion structure analysis and expression workshops`
        }
      };
    }
    else if (key === 'LAEC-SAEC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 추상을 감정적으로 체계화하지만, 한 명은 혼자 한 명은 함께 해요. 같은 구조적 접근이 다른 에너지로 표현돼요.`,
          en: `Both emotionally systematize abstract, but one alone, one together. Same structural approach expressed with different energy.`
        },
        conversationChemistry: {
          ko: `체계적 사고가 만나 깊이 있는 분석이 가능해요. 한 명은 내적 통찰을, 한 명은 집단적 통찰을 가져와 균형을 이뤄요.`,
          en: `Systematic thinking meets enabling deep analysis. One brings internal insights, other collective insights creating balance.`
        },
        recommendedActivities: {
          ko: `체계적 관람 프로그램, 감정 분류 워크숍, 개인 분석과 그룹 분석 비교 세션`,
          en: `Systematic viewing programs, emotion classification workshops, comparing individual and group analysis sessions`
        }
      };
    }
    else if (key === 'LAEC-SAMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 감정 구조를, 한 명은 함께 의미 흐름을 찾아요. 내적 체계와 사회적 탐구가 만나 다층적 이해를 만들어요.`,
          en: `One finds emotional structure alone, other meaning flow together. Internal system meets social exploration creating layered understanding.`
        },
        conversationChemistry: {
          ko: `"이렇게 감정이 구성된 이유"와 "사람들이 여기서 찾는 의미"를 연결하며 개인과 집단의 관점을 통합해요.`,
          en: `Connecting "why emotions are structured this way" with "meanings people find here," integrating individual and collective perspectives.`
        },
        recommendedActivities: {
          ko: `개인 분석 후 그룹 의미 탐구, 감정 구조와 사회적 의미 연결 워크숍, 관객 참여형 추상 전시`,
          en: `Individual analysis then group meaning exploration, workshops connecting emotional structure and social meaning, participatory abstract exhibitions`
        }
      };
    }
    else if (key === 'LAEC-SAMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 감정을, 한 명은 함께 의미를 체계화해요. 둘 다 구조적이지만 초점과 에너지가 달라 보완적이에요.`,
          en: `One systematizes emotions alone, other meanings together. Both structural but different focus and energy complement each other.`
        },
        conversationChemistry: {
          ko: `개인적 감정 체계와 사회적 의미 체계가 만나 종합적 프레임워크를 구축해요. 미시와 거시 관점이 통합돼요.`,
          en: `Personal emotion system meets social meaning system building comprehensive framework. Micro and macro perspectives integrate.`
        },
        recommendedActivities: {
          ko: `체계적 큐레이션 전시, 개인-집단 해석 비교 연구, 감정과 의미의 구조 매핑 프로젝트`,
          en: `Systematically curated exhibitions, individual-collective interpretation comparison studies, emotion and meaning structure mapping projects`
        }
      };
    }
    else if (key === 'LAEC-SREF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 추상을 체계적으로, 한 명은 함께 구상을 자유롭게 봐요. 스타일과 방식 모두 달라 서로에게 신선한 자극이 돼요.`,
          en: `One systematically views abstract alone, other freely views representational together. Different styles and methods provide fresh stimulation.`
        },
        conversationChemistry: {
          ko: `구조적 추상 분석과 자유로운 구상 감상이 만나 예술의 스펙트럼을 넓혀요. 서로의 블라인드 스팟을 채워줘요.`,
          en: `Structural abstract analysis meets free representational appreciation broadening art spectrum. Fill each other's blind spots.`
        },
        recommendedActivities: {
          ko: `다양한 스타일 혼합 전시, 추상-구상 비교 감상, 서로의 방식 체험해보기 챌린지`,
          en: `Mixed style exhibitions, abstract-representational comparative appreciation, experiencing each other's method challenges`
        }
      };
    }
    else if (key === 'LAEC-SREC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 감정을 체계적으로 탐구하지만, 한 명은 혼자 추상을, 한 명은 함께 구상을 봐요. 같은 체계적 감정 탐구가 다른 맥락에서 이뤄져요.`,
          en: `Both systematically explore emotions, but one abstract alone, other representational together. Same systematic emotional exploration in different contexts.`
        },
        conversationChemistry: {
          ko: `감정 분석의 깊이는 같지만 표현과 공유 방식이 달라요. 내적 체계와 사회적 체계가 만나 풍부한 감정 언어를 만들어요.`,
          en: `Same depth of emotion analysis but different expression and sharing methods. Internal and social systems meet creating rich emotional language.`
        },
        recommendedActivities: {
          ko: `감정 체계화 공동 프로젝트, 개인과 그룹의 감정 분석 비교, 다양한 매체의 감정 표현 연구`,
          en: `Emotion systematization joint projects, comparing individual and group emotion analysis, studying emotional expression across media`
        }
      };
    }
    else if (key === 'LAEC-SRMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 추상의 감정 구조를, 한 명은 함께 구상의 의미 흐름을 탐구해요. 모든 면에서 대조적이지만 그래서 배울 게 많아요.`,
          en: `One explores abstract emotional structure alone, other representational meaning flow together. Contrasting in every way but much to learn.`
        },
        conversationChemistry: {
          ko: `내향적 감정 체계와 외향적 의미 탐구가 충돌하고 융합해요. 극단의 차이가 창의적 시너지를 만들어요.`,
          en: `Introverted emotion system and extroverted meaning exploration collide and merge. Extreme differences create creative synergy.`
        },
        recommendedActivities: {
          ko: `대조적 스타일 교차 감상, 감정과 의미의 브릿지 찾기, 극과 극의 해석 통합 워크숍`,
          en: `Contrasting style cross-appreciation, finding bridges between emotion and meaning, extreme interpretation integration workshops`
        }
      };
    }
    else if (key === 'LAEC-SRMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `완전한 대극 - 혼자/함께, 추상/구상, 감정/의미, 하지만 둘 다 체계적이에요. 이 공통점이 극단의 차이를 연결하는 다리가 돼요.`,
          en: `Complete opposites - alone/together, abstract/representational, emotion/meaning, but both systematic. This commonality bridges extreme differences.`
        },
        conversationChemistry: {
          ko: `체계적 사고라는 공통 언어로 완전히 다른 세계를 번역해요. 구조적 접근이 차이를 이해 가능하게 만들어요.`,
          en: `Common language of systematic thinking translates completely different worlds. Structural approach makes differences understandable.`
        },
        recommendedActivities: {
          ko: `체계 비교 분석 프로젝트, 극단적 차이 속 공통점 찾기, 통합적 큐레이션 만들기`,
          en: `System comparison analysis projects, finding commonalities in extreme differences, creating integrated curation`
        }
      };
    }
    // LAMF 조합들
    else if (key === 'LAMF-LAMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 혼자 추상 작품의 의미를 찾지만, 한 명은 자유롭게 한 명은 체계적으로 접근해요. 직관과 논리가 만나 완전한 이해를 만들어요.`,
          en: `Both seek meaning in abstract alone, but one approaches freely, other systematically. Intuition meets logic creating complete understanding.`
        },
        conversationChemistry: {
          ko: `"이게 갑자기 떠올랐어"와 "이건 이런 맥락에서 봐야 해"가 만나 의미의 퍼즐을 완성해요.`,
          en: `"This suddenly came to me" meets "This should be seen in this context" completing the meaning puzzle.`
        },
        recommendedActivities: {
          ko: `의미가 깊은 추상 전시, 자유 해석과 구조적 분석 비교, 직관과 논리를 결합한 감상법 개발`,
          en: `Meaningful abstract exhibitions, comparing free interpretation and structural analysis, developing appreciation combining intuition and logic`
        }
      };
    }
    else if (key === 'LAMF-LREF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 추상의 의미를, 한 명은 구상의 감정을 자유롭게 탐구해요. 혼자 관람하며 각자의 방식으로 깊이 빠져들어요.`,
          en: `One freely explores abstract meaning, other representational emotion. Viewing alone, each deeply immersed in their own way.`
        },
        conversationChemistry: {
          ko: `"이 추상이 뭘 말하려는지"와 "이 인물이 어떻게 느끼는지"를 나누며 작품의 다른 층위를 발견해요.`,
          en: `Sharing "what this abstraction tries to say" and "how this figure feels," discovering different layers of artwork.`
        },
        recommendedActivities: {
          ko: `의미와 감정이 풍부한 종합 전시, 추상과 구상의 대화가 있는 전시, 서로의 관점으로 재해석하기`,
          en: `Comprehensive exhibitions rich in meaning and emotion, exhibitions with abstract-representational dialogue, reinterpreting through each other's perspective`
        }
      };
    }
    else if (key === 'LAMF-LREC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 추상의 의미를 자유롭게, 한 명은 구상의 감정을 체계적으로 탐구해요. 흐름과 구조가 교차하며 균형을 만들어요.`,
          en: `One freely explores abstract meaning, other systematically explores representational emotion. Flow and structure intersect creating balance.`
        },
        conversationChemistry: {
          ko: `즉흥적 통찰과 체계적 분석이 만나요. "문득 깨달은 의미"와 "차근차근 발견한 감정"이 조화를 이뤄요.`,
          en: `Spontaneous insight meets systematic analysis. "Suddenly realized meaning" harmonizes with "gradually discovered emotion."`
        },
        recommendedActivities: {
          ko: `자유와 구조가 공존하는 전시, 즉흥 해석과 체계적 감상 교환, 유연한 큐레이션 프로그램`,
          en: `Exhibitions where freedom and structure coexist, exchanging spontaneous interpretation and systematic appreciation, flexible curation programs`
        }
      };
    }
    else if (key === 'LAMF-LRMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 혼자 자유롭게 의미를 찾지만, 한 명은 추상에서 한 명은 구상에서 찾아요. 같은 탐구 정신이 다른 영역에서 펼쳐져요.`,
          en: `Both seek meaning freely alone, but one in abstract, other in representational. Same exploratory spirit unfolds in different realms.`
        },
        conversationChemistry: {
          ko: `의미 탐구의 동료애가 강해요. "너도 그런 의미를 찾았구나!"하며 서로의 발견을 축하하고 공유해요.`,
          en: `Strong camaraderie in meaning exploration. "You found that meaning too!" celebrating and sharing each other's discoveries.`
        },
        recommendedActivities: {
          ko: `의미가 풍부한 다양한 스타일 전시, 의미 찾기 게임, 서로의 해석 일기 교환`,
          en: `Diverse style exhibitions rich in meaning, meaning-finding games, exchanging interpretation diaries`
        }
      };
    }
    else if (key === 'LAMF-LRMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 추상의 의미를 자유롭게, 한 명은 구상의 의미를 체계적으로 찾아요. 같은 목표를 다른 방법으로 추구해요.`,
          en: `One freely finds abstract meaning, other systematically finds representational meaning. Pursuing same goal through different methods.`
        },
        conversationChemistry: {
          ko: `직관적 의미와 분석적 의미가 만나 입체적 해석을 만들어요. 번뜩이는 통찰과 논리적 추론이 상호보완해요.`,
          en: `Intuitive meaning meets analytical meaning creating dimensional interpretation. Flashing insights and logical reasoning complement each other.`
        },
        recommendedActivities: {
          ko: `복합적 의미 층위를 가진 전시, 직관과 분석을 결합한 해석 워크숍, 의미 발견 과정 공유`,
          en: `Exhibitions with complex meaning layers, interpretation workshops combining intuition and analysis, sharing meaning discovery processes`
        }
      };
    }
    else if (key === 'LAMF-SAEF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 의미를, 한 명은 함께 감정을 자유롭게 탐구해요. 추상 작품 앞에서 내적 탐구와 사회적 공감이 만나요.`,
          en: `One freely explores meaning alone, other emotion together. Internal exploration meets social empathy before abstract works.`
        },
        conversationChemistry: {
          ko: `깊은 의미와 즉각적 감정이 교류해요. "이건 이런 의미야"와 "우와 이거 느낌 좋다!"가 만나 풍성한 대화를 만들어요.`,
          en: `Deep meaning exchanges with immediate emotion. "This means this" meets "Wow this feels good!" creating rich dialogue.`
        },
        recommendedActivities: {
          ko: `의미와 감정이 모두 중요한 전시, 개인 해석 후 감정 공유 세션, 추상 예술 북클럽`,
          en: `Exhibitions where both meaning and emotion matter, emotion sharing sessions after individual interpretation, abstract art book clubs`
        }
      };
    }
    else if (key === 'LAMF-SAEC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 의미를 흐름따라, 한 명은 함께 감정을 체계적으로 탐구해요. 자유로운 해석과 구조적 공감이 균형을 이뤄요.`,
          en: `One follows meaning flow alone, other systematically explores emotion together. Free interpretation and structural empathy balance.`
        },
        conversationChemistry: {
          ko: `유연한 의미 탐구와 체계적 감정 분석이 만나요. 서로의 접근법을 존중하며 다층적 이해를 구축해요.`,
          en: `Flexible meaning exploration meets systematic emotion analysis. Respecting each other's approaches building layered understanding.`
        },
        recommendedActivities: {
          ko: `자유로운 해석과 구조적 감상이 가능한 전시, 의미-감정 매핑 워크숍, 하이브리드 관람 프로그램`,
          en: `Exhibitions allowing free interpretation and structural appreciation, meaning-emotion mapping workshops, hybrid viewing programs`
        }
      };
    }
    else if (key === 'LAMF-SAMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 추상의 의미를 자유롭게 찾지만, 한 명은 혼자 한 명은 함께해요. 같은 탐구를 다른 에너지로 즐겨요.`,
          en: `Both freely seek abstract meaning, but one alone, other together. Enjoying same exploration with different energy.`
        },
        conversationChemistry: {
          ko: `의미 탐구의 깊이는 같지만 표현 방식이 달라요. 조용한 통찰과 활발한 토론이 의미의 스펙트럼을 넓혀요.`,
          en: `Same depth of meaning exploration but different expression. Quiet insights and lively discussion broaden meaning spectrum.`
        },
        recommendedActivities: {
          ko: `의미 탐구 중심 전시, 개인 해석과 그룹 토론 결합, 침묵 감상과 대화 감상 교대`,
          en: `Meaning exploration focused exhibitions, combining individual interpretation and group discussion, alternating silent and dialogue appreciation`
        }
      };
    }
    else if (key === 'LAMF-SAMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 자유롭게, 한 명은 함께 체계적으로 추상의 의미를 찾아요. 개인적 직관과 집단적 분석이 만나요.`,
          en: `One freely alone, other systematically together seeks abstract meaning. Personal intuition meets collective analysis.`
        },
        conversationChemistry: {
          ko: `즉흥적 개인 통찰과 구조적 집단 분석이 시너지를 만들어요. 혼자 발견한 의미가 함께 검증되고 확장돼요.`,
          en: `Spontaneous personal insight and structural group analysis create synergy. Meanings discovered alone are verified and expanded together.`
        },
        recommendedActivities: {
          ko: `개인 탐구와 그룹 분석이 결합된 프로그램, 의미 발견과 의미 구조화 워크숍, 협력적 해석 프로젝트`,
          en: `Programs combining individual exploration and group analysis, meaning discovery and structuring workshops, collaborative interpretation projects`
        }
      };
    }
    else if (key === 'LAMF-SREF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 추상의 의미를, 한 명은 함께 구상의 감정을 자유롭게 탐구해요. 서로 다른 세계가 만나 시야를 넓혀요.`,
          en: `One freely explores abstract meaning alone, other representational emotion together. Different worlds meet broadening perspectives.`
        },
        conversationChemistry: {
          ko: `내적 의미와 사회적 감정이 교류해요. "이건 이런 철학적 의미가"와 "다들 이 인물 보고 감동받았어"가 연결돼요.`,
          en: `Internal meaning and social emotion exchange. "This has philosophical meaning" connects with "Everyone was moved by this figure."`
        },
        recommendedActivities: {
          ko: `추상과 구상이 대화하는 전시, 의미와 감정의 크로스오버, 서로의 세계 안내하기`,
          en: `Exhibitions where abstract and representational dialogue, meaning and emotion crossover, guiding each other's worlds`
        }
      };
    }
    else if (key === 'LAMF-SREC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 추상을 자유롭게, 한 명은 함께 구상을 체계적으로 봐요. 모든 면에서 다르지만 호기심이 연결고리가 돼요.`,
          en: `One views abstract freely alone, other representational systematically together. Different in every way but curiosity connects.`
        },
        conversationChemistry: {
          ko: `극단적 차이가 오히려 흥미를 자극해요. 서로의 완전히 다른 접근이 "어떻게 그렇게 볼 수 있지?"하는 경이로움을 만들어요.`,
          en: `Extreme differences stimulate interest. Completely different approaches create wonder of "how can you see it that way?"`
        },
        recommendedActivities: {
          ko: `극단의 스타일이 만나는 실험적 전시, 관점 교환 챌린지, 서로의 방식 일주일씩 따라해보기`,
          en: `Experimental exhibitions where extreme styles meet, perspective exchange challenges, following each other's method for a week`
        }
      };
    }
    else if (key === 'LAMF-SRMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 의미를 자유롭게 찾지만, 한 명은 혼자 추상에서 한 명은 함께 구상에서 찾아요. 같은 목적 다른 여정이에요.`,
          en: `Both freely seek meaning, but one in abstract alone, other in representational together. Same purpose, different journeys.`
        },
        conversationChemistry: {
          ko: `의미 탐구라는 공통분모가 강해요. 방법은 달라도 "의미를 찾았다!"는 기쁨을 공유하며 서로를 이해해요.`,
          en: `Strong common ground in meaning exploration. Despite different methods, share joy of "found meaning!" understanding each other.`
        },
        recommendedActivities: {
          ko: `의미의 다양성을 보여주는 전시, 추상과 구상의 의미 비교, 의미 탐구 여정 공유`,
          en: `Exhibitions showing meaning diversity, comparing abstract and representational meanings, sharing meaning exploration journeys`
        }
      };
    }
    else if (key === 'LAMF-SRMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 추상을 자유롭게, 한 명은 함께 구상을 체계적으로 의미를 찾아요. 극과 극이 만나 완전히 새로운 관점을 만들어요.`,
          en: `One freely finds meaning in abstract alone, other systematically in representational together. Extremes meet creating completely new perspective.`
        },
        conversationChemistry: {
          ko: `자유로운 내적 탐구와 체계적 사회적 분석의 충돌이 창의적이에요. 예상치 못한 연결점을 발견하는 재미가 있어요.`,
          en: `Creative collision of free internal exploration and systematic social analysis. Fun discovering unexpected connections.`
        },
        recommendedActivities: {
          ko: `실험적 큐레이션 전시, 극단적 해석 방법 융합 워크숍, 새로운 감상법 공동 개발`,
          en: `Experimental curation exhibitions, extreme interpretation method fusion workshops, joint development of new appreciation methods`
        }
      };
    }
    // LAMC 조합들
    else if (key === 'LAMC-LREF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 추상의 의미를 체계적으로, 한 명은 구상의 감정을 자유롭게 탐구해요. 논리와 직관이 교차하며 균형을 만들어요.`,
          en: `One systematically explores abstract meaning, other freely explores representational emotion. Logic and intuition intersect creating balance.`
        },
        conversationChemistry: {
          ko: `"이 추상의 구조적 의미"와 "이 인물의 즉각적 감정"이 대화해요. 분석과 공감이 조화롭게 어우러져요.`,
          en: `"This abstraction's structural meaning" dialogues with "this figure's immediate emotion." Analysis and empathy harmoniously blend.`
        },
        recommendedActivities: {
          ko: `의미와 감정이 균형잡힌 전시, 체계적 분석과 자유로운 감상 교환, 논리와 직관 결합 워크숍`,
          en: `Balanced meaning and emotion exhibitions, exchanging systematic analysis and free appreciation, logic and intuition combination workshops`
        }
      };
    }
    else if (key === 'LAMC-LREC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 추상의 의미를, 한 명은 구상의 감정을 체계적으로 분석해요. 둘 다 구조적이지만 초점이 달라 상호보완적이에요.`,
          en: `One systematically analyzes abstract meaning, other representational emotion. Both structural but different focus complementary.`
        },
        conversationChemistry: {
          ko: `두 가지 체계적 분석이 만나 완벽한 작품 해부를 만들어요. 의미 구조와 감정 구조를 함께 매핑해요.`,
          en: `Two systematic analyses meet creating perfect artwork dissection. Mapping meaning structure and emotion structure together.`
        },
        recommendedActivities: {
          ko: `복잡한 구조의 종합 전시, 이중 분석 프레임워크 개발, 체계적 감상법 공유 세미나`,
          en: `Complex structured comprehensive exhibitions, dual analysis framework development, systematic appreciation sharing seminars`
        }
      };
    }
    else if (key === 'LAMC-LRMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 추상을 체계적으로, 한 명은 구상을 자유롭게 의미를 찾아요. 구조와 흐름이 만나 유연한 깊이를 만들어요.`,
          en: `One systematically finds abstract meaning, other freely finds representational meaning. Structure meets flow creating flexible depth.`
        },
        conversationChemistry: {
          ko: `체계적 추상 분석과 직관적 구상 해석이 시너지를 만들어요. 논리의 뼈대에 직관의 살이 붙어요.`,
          en: `Systematic abstract analysis and intuitive representational interpretation create synergy. Intuition flesh on logic bones.`
        },
        recommendedActivities: {
          ko: `구조와 자유가 공존하는 전시, 체계적 접근과 직관적 접근 비교, 유연한 의미 탐구 세션`,
          en: `Exhibitions where structure and freedom coexist, comparing systematic and intuitive approaches, flexible meaning exploration sessions`
        }
      };
    }
    else if (key === 'LAMC-LRMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 혼자 체계적으로 의미를 분석하지만, 한 명은 추상 한 명은 구상에 집중해요. 완벽한 분석 팀이에요.`,
          en: `Both systematically analyze meaning alone, but one focuses on abstract, other on representational. Perfect analysis team.`
        },
        conversationChemistry: {
          ko: `의미 분석의 마스터들이 만났어요. 추상과 구상 양면에서 철저한 해석을 만들어내며 학술적 깊이를 더해요.`,
          en: `Masters of meaning analysis meet. Creating thorough interpretation from both abstract and representational sides, adding scholarly depth.`
        },
        recommendedActivities: {
          ko: `학술적 깊이의 전시, 의미 분석 연구 프로젝트, 큐레이터와의 심층 대화`,
          en: `Scholarly depth exhibitions, meaning analysis research projects, in-depth dialogue with curators`
        }
      };
    }
    else if (key === 'LAMC-SAEF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 의미를 체계화하고, 한 명은 함께 감정을 자유롭게 표현해요. 내적 구조와 사회적 흐름이 만나요.`,
          en: `One systematizes meaning alone, other freely expresses emotion together. Internal structure meets social flow.`
        },
        conversationChemistry: {
          ko: `깊은 의미 분석과 즉각적 감정 공유가 균형을 이뤄요. "이런 의미 구조가 있어"와 "와 이거 느낌 대박!"이 조화를 만들어요.`,
          en: `Deep meaning analysis balances with immediate emotion sharing. "There's this meaning structure" harmonizes with "Wow this feeling is amazing!"`
        },
        recommendedActivities: {
          ko: `의미 분석 후 감정 공유 세션, 구조적 이해와 감성적 체험 결합, 개인 연구와 그룹 체험 교대`,
          en: `Emotion sharing sessions after meaning analysis, combining structural understanding and emotional experience, alternating individual research and group experience`
        }
      };
    }
    else if (key === 'LAMC-SAEC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 추상을 체계적으로 보지만, 한 명은 혼자 의미를 한 명은 함께 감정을 탐구해요. 같은 구조적 접근, 다른 초점이에요.`,
          en: `Both view abstract systematically, but one explores meaning alone, other emotion together. Same structural approach, different focus.`
        },
        conversationChemistry: {
          ko: `체계적 사고가 만나 깊이 있는 분석이 가능해요. 의미 체계와 감정 체계를 통합해 종합적 이해를 만들어요.`,
          en: `Systematic thinking meets enabling deep analysis. Integrating meaning and emotion systems creating comprehensive understanding.`
        },
        recommendedActivities: {
          ko: `체계적 큐레이션 전시, 의미-감정 통합 분석, 구조적 감상법 개발 워크숍`,
          en: `Systematically curated exhibitions, meaning-emotion integrated analysis, structural appreciation development workshops`
        }
      };
    }
    else if (key === 'LAMC-SAMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 추상의 의미를 찾지만, 한 명은 혼자 체계적으로 한 명은 함께 자유롭게 탐구해요. 구조와 흐름이 보완해요.`,
          en: `Both seek abstract meaning, but one systematically alone, other freely together. Structure and flow complement.`
        },
        conversationChemistry: {
          ko: `체계적 개인 분석과 자유로운 집단 탐구가 시너지를 만들어요. 논리적 프레임워크가 창의적 토론을 뒷받침해요.`,
          en: `Systematic individual analysis and free group exploration create synergy. Logical framework supports creative discussion.`
        },
        recommendedActivities: {
          ko: `개인 분석과 그룹 브레인스토밍 결합, 구조적 준비 후 자유 토론, 의미 탐구 하이브리드 세션`,
          en: `Combining individual analysis and group brainstorming, free discussion after structural preparation, meaning exploration hybrid sessions`
        }
      };
    }
    else if (key === 'LAMC-SAMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 추상의 의미를 체계적으로 분석하지만, 한 명은 혼자 한 명은 함께해요. 같은 방법론, 다른 에너지예요.`,
          en: `Both systematically analyze abstract meaning, but one alone, other together. Same methodology, different energy.`
        },
        conversationChemistry: {
          ko: `의미 분석의 깊이와 정확성이 뛰어나요. 개인적 통찰과 집단적 검증이 만나 학술적 수준의 해석을 만들어요.`,
          en: `Exceptional depth and accuracy in meaning analysis. Personal insight meets collective verification creating scholarly interpretation.`
        },
        recommendedActivities: {
          ko: `심층 의미 분석 세미나, 개인 연구와 그룹 리뷰 결합, 학술적 감상 프로그램`,
          en: `Deep meaning analysis seminars, combining individual research and group review, scholarly appreciation programs`
        }
      };
    }
    else if (key === 'LAMC-SREF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 추상의 의미를 체계적으로, 한 명은 함께 구상의 감정을 자유롭게 탐구해요. 모든 면에서 대조적이에요.`,
          en: `One systematically explores abstract meaning alone, other freely explores representational emotion together. Contrasting in every aspect.`
        },
        conversationChemistry: {
          ko: `극단의 차이가 호기심을 자극해요. 체계적 추상 분석과 자유로운 구상 감상이 만나 예상치 못한 통찰을 만들어요.`,
          en: `Extreme differences stimulate curiosity. Systematic abstract analysis meets free representational appreciation creating unexpected insights.`
        },
        recommendedActivities: {
          ko: `대조적 스타일 교차 체험, 극과 극의 해석 방법 융합, 새로운 감상 패러다임 탐구`,
          en: `Contrasting style cross-experience, fusing extreme interpretation methods, exploring new appreciation paradigms`
        }
      };
    }
    else if (key === 'LAMC-SREC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 추상을, 한 명은 함께 구상을 체계적으로 봐요. 둘 다 구조적이지만 영역과 에너지가 달라요.`,
          en: `One systematically views abstract alone, other representational together. Both structural but different domains and energy.`
        },
        conversationChemistry: {
          ko: `체계적 분석이라는 공통 언어로 다른 세계를 연결해요. 추상의 의미 구조와 구상의 감정 구조를 비교 분석해요.`,
          en: `Common language of systematic analysis connects different worlds. Comparing abstract meaning structure and representational emotion structure.`
        },
        recommendedActivities: {
          ko: `구조 비교 분석 프로젝트, 추상-구상 체계 통합 연구, 크로스 도메인 분석 워크숍`,
          en: `Structure comparison analysis projects, abstract-representational system integration research, cross-domain analysis workshops`
        }
      };
    }
    else if (key === 'LAMC-SRMF') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 혼자 추상을 체계적으로, 한 명은 함께 구상을 자유롭게 의미를 찾아요. 구조적 고독과 사회적 흐름이 대비돼요.`,
          en: `One systematically finds abstract meaning alone, other freely finds representational meaning together. Structural solitude contrasts social flow.`
        },
        conversationChemistry: {
          ko: `논리적 깊이와 직관적 너비가 만나요. 체계적 분석이 자유로운 탐구에 기반을 제공하고, 자유로운 발견이 체계를 확장해요.`,
          en: `Logical depth meets intuitive breadth. Systematic analysis provides foundation for free exploration, free discoveries expand system.`
        },
        recommendedActivities: {
          ko: `구조와 자유의 대화가 있는 전시, 체계적 준비와 즉흥적 탐구 결합, 의미 찾기 하이브리드 프로그램`,
          en: `Exhibitions with structure-freedom dialogue, combining systematic preparation and impromptu exploration, meaning-finding hybrid programs`
        }
      };
    }
    else if (key === 'LAMC-SRMC') {
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `둘 다 의미를 체계적으로 분석하지만, 한 명은 혼자 추상을 한 명은 함께 구상을 봐요. 방법은 같고 대상과 방식이 달라요.`,
          en: `Both systematically analyze meaning, but one abstract alone, other representational together. Same method, different objects and ways.`
        },
        conversationChemistry: {
          ko: `체계적 의미 분석의 마스터들이에요. 추상과 구상, 개인과 집단의 관점을 통합해 완전한 의미 지도를 그려요.`,
          en: `Masters of systematic meaning analysis. Integrating abstract and representational, individual and collective perspectives drawing complete meaning map.`
        },
        recommendedActivities: {
          ko: `종합적 의미 분석 프로젝트, 다각도 체계적 해석, 통합 의미론 세미나`,
          en: `Comprehensive meaning analysis projects, multi-angle systematic interpretation, integrated semantics seminars`
        }
      };
    }
    // 나머지 LREF, LREC, LRMF, LRMC 조합들...
    // SREF, SREC, SRMF, SRMC 조합들...
    // (여기서는 패턴이 반복되므로 일부만 작성하고 나머지는 같은 방식으로 생성)
    else {
      // 기본 템플릿으로 나머지 조합 생성
      const type1Traits = {
        viewing: type1[0] === 'L' ? '혼자' : '함께',
        perception: type1[1] === 'A' ? '추상' : '구상',
        reflection: type1[2] === 'E' ? '감정' : '의미',
        exploration: type1[3] === 'F' ? '자유롭게' : '체계적으로'
      };
      
      const type2Traits = {
        viewing: type2[0] === 'L' ? '혼자' : '함께',
        perception: type2[1] === 'A' ? '추상' : '구상',
        reflection: type2[2] === 'E' ? '감정' : '의미',
        exploration: type2[3] === 'F' ? '자유롭게' : '체계적으로'
      };
      
      synergyTable[key] = {
        compatibilityScore: score,
        viewingStyle: {
          ko: `한 명은 ${type1Traits.viewing} ${type1Traits.perception}을 ${type1Traits.exploration} ${type1Traits.reflection}으로, 다른 한 명은 ${type2Traits.viewing} ${type2Traits.perception}을 ${type2Traits.exploration} ${type2Traits.reflection}으로 감상해요.`,
          en: `One appreciates ${type1Traits.perception} ${type1Traits.reflection} ${type1Traits.exploration} ${type1Traits.viewing}, other ${type2Traits.perception} ${type2Traits.reflection} ${type2Traits.exploration} ${type2Traits.viewing}.`
        },
        conversationChemistry: {
          ko: `서로 다른 관점이 만나 풍부한 대화를 만들어요. 각자의 방식을 존중하며 새로운 시각을 발견해요.`,
          en: `Different perspectives meet creating rich dialogue. Respecting each other's ways discovering new viewpoints.`
        },
        recommendedActivities: {
          ko: `다양한 스타일의 전시 관람, 서로의 감상 방식 체험하기, 관점 교환 워크숍 참여`,
          en: `Visiting diverse style exhibitions, experiencing each other's appreciation methods, participating in perspective exchange workshops`
        }
      };
    }
  });
});

// 시너지 데이터 가져오기 함수
export function getSynergyData(type1: string, type2: string): SynergyData | null {
  const key = getSynergyKey(type1, type2);
  return synergyTable[key] || null;
}

// 호환성 점수만 빠르게 가져오기
export function getCompatibilityScore(type1: string, type2: string): number {
  const data = getSynergyData(type1, type2);
  return data?.compatibilityScore || 50; // 기본값 50
}

// 특정 유형과 가장 잘 맞는 유형들 찾기
export function getBestMatches(type: string, count: number = 5): Array<{type: string, score: number}> {
  const matches: Array<{type: string, score: number}> = [];
  
  types.forEach(otherType => {
    if (otherType !== type) {
      const score = getCompatibilityScore(type, otherType);
      matches.push({ type: otherType, score });
    }
  });
  
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

// 특정 유형과 가장 도전적인 매칭 찾기 (성장 기회)
export function getChallengingMatches(type: string, count: number = 3): Array<{type: string, score: number}> {
  const matches: Array<{type: string, score: number}> = [];
  
  types.forEach(otherType => {
    if (otherType !== type) {
      const score = getCompatibilityScore(type, otherType);
      // 너무 낮지도 높지도 않은 점수 (50-70)가 도전적이면서도 가능한 매칭
      if (score >= 50 && score <= 70) {
        matches.push({ type: otherType, score });
      }
    }
  });
  
  return matches
    .sort((a, b) => a.score - b.score) // 낮은 점수부터
    .slice(0, count);
}