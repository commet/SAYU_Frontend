// 예술사적으로 중요한 작가들의 누락 여부 체크 및 APT 매칭 분석
// 주요 미술관 소장 작가 & 미술사 교과서 필수 작가 기준

require('dotenv').config();
const { pool } = require('./src/config/database');

// 예술사적 중요도별 작가 분류
const artistCategories = {
  // 최고 중요도 (100점) - 미술사 교과서 필수 작가들
  essentialMasters: [
    // 르네상스 삼대 거장
    { name: 'Leonardo da Vinci', period: 'Renaissance', nationality: 'Italian' },
    { name: 'Michelangelo Buonarroti', period: 'Renaissance', nationality: 'Italian' },
    { name: 'Raphael', period: 'Renaissance', nationality: 'Italian' },
    
    // 인상주의 핵심
    { name: 'Claude Monet', period: 'Impressionism', nationality: 'French' },
    { name: 'Vincent van Gogh', period: 'Post-Impressionism', nationality: 'Dutch' },
    { name: 'Paul Cézanne', period: 'Post-Impressionism', nationality: 'French' },
    
    // 현대미술의 아버지들
    { name: 'Pablo Picasso', period: '20th Century', nationality: 'Spanish' },
    { name: 'Henri Matisse', period: '20th Century', nationality: 'French' },
    { name: 'Wassily Kandinsky', period: '20th Century', nationality: 'Russian' },
    
    // 바로크 거장
    { name: 'Rembrandt van Rijn', period: 'Baroque', nationality: 'Dutch' },
    { name: 'Caravaggio', period: 'Baroque', nationality: 'Italian' },
    { name: 'Diego Velázquez', period: 'Baroque', nationality: 'Spanish' },
    
    // 미국 현대미술
    { name: 'Jackson Pollock', period: 'Abstract Expressionism', nationality: 'American' },
    { name: 'Andy Warhol', period: 'Pop Art', nationality: 'American' },
  ],
  
  // 매우 중요 (90점) - 주요 미술관 영구 소장 작가
  majorMuseumArtists: [
    // 초기 르네상스
    { name: 'Giotto di Bondone', period: 'Proto-Renaissance', nationality: 'Italian' },
    { name: 'Sandro Botticelli', period: 'Renaissance', nationality: 'Italian' },
    { name: 'Jan van Eyck', period: 'Northern Renaissance', nationality: 'Flemish' },
    { name: 'Hieronymus Bosch', period: 'Northern Renaissance', nationality: 'Dutch' },
    
    // 북유럽 거장
    { name: 'Albrecht Dürer', period: 'Northern Renaissance', nationality: 'German' },
    { name: 'Pieter Bruegel the Elder', period: 'Northern Renaissance', nationality: 'Flemish' },
    { name: 'Johannes Vermeer', period: 'Baroque', nationality: 'Dutch' },
    
    // 낭만주의/사실주의
    { name: 'Francisco Goya', period: 'Romanticism', nationality: 'Spanish' },
    { name: 'J.M.W. Turner', period: 'Romanticism', nationality: 'British' },
    { name: 'Eugène Delacroix', period: 'Romanticism', nationality: 'French' },
    { name: 'Gustave Courbet', period: 'Realism', nationality: 'French' },
    
    // 인상주의/후기인상주의
    { name: 'Pierre-Auguste Renoir', period: 'Impressionism', nationality: 'French' },
    { name: 'Edgar Degas', period: 'Impressionism', nationality: 'French' },
    { name: 'Paul Gauguin', period: 'Post-Impressionism', nationality: 'French' },
    { name: 'Georges Seurat', period: 'Neo-Impressionism', nationality: 'French' },
    
    // 20세기 거장
    { name: 'Salvador Dalí', period: 'Surrealism', nationality: 'Spanish' },
    { name: 'Joan Miró', period: 'Surrealism', nationality: 'Spanish' },
    { name: 'Marc Chagall', period: 'Modernism', nationality: 'Russian-French' },
    { name: 'Paul Klee', period: 'Expressionism', nationality: 'Swiss-German' },
    { name: 'Frida Kahlo', period: '20th Century', nationality: 'Mexican' },
    
    // 현대 거장
    { name: 'David Hockney', period: 'Contemporary', nationality: 'British' },
    { name: 'Gerhard Richter', period: 'Contemporary', nationality: 'German' },
    { name: 'Jean-Michel Basquiat', period: 'Neo-Expressionism', nationality: 'American' },
  ],
  
  // 중요한 여성 작가들 (역사적 저평가 보정)
  importantWomenArtists: [
    { name: 'Artemisia Gentileschi', period: 'Baroque', nationality: 'Italian' },
    { name: 'Judith Leyster', period: 'Dutch Golden Age', nationality: 'Dutch' },
    { name: 'Berthe Morisot', period: 'Impressionism', nationality: 'French' },
    { name: 'Mary Cassatt', period: 'Impressionism', nationality: 'American' },
    { name: 'Georgia O\'Keeffe', period: 'American Modernism', nationality: 'American' },
    { name: 'Louise Bourgeois', period: 'Contemporary', nationality: 'French-American' },
    { name: 'Yayoi Kusama', period: 'Contemporary', nationality: 'Japanese' },
    { name: 'Marina Abramović', period: 'Performance Art', nationality: 'Serbian' },
    { name: 'Cindy Sherman', period: 'Contemporary Photography', nationality: 'American' },
    { name: 'Kara Walker', period: 'Contemporary', nationality: 'American' },
  ],
  
  // 최고가 작품 작가들 (시장 중요도)
  highestPriceArtists: [
    { name: 'Leonardo da Vinci', record: 'Salvator Mundi ($450.3M)' },
    { name: 'Paul Cézanne', record: 'The Card Players ($250M+)' },
    { name: 'Paul Gauguin', record: 'When Will You Marry? ($210M)' },
    { name: 'Jackson Pollock', record: 'Number 17A ($200M)' },
    { name: 'Willem de Kooning', record: 'Interchange ($300M)' },
    { name: 'Mark Rothko', record: 'No. 6 (Violet, Green and Red) ($186M)' },
    { name: 'Amedeo Modigliani', record: 'Nu couché ($170.4M)' },
    { name: 'Francis Bacon', record: 'Three Studies of Lucian Freud ($142.4M)' },
    { name: 'Jeff Koons', record: 'Rabbit ($91.1M) - living artist record' },
    { name: 'David Hockney', record: 'Portrait of an Artist ($90.3M)' },
  ],
  
  // 한국 중요 작가들
  koreanMasters: [
    { name: '김환기 (Kim Whanki)', period: 'Korean Modern', importance: 95 },
    { name: '박수근 (Park Soo-keun)', period: 'Korean Modern', importance: 95 },
    { name: '이중섭 (Lee Jung-seob)', period: 'Korean Modern', importance: 95 },
    { name: '천경자 (Chun Kyung-ja)', period: 'Korean Modern', importance: 90 },
    { name: '백남준 (Nam June Paik)', period: 'Video Art', importance: 95 },
    { name: '이우환 (Lee Ufan)', period: 'Dansaekhwa/Minimalism', importance: 90 },
    { name: '박서보 (Park Seo-bo)', period: 'Dansaekhwa', importance: 85 },
    { name: '김창열 (Kim Tschang-yeul)', period: 'Water Drop Paintings', importance: 85 },
  ]
};

