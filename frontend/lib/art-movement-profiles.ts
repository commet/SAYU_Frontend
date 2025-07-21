// APT 기반 예술 사조 프로필 정의
import { ArtMovementProfile, ArtMovement } from '@/types/art-persona-matching';

export const ART_MOVEMENT_PROFILES: Record<ArtMovement, ArtMovementProfile> = {
  RENAISSANCE: {
    movement: 'RENAISSANCE',
    koreanName: '르네상스',
    characteristics: [
      '균형과 조화를 추구하는',
      '인간 중심의 시각',
      '과학적 원근법',
      '고전미의 부활'
    ],
    colorPalette: ['#8B4513', '#DAA520', '#CD853F', '#F4A460', '#DEB887'],
    keywords: ['조화', '균형', '인본주의', '고전', '이상미'],
    description: '완벽한 형태와 균형을 통해 인간의 존엄성을 표현합니다.',
    matchingTraits: {
      social: 30,      // 개인적 명상
      abstract: 20,    // 구상적
      emotional: 40,   // 이성적
      structured: 85   // 체계적
    }
  },
  
  IMPRESSIONISM: {
    movement: 'IMPRESSIONISM',
    koreanName: '인상주의',
    characteristics: [
      '빛과 색의 순간 포착',
      '감각적이고 즉흥적',
      '일상의 아름다움',
      '대기와 분위기'
    ],
    colorPalette: ['#87CEEB', '#FFB6C1', '#E6E6FA', '#F0E68C', '#98FB98'],
    keywords: ['빛', '순간', '감각', '자연', '일상'],
    description: '찰나의 빛과 색채로 순간의 인상을 담아냅니다.',
    matchingTraits: {
      social: 40,
      abstract: 60,
      emotional: 85,
      structured: 30
    }
  },
  
  ABSTRACT: {
    movement: 'ABSTRACT',
    koreanName: '추상주의',
    characteristics: [
      '형태의 해방',
      '순수한 표현',
      '내면의 탐구',
      '실험적 접근'
    ],
    colorPalette: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A1A2E', '#FF006E'],
    keywords: ['자유', '표현', '실험', '내면', '해방'],
    description: '형태의 속박에서 벗어나 순수한 감정과 개념을 표현합니다.',
    matchingTraits: {
      social: 20,
      abstract: 95,
      emotional: 70,
      structured: 15
    }
  },
  
  MINIMALISM: {
    movement: 'MINIMALISM',
    koreanName: '미니멀리즘',
    characteristics: [
      '본질의 추구',
      '단순함의 미학',
      '공간과 여백',
      '명상적 경험'
    ],
    colorPalette: ['#FFFFFF', '#000000', '#F5F5F5', '#808080', '#E0E0E0'],
    keywords: ['간결', '본질', '여백', '정제', '명상'],
    description: '최소한의 요소로 최대한의 의미를 전달합니다.',
    matchingTraits: {
      social: 15,
      abstract: 70,
      emotional: 30,
      structured: 90
    }
  },
  
  POP_ART: {
    movement: 'POP_ART',
    koreanName: '팝아트',
    characteristics: [
      '대중문화의 예술화',
      '밝고 대담한 색상',
      '일상의 아이콘',
      '유머와 아이러니'
    ],
    colorPalette: ['#FF1493', '#00FFFF', '#FFFF00', '#FF69B4', '#32CD32'],
    keywords: ['대중', '일상', '유머', '아이콘', '소비'],
    description: '일상과 대중문화를 예술의 영역으로 끌어올립니다.',
    matchingTraits: {
      social: 85,
      abstract: 40,
      emotional: 65,
      structured: 45
    }
  },
  
  SURREALISM: {
    movement: 'SURREALISM',
    koreanName: '초현실주의',
    characteristics: [
      '무의식의 탐구',
      '꿈과 환상',
      '논리의 전복',
      '상상력의 해방'
    ],
    colorPalette: ['#4B0082', '#8A2BE2', '#9400D3', '#9932CC', '#8B008B'],
    keywords: ['꿈', '무의식', '환상', '상상', '전복'],
    description: '현실을 넘어선 무의식과 꿈의 세계를 탐험합니다.',
    matchingTraits: {
      social: 25,
      abstract: 85,
      emotional: 80,
      structured: 20
    }
  },
  
  BAROQUE: {
    movement: 'BAROQUE',
    koreanName: '바로크',
    characteristics: [
      '극적인 표현',
      '화려한 장식',
      '감정의 극대화',
      '빛과 그림자'
    ],
    colorPalette: ['#8B0000', '#FFD700', '#2F4F4F', '#8B4513', '#B8860B'],
    keywords: ['드라마', '감정', '화려함', '극적', '웅장'],
    description: '극적인 빛과 감정으로 관람자를 압도합니다.',
    matchingTraits: {
      social: 75,
      abstract: 30,
      emotional: 90,
      structured: 65
    }
  },
  
  CUBISM: {
    movement: 'CUBISM',
    koreanName: '입체주의',
    characteristics: [
      '다시점의 통합',
      '형태의 분해',
      '지적인 접근',
      '시공간의 재구성'
    ],
    colorPalette: ['#A0522D', '#BC8F8F', '#F4A460', '#DEB887', '#D2691E'],
    keywords: ['분석', '재구성', '다시점', '해체', '지성'],
    description: '하나의 대상을 여러 시점에서 동시에 바라봅니다.',
    matchingTraits: {
      social: 35,
      abstract: 80,
      emotional: 45,
      structured: 75
    }
  },
  
  ROMANTICISM: {
    movement: 'ROMANTICISM',
    koreanName: '낭만주의',
    characteristics: [
      '감정의 해방',
      '자연과의 교감',
      '개인의 열정',
      '숭고한 경험'
    ],
    colorPalette: ['#FF6347', '#CD5C5C', '#DC143C', '#B22222', '#8B0000'],
    keywords: ['열정', '자연', '감정', '숭고', '개인'],
    description: '이성보다 감정을, 질서보다 열정을 추구합니다.',
    matchingTraits: {
      social: 30,
      abstract: 50,
      emotional: 95,
      structured: 25
    }
  },
  
  MODERNISM: {
    movement: 'MODERNISM',
    koreanName: '모더니즘',
    characteristics: [
      '전통의 거부',
      '새로운 형식',
      '실험적 정신',
      '자의식적 예술'
    ],
    colorPalette: ['#2E4053', '#34495E', '#5D6D7E', '#85929E', '#ABB2B9'],
    keywords: ['혁신', '실험', '거부', '새로움', '자의식'],
    description: '전통을 거부하고 새로운 표현 방식을 탐구합니다.',
    matchingTraits: {
      social: 40,
      abstract: 75,
      emotional: 60,
      structured: 35
    }
  },
  
  CONTEMPORARY: {
    movement: 'CONTEMPORARY',
    koreanName: '현대미술',
    characteristics: [
      '다양성의 포용',
      '경계의 해체',
      '사회적 발언',
      '기술의 활용'
    ],
    colorPalette: ['#00BCD4', '#E91E63', '#FFC107', '#4CAF50', '#9C27B0'],
    keywords: ['다양성', '융합', '비판', '기술', '소통'],
    description: '모든 경계를 넘어 현재를 표현하고 미래를 탐구합니다.',
    matchingTraits: {
      social: 70,
      abstract: 65,
      emotional: 70,
      structured: 40
    }
  },
  
  EXPRESSIONISM: {
    movement: 'EXPRESSIONISM',
    koreanName: '표현주의',
    characteristics: [
      '내면의 분출',
      '감정의 왜곡',
      '원초적 표현',
      '주관적 경험'
    ],
    colorPalette: ['#FF4500', '#FF8C00', '#FF6347', '#DC143C', '#B22222'],
    keywords: ['감정', '내면', '왜곡', '주관', '원초'],
    description: '내면의 감정을 날것 그대로 캔버스에 쏟아냅니다.',
    matchingTraits: {
      social: 25,
      abstract: 70,
      emotional: 100,
      structured: 20
    }
  },
  
  REALISM: {
    movement: 'REALISM',
    koreanName: '사실주의',
    characteristics: [
      '현실의 직시',
      '객관적 관찰',
      '사회적 의식',
      '진실의 추구'
    ],
    colorPalette: ['#8B7355', '#A0522D', '#BC8F8F', '#CD853F', '#DEB887'],
    keywords: ['진실', '현실', '관찰', '객관', '사회'],
    description: '있는 그대로의 현실을 예술로 담아냅니다.',
    matchingTraits: {
      social: 55,
      abstract: 15,
      emotional: 50,
      structured: 80
    }
  },
  
  ART_NOUVEAU: {
    movement: 'ART_NOUVEAU',
    koreanName: '아르누보',
    characteristics: [
      '유기적 형태',
      '자연의 곡선',
      '장식의 통합',
      '우아한 흐름'
    ],
    colorPalette: ['#9ACD32', '#6B8E23', '#BDB76B', '#F0E68C', '#8FBC8F'],
    keywords: ['자연', '곡선', '장식', '우아함', '유기적'],
    description: '자연의 유려한 선으로 삶과 예술을 하나로 만듭니다.',
    matchingTraits: {
      social: 60,
      abstract: 55,
      emotional: 75,
      structured: 60
    }
  },
  
  DIGITAL_ART: {
    movement: 'DIGITAL_ART',
    koreanName: '디지털아트',
    characteristics: [
      '기술과 예술의 융합',
      '무한한 가능성',
      '상호작용성',
      '가상과 현실'
    ],
    colorPalette: ['#00D4FF', '#FF00FF', '#00FF00', '#FFFF00', '#FF0080'],
    keywords: ['기술', '상호작용', '가상', '융합', '미래'],
    description: '디지털 시대의 새로운 감성을 탐구합니다.',
    matchingTraits: {
      social: 65,
      abstract: 75,
      emotional: 60,
      structured: 50
    }
  },
  
  KOREAN_ART: {
    movement: 'KOREAN_ART',
    koreanName: '한국미술',
    characteristics: [
      '전통과 현대의 조화',
      '정신성의 추구',
      '자연과의 합일',
      '여백의 미학'
    ],
    colorPalette: ['#C41E3A', '#0047AB', '#FFFFFF', '#FFD700', '#008080'],
    keywords: ['전통', '정신', '여백', '조화', '자연'],
    description: '한국의 정신과 미감을 현대적으로 재해석합니다.',
    matchingTraits: {
      social: 50,
      abstract: 60,
      emotional: 70,
      structured: 70
    }
  }
};

