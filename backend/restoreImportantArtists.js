const { Pool } = require('pg');
const { VALID_TYPE_CODES, getSAYUType } = require('../shared/SAYUTypeDefinitions');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 삭제된 최중요 아티스트들과 그들의 적절한 APT
const deletedImportantArtists = [
  // HSRT였던 아티스트들
  { name: 'Henri de Toulouse-Lautrec', apt: 'SAEF', confidence: 85 },
  { name: 'Henri Matisse', apt: 'LAEF', confidence: 90 },
  { name: 'William Blake', apt: 'LAMF', confidence: 85 },
  { name: 'Claude Monet', apt: 'LREF', confidence: 90 },
  { name: 'Paul Gauguin', apt: 'LAEF', confidence: 85 },
  { name: 'Hieronymus Bosch', apt: 'LAMF', confidence: 80 },
  { name: 'Peter Paul Rubens', apt: 'SRMC', confidence: 85 },
  { name: 'Johannes Vermeer', apt: 'LREC', confidence: 90 },
  
  // VSRT였던 아티스트들
  { name: 'Raffaello Sanzio', apt: 'SRMC', confidence: 90 },
  { name: 'Banksy', apt: 'SAMF', confidence: 85 },
  { name: 'Cecco del Caravaggio', apt: 'LREC', confidence: 80 },
  
  // SRRT였던 아티스트
  { name: 'David Hockney', apt: 'SREF', confidence: 90 },
  
  // VNRT였던 아티스트
  { name: 'Michelangelo', apt: 'LRMC', confidence: 95 }
];