// APT 매칭을 위한 작가 특성 분석
const artistCharacteristics = {
  'Vincent van Gogh': {
    aptType: 'LAEF',
    traits: {
      workStyle: '극도로 고독한 작업, 아를의 작업실',
      expression: '강렬한 색채와 붓터치로 감정 표현',
      themes: '자연, 농민, 자화상을 통한 내면 탐구',
      personality: '고독, 열정적, 정신적 고통'
    }
  },
  'Pablo Picasso': {
    aptType: 'SAMF',
    traits: {
      workStyle: '파리 예술계 중심, 브라크와 협업',
      expression: '입체주의를 통한 형태의 해체와 재구성',
      themes: '인간 형태, 전쟁, 사랑',
      personality: '사교적, 실험적, 다작'
    }
  },
  'Claude Monet': {
    aptType: 'LREF',
    traits: {
      workStyle: '지베르니 정원에서 홀로 작업',
      expression: '빛과 색의 순간적 인상 포착',
      themes: '수련, 성당, 건초더미 연작',
      personality: '관찰자, 인내심, 자연 사랑'
    }
  },
  'Frida Kahlo': {
    aptType: 'LAEC',
    traits: {
      workStyle: '병상에서의 고독한 창작',
      expression: '개인적 고통의 상징적 표현',
      themes: '자화상, 멕시코 전통, 신체적 고통',
      personality: '내향적, 감정적, 강인함'
    }
  },
  'Andy Warhol': {
    aptType: 'SAMC',
    traits: {
      workStyle: '팩토리에서 조수들과 대량 생산',
      expression: '실크스크린을 통한 반복과 복제',
      themes: '대중문화, 소비주의, 유명인',
      personality: '사교적이면서 거리감, 체계적'
    }
  },
  'Jackson Pollock': {
    aptType: 'LAEF',
    traits: {
      workStyle: '헛간 스튜디오에서 홀로 작업',
      expression: '액션 페인팅, 물감 뿌리기',
      themes: '순수 추상, 무의식의 표현',
      personality: '고독, 알코올 중독, 격정적'
    }
  },
  'Yayoi Kusama': {
    aptType: 'SAEF',
    traits: {
      workStyle: '관객 참여형 설치 작품',
      expression: '무한 반복되는 점 패턴',
      themes: '무한, 강박, 환각',
      personality: '정신질환을 예술로 승화, 집착적'
    }
  },
  'Leonardo da Vinci': {
    aptType: 'LRMC',
    traits: {
      workStyle: '독립적 연구와 실험',
      expression: '과학적 정밀성과 예술의 결합',
      themes: '인체, 자연, 기계',
      personality: '호기심, 완벽주의, 박식함'
    }
  }
};

