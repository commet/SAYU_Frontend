/**
 * SAYU Shared Types - Local copy to replace @sayu/shared imports
 * This file contains all types previously imported from @sayu/shared
 */

// Type definitions from SAYUTypeDefinitions.ts
export interface SAYUType {
  code: string;
  name: string;
  nameEn: string;
  animal: string;
  animalEn: string;
  emoji: string;
  description: string;
  detailedDescription: string;
  artPreferences: {
    preferredStyles: string[];
    preferredSubjects: string[];
    preferredColors: string[];
    viewingStyle: string;
    motivations: string[];
  };
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  challengesEn: string[];
  perfectDay: string;
  famousExample?: string;
  dominantFunction: string;
  inferiorFunction: string;
  consciousFunctions: string[];
  unconsciousFunctions: string[];
}

export interface SAYUFunction {
  code: string;
  name: string;
  axis: 'L/S' | 'A/R' | 'E/M' | 'F/C';
  description: string;
}

// Type for valid SAYU codes
export type SAYUTypeCode = 'LAEF' | 'LAEC' | 'LAMF' | 'LAMC' | 'LREF' | 'LREC' | 'LRMF' | 'LRMC' | 'SAEF' | 'SAEC' | 'SAMF' | 'SAMC' | 'SREF' | 'SREC' | 'SRMF' | 'SRMC';

// Alias for compatibility
export type PersonalityType = SAYUTypeCode;