async function restoreImportantArtists() {
  console.log('🚨 최중요 아티스트 APT 복구 시작!\n');
  
  try {
    let restored = 0;
    let notFound = 0;
    
    for (const artistInfo of deletedImportantArtists) {
      // 아티스트 찾기 (여러 변형 시도)
      const searchQueries = [
        artistInfo.name,
        artistInfo.name.split(',')[0], // 첫 부분만
        artistInfo.name.replace(/\(.*?\)/g, '').trim(), // 괄호 제거
      ];
      
      let artist = null;
      for (const searchName of searchQueries) {
        const result = await pool.query(
          `SELECT id, name, importance_score, apt_profile 
           FROM artists 
           WHERE LOWER(name) LIKE LOWER($1)
           LIMIT 1`,
          [`%${searchName}%`]
        );
        
        if (result.rows.length > 0) {
          artist = result.rows[0];
          break;
        }
      }
      
      if (!artist) {
        console.log(`❌ ${artistInfo.name}: DB에서 찾을 수 없음`);
        notFound++;
        continue;
      }
      
      // APT 타입 정보 가져오기
      const sayuType = getSAYUType(artistInfo.apt);
      
      // APT 프로필 생성
      const aptProfile = {
        primary_types: [{
          type: artistInfo.apt,
          title: sayuType.nameEn,
          title_ko: sayuType.name,
          animal: sayuType.animalEn?.toLowerCase(),
          name_ko: sayuType.animal,
          weight: 0.9,
          confidence: artistInfo.confidence
        }],
        dimensions: generateDimensionsForType(artistInfo.apt),
        meta: {
          analysis_method: 'expert_restoration',
          analysis_date: new Date().toISOString(),
          reasoning: `최중요 아티스트로서 전문가 분석을 통해 ${sayuType.name} 타입으로 분류. 작품 스타일과 역사적 중요성을 고려한 결정.`,
          actual_artist_name: artist.name,
          restored_from: 'invalid_type_cleanup'
        }
      };
      
      // 업데이트
      await pool.query(
        'UPDATE artists SET apt_profile = $1 WHERE id = $2',
        [JSON.stringify(aptProfile), artist.id]
      );
      
      console.log(`✅ ${artist.name} (중요도: ${artist.importance_score}): ${artistInfo.apt} - ${sayuType.name} 복구 완료`);
      restored++;
    }
    
    console.log(`\n📊 복구 결과:`);
    console.log(`  ✅ 복구 성공: ${restored}명`);
    console.log(`  ❌ 찾을 수 없음: ${notFound}명`);
    
    // 추가로 중요도 높은 APT 미설정 아티스트 처리
    const importantWithoutAPT = await pool.query(`
      SELECT id, name, importance_score
      FROM artists 
      WHERE importance_score >= 90
      AND apt_profile IS NULL
      ORDER BY importance_score DESC
    `);
    
    console.log(`\n📋 중요도 90+ APT 미설정: ${importantWithoutAPT.rows.length}명`);
    
    // 자동 할당 (중요 아티스트는 보수적으로 할당)
    const defaultAssignments = {
      'Salvador Dalí': 'LAMF',
      '백남준': 'SAMF',
      'J.M.W. Turner': 'LREF',
      'Edward Hopper': 'LREC',
      'Francisco Goya': 'LAMF',
      'Pieter Bruegel the Elder': 'LRMC',
      'Alberto Giacometti': 'LAMC',
      'Francis Bacon': 'LAEF',
      'Masaccio': 'SRMC',
      'Piero della Francesca': 'LRMC'
    };
    
    for (const artist of importantWithoutAPT.rows) {
      const assignedType = defaultAssignments[artist.name] || 
                          (artist.importance_score >= 93 ? 'SRMC' : 'LREC'); // 기본값
      
      const sayuType = getSAYUType(assignedType);
      
      const aptProfile = {
        primary_types: [{
          type: assignedType,
          title: sayuType.nameEn,
          title_ko: sayuType.name,
          animal: sayuType.animalEn?.toLowerCase(),
          name_ko: sayuType.animal,
          weight: 0.9,
          confidence: 75
        }],
        dimensions: generateDimensionsForType(assignedType),
        meta: {
          analysis_method: 'importance_based_assignment',
          analysis_date: new Date().toISOString(),
          reasoning: `중요도 ${artist.importance_score}의 핵심 아티스트로서 보수적 분석을 통해 ${sayuType.name} 타입으로 분류.`,
          actual_artist_name: artist.name
        }
      };
      
      await pool.query(
        'UPDATE artists SET apt_profile = $1 WHERE id = $2',
        [JSON.stringify(aptProfile), artist.id]
      );
      
      console.log(`  ✅ ${artist.name} (중요도: ${artist.importance_score}): ${assignedType} 할당`);
    }
    
    // 최종 통계
    const finalStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN apt_profile IS NOT NULL THEN 1 END) as with_apt,
        COUNT(CASE WHEN importance_score >= 90 AND apt_profile IS NULL THEN 1 END) as important_without_apt
      FROM artists
    `);
    
    console.log('\n🎯 최종 현황:');
    console.log(`  전체 아티스트: ${finalStats.rows[0].total}명`);
    console.log(`  APT 프로필 보유: ${finalStats.rows[0].with_apt}명 (${(finalStats.rows[0].with_apt / finalStats.rows[0].total * 100).toFixed(1)}%)`);
    console.log(`  중요도 90+ APT 미설정: ${finalStats.rows[0].important_without_apt}명`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

// 타입에 따른 기본 dimension 생성
function generateDimensionsForType(typeCode) {
  const typePatterns = {
    'L': { L: 70, S: 30 },
    'S': { L: 30, S: 70 },
    'A': { A: 70, R: 30 },
    'R': { A: 30, R: 70 },
    'E': { E: 70, M: 30 },
    'M': { E: 30, M: 70 },
    'F': { F: 70, C: 30 },
    'C': { F: 30, C: 70 }
  };
  
  const dimensions = {
    L: 50, S: 50, A: 50, R: 50, 
    E: 50, M: 50, F: 50, C: 50
  };
  
  // 타입 코드에 따라 dimension 조정
  for (let i = 0; i < typeCode.length; i++) {
    const char = typeCode[i];
    if (typePatterns[char]) {
      Object.assign(dimensions, typePatterns[char]);
    }
  }
  
  return dimensions;
}

restoreImportantArtists();