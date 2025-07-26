const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 유명 아티스트 선정을 위한 키워드 리스트
const famousArtistKeywords = [
  // 서양 고전 거장들
  'Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Caravaggio',
  'Van Gogh', 'Monet', 'Renoir', 'Degas', 'Manet', 'Cézanne',
  'Picasso', 'Matisse', 'Dali', 'Miró', 'Kandinsky', 'Klee',
  'Warhol', 'Pollock', 'Rothko', 'de Kooning', 'Basquiat',
  
  // 동양/한국 작가들
  '이중섭', '박수근', '김환기', '유영국', '장욱진',
  'Hokusai', 'Hiroshige', 'Sesshū',
  
  // 현대 유명 작가들
  'Banksy', 'Koons', 'Hirst', 'Kusama', 'Ai Weiwei',
  'Gerhard Richter', 'David Hockney', 'Takashi Murakami'
];

async function analyzeFamousArtists() {
  try {
    console.log('🔍 유명 아티스트 선정 및 APT 분석 시작\n');
    
    // 1. 현재 DB에서 유명 작가들 찾기
    console.log('📋 유명 작가 검색 중...');
    const searchQueries = famousArtistKeywords.map(keyword => 
      `name ILIKE '%${keyword}%' OR name_ko ILIKE '%${keyword}%'`
    ).join(' OR ');
    
    const famousQuery = `
      SELECT 
        id, name, name_ko, nationality, nationality_ko,
        birth_year, death_year, copyright_status, era,
        bio, bio_ko
      FROM artists 
      WHERE ${searchQueries}
      ORDER BY 
        CASE 
          WHEN name ILIKE '%van gogh%' OR name_ko ILIKE '%고흐%' THEN 1
          WHEN name ILIKE '%picasso%' OR name_ko ILIKE '%피카소%' THEN 2  
          WHEN name ILIKE '%monet%' OR name_ko ILIKE '%모네%' THEN 3
          WHEN name ILIKE '%da vinci%' OR name_ko ILIKE '%다빈치%' THEN 4
          WHEN name ILIKE '%이중섭%' THEN 5
          ELSE 10
        END,
        name
      LIMIT 100
    `;
    
    const result = await pool.query(famousQuery);
    console.log(`✅ ${result.rows.length}명의 유명 작가 발견\n`);
    
    // 2. 각 작가별 APT 분석 시작
    console.log('🎨 APT 분석 시작...\n');
    
    const analyzedArtists = [];
    
    for (const artist of result.rows.slice(0, 20)) { // 우선 20명만
      const aptProfile = await analyzeArtistAPT(artist);
      analyzedArtists.push({
        artist,
        aptProfile
      });
      
      console.log(`✅ ${artist.name || artist.name_ko} - ${aptProfile.primaryType} 분석 완료`);
    }
    
    // 3. 분석 결과 요약
    console.log('\n📊 APT 분석 결과 요약:');
    console.log('========================');
    
    const typeDistribution = {};
    analyzedArtists.forEach(({ aptProfile }) => {
      const type = aptProfile.primaryType;
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });
    
    Object.entries(typeDistribution).forEach(([type, count]) => {
      console.log(`${type}: ${count}명`);
    });
    
    // 4. 상세 분석 결과 저장
    const detailedResults = analyzedArtists.map(({ artist, aptProfile }) => ({
      name: artist.name || artist.name_ko,
      nationality: artist.nationality || artist.nationality_ko,
      era: artist.era,
      years: `${artist.birth_year || '?'} - ${artist.death_year || 'present'}`,
      aptProfile
    }));
    
    require('fs').writeFileSync(
      'artist-apt-analysis-results.json',
      JSON.stringify(detailedResults, null, 2)
    );
    
    console.log('\n💾 상세 결과가 artist-apt-analysis-results.json에 저장되었습니다.');
    
    return analyzedArtists;
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

// 개별 아티스트 APT 분석 함수
async function analyzeArtistAPT(artist) {
  const name = artist.name || artist.name_ko;
  const nationality = artist.nationality || artist.nationality_ko || 'Unknown';
  const era = artist.era || (artist.birth_year ? (artist.birth_year < 1900 ? 'Classical' : 'Modern') : 'Unknown');
  const bio = artist.bio || artist.bio_ko || '';
  
  // APT 분석 로직 (규칙 기반 + 경험적 추론)
  let aptScores = { L: 50, S: 50, A: 50, R: 50, E: 50, M: 50, F: 50, C: 50 };
  let reasoning = [];
  
  // 1. 이름 기반 패턴 매칭
  if (name.includes('Van Gogh') || name.includes('고흐')) {
    aptScores = { L: 85, S: 15, A: 90, R: 10, E: 95, M: 5, F: 80, C: 20 };
    reasoning.push('고독한 성격, 강한 감정 표현, 자유로운 붓터치로 유명');
  } else if (name.includes('Picasso') || name.includes('피카소')) {
    aptScores = { L: 30, S: 70, A: 85, R: 15, E: 60, M: 40, F: 75, C: 25 };
    reasoning.push('사교적 성격, 추상적 혁신, 다양한 스타일 실험');
  } else if (name.includes('Monet') || name.includes('모네')) {
    aptScores = { L: 60, S: 40, A: 80, R: 20, E: 70, M: 30, F: 85, C: 15 };
    reasoning.push('인상주의 개척, 감정적 색채, 자연스러운 표현');
  } else if (name.includes('Leonardo') || name.includes('다빈치')) {
    aptScores = { L: 70, S: 30, A: 40, R: 60, E: 30, M: 70, F: 20, C: 80 };
    reasoning.push('과학적 분석, 완벽주의, 체계적 연구');
  } else if (name.includes('이중섭')) {
    aptScores = { L: 80, S: 20, A: 75, R: 25, E: 90, M: 10, F: 70, C: 30 };
    reasoning.push('고독한 화가, 감정적 표현, 민족적 정서');
  } else {
    // 2. 국적/시대 기반 추론
    if (nationality.includes('French') || nationality.includes('프랑스')) {
      aptScores.A += 20; aptScores.R -= 20; aptScores.F += 15; aptScores.C -= 15;
      reasoning.push('프랑스 예술 전통 - 추상적, 자유로운 성향');
    } else if (nationality.includes('German') || nationality.includes('독일')) {
      aptScores.M += 20; aptScores.E -= 20; aptScores.C += 15; aptScores.F -= 15;
      reasoning.push('독일 예술 전통 - 분석적, 체계적 성향');
    } else if (nationality.includes('Korean') || nationality.includes('한국')) {
      aptScores.E += 25; aptScores.M -= 25; aptScores.L += 10; aptScores.S -= 10;
      reasoning.push('한국 예술 전통 - 감정적, 내성적 성향');
    }
    
    // 3. 시대 기반 추론
    if (era === 'Contemporary' || artist.birth_year > 1950) {
      aptScores.A += 15; aptScores.R -= 15; aptScores.S += 10; aptScores.L -= 10;
      reasoning.push('현대 예술 - 추상적, 사회적 성향');
    } else if (era === 'Classical' || artist.birth_year < 1800) {
      aptScores.R += 20; aptScores.A -= 20; aptScores.C += 15; aptScores.F -= 15;
      reasoning.push('고전 예술 - 사실적, 체계적 성향');
    }
  }
  
  // 점수 정규화 (대립 차원 합계 = 100)
  aptScores.S = 100 - aptScores.L;
  aptScores.R = 100 - aptScores.A;
  aptScores.M = 100 - aptScores.E;
  aptScores.C = 100 - aptScores.F;
  
  // 주요 APT 타입 결정
  const primaryType = 
    (aptScores.L > aptScores.S ? 'L' : 'S') +
    (aptScores.A > aptScores.R ? 'A' : 'R') +
    (aptScores.E > aptScores.M ? 'E' : 'M') +
    (aptScores.F > aptScores.C ? 'F' : 'C');
  
  // 신뢰도 계산 (명확성에 따라)
  const clarity = [
    Math.abs(aptScores.L - aptScores.S),
    Math.abs(aptScores.A - aptScores.R),
    Math.abs(aptScores.E - aptScores.M),
    Math.abs(aptScores.F - aptScores.C)
  ].reduce((a, b) => a + b, 0) / 4;
  
  const confidence = Math.min(0.95, clarity / 50 + 0.3);
  
  return {
    primaryType,
    dimensions: aptScores,
    confidence: Math.round(confidence * 100) / 100,
    reasoning: reasoning,
    meta: {
      analyzed_from: 'biographical_analysis',
      source_data: { nationality, era, birth_year: artist.birth_year }
    }
  };
}

analyzeFamousArtists();