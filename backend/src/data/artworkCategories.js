// SAYU 확장 미술 카테고리 시스템
// 16가지 동물 캐릭터별 맞춤 카테고리 매핑

const artworkCategories = {
  // 기본 카테고리
  base: {
    'paintings': {
      name: '회화',
      description: '전통적인 회화 작품들',
      tags: ['classic', 'traditional', 'painting'],
      personality_fit: ['LAEF', 'LAEC', 'SAEF']
    },
    'sculpture': {
      name: '조각',
      description: '3차원 조각 작품들',
      tags: ['sculpture', 'three-dimensional', 'tactile'],
      personality_fit: ['ISTP_늑대', 'ESTP_사자', 'ISFJ_코끼리']
    },
    'modern': {
      name: '모던 아트',
      description: '20세기 모던 미술 운동',
      tags: ['modern', 'avant-garde', 'experimental'],
      personality_fit: ['INTJ_독수리', 'ENTJ_용', 'ENTP_돌고래']
    },
    'contemporary': {
      name: '현대 미술',
      description: '21세기 현대 미술 작품들',
      tags: ['contemporary', 'current', 'innovative'],
      personality_fit: ['ENFP_원숭이', 'ENTP_돌고래', 'ESFP_앵무새']
    },
    'photography': {
      name: '사진 예술',
      description: '예술적 사진 작품들',
      tags: ['photography', 'visual', 'documentary'],
      personality_fit: ['ISFJ_코끼리', 'ESFJ_개', 'ISTJ_거북이']
    }
  },

  // 아시아 미술 세분화
  asian: {
    'asian-art': {
      name: '아시아 미술',
      description: '아시아 전통 및 현대 미술',
      tags: ['asian', 'traditional', 'cultural'],
      personality_fit: ['ISFJ_코끼리', 'INFJ_부엉이', 'ISTJ_거북이']
    },
    'korean-art': {
      name: '한국 미술',
      description: '한국의 전통 및 현대 미술',
      tags: ['korean', 'hanbok', 'calligraphy', 'ceramics'],
      personality_fit: ['INFP_호랑이', 'ISFP_고양이', 'INFJ_부엉이'],
      searchTerms: ['Korea', 'Korean', 'Joseon', 'Goryeo', 'celadon', 'hanbok', 'dancheong'],
      culturalContext: {
        philosophy: '자연과 인간의 조화, 절제된 아름다움',
        movements: ['민화', '문인화', '단청', '백자', '청자'],
        modernArtists: ['박수근', '이중섭', '김환기', '유영국']
      }
    },
    'japanese-art': {
      name: '일본 미술',
      description: '일본의 전통 및 현대 미술',
      tags: ['japanese', 'ukiyo-e', 'zen', 'minimalism'],
      personality_fit: ['ISFP_고양이', 'INFP_호랑이', 'ISFJ_코끼리'],
      searchTerms: ['Japan', 'Japanese', 'ukiyo-e', 'sumi-e', 'zen', 'wabi-sabi'],
      culturalContext: {
        philosophy: '와비사비, 젠 정신, 자연의 덧없음',
        movements: ['우키요에', '수묵화', '도자기', '정원 예술'],
        modernArtists: ['쿠사마 야요이', '무라카미 다카시', '스기모토 히로시']
      }
    },
    'chinese-art': {
      name: '중국 미술',
      description: '중국의 전통 및 현대 미술',
      tags: ['chinese', 'calligraphy', 'landscape', 'porcelain'],
      personality_fit: ['INTJ_독수리', 'INFJ_부엉이', 'ISTJ_거북이'],
      searchTerms: ['China', 'Chinese', 'Song dynasty', 'Ming', 'porcelain', 'landscape painting'],
      culturalContext: {
        philosophy: '천인합일, 음양오행, 유불도 사상',
        movements: ['산수화', '서예', '청화백자', '정원 예술'],
        modernArtists: ['장대천', '조무기', '아이웨이웨이']
      }
    },
    'indian-art': {
      name: '인도 미술',
      description: '인도의 전통 및 현대 미술',
      tags: ['indian', 'spiritual', 'colorful', 'symbolic'],
      personality_fit: ['ENFP_원숭이', 'ESFP_앵무새', 'INFP_호랑이'],
      searchTerms: ['India', 'Indian', 'Mughal', 'mandala', 'miniature painting', 'temple art'],
      culturalContext: {
        philosophy: '영적 깨달음, 다양성 속 통일, 윤회 사상',
        movements: ['무굴 미니어처', '만다라', '사원 조각', '탄트라 아트'],
        modernArtists: ['후세인', '라비 바르마', '암리타 셰르길']
      }
    },
    'southeast-asian-art': {
      name: '동남아시아 미술',
      description: '동남아시아 전통 및 현대 미술',
      tags: ['southeast-asian', 'tropical', 'buddhist', 'textile'],
      personality_fit: ['ESFP_앵무새', 'ENFP_원숭이', 'ISFP_고양이'],
      searchTerms: ['Thailand', 'Indonesia', 'Vietnam', 'batik', 'temple art', 'Buddhist art'],
      culturalContext: {
        philosophy: '불교 사상, 자연 숭배, 공동체 정신',
        movements: ['바틱', '사원 예술', '목각', '직물 예술'],
        themes: ['열대 자연', '불교 철학', '전통 축제']
      }
    }
  },

  // 조각 및 3D 미술
  sculpture: {
    'sculpture-classical': {
      name: '고전 조각',
      description: '고대부터 근세까지의 전통 조각',
      tags: ['classical', 'marble', 'bronze', 'figurative'],
      personality_fit: ['ISTJ_거북이', 'ISFJ_코끼리', 'ESTJ_하이에나'],
      techniques: ['대리석 조각', '청동 주조', '목각', '석조'],
      periods: ['고대 그리스', '로마', '르네상스', '바로크']
    },
    'sculpture-modern': {
      name: '현대 조각',
      description: '20-21세기 현대 조각 작품들',
      tags: ['modern', 'abstract', 'conceptual', 'materials'],
      personality_fit: ['INTJ_독수리', 'ENTJ_용', 'ENTP_돌고래'],
      techniques: ['용접', '조립', '키네틱', '미니멀'],
      movements: ['추상표현주의', '미니멀리즘', '개념미술']
    },
    'installation-art': {
      name: '설치 미술',
      description: '공간을 활용한 설치 작품들',
      tags: ['installation', 'immersive', 'site-specific', 'experiential'],
      personality_fit: ['ENFP_원숭이', 'ENTP_돌고래', 'ESFP_앵무새'],
      characteristics: ['공간성', '상호작용', '일시성', '체험성'],
      themes: ['환경', '사회 비판', '기술', '인간 관계']
    },
    'ceramic-art': {
      name: '도자 예술',
      description: '전통 및 현대 도자기 작품들',
      tags: ['ceramic', 'pottery', 'traditional', 'functional'],
      personality_fit: ['ISFJ_코끼리', 'ISFP_고양이', 'ISTJ_거북이'],
      techniques: ['물레 성형', '판 성형', '조각', '유약'],
      traditions: ['한국 백자', '일본 라쿠', '중국 청자']
    }
  },

  // 현대 미디어 아트
  digital: {
    'digital-art': {
      name: '디지털 아트',
      description: '디지털 기술을 활용한 작품들',
      tags: ['digital', 'computer-generated', 'algorithm', 'virtual'],
      personality_fit: ['INTJ_독수리', 'ENTP_돌고래', 'ENTJ_용'],
      technologies: ['AI', '알고리즘', 'VR', 'AR', '3D 모델링'],
      themes: ['기술과 인간', '가상현실', '인공지능', '데이터 시각화']
    },
    'video-art': {
      name: '비디오 아트',
      description: '영상을 매체로 한 예술 작품들',
      tags: ['video', 'time-based', 'multimedia', 'performance'],
      personality_fit: ['ENFP_원숭이', 'ESFP_앵무새', 'ENTP_돌고래'],
      formats: ['단채널 비디오', '멀티채널', '비디오 설치', '퍼포먼스'],
      pioneers: ['백남준', '빌 비올라', '매튜 바니']
    },
    'interactive-art': {
      name: '인터랙티브 아트',
      description: '관객과 상호작용하는 작품들',
      tags: ['interactive', 'participatory', 'responsive', 'sensor'],
      personality_fit: ['ENFP_원숭이', 'ENTP_돌고래', 'ESFP_앵무새'],
      technologies: ['센서', '모션 캡처', '터치스크린', 'AI'],
      concepts: ['참여', '반응성', '실시간', '협업']
    },
    'new-media': {
      name: '뉴미디어 아트',
      description: '새로운 기술 매체를 활용한 작품들',
      tags: ['new-media', 'technology', 'experimental', 'interdisciplinary'],
      personality_fit: ['INTJ_독수리', 'ENTJ_용', 'ENTP_돌고래'],
      mediums: ['홀로그램', '로보틱스', '바이오아트', '사운드아트'],
      research_areas: ['인공생명', '가상현실', '네트워크 아트']
    }
  },

  // 사진 예술 세분화
  photography: {
    'photography-portrait': {
      name: '인물 사진',
      description: '인물을 주제로 한 예술 사진',
      tags: ['portrait', 'human', 'expression', 'identity'],
      personality_fit: ['ISFJ_코끼리', 'ESFJ_개', 'ISFP_고양이'],
      styles: ['클래식', '환경 인물', '패션', 'street portrait'],
      masters: ['리처드 아베든', '어빙 펜', '안니 리보비츠']
    },
    'photography-landscape': {
      name: '풍경 사진',
      description: '자연과 풍경을 담은 예술 사진',
      tags: ['landscape', 'nature', 'environment', 'sublime'],
      personality_fit: ['INFP_호랑이', 'ISFP_고양이', 'INFJ_부엉이'],
      genres: ['자연 풍경', '도시 풍경', '추상 풍경', '항공 사진'],
      masters: ['안셀 아담스', '에드워드 웨스턴', '거리 위난스']
    },
    'photography-documentary': {
      name: '다큐멘터리 사진',
      description: '사회와 현실을 기록한 사진들',
      tags: ['documentary', 'social', 'journalism', 'reality'],
      personality_fit: ['ISFJ_코끼리', 'INFJ_부엉이', 'ISTJ_거북이'],
      subjects: ['사회 문제', '전쟁', '문화', '일상'],
      masters: ['로버트 카파', '도로테아 랑게', '비비안 마이어']
    },
    'photography-conceptual': {
      name: '개념 사진',
      description: '아이디어와 개념을 시각화한 사진',
      tags: ['conceptual', 'idea', 'staged', 'narrative'],
      personality_fit: ['INTJ_독수리', 'INFP_호랑이', 'ENTP_돌고래'],
      approaches: ['연출', '조작', '시리즈', '내러티브'],
      artists: ['신디 셔먼', '제프 월', '안드레아스 구르스키']
    }
  },

  // 전통 및 민속 예술
  traditional: {
    'folk-art': {
      name: '민속 미술',
      description: '민중의 생활 속에서 나온 전통 미술',
      tags: ['folk', 'traditional', 'cultural', 'handmade'],
      personality_fit: ['ISFJ_코끼리', 'ESFJ_개', 'ISFP_고양이'],
      characteristics: ['실용성', '지역성', '전승성', '집단성'],
      examples: ['민화', '토우', '장승', '탈']
    },
    'textile-art': {
      name: '섬유 예술',
      description: '직물과 섬유를 활용한 예술 작품들',
      tags: ['textile', 'fiber', 'weaving', 'embroidery'],
      personality_fit: ['ISFP_고양이', 'ISFJ_코끼리', 'ESFP_앵무새'],
      techniques: ['직조', '자수', '퀼트', '태피스트리'],
      traditions: ['한국 조각보', '일본 기모노', '페루 직물']
    },
    'calligraphy': {
      name: '서예',
      description: '문자의 아름다움을 표현하는 예술',
      tags: ['calligraphy', 'writing', 'brush', 'meditation'],
      personality_fit: ['INFJ_부엉이', 'INTJ_독수리', 'ISFJ_코끼리'],
      traditions: ['동양 서예', '이슬람 캘리그래피', '서구 캘리그래피'],
      philosophy: ['마음의 표현', '수양', '정신 집중']
    },
    'printmaking': {
      name: '판화',
      description: '판을 이용한 복제 미술',
      tags: ['printmaking', 'reproduction', 'technique', 'multiple'],
      personality_fit: ['ISTJ_거북이', 'ISTP_늑대', 'INTJ_독수리'],
      techniques: ['목판화', '동판화', '석판화', '실크스크린'],
      masters: ['뒤러', '렘브란트', '앤디 워홀']
    }
  }
};