async function analyzeArtistDatabase() {
  try {
    console.log('🎨 SAYU 예술사적 중요 작가 분석 시작');
    console.log('=' + '='.repeat(80));
    
    // 현재 DB의 모든 작가 가져오기
    const dbArtists = await pool.query(`
      SELECT 
        id, name, nationality, era, birth_year, death_year,
        bio, sources, apt_profile
      FROM artists
      ORDER BY name
    `);
    
    const dbArtistNames = dbArtists.rows.map(a => a.name.toLowerCase());
    
    // 누락된 필수 작가 찾기
    console.log('\n📌 필수 거장 (Essential Masters) 체크:');
    const missingEssential = [];
    for (const artist of artistCategories.essentialMasters) {
      const found = dbArtistNames.some(dbName => 
        dbName.includes(artist.name.toLowerCase()) || 
        artist.name.toLowerCase().includes(dbName)
      );
      if (!found) {
        missingEssential.push(artist);
        console.log(`   ❌ ${artist.name} (${artist.period}, ${artist.nationality})`);
      } else {
        console.log(`   ✅ ${artist.name}`);
      }
    }
    
    console.log('\n📌 주요 미술관 소장 작가 체크:');
    const missingMajor = [];
    for (const artist of artistCategories.majorMuseumArtists) {
      const found = dbArtistNames.some(dbName => 
        dbName.includes(artist.name.toLowerCase()) || 
        artist.name.toLowerCase().includes(dbName)
      );
      if (!found) {
        missingMajor.push(artist);
        console.log(`   ❌ ${artist.name} (${artist.period})`);
      }
    }
    
    console.log('\n📌 중요 여성 작가 체크:');
    const missingWomen = [];
    for (const artist of artistCategories.importantWomenArtists) {
      const found = dbArtistNames.some(dbName => 
        dbName.includes(artist.name.toLowerCase()) || 
        artist.name.toLowerCase().includes(dbName)
      );
      if (!found) {
        missingWomen.push(artist);
        console.log(`   ❌ ${artist.name} (${artist.period})`);
      }
    }
    
    // APT 분석이 필요한 작가들
    console.log('\n\n🧬 APT 분석이 필요한 중요 작가들:');
    const needsAPT = await pool.query(`
      SELECT name, bio, nationality, era
      FROM artists
      WHERE apt_profile IS NULL
        AND bio IS NOT NULL
        AND LENGTH(bio) > 500
      ORDER BY 
        CASE 
          WHEN LOWER(name) LIKE '%picasso%' THEN 1
          WHEN LOWER(name) LIKE '%van gogh%' THEN 2
          WHEN LOWER(name) LIKE '%monet%' THEN 3
          WHEN LOWER(name) LIKE '%warhol%' THEN 4
          ELSE 5
        END,
        LENGTH(bio) DESC
      LIMIT 20
    `);
    
    console.log(`\n총 ${needsAPT.rows.length}명의 중요 작가가 APT 분석 대기 중:`);
    needsAPT.rows.forEach((artist, idx) => {
      console.log(`${idx + 1}. ${artist.name} - ${artist.nationality || '?'}, ${artist.era || '?'}`);
    });
    
    // 통계 요약
    console.log('\n\n📊 종합 통계:');
    console.log(`전체 작가 수: ${dbArtists.rows.length}명`);
    console.log(`필수 거장 누락: ${missingEssential.length}/${artistCategories.essentialMasters.length}명`);
    console.log(`주요 미술관 작가 누락: ${missingMajor.length}/${artistCategories.majorMuseumArtists.length}명`);
    console.log(`여성 작가 누락: ${missingWomen.length}/${artistCategories.importantWomenArtists.length}명`);
    
    // APT 매칭 예시
    console.log('\n\n🎯 APT 매칭 예시 (8명의 거장):');
    for (const [artistName, data] of Object.entries(artistCharacteristics)) {
      console.log(`\n${artistName} → ${data.aptType}`);
      console.log(`  작업 스타일: ${data.traits.workStyle}`);
      console.log(`  표현 방식: ${data.traits.expression}`);
      console.log(`  주요 주제: ${data.traits.themes}`);
      console.log(`  성격 특성: ${data.traits.personality}`);
    }
    
    // 데이터 수집 제안
    console.log('\n\n💡 데이터 수집 우선순위:');
    console.log('1. Wikipedia API를 통한 누락 작가 정보 수집');
    console.log('2. Google Arts & Culture API 연동');
    console.log('3. MoMA, Met Museum API 데이터 통합');
    console.log('4. Wikidata SPARQL 쿼리로 구조화된 데이터 수집');
    
    // SQL 업데이트 제안
    console.log('\n\n🔧 데이터베이스 개선 SQL:');
    console.log(`
-- 1. 중요도 점수 필드 추가
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS importance_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS importance_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS market_value_tier INTEGER;

-- 2. APT 분석 필드 확장
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS apt_confidence FLOAT,
ADD COLUMN IF NOT EXISTS apt_traits JSONB,
ADD COLUMN IF NOT EXISTS work_style_keywords TEXT[];

-- 3. 데이터 출처 추적
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS data_sources JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_enriched TIMESTAMP;

-- 4. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_artists_importance ON artists(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_artists_apt ON artists(apt_profile) WHERE apt_profile IS NOT NULL;
    `);
    
    return {
      total: dbArtists.rows.length,
      missingEssential,
      missingMajor,
      missingWomen,
      needsAPT: needsAPT.rows
    };
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await pool.end();
  }
}

// 실행
analyzeArtistDatabase().then(result => {
  console.log('\n\n✅ 분석 완료!');
  console.log('다음 단계: 누락된 작가들의 데이터를 수집하고 APT 매칭을 진행하세요.');
});