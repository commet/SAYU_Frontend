/**
 * Artmap 전시 데이터를 기존 exhibitions 테이블에 저장
 */

const { pool } = require('./src/config/database');
const fs = require('fs');

async function saveArtmapToExhibitions() {
  try {
    console.log('🎨 Artmap 데이터를 SAYU exhibitions 테이블에 저장...');

    // JSON 파일 읽기
    const filename = 'artmap-multi-category-2025-07-26T12-50-55-240Z.json';
    if (!fs.existsSync(filename)) {
      console.error(`❌ 파일을 찾을 수 없습니다: ${filename}`);
      return;
    }

    const exhibitions = JSON.parse(fs.readFileSync(filename, 'utf8'));
    console.log(`📊 총 ${exhibitions.length}개 전시 처리 중...`);

    let saved = 0;
    let skipped = 0;
    let errors = 0;

    for (const exhibition of exhibitions) {
      try {
        // 1. 먼저 venue 생성/찾기
        const venueResult = await findOrCreateVenue(exhibition);
        const venueId = venueResult.venue_id;

        // 2. 중복 전시 체크
        const existingQuery = `
          SELECT id FROM exhibitions 
          WHERE title = $1 AND venue_id = $2
        `;
        const existing = await pool.query(existingQuery, [
          exhibition.title, 
          venueId
        ]);

        if (existing.rows.length > 0) {
          console.log(`⚠️  이미 존재: ${exhibition.title}`);
          skipped++;
          continue;
        }

        // 3. 날짜 파싱
        const dates = parseDates(exhibition.dates.original);

        // 4. 전시 저장
        const insertQuery = `
          INSERT INTO exhibitions (
            title, title_en, description,
            venue_id, venue_name, venue_city, venue_country,
            start_date, end_date,
            artists, poster_image, official_url,
            source, source_url,
            verification_status, status,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
          )
        `;

        await pool.query(insertQuery, [
          exhibition.title,                        // title
          exhibition.title,                        // title_en (같게)
          null,                                   // description (나중에 추가)
          venueId,                                // venue_id
          exhibition.venue.name,                  // venue_name
          venueResult.city,                       // venue_city
          venueResult.country,                    // venue_country
          dates.startDate,                        // start_date
          dates.endDate,                          // end_date
          JSON.stringify([]),                     // artists (빈 배열)
          exhibition.imageUrl,                    // poster_image
          exhibition.url,                         // official_url
          'artmap',                               // source
          exhibition.url,                         // source_url
          'verified',                             // verification_status
          determineStatus(dates)                  // status
        ]);

        console.log(`✅ 저장: ${exhibition.title} (${exhibition.venue.name})`);
        saved++;

      } catch (error) {
        console.error(`❌ 저장 실패: ${exhibition.title}`, error.message);
        errors++;
      }
    }

    console.log(`\n🎯 완료!`);
    console.log(`✅ 저장됨: ${saved}개`);
    console.log(`⚠️  건너뜀: ${skipped}개`);
    console.log(`❌ 오류: ${errors}개`);

  } catch (error) {
    console.error('전체 오류:', error);
  } finally {
    if (pool && pool.end) {
      await pool.end();
    }
  }
}

/**
 * venue 찾기 또는 생성
 */
async function findOrCreateVenue(exhibition) {
  const venueName = exhibition.venue.name;
  
  // 도시/국가 추정
  const location = estimateLocation(venueName);

  // 기존 venue 찾기
  const existingVenue = await pool.query(
    'SELECT id FROM venues WHERE name = $1',
    [venueName]
  );

  if (existingVenue.rows.length > 0) {
    return {
      venue_id: existingVenue.rows[0].id,
      city: location.city,
      country: location.country
    };
  }

  // 새 venue 생성
  const insertVenueQuery = `
    INSERT INTO venues (
      name, type, address, city, country, website, 
      is_active, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
    RETURNING id
  `;

  const newVenue = await pool.query(insertVenueQuery, [
    venueName,
    'gallery',  // 기본 타입
    location.city,  // address로 city 사용
    location.city,
    location.country,
    exhibition.venue.url
  ]);

  return {
    venue_id: newVenue.rows[0].id,
    city: location.city,
    country: location.country
  };
}

/**
 * 위치 추정
 */
function estimateLocation(venueName) {
  const name = venueName.toLowerCase();
  
  if (name.includes('berlin')) return { city: 'Berlin', country: 'DE' };
  if (name.includes('basel')) return { city: 'Basel', country: 'CH' };
  if (name.includes('zurich') || name.includes('zürich')) return { city: 'Zurich', country: 'CH' };
  if (name.includes('london')) return { city: 'London', country: 'GB' };
  if (name.includes('munich') || name.includes('münchen')) return { city: 'Munich', country: 'DE' };
  if (name.includes('vienna') || name.includes('wien')) return { city: 'Vienna', country: 'AT' };
  if (name.includes('oslo')) return { city: 'Oslo', country: 'NO' };
  if (name.includes('stockholm')) return { city: 'Stockholm', country: 'SE' };
  if (name.includes('amsterdam')) return { city: 'Amsterdam', country: 'NL' };
  if (name.includes('miami')) return { city: 'Miami', country: 'US' };
  if (name.includes('krakow') || name.includes('cracow')) return { city: 'Krakow', country: 'PL' };
  if (name.includes('innsbruck')) return { city: 'Innsbruck', country: 'AT' };
  if (name.includes('karlsruhe')) return { city: 'Karlsruhe', country: 'DE' };
  if (name.includes('dornbirn')) return { city: 'Dornbirn', country: 'AT' };
  
  // 기본값
  return { city: 'Unknown', country: 'XX' };
}

/**
 * 날짜 파싱
 */
function parseDates(dateText) {
  if (!dateText) return { startDate: null, endDate: null };

  // "11 Jul - 13 Oct 2025" 형식
  const match1 = dateText.match(/(\d{1,2}\s+\w+)\s*-\s*(\d{1,2}\s+\w+\s+\d{4})/);
  if (match1) {
    const year = match1[2].split(' ').pop();
    const startDateStr = `${match1[1]} ${year}`;
    const endDateStr = match1[2];
    
    return {
      startDate: parseSimpleDate(startDateStr),
      endDate: parseSimpleDate(endDateStr)
    };
  }

  // "11 Jul 2025 - 17 Aug 2026" 형식
  const match2 = dateText.match(/(\d{1,2}\s+\w+\s+\d{4})\s*-\s*(\d{1,2}\s+\w+\s+\d{4})/);
  if (match2) {
    return {
      startDate: parseSimpleDate(match2[1]),
      endDate: parseSimpleDate(match2[2])
    };
  }

  return { startDate: null, endDate: null };
}

/**
 * 간단한 날짜 파싱 ("11 Jul 2025" -> "2025-07-11")
 */
function parseSimpleDate(dateStr) {
  const months = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };

  const parts = dateStr.trim().split(' ');
  if (parts.length !== 3) return null;

  const day = parts[0].padStart(2, '0');
  const month = months[parts[1]];
  const year = parts[2];

  if (!month) return null;
  
  return `${year}-${month}-${day}`;
}

/**
 * 전시 상태 결정
 */
function determineStatus(dates) {
  if (!dates.startDate || !dates.endDate) return 'upcoming';

  const now = new Date();
  const startDate = new Date(dates.startDate);
  const endDate = new Date(dates.endDate);

  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'ended';
  return 'ongoing';
}

if (require.main === module) {
  saveArtmapToExhibitions();
}

module.exports = saveArtmapToExhibitions;