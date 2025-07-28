const { Pool } = require('pg');
const { VALID_TYPE_CODES } = require('@sayu/shared');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function analyzeThreeAPTSystem() {
  try {
    console.log('🎯 3개 APT 시스템 분석\n');
    
    // 1. 정확히 3개 타입을 가진 아티스트들 분석
    const threeTypeResult = await pool.query(`
      SELECT 
        name,
        importance_score,
        apt_profile->'primary_types' as types,
        apt_profile->'meta'->>'analysis_method' as method
      FROM artists 
      WHERE apt_profile IS NOT NULL
      AND jsonb_array_length(apt_profile->'primary_types') = 3
      ORDER BY importance_score DESC NULLS LAST
      LIMIT 10
    `);
    
    console.log(`📊 3개 타입을 가진 아티스트 샘플 (총 ${threeTypeResult.rowCount}명 중 상위 10명):\n`);
    
    threeTypeResult.rows.forEach((artist, idx) => {
      console.log(`${idx + 1}. ${artist.name} (중요도: ${artist.importance_score || 'N/A'})`);
      console.log(`   분석 방법: ${artist.method || 'unknown'}`);
      
      artist.types.forEach((type, i) => {
        const isValid = VALID_TYPE_CODES.includes(type.type);
        const validMark = isValid ? '✅' : '❌';
        console.log(`   ${validMark} ${i+1}순위: ${type.type} - ${type.title_ko || type.title || '제목없음'} (신뢰도: ${type.confidence || type.weight || 'N/A'}%)`);
      });
      console.log('');
    });
    
    // 2. 잘못된 타입 포함 여부 확인
    const invalidTypeResult = await pool.query(`
      SELECT 
        name,
        apt_profile->'primary_types' as types
      FROM artists 
      WHERE apt_profile IS NOT NULL
      AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(apt_profile->'primary_types') as t
        WHERE t->>'type' NOT IN (${VALID_TYPE_CODES.map(t => `'${t}'`).join(',')})
      )
      LIMIT 5
    `);
    
    if (invalidTypeResult.rows.length > 0) {
      console.log('⚠️ 잘못된 타입을 포함한 아티스트:\n');
      invalidTypeResult.rows.forEach(artist => {
        console.log(`${artist.name}:`);
        artist.types.forEach(type => {
          const isValid = VALID_TYPE_CODES.includes(type.type);
          if (!isValid) {
            console.log(`  ❌ ${type.type} (잘못된 타입)`);
          }
        });
      });
    }
    
    // 3. 이상적인 3-APT 구조 제안
    console.log('\n💡 이상적인 3-APT 시스템 구조:\n');
    console.log('1순위 (Primary): 가장 강한 성향 - 신뢰도 60-90%');
    console.log('2순위 (Secondary): 보조 성향 - 신뢰도 40-70%');
    console.log('3순위 (Tertiary): 잠재 성향 - 신뢰도 30-50%');
    console.log('\n예시:');
    console.log('Vincent van Gogh:');
    console.log('  1. LAEF (몽환적 방랑자) - 80% : 고독하고 감정적인 예술 추구');
    console.log('  2. LREF (고독한 관찰자) - 60% : 자연과 일상의 세밀한 관찰');
    console.log('  3. SAEF (감성 나눔이) - 40% : 동생과의 서신, 예술적 교류 열망\n');
    
    // 4. 현재 시스템의 문제점
    const analysisMethodResult = await pool.query(`
      SELECT 
        apt_profile->'meta'->>'analysis_method' as method,
        COUNT(*) as count,
        AVG(jsonb_array_length(apt_profile->'primary_types')) as avg_types
      FROM artists 
      WHERE apt_profile IS NOT NULL
      GROUP BY method
      ORDER BY count DESC
    `);
    
    console.log('📈 분석 방법별 통계:\n');
    analysisMethodResult.rows.forEach(row => {
      console.log(`${row.method || 'unknown'}: ${row.count}명 (평균 ${parseFloat(row.avg_types).toFixed(1)}개 타입)`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeThreeAPTSystem();