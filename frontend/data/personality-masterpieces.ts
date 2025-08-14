/**
 * 각 성격 유형별 대표 명화
 * APT 카드 배경용으로 사용
 */

export interface PersonalityMasterpiece {
  personalityType: string;
  title: string;
  title_ko: string;
  artist: string;
  artist_ko: string;
  year: string;
  imageUrl: string;
  description: string;
  description_ko: string;
}

export const PERSONALITY_MASTERPIECES: PersonalityMasterpiece[] = [
  {
    personalityType: 'SREF',
    title: 'Dance at Moulin de la Galette',
    title_ko: '물랭 드 라 갈레트에서의 춤',
    artist: 'Pierre-Auguste Renoir',
    artist_ko: '피에르 오귀스트 르누아르',
    year: '1876',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Pierre-Auguste_Renoir%2C_Le_Moulin_de_la_Galette.jpg/1280px-Pierre-Auguste_Renoir%2C_Le_Moulin_de_la_Galette.jpg',
    description: 'A joyful scene of people dancing and socializing in Montmartre',
    description_ko: '몽마르트르에서 사람들이 춤추고 어울리는 즐거운 장면'
  },
  {
    personalityType: 'SAMC', 
    title: 'The Starry Night',
    title_ko: '별이 빛나는 밤',
    artist: 'Vincent van Gogh',
    artist_ko: '빈센트 반 고흐',
    year: '1889',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    description: 'A swirling, emotional portrayal of the night sky',
    description_ko: '소용돌이치는 감정이 담긴 밤하늘의 표현'
  },
  {
    personalityType: 'LRMC',
    title: 'Water Lilies',
    title_ko: '수련',
    artist: 'Claude Monet', 
    artist_ko: '클로드 모네',
    year: '1906',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
    description: 'A serene pond scene capturing the tranquility of nature',
    description_ko: '자연의 고요함을 담은 평화로운 연못 풍경'
  },
  {
    personalityType: 'LAEF',
    title: 'A Sunday on La Grande Jatte',
    title_ko: '그랑드자트 섬의 일요일 오후',
    artist: 'Georges Seurat',
    artist_ko: '조르주 쇠라',
    year: '1886',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1280px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg',
    description: 'A revolutionary pointillist masterpiece showing leisure in the park',
    description_ko: '공원에서의 여가를 점묘법으로 혁신적으로 표현한 걸작'
  }
];

/**
 * 특정 성격 유형의 대표 명화 가져오기
 */
export function getMasterpieceForPersonality(personalityType: string): PersonalityMasterpiece | null {
  return PERSONALITY_MASTERPIECES.find(piece => piece.personalityType === personalityType) || null;
}

/**
 * 모든 유형에 대해 폴백으로 사용할 기본 명화들
 * (현재는 4개 주요 유형만 있지만, 나머지 유형들은 이 중에서 매핑)
 */
export const PERSONALITY_TYPE_TO_MASTERPIECE_MAPPING: Record<string, string> = {
  // SREF 계열
  'SREF': 'SREF',
  'SRFT': 'SREF', 
  'SRPY': 'SREF',
  'SFPY': 'SREF',
  
  // SAMC 계열  
  'SAMC': 'SAMC',
  'WRPY': 'SAMC',
  'WRFT': 'SAMC',
  'WRFU': 'SAMC',
  'WREU': 'SAMC',
  
  // LRMC 계열
  'LRMC': 'LRMC', 
  'DRCU': 'LRMC',
  'DRCY': 'LRMC',
  'DRFT': 'LRMC',
  'DRPU': 'LRMC',
  
  // LAEF 계열
  'LAEF': 'LAEF',
  'LNFT': 'LAEF',
  'LNFU': 'LAEF',
  'LNPY': 'LAEF',
  'LNCU': 'LAEF'
};

/**
 * 어떤 성격 유형이든 대표 명화 반환 (폴백 포함)
 */
export function getMasterpieceForAnyPersonality(personalityType: string): PersonalityMasterpiece {
  const mappedType = PERSONALITY_TYPE_TO_MASTERPIECE_MAPPING[personalityType] || 'SREF';
  const masterpiece = getMasterpieceForPersonality(mappedType);
  return masterpiece || PERSONALITY_MASTERPIECES[0]; // 최종 폴백
}