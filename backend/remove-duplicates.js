const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function removeDuplicates() {
  try {
    console.log('🧹 중복 전시 제거 시작...\n');
    
    // 중복 제거 - 가장 최근에 생성된 것만 남김
    const deleteDuplicates = await pool.query(`
      WITH duplicates AS (
        SELECT 
          id,
          title_local,
          venue_name,
          ROW_NUMBER() OVER (
            PARTITION BY title_local, venue_name 
            ORDER BY created_at DESC
          ) as rn
        FROM exhibitions
      )
      DELETE FROM exhibitions
      WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
      )
      RETURNING title_local, venue_name
    `);
    
    console.log(`✅ ${deleteDuplicates.rows.length}개의 중복 전시가 제거되었습니다.`);
    
    if (deleteDuplicates.rows.length > 0) {
      console.log('\n제거된 중복 전시:');
      const uniqueDeleted = [...new Set(deleteDuplicates.rows.map(r => `${r.title_local} @ ${r.venue_name}`))];
      uniqueDeleted.forEach(item => {
        console.log(`  - ${item}`);
      });
    }
    
    // 최종 통계
    const finalStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN venue_country = 'KR' THEN 1 END) as korean,
        COUNT(CASE WHEN venue_country != 'KR' THEN 1 END) as international
      FROM exhibitions
    `);
    
    console.log('\n📊 중복 제거 후 최종 통계:');
    console.log(`  총 전시: ${finalStats.rows[0].total}개`);
    console.log(`  - 국내: ${finalStats.rows[0].korean}개`);
    console.log(`  - 해외: ${finalStats.rows[0].international}개`);
    
    // 다시 중복 확인
    const remainingDuplicates = await pool.query(`
      SELECT title_local, venue_name, COUNT(*) as count
      FROM exhibitions
      GROUP BY title_local, venue_name
      HAVING COUNT(*) > 1
    `);
    
    if (remainingDuplicates.rows.length === 0) {
      console.log('\n✅ 모든 중복이 제거되었습니다!');
    } else {
      console.log('\n❌ 아직 남은 중복:', remainingDuplicates.rows.length);
    }
    
    // 데이터 품질 최종 점검
    console.log('\n🎯 데이터 품질 최종 점검:');
    
    const qualityCheck = await pool.query(`
      SELECT 
        COUNT(*) as total_exhibitions,
        COUNT(DISTINCT venue_name) as unique_venues,
        COUNT(DISTINCT venue_city) as unique_cities,
        COUNT(DISTINCT venue_country) as unique_countries,
        COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as has_description,
        COUNT(CASE WHEN genres IS NOT NULL THEN 1 END) as has_genres,
        COUNT(CASE WHEN exhibition_type IS NOT NULL THEN 1 END) as has_type
      FROM exhibitions
    `);
    
    const q = qualityCheck.rows[0];
    console.log(`  전시 수: ${q.total_exhibitions}개`);
    console.log(`  고유 장소: ${q.unique_venues}개`);
    console.log(`  도시: ${q.unique_cities}개`);
    console.log(`  국가: ${q.unique_countries}개`);
    console.log(`  설명 포함: ${q.has_description}개 (${Math.round(q.has_description/q.total_exhibitions*100)}%)`);
    console.log(`  장르 정보: ${q.has_genres}개 (${Math.round(q.has_genres/q.total_exhibitions*100)}%)`);
    console.log(`  타입 정보: ${q.has_type}개 (${Math.round(q.has_type/q.total_exhibitions*100)}%)`);
    
    console.log('\n✨ 중복 제거 및 데이터 정제 완료!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

removeDuplicates();