// SAYU Types data
export const SAYU_TYPES: Record<SAYUTypeCode, SAYUType> = {
  LAEF: {
    code: 'LAEF',
    name: '몽환적 방랑자',
    nameEn: 'Dreamy Wanderer',
    animal: '여우',
    animalEn: 'Fox',
    emoji: '🦊',
    description: '혼자서 추상 작품을 감정적으로 자유롭게 감상',
    detailedDescription: '당신은 예술 속에서 자신만의 비밀스러운 세계를 찾는 사람입니다.',
    artPreferences: {
      preferredStyles: ['추상표현주의', '초현실주의', '미니멀리즘', '인상주의'],
      preferredSubjects: ['추상적 형태', '자연의 추상화', '감정의 시각화', '꿈과 환상'],
      preferredColors: ['부드러운 파스텔', '신비로운 보라', '몽환적 블루', '따뜻한 세피아'],
      viewingStyle: '직관적이고 자유로운 동선으로 감정에 이끌려 관람',
      motivations: ['내면 탐구', '감정적 카타르시스', '영감 추구', '개인적 성찰']
    },
    characteristics: ['독립적', '감성적', '자유로운', '직관적'],
    strengths: ['깊은 감수성', '독창적 해석', '예술적 직감', '몰입력'],
    challenges: ['깊은 감정적 몰입으로 인해 때로는 객관적 거리두기가 필요할 수 있습니다', '직관적 흐름을 따르다 보니 놓치는 작품들이 생길 수 있습니다', '혼자만의 감상에 익숙해 다른 시각을 받아들이는 연습이 도움이 될 수 있습니다'],
    challengesEn: ['Deep emotional immersion may sometimes require objective distancing', 'Following intuitive flow might cause missing some artworks', 'Being accustomed to solitary appreciation could benefit from practicing openness to other perspectives'],
    perfectDay: '조용한 오후, 사람이 적은 전시장에서 혼자만의 시간을 보내며 마음에 드는 작품 앞에서 한참을 서 있는 것',
    famousExample: '반 고흐의 별이 빛나는 밤을 보며 소용돌이 속에서 자신만의 우주를 발견하는 사람',
    dominantFunction: 'Le',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Le', 'Ai', 'Ee', 'Ci'],
    unconsciousFunctions: ['Li', 'Ae', 'Ei', 'Fe']
  },
  LAEC: {
    code: 'LAEC',
    name: '감성 큐레이터',
    nameEn: 'Emotional Curator',
    animal: '고양이',
    animalEn: 'Cat',
    emoji: '🐱',
    description: '혼자서 추상 작품을 감정적으로 체계적으로 감상',
    detailedDescription: '당신은 추상 예술의 감정적 측면을 체계적으로 탐구하는 사람입니다.',
    artPreferences: {
      preferredStyles: ['추상표현주의', '색면추상', '서정추상', '미니멀리즘'],
      preferredSubjects: ['감정의 색채화', '음악적 리듬', '자연의 추상화', '기하학적 감성'],
      preferredColors: ['차분한 그라데이션', '감정적 대비', '섬세한 중간톤', '조화로운 팔레트'],
      viewingStyle: '체계적인 동선으로 각 작품의 감정을 충분히 느끼며 관람',
      motivations: ['감정 분류', '미적 체험', '개인적 아카이브', '감성적 통찰']
    },
    characteristics: ['섬세한', '체계적', '감성적', '분석적'],
    strengths: ['감정의 미묘한 차이 포착', '체계적 감상법', '깊이 있는 이해', '감성적 분석력'],
    challenges: ['때로는 분석적 접근이 순수한 감동을 가릴 수 있어, 첫 인상의 소중함을 기억하면 좋습니다', '체계적 사고가 강점이지만, 가끔은 무작위로 작품을 선택하는 모험도 새로운 발견을 가져다줄 수 있습니다', '감정을 카테고리화하는 능력이 뛰어나지만, 분류할 수 없는 복잡한 감정도 그 자체로 가치 있음을 받아들이면 더욱 풍요로워집니다'],
    challengesEn: ['Analytical approach might sometimes overshadow pure emotional impact, remembering the value of first impressions would be helpful', 'While systematic thinking is a strength, occasional random artwork selection adventures could bring new discoveries', 'Though excellent at categorizing emotions, accepting that unclassifiable complex emotions have value in themselves would bring greater richness'],
    perfectDay: '조용한 미술관에서 추상화 컬렉션을 차례로 감상하며, 각 작품이 주는 감정을 노트에 정리하는 것',
    famousExample: '로스코의 색면 추상화 앞에서 색채가 주는 감정의 층위를 하나하나 분석하며 감상하는 사람',
    dominantFunction: 'Le',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Le', 'Ai', 'Ee', 'Fi'],
    unconsciousFunctions: ['Li', 'Ae', 'Ei', 'Ce']
  },
  LAMF: {
    code: 'LAMF',
    name: '직관적 탐구자',
    nameEn: 'Intuitive Explorer',
    animal: '올빼미',
    animalEn: 'Owl',
    emoji: '🦉',
    description: '혼자서 추상 작품의 의미를 자유롭게 탐구',
    detailedDescription: '당신은 추상 예술 속에 숨겨진 의미와 메시지를 자유롭게 탐구하는 철학적인 감상자입니다.',
    artPreferences: {
      preferredStyles: ['개념미술', '추상표현주의', '초현실주의', '상징주의'],
      preferredSubjects: ['철학적 주제', '존재의 본질', '시간과 공간', '의식의 흐름'],
      preferredColors: ['심오한 색조', '대비가 강한 흑백', '신비로운 색채', '우주적 색상'],
      viewingStyle: '직관이 이끄는 대로 자유롭게 이동하며 깊이 있게 탐구',
      motivations: ['철학적 탐구', '새로운 해석', '지적 자극', '의미 발견']
    },
    characteristics: ['탐구적', '자유로운', '철학적', '개방적'],
    strengths: ['독창적 해석', '깊이 있는 사고', '직관적 통찰', '철학적 접근'],
    challenges: ['깊은 사색에 빠져 때로는 현실적 시간 감각을 잃을 수 있습니다', '하나의 작품에서 너무 많은 의미를 찾다 보니 전체 전시를 다 보지 못할 때가 있습니다', '직관적 흐름이 강점이지만, 가끔은 체계적 접근도 새로운 발견을 가져다줄 수 있습니다'],
    challengesEn: ['Deep contemplation might sometimes cause losing track of realistic time sense', 'Seeking too many meanings in one artwork might prevent seeing the entire exhibition', 'While intuitive flow is a strength, occasional systematic approaches could also bring new discoveries'],
    perfectDay: '시간 제약 없이 추상 예술 전시를 돌며, 마음에 드는 작품 앞에서 한참을 서서 그 의미를 탐구하는 것',
    famousExample: '칸딘스키의 추상화 앞에서 음악과 색채의 공감각적 의미를 자유롭게 탐구하는 사람',
    dominantFunction: 'Le',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Le', 'Ai', 'Me', 'Ci'],
    unconsciousFunctions: ['Li', 'Ae', 'Mi', 'Fe']
  },
  LAMC: {
    code: 'LAMC',
    name: '철학적 수집가',
    nameEn: 'Philosophical Collector',
    animal: '거북이',
    animalEn: 'Turtle',
    emoji: '🐢',
    description: '혼자서 추상 작품의 의미를 체계적으로 정리',
    detailedDescription: '당신은 추상 예술의 철학적 의미를 체계적으로 수집하고 정리하는 사람입니다.',
    artPreferences: {
      preferredStyles: ['개념미술', '미니멀리즘', '구조주의', '포스트모더니즘'],
      preferredSubjects: ['철학적 개념', '사회 비평', '존재론적 탐구', '미학 이론'],
      preferredColors: ['절제된 색상', '모노톤', '개념적 색채', '의도적 색상 사용'],
      viewingStyle: '체계적인 순서로 작품의 개념과 맥락을 파악하며 관람',
      motivations: ['지식 수집', '체계 구축', '철학적 이해', '이론적 정리']
    },
    characteristics: ['체계적', '철학적', '수집가', '분석적'],
    strengths: ['체계적 정리', '깊이 있는 분석', '이론적 이해', '아카이빙 능력'],
    challenges: ['체계적 분석에 집중하다 보니 때로는 작품의 즉각적인 감동을 놓칠 수 있습니다', '완벽한 이해를 추구하다가 하나의 작품에 너무 오래 머물 때가 있습니다', '모든 것을 논리적으로 설명하려 하지만, 때로는 설명할 수 없는 아름다움도 있음을 받아들이면 좋겠습니다'],
    challengesEn: ['Focusing on systematic analysis might sometimes miss the immediate emotional impact of artworks', 'Pursuing perfect understanding might cause lingering too long on a single artwork', 'While trying to explain everything logically, accepting that some beauty is inexplicable would be beneficial'],
    perfectDay: '새로운 개념미술 전시를 체계적으로 관람하고, 집에서 관련 자료를 정리하며 자신만의 해석 체계를 구축하는 것',
    famousExample: '몬드리안의 기하학적 추상화를 보며 신조형주의 이론과 철학적 배경을 체계적으로 정리하는 사람',
    dominantFunction: 'Le',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Le', 'Ai', 'Me', 'Fi'],
    unconsciousFunctions: ['Li', 'Ae', 'Mi', 'Ce']
  },
  LREF: {
    code: 'LREF',
    name: '고독한 관찰자',
    nameEn: 'Solitary Observer',
    animal: '카멜레온',
    animalEn: 'Chameleon',
    emoji: '🦎',
    description: '혼자서 구상 작품을 감정적으로 자유롭게 관찰',
    detailedDescription: '당신은 구상 작품의 세부 사항을 혼자서 천천히 관찰하며 감정적으로 교감하는 사람입니다.',
    artPreferences: {
      preferredStyles: ['사실주의', '인상주의', '낭만주의', '상징주의'],
      preferredSubjects: ['인물의 감정', '자연 풍경', '일상의 순간', '빛과 그림자'],
      preferredColors: ['자연스러운 색조', '감정을 담은 색채', '부드러운 톤', '분위기 있는 색상'],
      viewingStyle: '마음이 끌리는 작품 앞에서 오래 머물며 자유롭게 감상',
      motivations: ['감정적 공감', '내면의 평화', '미적 감동', '개인적 성찰']
    },
    characteristics: ['관찰력', '감성적', '독립적', '자유로운'],
    strengths: ['세밀한 관찰', '감정적 깊이', '독립적 감상', '진정성 있는 경험'],
    challenges: ['깊은 감정적 몰입으로 다른 사람들과 함께 감상하기 어려울 때가 있습니다', '하나의 작품에 오래 머물다 보니 전체 전시를 다 보지 못할 때가 있습니다', '느낌에만 의존하다 보니 작품의 역사적 맥락을 놓칠 수 있어, 가끔은 배경 지식도 도움이 될 수 있습니다'],
    challengesEn: ['Deep emotional immersion might sometimes make it difficult to appreciate art with others', 'Lingering long on one artwork might prevent seeing the entire exhibition', 'Relying only on feelings might miss the historical context of artworks, occasional background knowledge could be helpful'],
    perfectDay: '평일 오전의 한적한 미술관에서 좋아하는 화가의 회고전을 혼자 천천히 감상하는 것',
    famousExample: '베르메르의 진주 귀걸이를 한 소녀 앞에서 그녀의 눈빛에 담긴 이야기를 상상하며 감동받는 사람',
    dominantFunction: 'Le',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Le', 'Ri', 'Ee', 'Ci'],
    unconsciousFunctions: ['Li', 'Re', 'Ei', 'Fe']
  },
  LREC: {
    code: 'LREC',
    name: '섬세한 감정가',
    nameEn: 'Delicate Connoisseur',
    animal: '고슴도치',
    animalEn: 'Hedgehog',
    emoji: '🦔',
    description: '혼자서 구상 작품을 감정적으로 체계적으로 음미',
    detailedDescription: '당신은 구상 예술의 감정적 뉘앙스를 체계적으로 음미하는 섬세한 감상자입니다.',
    artPreferences: {
      preferredStyles: ['세밀화', '초상화', '정물화', '풍속화'],
      preferredSubjects: ['인간의 감정', '일상의 아름다움', '자연의 세부', '빛의 변화'],
      preferredColors: ['섬세한 그라데이션', '따뜻한 색조', '자연스러운 팔레트', '조화로운 색채'],
      viewingStyle: '체계적인 순서로 각 작품의 감정적 깊이를 충분히 음미하며 관람',
      motivations: ['미적 향유', '감정적 풍요', '섬세한 관찰', '깊이 있는 이해']
    },
    characteristics: ['섬세한', '체계적', '감상적', '깊이있는'],
    strengths: ['섬세한 감수성', '체계적 감상', '감정의 깊이', '미적 안목'],
    challenges: ['한 작품에 너무 깊이 몰입하여 전체적인 흐름을 놓칠 때가 있습니다', '익숙한 스타일에만 머물기 쉬운데, 가끔은 새로운 장르도 탐험해보면 좋겠습니다', '완벽한 감상을 추구하다가 때로는 순수한 즐거움을 잊을 수 있으니 가벼운 마음도 필요합니다'],
    challengesEn: ['Too deep immersion in one artwork might sometimes miss the overall flow', 'Tendency to stay with familiar styles, occasional exploration of new genres would be beneficial', 'Pursuing perfect appreciation might sometimes forget pure enjoyment, a lighter heart is also needed'],
    perfectDay: '좋아하는 화가의 전시를 오디오 가이드와 함께 차분히 감상하며, 각 작품의 감동을 마음속에 새기는 것',
    famousExample: '샤르댕의 정물화 앞에서 평범한 사물에 담긴 고요한 아름다움을 섬세하게 음미하는 사람',
    dominantFunction: 'Le',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Le', 'Ri', 'Ee', 'Fi'],
    unconsciousFunctions: ['Li', 'Re', 'Ei', 'Ce']
  },
  LRMF: {
    code: 'LRMF',
    name: '디지털 탐험가',
    nameEn: 'Digital Explorer',
    animal: '문어',
    animalEn: 'Octopus',
    emoji: '🐙',
    description: '혼자서 구상 작품의 의미를 자유롭게 분석',
    detailedDescription: '당신은 구상 예술의 의미와 맥락을 현대적 시각으로 자유롭게 탐구하는 사람입니다.',
    artPreferences: {
      preferredStyles: ['하이퍼리얼리즘', '디지털 아트', '현대 구상', '포토리얼리즘'],
      preferredSubjects: ['현대적 주제', '기술과 인간', '도시 풍경', '미디어 아트'],
      preferredColors: ['선명한 디지털 색상', '고대비', '네온 컬러', '현대적 팔레트'],
      viewingStyle: '디지털 도구를 활용하며 자유롭게 탐색하고 분석',
      motivations: ['새로운 해석', '기술 활용', '정보 탐구', '창의적 분석']
    },
    characteristics: ['분석적', '탐험적', '기술적', '자유로운'],
    strengths: ['기술 활용 능력', '다각도 분석', '정보 수집력', '창의적 접근'],
    challenges: ['자유로운 탐구에 집중하다 보니 때로는 전통적인 감상법을 놓칠 수 있습니다', '논리적 분석에 치중하다 보면 작품의 순수한 감정적 측면을 간과할 수 있습니다', '흥미로운 작품들 사이를 자유롭게 오가다 보니 하나의 작품을 깊이 있게 감상하는 시간이 부족할 때가 있습니다'],
    challengesEn: ['Focusing on free exploration might sometimes miss traditional appreciation methods', 'Emphasizing logical analysis might overlook the pure emotional aspects of artworks', 'Freely moving between interesting artworks might sometimes lack time for deep appreciation of a single piece'],
    perfectDay: '최신 미디어 아트 전시에서 인터랙티브 작품을 체험하고, 온라인으로 추가 정보를 탐색하는 것',
    famousExample: '데이비드 호크니의 디지털 작품을 태블릿으로 확대하며 새로운 디테일을 발견하는 사람',
    dominantFunction: 'Le',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Le', 'Ri', 'Me', 'Ci'],
    unconsciousFunctions: ['Li', 'Re', 'Mi', 'Fe']
  },
  LRMC: {
    code: 'LRMC',
    name: '학구적 연구자',
    nameEn: 'Academic Researcher',
    animal: '비버',
    animalEn: 'Beaver',
    emoji: '🦫',
    description: '혼자서 구상 작품의 의미를 체계적으로 연구',
    detailedDescription: '당신은 예술을 단순히 감상하는 것을 넘어서 깊이 이해하고 분석하려는 사람입니다.',
    artPreferences: {
      preferredStyles: ['고전주의', '르네상스', '바로크', '리얼리즘', '역사화'],
      preferredSubjects: ['역사적 장면', '종교화', '초상화', '정물화', '기법이 뛰어난 작품'],
      preferredColors: ['클래식한 색조', '균형 잡힌 색상', '전통적 팔레트'],
      viewingStyle: '체계적인 순서대로 각 작품을 충분한 시간을 들여 분석하며 관람',
      motivations: ['지식 축적', '학술적 이해', '기법 분석', '역사적 맥락 파악']
    },
    characteristics: ['학구적', '체계적', '연구적', '정밀한'],
    strengths: ['분석적 사고', '체계적 접근', '전문 지식', '집중력'],
    challenges: ['체계적 연구에 몰입하다 보니 때로는 작품의 직관적 감상을 놓칠 수 있습니다', '완벽한 이해를 추구하다가 하나의 작품에 너무 오래 머물 때가 있습니다', '전통적 기법에 집중하느라 가끔은 실험적이고 현대적인 작품을 간과할 수 있습니다'],
    challengesEn: ['Immersion in systematic research might sometimes miss intuitive appreciation of artworks', 'Pursuing perfect understanding might cause lingering too long on one artwork', 'Focusing on traditional techniques might sometimes overlook experimental and contemporary artworks'],
    perfectDay: '새로운 고전 회화 전시에서 오디오 가이드를 들으며 꼼꼼히 관람하고, 집에서 관련 도서를 찾아 더 깊이 공부하는 것',
    famousExample: '미켈란젤로의 다비드상 앞에서 조각 기법과 르네상스 배경을 자세히 설명할 수 있는 사람',
    dominantFunction: 'Le',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Le', 'Ri', 'Me', 'Fi'],
    unconsciousFunctions: ['Li', 'Re', 'Mi', 'Ce']
  },
  SAEF: {
    code: 'SAEF',
    name: '감정의 물결',
    nameEn: 'The Emotional Current',
    animal: '나비',
    animalEn: 'Butterfly',
    emoji: '🦋',
    description: '함께 추상 작품의 감정을 자유롭게 나눔',
    detailedDescription: '당신은 예술 앞에서 느낀 감동을 혼자 간직하기보다는 주변 사람들과 나누고 싶어하는 사람입니다.',
    artPreferences: {
      preferredStyles: ['추상표현주의', '팝아트', '컬러필드', '설치미술'],
      preferredSubjects: ['감정의 색채', '인간 관계', '사회적 메시지', '상호작용 작품'],
      preferredColors: ['화려한 원색', '대비가 강한 색상', '감정적 색조', '활기찬 톤'],
      viewingStyle: '친구들과 함께 자유롭게 돌아다니며 즉석에서 감상을 나누는 스타일',
      motivations: ['감정 공유', '사회적 연결', '새로운 관점 발견', '영감 전파']
    },
    characteristics: ['사교적', '감성적', '나눔', '자유로운'],
    strengths: ['소통 능력', '감정 표현', '분위기 조성', '공감 능력'],
    challenges: ['함께하는 감상에 집중하다 보니 혼자만의 깊은 사색 시간이 부족할 수 있습니다', '즉석에서 느끼는 감정을 중시하다 보니 작품의 기법적 분석은 상대적으로 적을 수 있습니다', '다양한 작품에 흥미를 보이다 보니 하나의 작품에 오래 집중하기 어려울 때가 있습니다'],
    challengesEn: ['Focusing on shared appreciation might lack time for personal deep contemplation', 'Emphasizing immediate emotional responses might result in relatively less technical analysis of artworks', 'Showing interest in various artworks might make it difficult to concentrate long on a single piece'],
    perfectDay: '친한 친구들과 함께 새로운 전시를 보며 작품마다 서로의 느낌을 나누고, 카페에서 그 여운을 이야기하는 것',
    famousExample: '워홀의 팝아트 앞에서 "이 색상이 너무 좋지 않아?"라며 친구들과 자연스럽게 대화를 시작하는 사람',
    dominantFunction: 'Se',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Se', 'Ai', 'Ee', 'Ci'],
    unconsciousFunctions: ['Si', 'Ae', 'Ei', 'Fe']
  },
  SAEC: {
    code: 'SAEC',
    name: '감정의 건축가',
    nameEn: 'The Emotional Architect',
    animal: '펭귄',
    animalEn: 'Penguin',
    emoji: '🐧',
    description: '함께 추상 작품의 감정을 체계적으로 공유',
    detailedDescription: '당신은 추상 예술이 주는 감동을 체계적으로 조직하여 다른 사람들과 나누는 것을 좋아합니다.',
    artPreferences: {
      preferredStyles: ['컬러필드', '추상표현주의', '옵아트', '키네틱 아트'],
      preferredSubjects: ['집단 감정', '사회적 메시지', '공감각적 경험', '상호작용'],
      preferredColors: ['공감을 이끄는 색상', '따뜻한 색조', '활기찬 팔레트', '조화로운 색채'],
      viewingStyle: '그룹과 함께 체계적인 일정으로 감상을 공유하며 관람',
      motivations: ['커뮤니티 구축', '감정 공유', '네트워킹', '집단 경험']
    },
    characteristics: ['네트워킹', '체계적', '감성적', '연결'],
    strengths: ['조직력', '소통 능력', '감정 전달력', '커뮤니티 구축'],
    challenges: ['그룹 활동에 집중하다 보니 개인적인 감상 시간이 부족할 수 있습니다', '체계적 공유에 중점을 두다 보니 개인적 깊이 있는 분석은 상대적으로 적을 수 있습니다', '완벽한 네트워킹을 추구하다 보니 즉흥적인 교류의 즐거움을 놓칠 수 있습니다'],
    challengesEn: ['Focusing on group activities may sometimes limit personal contemplation time', 'Emphasizing systematic sharing might occasionally reduce opportunities for deep personal analysis', 'Pursuing perfect networking structures may sometimes miss the joy of spontaneous connections'],
    perfectDay: '예술 동호회 친구들과 함께 새로운 추상화 전시를 보고, 체계적으로 준비한 감상 나눔 시간을 갖는 것',
    famousExample: '이우환의 점과 선 시리즈를 보며 관람객들과 자연스럽게 미니멀리즘의 감성을 나누는 사람',
    dominantFunction: 'Se',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Se', 'Ai', 'Ee', 'Fi'],
    unconsciousFunctions: ['Si', 'Ae', 'Ei', 'Ce']
  },
  SAMF: {
    code: 'SAMF',
    name: '의미의 직조자',
    nameEn: 'The Meaning Weaver',
    animal: '앵무새',
    animalEn: 'Parrot',
    emoji: '🦜',
    description: '함께 추상 작품의 의미를 자유롭게 전파',
    detailedDescription: '당신은 추상 예술에서 받은 영감을 열정적으로 전파하는 예술 전도사입니다.',
    artPreferences: {
      preferredStyles: ['액션 페인팅', '네오 표현주의', '그래피티 아트', '실험적 추상'],
      preferredSubjects: ['에너지와 움직임', '영감과 창조', '자유로운 표현', '혁신적 시도'],
      preferredColors: ['강렬한 원색', '에너지 넘치는 색상', '대담한 대비', '생동감 있는 팔레트'],
      viewingStyle: '열정적으로 돌아다니며 영감을 받은 작품을 즉시 공유',
      motivations: ['영감 전파', '창의성 자극', '예술 전도', '열정 공유']
    },
    characteristics: ['전파력', '영감적', '자유로운', '열정적'],
    strengths: ['전달력', '열정', '영감 전파', '창의적 해석'],
    challenges: ['자유로운 영감 전파에 집중하다 보니 체계적 접근이 부족할 수 있습니다', '열정적 전달에 중점을 두다 보니 깊이 있는 분석은 상대적으로 적을 수 있습니다', '개인적 해석을 중시하다 보니 가끔은 객관적 시각도 고려하면 좋겠습니다'],
    challengesEn: ['Focusing on free inspiration spreading might lack systematic approaches', 'Emphasizing passionate delivery might result in relatively less in-depth analysis', 'Valuing personal interpretation might benefit from considering objective perspectives occasionally'],
    perfectDay: '흥미로운 추상 예술 전시에서 다양한 사람들과 만나 작품에 대한 영감을 나누며 새로운 시각을 발견하는 것',
    famousExample: '잭슨 폴록의 드립 페인팅 앞에서 작품의 에너지와 자유로움을 열정적으로 설명하는 사람',
    dominantFunction: 'Se',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Se', 'Ai', 'Me', 'Ci'],
    unconsciousFunctions: ['Si', 'Ae', 'Mi', 'Fe']
  },
  SAMC: {
    code: 'SAMC',
    name: '지혜의 건축가',
    nameEn: 'The Wisdom Architect',
    animal: '사슴',
    animalEn: 'Deer',
    emoji: '🦌',
    description: '함께 추상 작품의 의미를 체계적으로 기획',
    detailedDescription: '당신은 추상 예술의 의미와 가치를 체계적으로 기획하여 대중에게 전달하는 문화 매개자입니다.',
    artPreferences: {
      preferredStyles: ['개념미술', '설치미술', '미디어 아트', '공공미술'],
      preferredSubjects: ['사회적 주제', '문화적 맥락', '교육적 가치', '참여형 예술'],
      preferredColors: ['의미 있는 색채', '문화적 상징색', '조화로운 구성', '접근하기 쉬운 팔레트'],
      viewingStyle: '체계적인 기획으로 그룹의 이해도를 높이며 관람',
      motivations: ['문화 확산', '교육적 영향', '체계적 전달', '커뮤니티 발전']
    },
    characteristics: ['기획력', '체계적', '문화적', '조직적'],
    strengths: ['기획 능력', '조직력', '교육적 접근', '문화적 통찰'],
    challenges: ['체계적 기획에 집중하다 보니 즉흥적 감상이 부족할 수 있습니다', '그룹 경험 설계에 중점을 두다 보니 개인적 감상 시간이 적을 수 있습니다', '완벽한 구조를 추구하다 보니 가끔은 자유로운 흐름도 필요할 수 있습니다'],
    challengesEn: ['Focusing on systematic planning might lack spontaneous appreciation', 'Emphasizing group experience design might have less time for personal appreciation', 'Pursuing perfect structure might sometimes need free-flowing experiences as well'],
    perfectDay: '직접 기획한 추상 예술 워크샵에서 참가자들이 작품을 새롭게 이해하고 즐거워하는 모습을 보는 것',
    famousExample: '백남준의 비디오 아트를 체계적인 프로그램으로 기획하여 대중에게 미디어 아트의 의미를 전달하는 사람',
    dominantFunction: 'Se',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Se', 'Ai', 'Me', 'Fi'],
    unconsciousFunctions: ['Si', 'Ae', 'Mi', 'Ce']
  },
  SREF: {
    code: 'SREF',
    name: '마음의 여행자',
    nameEn: 'The Heart Wanderer',
    animal: '강아지',
    animalEn: 'Dog',
    emoji: '🐕',
    description: '함께 구상 작품을 감정적으로 자유롭게 즐김',
    detailedDescription: '당신은 친구들과 함께 구상 예술을 보며 즉각적인 감동과 즐거움을 나누는 열정적인 관람자입니다.',
    artPreferences: {
      preferredStyles: ['인상주의', '팝아트', '일러스트레이션', '스트리트 아트'],
      preferredSubjects: ['생동감 있는 장면', '즐거운 일상', '밝은 풍경', '유머러스한 작품'],
      preferredColors: ['밝고 화사한 색상', '생기 있는 원색', '따뜻한 톤', '즐거운 색채'],
      viewingStyle: '친구들과 자유롭게 돌아다니며 감동을 즉시 나누는 스타일',
      motivations: ['즐거운 경험', '감정 공유', '사회적 연결', '순간의 감동']
    },
    characteristics: ['열정적', '사교적', '즐거운', '자유로운'],
    strengths: ['즉각적 반응', '감염력 있는 열정', '사교성', '긍정적 에너지'],
    challenges: ['즉각적 반응을 중시하다 보니 깊이 있는 감상이 부족할 수 있습니다', '열정적 소통에 집중하다 보니 집중적 관찰 시간이 적을 수 있습니다', '활발한 소통을 중시하다 보니 가끔은 조용한 감상도 필요할 수 있습니다'],
    challengesEn: ['Valuing immediate reactions might lack deep appreciation', 'Focusing on passionate communication might have less time for concentrated observation', 'Emphasizing active communication might sometimes need quiet appreciation as well'],
    perfectDay: '좋아하는 사람들과 함께 재미있는 전시를 보며 웃고 즐기고, 전시 후 함께 맛있는 식사를 하는 것',
    famousExample: '뱅크시의 풍자적 작품을 보며 친구들과 함께 크게 웃고 사진을 찍으며 즐기는 사람',
    dominantFunction: 'Se',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Se', 'Ri', 'Ee', 'Ci'],
    unconsciousFunctions: ['Si', 'Re', 'Ei', 'Fe']
  },
  SREC: {
    code: 'SREC',
    name: '감정의 치유사',
    nameEn: 'The Emotional Healer',
    animal: '오리',
    animalEn: 'Duck',
    emoji: '🦆',
    description: '함께 구상 작품을 감정적으로 체계적으로 안내',
    detailedDescription: '당신은 구상 예술의 감동을 따뜻하고 체계적으로 전달하는 안내자입니다.',
    artPreferences: {
      preferredStyles: ['인물화', '풍경화', '풍속화', '서정적 사실주의'],
      preferredSubjects: ['따뜻한 인간 이야기', '아름다운 자연', '일상의 감동', '가족과 사랑'],
      preferredColors: ['따뜻한 색조', '부드러운 파스텔', '편안한 색상', '조화로운 톤'],
      viewingStyle: '동행자를 배려하며 체계적으로 감동을 나누는 관람',
      motivations: ['감동 전달', '따뜻한 소통', '배려심', '공동체 경험']
    },
    characteristics: ['안내력', '따뜻한', '체계적', '배려'],
    strengths: ['공감 능력', '세심한 배려', '체계적 안내', '따뜻한 소통'],
    challenges: ['다른 사람을 배려하다 보니 자신의 의견 표현이 부족할 수 있습니다', '그룹 안내에 집중하다 보니 개인적 감상 시간이 적을 수 있습니다', '모든 사람을 만족시키려 하다 보니 가끔은 자신의 페이스도 중요함을 기억하면 좋겠습니다'],
    challengesEn: ['Caring for others might lack expression of personal opinions', 'Focusing on group guidance might have less time for personal appreciation', 'Trying to satisfy everyone might benefit from remembering the importance of personal pace'],
    perfectDay: '가족이나 친구들과 함께 전시를 보며, 각자의 페이스에 맞춰 따뜻하게 작품을 설명하고 감동을 나누는 것',
    famousExample: '르누아르의 행복한 가족 그림 앞에서 작품의 따뜻함을 정성스럽게 설명하며 함께 미소 짓는 사람',
    dominantFunction: 'Se',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Se', 'Ri', 'Ee', 'Fi'],
    unconsciousFunctions: ['Si', 'Re', 'Ei', 'Ce']
  },
  SRMF: {
    code: 'SRMF',
    name: '문화의 시간여행자',
    nameEn: 'The Cultural Time Traveler',
    animal: '코끼리',
    animalEn: 'Elephant',
    emoji: '🐘',
    description: '함께 구상 작품의 의미를 자유롭게 가르침',
    detailedDescription: '당신은 풍부한 지식과 경험을 바탕으로 구상 예술의 의미를 자유롭게 전달하는 멘토입니다.',
    artPreferences: {
      preferredStyles: ['고전 회화', '역사화', '종교화', '신화 주제'],
      preferredSubjects: ['역사적 사건', '신화와 전설', '철학적 주제', '인류의 지혜'],
      preferredColors: ['고전적 색채', '상징적 색상', '깊이 있는 톤', '의미를 담은 팔레트'],
      viewingStyle: '자유롭게 이동하며 깊이 있는 지식을 흥미롭게 전달',
      motivations: ['지식 전수', '영감 제공', '자유로운 교육', '지혜 공유']
    },
    characteristics: ['가르침', '지식', '자유로운', '멘토링'],
    strengths: ['풍부한 지식', '자유로운 전달', '영감 제공', '멘토링 능력'],
    challenges: ['자유로운 전달 방식에 집중하다 보니 체계적 구성이 부족할 수 있습니다', '풍부한 지식을 나누다 보니 가끔은 핵심에 집중하는 것도 필요할 수 있습니다', '역사적 맥락에 치중하다 보니 현대적 관점의 새로운 해석을 놓칠 수 있습니다'],
    challengesEn: ['Focusing on free delivery style might lack systematic organization', 'Sharing abundant knowledge might sometimes need focus on the essence', 'Emphasizing historical context might occasionally miss contemporary perspectives and new interpretations'],
    perfectDay: '젊은 예술 애호가들과 함께 고전 명화를 보며 자유롭게 이야기하고, 그들이 새로운 통찰을 얻는 것을 보는 것',
    famousExample: '라파엘로의 아테네 학당 앞에서 각 철학자들의 이야기를 재미있게 풀어내며 청중을 매료시키는 사람',
    dominantFunction: 'Se',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Se', 'Ri', 'Me', 'Ci'],
    unconsciousFunctions: ['Si', 'Re', 'Mi', 'Fe']
  },
  SRMC: {
    code: 'SRMC',
    name: '마스터 도슨트',
    nameEn: 'The Master Docent',
    animal: '독수리',
    animalEn: 'Eagle',
    emoji: '🦅',
    description: '함께 구상 작품의 의미를 체계적으로 교육',
    detailedDescription: '당신은 예술에 대한 깊은 지식을 다른 사람들과 체계적으로 나누는 것을 좋아하는 사람입니다.',
    artPreferences: {
      preferredStyles: ['고전주의', '인상주의', '포스트 인상주의', '모던 아트'],
      preferredSubjects: ['교육적 가치가 있는 작품', '기법이 뛰어난 작품', '역사적 의미', '문화적 맥락'],
      preferredColors: ['조화로운 색상', '전통적 팔레트', '의미가 있는 색채'],
      viewingStyle: '그룹을 이끌며 체계적인 순서로 핵심 작품들을 설명하며 관람',
      motivations: ['지식 전달', '교육적 영향', '문화 확산', '집단 학습']
    },
    characteristics: ['교육적', '체계적', '조직적', '전문적'],
    strengths: ['설명 능력', '리더십', '조직력', '지식 전달'],
    challenges: ['교육적 역할에 집중하다 보니 개인적 감상 시간이 부족할 수 있습니다', '완벽한 설명을 추구하다 보니 가끔은 여유로운 감상도 필요할 수 있습니다', '전문성을 중시하다 보니 감정적 공감의 순간을 놓칠 수 있습니다'],
    challengesEn: ['Focusing on educational role might lack time for personal appreciation', 'Pursuing perfect explanations might sometimes need leisurely appreciation as well', 'Emphasizing expertise might occasionally miss moments of emotional empathy'],
    perfectDay: '친구들이나 가족과 함께 미술관에 가서 가이드 역할을 하며, 모두가 예술을 더 잘 이해하게 되는 것을 보는 것',
    famousExample: '모네의 수련 연작 앞에서 인상주의 기법과 빛의 변화를 체계적으로 설명하며 듣는 사람들이 "아!"하고 깨닫게 만드는 사람',
    dominantFunction: 'Se',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Se', 'Ri', 'Me', 'Fi'],
    unconsciousFunctions: ['Si', 'Re', 'Mi', 'Ce']
  }
};

