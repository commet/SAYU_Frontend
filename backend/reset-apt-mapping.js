const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function resetAPTMapping() {
  try {
    console.log('🔄 잘못된 APT 매핑 전체 리셋 시작\n');
    
    // 현재 상태 확인
    const currentStats = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(apt_profile) as mapped_artists,
        (apt_profile->'meta'->>'source') as source,
        COUNT(*) as count
      FROM artists 
      WHERE apt_profile IS NOT NULL
      GROUP BY (apt_profile->'meta'->>'source')
    `);
    
    console.log('📊 현재 매핑 상태:');
    currentStats.rows.forEach(row => {
      console.log(`   ${row.source}: ${row.count}명`);
    });
    
    // expert_preset 데이터는 보존, 나머지는 삭제
    console.log('\n🗑️ 규칙 기반 매핑 데이터 삭제 중...');
    
    const deleteResult = await pool.query(`
      UPDATE artists 
      SET apt_profile = NULL, updated_at = NOW()
      WHERE apt_profile IS NOT NULL
        AND (apt_profile->'meta'->>'source') NOT IN ('expert_preset')
    `);
    
    console.log(`   ✅ ${deleteResult.rowCount}개 레코드 삭제됨`);
    
    // 매핑 로그도 정리
    const deleteLogsResult = await pool.query(`
      DELETE FROM artist_apt_mappings 
      WHERE mapping_method NOT IN ('expert_analysis_v2')
    `);
    
    console.log(`   ✅ ${deleteLogsResult.rowCount}개 로그 삭제됨`);
    
    // 리셋 후 상태 확인
    const afterStats = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(apt_profile) as mapped_artists,
        COUNT(CASE WHEN apt_profile IS NULL THEN 1 END) as unmapped_artists
      FROM artists
    `);
    
    const after = afterStats.rows[0];
    console.log('\n📈 리셋 후 상태:');
    console.log(`   총 아티스트: ${after.total_artists}명`);
    console.log(`   보존된 매핑: ${after.mapped_artists}명 (expert_preset)`);
    console.log(`   재매핑 필요: ${after.unmapped_artists}명\n`);
    
    // 보존된 아티스트 목록
    const preserved = await pool.query(`
      SELECT name, name_ko, (apt_profile->'primary_types'->0->>'type') as apt_type
      FROM artists 
      WHERE apt_profile IS NOT NULL
      ORDER BY name
    `);
    
    console.log('✅ 보존된 전문가 매핑:');
    preserved.rows.forEach(artist => {
      console.log(`   ${artist.name || artist.name_ko}: ${artist.apt_type}`);
    });
    
    console.log('\n🎯 이제 정확한 매칭을 위한 심층 분석을 시작합니다!');
    
    return {
      total: after.total_artists,
      preserved: after.mapped_artists,
      toRemap: after.unmapped_artists
    };
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

resetAPTMapping();