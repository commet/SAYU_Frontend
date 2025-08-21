/**
 * Museum APIs와 Public Domain 소스에서 가져올 수 있는 추가 작품들
 * 안정적인 이미지 URL을 제공하는 소스들
 */

// Met Museum Collection (Public Domain, 직접 접근 가능)
export const MET_MUSEUM_ARTWORKS = [
  {
    id: 'met-wheat-field',
    title: 'Wheat Field with Cypresses',
    artist: 'Vincent van Gogh',
    year: '1889',
    imageUrl: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/436535/1671316/main-image',
    style: 'Post-Impressionism',
    museum: 'Metropolitan Museum of Art',
    description: '황금빛 밀밭과 역동적인 사이프러스 나무가 소용돌이치는 구름과 어우러진 풍경',
    curatorNote: {
      'LAEF': '자유로운 붓터치와 역동적인 에너지가 여우의 방랑 정신과 공명합니다',
      'SREF': '따뜻한 황금빛과 자연의 생명력이 강아지의 친근한 감성을 자극합니다',
      'LAMC': '하늘과 땅의 패턴이 만드는 체계적 구조가 거북이의 철학적 시선을 끕니다'
    }
  },
  {
    id: 'met-water-lilies',
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: '1916-1919',
    imageUrl: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/437127/796089/main-image',
    style: 'Impressionism',
    museum: 'Metropolitan Museum of Art',
    description: '잔잔한 수면 위에 떠있는 수련과 반사된 하늘이 만드는 몽환적 정원',
    curatorNote: {
      'LAEC': '물과 빛의 섬세한 조화가 고양이의 감성적 큐레이션 본능을 자극합니다',
      'SAEF': '색채의 춤과 빛의 떨림이 나비의 감정적 물결과 어우러집니다',
      'LREC': '섬세한 색채 변화와 디테일이 고슴도치의 예민한 감수성과 만납니다'
    }
  },
  {
    id: 'met-starry-night',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889',
    imageUrl: 'https://www.moma.org/media/W1siZiIsIjM4NjQ3MCJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=a8118101f5c7b8c8',
    style: 'Post-Impressionism',
    museum: 'MoMA',
    description: '소용돌이치는 밤하늘 아래 평화로운 마을의 대비가 인상적인 작품',
    curatorNote: {
      'LAMF': '우주의 신비와 내면의 직관이 올빼미의 탐구 정신과 만납니다',
      'SAMC': '하늘의 패턴과 마을의 구조가 사슴의 체계적 지혜와 조화를 이룹니다',
      'LAEF': '밤의 자유로운 에너지가 여우의 방랑 본능을 깨웁니다'
    }
  }
];

// Art Institute of Chicago Collection
export const CHICAGO_ARTWORKS = [
  {
    id: 'aic-sunday-afternoon',
    title: 'A Sunday on La Grande Jatte',
    artist: 'Georges Seurat',
    year: '1884-1886',
    imageUrl: 'https://www.artic.edu/iiif/2/1adf2696-8489-499b-cad2-821d7fde4b33/full/843,/0/default.jpg',
    style: 'Neo-Impressionism',
    museum: 'Art Institute of Chicago',
    description: '점묘법으로 그려진 일요일 오후 공원의 한가로운 풍경',
    curatorNote: {
      'SRMC': '체계적인 점묘법과 구성이 독수리의 마스터 도슨트 기질과 완벽히 매치됩니다',
      'LRMC': '과학적 색채 이론과 체계적 구성이 비버의 학구적 연구 정신과 공명합니다',
      'SAEC': '조화로운 색점들의 리듬이 펭귄의 감성 조율 능력과 어우러집니다'
    }
  },
  {
    id: 'aic-american-gothic',
    title: 'American Gothic',
    artist: 'Grant Wood',
    year: '1930',
    imageUrl: 'https://www.artic.edu/iiif/2/b272df73-a965-ac37-4172-be4e99483637/full/843,/0/default.jpg',
    style: 'American Regionalism',
    museum: 'Art Institute of Chicago',
    description: '미국 중서부 농부 부부의 엄격하고 금욕적인 모습을 담은 초상',
    curatorNote: {
      'LRMC': '세밀한 디테일과 구조적 구성이 비버의 체계적 사고와 일치합니다',
      'SREC': '인물의 섬세한 표현이 오리의 세심한 관찰력과 만납니다',
      'LREF': '현실적 묘사 속 숨은 이야기가 카멜레온의 관찰자 시선을 끕니다'
    }
  }
];