// Validation functions
export function isValidSAYUType(typeCode: string): typeCode is SAYUTypeCode {
  return typeCode in SAYU_TYPES;
}

export function validateSAYUType(typeCode: string): asserts typeCode is SAYUTypeCode {
  if (!isValidSAYUType(typeCode)) {
    throw new Error(`Invalid SAYU type code: ${typeCode}. Valid codes are: ${Object.keys(SAYU_TYPES).join(', ')}`);
  }
}

export function getSAYUType(typeCode: string): SAYUType {
  validateSAYUType(typeCode);
  return SAYU_TYPES[typeCode];
}

// Easter Egg types
export interface EasterEgg {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  trigger: 'action' | 'time' | 'sequence' | 'command' | 'random';
  condition: EasterEggCondition;
  reward: EasterEggReward;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  discoveredCount?: number;
  firstDiscoveredBy?: string;
  hints?: string[];
}

export interface EasterEggCondition {
  type: string;
  value: any;
  checkFunction?: (context: any) => boolean;
}

export interface EasterEggReward {
  type: 'badge' | 'title' | 'feature' | 'experience';
  id: string;
  data?: any;
}

export interface Badge {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  icon: string;
  category: 'knowledge' | 'exploration' | 'emotion' | 'special';
  tier: 1 | 2 | 3;
  points: number;
}

