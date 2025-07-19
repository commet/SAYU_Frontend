const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function showAllExhibitions() {
  try {
    console.log('\n📋 SAYU 전시 데이터베이스 전체 목록\n');
    console.log('=' .repeat(120));
    
    // 모든 전시 가져오기 (날짜순 정렬)
    const allExhibitions = await pool.query(`
      SELECT 
        title_local,
        title_en,
        venue_name,
        venue_city,
        venue_country,
        start_date,
        end_date,
        exhibition_type,
        status,
        genres,
        description
      FROM exhibitions
      ORDER BY 
        CASE 
          WHEN status = 'ongoing' THEN 1
          WHEN status = 'upcoming' THEN 2
          ELSE 3
        END,
        start_date DESC
    `);
    
    // 상태별로 그룹화
    const ongoing = allExhibitions.rows.filter(e => e.status === 'ongoing');
    const upcoming = allExhibitions.rows.filter(e => e.status === 'upcoming');
    const closed = allExhibitions.rows.filter(e => e.status === 'Closed');
    
    console.log(`\n🟢 진행 중인 전시 (${ongoing.length}개)\n`);
    ongoing.forEach((ex, i) => {
      printExhibition(ex, i + 1);
    });
    
    console.log(`\n🔵 예정된 전시 (${upcoming.length}개)\n`);
    upcoming.forEach((ex, i) => {
      printExhibition(ex, i + 1);
    });
    
    console.log(`\n⚫ 종료된 전시 (${closed.length}개)\n`);
    closed.forEach((ex, i) => {
      printExhibition(ex, i + 1);
    });
    
    console.log('\n' + '=' .repeat(120));
    console.log(`총 ${allExhibitions.rows.length}개의 전시`);
    console.log('=' .repeat(120) + '\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

function printExhibition(ex, num) {
  const startDate = ex.start_date ? new Date(ex.start_date).toLocaleDateString('ko-KR') : 'N/A';
  const endDate = ex.end_date ? new Date(ex.end_date).toLocaleDateString('ko-KR') : 'N/A';
  const genres = ex.genres ? ex.genres.join(', ') : '';
  const description = ex.description ? ex.description.substring(0, 100) + '...' : '';
  
  console.log(`${num}. ${ex.title_local || ex.title_en}`);
  console.log(`   📍 ${ex.venue_name}, ${ex.venue_city} (${ex.venue_country})`);
  console.log(`   📅 ${startDate} ~ ${endDate}`);
  if (ex.exhibition_type) console.log(`   🎨 유형: ${ex.exhibition_type}`);
  if (genres) console.log(`   🏷️  장르: ${genres}`);
  if (description) console.log(`   📝 ${description}`);
  console.log();
}

showAllExhibitions();