/**
 * Artmap 전시 데이터를 SAYU 데이터베이스에 저장
 */

const { pool } = require('./src/config/database');
const fs = require('fs');

async function saveArtmapExhibitions() {
  try {
    console.log('🎨 SAYU Database에 Artmap 전시 정보 저장 시작...');

    // JSON 파일 읽기
    const filename = 'artmap-multi-category-2025-07-26T12-50-55-240Z.json';
    const exhibitions = JSON.parse(fs.readFileSync(filename, 'utf8'));
    
    console.log(`📊 총 ${exhibitions.length}개 전시 처리 중...`);

    let saved = 0;
    let skipped = 0;

    for (const exhibition of exhibitions) {
      try {
        // 중복 체크 (제목과 장소로)
        const existingQuery = `
          SELECT id FROM global_venues 
          WHERE title = $1 AND venue_name = $2
        `;
        const existing = await pool.query(existingQuery, [
          exhibition.title, 
          exhibition.venue.name
        ]);

        if (existing.rows.length > 0) {
          console.log(`⚠️  이미 존재: ${exhibition.title}`);
          skipped++;
          continue;
        }

        // 새 전시 저장
        const insertQuery = `
          INSERT INTO global_venues (
            title, title_en, description, venue_name, 
            start_date, end_date, image_url, website_url,
            source, city, country, category, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        `;

        // 날짜 파싱 시도
        let startDate = null;
        let endDate = null;
        
        const dateText = exhibition.dates.original;
        const dateMatch = dateText.match(/(\d{1,2}\s+\w+)\s*-\s*(\d{1,2}\s+\w+\s+\d{4})/);
        
        if (dateMatch) {
          // 간단한 날짜 변환 (정확하지 않을 수 있음)
          startDate = dateMatch[1] + ' 2025'; // 대부분 2025년
          endDate = dateMatch[2];
        }

        // 도시/국가 추정 (venue 이름에서)
        let city = 'Unknown';
        let country = 'Unknown';
        
        if (exhibition.venue.name.includes('Berlin')) {
          city = 'Berlin';
          country = 'Germany';
        } else if (exhibition.venue.name.includes('Basel')) {
          city = 'Basel';
          country = 'Switzerland';
        } else if (exhibition.venue.name.includes('London')) {
          city = 'London';
          country = 'United Kingdom';
        } else if (exhibition.venue.name.includes('Munich')) {
          city = 'Munich';
          country = 'Germany';
        } else if (exhibition.venue.name.includes('Vienna')) {
          city = 'Vienna';
          country = 'Austria';
        } else if (exhibition.venue.name.includes('Zurich')) {
          city = 'Zurich';
          country = 'Switzerland';
        } else if (exhibition.venue.name.includes('Oslo')) {
          city = 'Oslo';
          country = 'Norway';
        } else if (exhibition.venue.name.includes('Stockholm')) {
          city = 'Stockholm';
          country = 'Sweden';
        } else if (exhibition.venue.name.includes('Amsterdam')) {
          city = 'Amsterdam';
          country = 'Netherlands';
        } else if (exhibition.venue.name.includes('Miami')) {
          city = 'Miami';
          country = 'United States';
        } else if (exhibition.venue.name.includes('Krakow')) {
          city = 'Krakow';
          country = 'Poland';
        }

        await pool.query(insertQuery, [
          exhibition.title,
          exhibition.title, // title_en도 같게
          null, // description은 나중에 추가
          exhibition.venue.name,
          startDate,
          endDate,
          exhibition.imageUrl,
          exhibition.url,
          'artmap.com',
          city,
          country,
          exhibition.category,
        ]);

        console.log(`✅ 저장: ${exhibition.title} (${exhibition.venue.name})`);
        saved++;

      } catch (error) {
        console.error(`❌ 저장 실패: ${exhibition.title}`, error.message);
      }
    }

    console.log(`\n🎯 완료!`);
    console.log(`✅ 저장됨: ${saved}개`);
    console.log(`⚠️  건너뜀: ${skipped}개`);

  } catch (error) {
    console.error('오류:', error);
  } finally {
    if (pool && pool.end) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  saveArtmapExhibitions();
}

module.exports = saveArtmapExhibitions;