export interface UserEasterEggProgress {
  userId: string;
  discoveredEggs: string[];
  badges: string[];
  titles: string[];
  totalPoints: number;
  lastDiscoveryAt?: Date;
  statistics: {
    totalDiscoveries: number;
    commonDiscoveries: number;
    rareDiscoveries: number;
    epicDiscoveries: number;
    legendaryDiscoveries: number;
  };
}

// Easter Egg Constants
export const ACTION_EASTER_EGGS: EasterEgg[] = [];
export const TIME_EASTER_EGGS: EasterEgg[] = [];
export const COMMAND_EASTER_EGGS: EasterEgg[] = [];

export function getBadgeById(id: string): Badge | undefined {
  // Implementation needed based on your badge data
  return undefined;
}

export function checkEasterEgg(easterEgg: EasterEgg, context: any): boolean {
  if (easterEgg.condition.checkFunction) {
    return easterEgg.condition.checkFunction(context);
  }
  return false;
}

export function getAllEasterEggs(): EasterEgg[] {
  return [...ACTION_EASTER_EGGS, ...TIME_EASTER_EGGS, ...COMMAND_EASTER_EGGS];
}

export function getEasterEggById(id: string): EasterEgg | undefined {
  return getAllEasterEggs().find(egg => egg.id === id);
}

