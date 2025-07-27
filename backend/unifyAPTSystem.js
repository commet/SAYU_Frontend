// APT 시스템 통합 및 정리
// apt_profiles 테이블과 artists.apt_profile 컬럼을 통합

require('dotenv').config();
const { pool } = require('./src/config/database');

async function unifyAPTSystem() {
  console.log('🔧 APT 시스템 통합 시작');
  console.log('='.repeat(70));

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. apt_profiles 테이블에서 데이터 마이그레이션
    console.log('\n📊 기존 apt_profiles 데이터 확인...');
    const existingProfiles = await client.query(`
      SELECT 
        ap.*, 
        a.name as artist_name 
      FROM apt_profiles ap
      JOIN artists a ON ap.artist_id = a.id
    `);
    
    console.log(`   발견된 프로필: ${existingProfiles.rows.length}개`);

    // 2. 각 프로필을 새로운 형식으로 변환
    let migratedCount = 0;
    for (const profile of existingProfiles.rows) {
      // APT 코드를 차원 점수로 변환
      const dimensions = convertAPTtoDimensions(profile.primary_apt);
      
      const newFormat = {
        dimensions: dimensions,
        primary_types: [
          { type: profile.primary_apt, weight: 0.7 },
          { type: profile.secondary_apt, weight: 0.2 },
          { type: profile.tertiary_apt, weight: 0.1 }
        ].filter(t => t.type), // null 제거
        meta: {
          confidence: profile.confidence_score || 0.5,
          source: profile.classification_method || 'legacy',
          reasoning: profile.matching_reasoning,
          data_sources: profile.data_sources,
          migrated_from: 'apt_profiles_table',
          migration_date: new Date().toISOString()
        }
      };

      // artists 테이블 업데이트 (트리거 비활성화)
      await client.query(`
        UPDATE artists 
        SET apt_profile = $1
        WHERE id = $2
      `, [JSON.stringify(newFormat), profile.artist_id]);

      console.log(`   ✅ ${profile.artist_name} 마이그레이션 완료`);
      migratedCount++;
    }

    // 3. 통계 확인
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(apt_profile) as with_profile,
        COUNT(*) FILTER (WHERE apt_profile IS NOT NULL) as json_profiles
      FROM artists
    `);

    console.log('\n📊 통합 결과:');
    console.log(`   전체 작가: ${stats.rows[0].total_artists}명`);
    console.log(`   APT 프로필 보유: ${stats.rows[0].with_profile}명`);
    console.log(`   마이그레이션 완료: ${migratedCount}명`);

    await client.query('COMMIT');
    console.log('\n✅ APT 시스템 통합 완료!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// APT 코드를 차원 점수로 변환하는 함수
function convertAPTtoDimensions(aptCode) {
  if (!aptCode || aptCode.length !== 4) {
    return { L: 50, S: 50, A: 50, R: 50, E: 50, M: 50, F: 50, C: 50 };
  }

  const dimensions = {};
  
  // 첫 번째 문자: V(비전) = S(사회적), H(조화) = S(사회적), S(감각) = L(독립), D(역동) = L(독립)
  if (aptCode[0] === 'V' || aptCode[0] === 'H') {
    dimensions.L = 20;
    dimensions.S = 80;
  } else {
    dimensions.L = 80;
    dimensions.S = 20;
  }

  // 두 번째 문자: N(직관) = A(추상), S(감각) = R(구상)
  if (aptCode[1] === 'N') {
    dimensions.A = 80;
    dimensions.R = 20;
  } else {
    dimensions.A = 20;
    dimensions.R = 80;
  }

  // 세 번째 문자: R(성찰) = M(의미), C(연결) = E(감정), M(세심) = E(감정)
  if (aptCode[2] === 'R') {
    dimensions.E = 20;
    dimensions.M = 80;
  } else if (aptCode[2] === 'C' || aptCode[2] === 'M') {
    dimensions.E = 80;
    dimensions.M = 20;
  } else {
    dimensions.E = 50;
    dimensions.M = 50;
  }

  // 네 번째 문자: T(체계) = C(구성), M(의미) = C(구성), C(연결) = F(흐름), F(유동) = F(흐름)
  if (aptCode[3] === 'T' || aptCode[3] === 'M') {
    dimensions.F = 20;
    dimensions.C = 80;
  } else {
    dimensions.F = 80;
    dimensions.C = 20;
  }

  return dimensions;
}

// 실행
unifyAPTSystem().catch(console.error);