// 통합 작품 풀 구성 시스템
// 1단계: Cloudinary 업로드된 1,761개 작품 (artworks.json)
// 2단계: 위키미디어 퍼블릭 도메인 걸작들 (45개)
// 통합: 총 1,800+ 작품의 개성 맞춤형 추천 풀

import fs from 'fs';
import path from 'path';

// === 통합 작품 데이터 인터페이스 ===
export interface UnifiedArtwork {
  id: string;
  title: string;
  artist: string;
  year?: string;
  period?: string;
  movement?: string;
  medium: string;
  source: 'cloudinary' | 'wikimedia';
  
  // 이미지 URL들
  imageUrl: string;
  thumbnailUrl?: string;
  
  // 메타데이터
  description?: string;
  classification?: string;
  department?: string;
  
  // SAYU 맞춤형 태그 시스템
  themes: string[];
  mood: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  social_context: 'intimate' | 'social' | 'public' | 'solitary';
  
  // 원본 데이터 참조
  originalData?: any;
}

export interface ArtworkPool {
  cloudinaryWorks: UnifiedArtwork[];
  wikimediaWorks: UnifiedArtwork[];
  total: number;
  metadata: {
    cloudinaryCount: number;
    wikimediaCount: number;
    lastUpdated: string;
    sources: string[];
  };
}

// 검색 태그 → SAYU 테마 매핑
const SEARCH_TERM_TO_THEMES: Record<string, string[]> = {
  // 시대/스타일
  '19th century': ['historical', 'classical', 'traditional'],
  '20th century': ['modern', 'contemporary'],
  'abstract': ['abstract', 'modern', 'expression'],
  'baroque': ['dramatic', 'religious', 'ornate', 'classical'],
  'renaissance': ['classical', 'religious', 'humanistic', 'idealized'],
  'impressionist': ['light', 'nature', 'atmospheric', 'fleeting'],
  'post-impressionist': ['color', 'expression', 'form', 'modern'],
  'romantic': ['emotion', 'nature', 'dramatic', 'sublime'],
  'neoclassical': ['order', 'classical', 'idealized', 'historical'],
  'medieval': ['religious', 'symbolic', 'traditional', 'spiritual'],
  'modern': ['innovation', 'abstraction', 'contemporary'],
  'cubism': ['geometric', 'abstract', 'revolutionary', 'modern'],
  
  // 지역/문화
  'american': ['american', 'cultural', 'national'],
  'european': ['european', 'cultural', 'traditional'],
  'french': ['french', 'cultural', 'elegant'],
  'italian': ['italian', 'classical', 'renaissance'],
  'dutch': ['dutch', 'realistic', 'domestic'],
  'german': ['german', 'expressive', 'philosophical'],
  'british': ['british', 'cultural', 'traditional'],
  'japanese': ['japanese', 'zen', 'nature', 'minimal'],
  'spanish': ['spanish', 'passionate', 'dramatic'],
  'russian': ['russian', 'expressive', 'emotional'],
  'ancient': ['historical', 'mythological', 'timeless'],
  
  // 주제/내용
  'portrait': ['human', 'identity', 'intimate', 'psychological'],
  'still life': ['domestic', 'contemplative', 'symbolic', 'quiet'],
  'landscape': ['nature', 'peaceful', 'sublime', 'outdoor'],
  'seascape': ['nature', 'marine', 'movement', 'sublime'],
  'cityscape': ['urban', 'modern', 'architectural', 'busy'],
  'interior': ['domestic', 'intimate', 'comfortable', 'private'],
  'flowers': ['beauty', 'nature', 'delicate', 'seasonal'],
  'nature': ['organic', 'peaceful', 'natural', 'growth'],
  'mythology': ['narrative', 'symbolic', 'classical', 'heroic'],
  'religious': ['spiritual', 'sacred', 'transcendent', 'meaningful'],
  'history': ['narrative', 'educational', 'dramatic', 'historical'],
  'genre': ['everyday', 'social', 'narrative', 'human'],
  'nude': ['human-form', 'classical', 'artistic', 'vulnerable'],
  'figurative': ['human', 'representational', 'expressive'],
  
  // 매체/기법
  'oil painting': ['traditional', 'rich', 'detailed', 'masterful'],
  'watercolor': ['delicate', 'atmospheric', 'spontaneous', 'light'],
  'drawing': ['intimate', 'direct', 'expressive', 'sketch-like'],
  'sculpture': ['three-dimensional', 'tactile', 'monumental', 'form'],
  'etching': ['detailed', 'linear', 'intimate', 'crafted'],
  'lithograph': ['printed', 'accessible', 'graphic', 'modern'],
  'print': ['reproducible', 'graphic', 'accessible', 'democratic'],
  'pastel': ['soft', 'delicate', 'atmospheric', 'gentle'],
  'photography': ['modern', 'documentary', 'realistic', 'contemporary'],
  
  // 특정 작가들 (이미 특별한 의미가 있음)
  'monet': ['impressionist', 'light', 'atmospheric', 'garden'],
  'van gogh': ['expressive', 'emotional', 'passionate', 'textural'],
  'renoir': ['joyful', 'social', 'warm', 'human'],
  'cezanne': ['structural', 'modern', 'geometric', 'foundational'],
  'manet': ['modern', 'realistic', 'controversial', 'urban'],
  'sargent': ['elegant', 'portrait', 'society', 'masterful'],
  'homer': ['american', 'marine', 'realistic', 'outdoor'],
  'whistler': ['atmospheric', 'tonal', 'aesthetic', 'musical'],
  'rodin': ['sculptural', 'expressive', 'emotional', 'human-form'],
  'seurat': ['scientific', 'systematic', 'modern', 'pointillist'],
  'cassatt': ['intimate', 'maternal', 'impressionist', 'tender'],
  'hiroshige': ['japanese', 'landscape', 'seasonal', 'peaceful']
};

// 무드 매핑 (더 세분화된 감정 상태)
const THEME_TO_MOOD: Record<string, string[]> = {
  'dramatic': ['intense', 'powerful', 'emotional'],
  'peaceful': ['serene', 'calm', 'meditative'],
  'nature': ['organic', 'fresh', 'harmonious'],
  'religious': ['sacred', 'transcendent', 'spiritual'],
  'intimate': ['personal', 'tender', 'quiet'],
  'social': ['communal', 'celebratory', 'lively'],
  'abstract': ['intellectual', 'mysterious', 'conceptual'],
  'expressive': ['emotional', 'passionate', 'raw'],
  'classical': ['noble', 'timeless', 'harmonious'],
  'modern': ['innovative', 'challenging', 'contemporary'],
  'historical': ['grand', 'significant', 'educational'],
  'mythological': ['epic', 'symbolic', 'timeless']
};

// 복잡도 판단 기준
const COMPLEXITY_INDICATORS = {
  simple: ['flowers', 'still life', 'portrait', 'abstract', 'minimal'],
  moderate: ['landscape', 'interior', 'genre', 'impressionist'],
  complex: ['mythology', 'religious', 'history', 'baroque', 'renaissance', 'narrative']
};

// 사회적 맥락 판단
const SOCIAL_CONTEXT_MAP: Record<string, string> = {
  'portrait': 'intimate',
  'still life': 'intimate', 
  'interior': 'intimate',
  'nude': 'intimate',
  'mythology': 'public',
  'religious': 'public',
  'history': 'public',
  'genre': 'social',
  'cityscape': 'social',
  'landscape': 'solitary',
  'seascape': 'solitary',
  'nature': 'solitary'
};

// 유명 작가 목록 (다양한 시대/사조)
export const FAMOUS_ARTISTS = [
  // 르네상스
  'Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Sandro Botticelli', 'Titian',
  'Jan van Eyck', 'Albrecht Dürer', 'Hieronymus Bosch',
  
  // 바로크
  'Caravaggio', 'Peter Paul Rubens', 'Rembrandt van Rijn', 'Johannes Vermeer',
  'Diego Velázquez', 'Nicolas Poussin',
  
  // 18-19세기
  'Jean-Antoine Watteau', 'Jean-Honoré Fragonard', 'Jacques-Louis David',
  'Jean-Auguste-Dominique Ingres', 'Eugène Delacroix', 'Théodore Géricault',
  'Caspar David Friedrich', 'J.M.W. Turner', 'Gustave Courbet',
  
  // 인상주의
  'Claude Monet', 'Pierre-Auguste Renoir', 'Edgar Degas', 'Camille Pissarro',
  'Alfred Sisley', 'Berthe Morisot', 'Mary Cassatt',
  
  // 후기인상주의
  'Vincent van Gogh', 'Paul Cézanne', 'Paul Gauguin', 'Georges Seurat',
  'Henri de Toulouse-Lautrec', 'Paul Signac',
  
  // 20세기 초
  'Pablo Picasso', 'Henri Matisse', 'Wassily Kandinsky', 'Piet Mondrian',
  'Salvador Dalí', 'René Magritte', 'Giorgio de Chirico', 'Max Ernst',
  'Joan Miró', 'Paul Klee', 'Marc Chagall',
  
  // 표현주의
  'Edvard Munch', 'Egon Schiele', 'Gustav Klimt', 'Emil Nolde',
  'Ernst Ludwig Kirchner', 'Franz Marc',
  
  // 미국/현대
  'Edward Hopper', 'Georgia O\'Keeffe', 'Jackson Pollock', 'Willem de Kooning',
  'Mark Rothko', 'Andy Warhol', 'Roy Lichtenstein', 'Jasper Johns',
  'Robert Rauschenberg', 'David Hockney',
  
  // 기타 중요 작가들
  'Frida Kahlo', 'Yves Klein', 'Francis Bacon', 'Lucian Freud',
  'Cy Twombly', 'Louise Bourgeois', 'Gerhard Richter'
];

// === 핵심 함수들 ===

// 1. Cloudinary 작품들 로드 및 변환
export async function getCloudinaryArtworks(): Promise<UnifiedArtwork[]> {
  try {
    const artworksData = JSON.parse(
      await fs.promises.readFile('./frontend/public/data/artworks.json', 'utf8')
    );
    
    const cloudinaryWorks = artworksData.artworks
      .filter((artwork: any) => artwork.cloudinaryUrl) // Cloudinary URL이 있는 것만
      .map((artwork: any) => convertCloudinaryToUnified(artwork));
    
    console.log(`✅ Cloudinary 작품 ${cloudinaryWorks.length}개 로드 완료`);
    return cloudinaryWorks;
  } catch (error) {
    console.error('❌ Cloudinary 작품 로드 실패:', error);
    return [];
  }
}

// 2. Cloudinary 작품을 통합 포맷으로 변환
function convertCloudinaryToUnified(artwork: any): UnifiedArtwork {
  const searchTerm = artwork.searchTerm || '';
  const artist = artwork.artist || '';
  const medium = artwork.medium || '';
  const classification = artwork.classification || '';
  
  // 테마 추출 (searchTerm 기반)
  const themes = extractThemesFromSearchTerm(searchTerm, artist, medium, classification);
  
  // 무드 추출 (테마 기반)
  const mood = extractMoodFromThemes(themes);
  
  // 복잡도 판단
  const complexity = determineComplexity(themes, classification);
  
  // 사회적 맥락 판단
  const social_context = determineSocialContext(themes, classification);
  
  return {
    id: artwork.objectID || `cloudinary-${Date.now()}`,
    title: artwork.title || 'Untitled',
    artist: cleanArtistName(artist),
    year: artwork.date,
    medium: medium,
    source: 'cloudinary',
    
    imageUrl: artwork.cloudinaryUrl,
    thumbnailUrl: artwork.primaryImageSmall || artwork.cloudinaryUrl,
    
    description: artwork.title,
    classification: classification,
    department: artwork.department || artwork.source,
    
    themes,
    mood,
    complexity,
    social_context,
    
    originalData: artwork
  };
}