// APT 유형별 카테고리 선호도 매핑 (올바른 SAYU 4글자 코드 사용)
const personalityCategories = {
  // L로 시작하는 유형 (혼자 관람 선호)
  'LAEF': { // 몽환적 방랑자 (여우)
    primary: ['photography-landscape', 'contemporary', 'installation-art', 'digital-art'],
    secondary: ['video-art', 'new-media', 'abstract'],
    emotional_resonance: ['dreamy', 'flowing', 'abstract', 'emotional']
  },
  'LAEC': { // 감성 큐레이터 (고양이)
    primary: ['japanese-art', 'ceramic-art', 'textile-art', 'photography-portrait'],
    secondary: ['paintings', 'folk-art', 'sculpture-classical'],
    emotional_resonance: ['aesthetic', 'refined', 'emotional', 'harmonious']
  },
  'LAMF': { // 직관적 탐구자 (올빼미)
    primary: ['chinese-art', 'calligraphy', 'conceptual', 'photography-conceptual'],
    secondary: ['printmaking', 'sculpture-modern', 'new-media'],
    emotional_resonance: ['meaningful', 'philosophical', 'abstract', 'intuitive']
  },
  'LAMC': { // 철학적 수집가 (거북이)
    primary: ['chinese-art', 'calligraphy', 'sculpture-classical', 'printmaking'],
    secondary: ['traditional', 'folk-art', 'photography-documentary'],
    emotional_resonance: ['meaningful', 'systematic', 'traditional', 'deep']
  },
  'LREF': { // 고독한 관찰자 (카멜레온)
    primary: ['photography-landscape', 'photography-documentary', 'paintings', 'sculpture'],
    secondary: ['korean-art', 'japanese-art', 'folk-art'],
    emotional_resonance: ['observational', 'realistic', 'emotional', 'solitary']
  },
  'LREC': { // 섬세한 감정가 (고슴도치)
    primary: ['paintings', 'photography-portrait', 'sculpture-classical', 'ceramic-art'],
    secondary: ['textile-art', 'folk-art', 'traditional'],
    emotional_resonance: ['delicate', 'realistic', 'emotional', 'careful']
  },
  'LRMF': { // 디지털 탐험가 (문어)
    primary: ['digital-art', 'new-media', 'photography-conceptual', 'interactive-art'],
    secondary: ['video-art', 'contemporary', 'sculpture-modern'],
    emotional_resonance: ['innovative', 'realistic', 'meaningful', 'exploratory']
  },
  'LRMC': { // 학구적 연구자 (비버)
    primary: ['photography-documentary', 'printmaking', 'sculpture-classical', 'traditional'],
    secondary: ['chinese-art', 'korean-art', 'calligraphy'],
    emotional_resonance: ['scholarly', 'systematic', 'meaningful', 'methodical']
  },

  // S로 시작하는 유형 (함께 관람 선호)
  'SAEF': { // 감성 나눔이 (나비)
    primary: ['installation-art', 'video-art', 'contemporary', 'interactive-art'],
    secondary: ['indian-art', 'southeast-asian-art', 'textile-art'],
    emotional_resonance: ['sharing', 'emotional', 'abstract', 'transformative']
  },
  'SAEC': { // 예술 네트워커 (펭귄)
    primary: ['contemporary', 'installation-art', 'photography-portrait', 'community-art'],
    secondary: ['video-art', 'interactive-art', 'folk-art'],
    emotional_resonance: ['social', 'emotional', 'abstract', 'collaborative']
  },
  'SAMF': { // 영감 전도사 (앵무새)
    primary: ['interactive-art', 'video-art', 'new-media', 'installation-art'],
    secondary: ['contemporary', 'digital-art', 'southeast-asian-art'],
    emotional_resonance: ['inspiring', 'meaningful', 'abstract', 'evangelical']
  },
  'SAMC': { // 문화 기획자 (사슴)
    primary: ['community-art', 'installation-art', 'photography-documentary', 'contemporary'],
    secondary: ['video-art', 'interactive-art', 'cultural-heritage'],
    emotional_resonance: ['cultural', 'meaningful', 'abstract', 'organized']
  },
  'SREF': { // 열정적 관람자 (강아지)
    primary: ['folk-art', 'photography-portrait', 'paintings', 'sculpture'],
    secondary: ['korean-art', 'japanese-art', 'ceramic-art'],
    emotional_resonance: ['enthusiastic', 'realistic', 'emotional', 'social']
  },
  'SREC': { // 따뜻한 안내자 (오리)
    primary: ['folk-art', 'textile-art', 'photography-portrait', 'ceramic-art'],
    secondary: ['traditional', 'korean-art', 'community-art'],
    emotional_resonance: ['nurturing', 'realistic', 'emotional', 'guiding']
  },
  'SRMF': { // 지식 멘토 (코끼리)
    primary: ['photography-documentary', 'sculpture-classical', 'chinese-art', 'calligraphy'],
    secondary: ['printmaking', 'traditional', 'educational'],
    emotional_resonance: ['educational', 'meaningful', 'realistic', 'mentoring']
  },
  'SRMC': { // 체계적 교육자 (독수리)
    primary: ['sculpture-classical', 'photography-documentary', 'printmaking', 'traditional'],
    secondary: ['chinese-art', 'korean-art', 'folk-art'],
    emotional_resonance: ['systematic', 'educational', 'meaningful', 'structured']
  }
};

