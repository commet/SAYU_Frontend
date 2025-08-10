/**
 * SREF 유형을 위한 큐레이션된 12개 작품
 * 실제 고품질 이미지 URL과 완전한 메타데이터
 * 모든 이미지는 Wikimedia Commons Public Domain
 */

export interface SREFArtwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  museum: string;
  medium: string;
  dimensions?: string;
  description: string;
  personalityResonance: string;
  matchPercent: number;
  isPublicDomain: boolean;
  license: 'Public Domain' | 'CC0';
  tags: string[];
}

// Export both the array and the function
export const SREF_CURATED_ARTWORKS: SREFArtwork[] = [
  // === Primary: Renoir (5개) - 인간관계와 따뜻함의 대가 ===
  {
    id: 'sref-renoir-1',
    title: 'Dance at Moulin de la Galette',
    artist: 'Pierre-Auguste Renoir',
    year: '1876',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Auguste_Renoir_-_Dance_at_le_Moulin_de_la_Galette_-_Musée_d%27Orsay_RF_2739_%28HR%29.jpg',
    museum: 'Musée d\'Orsay, Paris',
    medium: 'Oil on canvas',
    dimensions: '131 × 175 cm',
    description: '몽마르트르의 야외 무도회에서 사람들이 자연스럽게 어울리며 춤추고 대화하는 모습. 햇빛이 나뭇잎 사이로 스며들어 따뜻한 분위기를 자아냅니다.',
    personalityResonance: 'SREF의 핵심 - 자연스러운 인간관계와 공동체에서의 순수한 기쁨. 사람들과 함께할 때 가장 행복한 SREF의 본성을 완벽하게 담고 있습니다.',
    matchPercent: 98,
    isPublicDomain: true,
    license: 'Public Domain',
    tags: ['community', 'joy', 'social', 'natural_light', 'impressionism']
  },
  {
    id: 'sref-renoir-2',
    title: 'Two Sisters (On the Terrace)',
    artist: 'Pierre-Auguste Renoir',
    year: '1881',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Pierre-Auguste_Renoir%2C_Two_Sisters_%28On_the_Terrace%29.jpg',
    museum: 'Art Institute of Chicago',
    medium: 'Oil on canvas',
    dimensions: '100.5 × 81 cm',
    description: '테라스에서 포즈를 취한 두 자매. 한 명은 모자를 쓰고 있고, 다른 한 명은 꽃을 들고 있어 자연스러운 친밀감을 보여줍니다.',
    personalityResonance: 'SREF가 가장 소중히 여기는 가족 관계와 일상 속 작은 순간들. 두 자매의 자연스러운 유대감이 SREF의 따뜻한 마음과 공명합니다.',
    matchPercent: 96,
    isPublicDomain: true,
    license: 'Public Domain',
    tags: ['family', 'sisters', 'intimacy', 'daily_life']
  },
  {
    id: 'sref-renoir-3',
    title: 'Luncheon of the Boating Party',
    artist: 'Pierre-Auguste Renoir',
    year: '1881',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Renoir21.jpg',
    museum: 'Phillips Collection, Washington D.C.',
    medium: 'Oil on canvas',
    dimensions: '129.5 × 172.7 cm',
    description: '보트 클럽에서 친구들과 함께하는 점심 모임. 각자 다른 포즈를 취하고 있지만 모두 편안하고 행복한 표정입니다.',
    personalityResonance: 'SREF가 가장 행복해하는 순간 - 친구들과의 자연스러운 모임에서 느끼는 소속감과 즐거움. 억지스럽지 않은 진정한 교감을 보여줍니다.',
    matchPercent: 97,
    isPublicDomain: true,
    license: 'Public Domain',
    tags: ['friendship', 'social_gathering', 'leisure', 'community']
  },
  {
    id: 'sref-renoir-4',
    title: 'Girls at the Piano',
    artist: 'Pierre-Auguste Renoir',
    year: '1892',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Pierre-Auguste_Renoir_-_Girls_at_the_Piano_-_Google_Art_Project.jpg',
    museum: 'Musée d\'Orsay, Paris',
    medium: 'Oil on canvas',
    dimensions: '116 × 90 cm',
    description: '피아노 앞에서 함께 연주하는 두 소녀. 한 명은 연주하고 다른 한 명은 악보를 보며 조용히 함께하고 있습니다.',
    personalityResonance: 'SREF의 협동 정신과 조화로운 관계를 상징. 함께 음악을 만들어가는 과정에서 느끼는 순수한 기쁨이 SREF의 본질과 일치합니다.',
    matchPercent: 94,
    isPublicDomain: true,
    license: 'Public Domain',
    tags: ['music', 'cooperation', 'young_women', 'harmony']
  },
  {
    id: 'sref-renoir-5',
    title: 'The Swing',
    artist: 'Pierre-Auguste Renoir',
    year: '1876',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Pierre-Auguste_Renoir_-_The_Swing_-_Google_Art_Project.jpg',
    museum: 'Musée d\'Orsay, Paris',
    medium: 'Oil on canvas',
    dimensions: '92 × 73 cm',
    description: '정원의 그네에서 젊은 여성과 두 남성이 자연스럽게 대화하는 모습. 햇빛이 나뭇잎 사이로 스며들어 낭만적인 분위기를 연출합니다.',
    personalityResonance: 'SREF의 자연스러운 사교성과 일상 속 로맨스를 아름답게 표현. 복잡하지 않은 순수한 인간관계의 매력을 보여줍니다.',
    matchPercent: 92,
    isPublicDomain: true,
    license: 'Public Domain',
    tags: ['romance', 'garden', 'natural_interaction', 'youth']
  },

  // === Secondary: Mary Cassatt (4개) - 모성애와 가족애의 대가 ===
  {
    id: 'sref-cassatt-1',
    title: 'The Child\'s Bath',
    artist: 'Mary Cassatt',
    year: '1893',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Cassatt_Mary_The_Child%27s_Bath_1893.jpg',
    museum: 'Art Institute of Chicago',
    medium: 'Oil on canvas',
    dimensions: '100.3 × 66.1 cm',
    description: '어머니가 아이를 목욕시키는 일상적인 순간. 둘 사이의 자연스러운 애정과 보살핌이 따뜻하게 표현되어 있습니다.',
    personalityResonance: 'SREF의 돌봄과 애정의 본능을 완벽하게 보여주는 작품. 일상의 작은 행동에서 느껴지는 깊은 사랑이 SREF의 마음과 일치합니다.',
    matchPercent: 95,
    isPublicDomain: true,
    license: 'Public Domain',
    tags: ['motherhood', 'care', 'daily_routine', 'tenderness']
  },
  {
    id: 'sref-cassatt-2',
    title: 'Little Girl in a Blue Armchair',
    artist: 'Mary Cassatt',
    year: '1878',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Cassatt_Mary_Little_Girl_in_a_Blue_Armchair_1878.jpg',
    museum: 'National Gallery of Art, Washington',
    medium: 'Oil on canvas',
    dimensions: '89.5 × 129.8 cm',
    description: '파란 안락의자에 편안하게 앉아 있는 어린 소녀. 아이의 자연스럽고 무방비한 모습이 사랑스럽게 그려져 있습니다.',
    personalityResonance: 'SREF가 느끼는 순수함과 보호받고 싶은 마음. 편안한 가정환경에서 자유롭게 자라는 아이의 모습에서 SREF의 이상향을 봅니다.',
    matchPercent: 90,
    isPublicDomain: true,
    license: 'Public Domain',
    tags: ['childhood', 'comfort', 'home', 'innocence']
  },
  {
    id: 'sref-cassatt-3',
    title: 'The Boating Party',
    artist: 'Mary Cassatt',
    year: '1893-1894',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Mary_Cassatt_-_The_Boating_Party.jpg',
    museum: 'National Gallery of Art, Washington',
    medium: 'Oil on canvas',
    dimensions: '90.2 × 117.5 cm',
    description: '가족이 함께 보트를 타는 평화로운 순간. 아버지, 어머니, 아이가 각자 역할을 하며 조화롭게 어우러져 있습니다.',
    personalityResonance: 'SREF가 꿈꾸는 완벽한 가족 나들이. 모든 구성원이 함께 시간을 보내며 만들어가는 따뜻한 추억의 순간입니다.',
    matchPercent: 93,
    isPublicDomain: true,
    license: 'Public Domain',
    tags: ['family_outing', 'leisure', 'water', 'togetherness']
  },
  {
    id: 'sref-cassatt-4',
    title: 'Mother and Child',
    artist: 'Mary Cassatt',
    year: '1890',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Mary_Cassatt_-_Mother_and_Child_%28The_Oval_Mirror%29.jpg',
    museum: 'Metropolitan Museum of Art, New York',
    medium: 'Oil on canvas',
    dimensions: '81.6 × 65.4 cm',
    description: '거울 앞에서 아이를 안고 있는 어머니. 둘이 거울을 보는 순간의 친밀감과 사랑이 잔잔하게 표현되어 있습니다.',
    personalityResonance: 'SREF의 가장 깊은 감정인 보호본능과 무조건적 사랑. 거울 속 모습을 함께 보며 나누는 조용한 순간의 소중함을 느낍니다.',
    matchPercent: 91,
    isPublicDomain: true,
    license: 'Public Domain',
    tags: ['mother_child', 'mirror', 'intimacy', 'reflection']
  },

  // === Tertiary: Berthe Morisot (3개) - 일상의 아름다움과 여성적 감수성 ===
  {
    id: 'sref-morisot-1',
    title: 'The Cradle',
    artist: 'Berthe Morisot',
    year: '1872',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Berthe_Morisot_-_The_Cradle_-_Google_Art_Project.jpg',
    museum: 'Musée d\'Orsay, Paris',
    medium: 'Oil on canvas',
    dimensions: '56 × 46 cm',
    description: '잠든 아이를 지켜보는 어머니의 모습. 부드러운 시선과 차분한 분위기가 모성애의 깊이를 보여줍니다.',
    personalityResonance: 'SREF의 조용한 헌신과 깊은 애정을 표현. 말 없는 사랑으로 아이를 지켜보는 마음이 SREF의 따뜻한 본성과 일치합니다.',
    matchPercent: 89,
    isPublicDomain: true,
    license: 'Public Domain',
    tags: ['motherhood', 'sleeping_child', 'devotion', 'gentleness']
  },
  {
    id: 'sref-morisot-2',
    title: 'Young Woman Knitting',
    artist: 'Berthe Morisot',
    year: '1883',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Berthe_Morisot_-_Jeune_femme_tricotant.jpg',
    museum: 'Private Collection',
    medium: 'Oil on canvas',
    description: '뜨개질을 하는 젊은 여성. 집중하면서도 평온한 표정으로 손끝에서 만들어지는 작품에 몰두하고 있습니다.',
    personalityResonance: 'SREF의 정성스러움과 남을 위한 마음. 뜨개질처럼 시간을 들여 사랑하는 사람을 위해 무엇인가를 만드는 따뜻한 마음을 보여줍니다.',
    matchPercent: 87,
    isPublicDomain: true,
    license: 'Public Domain',
    tags: ['knitting', 'domestic_activity', 'patience', 'care']
  },
  {
    id: 'sref-morisot-3',
    title: 'Summer\'s Day',
    artist: 'Berthe Morisot',
    year: '1879',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Berthe_Morisot_-_Summer%27s_Day.jpg',
    museum: 'National Gallery, London',
    medium: 'Oil on canvas',
    dimensions: '45.7 × 75.2 cm',
    description: '보트에서 여유로운 시간을 보내는 두 여성. 물 위의 평온한 분위기와 자연스러운 휴식의 순간이 아름답게 포착되어 있습니다.',
    personalityResonance: 'SREF가 추구하는 평온하고 조화로운 인간관계. 경쟁이 아닌 서로의 존재만으로도 만족하는 진정한 우정의 모습입니다.',
    matchPercent: 88,
    isPublicDomain: true,
    license: 'Public Domain',
    tags: ['friendship', 'leisure', 'water', 'peaceful']
  }
];

/**
 * SREF 유형용 추천 작품 가져오기
 */
export function getSREFCuratedArtworks(): SREFArtwork[] {
  return SREF_CURATED_ARTWORKS;
}

/**
 * 특정 작품 상세 정보 가져오기
 */
export function getSREFArtworkById(id: string): SREFArtwork | null {
  return SREF_CURATED_ARTWORKS.find(artwork => artwork.id === id) || null;
}