// 3. 위키미디어 작품들을 통합 포맷으로 변환
function convertWikimediaToUnified(wikiWork: any): UnifiedArtwork {
  return {
    id: wikiWork.id,
    title: wikiWork.title,
    artist: wikiWork.artist,
    year: wikiWork.year,
    period: wikiWork.period,
    movement: wikiWork.movement,
    medium: wikiWork.medium,
    source: 'wikimedia',
    
    imageUrl: wikiWork.wikiUrl,
    thumbnailUrl: wikiWork.wikiUrl,
    
    description: wikiWork.description,
    
    themes: wikiWork.themes || [],
    mood: wikiWork.mood || [],
    complexity: wikiWork.complexity,
    social_context: wikiWork.social_context,
    
    originalData: wikiWork
  };
}

// 4. 모든 작품 통합 (핵심 함수)
export async function getAllArtworks(): Promise<ArtworkPool> {
  console.log('🎨 통합 작품 풀 구성 시작...');
  
  // Cloudinary 작품들 로드
  const cloudinaryWorks = await getCloudinaryArtworks();
  
  // Wikimedia 작품들 변환
  const wikimediaWorks = WIKIMEDIA_MASTERWORKS.map(convertWikimediaToUnified);
  
  console.log(`✅ Wikimedia 작품 ${wikimediaWorks.length}개 변환 완료`);
  
  // 통합 풀 생성
  const pool: ArtworkPool = {
    cloudinaryWorks,
    wikimediaWorks,
    total: cloudinaryWorks.length + wikimediaWorks.length,
    metadata: {
      cloudinaryCount: cloudinaryWorks.length,
      wikimediaCount: wikimediaWorks.length,
      lastUpdated: new Date().toISOString(),
      sources: ['Art Institute of Chicago', 'Met Museum', 'Cleveland Museum', 'Artvee', 'Wikimedia Commons']
    }
  };
  
  console.log(`🎯 총 ${pool.total}개 작품으로 통합 풀 구성 완료`);
  console.log(`   ├─ Cloudinary: ${pool.cloudinaryCount}개`);
  console.log(`   └─ Wikimedia: ${pool.wikimediaCount}개`);
  
  return pool;
}

// 5. 유형별 작품 필터링
export async function getArtworksByType(
  type: 'period' | 'medium' | 'theme' | 'mood' | 'complexity' | 'social_context',
  value: string
): Promise<UnifiedArtwork[]> {
  const pool = await getAllArtworks();
  const allWorks = [...pool.cloudinaryWorks, ...pool.wikimediaWorks];
  
  return allWorks.filter(work => {
    switch (type) {
      case 'period':
        return work.period === value;
      case 'medium':
        return work.medium.toLowerCase().includes(value.toLowerCase());
      case 'theme':
        return work.themes.includes(value);
      case 'mood':
        return work.mood.includes(value);
      case 'complexity':
        return work.complexity === value;
      case 'social_context':
        return work.social_context === value;
      default:
        return false;
    }
  });
}

// === 유틸리티 함수들 ===

function extractThemesFromSearchTerm(searchTerm: string, artist: string, medium: string, classification: string): string[] {
  const themes = new Set<string>();
  
  // searchTerm 기반 테마 추가
  if (SEARCH_TERM_TO_THEMES[searchTerm]) {
    SEARCH_TERM_TO_THEMES[searchTerm].forEach(theme => themes.add(theme));
  }
  
  // 작가명에서 특정 작가 태그 추출
  const lowerArtist = artist.toLowerCase();
  Object.keys(SEARCH_TERM_TO_THEMES).forEach(key => {
    if (lowerArtist.includes(key.toLowerCase())) {
      SEARCH_TERM_TO_THEMES[key].forEach(theme => themes.add(theme));
    }
  });
  
  // 매체별 기본 테마
  const lowerMedium = medium.toLowerCase();
  if (lowerMedium.includes('oil')) themes.add('traditional');
  if (lowerMedium.includes('watercolor')) themes.add('delicate');
  if (lowerMedium.includes('sculpture')) themes.add('three-dimensional');
  if (lowerMedium.includes('print')) themes.add('graphic');
  
  // 분류별 기본 테마
  if (classification === 'painting') themes.add('pictorial');
  if (classification === 'sculpture') themes.add('sculptural');
  if (classification === 'photograph') themes.add('photographic');
  
  return Array.from(themes);
}

function extractMoodFromThemes(themes: string[]): string[] {
  const moods = new Set<string>();
  
  themes.forEach(theme => {
    if (THEME_TO_MOOD[theme]) {
      THEME_TO_MOOD[theme].forEach(mood => moods.add(mood));
    }
  });
  
  // 기본 무드가 없으면 'contemplative' 추가
  if (moods.size === 0) {
    moods.add('contemplative');
  }
  
  return Array.from(moods);
}

function determineComplexity(themes: string[], classification: string): 'simple' | 'moderate' | 'complex' {
  // 복잡한 테마들 확인
  const complexThemes = themes.filter(theme => 
    COMPLEXITY_INDICATORS.complex.some(indicator => theme.includes(indicator))
  );
  if (complexThemes.length > 0) return 'complex';
  
  // 단순한 테마들 확인
  const simpleThemes = themes.filter(theme => 
    COMPLEXITY_INDICATORS.simple.some(indicator => theme.includes(indicator))
  );
  if (simpleThemes.length > 0) return 'simple';
  
  // 기본값
  return 'moderate';
}

function determineSocialContext(themes: string[], classification: string): 'intimate' | 'social' | 'public' | 'solitary' {
  // 테마 기반 판단
  for (const [key, context] of Object.entries(SOCIAL_CONTEXT_MAP)) {
    if (themes.some(theme => theme.includes(key))) {
      return context as any;
    }
  }
  
  // 기본값: 분류에 따라
  if (classification === 'portrait') return 'intimate';
  if (classification === 'landscape') return 'solitary';
  return 'social';
}

function cleanArtistName(artist: string): string {
  // 작가명 정리 (국적, 생년월일 정보 제거)
  return artist
    .replace(/\n.*$/gm, '') // 개행 이후 모든 내용 제거
    .replace(/\s*\([^)]*\).*$/, '') // 괄호와 그 이후 모든 내용 제거
    .trim();
}

