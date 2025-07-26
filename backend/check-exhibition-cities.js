const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkExhibitionCities() {
  const client = await pool.connect();
  
  try {
    // 전체 전시 개수와 도시별 분포 확인
    const totalCount = await client.query('SELECT COUNT(*) as count FROM exhibitions');
    console.log(`총 전시 개수: ${totalCount.rows[0].count}`);

    const cityDistribution = await client.query(`
      SELECT venue_city, COUNT(*) as count 
      FROM exhibitions 
      GROUP BY venue_city 
      ORDER BY count DESC
    `);
    
    console.log('\n=== 도시별 분포 ===');
    cityDistribution.rows.forEach(row => {
      console.log(`${row.venue_city}: ${row.count}개`);
    });

    // 오늘 추가된 전시들 (source가 'culture_portal'인 것들)
    const todayAdded = await client.query(`
      SELECT venue_city, COUNT(*) as count 
      FROM exhibitions 
      WHERE source = 'culture_portal'
      GROUP BY venue_city 
      ORDER BY count DESC
    `);
    
    console.log('\n=== 오늘 추가된 전시 (culture_portal) ===');
    todayAdded.rows.forEach(row => {
      console.log(`${row.venue_city}: ${row.count}개`);
    });

    // 이전에 추가된 전시들 (source가 'culture_portal'이 아닌 것들)
    const previouslyAdded = await client.query(`
      SELECT venue_city, COUNT(*) as count 
      FROM exhibitions 
      WHERE source != 'culture_portal' OR source IS NULL
      GROUP BY venue_city 
      ORDER BY count DESC
    `);
    
    console.log('\n=== 이전에 추가된 전시들 ===');
    previouslyAdded.rows.forEach(row => {
      console.log(`${row.venue_city}: ${row.count}개`);
    });

    // 문제가 될 수 있는 전시들 샘플 확인
    const sampleExhibitions = await client.query(`
      SELECT id, title_local, venue_name, venue_city, source
      FROM exhibitions 
      WHERE (source != 'culture_portal' OR source IS NULL)
      AND venue_city = '서울'
      ORDER BY id
      LIMIT 20
    `);
    
    console.log('\n=== 이전 전시 샘플 (venue_city가 서울인 것들) ===');
    sampleExhibitions.rows.forEach(row => {
      console.log(`ID: ${row.id}, 제목: ${row.title_local}, 장소: ${row.venue_name}, 도시: ${row.venue_city}, 소스: ${row.source || 'NULL'}`);
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkExhibitionCities().catch(console.error);