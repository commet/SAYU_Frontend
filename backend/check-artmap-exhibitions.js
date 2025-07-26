/**
 * Artmap에서 수집한 전시 데이터 확인
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkArtmapExhibitions() {
  const client = await pool.connect();
  
  try {
    // Artmap에서 수집한 전시 조회
    const query = `
      SELECT 
        e.id,
        e.title_en,
        e.venue_name,
        e.venue_city,
        e.venue_country,
        e.start_date,
        e.end_date,
        e.status,
        e.description,
        e.source,
        e.source_url,
        e.created_at
      FROM exhibitions e
      WHERE e.source = 'artmap'
      ORDER BY e.created_at DESC
      LIMIT 10
    `;
    
    const result = await client.query(query);
    
    console.log('\n🎨 ARTMAP에서 수집한 전시 정보');
    console.log('=' .repeat(80));
    console.log(`총 ${result.rows.length}개 전시\n`);
    
    result.rows.forEach((exhibition, index) => {
      console.log(`${index + 1}. ${exhibition.title_en}`);
      console.log(`   📍 장소: ${exhibition.venue_name}, ${exhibition.venue_city}, ${exhibition.venue_country}`);
      console.log(`   📅 기간: ${formatDate(exhibition.start_date)} ~ ${formatDate(exhibition.end_date)}`);
      console.log(`   🎯 상태: ${exhibition.status}`);
      console.log(`   📝 설명: ${exhibition.description ? exhibition.description.substring(0, 100) + '...' : '없음'}`);
      console.log(`   🔗 출처: ${exhibition.source_url}`);
      console.log(`   ⏰ 수집: ${formatDateTime(exhibition.created_at)}`);
      console.log('');
    });
    
    // 통계 정보
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT venue_name) as unique_venues,
        COUNT(DISTINCT venue_city) as unique_cities,
        MIN(start_date) as earliest_start,
        MAX(end_date) as latest_end
      FROM exhibitions
      WHERE source = 'artmap'
    `;
    
    const stats = await client.query(statsQuery);
    const stat = stats.rows[0];
    
    console.log('📊 통계 정보');
    console.log('=' .repeat(80));
    console.log(`총 전시 수: ${stat.total}개`);
    console.log(`고유 장소 수: ${stat.unique_venues}개`);
    console.log(`고유 도시 수: ${stat.unique_cities}개`);
    console.log(`가장 빠른 시작일: ${formatDate(stat.earliest_start)}`);
    console.log(`가장 늦은 종료일: ${formatDate(stat.latest_end)}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('ko-KR');
}

function formatDateTime(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('ko-KR');
}

// 실행
checkArtmapExhibitions();