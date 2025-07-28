const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkMultipleAPT() {
  try {
    // primary_types 배열 길이별 통계
    const statsResult = await pool.query(`
      SELECT 
        jsonb_array_length(apt_profile->'primary_types') as type_count,
        COUNT(*) as artist_count
      FROM artists 
      WHERE apt_profile IS NOT NULL
      AND apt_profile->'primary_types' IS NOT NULL
      GROUP BY type_count
      ORDER BY type_count
    `);

    console.log('📊 APT 타입 개수별 분포:\n');
    statsResult.rows.forEach(row => {
      console.log(`  ${row.type_count}개 타입: ${row.artist_count}명`);
    });

    // 2개 이상인 경우 샘플 확인
    const multipleResult = await pool.query(`
      SELECT 
        name,
        jsonb_array_length(apt_profile->'primary_types') as type_count,
        apt_profile->'primary_types' as types,
        apt_profile->'meta'->>'analysis_method' as method
      FROM artists 
      WHERE apt_profile IS NOT NULL
      AND jsonb_array_length(apt_profile->'primary_types') > 1
      ORDER BY type_count DESC
      LIMIT 10
    `);

    if (multipleResult.rows.length > 0) {
      console.log('\n📋 복수 APT 타입을 가진 아티스트 샘플:\n');
      multipleResult.rows.forEach(row => {
        console.log(`${row.name} (${row.type_count}개 타입, 방법: ${row.method})`);
        row.types.forEach((type, idx) => {
          console.log(`  ${idx + 1}. ${type.type} - ${type.title_ko || type.title} (${type.animal || type.name_ko}) - 신뢰도: ${type.confidence}%`);
        });
        console.log('');
      });
    }

    // SAYU 시스템 의도 확인
    console.log('\n💡 SAYU 시스템 설계:');
    console.log('  - primary_types 배열은 우선순위별 여러 타입을 담을 수 있음');
    console.log('  - weight 필드로 각 타입의 가중치 표현');
    console.log('  - 현재는 대부분 1개 타입만 사용 중\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMultipleAPT();
