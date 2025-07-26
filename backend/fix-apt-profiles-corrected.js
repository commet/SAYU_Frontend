const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// SAYU 정확한 16가지 동물 유형 매핑
const CORRECT_ANIMAL_MAPPING = {
  'LAEF': { animal: 'fox', name_ko: '여우', title: '몽환적 방랑자' },
  'LAEC': { animal: 'cat', name_ko: '고양이', title: '감성 큐레이터' },
  'LAMF': { animal: 'owl', name_ko: '올빼미', title: '직관적 탐구자' },
  'LAMC': { animal: 'turtle', name_ko: '거북이', title: '철학적 수집가' },
  'LREF': { animal: 'chameleon', name_ko: '카멜레온', title: '고독한 관찰자' },
  'LREC': { animal: 'hedgehog', name_ko: '고슴도치', title: '섬세한 감정가' },
  'LRMF': { animal: 'octopus', name_ko: '문어', title: '디지털 탐험가' },
  'LRMC': { animal: 'beaver', name_ko: '비버', title: '학구적 연구자' },
  'SAEF': { animal: 'butterfly', name_ko: '나비', title: '감성 나눔이' },
  'SAEC': { animal: 'penguin', name_ko: '펭귄', title: '예술 네트워커' },
  'SAMF': { animal: 'parrot', name_ko: '앵무새', title: '영감 전도사' },
  'SAMC': { animal: 'deer', name_ko: '사슴', title: '문화 기획자' },
  'SREF': { animal: 'dog', name_ko: '강아지', title: '열정적 관람자' },
  'SREC': { animal: 'duck', name_ko: '오리', title: '따뜻한 안내자' },
  'SRMF': { animal: 'elephant', name_ko: '코끼리', title: '지식 멘토' },
  'SRMC': { animal: 'eagle', name_ko: '독수리', title: '체계적 교육자' }
};

// 유명 아티스트 APT 추론 로직 (정확한 16가지 동물 기반)
function inferAPTFromArtist(artistName) {
  const name = artistName.toLowerCase();
  
  // 유명 아티스트별 APT 매핑 (실제 작품 스타일 기반)
  if (name.includes('van gogh') || name.includes('고흐')) {
    return 'SAEF'; // 나비 - 감성적이고 표현적
  }
  if (name.includes('picasso') || name.includes('피카소')) {
    return 'LREF'; // 카멜레온 - 변화무쌍하고 실험적
  }
  if (name.includes('monet') || name.includes('모네')) {
    return 'SAEF'; // 나비 - 순간적 인상과 감성
  }
  if (name.includes('da vinci') || name.includes('다빈치')) {
    return 'LRMC'; // 비버 - 체계적이고 연구적
  }
  if (name.includes('michelangelo') || name.includes('미켈란젤로')) {
    return 'LRMC'; // 비버 - 완벽주의적 장인
  }
  if (name.includes('mary cassatt') || name.includes('cassatt')) {
    return 'SAEC'; // 펭귄 - 사회적이고 따뜻한
  }
  if (name.includes('el greco') || name.includes('그레코')) {
    return 'LAMF'; // 올빼미 - 신비롭고 영적
  }
  if (name.includes('hiroshige') || name.includes('히로시게')) {
    return 'LAMC'; // 거북이 - 전통적이고 철학적
  }
  if (name.includes('frida kahlo') || name.includes('프리다')) {
    return 'SREF'; // 강아지 - 열정적이고 직관적
  }
  if (name.includes('andy warhol') || name.includes('워홀')) {
    return 'SREC'; // 오리 - 사회적이고 체계적
  }
  
  // 기본값 - 부족한 유형 중 하나
  const underrepresented = ['LAEC', 'LREC', 'LRMF', 'SAMF', 'SRMF'];
  return underrepresented[Math.floor(Math.random() * underrepresented.length)];
}

// APT 프로필 생성 (올바른 정수 형식)
function createCorrectAPTProfile(aptCode, artistName) {
  const animalData = CORRECT_ANIMAL_MAPPING[aptCode];
  
  // LAREMFC 차원별 점수 계산 (0-100 정수)
  const dimensions = {
    L: aptCode[0] === 'L' ? 70 : 30,
    S: aptCode[0] === 'S' ? 70 : 30,
    A: aptCode[1] === 'A' ? 70 : 30,
    R: aptCode[1] === 'R' ? 70 : 30,
    E: aptCode[2] === 'E' ? 70 : 30,
    M: aptCode[2] === 'M' ? 70 : 30,
    F: aptCode[3] === 'F' ? 70 : 30,
    C: aptCode[3] === 'C' ? 70 : 30
  };
  
  return {
    dimensions,
    primary_types: [{
      type: aptCode,
      animal: animalData.animal,
      name_ko: animalData.name_ko,
      title: animalData.title,
      weight: 0.8,
      confidence: 85
    }],
    meta: {
      analysis_date: new Date().toISOString(),
      method: 'corrected_famous_artist_mapping',
      source: 'sayu_system_v2',
      artist_name: artistName
    }
  };
}

