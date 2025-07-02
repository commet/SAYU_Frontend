// 🎨 SAYU Complete Chemistry Matrix
// 모든 16x16 유형 간 궁합 데이터

import { calculateChemistry } from './chemistry-calculator';
import { ChemistryData } from './personality-chemistry';

// 궁합 레벨별 템플릿
const chemistryTemplates = {
  platinum: {
    synergy: {
      en: "Perfect complementary balance - your weaknesses become each other's strengths",
      ko: "완벽한 보완 관계 - 서로의 약점이 강점이 되는"
    },
    tips: {
      en: "Embrace your differences - they create magic together",
      ko: "차이를 받아들이세요 - 함께하면 마법이 일어나요"
    }
  },
  gold: {
    synergy: {
      en: "Balanced growth relationship - learning and developing together",
      ko: "균형잡힌 성장 관계 - 함께 배우고 발전하는"
    },
    tips: {
      en: "Keep challenging each other while respecting boundaries",
      ko: "서로를 도전시키되 경계를 존중하세요"
    }
  },
  silver: {
    synergy: {
      en: "Stable companion relationship - comfortable but needs occasional challenges",
      ko: "안정적인 동료 관계 - 편안하지만 가끔 도전이 필요한"
    },
    tips: {
      en: "Step out of comfort zones together occasionally",
      ko: "가끔은 함께 컴포트존을 벗어나보세요"
    }
  },
  bronze: {
    synergy: {
      en: "Learning relationship - effort creates synergy",
      ko: "학습이 필요한 관계 - 노력하면 시너지가 생기는"
    },
    tips: {
      en: "Focus on understanding before judging differences",
      ko: "차이를 판단하기 전에 이해하려 노력하세요"
    }
  }
};

// 모든 유형 조합에 대한 궁합 생성
export function generateCompleteChemistryMatrix(): ChemistryData[] {
  const allTypes = [
    'LAEF', 'LAEC', 'LAMF', 'LAMC',
    'LREF', 'LREC', 'LRMF', 'LRMC',
    'SAEF', 'SAEC', 'SAMF', 'SAMC',
    'SREF', 'SREC', 'SRMF', 'SRMC'
  ];
  
  const matrix: ChemistryData[] = [];
  const processedPairs = new Set<string>();
  
  for (const type1 of allTypes) {
    for (const type2 of allTypes) {
      if (type1 === type2) continue;
      
      // 중복 방지 (A-B와 B-A는 같은 관계)
      const pairKey = [type1, type2].sort().join('-');
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);
      
      const score = calculateChemistry(type1, type2);
      const template = chemistryTemplates[score.level];
      
      // 추천 전시 결정
      let recommendedExhibitions: string[] = [];
      let recommendedExhibitions_ko: string[] = [];
      
      if (score.level === 'platinum') {
        recommendedExhibitions = [
          'Large-scale retrospectives',
          'Immersive installations',
          'Cross-cultural exhibitions',
          'Experimental art spaces'
        ];
        recommendedExhibitions_ko = [
          '대규모 회고전',
          '몰입형 설치작품',
          '문화교류 전시',
          '실험예술 공간'
        ];
      } else if (score.level === 'gold') {
        recommendedExhibitions = [
          'Thematic exhibitions',
          'Contemporary art museums',
          'Artist collaboration shows',
          'Interactive galleries'
        ];
        recommendedExhibitions_ko = [
          '주제별 기획전',
          '현대미술관',
          '작가 협업전',
          '인터랙티브 갤러리'
        ];
      } else if (score.level === 'silver') {
        recommendedExhibitions = [
          'Classic art museums',
          'Photography exhibitions',
          'Small gallery tours',
          'Online virtual tours'
        ];
        recommendedExhibitions_ko = [
          '고전 미술관',
          '사진전',
          '소규모 갤러리 투어',
          '온라인 가상 투어'
        ];
      } else {
        recommendedExhibitions = [
          'Guided museum tours',
          'Art workshops together',
          'Short exhibitions',
          'Outdoor sculpture parks'
        ];
        recommendedExhibitions_ko = [
          '가이드 뮤지엄 투어',
          '함께하는 아트 워크샵',
          '짧은 전시',
          '야외 조각공원'
        ];
      }
      
      // 대화 예시 생성
      const conversationExamples = generateConversationExamples(type1, type2, score.level);
      
      // 궁합 제목 생성
      const title = generateChemistryTitle(type1, type2, score.level);
      
      const chemistryData: ChemistryData = {
        type1,
        type2,
        compatibility: score.level,
        title: title.en,
        title_ko: title.ko,
        synergy: {
          description: template.synergy.en,
          description_ko: template.synergy.ko
        },
        recommendedExhibitions,
        recommendedExhibitions_ko,
        conversationExamples,
        tips: {
          for_type1: template.tips.en,
          for_type1_ko: template.tips.ko,
          for_type2: template.tips.en,
          for_type2_ko: template.tips.ko
        }
      };
      
      matrix.push(chemistryData);
    }
  }
  
  return matrix;
}

