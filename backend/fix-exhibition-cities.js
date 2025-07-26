const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixExhibitionCities() {
  const client = await pool.connect();
  
  try {
    let updateCount = 0;

    // 1. 서울특별시 -> 서울로 통일
    console.log('1. 서울특별시 -> 서울로 변경 중...');
    const seoulUpdate = await client.query(`
      UPDATE exhibitions 
      SET venue_city = '서울' 
      WHERE venue_city = '서울특별시'
    `);
    console.log(`서울특별시 -> 서울: ${seoulUpdate.rowCount}개 업데이트`);
    updateCount += seoulUpdate.rowCount;

    // 2. 부산광역시 -> 부산으로 통일
    console.log('2. 부산광역시 -> 부산으로 변경 중...');
    const busanUpdate = await client.query(`
      UPDATE exhibitions 
      SET venue_city = '부산' 
      WHERE venue_city = '부산광역시'
    `);
    console.log(`부산광역시 -> 부산: ${busanUpdate.rowCount}개 업데이트`);
    updateCount += busanUpdate.rowCount;

    // 3. 대구광역시 -> 대구로 통일
    console.log('3. 대구광역시 -> 대구로 변경 중...');
    const daeguUpdate = await client.query(`
      UPDATE exhibitions 
      SET venue_city = '대구' 
      WHERE venue_city = '대구광역시'
    `);
    console.log(`대구광역시 -> 대구: ${daeguUpdate.rowCount}개 업데이트`);
    updateCount += daeguUpdate.rowCount;

    // 4. 인천광역시 -> 인천으로 통일
    console.log('4. 인천광역시 -> 인천으로 변경 중...');
    const incheonUpdate = await client.query(`
      UPDATE exhibitions 
      SET venue_city = '인천' 
      WHERE venue_city = '인천광역시'
    `);
    console.log(`인천광역시 -> 인천: ${incheonUpdate.rowCount}개 업데이트`);
    updateCount += incheonUpdate.rowCount;

    // 5. 광주광역시 -> 광주로 통일
    console.log('5. 광주광역시 -> 광주로 변경 중...');
    const gwangjuUpdate = await client.query(`
      UPDATE exhibitions 
      SET venue_city = '광주' 
      WHERE venue_city = '광주광역시'
    `);
    console.log(`광주광역시 -> 광주: ${gwangjuUpdate.rowCount}개 업데이트`);
    updateCount += gwangjuUpdate.rowCount;

    // 6. 대전광역시 -> 대전으로 통일
    console.log('6. 대전광역시 -> 대전으로 변경 중...');
    const daejeonUpdate = await client.query(`
      UPDATE exhibitions 
      SET venue_city = '대전' 
      WHERE venue_city = '대전광역시'
    `);
    console.log(`대전광역시 -> 대전: ${daejeonUpdate.rowCount}개 업데이트`);
    updateCount += daejeonUpdate.rowCount;

    // 7. 울산광역시 -> 울산으로 통일
    console.log('7. 울산광역시 -> 울산으로 변경 중...');
    const ulsanUpdate = await client.query(`
      UPDATE exhibitions 
      SET venue_city = '울산' 
      WHERE venue_city = '울산광역시'
    `);
    console.log(`울산광역시 -> 울산: ${ulsanUpdate.rowCount}개 업데이트`);
    updateCount += ulsanUpdate.rowCount;

    // 8. 기타 시도명 정리
    console.log('8. 기타 시도명 정리 중...');
    
    // 경기도 주요 도시들 분리
    const gyeonggiCities = await client.query(`
      SELECT DISTINCT venue_name, venue_city
      FROM exhibitions 
      WHERE venue_city = '경기도'
      ORDER BY venue_name
      LIMIT 10
    `);
    
    console.log('경기도로 분류된 전시들 중 일부:');
    gyeonggiCities.rows.forEach(row => {
      console.log(`- ${row.venue_name} (${row.venue_city})`);
    });

    // 업데이트 후 분포 확인
    console.log('\n=== 업데이트 후 도시별 분포 ===');
    const newDistribution = await client.query(`
      SELECT venue_city, COUNT(*) as count 
      FROM exhibitions 
      GROUP BY venue_city 
      ORDER BY count DESC
      LIMIT 15
    `);
    
    newDistribution.rows.forEach(row => {
      console.log(`${row.venue_city}: ${row.count}개`);
    });

    console.log(`\n총 ${updateCount}개 전시의 도시명이 업데이트되었습니다.`);

  } catch (error) {
    console.error('오류:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixExhibitionCities().catch(console.error);