// Rijksmuseum Collection (Amsterdam)
export const RIJKSMUSEUM_ARTWORKS = [
  {
    id: 'rijk-milkmaid',
    title: 'The Milkmaid',
    artist: 'Johannes Vermeer',
    year: '1658-1661',
    imageUrl: 'https://lh3.googleusercontent.com/cRtF3WdYfRQEraAcQz8dWDJOq3XsRX-h244rOw6zwkHtxy7NHjJOany7u4I2EG_uMAfNwBLHkFyLMENzpmfBTSYXIH_F=w800',
    style: 'Dutch Golden Age',
    museum: 'Rijksmuseum',
    description: '부엌에서 우유를 따르는 하녀의 일상적이면서도 숭고한 순간',
    curatorNote: {
      'LREF': '일상 속 숨은 아름다움이 카멜레온의 관찰자 시선과 만납니다',
      'SREC': '섬세한 빛과 질감 표현이 오리의 세심한 감각과 어우러집니다',
      'LREC': '고요한 순간의 감정이 고슴도치의 섬세한 감성과 공명합니다'
    }
  },
  {
    id: 'rijk-night-watch',
    title: 'The Night Watch',
    artist: 'Rembrandt van Rijn',
    year: '1642',
    imageUrl: 'https://lh3.googleusercontent.com/SsEIJWka3_cYRXXSE8VD3XNOgtOxoZhqW1uB8UFO_Hcg-LJqwXJQPM0EwvPd40vvCHAe0vwEUipJMB4bAbDV8CzEsg=w800',
    style: 'Dutch Golden Age',
    museum: 'Rijksmuseum',
    description: '암스테르담 시민 자경단의 역동적이고 극적인 집단 초상',
    curatorNote: {
      'SRMF': '복잡한 구성 속 의미가 코끼리의 지혜로운 안내와 연결됩니다',
      'SRMC': '빛과 그림자의 대비가 독수리의 명확한 시각과 만납니다',
      'SAMF': '각 인물의 숨은 이야기가 앵무새의 의미 직조와 어우러집니다'
    }
  }
];

// National Gallery London Collection
export const NATIONAL_GALLERY_ARTWORKS = [
  {
    id: 'ng-sunflowers',
    title: 'Sunflowers',
    artist: 'Vincent van Gogh',
    year: '1888',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_Willem_van_Gogh_127.jpg/800px-Vincent_Willem_van_Gogh_127.jpg',
    style: 'Post-Impressionism',
    museum: 'National Gallery',
    description: '생명력 넘치는 해바라기들이 황금빛으로 빛나는 정물화',
    curatorNote: {
      'SREF': '따뜻하고 밝은 에너지가 강아지의 친근한 공감과 만납니다',
      'LAEF': '자유로운 붓질과 강렬한 색채가 여우의 방랑 정신과 어우러집니다',
      'SAEF': '꽃의 감정적 표현이 나비의 감성적 물결과 공명합니다'
    }
  },
  {
    id: 'ng-arnolfini',
    title: 'The Arnolfini Portrait',
    artist: 'Jan van Eyck',
    year: '1434',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Van_Eyck_-_Arnolfini_Portrait.jpg/600px-Van_Eyck_-_Arnolfini_Portrait.jpg',
    style: 'Northern Renaissance',
    museum: 'National Gallery',
    description: '거울과 상징으로 가득한 부부의 신비로운 초상',
    curatorNote: {
      'LAMF': '숨겨진 상징과 의미가 올빼미의 직관적 탐구와 만납니다',
      'LRMC': '정교한 디테일과 상징 체계가 비버의 학구적 연구와 어우러집니다',
      'SAMF': '각 사물의 의미가 앵무새의 의미 직조 능력과 연결됩니다'
    }
  }
];