// 대화 예시 생성 함수
function generateConversationExamples(
  type1: string, 
  type2: string, 
  level: string
): ChemistryData['conversationExamples'] {
  // L vs S 차원 대화
  if (type1[0] === 'L' && type2[0] === 'S') {
    return [{
      person1: "I need a moment alone with this piece...",
      person1_ko: "이 작품과 잠시 혼자 있고 싶어...",
      person2: "Sure! I'll go chat with the curator and come back",
      person2_ko: "알겠어! 큐레이터와 이야기하고 올게"
    }];
  }
  
  // A vs R 차원 대화
  if (type1[1] === 'A' && type2[1] === 'R') {
    return [{
      person1: "The atmosphere here is so ethereal...",
      person1_ko: "여기 분위기가 정말 몽환적이야...",
      person2: "Yes, and look at the artist's technique in the details",
      person2_ko: "맞아, 그리고 디테일에서 보이는 작가의 기법 좀 봐"
    }];
  }
  
  // E vs M 차원 대화
  if (type1[2] === 'E' && type2[2] === 'M') {
    return [{
      person1: "This makes me feel so nostalgic...",
      person1_ko: "이거 보니까 너무 그리워져...",
      person2: "It represents the artist's childhood memories",
      person2_ko: "이건 작가의 어린 시절 기억을 표현한 거야"
    }];
  }
  
  // F vs C 차원 대화
  if (type1[3] === 'F' && type2[3] === 'C') {
    return [{
      person1: "Let's just wander and see what calls to us",
      person1_ko: "그냥 돌아다니면서 끌리는 걸 보자",
      person2: "I made a route to see everything efficiently",
      person2_ko: "효율적으로 다 볼 수 있는 동선을 짰어"
    }];
  }
  
  // 기본 대화
  return [{
    person1: "What do you think about this?",
    person1_ko: "이거 어떻게 생각해?",
    person2: "It's interesting from my perspective...",
    person2_ko: "내 관점에서는 흥미로운데..."
  }];
}

// 궁합 제목 생성 함수
function generateChemistryTitle(type1: string, type2: string, level: string): { en: string, ko: string } {
  const titles = {
    platinum: {
      'L-S': { en: 'Solitude meets Society', ko: '고독과 사교의 만남' },
      'A-R': { en: 'Abstract meets Concrete', ko: '추상과 구상의 조화' },
      'E-M': { en: 'Emotion meets Meaning', ko: '감정과 의미의 융합' },
      'F-C': { en: 'Flow meets Structure', ko: '흐름과 체계의 균형' },
      'default': { en: 'Perfect Harmony', ko: '완벽한 하모니' }
    },
    gold: {
      'default': { en: 'Golden Balance', ko: '황금 균형' }
    },
    silver: {
      'default': { en: 'Comfortable Companions', ko: '편안한 동행' }
    },
    bronze: {
      'default': { en: 'Growth Opportunity', ko: '성장의 기회' }
    }
  };
  
  // 주요 차이점 찾기
  let key = 'default';
  if (type1[0] !== type2[0]) key = 'L-S';
  else if (type1[1] !== type2[1]) key = 'A-R';
  else if (type1[2] !== type2[2]) key = 'E-M';
  else if (type1[3] !== type2[3]) key = 'F-C';
  
  const levelTitles = titles[level as keyof typeof titles];
  return levelTitles[key as keyof typeof levelTitles] || levelTitles.default;
}

// 전체 매트릭스 export
export const completeChemistryMatrix = generateCompleteChemistryMatrix();