// APT 점수로부터 가장 적합한 예술 사조 찾기
export function findBestArtMovement(scores: {
  social: number;
  abstract: number;
  emotional: number;
  structured: number;
}): ArtMovement {
  let bestMatch: ArtMovement = 'CONTEMPORARY';
  let lowestDifference = Infinity;
  
  Object.entries(ART_MOVEMENT_PROFILES).forEach(([movement, profile]) => {
    const diff = 
      Math.abs(scores.social - profile.matchingTraits.social) +
      Math.abs(scores.abstract - profile.matchingTraits.abstract) +
      Math.abs(scores.emotional - profile.matchingTraits.emotional) +
      Math.abs(scores.structured - profile.matchingTraits.structured);
    
    if (diff < lowestDifference) {
      lowestDifference = diff;
      bestMatch = movement as ArtMovement;
    }
  });
  
  return bestMatch;
}

// 두 예술 사조 간의 호환성 계산
export function calculateMovementCompatibility(
  movement1: ArtMovement,
  movement2: ArtMovement
): number {
  const profile1 = ART_MOVEMENT_PROFILES[movement1];
  const profile2 = ART_MOVEMENT_PROFILES[movement2];
  
  // 보완적 요소와 유사한 요소의 균형 계산
  const socialDiff = Math.abs(profile1.matchingTraits.social - profile2.matchingTraits.social);
  const abstractDiff = Math.abs(profile1.matchingTraits.abstract - profile2.matchingTraits.abstract);
  const emotionalSimilarity = 100 - Math.abs(profile1.matchingTraits.emotional - profile2.matchingTraits.emotional);
  const structuralBalance = 100 - Math.abs(profile1.matchingTraits.structured - profile2.matchingTraits.structured);
  
  // 사회성과 추상성은 차이가 있어도 좋음 (보완적)
  // 감정과 구조는 비슷할수록 좋음 (유사성)
  const complementaryScore = (socialDiff + abstractDiff) / 2;
  const similarityScore = (emotionalSimilarity + structuralBalance) / 2;
  
  // 균형잡힌 점수 계산
  return (complementaryScore * 0.4 + similarityScore * 0.6);
}