// Musée d'Orsay Collection
export const ORSAY_ARTWORKS = [
  {
    id: 'orsay-bal-moulin',
    title: 'Bal du moulin de la Galette',
    artist: 'Pierre-Auguste Renoir',
    year: '1876',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Musee_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg/800px-Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Musee_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg',
    style: 'Impressionism',
    museum: "Musée d'Orsay",
    description: '햇살 가득한 정원에서 춤추는 파리 시민들의 즐거운 오후',
    curatorNote: {
      'SREF': '따뜻한 분위기와 즐거운 에너지가 강아지의 친근함과 만납니다',
      'SAEF': '빛과 움직임의 감정이 나비의 감성적 물결과 어우러집니다',
      'SAEC': '조화로운 색채와 구성이 펭귄의 감성 조율과 공명합니다'
    }
  },
  {
    id: 'orsay-olympia',
    title: 'Olympia',
    artist: 'Édouard Manet',
    year: '1863',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Edouard_Manet_-_Olympia_-_Google_Art_Project_3.jpg/800px-Edouard_Manet_-_Olympia_-_Google_Art_Project_3.jpg',
    style: 'Realism/Impressionism',
    museum: "Musée d'Orsay",
    description: '고전 회화를 현대적으로 재해석한 도발적인 누드',
    curatorNote: {
      'LAMF': '전통에 대한 도전이 올빼미의 직관적 탐구와 만납니다',
      'LREF': '시선의 대담함이 카멜레온의 관찰자 정신과 어우러집니다',
      'SAMF': '숨은 의미와 상징이 앵무새의 의미 직조와 연결됩니다'
    }
  }
];

// 모든 작품을 하나로 통합
export const ALL_MUSEUM_ARTWORKS = [
  ...MET_MUSEUM_ARTWORKS,
  ...CHICAGO_ARTWORKS,
  ...RIJKSMUSEUM_ARTWORKS,
  ...NATIONAL_GALLERY_ARTWORKS,
  ...ORSAY_ARTWORKS
];

// 유형별 맞춤 큐레이션 함수
export function getEnhancedArtworksForType(userType: string): any[] {
  // 기존 Cloudinary 작품과 Museum 작품을 조합
  const cloudinaryArtworks = require('./cloudinary-artworks').getArtworksForUserType(userType);
  
  // 유형별 Museum 작품 추가 선택
  const museumSelection: Record<string, string[]> = {
    'LAEF': ['met-wheat-field', 'met-starry-night', 'ng-sunflowers'],
    'LAEC': ['met-water-lilies', 'rijk-milkmaid'],
    'LAMF': ['met-starry-night', 'ng-arnolfini', 'orsay-olympia'],
    'LAMC': ['met-wheat-field', 'aic-sunday-afternoon'],
    'LREF': ['rijk-milkmaid', 'aic-american-gothic', 'orsay-olympia'],
    'LREC': ['met-water-lilies', 'rijk-milkmaid', 'aic-american-gothic'],
    'LRMF': ['rijk-night-watch', 'ng-arnolfini'],
    'LRMC': ['aic-sunday-afternoon', 'aic-american-gothic', 'ng-arnolfini'],
    'SAEF': ['met-water-lilies', 'ng-sunflowers', 'orsay-bal-moulin'],
    'SAEC': ['aic-sunday-afternoon', 'orsay-bal-moulin'],
    'SAMF': ['rijk-night-watch', 'ng-arnolfini', 'orsay-olympia'],
    'SAMC': ['met-starry-night', 'aic-sunday-afternoon'],
    'SREF': ['met-wheat-field', 'ng-sunflowers', 'orsay-bal-moulin'],
    'SREC': ['aic-american-gothic', 'rijk-milkmaid'],
    'SRMF': ['rijk-night-watch', 'orsay-olympia'],
    'SRMC': ['aic-sunday-afternoon', 'rijk-night-watch']
  };
  
  const selectedIds = museumSelection[userType] || [];
  const selectedMuseumArtworks = ALL_MUSEUM_ARTWORKS.filter(
    artwork => selectedIds.includes(artwork.id)
  );
  
  // 유형별 큐레이터 노트 적용
  const enhancedMuseumArtworks = selectedMuseumArtworks.map(artwork => ({
    ...artwork,
    curatorNote: artwork.curatorNote?.[userType] || artwork.curatorNote?.['DEFAULT'] || '이 작품의 특별한 에너지가 당신과 만납니다'
  }));
  
  // Cloudinary와 Museum 작품 조합
  return [...cloudinaryArtworks, ...enhancedMuseumArtworks];
}