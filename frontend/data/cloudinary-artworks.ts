/**
 * Cloudinary에 실제로 저장된 Artvee 작품 이미지들
 * Cloud name: dkdzgpj3n
 * Path: v1754504140/sayu/artvee-complete/
 * 실제 존재하는 파일명들로 구성
 */

export const CLOUDINARY_FAMOUS_ARTWORKS = [
  // 실제 Cloudinary에 확실히 존재하는 작품들
  {
    id: 'man-cabbage',
    title: 'Man in the Cabbage Field',
    artist: 'Camille Pissarro',
    year: '1879',
    imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1754504140/sayu/artvee-complete/artvee-man-in-the-cabbage-field.jpg',
    style: 'Impressionism',
    museum: 'Private Collection'
  },
  {
    id: 'cafe-terrace',
    title: 'Café Terrace at Night',
    artist: 'Vincent van Gogh',
    year: '1888',
    imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1754504140/sayu/artvee-complete/artvee-cafe-terrace-at-night.jpg',
    style: 'Post-Impressionism',
    museum: 'Kröller-Müller Museum'
  },
  {
    id: 'daubignys-garden',
    title: "Daubigny's Garden",
    artist: 'Vincent van Gogh',
    year: '1890',
    imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1754504140/sayu/artvee-complete/artvee-daubignys-garden.jpg',
    style: 'Post-Impressionism',
    museum: 'Kunstmuseum Basel'
  },
  {
    id: 'pair-of-boots',
    title: 'A Pair of Boots',
    artist: 'Vincent van Gogh',
    year: '1886',
    imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1754504140/sayu/artvee-complete/artvee-a-pair-of-boots.jpg',
    style: 'Post-Impressionism',
    museum: 'Van Gogh Museum'
  },
  {
    id: 'peasant-woman',
    title: 'A Peasant Woman Digging',
    artist: 'Vincent van Gogh',
    year: '1885',
    imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1754504140/sayu/artvee-complete/artvee-a-peasant-woman-digging-in-front-of-her-cottage.jpg',
    style: 'Post-Impressionism',
    museum: 'Art Institute of Chicago'
  },
  {
    id: 'garden-arles',
    title: 'Garden at Arles',
    artist: 'Vincent van Gogh',
    year: '1888',
    imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1754504140/sayu/artvee-complete/artvee-garden-at-arles.jpg',
    style: 'Post-Impressionism',
    museum: 'Private Collection'
  },
  {
    id: 'field-flowers',
    title: 'Field with Flowers near Arles',
    artist: 'Vincent van Gogh',
    year: '1888',
    imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1754504140/sayu/artvee-complete/artvee-field-with-flowers-near-arles.jpg',
    style: 'Post-Impressionism',
    museum: 'Van Gogh Museum'
  },
  {
    id: 'blue-still-life',
    title: 'Blue Still Life',
    artist: 'Henri Matisse',
    year: '1907',
    imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1754504140/sayu/artvee-complete/artvee-blue-still-life-nature-morte-bleue.jpg',
    style: 'Fauvism',
    museum: 'Barnes Foundation'
  },
  {
    id: 'bouquet-flowers',
    title: 'Bouquet of Flowers in a Vase',
    artist: 'Odilon Redon',
    year: '1910',
    imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1754504140/sayu/artvee-complete/artvee-bouquet-of-flowers-in-a-vase-2.jpg',
    style: 'Symbolism',
    museum: 'Private Collection'
  },
  {
    id: 'acacia-flowers',
    title: 'Acacia in Flowers',
    artist: 'Pierre Bonnard',
    year: '1913',
    imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1754504140/sayu/artvee-complete/artvee-acacia-in-flowers.jpg',
    style: 'Post-Impressionism',
    museum: 'Private Collection'
  },
  {
    id: 'coastal-landscape',
    title: 'Coastal Landscape',
    artist: 'Paul Signac',
    year: '1893',
    imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1754504140/sayu/artvee-complete/artvee-coastal-landscape.jpg',
    style: 'Neo-Impressionism',
    museum: 'Private Collection'
  },
  {
    id: 'beach-landscape',
    title: 'Beach Landscape with Trees and Boats',
    artist: 'Henri-Edmond Cross',
    year: '1906',
    imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1754504140/sayu/artvee-complete/artvee-beach-landscape-with-trees-and-boats.jpg',
    style: 'Neo-Impressionism',
    museum: 'Private Collection'
  }
];

// Fallback URLs (더 안정적인 Cloudinary public 이미지)
export const CLOUDINARY_FALLBACK_URLS = [
  'https://res.cloudinary.com/demo/image/upload/w_800,h_600,c_fill/sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/w_800,h_600,c_fill/v1312461204/sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/w_800,h_600,c_fill/docs/models.jpg'
];

