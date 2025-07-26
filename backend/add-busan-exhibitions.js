const { Pool } = require('pg');
const fs = require('fs').promises;
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addBusanExhibitions() {
  const client = await pool.connect();
  
  try {
    // JSON 파일 읽기
    const data = await fs.readFile('C:\\Users\\SAMSUNG\\Documents\\GitHub\\SAYU\\busan_exhibitions.json', 'utf8');
    const exhibitions = JSON.parse(data);
    
    let successCount = 0;
    let errorCount = 0;

    for (const exhibition of exhibitions) {
      try {
        // title 정리
        const cleanedTitle = exhibition.title_ko
          .replace(/[\[\]]/g, '')
          .replace(/《|》/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        // 중복 확인
        const existing = await client.query(
          'SELECT id FROM exhibitions WHERE title_local = $1 AND venue_name = $2 AND start_date = $3',
          [cleanedTitle, exhibition.venue_name, exhibition.start_date]
        );

        if (existing.rows.length > 0) {
          console.log(`이미 존재: ${cleanedTitle}`);
          continue;
        }

        // 장소 처리
        let venueId = null;
        const venueCheck = await client.query(
          'SELECT id FROM venues WHERE name = $1',
          [exhibition.venue_name]
        );

        if (venueCheck.rows.length > 0) {
          venueId = venueCheck.rows[0].id;
        } else {
          const venueInsert = await client.query(
            `INSERT INTO venues (name, address, latitude, longitude, website)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [
              exhibition.venue_name,
              exhibition.venue_address || null,
              35.1795543, // 부산 기본 위도
              129.0756416, // 부산 기본 경도
              exhibition.website || null
            ]
          );
          venueId = venueInsert.rows[0].id;
          console.log(`새 장소 추가: ${exhibition.venue_name}`);
        }

        // 전시 정보 구성
        let description = exhibition.opening_hours || '정보 없음';
        if (exhibition.curator) {
          description += `\n${exhibition.curator}`;
        }

        // 전시 추가
        await client.query(
          `INSERT INTO exhibitions (
            title_local, title_en, venue_id, venue_name, venue_city, venue_country,
            start_date, end_date, description, artists, exhibition_type, 
            admission_fee, official_url, source, source_url, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
          )`,
          [
            cleanedTitle,
            exhibition.title_en || cleanedTitle,
            venueId,
            exhibition.venue_name,
            exhibition.venue_city || '부산',
            'KR',
            exhibition.start_date,
            exhibition.end_date || exhibition.start_date,
            description,
            null,
            '전시',
            exhibition.admission_fee || '정보 없음',
            exhibition.website || null,
            'culture_portal',
            null,
            'current'
          ]
        );

        console.log(`✓ 추가 완료: ${cleanedTitle}`);
        successCount++;

      } catch (error) {
        console.error(`오류 발생 (${exhibition.title_ko}):`, error.message);
        errorCount++;
      }
    }

    console.log(`\n=== 완료 ===`);
    console.log(`총 ${exhibitions.length}개 전시 중:`);
    console.log(`성공: ${successCount}개`);
    console.log(`오류: ${errorCount}개`);

  } catch (error) {
    console.error('전체 오류:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addBusanExhibitions().catch(console.error);