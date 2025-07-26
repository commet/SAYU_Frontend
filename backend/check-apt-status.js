const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAPTStatus() {
  try {
    console.log('📊 현재 APT 매핑 상태 확인\n');
    
    // 1. 전체 통계
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(apt_profile) as mapped,
        COUNT(CASE WHEN apt_profile IS NULL THEN 1 END) as unmapped
      FROM artists
    `);
    
    const s = stats.rows[0];
    const rate = (s.mapped / s.total * 100).toFixed(1);
    
    console.log(`📈 매핑 진행률: ${s.mapped}/${s.total} (${rate}%)`);
    console.log(`✅ 매핑 완료: ${s.mapped}명`);
    console.log(`❌ 매핑 미완료: ${s.unmapped}명\n`);
    
    // 2. APT 타입별 분포
    if (s.mapped > 0) {
      console.log('🎯 APT 타입 분포:');
      
      const types = await pool.query(`
        SELECT 
          (apt_profile->'primary_types'->0->>'type') as type,
          COUNT(*) as count,
          ROUND(AVG((apt_profile->'meta'->>'confidence')::decimal), 2) as avg_confidence
        FROM artists 
        WHERE apt_profile IS NOT NULL
        GROUP BY (apt_profile->'primary_types'->0->>'type')
        ORDER BY count DESC
      `);
      
      types.rows.forEach(row => {
        console.log(`  ${row.type}: ${row.count}명 (신뢰도: ${row.avg_confidence})`);
      });
      
      // 3. 샘플 아티스트들
      console.log('\n🎨 매핑된 주요 아티스트 샘플:');
      
      const samples = await pool.query(`
        SELECT 
          name, name_ko,
          (apt_profile->'primary_types'->0->>'type') as apt_type,
          (apt_profile->'meta'->>'confidence') as confidence,
          (apt_profile->'meta'->>'source') as source
        FROM artists 
        WHERE apt_profile IS NOT NULL
        ORDER BY (apt_profile->'meta'->>'confidence')::decimal DESC
        LIMIT 10
      `);
      
      samples.rows.forEach((artist, i) => {
        const name = artist.name || artist.name_ko;
        console.log(`  ${i+1}. ${name}: ${artist.apt_type} (${artist.confidence}, ${artist.source})`);
      });
    }
    
    // 4. 매핑 방법별 통계
    console.log('\n📋 매핑 방법별 통계:');
    
    const methods = await pool.query(`
      SELECT 
        mapping_method,
        COUNT(*) as count,
        ROUND(AVG(confidence_score), 2) as avg_confidence
      FROM artist_apt_mappings
      GROUP BY mapping_method
      ORDER BY count DESC
    `);
    
    methods.rows.forEach(row => {
      console.log(`  ${row.mapping_method}: ${row.count}명 (평균 신뢰도: ${row.avg_confidence})`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

checkAPTStatus();