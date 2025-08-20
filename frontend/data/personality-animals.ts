// 🎨 SAYU Personality Animal Characters
// 16가지 예술 성격 유형별 동물 캐릭터
// 중앙 정의 파일 import
import { SAYU_TYPES, getSAYUType, isValidSAYUType } from '@/types/sayu-shared';

export interface PersonalityAnimal {
  type: string;
  animal: string;
  animal_ko: string;
  emoji: string;
  characteristics: string[];
  characteristics_ko: string[];
  image?: string;          // 캐릭터 이미지 경로
  avatar?: string;         // 작은 아바타 이미지
  illustration?: string;   // 상세 일러스트
}

// 중앙 정의에서 가져온 타입들을 사용하여 PersonalityAnimal 생성
const createPersonalityAnimal = (typeCode: string, additionalData: Omit<PersonalityAnimal, 'type' | 'animal' | 'animal_ko' | 'emoji'>): PersonalityAnimal => {
  const centralType = getSAYUType(typeCode);
  return {
    type: centralType.code,
    animal: centralType.animal,
    animal_ko: centralType.animal,
    emoji: centralType.emoji,
    ...additionalData
  };
};

export const personalityAnimals: Record<string, PersonalityAnimal> = {
  LAEF: createPersonalityAnimal('LAEF', {
    characteristics: [
      'Dreamy and mysterious',
      'Emotionally intuitive',
      'Solitary wanderer',
      'Sees hidden meanings'
    ],
    characteristics_ko: [
      '감정의 파장을 읽는',
      '혼자만의 명상적 교감',
      '우연한 발견의 전문가',
      '추상 속 감정을 번역하는'
    ],
    image: '/images/animals/laef.png',
    avatar: '/images/personality-animals/avatars/fox-laef-avatar.png',
    illustration: '/images/personality-animals/illustrations/fox-laef-full.png'
  }),
  LAEC: createPersonalityAnimal('LAEC', {
    characteristics: [
      'Elegant and refined',
      'Emotional depth',
      'Methodical grace',
      'Curates beauty'
    ],
    characteristics_ko: [
      '아름다움을 체계화하는',
      '개인적 미학 수호자',
      '감정을 정제하는 연금술사',
      '완벽주의적 큐레이터'
    ],
    image: '/images/animals/laec.png',
    avatar: '/images/personality-animals/avatars/cat-laec-avatar.png',
    illustration: '/images/personality-animals/illustrations/cat-laec-full.png'
  }),
  LAMF: createPersonalityAnimal('LAMF', {
    characteristics: [
      'Wise and observant',
      'Intuitive insights',
      'Night wanderer',
      'Sees in the dark'
    ],
    characteristics_ko: [
      '작품 속 철학을 읽는',
      '조용한 지혜의 수집가',
      '상징과 은유의 해석자',
      '깊이 있는 의미 탐구자'
    ],
    image: '/images/animals/lamf.png',
    avatar: '/images/personality-animals/avatars/owl-lamf-avatar.png',
    illustration: '/images/personality-animals/illustrations/owl-lamf-full.png'
  }),
  LAMC: createPersonalityAnimal('LAMC', {
    characteristics: [
      'Patient and thoughtful',
      'Systematic collector',
      'Carries wisdom',
      'Slow but profound'
    ],
    characteristics_ko: [
      '시대를 관통하는 아카이브',
      '맥락과 역사의 수호자',
      '체계적 지식 건축가',
      '문화유산의 기록자'
    ],
    image: '/images/animals/lamc.png',
    avatar: '/images/personality-animals/avatars/turtle-lamc-avatar.png',
    illustration: '/images/personality-animals/illustrations/turtle-lamc-full.png'
  }),
  LREF: createPersonalityAnimal('LREF', {
    characteristics: [
      'Adaptive observer',
      'Sensitive to colors',
      'Blends with art',
      'Quietly emotional'
    ],
    characteristics_ko: [
      '색채와 형태의 번역가',
      '예술과 동화되는 자',
      '미묘한 변화를 감지하는',
      '환경에 녹아드는'
    ],
    image: '/images/animals/lref.png',
    avatar: '/images/personality-animals/avatars/chameleon-lref-avatar.png',
    illustration: '/images/personality-animals/illustrations/chameleon-lref-full.png'
  }),
  LREC: createPersonalityAnimal('LREC', {
    characteristics: [
      'Gentle and delicate',
      'Emotionally aware',
      'Graceful precision',
      'Sensitive soul'
    ],
    characteristics_ko: [
      '작품의 감정을 안전하게 품는',
      '세밀한 관찰의 전문가',
      '감정의 보호막을 지닌',
      '섬세한 감상의 기록자'
    ],
    image: '/images/animals/lrec.png',
    avatar: '/images/personality-animals/avatars/hedgehog-lrec-avatar.png',
    illustration: '/images/personality-animals/illustrations/hedgehog-lrec-full.png'
  }),
  LRMF: createPersonalityAnimal('LRMF', {
    characteristics: [
      'Independent explorer',
      'Digital native',
      'Truth seeker',
      'Lone hunter'
    ],
    characteristics_ko: [
      '다차원적 사고의 탐험가',
      '사실과 허구의 경계를 넘나드는',
      '바닥까지 내려가는 분석가',
      '유연한 사고의 마술사'
    ],
    image: '/images/animals/lrmf.png',
    avatar: '/images/personality-animals/avatars/octopus-lrmf-avatar.png',
    illustration: '/images/personality-animals/illustrations/octopus-lrmf-full.png'
  }),
  LRMC: createPersonalityAnimal('LRMC', {
    characteristics: [
      'Methodical builder',
      'Knowledge architect',
      'Detail focused',
      'Research master'
    ],
    characteristics_ko: [
      '지식의 성을 쌌는',
      '자료의 마스터 빌더',
      '논리적 창조의 전문가',
      '체계적 사고의 설계자'
    ],
    image: '/images/animals/lrmc.png',
    avatar: '/images/personality-animals/avatars/beaver-lrmc-avatar.png',
    illustration: '/images/personality-animals/illustrations/beaver-lrmc-full.png'
  }),
  SAEF: createPersonalityAnimal('SAEF', {
    characteristics: [
      'Social and vibrant',
      'Emotion spreader',
      'Transforms experiences',
      'Beautiful connections'
    ],
    characteristics_ko: [
      '감정의 전염성을 품은',
      '시각적 공감각의 창조자',
      '순간의 아름다움을 포착하는',
      '변화와 성장의 상징'
    ],
    image: '/images/animals/saef.png',
    avatar: '/images/personality-animals/avatars/butterfly-saef-avatar.png',
    illustration: '/images/personality-animals/illustrations/butterfly-saef-full.png'
  }),
  SAEC: createPersonalityAnimal('SAEC', {
    characteristics: [
      'Social organizer',
      'Art community builder',
      'Structured networking',
      'Group harmony'
    ],
    characteristics_ko: [
      '예술 커뮤니티의 아키텍트',
      '감정을 체계화하는 디렉터',
      '집단 창의성의 오케스트레이터',
      '질서 속의 시너지 창조자'
    ],
    image: '/images/animals/saec.png',
    avatar: '/images/personality-animals/avatars/penguin-saec-avatar.png',
    illustration: '/images/personality-animals/illustrations/penguin-saec-full.png'
  }),
  SAMF: createPersonalityAnimal('SAMF', {
    characteristics: [
      'Inspiration speaker',
      'Idea sharer',
      'Colorful communicator',
      'Spreads enthusiasm'
    ],
    characteristics_ko: [
      '아이디어의 폴리네이터',
      '다성대 예술 대화의 지휘자',
      '상징과 의미의 통역사',
      '집단 지성의 촉매제'
    ],
    image: '/images/animals/samf.png',
    avatar: '/images/personality-animals/avatars/parrot-samf-avatar.png',
    illustration: '/images/personality-animals/illustrations/parrot-samf-full.png'
  }),
  SAMC: createPersonalityAnimal('SAMC', {
    characteristics: [
      'Cultural architect',
      'Community organizer',
      'Systematic creator',
      'Collective wisdom'
    ],
    characteristics_ko: [
      '문화 역사의 아카이브',
      '집단 기억의 수호자',
      '전통과 혁신의 가교',
      '사회적 의미의 건축가'
    ],
    image: '/images/animals/samc.png',
    avatar: '/images/personality-animals/avatars/deer-samc-avatar.png',
    illustration: '/images/personality-animals/illustrations/deer-samc-full.png'
  }),
  SREF: createPersonalityAnimal('SREF', {
    characteristics: [
      'Enthusiastic viewer',
      'Loyal companion',
      'Emotional expresser',
      'Joy spreader'
    ],
    characteristics_ko: [
      '진실한 예술 동반자',
      '감정의 순수한 공명자',
      '직관적 연결의 매개자',
      '기쁨의 증폭기'
    ],
    image: '/images/animals/sref.png',
    avatar: '/images/personality-animals/avatars/dog-sref-avatar.png',
    illustration: '/images/personality-animals/illustrations/dog-sref-full.png'
  }),
  SREC: createPersonalityAnimal('SREC', {
    characteristics: [
      'Warm guide',
      'Nurturing presence',
      'Steady companion',
      'Caring educator'
    ],
    characteristics_ko: [
      '감정의 안전지대 창조자',
      '예술적 돌봄의 전문가',
      '조화로운 범람성의 책임자',
      '포용적 환경의 조성자'
    ],
    image: '/images/animals/srec.png',
    avatar: '/images/personality-animals/avatars/duck-srec-avatar.png',
    illustration: '/images/personality-animals/illustrations/duck-srec-full.png'
  }),
  SRMF: createPersonalityAnimal('SRMF', {
    characteristics: [
      'Knowledge keeper',
      'Memory master',
      'Wise mentor',
      'Story carrier'
    ],
    characteristics_ko: [
      '집단 기억의 보관자',
      '시각적 스토리텔링의 대가',
      '문화적 맥락의 통역사',
      '생생한 역사의 전달자'
    ],
    image: '/images/animals/srmf.png',
    avatar: '/images/personality-animals/avatars/elephant-srmf-avatar.png',
    illustration: '/images/personality-animals/illustrations/elephant-srmf-full.png'
  }),
  SRMC: createPersonalityAnimal('SRMC', {
    characteristics: [
      'Gallery curator',
      'Art historian',
      'Exhibition guide',
      'Visual storyteller'
    ],
    characteristics_ko: [
      '전체를 보는 높은 시선',
      '체계적 전시 기획의 마스터',
      '교육적 내러티브의 창조자',
      '객관적 분석의 전문가'
    ],
    image: '/images/animals/srmc.png',
    avatar: '/images/personality-animals/avatars/eagle-srmc-avatar.png',
    illustration: '/images/personality-animals/illustrations/eagle-srmc-full.png'
  })
};

// Helper function to get animal by personality type
export const getAnimalByType = (type: string): PersonalityAnimal | null => {
  // Direct lookup without validation to avoid errors
  const animal = personalityAnimals[type];
  
  if (!animal) {
    console.warn(`Animal data not found for type: ${type}. Available types:`, Object.keys(personalityAnimals));
    return null;
  }
  
  return animal;
};

// Get emoji by type for quick display
export const getAnimalEmoji = (type: string): string => {
  const animal = personalityAnimals[type];
  return animal ? animal.emoji : '🎨';
};