// 검색 키워드 생성 함수
function generateSearchTermsForCategory(category, profile) {
  const categoryData = findCategoryData(category);
  if (!categoryData) return ['art'];

  let searchTerms = [...(categoryData.searchTerms || categoryData.tags || [])];
  
  // APT 유형별 추가 키워드
  const personalityData = personalityCategories[profile?.type_code];
  if (personalityData) {
    if (personalityData.primary.includes(category)) {
      searchTerms = searchTerms.concat(personalityData.emotional_resonance);
    }
  }

  return searchTerms;
}

// 카테고리 데이터 검색 함수
function findCategoryData(category) {
  for (const group of Object.values(artworkCategories)) {
    if (group[category]) {
      return group[category];
    }
  }
  return null;
}

// 모든 카테고리 목록 반환
function getAllCategories() {
  const allCategories = [];
  Object.values(artworkCategories).forEach(group => {
    Object.keys(group).forEach(category => {
      allCategories.push(category);
    });
  });
  return allCategories;
}

// APT 유형별 추천 카테고리
function getRecommendedCategoriesForPersonality(typeCode) {
  const personalityData = personalityCategories[typeCode];
  if (!personalityData) return getAllCategories().slice(0, 6);
  
  return [...personalityData.primary, ...personalityData.secondary.slice(0, 2)];
}

module.exports = {
  artworkCategories,
  personalityCategories,
  generateSearchTermsForCategory,
  findCategoryData,
  getAllCategories,
  getRecommendedCategoriesForPersonality
};