export function calculateUserPoints(badgeIds: string[]): number {
  return badgeIds.reduce((total, badgeId) => {
    const badge = getBadgeById(badgeId);
    return total + (badge?.points || 0);
  }, 0);
}

export function getUserTitle(points: number): { title: string; titleKo: string } {
  if (points >= 500) return { title: 'SAYU Master', titleKo: 'SAYU 마스터' };
  if (points >= 300) return { title: 'Art Guardian', titleKo: '예술의 수호자' };
  if (points >= 200) return { title: 'Gallery Curator', titleKo: '갤러리 큐레이터' };
  if (points >= 100) return { title: 'Art Explorer', titleKo: '예술 탐험가' };
  if (points >= 50) return { title: 'Art Enthusiast', titleKo: '예술 애호가' };
  return { title: 'Art Beginner', titleKo: '예술 입문자' };
}

// Emotion types
export type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'love' | 'surprise' | 'calm' | 'excitement' | 'wonder' | 'melancholy' | 'contemplation' | 'nostalgia' | 'awe' | 'serenity' | 'passion' | 'mystery' | 'hope';

export interface EmotionDistribution {
  emotion: EmotionType;
  count: number;
  percentage: number;
}

export interface EmotionBubble {
  id?: string;
  emotion: EmotionType;
  x: number;
  y: number;
  size: number;
  radius: number;
  velocity: { x: number; y: number };
  vx: number;
  vy: number;
  intensity?: number;
  opacity?: number;
  userId?: string;
  timestamp?: number;
}

