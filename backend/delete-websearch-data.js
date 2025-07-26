/**
 * Delete WebSearch Exhibition Data
 * 부정확한 WebSearch 전시 데이터를 데이터베이스에서 삭제
 */

const { Pool } = require('pg');
require('dotenv').config();

async function deleteWebsearchData() {
  console.log('🗑️  DELETING WEBSEARCH EXHIBITION DATA');
  console.log('====================================\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // 삭제 전 현황 확인
    const beforeVenues = await pool.query(`
      SELECT COUNT(*) FROM global_venues WHERE data_source = 'websearch_verified'
    `);
    const beforeExhibitions = await pool.query(`
      SELECT COUNT(*) FROM global_exhibitions WHERE data_source = 'websearch_verified'
    `);
    
    console.log('📊 삭제 전 현황:');
    console.log(`   WebSearch Venues: ${beforeVenues.rows[0].count}개`);
    console.log(`   WebSearch Exhibitions: ${beforeExhibitions.rows[0].count}개\n`);

    // timeout_crawled 데이터도 같이 확인
    const timeoutVenues = await pool.query(`
      SELECT COUNT(*) FROM global_venues WHERE data_source = 'timeout_crawled'
    `);
    const timeoutExhibitions = await pool.query(`
      SELECT COUNT(*) FROM global_exhibitions WHERE data_source = 'timeout_crawled'
    `);
    
    console.log('📊 기타 엉터리 데이터:');
    console.log(`   Timeout Crawled Venues: ${timeoutVenues.rows[0].count}개`);
    console.log(`   Timeout Crawled Exhibitions: ${timeoutExhibitions.rows[0].count}개\n`);

    // 1. WebSearch exhibitions 삭제
    console.log('🗑️  WebSearch exhibitions 삭제 중...');
    const deletedExhibitions = await pool.query(`
      DELETE FROM global_exhibitions 
      WHERE data_source = 'websearch_verified'
    `);
    console.log(`   ✅ ${deletedExhibitions.rowCount}개 exhibitions 삭제됨`);

    // 2. Timeout crawled exhibitions도 삭제 (엉터리였으니까)
    console.log('🗑️  Timeout crawled exhibitions 삭제 중...');
    const deletedTimeoutExhibitions = await pool.query(`
      DELETE FROM global_exhibitions 
      WHERE data_source = 'timeout_crawled'
    `);
    console.log(`   ✅ ${deletedTimeoutExhibitions.rowCount}개 timeout exhibitions 삭제됨`);

    // 3. 고아 venues 삭제 (exhibitions가 없는 websearch venues)
    console.log('🗑️  고아 venues 삭제 중...');
    const deletedVenues = await pool.query(`
      DELETE FROM global_venues 
      WHERE data_source IN ('websearch_verified', 'timeout_crawled')
      AND id NOT IN (
        SELECT DISTINCT venue_id 
        FROM global_exhibitions 
        WHERE venue_id IS NOT NULL
      )
    `);
    console.log(`   ✅ ${deletedVenues.rowCount}개 venues 삭제됨`);

    // 4. 삭제 후 현황 확인
    console.log('\n📊 삭제 후 현황:');
    
    const afterTotal = await pool.query(`
      SELECT COUNT(*) FROM global_exhibitions
    `);
    const afterVenues = await pool.query(`
      SELECT COUNT(*) FROM global_venues
    `);
    
    console.log(`   전체 exhibitions: ${afterTotal.rows[0].count}개`);
    console.log(`   전체 venues: ${afterVenues.rows[0].count}개`);

    // 5. 남은 데이터 소스별 확인
    const remainingSources = await pool.query(`
      SELECT data_source, COUNT(*) as count
      FROM global_exhibitions
      GROUP BY data_source
      ORDER BY count DESC
    `);

    console.log('\n📊 남은 exhibitions 소스별:');
    remainingSources.rows.forEach(source => {
      console.log(`   ${source.data_source}: ${source.count}개`);
    });

    console.log('\n🎉 엉터리 데이터 삭제 완료!');
    console.log('===============================');
    console.log('✅ WebSearch로 수집한 부정확한 전시 데이터 모두 삭제됨');
    console.log('✅ Timeout 크롤링으로 수집한 엉터리 데이터도 삭제됨');
    console.log('✅ 사용하지 않는 venues도 정리됨');

  } catch (error) {
    console.error('❌ 삭제 중 오류:', error.message);
  } finally {
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  deleteWebsearchData();
}

module.exports = { deleteWebsearchData };