// 2단계: 위키미디어 퍼블릭 도메인 걸작 30선
export const WIKIMEDIA_MASTERWORKS = [
  // === 절대적 아이콘 (10개) ===
  {
    id: 'mona-lisa',
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    year: '1503-1519',
    period: 'renaissance',
    movement: 'high-renaissance',
    medium: 'oil-painting',
    themes: ['portrait', 'mystery', 'technique', 'renaissance'],
    mood: ['enigmatic', 'intimate', 'mysterious'],
    complexity: 'complex',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    description: '세계에서 가장 유명한 초상화',
    culturalSignificance: 'icon',
    reasoning: '르네상스 천재의 대표작, 전 세계적 인지도'
  },

  {
    id: 'starry-night',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889',
    period: 'post-impressionist',
    movement: 'post-impressionism',
    medium: 'oil-painting',
    themes: ['nature', 'emotion', 'movement', 'expression'],
    mood: ['turbulent', 'passionate', 'emotional'],
    complexity: 'moderate',
    social_context: 'solitary',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    description: '고흐의 격정적 감정이 담긴 불멸의 걸작',
    culturalSignificance: 'beloved',
    reasoning: '감정적 호소력 최고, 대중적 사랑'
  },

  {
    id: 'girl-pearl-earring',
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    year: '1665',
    period: 'baroque',
    movement: 'dutch-golden-age',
    medium: 'oil-painting',
    themes: ['portrait', 'light', 'mystery', 'beauty'],
    mood: ['serene', 'mysterious', 'luminous'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg',
    description: '북유럽의 모나리자',
    culturalSignificance: 'beloved',
    reasoning: '빛의 마술사 베르메르, 영화/소설 소재'
  },

  {
    id: 'guernica',
    title: 'Guernica',
    artist: 'Pablo Picasso',
    year: '1937',
    period: 'modern',
    movement: 'cubism',
    medium: 'oil-painting',
    themes: ['war', 'suffering', 'peace', 'politics'],
    mood: ['tragic', 'powerful', 'disturbing'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/7/74/PicassoGuernica.jpg',
    description: '전쟁의 참상을 고발한 20세기 걸작',
    culturalSignificance: 'political',
    reasoning: '반전 메시지, 사회적 의미, 현대미술 대표작'
  },

  {
    id: 'great-wave',
    title: 'The Great Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    year: '1831',
    period: 'edo',
    movement: 'ukiyo-e',
    medium: 'woodblock-print',
    themes: ['nature', 'power', 'japanese', 'waves'],
    mood: ['dynamic', 'powerful', 'natural'],
    complexity: 'moderate',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/1280px-The_Great_Wave_off_Kanagawa.jpg',
    description: '일본 우키요에의 대표작',
    culturalSignificance: 'cultural-bridge',
    reasoning: '동서양 문화 교류, 디자인적 완성도'
  },

  {
    id: 'birth-venus',
    title: 'The Birth of Venus',
    artist: 'Sandro Botticelli',
    year: '1484-1486',
    period: 'renaissance',
    movement: 'early-renaissance',
    medium: 'tempera',
    themes: ['mythology', 'beauty', 'love', 'renaissance'],
    mood: ['graceful', 'romantic', 'idealized'],
    complexity: 'moderate',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg',
    description: '르네상스 미의 이상',
    culturalSignificance: 'beauty-standard',
    reasoning: '서양 미술사 아름다움의 기준, 신화적 서사'
  },

  {
    id: 'scream',
    title: 'The Scream',
    artist: 'Edvard Munch',
    year: '1893',
    period: 'symbolist',
    movement: 'expressionism',
    medium: 'oil-tempera-pastel',
    themes: ['anxiety', 'existential', 'modern-alienation', 'emotion'],
    mood: ['anxious', 'disturbing', 'cathartic'],
    complexity: 'moderate',
    social_context: 'solitary',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
    description: '현대인의 불안을 상징',
    culturalSignificance: 'psychological',
    reasoning: '20세기 정신적 상황 대변, 표현주의 상징'
  },

  {
    id: 'creation-adam',
    title: 'The Creation of Adam',
    artist: 'Michelangelo',
    year: '1508-1512',
    period: 'renaissance',
    movement: 'high-renaissance',
    medium: 'fresco',
    themes: ['religion', 'creation', 'human-divine', 'renaissance'],
    mood: ['powerful', 'spiritual', 'monumental'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1280px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg',
    description: '시스티나 성당 천장화의 백미',
    culturalSignificance: 'religious-icon',
    reasoning: '서양 종교미술 최고봉, 대중 인지도'
  },

  {
    id: 'american-gothic',
    title: 'American Gothic',
    artist: 'Grant Wood',
    year: '1930',
    period: 'modern',
    movement: 'regionalism',
    medium: 'oil-painting',
    themes: ['american', 'rural', 'portrait', 'traditional'],
    mood: ['stern', 'traditional', 'iconic'],
    complexity: 'simple',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg/800px-Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg',
    description: '미국적 가치의 상징',
    culturalSignificance: 'american-icon',
    reasoning: '미국 문화 아이콘, 패러디 소재'
  },

  {
    id: 'persistence-memory',
    title: 'The Persistence of Memory',
    artist: 'Salvador Dalí',
    year: '1931',
    period: 'modern',
    movement: 'surrealism',
    medium: 'oil-painting',
    themes: ['time', 'dreams', 'subconscious', 'surreal'],
    mood: ['dreamlike', 'philosophical', 'surreal'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg',
    description: '녹은 시계로 유명한 초현실주의 걸작',
    culturalSignificance: 'surreal-icon',
    reasoning: '시간 개념에 대한 철학적 질문, 팝컬처 아이콘'
  },

  // === 추가 걸작들 (20개) ===
  {
    id: 'last-supper',
    title: 'The Last Supper',
    artist: 'Leonardo da Vinci',
    year: '1495-1498',
    period: 'renaissance',
    movement: 'high-renaissance',
    medium: 'fresco',
    themes: ['religion', 'drama', 'betrayal', 'renaissance'],
    mood: ['dramatic', 'tense', 'sacred'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg/1280px-The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg',
    description: '예수의 마지막 만찬을 그린 불멸의 걸작',
    culturalSignificance: 'religious-icon',
    reasoning: '서양 종교미술의 정점, 극적 구성의 완벽함'
  },

  {
    id: 'primavera',
    title: 'Primavera',
    artist: 'Sandro Botticelli',
    year: '1477-1482',
    period: 'renaissance',
    movement: 'early-renaissance',
    medium: 'tempera',
    themes: ['mythology', 'spring', 'love', 'nature'],
    mood: ['joyful', 'celebratory', 'harmonious'],
    complexity: 'complex',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Botticelli-primavera.jpg/1280px-Botticelli-primavera.jpg',
    description: '봄의 환희와 사랑을 담은 신화적 알레고리',
    culturalSignificance: 'renaissance-ideal',
    reasoning: '르네상스 인문주의 철학의 시각적 구현'
  },

  {
    id: 'school-athens',
    title: 'The School of Athens',
    artist: 'Raphael',
    year: '1509-1511',
    period: 'renaissance',
    movement: 'high-renaissance',
    medium: 'fresco',
    themes: ['philosophy', 'knowledge', 'classical', 'renaissance'],
    mood: ['intellectual', 'harmonious', 'noble'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
    description: '철학과 지혜의 전당을 시각화한 르네상스의 정점',
    culturalSignificance: 'intellectual-icon',
    reasoning: '서양 철학사와 미술의 완벽한 결합'
  },

  {
    id: 'david-michelangelo',
    title: 'David',
    artist: 'Michelangelo',
    year: '1501-1504',
    period: 'renaissance',
    movement: 'high-renaissance',
    medium: 'marble-sculpture',
    themes: ['heroism', 'human-form', 'biblical', 'renaissance'],
    mood: ['heroic', 'powerful', 'idealized'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Michelangelo%27s_David_-_63_grijswaarden.jpg/800px-Michelangelo%27s_David_-_63_grijswaarden.jpg',
    description: '르네상스 조각의 완벽한 인체 표현',
    culturalSignificance: 'sculpture-icon',
    reasoning: '서양 조각사의 최고봉, 인간 이상미의 구현'
  },

  {
    id: 'night-watch',
    title: 'The Night Watch',
    artist: 'Rembrandt van Rijn',
    year: '1642',
    period: 'baroque',
    movement: 'dutch-golden-age',
    medium: 'oil-painting',
    themes: ['group-portrait', 'military', 'drama', 'light'],
    mood: ['dynamic', 'dramatic', 'heroic'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1280px-The_Night_Watch_-_HD.jpg',
    description: '바로크 집단 초상화의 걸작',
    culturalSignificance: 'dutch-masterpiece',
    reasoning: '빛과 그림자의 드라마틱한 활용'
  },

  {
    id: 'liberty-leading-people',
    title: 'Liberty Leading the People',
    artist: 'Eugène Delacroix',
    year: '1830',
    period: 'romantic',
    movement: 'romanticism',
    medium: 'oil-painting',
    themes: ['revolution', 'freedom', 'patriotism', 'struggle'],
    mood: ['passionate', 'revolutionary', 'dramatic'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/1280px-Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg',
    description: '자유와 혁명의 열정을 그린 낭만주의 걸작',
    culturalSignificance: 'revolution-symbol',
    reasoning: '프랑스 혁명 정신의 상징, 정치적 메시지'
  },

  {
    id: 'wanderer-sea-fog',
    title: 'Wanderer above the Sea of Fog',
    artist: 'Caspar David Friedrich',
    year: '1818',
    period: 'romantic',
    movement: 'romanticism',
    medium: 'oil-painting',
    themes: ['nature', 'solitude', 'sublime', 'contemplation'],
    mood: ['melancholic', 'sublime', 'contemplative'],
    complexity: 'moderate',
    social_context: 'solitary',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/800px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg',
    description: '자연 앞에 선 인간의 숭고한 고독',
    culturalSignificance: 'romantic-icon',
    reasoning: '낭만주의 자연관의 완벽한 표현'
  },

  {
    id: 'impression-sunrise',
    title: 'Impression, Sunrise',
    artist: 'Claude Monet',
    year: '1872',
    period: 'impressionist',
    movement: 'impressionism',
    medium: 'oil-painting',
    themes: ['light', 'atmosphere', 'nature', 'moment'],
    mood: ['peaceful', 'atmospheric', 'fresh'],
    complexity: 'simple',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/1280px-Monet_-_Impression%2C_Sunrise.jpg',
    description: '인상주의 운동의 이름을 탄생시킨 역사적 작품',
    culturalSignificance: 'movement-founder',
    reasoning: '근대 회화의 전환점, 미술사적 중요성'
  },

  {
    id: 'water-lilies',
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: '1916-1926',
    period: 'impressionist',
    movement: 'late-impressionism',
    medium: 'oil-painting',
    themes: ['nature', 'reflection', 'serenity', 'meditation'],
    mood: ['serene', 'meditative', 'peaceful'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Claude_Monet_-_Water_Lilies_-_1906.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906.jpg',
    description: '모네 만년의 명상적 자연 관찰',
    culturalSignificance: 'meditative-masterpiece',
    reasoning: '추상회화로 향하는 길목의 걸작'
  },

  {
    id: 'sunday-grande-jatte',
    title: 'A Sunday Afternoon on the Island of La Grande Jatte',
    artist: 'Georges Seurat',
    year: '1884-1886',
    period: 'post-impressionist',
    movement: 'neo-impressionism',
    medium: 'oil-painting',
    themes: ['leisure', 'modern-life', 'science', 'harmony'],
    mood: ['calm', 'structured', 'harmonious'],
    complexity: 'complex',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1280px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg',
    description: '점묘법으로 그린 현대적 여가 생활의 풍경',
    culturalSignificance: 'scientific-art',
    reasoning: '과학적 색채 이론을 회화에 적용한 혁신'
  },

  {
    id: 'moulin-galette',
    title: 'Bal du moulin de la Galette',
    artist: 'Pierre-Auguste Renoir',
    year: '1876',
    period: 'impressionist',
    movement: 'impressionism',
    medium: 'oil-painting',
    themes: ['leisure', 'joy', 'social-life', 'light'],
    mood: ['joyful', 'celebratory', 'warm'],
    complexity: 'complex',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Auguste_Renoir_-_Dance_at_le_Moulin_de_la_Galette_-_Musee_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg/1280px-Auguste_Renoir_-_Dance_at_le_Moulin_de_la_Galette_-_Musee_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg',
    description: '파리 서민들의 즐거운 한때를 그린 인상주의 걸작',
    culturalSignificance: 'joie-de-vivre',
    reasoning: '근대 도시 여가 문화의 아름다운 기록'
  },

  {
    id: 'cafe-terrace-night',
    title: 'Café Terrace at Night',
    artist: 'Vincent van Gogh',
    year: '1888',
    period: 'post-impressionist',
    movement: 'post-impressionism',
    medium: 'oil-painting',
    themes: ['night', 'urban-life', 'light', 'emotion'],
    mood: ['warm', 'inviting', 'atmospheric'],
    complexity: 'moderate',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Vincent_Willem_van_Gogh_-_Cafe_Terrace_at_Night_%28Yorck%29.jpg/800px-Vincent_Willem_van_Gogh_-_Cafe_Terrace_at_Night_%28Yorck%29.jpg',
    description: '따뜻한 빛이 있는 고독한 밤의 풍경',
    culturalSignificance: 'night-painting',
    reasoning: '밤 풍경화의 새로운 장을 연 작품'
  },

  {
    id: 'sunflowers-van-gogh',
    title: 'Sunflowers',
    artist: 'Vincent van Gogh',
    year: '1888',
    period: 'post-impressionist',
    movement: 'post-impressionism',
    medium: 'oil-painting',
    themes: ['nature', 'friendship', 'vitality', 'color'],
    mood: ['vibrant', 'energetic', 'hopeful'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Vincent_Willem_van_Gogh_128.jpg/800px-Vincent_Willem_van_Gogh_128.jpg',
    description: '고흐의 따뜻한 우정과 희망을 담은 해바라기',
    culturalSignificance: 'friendship-symbol',
    reasoning: '예술가의 우정과 희망의 상징'
  },

  {
    id: 'kiss-klimt',
    title: 'The Kiss',
    artist: 'Gustav Klimt',
    year: '1907-1908',
    period: 'modern',
    movement: 'art-nouveau',
    medium: 'oil-gold-leaf',
    themes: ['love', 'passion', 'decorative', 'intimacy'],
    mood: ['passionate', 'romantic', 'golden'],
    complexity: 'complex',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/800px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg',
    description: '황금빛 사랑의 감정을 섬세하게 표현',
    culturalSignificance: 'love-icon',
    reasoning: '사랑을 예술로 승화시킨 대표작'
  },

  {
    id: 'les-demoiselles',
    title: 'Les Demoiselles d\'Avignon',
    artist: 'Pablo Picasso',
    year: '1907',
    period: 'modern',
    movement: 'proto-cubism',
    medium: 'oil-painting',
    themes: ['revolution', 'form', 'primitive', 'modernism'],
    mood: ['radical', 'shocking', 'groundbreaking'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Les_Demoiselles_d%27Avignon.jpg',
    description: '서구 회화 전통을 완전히 뒤바꾼 혁명적 작품',
    culturalSignificance: 'art-revolution',
    reasoning: '현대 미술의 출발점, 예술사의 분기점'
  },

  {
    id: 'composition-kandinsky',
    title: 'Composition VII',
    artist: 'Wassily Kandinsky',
    year: '1913',
    period: 'modern',
    movement: 'abstract-expressionism',
    medium: 'oil-painting',
    themes: ['abstraction', 'emotion', 'music', 'spirituality'],
    mood: ['dynamic', 'emotional', 'spiritual'],
    complexity: 'complex',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg/1280px-Vassily_Kandinsky%2C_1913_-_Composition_7.jpg',
    description: '감정과 음악이 색채로 폭발하는 추상표현주의의 걸작',
    culturalSignificance: 'abstract-pioneer',
    reasoning: '순수 추상 회화의 개척자'
  },

  {
    id: 'nighthawks',
    title: 'Nighthawks',
    artist: 'Edward Hopper',
    year: '1942',
    period: 'modern',
    movement: 'american-realism',
    medium: 'oil-painting',
    themes: ['urban-isolation', 'modern-life', 'loneliness', 'american'],
    mood: ['lonely', 'contemplative', 'atmospheric'],
    complexity: 'moderate',
    social_context: 'solitary',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/1280px-Nighthawks_by_Edward_Hopper_1942.jpg',
    description: '도시의 고독을 담은 밤의 정경',
    culturalSignificance: 'american-loneliness',
    reasoning: '현대 도시인의 소외감을 포착한 대표작'
  },

  {
    id: 'campbell-soup',
    title: 'Campbell\'s Soup Cans',
    artist: 'Andy Warhol',
    year: '1962',
    period: 'contemporary',
    movement: 'pop-art',
    medium: 'silkscreen',
    themes: ['consumer-culture', 'mass-production', 'american', 'commercial'],
    mood: ['cool', 'ironic', 'commercial'],
    complexity: 'simple',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Campbell%27s_Soup_Cans_by_Andy_Warhol.jpg',
    description: '대중문화와 소비사회를 예술로 승화',
    culturalSignificance: 'pop-culture-icon',
    reasoning: '20세기 후반 미국 소비문화의 상징'
  },

  {
    id: 'marilyn-monroe',
    title: 'Marilyn Diptych',
    artist: 'Andy Warhol',
    year: '1962',
    period: 'contemporary',
    movement: 'pop-art',
    medium: 'silkscreen',
    themes: ['celebrity', 'death', 'fame', 'american-dream'],
    mood: ['iconic', 'melancholic', 'commercial'],
    complexity: 'moderate',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/8/87/Marilynmonroe.jpg',
    description: '20세기 가장 유명한 스타의 초상',
    culturalSignificance: 'celebrity-culture',
    reasoning: '현대 유명인 문화와 죽음에 대한 성찰'
  },

  {
    id: 'sleeping-gypsy',
    title: 'The Sleeping Gypsy',
    artist: 'Henri Rousseau',
    year: '1897',
    period: 'post-impressionist',
    movement: 'naive-art',
    medium: 'oil-painting',
    themes: ['dream', 'exoticism', 'fantasy', 'primitive'],
    mood: ['dreamlike', 'mysterious', 'peaceful'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Henri_Rousseau_-_The_Sleeping_Gypsy.jpg/1280px-Henri_Rousseau_-_The_Sleeping_Gypsy.jpg',
    description: '꿈같은 평화로움을 전하는 소박한 환상',
    culturalSignificance: 'naive-masterpiece',
    reasoning: '순수 예술의 힘과 상상력의 승리'
  },

  // === 조각 걸작들 (Famous Sculptures) ===
  {
    id: 'venus-de-milo',
    title: 'Venus de Milo',
    artist: 'Unknown (Ancient Greek)',
    year: '130-100 BC',
    period: 'ancient',
    movement: 'hellenistic',
    medium: 'marble-sculpture',
    themes: ['beauty', 'mythology', 'classical', 'goddess'],
    mood: ['serene', 'timeless', 'idealized'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Venus_de_Milo_Louvre_Ma399_n4.jpg/800px-Venus_de_Milo_Louvre_Ma399_n4.jpg',
    description: '고대 그리스 조각의 완벽한 아름다움',
    culturalSignificance: 'classical-ideal',
    reasoning: '서양 미의 고전적 기준, 루브르 박물관의 상징'
  },

  {
    id: 'pieta-michelangelo',
    title: 'Pietà',
    artist: 'Michelangelo',
    year: '1498-1499',
    period: 'renaissance',
    movement: 'high-renaissance',
    medium: 'marble-sculpture',
    themes: ['religion', 'sorrow', 'maternal-love', 'sacrifice'],
    mood: ['mournful', 'tender', 'sacred'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Michelangelo%27s_Piet%C3%A0%2C_St_Peter%27s_Basilica_%281498-99%29.jpg/800px-Michelangelo%27s_Piet%C3%A0%2C_St_Peter%27s_Basilica_%281498-99%29.jpg',
    description: '성모의 애절한 사랑을 조각으로 승화',
    culturalSignificance: 'religious-masterpiece',
    reasoning: '기독교 예술의 정점, 모성애의 숭고한 표현'
  },

  {
    id: 'thinker-rodin',
    title: 'The Thinker',
    artist: 'Auguste Rodin',
    year: '1902',
    period: 'modern',
    movement: 'realism',
    medium: 'bronze-sculpture',
    themes: ['contemplation', 'philosophy', 'human-condition', 'thought'],
    mood: ['contemplative', 'powerful', 'introspective'],
    complexity: 'moderate',
    social_context: 'solitary',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/The_Thinker_Musee_Rodin.jpg/800px-The_Thinker_Musee_Rodin.jpg',
    description: '인간의 깊은 사색을 형상화한 현대 조각의 대표작',
    culturalSignificance: 'thinking-symbol',
    reasoning: '철학적 사유의 상징, 지적 활동의 아이콘'
  },

  {
    id: 'winged-victory',
    title: 'Winged Victory of Samothrace',
    artist: 'Unknown (Ancient Greek)',
    year: '190 BC',
    period: 'ancient',
    movement: 'hellenistic',
    medium: 'marble-sculpture',
    themes: ['victory', 'movement', 'triumph', 'divine'],
    mood: ['triumphant', 'dynamic', 'powerful'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Nike_of_Samothrake_Louvre_Ma2369_n4.jpg/800px-Nike_of_Samothrake_Louvre_Ma2369_n4.jpg',
    description: '승리의 여신이 바람을 가르며 내려오는 역동적 순간',
    culturalSignificance: 'victory-symbol',
    reasoning: '고대 그리스 조각의 역동성과 웅장함의 절정'
  },

  {
    id: 'kiss-rodin',
    title: 'The Kiss',
    artist: 'Auguste Rodin',
    year: '1889',
    period: 'modern',
    movement: 'realism',
    medium: 'marble-sculpture',
    themes: ['love', 'passion', 'romance', 'intimacy'],
    mood: ['passionate', 'tender', 'romantic'],
    complexity: 'complex',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Rodin_-_Le_Baiser_06.jpg/800px-Rodin_-_Le_Baiser_06.jpg',
    description: '연인들의 열정적 사랑을 대리석으로 새긴 불멸의 작품',
    culturalSignificance: 'love-sculpture',
    reasoning: '사랑의 감정을 조각으로 표현한 대표작'
  },

  {
    id: 'apollo-belvedere',
    title: 'Apollo Belvedere',
    artist: 'Unknown (Roman copy of Greek original)',
    year: '120-140 AD',
    period: 'ancient',
    movement: 'classical',
    medium: 'marble-sculpture',
    themes: ['mythology', 'ideal-beauty', 'divine', 'classical'],
    mood: ['noble', 'idealized', 'serene'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Apollo_del_Belvedere.jpg/800px-Apollo_del_Belvedere.jpg',
    description: '아폴로 신의 완벽한 남성미를 표현한 고전 조각',
    culturalSignificance: 'classical-ideal',
    reasoning: '서양 남성 미의 고전적 기준점'
  },

  // === 프레스코화 걸작들 (Famous Frescoes) ===
  {
    id: 'sistine-chapel-ceiling',
    title: 'Sistine Chapel Ceiling',
    artist: 'Michelangelo',
    year: '1508-1512',
    period: 'renaissance',
    movement: 'high-renaissance',
    medium: 'fresco',
    themes: ['religion', 'biblical', 'creation', 'divine'],
    mood: ['monumental', 'spiritual', 'awe-inspiring'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Sistine_Chapel_ceiling_02.jpg/1280px-Sistine_Chapel_ceiling_02.jpg',
    description: '시스티나 성당 천장을 장식한 창세기 대서사시',
    culturalSignificance: 'religious-monument',
    reasoning: '서양 종교미술의 절대적 걸작, 프레스코화의 정점'
  },

  {
    id: 'last-judgment-sistine',
    title: 'The Last Judgment',
    artist: 'Michelangelo',
    year: '1536-1541',
    period: 'renaissance',
    movement: 'late-renaissance',
    medium: 'fresco',
    themes: ['religion', 'judgment', 'afterlife', 'drama'],
    mood: ['dramatic', 'powerful', 'apocalyptic'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Last_Judgement_%28Michelangelo%29.jpg/800px-Last_Judgement_%28Michelangelo%29.jpg',
    description: '최후의 심판을 그린 인간 드라마의 정점',
    culturalSignificance: 'religious-drama',
    reasoning: '기독교 종말론의 시각적 구현'
  },

  {
    id: 'villa-mysteries-fresco',
    title: 'Villa of Mysteries Frescoes',
    artist: 'Unknown (Roman)',
    year: '60-50 BC',
    period: 'ancient',
    movement: 'roman',
    medium: 'fresco',
    themes: ['mystery', 'ritual', 'mythology', 'initiation'],
    mood: ['mysterious', 'ritualistic', 'dramatic'],
    complexity: 'complex',
    social_context: 'private',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Villa_dei_Misteri_02.jpg/1280px-Villa_dei_Misteri_02.jpg',
    description: '폼페이에서 발견된 신비로운 의식을 그린 고대 벽화',
    culturalSignificance: 'ancient-mystery',
    reasoning: '고대 로마 종교 의식의 귀중한 시각적 기록'
  },

  {
    id: 'disputation-holy-sacrament',
    title: 'Disputation of the Holy Sacrament',
    artist: 'Raphael',
    year: '1509-1510',
    period: 'renaissance',
    movement: 'high-renaissance',
    medium: 'fresco',
    themes: ['religion', 'theology', 'heaven-earth', 'sacred'],
    mood: ['harmonious', 'sacred', 'intellectual'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Raphael_-_La_Disputa.jpg/1280px-Raphael_-_La_Disputa.jpg',
    description: '성체에 관한 신학적 논의를 천상과 지상으로 구성',
    culturalSignificance: 'theological-art',
    reasoning: '신학과 예술의 완벽한 결합'
  },

  // === 판화 걸작들 (Famous Prints) ===
  {
    id: 'thirty-six-views-fuji',
    title: 'Thirty-six Views of Mount Fuji (Series)',
    artist: 'Katsushika Hokusai',
    year: '1830-1832',
    period: 'edo',
    movement: 'ukiyo-e',
    medium: 'woodblock-print',
    themes: ['nature', 'mountains', 'japanese', 'landscape'],
    mood: ['serene', 'contemplative', 'natural'],
    complexity: 'moderate',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Hokusai_1831_shichirigahama.jpg/1280px-Hokusai_1831_shichirigahama.jpg',
    description: '후지산을 다양한 각도에서 포착한 우키요에 명작 시리즈',
    culturalSignificance: 'landscape-series',
    reasoning: '일본 풍경화의 대표작, 서구에 일본 미술 소개'
  },

  {
    id: 'melencolia-durer',
    title: 'Melencolia I',
    artist: 'Albrecht Dürer',
    year: '1514',
    period: 'renaissance',
    movement: 'northern-renaissance',
    medium: 'engraving',
    themes: ['melancholy', 'knowledge', 'geometry', 'philosophy'],
    mood: ['melancholic', 'contemplative', 'intellectual'],
    complexity: 'complex',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/D%C3%BCrer_Melencolia_I.jpg/800px-D%C3%BCrer_Melencolia_I.jpg',
    description: '지식인의 우울과 창조적 고뇌를 상징화한 북유럽 르네상스의 걸작',
    culturalSignificance: 'intellectual-melancholy',
    reasoning: '예술가의 내적 갈등과 창조적 과정의 시각화'
  },

  {
    id: 'four-horsemen-apocalypse',
    title: 'Four Horsemen of the Apocalypse',
    artist: 'Albrecht Dürer',
    year: '1498',
    period: 'renaissance',
    movement: 'northern-renaissance',
    medium: 'woodcut',
    themes: ['apocalypse', 'religion', 'death', 'biblical'],
    mood: ['dramatic', 'apocalyptic', 'powerful'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Apocalypse_vasnetsov.jpg/800px-Apocalypse_vasnetsov.jpg',
    description: '요한계시록의 네 기사를 표현한 묵시록적 걸작',
    culturalSignificance: 'apocalyptic-vision',
    reasoning: '종교적 공포와 경외감을 시각화한 대표작'
  },

  {
    id: 'relativity-escher',
    title: 'Relativity',
    artist: 'M.C. Escher',
    year: '1953',
    period: 'contemporary',
    movement: 'op-art',
    medium: 'lithograph',
    themes: ['illusion', 'geometry', 'impossible', 'perspective'],
    mood: ['puzzling', 'mathematical', 'surreal'],
    complexity: 'complex',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Escher%27s_Relativity.jpg',
    description: '불가능한 건축 공간을 통한 시각적 착시의 걸작',
    culturalSignificance: 'optical-illusion',
    reasoning: '수학과 예술의 만남, 착시 예술의 대표작'
  },

  {
    id: 'hundred-famous-views-edo',
    title: 'One Hundred Famous Views of Edo (Series)',
    artist: 'Utagawa Hiroshige',
    year: '1856-1858',
    period: 'edo',
    movement: 'ukiyo-e',
    medium: 'woodblock-print',
    themes: ['urban-life', 'seasons', 'japanese', 'landscape'],
    mood: ['poetic', 'seasonal', 'nostalgic'],
    complexity: 'moderate',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Hiroshige_-_Sudden_Shower_over_Shin-%C5%8Chashi_bridge_and_Atake_%28Ohashi_Atake_no_y%C5%ABdachi%29%2C_from_One_Hundred_Famous_Views_of_Edo.jpg/800px-Hiroshige_-_Sudden_Shower_over_Shin-%C5%8Chashi_bridge_and_Atake_%28Ohashi_Atake_no_y%C5%ABdachi%29%2C_from_One_Hundred_Famous_Views_of_Edo.jpg',
    description: '에도 시대 도쿄의 아름다운 풍경 100선',
    culturalSignificance: 'urban-landscape',
    reasoning: '도시 풍경화의 걸작, 일본 문화의 기록'
  },

  {
    id: 'rhinoceros-durer',
    title: 'Rhinoceros',
    artist: 'Albrecht Dürer',
    year: '1515',
    period: 'renaissance',
    movement: 'northern-renaissance',
    medium: 'woodcut',
    themes: ['nature', 'exotic', 'scientific', 'observation'],
    mood: ['curious', 'detailed', 'scientific'],
    complexity: 'moderate',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/The_Rhinoceros_%28NGA_1964.8.697%29_enhanced.png/800px-The_Rhinoceros_%28NGA_1964.8.697%29_enhanced.png',
    description: '코뿔소를 직접 보지 않고 그린 상상의 동물화',
    culturalSignificance: 'scientific-art',
    reasoning: '르네상스 시대 과학적 호기심과 예술의 결합'
  },

  // === 추가 걸작들 (55개) - 100개 완성 ===

  // 더 많은 인상주의 걸작들
  {
    id: 'ballet-rehearsal',
    title: 'The Ballet Rehearsal',
    artist: 'Edgar Degas',
    year: '1873-1874',
    period: 'impressionist',
    movement: 'impressionism',
    medium: 'oil-painting',
    themes: ['ballet', 'movement', 'light', 'behind-scenes'],
    mood: ['graceful', 'dynamic', 'intimate'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Edgar_Degas_-_The_Dance_Class_-_Google_Art_Project.jpg/1280px-Edgar_Degas_-_The_Dance_Class_-_Google_Art_Project.jpg',
    description: '발레 연습실의 우아하고 자연스러운 순간',
    culturalSignificance: 'dance-art',
    reasoning: '무용 예술을 회화로 승화시킨 드가의 대표작'
  },

  {
    id: 'floor-scrapers',
    title: 'The Floor Scrapers',
    artist: 'Gustave Caillebotte',
    year: '1875',
    period: 'impressionist',
    movement: 'realism',
    medium: 'oil-painting',
    themes: ['labor', 'working-class', 'urban', 'dignity'],
    mood: ['honest', 'respectful', 'realistic'],
    complexity: 'moderate',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Gustave_Caillebotte_-_The_Floor_Scrapers_-_Google_Art_Project.jpg/1280px-Gustave_Caillebotte_-_The_Floor_Scrapers_-_Google_Art_Project.jpg',
    description: '노동하는 사람들의 존엄성을 그린 사실주의 걸작',
    culturalSignificance: 'labor-dignity',
    reasoning: '노동자의 존엄을 예술로 표현한 선구작'
  },

  {
    id: 'child-bath',
    title: 'The Child\'s Bath',
    artist: 'Mary Cassatt',
    year: '1893',
    period: 'impressionist',
    movement: 'impressionism',
    medium: 'oil-painting',
    themes: ['motherhood', 'intimacy', 'family', 'tenderness'],
    mood: ['tender', 'intimate', 'loving'],
    complexity: 'simple',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Mary_Cassatt_-_The_Child%27s_Bath_-_Google_Art_Project.jpg/800px-Mary_Cassatt_-_The_Child%27s_Bath_-_Google_Art_Project.jpg',
    description: '모성애의 순수하고 자연스러운 표현',
    culturalSignificance: 'maternal-love',
    reasoning: '여성 화가가 그린 모성의 진정한 모습'
  },

  // 르네상스 거장들 추가
  {
    id: 'calling-saint-matthew',
    title: 'The Calling of Saint Matthew',
    artist: 'Caravaggio',
    year: '1599-1600',
    period: 'baroque',
    movement: 'baroque',
    medium: 'oil-painting',
    themes: ['religion', 'dramatic-light', 'transformation', 'divine'],
    mood: ['dramatic', 'spiritual', 'transformative'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Caravaggio_-_The_Calling_of_Saint_Matthew_-_WGA04116.jpg/1280px-Caravaggio_-_The_Calling_of_Saint_Matthew_-_WGA04116.jpg',
    description: '빛과 어둠의 극적 대비로 표현한 성 마태오의 소명',
    culturalSignificance: 'chiaroscuro-master',
    reasoning: '바로크 명암법의 완성, 종교적 극적 순간의 시각화'
  },

  {
    id: 'bacchus-caravaggio',
    title: 'Bacchus',
    artist: 'Caravaggio',
    year: '1595',
    period: 'baroque',
    movement: 'baroque',
    medium: 'oil-painting',
    themes: ['mythology', 'youth', 'sensuality', 'wine'],
    mood: ['sensual', 'youthful', 'provocative'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Caravaggio_-_Bacco_adolescente_-_Google_Art_Project.jpg/800px-Caravaggio_-_Bacco_adolescente_-_Google_Art_Project.jpg',
    description: '젊은 바쿠스 신의 관능적이고 도발적인 모습',
    culturalSignificance: 'sensual-mythology',
    reasoning: '고전 신화의 현실적이고 인간적인 재해석'
  },

  {
    id: 'venus-urbino',
    title: 'Venus of Urbino',
    artist: 'Titian',
    year: '1538',
    period: 'renaissance',
    movement: 'venetian-renaissance',
    medium: 'oil-painting',
    themes: ['mythology', 'beauty', 'sensuality', 'love'],
    mood: ['sensual', 'serene', 'confident'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Tizian_102.jpg/1280px-Tizian_102.jpg',
    description: '베네치아파 색채의 극치를 보여주는 비너스의 관능미',
    culturalSignificance: 'venetian-color',
    reasoning: '색채와 관능미의 완벽한 조화'
  },

  {
    id: 'arnolfini-portrait',
    title: 'The Arnolfini Portrait',
    artist: 'Jan van Eyck',
    year: '1434',
    period: 'renaissance',
    movement: 'northern-renaissance',
    medium: 'oil-painting',
    themes: ['portrait', 'marriage', 'wealth', 'symbolism'],
    mood: ['formal', 'symbolic', 'wealthy'],
    complexity: 'complex',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Van_Eyck_-_Arnolfini_Portrait.jpg/800px-Van_Eyck_-_Arnolfini_Portrait.jpg',
    description: '북유럽 유화 기법의 정점을 보여주는 부부 초상화',
    culturalSignificance: 'oil-painting-master',
    reasoning: '유화 기법의 완성, 상징주의 회화의 걸작'
  },

  // 현대 거장들
  {
    id: 'woman-hat',
    title: 'Woman with a Hat',
    artist: 'Henri Matisse',
    year: '1905',
    period: 'modern',
    movement: 'fauvism',
    medium: 'oil-painting',
    themes: ['color', 'expression', 'portrait', 'modern'],
    mood: ['vibrant', 'bold', 'expressive'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Matisse-Woman-with-a-Hat.jpg',
    description: '야수파의 대담한 색채 실험을 보여주는 초상화',
    culturalSignificance: 'fauvism-birth',
    reasoning: '20세기 현대미술의 색채 혁명을 선도'
  },

  {
    id: 'dance-matisse',
    title: 'Dance',
    artist: 'Henri Matisse',
    year: '1910',
    period: 'modern',
    movement: 'fauvism',
    medium: 'oil-painting',
    themes: ['dance', 'joy', 'primitive', 'rhythm'],
    mood: ['joyful', 'rhythmic', 'primitive'],
    complexity: 'simple',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a8/Matissedance.jpg',
    description: '원시적 리듬과 순수한 기쁨을 표현한 춤의 찬가',
    culturalSignificance: 'primitive-joy',
    reasoning: '순수한 감정의 시각적 표현'
  },

  {
    id: 'fiddler-roof',
    title: 'I and the Village',
    artist: 'Marc Chagall',
    year: '1911',
    period: 'modern',
    movement: 'expressionism',
    medium: 'oil-painting',
    themes: ['memory', 'village-life', 'fantasy', 'nostalgia'],
    mood: ['nostalgic', 'dreamlike', 'whimsical'],
    complexity: 'complex',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c4/Chagall_IandTheVillage.jpg',
    description: '고향에 대한 꿈같은 기억과 환상이 어우러진 작품',
    culturalSignificance: 'memory-art',
    reasoning: '기억과 환상을 시각화한 샤갈의 대표작'
  },

  {
    id: 'twittering-machine',
    title: 'Twittering Machine',
    artist: 'Paul Klee',
    year: '1922',
    period: 'modern',
    movement: 'expressionism',
    medium: 'oil-watercolor',
    themes: ['fantasy', 'mechanical', 'humor', 'abstract'],
    mood: ['playful', 'mechanical', 'humorous'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/0/08/Klee_twittering_machine.jpg',
    description: '기계와 자연의 환상적 결합을 그린 클레의 상상력',
    culturalSignificance: 'mechanical-fantasy',
    reasoning: '현대 산업사회에 대한 유머러스한 성찰'
  },

  {
    id: 'harlequin-carnival',
    title: 'Harlequin\'s Carnival',
    artist: 'Joan Miró',
    year: '1924-1925',
    period: 'modern',
    movement: 'surrealism',
    medium: 'oil-painting',
    themes: ['carnival', 'fantasy', 'celebration', 'surreal'],
    mood: ['festive', 'whimsical', 'colorful'],
    complexity: 'complex',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8b/Joan_Mir%C3%B3%2C_1924-25%2C_Harlequin%27s_Carnival_%28Carnaval_d%27Arlequin%29%2C_oil_on_canvas%2C_66_x_93_cm%2C_Albright_Knox_Art_Gallery%2C_Buffalo%2C_New_York.jpg',
    description: '환상적인 축제의 세계를 그린 미로의 초현실주의 걸작',
    culturalSignificance: 'surreal-celebration',
    reasoning: '축제와 환상의 시각적 표현'
  },

  // 아시아 예술 걸작들
  {
    id: 'spring-morning-palace',
    title: 'Spring Morning in the Han Palace',
    artist: 'Qiu Ying',
    year: '1540s',
    period: 'ming',
    movement: 'chinese-classical',
    medium: 'handscroll-painting',
    themes: ['court-life', 'spring', 'elegance', 'chinese'],
    mood: ['elegant', 'peaceful', 'refined'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Spring_Dawn_in_the_Han_Palace_%28%E6%BC%A2%E5%AE%AE%E6%98%A5%E6%9B%89%E5%9C%96%29%2C_by_Qiu_Ying.jpg/1280px-Spring_Dawn_in_the_Han_Palace_%28%E6%BC%A2%E5%AE%AE%E6%98%A5%E6%9B%89%E5%9C%96%29%2C_by_Qiu_Ying.jpg',
    description: '중국 명대 궁정의 우아한 봄 아침 풍경',
    culturalSignificance: 'chinese-court-art',
    reasoning: '중국 고전 회화의 섬세함과 우아함의 정점'
  },

  {
    id: 'dwelling-fuchun-mountains',
    title: 'Dwelling in the Fuchun Mountains',
    artist: 'Huang Gongwang',
    year: '1350',
    period: 'yuan',
    movement: 'chinese-landscape',
    medium: 'ink-paper',
    themes: ['landscape', 'mountains', 'meditation', 'nature'],
    mood: ['meditative', 'serene', 'timeless'],
    complexity: 'complex',
    social_context: 'solitary',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Dwelling_in_the_Fuchun_Mountains_%28detail%29.jpg/1280px-Dwelling_in_the_Fuchun_Mountains_%28detail%29.jpg',
    description: '중국 산수화의 최고봉으로 여겨지는 걸작',
    culturalSignificance: 'chinese-landscape-master',
    reasoning: '동양 산수화의 철학적 깊이와 예술적 완성도'
  },

  {
    id: 'beauty-looking-back',
    title: 'Beauty Looking Back',
    artist: 'Hishikawa Moronobu',
    year: '1690',
    period: 'edo',
    movement: 'ukiyo-e',
    medium: 'woodblock-print',
    themes: ['beauty', 'elegance', 'japanese', 'feminine'],
    mood: ['elegant', 'graceful', 'mysterious'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Hishikawa_Moronobu_-_Beauty_Looking_Back.jpg/600px-Hishikawa_Moronobu_-_Beauty_Looking_Back.jpg',
    description: '우키요에 초기 작품으로 일본 미인화의 원형',
    culturalSignificance: 'japanese-beauty',
    reasoning: '일본 미인화의 고전적 아름다움'
  },

  {
    id: 'wind-god-thunder-god',
    title: 'Wind God and Thunder God',
    artist: 'Ogata Kōrin',
    year: '1700s',
    period: 'edo',
    movement: 'rinpa',
    medium: 'folding-screen',
    themes: ['mythology', 'nature', 'power', 'japanese'],
    mood: ['powerful', 'dynamic', 'mythological'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Fujin_raijin_zu_byobu.jpg/1280px-Fujin_raijin_zu_byobu.jpg',
    description: '일본 신화의 풍신과 뢰신을 그린 장엄한 병풍화',
    culturalSignificance: 'japanese-mythology',
    reasoning: '일본 전통 회화의 장식적 완성도'
  },

  // 유명한 여성 화가들
  {
    id: 'two-fridas',
    title: 'The Two Fridas',
    artist: 'Frida Kahlo',
    year: '1939',
    period: 'modern',
    movement: 'surrealism',
    medium: 'oil-painting',
    themes: ['identity', 'pain', 'duality', 'mexican'],
    mood: ['introspective', 'painful', 'honest'],
    complexity: 'complex',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/6/66/Frida_Kahlo_%281939%29_The_Two_Fridas.jpg',
    description: '프리다 칼로의 이중적 정체성을 표현한 자화상',
    culturalSignificance: 'identity-art',
    reasoning: '여성 화가의 정체성과 고통을 솔직하게 표현'
  },

  {
    id: 'jimson-weed',
    title: 'Jimson Weed/White Flower No. 1',
    artist: 'Georgia O\'Keeffe',
    year: '1932',
    period: 'modern',
    movement: 'american-modernism',
    medium: 'oil-painting',
    themes: ['nature', 'flower', 'abstraction', 'feminine'],
    mood: ['serene', 'organic', 'sensual'],
    complexity: 'simple',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Georgia_O%27Keeffe_-_Jimson_Weed.jpg',
    description: '꽃을 확대하여 추상적 아름다움으로 승화',
    culturalSignificance: 'floral-abstraction',
    reasoning: '자연의 추상적 아름다움을 발견한 독창적 시각'
  },

  {
    id: 'judith-slaying-holofernes',
    title: 'Judith Slaying Holofernes',
    artist: 'Artemisia Gentileschi',
    year: '1614-1620',
    period: 'baroque',
    movement: 'baroque',
    medium: 'oil-painting',
    themes: ['biblical', 'female-power', 'justice', 'drama'],
    mood: ['dramatic', 'powerful', 'vengeful'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Artemisia_Gentileschi_-_Judith_Slaying_Holofernes_-_WGA8563.jpg/800px-Artemisia_Gentileschi_-_Judith_Slaying_Holofernes_-_WGA8563.jpg',
    description: '여성의 힘과 정의를 극적으로 표현한 바로크 걸작',
    culturalSignificance: 'female-empowerment',
    reasoning: '여성 화가가 그린 여성의 힘과 복수'
  },

  // 조각 추가
  {
    id: 'burghers-calais',
    title: 'The Burghers of Calais',
    artist: 'Auguste Rodin',
    year: '1889',
    period: 'modern',
    movement: 'realism',
    medium: 'bronze-sculpture',
    themes: ['heroism', 'sacrifice', 'history', 'collective'],
    mood: ['heroic', 'solemn', 'dignified'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Calais_Burghers_Rodin.jpg/800px-Calais_Burghers_Rodin.jpg',
    description: '칼레 시민들의 숭고한 희생을 기린 기념비적 조각',
    culturalSignificance: 'heroic-sacrifice',
    reasoning: '집단 영웅주의의 조각적 표현'
  },

  {
    id: 'gates-hell',
    title: 'The Gates of Hell',
    artist: 'Auguste Rodin',
    year: '1880-1917',
    period: 'modern',
    movement: 'realism',
    medium: 'bronze-sculpture',
    themes: ['hell', 'suffering', 'dante', 'drama'],
    mood: ['dramatic', 'tormented', 'powerful'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Porte_Enfer_Rodin.jpg/600px-Porte_Enfer_Rodin.jpg',
    description: '단테의 신곡을 조각으로 표현한 로댕의 필생의 역작',
    culturalSignificance: 'literary-sculpture',
    reasoning: '문학과 조각의 결합, 인간 고뇌의 시각화'
  },

  {
    id: 'discus-thrower',
    title: 'Discobolus (Discus Thrower)',
    artist: 'Myron',
    year: '460-450 BC',
    period: 'ancient',
    movement: 'classical',
    medium: 'marble-sculpture',
    themes: ['athletics', 'ideal-body', 'movement', 'classical'],
    mood: ['athletic', 'dynamic', 'idealized'],
    complexity: 'moderate',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Discus_Thrower_-_Palazzo_Massimo_-_Rome.jpg/600px-Discus_Thrower_-_Palazzo_Massimo_-_Rome.jpg',
    description: '운동하는 인체의 완벽한 순간을 포착한 고전 조각',
    culturalSignificance: 'athletic-ideal',
    reasoning: '고대 그리스 체육 정신과 인체미의 결합'
  },

  // 건축 걸작들
  {
    id: 'parthenon',
    title: 'Parthenon',
    artist: 'Ictinus and Callicrates',
    year: '447-438 BC',
    period: 'ancient',
    movement: 'classical',
    medium: 'architecture',
    themes: ['religion', 'democracy', 'classical', 'athens'],
    mood: ['noble', 'harmonious', 'timeless'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_Parthenon_in_Athens.jpg/1280px-The_Parthenon_in_Athens.jpg',
    description: '고대 그리스 건축의 완벽한 비례와 조화',
    culturalSignificance: 'architectural-perfection',
    reasoning: '서양 건축의 영원한 모델, 민주주의의 상징'
  },

  {
    id: 'notre-dame',
    title: 'Notre-Dame de Paris',
    artist: 'Various Medieval Architects',
    year: '1163-1345',
    period: 'medieval',
    movement: 'gothic',
    medium: 'architecture',
    themes: ['religion', 'gothic', 'cathedral', 'light'],
    mood: ['spiritual', 'uplifting', 'majestic'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Notre-Dame_de_Paris%2C_France_%282018%29.jpg/800px-Notre-Dame_de_Paris%2C_France_%282018%29.jpg',
    description: '고딕 건축의 정점을 보여주는 파리 성모원',
    culturalSignificance: 'gothic-masterpiece',
    reasoning: '중세 기독교 정신과 건축 기술의 완벽한 결합'
  },

  // 사진 예술
  {
    id: 'migrant-mother',
    title: 'Migrant Mother',
    artist: 'Dorothea Lange',
    year: '1936',
    period: 'modern',
    movement: 'documentary-photography',
    medium: 'photography',
    themes: ['depression', 'poverty', 'maternal', 'documentary'],
    mood: ['concerned', 'dignified', 'documentary'],
    complexity: 'simple',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Lange-MigrantMother02.jpg/600px-Lange-MigrantMother02.jpg',
    description: '대공황 시대 어머니의 걱정과 존엄성을 담은 기록사진',
    culturalSignificance: 'documentary-icon',
    reasoning: '사진의 사회적 힘과 기록적 가치를 보여준 대표작'
  },

  {
    id: 'afghan-girl',
    title: 'Afghan Girl',
    artist: 'Steve McCurry',
    year: '1984',
    period: 'contemporary',
    movement: 'photojournalism',
    medium: 'photography',
    themes: ['war', 'refugee', 'eyes', 'human-spirit'],
    mood: ['piercing', 'haunting', 'resilient'],
    complexity: 'simple',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Sharbat_Gula.jpg',
    description: '아프간 난민 소녀의 강렬한 눈빛이 전하는 메시지',
    culturalSignificance: 'humanitarian-photography',
    reasoning: '전쟁의 비극과 인간의 존엄성을 동시에 보여준 걸작'
  },

  // 동양 서예 및 회화
  {
    id: 'orchid-pavilion-preface',
    title: 'Orchid Pavilion Preface',
    artist: 'Wang Xizhi',
    year: '353',
    period: 'ancient',
    movement: 'chinese-calligraphy',
    medium: 'calligraphy',
    themes: ['literature', 'friendship', 'nature', 'philosophy'],
    mood: ['elegant', 'scholarly', 'philosophical'],
    complexity: 'complex',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/LantingXu.jpg/800px-LantingXu.jpg',
    description: '중국 서예의 성전으로 여겨지는 난정서',
    culturalSignificance: 'calligraphy-masterpiece',
    reasoning: '서예 예술의 최고봉, 문학과 서예의 완벽한 결합'
  },

  // 현대 추상화
  {
    id: 'composition-red-blue-yellow',
    title: 'Composition with Red Blue and Yellow',
    artist: 'Piet Mondrian',
    year: '1930',
    period: 'modern',
    movement: 'de-stijl',
    medium: 'oil-painting',
    themes: ['abstraction', 'geometry', 'pure-art', 'harmony'],
    mood: ['balanced', 'pure', 'intellectual'],
    complexity: 'simple',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Piet_Mondriaan%2C_1930_-_Mondrian_Composition_II_in_Red%2C_Blue%2C_and_Yellow.jpg/600px-Piet_Mondriaan%2C_1930_-_Mondrian_Composition_II_in_Red%2C_Blue%2C_and_Yellow.jpg',
    description: '순수 추상의 극한을 추구한 몬드리안의 대표작',
    culturalSignificance: 'pure-abstraction',
    reasoning: '순수 추상 회화의 완성, 현대 디자인에 큰 영향'
  },

  {
    id: 'black-square',
    title: 'Black Square',
    artist: 'Kazimir Malevich',
    year: '1915',
    period: 'modern',
    movement: 'suprematism',
    medium: 'oil-painting',
    themes: ['abstraction', 'revolution', 'pure-form', 'zero'],
    mood: ['revolutionary', 'minimal', 'conceptual'],
    complexity: 'simple',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Malevich-Black_Square_1915.jpg/600px-Malevich-Black_Square_1915.jpg',
    description: '회화 예술의 제로 지점을 선언한 혁명적 작품',
    culturalSignificance: 'art-revolution',
    reasoning: '구상 회화의 종료와 순수 추상의 시작을 알린 기념비적 작품'
  },

  // 표현주의 걸작들
  {
    id: 'blue-rider',
    title: 'The Blue Rider',
    artist: 'Wassily Kandinsky',
    year: '1903',
    period: 'modern',
    movement: 'expressionism',
    medium: 'oil-painting',
    themes: ['spirituality', 'color', 'emotion', 'symbolic'],
    mood: ['spiritual', 'mysterious', 'symbolic'],
    complexity: 'moderate',
    social_context: 'solitary',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Vassily_Kandinsky%2C_1903%2C_Der_Blaue_Reiter_%28The_Blue_Rider%29%2C_oil_on_canvas%2C_52.1_x_54.6_cm%2C_Stiftung_Sammlung_E.G._B%C3%BChrle%2C_Zurich.jpg/800px-Vassily_Kandinsky%2C_1903%2C_Der_Blaue_Reiter_%28The_Blue_Rider%29%2C_oil_on_canvas%2C_52.1_x_54.6_cm%2C_Stiftung_Sammlung_E.G._B%C3%BChrle%2C_Zurich.jpg',
    description: '칸딘스키의 초기 상징주의 작품으로 청기사파의 상징',
    culturalSignificance: 'spiritual-art',
    reasoning: '예술의 정신적 가치를 추구한 표현주의 운동의 상징'
  },

  {
    id: 'portrait-adele',
    title: 'Portrait of Adele Bloch-Bauer I',
    artist: 'Gustav Klimt',
    year: '1907',
    period: 'modern',
    movement: 'art-nouveau',
    medium: 'oil-gold-leaf',
    themes: ['portrait', 'luxury', 'decoration', 'gold'],
    mood: ['luxurious', 'decorative', 'golden'],
    complexity: 'complex',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Gustav_Klimt_046.jpg/600px-Gustav_Klimt_046.jpg',
    description: '황금시대 빈의 사치와 아름다움을 담은 초상화',
    culturalSignificance: 'golden-portrait',
    reasoning: '아르누보 장식 예술의 정점, 빈 분리파의 대표작'
  },

  // 팝 아트 및 현대미술
  {
    id: 'drowning-girl',
    title: 'Drowning Girl',
    artist: 'Roy Lichtenstein',
    year: '1963',
    period: 'contemporary',
    movement: 'pop-art',
    medium: 'oil-magna-canvas',
    themes: ['pop-culture', 'romance', 'comic', 'drama'],
    mood: ['dramatic', 'commercial', 'ironic'],
    complexity: 'simple',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7c/Drowning_Girl.jpg',
    description: '만화책 스타일로 그린 팝아트의 대표작',
    culturalSignificance: 'pop-art-icon',
    reasoning: '대중문화를 고급 예술로 끌어올린 팝아트의 걸작'
  },

  {
    id: 'balloon-dog',
    title: 'Balloon Dog',
    artist: 'Jeff Koons',
    year: '1994-2000',
    period: 'contemporary',
    movement: 'neo-pop',
    medium: 'steel-sculpture',
    themes: ['childhood', 'kitsch', 'celebration', 'commercial'],
    mood: ['playful', 'celebratory', 'nostalgic'],
    complexity: 'simple',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f0/Balloon_dog_yellow.jpg',
    description: '풍선 강아지를 거대한 스테인리스 조각으로 재현',
    culturalSignificance: 'contemporary-kitsch',
    reasoning: '현대 소비문화와 키치 예술의 만남'
  },

  // 아프리카 및 비서구 예술
  {
    id: 'benin-bronzes',
    title: 'Benin Bronzes',
    artist: 'Benin Kingdom Artists',
    year: '13th-16th century',
    period: 'medieval',
    movement: 'african-classical',
    medium: 'bronze-sculpture',
    themes: ['royalty', 'african', 'court-art', 'history'],
    mood: ['regal', 'powerful', 'ceremonial'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Benin_Bronzes.jpg/800px-Benin_Bronzes.jpg',
    description: '베냉 왕국의 정교한 청동 궁정 예술',
    culturalSignificance: 'african-masterpiece',
    reasoning: '아프리카 고전 예술의 정교함과 웅장함'
  },

  // 종교 미술 걸작들
  {
    id: 'isenheim-altarpiece',
    title: 'Isenheim Altarpiece',
    artist: 'Matthias Grünewald',
    year: '1512-1516',
    period: 'renaissance',
    movement: 'northern-renaissance',
    medium: 'oil-painting',
    themes: ['religion', 'suffering', 'resurrection', 'medical'],
    mood: ['intense', 'spiritual', 'healing'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Mathis_Gothart_Grunewald_078.jpg/800px-Mathis_Gothart_Grunewald_078.jpg',
    description: '병원 제단화로 제작된 고통과 구원의 종교화',
    culturalSignificance: 'religious-healing',
    reasoning: '질병과 치유를 주제로 한 독특한 종교 예술'
  },

  // 정물화 걸작들
  {
    id: 'apples-cezanne',
    title: 'The Basket of Apples',
    artist: 'Paul Cézanne',
    year: '1893',
    period: 'post-impressionist',
    movement: 'post-impressionism',
    medium: 'oil-painting',
    themes: ['still-life', 'form', 'structure', 'modern'],
    mood: ['structured', 'analytical', 'revolutionary'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Paul_C%C3%A9zanne_-_The_Basket_of_Apples_-_1895.jpg/800px-Paul_C%C3%A9zanne_-_The_Basket_of_Apples_-_1895.jpg',
    description: '정물화를 통해 현대 회화의 새로운 방향을 제시',
    culturalSignificance: 'modern-still-life',
    reasoning: '정물화의 혁신, 현대 미술의 출발점'
  },

  {
    id: 'vanitas-steenwyck',
    title: 'Vanitas Still Life',
    artist: 'Harmen Steenwyck',
    year: '1640',
    period: 'baroque',
    movement: 'dutch-golden-age',
    medium: 'oil-painting',
    themes: ['vanitas', 'mortality', 'time', 'philosophy'],
    mood: ['contemplative', 'melancholic', 'philosophical'],
    complexity: 'complex',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Harmen_Steenwyck_-_Vanitas_-_WGA21650.jpg/800px-Harmen_Steenwyck_-_Vanitas_-_WGA21650.jpg',
    description: '인생의 무상함을 상징물로 표현한 바니타스 정물화',
    culturalSignificance: 'memento-mori',
    reasoning: '죽음과 시간에 대한 철학적 성찰을 담은 정물화'
  },

  // 초상화 걸작들 추가
  {
    id: 'blue-boy',
    title: 'The Blue Boy',
    artist: 'Thomas Gainsborough',
    year: '1770',
    period: 'romantic',
    movement: 'british-portraiture',
    medium: 'oil-painting',
    themes: ['portrait', 'aristocracy', 'youth', 'elegance'],
    mood: ['elegant', 'aristocratic', 'youthful'],
    complexity: 'moderate',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Thomas_Gainsborough_-_The_Blue_Boy_%28Jonathan_Buttall%29_-_Google_Art_Project.jpg/600px-Thomas_Gainsborough_-_The_Blue_Boy_%28Jonathan_Buttall%29_-_Google_Art_Project.jpg',
    description: '영국 초상화의 우아함을 보여주는 18세기 걸작',
    culturalSignificance: 'british-elegance',
    reasoning: '영국 귀족 초상화의 전형, 색채와 우아함의 조화'
  },

  // 마지막 10개 작품들
  {
    id: 'luncheon-grass',
    title: 'Luncheon on the Grass',
    artist: 'Édouard Manet',
    year: '1863',
    period: 'modern',
    movement: 'realism',
    medium: 'oil-painting',
    themes: ['controversy', 'modern-life', 'nude', 'revolution'],
    mood: ['provocative', 'modern', 'challenging'],
    complexity: 'complex',
    social_context: 'social',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Edouard_Manet_-_Luncheon_on_the_Grass_-_Google_Art_Project.jpg/1280px-Edouard_Manet_-_Luncheon_on_the_Grass_-_Google_Art_Project.jpg',
    description: '전통 회화에 도전한 마네의 도발적 걸작',
    culturalSignificance: 'artistic-revolution',
    reasoning: '아카데미 회화에 대한 반항, 현대 미술의 출발점'
  },

  {
    id: 'olympia-manet',
    title: 'Olympia',
    artist: 'Édouard Manet',
    year: '1863',
    period: 'modern',
    movement: 'realism',
    medium: 'oil-painting',
    themes: ['prostitution', 'modern-woman', 'scandal', 'gaze'],
    mood: ['defiant', 'modern', 'direct'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Edouard_Manet_-_Olympia_-_Google_Art_Project_3.jpg/1280px-Edouard_Manet_-_Olympia_-_Google_Art_Project_3.jpg',
    description: '현대 여성의 당당한 시선을 그린 혁신적 누드화',
    culturalSignificance: 'modern-nude',
    reasoning: '여성의 시선과 주체성을 혁신적으로 표현'
  },

  {
    id: 'weeping-woman',
    title: 'Weeping Woman',
    artist: 'Pablo Picasso',
    year: '1937',
    period: 'modern',
    movement: 'cubism',
    medium: 'oil-painting',
    themes: ['war', 'grief', 'woman', 'suffering'],
    mood: ['tragic', 'emotional', 'fragmented'],
    complexity: 'complex',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/1/14/Picasso_The_Weeping_Woman_Tate_identifier_T05010_10.jpg',
    description: '전쟁의 비극을 여성의 슬픔으로 표현한 입체주의 걸작',
    culturalSignificance: 'war-grief',
    reasoning: '게르니카와 함께 반전 메시지를 담은 피카소의 역작'
  },

  {
    id: 'red-studio',
    title: 'The Red Studio',
    artist: 'Henri Matisse',
    year: '1911',
    period: 'modern',
    movement: 'fauvism',
    medium: 'oil-painting',
    themes: ['studio', 'art-making', 'red', 'creative-space'],
    mood: ['creative', 'warm', 'artistic'],
    complexity: 'moderate',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Matisse-The-Red-Studio-MOMA-1911.jpg',
    description: '화가의 작업실을 빨간색으로 통일하여 그린 혁신적 작품',
    culturalSignificance: 'artistic-space',
    reasoning: '예술가의 창작 공간에 대한 새로운 시각'
  },

  {
    id: 'bedroom-arles',
    title: 'The Bedroom',
    artist: 'Vincent van Gogh',
    year: '1888',
    period: 'post-impressionist',
    movement: 'post-impressionism',
    medium: 'oil-painting',
    themes: ['intimacy', 'home', 'comfort', 'personal-space'],
    mood: ['cozy', 'personal', 'warm'],
    complexity: 'simple',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Vincent_van_Gogh_-_The_Bedroom_-_Google_Art_Project.jpg/1280px-Vincent_van_Gogh_-_The_Bedroom_-_Google_Art_Project.jpg',
    description: '반 고흐가 아를에서 머물던 침실의 따뜻한 기록',
    culturalSignificance: 'personal-space',
    reasoning: '개인적 공간의 소중함을 담은 감동적 작품'
  },

  {
    id: 'autumn-rhythm',
    title: 'Autumn Rhythm (Number 30)',
    artist: 'Jackson Pollock',
    year: '1950',
    period: 'contemporary',
    movement: 'abstract-expressionism',
    medium: 'oil-enamel-aluminum',
    themes: ['abstraction', 'energy', 'rhythm', 'nature'],
    mood: ['energetic', 'rhythmic', 'natural'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a2/No._30.jpg',
    description: '액션 페인팅의 극치를 보여주는 폴록의 대표작',
    culturalSignificance: 'action-painting',
    reasoning: '회화 행위 자체를 예술로 승화시킨 혁신적 작품'
  },

  {
    id: 'orange-red-yellow',
    title: 'Orange, Red, Yellow',
    artist: 'Mark Rothko',
    year: '1961',
    period: 'contemporary',
    movement: 'color-field',
    medium: 'oil-painting',
    themes: ['color', 'emotion', 'meditation', 'spirituality'],
    mood: ['meditative', 'spiritual', 'warm'],
    complexity: 'simple',
    social_context: 'intimate',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/No._61_%28Rust_and_Blue%29.jpg',
    description: '순수한 색채로 감정과 영성을 표현한 로스코의 명상화',
    culturalSignificance: 'color-emotion',
    reasoning: '색채 자체의 감정적 힘을 보여준 추상표현주의 걸작'
  },

  {
    id: 'fountain-duchamp',
    title: 'Fountain',
    artist: 'Marcel Duchamp',
    year: '1917',
    period: 'modern',
    movement: 'conceptual-art',
    medium: 'readymade-sculpture',
    themes: ['conceptual', 'controversy', 'art-definition', 'dada'],
    mood: ['provocative', 'conceptual', 'revolutionary'],
    complexity: 'simple',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Marcel_Duchamp%2C_1917%2C_Fountain%2C_photograph_by_Alfred_Stieglitz.jpg/600px-Marcel_Duchamp%2C_1917%2C_Fountain%2C_photograph_by_Alfred_Stieglitz.jpg',
    description: '예술의 정의에 근본적 질문을 던진 개념미술의 출발점',
    culturalSignificance: 'art-revolution',
    reasoning: '20세기 예술사에서 가장 도발적이고 영향력 있는 작품'
  },

  {
    id: 'spiral-jetty',
    title: 'Spiral Jetty',
    artist: 'Robert Smithson',
    year: '1970',
    period: 'contemporary',
    movement: 'land-art',
    medium: 'earth-sculpture',
    themes: ['nature', 'time', 'entropy', 'landscape'],
    mood: ['monumental', 'natural', 'temporal'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Spiral-jetty-from-rozel-point.png/1280px-Spiral-jetty-from-rozel-point.png',
    description: '자연 속에 만든 거대한 나선형 조각 작품',
    culturalSignificance: 'land-art',
    reasoning: '갤러리를 벗어나 자연과 결합한 현대미술의 새로운 방향'
  },

  {
    id: 'infinity-rooms',
    title: 'Infinity Rooms',
    artist: 'Yayoi Kusama',
    year: '1965-ongoing',
    period: 'contemporary',
    movement: 'installation-art',
    medium: 'mixed-media-installation',
    themes: ['infinity', 'obsession', 'repetition', 'space'],
    mood: ['hypnotic', 'infinite', 'immersive'],
    complexity: 'complex',
    social_context: 'public',
    wikiUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Yayoi_Kusama%27s_Infinity_Room_%2832073706753%29.jpg/800px-Yayoi_Kusama%27s_Infinity_Room_%2832073706753%29.jpg',
    description: '무한 반복과 몰입을 통한 쿠사마 야요이의 우주적 예술',
    culturalSignificance: 'immersive-art',
    reasoning: '관객 참여형 설치 미술의 대표작, 현대 미술관의 필수 경험'
  }
];

// === 추가 유틸리티 함수들 ===

// 6. 개성 유형별 추천 작품 (SAYU 16가지 동물 유형)
export async function getArtworksForPersonalityType(animalType: string): Promise<UnifiedArtwork[]> {
  const pool = await getAllArtworks();
  const allWorks = [...pool.cloudinaryWorks, ...pool.wikimediaWorks];
  
  // 각 동물 유형별 선호 특성 (SAYU_TYPE_DEFINITIONS.md 참조)
  const personalityPreferences: Record<string, {
    themes: string[];
    moods: string[];
    complexity: string[];
    social_context: string[];
  }> = {
    'LAEF': { // 여우 - 탐험적이고 감정적
      themes: ['abstract', 'modern', 'mysterious', 'experimental'],
      moods: ['mysterious', 'intellectual', 'challenging'],
      complexity: ['complex', 'moderate'],
      social_context: ['intimate', 'solitary']
    },
    'LAEC': { // 고양이 - 독립적이고 감정적
      themes: ['intimate', 'delicate', 'aesthetic', 'personal'],
      moods: ['serene', 'contemplative', 'tender'],
      complexity: ['simple', 'moderate'],
      social_context: ['intimate']
    },
    'SREF': { // 강아지 - 사교적이고 감정적
      themes: ['social', 'joyful', 'warm', 'celebratory'],
      moods: ['joyful', 'warm', 'communal'],
      complexity: ['simple', 'moderate'],
      social_context: ['social', 'public']
    },
    // 추가 유형들은 필요시 확장
  };
  
  const prefs = personalityPreferences[animalType];
  if (!prefs) return allWorks.slice(0, 20); // 기본값
  
  return allWorks.filter(work => {
    const themeMatch = work.themes.some(theme => prefs.themes.includes(theme));
    const moodMatch = work.mood.some(mood => prefs.moods.includes(mood));
    const complexityMatch = prefs.complexity.includes(work.complexity);
    const contextMatch = prefs.social_context.includes(work.social_context);
    
    return themeMatch || moodMatch || complexityMatch || contextMatch;
  }).slice(0, 50); // 최대 50개 반환
}

// 7. 풀 품질 평가 및 통계
export async function evaluatePoolQuality(): Promise<any> {
  const pool = await getAllArtworks();
  const allWorks = [...pool.cloudinaryWorks, ...pool.wikimediaWorks];
  
  const stats = {
    total: allWorks.length,
    sources: {
      cloudinary: pool.cloudinaryCount,
      wikimedia: pool.wikimediaCount
    },
    
    // 다양성 분석
    diversity: {
      periods: [...new Set(allWorks.map(w => w.period).filter(Boolean))].length,
      movements: [...new Set(allWorks.map(w => w.movement).filter(Boolean))].length,
      mediums: [...new Set(allWorks.map(w => w.medium))].length,
      artists: [...new Set(allWorks.map(w => w.artist))].length,
      themes: [...new Set(allWorks.flatMap(w => w.themes))].length,
      moods: [...new Set(allWorks.flatMap(w => w.mood))].length
    },
    
    // 복잡도 분포
    complexity: {
      simple: allWorks.filter(w => w.complexity === 'simple').length,
      moderate: allWorks.filter(w => w.complexity === 'moderate').length,
      complex: allWorks.filter(w => w.complexity === 'complex').length
    },
    
    // 사회적 맥락 분포
    socialContext: {
      intimate: allWorks.filter(w => w.social_context === 'intimate').length,
      social: allWorks.filter(w => w.social_context === 'social').length,
      public: allWorks.filter(w => w.social_context === 'public').length,
      solitary: allWorks.filter(w => w.social_context === 'solitary').length
    },
    
    // 품질 점수 (다양성의 합)
    qualityScore: 0
  };
  
  stats.qualityScore = stats.diversity.periods + stats.diversity.movements + 
                      stats.diversity.mediums + stats.diversity.artists + 
                      stats.diversity.themes + stats.diversity.moods;
  
  return stats;
}

// 8. 검색 함수
export async function searchArtworks(query: string): Promise<UnifiedArtwork[]> {
  const pool = await getAllArtworks();
  const allWorks = [...pool.cloudinaryWorks, ...pool.wikimediaWorks];
  const lowerQuery = query.toLowerCase();
  
  return allWorks.filter(work => 
    work.title.toLowerCase().includes(lowerQuery) ||
    work.artist.toLowerCase().includes(lowerQuery) ||
    work.themes.some(theme => theme.toLowerCase().includes(lowerQuery)) ||
    work.mood.some(mood => mood.toLowerCase().includes(lowerQuery)) ||
    work.medium.toLowerCase().includes(lowerQuery) ||
    (work.description && work.description.toLowerCase().includes(lowerQuery))
  );
}

// 9. 랜덤 작품 선택 (개성 가중치 적용)
export async function getRandomArtworks(
  count: number = 10,
  personalityBias?: string
): Promise<UnifiedArtwork[]> {
  const pool = await getAllArtworks();
  let allWorks = [...pool.cloudinaryWorks, ...pool.wikimediaWorks];
  
  // 개성 편향 적용
  if (personalityBias) {
    const personalityWorks = await getArtworksForPersonalityType(personalityBias);
    const biasedPool = [
      ...personalityWorks, // 개성 맞춤 작품 우선
      ...allWorks.filter(w => !personalityWorks.some(p => p.id === w.id)) // 나머지 작품들
    ];
    allWorks = biasedPool;
  }
  
  // 셔플 후 선택
  const shuffled = allWorks.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 10. 통합 풀 내보내기 (개발용)
export async function exportUnifiedPool(outputPath?: string): Promise<void> {
  const pool = await getAllArtworks();
  const exportData = {
    metadata: {
      ...pool.metadata,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    },
    artworks: [...pool.cloudinaryWorks, ...pool.wikimediaWorks]
  };
  
  const filePath = outputPath || './unified-artwork-pool.json';
  await fs.promises.writeFile(filePath, JSON.stringify(exportData, null, 2));
  console.log(`📁 통합 작품 풀이 ${filePath}에 저장되었습니다.`);
}