// Wikipedia Commons fallback URLs (Public Domain)
export const WIKIPEDIA_FALLBACK_URLS: Record<string, string> = {
  'monet-waterlilies': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/800px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
  'renoir-moulin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Musee_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg/800px-Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Musee_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg',
  'degas-dancers': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Edgar_Degas_-_The_Ballet_Class_-_Google_Art_Project.jpg/800px-Edgar_Degas_-_The_Ballet_Class_-_Google_Art_Project.jpg',
  'vangogh-starry': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
  'vangogh-sunflowers': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_Willem_van_Gogh_127.jpg/600px-Vincent_Willem_van_Gogh_127.jpg',
  'cezanne-apples': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Paul_C%C3%A9zanne_-_Still_Life_with_Apples_-_Google_Art_Project.jpg/800px-Paul_C%C3%A9zanne_-_Still_Life_with_Apples_-_Google_Art_Project.jpg',
  'vermeer-pearl': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/600px-1665_Girl_with_a_Pearl_Earring.jpg',
  'rembrandt-nightwatch': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/800px-The_Night_Watch_-_HD.jpg',
  'klimt-kiss': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Gustav_Klimt_016.jpg/600px-Gustav_Klimt_016.jpg',
  'mucha-seasons': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Alfons_Mucha_-_1896_-_Spring.jpg/400px-Alfons_Mucha_-_1896_-_Spring.jpg',
  'hokusai-wave': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/800px-The_Great_Wave_off_Kanagawa.jpg',
  'botticelli-venus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/800px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg'
};

// Helper function to get a working image URL with fallback
export function getCloudinaryArtwork(index: number): typeof CLOUDINARY_FAMOUS_ARTWORKS[0] {
  const artwork = CLOUDINARY_FAMOUS_ARTWORKS[index % CLOUDINARY_FAMOUS_ARTWORKS.length];
  // Add fallback URL
  const artworkWithFallback = {
    ...artwork,
    fallbackUrl: WIKIPEDIA_FALLBACK_URLS[artwork.id] || artwork.imageUrl
  };
  return artworkWithFallback;
}

// 16가지 APT 유형별 맞춤 작품 선택
export function getArtworksForUserType(userType: string): typeof CLOUDINARY_FAMOUS_ARTWORKS {
  // 16가지 APT 유형별 특성에 맞는 작품 큐레이션
  // L=독립적(Lone), S=사교적(Shared)
  // A=추상적(Abstract), R=구상적(Representational)  
  // E=감정적(Emotional), M=의미적(Meaning-driven)
  // F=자유로운(Flow), C=체계적(Constructive)
  const typeBasedSelection: Record<string, number[]> = {
    // 독립적-추상적 유형들 (LA로 시작)
    'LAEF': [1, 2, 3, 6, 7, 8, 9, 10], // 여우 - 몽환적 방랑자: 반 고흐, 상징주의 작품들
    'LAEC': [7, 8, 9, 10, 11, 2, 3, 6], // 고양이 - 감성 큐레이터: 마티스, 레동 등 감성적 작품
    'LAMF': [2, 3, 6, 10, 11, 4, 5, 7], // 올빼미 - 직관적 탐구자: 반 고흐의 깊이 있는 작품들
    'LAMC': [10, 11, 7, 8, 9, 1, 2, 3], // 거북이 - 고독한 철학자: 시냐크, 크로스 등 체계적 작품
    
    // 독립적-구상적 유형들 (LR로 시작)
    'LREF': [0, 1, 5, 6, 10, 11, 4, 9], // 카멜레온 - 고독한 관찰자: 피사로, 풍경화 중심
    'LREC': [4, 5, 8, 9, 0, 1, 6, 7], // 고슴도치 - 섬세한 감정가: 정물화, 꽃 작품
    'LRMF': [0, 2, 3, 4, 5, 6, 10, 11], // 문어 - 침묵의 관찰자: 다양한 구상 작품
    'LRMC': [0, 4, 5, 10, 11, 1, 6, 9], // 비버 - 학구적 연구자: 체계적 구상 작품
    
    // 사교적-추상적 유형들 (SA로 시작)  
    'SAEF': [1, 6, 7, 8, 9, 2, 3, 11], // 나비 - 감정의 물결: 밝고 감정적인 작품
    'SAEC': [7, 8, 9, 1, 2, 6, 10, 11], // 펭귄 - 감성 조율사: 조화로운 추상 작품
    'SAMF': [2, 3, 6, 7, 8, 1, 10, 11], // 앵무새 - 의미의 직조자: 상징적 의미가 있는 작품
    'SAMC': [10, 11, 7, 1, 2, 3, 8, 9], // 사슴 - 지혜의 건축가: 체계적 추상 작품
    
    // 사교적-구상적 유형들 (SR로 시작)
    'SREF': [0, 1, 5, 9, 6, 8, 4, 11], // 강아지 - 친근한 공감자: 친근한 인상주의 작품
    'SREC': [4, 5, 8, 9, 0, 1, 7, 6], // 오리 - 세심한 조화자: 섬세한 구상 작품
    'SRMF': [0, 1, 2, 5, 6, 9, 10, 11], // 코끼리 - 지혜로운 안내자: 의미 있는 구상 작품
    'SRMC': [0, 5, 10, 11, 1, 4, 9, 6], // 독수리 - 마스터 도슨트: 체계적이고 명확한 작품
    
    'DEFAULT': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // 기본값 - 모든 작품
  };
  
  const indices = typeBasedSelection[userType] || typeBasedSelection['DEFAULT'];
  
  return indices.map(i => CLOUDINARY_FAMOUS_ARTWORKS[i]);
}