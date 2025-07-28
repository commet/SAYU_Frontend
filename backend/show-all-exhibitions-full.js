const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function showAllExhibitionsFull() {
  try {
    // 모든 전시 가져오기
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
        description,
        source
      FROM exhibitions
      ORDER BY start_date DESC
    `);

    console.log(`\n총 ${allExhibitions.rows.length}개 전시\n`);
    console.log('=' .repeat(150));

    allExhibitions.rows.forEach((ex, i) => {
      const startDate = ex.start_date ? new Date(ex.start_date).toLocaleDateString('ko-KR') : 'N/A';
      const endDate = ex.end_date ? new Date(ex.end_date).toLocaleDateString('ko-KR') : 'N/A';
      const genres = ex.genres ? ex.genres.join(', ') : '';

      console.log(`\n${i + 1}. ${ex.title_local || ex.title_en}`);
      if (ex.title_en && ex.title_local && ex.title_en !== ex.title_local) {
        console.log(`   (${ex.title_en})`);
      }
      console.log(`   📍 ${ex.venue_name}, ${ex.venue_city} (${ex.venue_country})`);
      console.log(`   📅 ${startDate} ~ ${endDate}`);
      console.log(`   🎨 유형: ${ex.exhibition_type || 'N/A'} | 상태: ${ex.status}`);
      if (genres) console.log(`   🏷️  장르: ${genres}`);
      if (ex.description) console.log(`   📝 ${ex.description}`);
      console.log(`   📌 출처: ${ex.source}`);
    });

    console.log(`\n${'=' .repeat(150)}\n`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

showAllExhibitionsFull();
