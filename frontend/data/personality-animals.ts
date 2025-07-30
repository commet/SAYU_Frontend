// 🎨 SAYU Personality Animal Characters
// 16가지 예술 성격 유형별 동물 캐릭터
// 중앙 정의 파일 import
import { SAYU_TYPES, getSAYUType, validateSAYUType } from '@/types/sayu-shared';

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
      '몽환적이고 신비로운',
      '감정적으로 직관적인',
      '고독한 방랑자',
      '숨겨진 의미를 보는'
    ],
    image: '/images/personality-animals/main/fox-laef.png',
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
      '우아하고 세련된',
      '감정의 깊이를 지닌',
      '체계적인 우아함',
      '아름다움을 큐레이팅하는'
    ],
    image: '/images/personality-animals/main/cat-laec.png',
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
      '지혜롭고 관찰력 있는',
      '직관적인 통찰력',
      '밤의 방랑자',
      '어둠 속에서도 보는'
    ],
    image: '/images/personality-animals/main/owl-lamf.png',
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
      '인내심 있고 사려 깊은',
      '체계적인 수집가',
      '지혜를 품은',
      '느리지만 깊이 있는'
    ],
    image: '/images/personality-animals/main/turtle-lamc.png',
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
      '적응력 있는 관찰자',
      '색채에 민감한',
      '예술과 하나되는',
      '조용히 감정적인'
    ],
    image: '/images/personality-animals/main/chameleon-lref.png',
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
      '온화하고 섬세한',
      '감정을 잘 아는',
      '우아한 정밀함',
      '민감한 영혼'
    ],
    image: '/images/personality-animals/main/hedgehog-lrec.png',
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
      '독립적인 탐험가',
      '디지털 네이티브',
      '진실을 찾는',
      '고독한 사냥꾼'
    ],
    image: '/images/personality-animals/main/octopus-lrmf.png',
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
      '체계적인 건축가',
      '지식의 설계자',
      '디테일에 집중하는',
      '연구의 달인'
    ],
    image: '/images/personality-animals/main/beaver-lrmc.png',
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
      '사교적이고 활기찬',
      '감정을 퍼뜨리는',
      '경험을 변화시키는',
      '아름다운 연결'
    ],
    image: '/images/personality-animals/main/butterfly-saef.png',
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
      '사교적 조직가',
      '예술 커뮤니티 빌더',
      '체계적인 네트워킹',
      '그룹의 조화'
    ],
    image: '/images/personality-animals/main/penguin-saec.png',
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
      '영감의 전달자',
      '아이디어 공유자',
      '다채로운 소통가',
      '열정을 퍼뜨리는'
    ],
    image: '/images/personality-animals/main/parrot-samf.png',
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
      '문화의 건축가',
      '커뮤니티 조직가',
      '체계적인 창조자',
      '집단의 지혜'
    ],
    image: '/images/personality-animals/main/deer-samc.png',
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
      '열정적인 관람자',
      '충실한 동반자',
      '감정을 표현하는',
      '기쁨을 전파하는'
    ],
    image: '/images/personality-animals/main/dog-sref.png',
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
      '따뜻한 안내자',
      '보살피는 존재',
      '든든한 동반자',
      '배려하는 교육자'
    ],
    image: '/images/personality-animals/main/duck-srec.png',
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
      '지식의 수호자',
      '기억의 달인',
      '지혜로운 멘토',
      '이야기를 전하는'
    ],
    image: '/images/personality-animals/main/elephant-srmf.png',
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
      '갤러리 큐레이터',
      '미술사 전문가',
      '전시 해설가',
      '시각적 스토리텔러'
    ],
    image: '/images/personality-animals/main/eagle-srmc.png',
    avatar: '/images/personality-animals/avatars/eagle-srmc-avatar.png',
    illustration: '/images/personality-animals/illustrations/eagle-srmc-full.png'
  })
};

// Helper function to get animal by personality type
export const getAnimalByType = (type: string): PersonalityAnimal | null => {
  // Validate type using central definition
  if (!validateSAYUType(type)) {
    console.warn(`Invalid SAYU type: ${type}`);
    return null;
  }
  return personalityAnimals[type] || null;
};

// Get emoji by type for quick display
export const getAnimalEmoji = (type: string): string => {
  const animal = personalityAnimals[type];
  return animal ? animal.emoji : '🎨';
};