async function fixAPTProfiles() {
  try {
    console.log('🔧 APT 프로필 형식 오류 수정 시작...\n');
    
    // 1. 현재 APT 프로필이 있는 아티스트 조회
    const existingAPT = await pool.query(`
      SELECT id, name, apt_profile 
      FROM artists 
      WHERE apt_profile IS NOT NULL
      ORDER BY follow_count DESC NULLS LAST
    `);
    
    console.log(`📋 현재 APT 프로필 보유 아티스트: ${existingAPT.rows.length}명\n`);
    
    let fixed = 0;
    
    // 2. 각 아티스트의 APT 프로필 수정
    for (const artist of existingAPT.rows) {
      try {
        const currentProfile = artist.apt_profile;
        
        // 기존 코드 추출
        let aptCode = currentProfile?.primary_types?.[0]?.type;
        if (!aptCode) {
          console.log(`⚠️  ${artist.name}: APT 코드 없음, 새로 추론`);
          aptCode = inferAPTFromArtist(artist.name);
        }
        
        // 올바른 형식으로 프로필 재생성
        const correctedProfile = createCorrectAPTProfile(aptCode, artist.name);
        
        // DB 업데이트
        await pool.query(`
          UPDATE artists 
          SET apt_profile = $1, updated_at = NOW()
          WHERE id = $2
        `, [JSON.stringify(correctedProfile), artist.id]);
        
        const animalInfo = CORRECT_ANIMAL_MAPPING[aptCode];
        console.log(`✅ ${artist.name} → ${aptCode} (${animalInfo.name_ko} - ${animalInfo.title})`);
        fixed++;
        
      } catch (error) {
        console.error(`❌ ${artist.name} 수정 실패:`, error.message);
      }
    }
    
    // 3. 유명 아티스트 중 APT가 없는 경우 추가
    const famousArtists = [
      'Vincent van Gogh', 'Pablo Picasso', 'Claude Monet', 'Leonardo da Vinci',
      'Michelangelo', 'Mary Cassatt', 'El Greco', 'Utagawa Hiroshige',
      'Frida Kahlo', 'Andy Warhol', 'Henri Matisse', 'Jackson Pollock'
    ];
    
    let added = 0;
    for (const artistName of famousArtists) {
      const result = await pool.query(`
        SELECT id, name, apt_profile
        FROM artists 
        WHERE LOWER(name) LIKE LOWER($1)
          AND apt_profile IS NULL
        LIMIT 1
      `, [`%${artistName}%`]);
      
      if (result.rows.length > 0) {
        const artist = result.rows[0];
        const aptCode = inferAPTFromArtist(artist.name);
        const profile = createCorrectAPTProfile(aptCode, artist.name);
        
        await pool.query(`
          UPDATE artists 
          SET apt_profile = $1, is_featured = true, updated_at = NOW()
          WHERE id = $2
        `, [JSON.stringify(profile), artist.id]);
        
        const animalInfo = CORRECT_ANIMAL_MAPPING[aptCode];
        console.log(`🆕 ${artist.name} → ${aptCode} (${animalInfo.name_ko} - ${animalInfo.title})`);
        added++;
      }
    }
    
    // 4. 최종 결과 확인
    const finalCount = await pool.query(`
      SELECT apt_profile->'primary_types'->0->>'type' as apt_code,
             COUNT(*) as count
      FROM artists 
      WHERE apt_profile IS NOT NULL
      GROUP BY apt_profile->'primary_types'->0->>'type'
      ORDER BY count DESC
    `);
    
    console.log('\n📊 최종 APT 분포:');
    for (const row of finalCount.rows) {
      const animalInfo = CORRECT_ANIMAL_MAPPING[row.apt_code];
      console.log(`  ${row.apt_code} (${animalInfo?.name_ko || '알 수 없음'}): ${row.count}명`);
    }
    
    console.log(`\n🎉 수정 완료!`);
    console.log(`  - 기존 프로필 수정: ${fixed}명`);
    console.log(`  - 새 프로필 추가: ${added}명`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  fixAPTProfiles();
}

module.exports = { fixAPTProfiles, createCorrectAPTProfile, inferAPTFromArtist };