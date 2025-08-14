/**
 * 각 성격 유형별 작품 매칭 이유와 큐레이션 로직
 * SAYU의 16가지 성격 유형과 예술 작품 간의 깊이 있는 연결 설명
 */

export interface ArtworkMapping {
  personalityType: string;
  description: string;
  coreValues: string[];
  artists: {
    name: string;
    reason: string;
    artworks: {
      title: string;
      why: string;
      emotionalConnection: string;
    }[];
  }[];
}

export const ARTWORK_PERSONALITY_MAPPINGS: ArtworkMapping[] = [
  {
    personalityType: 'SREF',
    description: '따뜻한 관계형 - 인간관계와 공동체를 가장 소중히 여기는 유형',
    coreValues: ['인간관계', '공동체', '따뜻함', '협력', '일상의 아름다움'],
    artists: [
      {
        name: '르누아르 (Pierre-Auguste Renoir)',
        reason: '사회적 모임과 인간관계의 기쁨을 따뜻한 색채로 표현. SREF가 추구하는 자연스러운 유대감을 완벽하게 구현',
        artworks: [
          {
            title: '물랭 드 라 갈레트',
            why: '사람들이 자연스럽게 어울리며 즐기는 모습',
            emotionalConnection: 'SREF가 가장 행복해하는 순간 - 친구들과의 자연스러운 모임'
          },
          {
            title: '보트 파티 점심',
            why: '다양한 사람들이 함께 식사하며 대화하는 공동체적 순간',
            emotionalConnection: '소속감과 따뜻한 인간관계에서 오는 만족감'
          },
          {
            title: '피아노 치는 소녀들',
            why: '함께 음악을 만들며 협력하는 모습',
            emotionalConnection: 'SREF의 협동 정신과 조화로운 관계 추구'
          }
        ]
      },
      {
        name: '카사트 (Mary Cassatt)',
        reason: '모성애와 가족 관계의 깊이를 섬세하게 표현. SREF의 보살핌과 애정 표현 방식과 일치',
        artworks: [
          {
            title: '아이 목욕',
            why: '일상적 돌봄 속에서 드러나는 깊은 사랑',
            emotionalConnection: 'SREF의 자연스러운 보살핌과 헌신적 사랑'
          },
          {
            title: '보트 나들이',
            why: '가족이 함께하는 평화로운 시간',
            emotionalConnection: '가족과 함께하는 시간을 가장 소중히 여기는 마음'
          },
          {
            title: '어머니와 아이',
            why: '무조건적 사랑과 친밀한 유대감',
            emotionalConnection: 'SREF의 깊은 감정 표현과 진실한 연결'
          }
        ]
      }
    ]
  },
  {
    personalityType: 'SAMC',
    description: '열정적 표현형 - 강렬한 감정과 개성적 표현을 중시하는 유형',
    coreValues: ['개성', '열정', '감정 표현', '독립성', '창의적 에너지'],
    artists: [
      {
        name: '반 고흐 (Vincent van Gogh)',
        reason: '강렬한 색채와 역동적 붓터치로 내면의 열정을 표현. SAMC의 감정적 강도와 완벽히 일치',
        artworks: [
          {
            title: '별이 빛나는 밤',
            why: '내면의 격정과 우주적 에너지를 시각화',
            emotionalConnection: 'SAMC의 강렬한 내적 에너지와 표현 욕구'
          },
          {
            title: '자화상',
            why: '자신만의 독특한 시각으로 표현한 개성',
            emotionalConnection: '자기 정체성에 대한 강한 의식과 표현 의지'
          },
          {
            title: '해바라기',
            why: '생명력과 에너지의 상징적 표현',
            emotionalConnection: 'SAMC의 열정적이고 긍정적인 생명력'
          }
        ]
      },
      {
        name: '뭉크 (Edvard Munch)',
        reason: '내면의 감정과 심리적 상태를 직접적으로 표현. SAMC의 감정 표현 방식과 일치',
        artworks: [
          {
            title: '절규',
            why: '내적 고뇌와 감정의 극한 상황 표현',
            emotionalConnection: 'SAMC가 느끼는 강렬한 감정의 순간들'
          },
          {
            title: '키스',
            why: '사랑의 열정을 추상적이면서도 강렬하게 표현',
            emotionalConnection: '사랑과 관계에서의 깊은 감정적 몰입'
          }
        ]
      }
    ]
  },
  {
    personalityType: 'LRMC',
    description: '평온한 자연형 - 자연과의 조화와 평온함을 추구하는 유형',
    coreValues: ['평온', '자연', '조화', '균형', '고요한 아름다움'],
    artists: [
      {
        name: '모네 (Claude Monet)',
        reason: '자연의 순간적 아름다움과 빛의 변화를 포착. LRMC의 자연 친화성과 평온 추구와 일치',
        artworks: [
          {
            title: '수련',
            why: '고요한 물 위의 평화롭고 명상적인 분위기',
            emotionalConnection: 'LRMC가 추구하는 내적 평온과 자연과의 일체감'
          },
          {
            title: '인상, 해돋이',
            why: '자연 현상의 순간적 아름다움 포착',
            emotionalConnection: '자연의 미묘한 변화에 대한 섬세한 감수성'
          },
          {
            title: '양산을 든 여인',
            why: '자연 속에서의 여유로운 일상',
            emotionalConnection: '자연과 함께하는 평온한 시간의 소중함'
          }
        ]
      },
      {
        name: '시슬레 (Alfred Sisley)',
        reason: '조용하고 평화로운 풍경을 통해 자연의 고요한 아름다움 표현',
        artworks: [
          {
            title: '루브시엔의 눈',
            why: '설경의 고요하고 순수한 아름다움',
            emotionalConnection: 'LRMC가 느끼는 자연의 정적이고 청정한 매력'
          }
        ]
      }
    ]
  },
  {
    personalityType: 'LAEF',
    description: '창의적 탐구형 - 독창성과 혁신적 사고를 중시하는 유형',
    coreValues: ['창의성', '혁신', '독창성', '지적 탐구', '예술적 실험'],
    artists: [
      {
        name: '세라 (Georges Seurat)',
        reason: '점묘법이라는 혁신적 기법으로 과학과 예술을 결합. LAEF의 탐구정신과 창의적 접근법을 보여줌',
        artworks: [
          {
            title: '그랑드자트 섬의 일요일 오후',
            why: '새로운 기법으로 현실을 재해석',
            emotionalConnection: 'LAEF의 기존 틀을 벗어난 창의적 사고'
          },
          {
            title: '아스니에르에서의 목욕',
            why: '과학적 접근을 통한 예술적 표현',
            emotionalConnection: '논리와 감성을 결합한 독창적 해석'
          }
        ]
      },
      {
        name: '다빈치 (Leonardo da Vinci)',
        reason: '르네상스의 천재로 예술과 과학을 융합. LAEF의 다방면 탐구 정신과 완벽주의 성향',
        artworks: [
          {
            title: '모나리자',
            why: '신비로운 미소로 표현한 인간 심리의 깊이',
            emotionalConnection: 'LAEF가 추구하는 복잡성과 미스터리의 탐구'
          }
        ]
      },
      {
        name: '호쿠사이 (Katsushika Hokusai)',
        reason: '동양적 독창성과 자연에 대한 새로운 시각을 제시',
        artworks: [
          {
            title: '가나가와 앞바다의 거대한 파도',
            why: '자연의 힘을 독창적 구도로 표현',
            emotionalConnection: 'LAEF의 관습적 시각을 벗어난 새로운 관점'
          }
        ]
      }
    ]
  }
];

/**
 * 특정 성격 유형의 매칭 정보 가져오기
 */
export function getPersonalityMapping(personalityType: string): ArtworkMapping | undefined {
  return ARTWORK_PERSONALITY_MAPPINGS.find(mapping => mapping.personalityType === personalityType);
}

/**
 * 모든 매칭 정보 가져오기
 */
export function getAllPersonalityMappings(): ArtworkMapping[] {
  return ARTWORK_PERSONALITY_MAPPINGS;
}