export interface EmotionConfig {
  color: string;
  label: string;
  icon?: string;
  name?: string;
  description?: string;
  bgColor?: string;
  ringColor?: string;
}

export const EMOTION_CONFIGS: Record<EmotionType, EmotionConfig> = {
  joy: { color: '#FFD93D', label: 'Joy', icon: '😊', name: 'Joy', description: 'Feeling of happiness and delight' },
  sadness: { color: '#6C5CE7', label: 'Sadness', icon: '😢', name: 'Sadness', description: 'Feeling of sorrow or unhappiness' },
  anger: { color: '#FF6B6B', label: 'Anger', icon: '😠', name: 'Anger', description: 'Feeling of strong displeasure' },
  fear: { color: '#A8E6CF', label: 'Fear', icon: '😰', name: 'Fear', description: 'Feeling of anxiety or apprehension' },
  love: { color: '#FF8B94', label: 'Love', icon: '❤️', name: 'Love', description: 'Feeling of deep affection' },
  surprise: { color: '#4ECDC4', label: 'Surprise', icon: '😮', name: 'Surprise', description: 'Feeling of unexpected wonder' },
  calm: { color: '#95E1D3', label: 'Calm', icon: '😌', name: 'Calm', description: 'Feeling of peace and tranquility' },
  excitement: { color: '#F38181', label: 'Excitement', icon: '🤩', name: 'Excitement', description: 'Feeling of enthusiasm and energy' },
  wonder: { color: '#B794F4', label: 'Wonder', icon: '🤔', name: 'Wonder', description: 'Feeling of curiosity and amazement' },
  melancholy: { color: '#718096', label: 'Melancholy', icon: '😔', name: 'Melancholy', description: 'Feeling of pensive sadness' },
  contemplation: { color: '#4FD1C5', label: 'Contemplation', icon: '🧐', name: 'Contemplation', description: 'Deep reflective thought' },
  nostalgia: { color: '#F6AD55', label: 'Nostalgia', icon: '🥺', name: 'Nostalgia', description: 'Sentimental longing for the past' },
  awe: { color: '#FC8181', label: 'Awe', icon: '😲', name: 'Awe', description: 'Feeling of reverent wonder' },
  serenity: { color: '#9F7AEA', label: 'Serenity', icon: '😇', name: 'Serenity', description: 'State of being calm and peaceful' },
  passion: { color: '#F687B3', label: 'Passion', icon: '🔥', name: 'Passion', description: 'Intense enthusiasm or desire' },
  mystery: { color: '#667EEA', label: 'Mystery', icon: '🎭', name: 'Mystery', description: 'Feeling of intrigue and curiosity' },
  hope: { color: '#48BB78', label: 'Hope', icon: '🌟', name: 'Hope', description: 'Feeling of expectation and desire' }
};