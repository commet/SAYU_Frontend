/**
 * Convert Major Sources Exhibition Data to Database
 * 수집된 전시 데이터를 데이터베이스 형식으로 변환
 */

const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

async function convertExhibitionsToDb() {
  console.log('🔄 CONVERTING EXHIBITIONS TO DATABASE');
  console.log('====================================\n');

  // 최신 수집된 데이터 파일 읽기
  const filename = 'major-sources-collection-2025-07-26T13-55-03-731Z.json';
  
  if (!fs.existsSync(filename)) {
    console.error('❌ 데이터 파일을 찾을 수 없습니다:', filename);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  console.log(`📊 로드된 데이터: ${data.allExhibitions.length}개 전시`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // 처리할 전시들 필터링 (유의미한 제목이 있는 것만)
    const validExhibitions = data.allExhibitions.filter(ex => {
      const title = ex.title.trim();
      return title.length > 5 && 
             !title.toLowerCase().includes('imagetitle') &&
             !title.toLowerCase().includes('museums') &&
             !title.includes('Newsletter');
    });

    console.log(`✅ 유효한 전시: ${validExhibitions.length}개\n`);

    let insertedVenues = 0;
    let insertedExhibitions = 0;

    for (const exhibition of validExhibitions) {
      try {
        // 1. Venue 추출 및 정제
        let venueName = 'Unknown Venue';
        let venueCity = 'London';
        
        // 제목에서 venue 추출
        if (exhibition.title.includes(' at ')) {
          const parts = exhibition.title.split(' at ');
          if (parts.length >= 2) {
            venueName = parts[1].trim();
          }
        } else if (exhibition.title.includes(' - ')) {
          const parts = exhibition.title.split(' - ');
          if (parts.length >= 2) {
            venueName = parts[1].trim();
          }
        }

        // 제목 정제 (번호 제거)
        let cleanTitle = exhibition.title.replace(/^\d+\.\s*/, '').trim();
        
        // Venue 이름에서 venue 부분 제거
        if (cleanTitle.includes(' at ')) {
          cleanTitle = cleanTitle.split(' at ')[0].trim();
        }

        // URL에서 추가 정보 추출
        let officialUrl = '';
        if (exhibition.url && exhibition.url.startsWith('http')) {
          officialUrl = exhibition.url;
        }

        // 2. Venue 삽입 (중복 확인)
        let venueId = null;
        const existingVenue = await pool.query(`
          SELECT id FROM global_venues 
          WHERE name ILIKE $1 AND city ILIKE $2
          LIMIT 1
        `, [venueName, venueCity]);

        if (existingVenue.rows.length > 0) {
          venueId = existingVenue.rows[0].id;
          console.log(`♻️  기존 venue 사용: ${venueName} (ID: ${venueId})`);
        } else {
          // 새 venue 삽입
          const venueResult = await pool.query(`
            INSERT INTO global_venues (
              name, description, country, city, venue_type, venue_category,
              data_source, data_quality_score, verification_status,
              created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
            ) RETURNING id
          `, [
            venueName,
            `Exhibition venue in ${venueCity}`,
            'GB',
            venueCity,
            'gallery',
            'unknown',
            'timeout_crawled',
            75,
            'unverified'
          ]);
          
          venueId = venueResult.rows[0].id;
          insertedVenues++;
          console.log(`✅ 새 venue 삽입: ${venueName} (ID: ${venueId})`);
        }

        // 3. Exhibition 삽입
        const exhibitionResult = await pool.query(`
          INSERT INTO global_exhibitions (
            venue_id, title, description, start_date, end_date,
            official_url, exhibition_type, data_source, 
            data_quality_score, status, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
          ) RETURNING id
        `, [
          venueId,
          cleanTitle,
          exhibition.description || `Exhibition "${cleanTitle}" at ${venueName}`,
          '2025-01-01', // 기본 시작일
          '2025-12-31', // 기본 종료일
          officialUrl,
          'temporary',
          'timeout_crawled',
          exhibition.quality === 'high' ? 80 : 70,
          'active'
        ]);

        insertedExhibitions++;
        console.log(`🎨 전시 삽입: "${cleanTitle}" - ${venueName}`);

      } catch (error) {
        console.error(`❌ 전시 처리 오류 (${exhibition.title}):`, error.message);
      }
    }

    // 4. 결과 요약
    console.log('\n🎉 변환 완료!');
    console.log('=============');
    console.log(`🏛️  삽입된 새 venues: ${insertedVenues}개`);
    console.log(`🎨 삽입된 exhibitions: ${insertedExhibitions}개`);

    // 5. 최종 검증
    const totalVenues = await pool.query(`
      SELECT COUNT(*) FROM global_venues WHERE data_source = 'timeout_crawled'
    `);
    const totalExhibitions = await pool.query(`
      SELECT COUNT(*) FROM global_exhibitions WHERE data_source = 'timeout_crawled'
    `);

    console.log(`\n📊 timeout_crawled 소스 총계:`);
    console.log(`   Venues: ${totalVenues.rows[0].count}개`);
    console.log(`   Exhibitions: ${totalExhibitions.rows[0].count}개`);

    // 6. 샘플 데이터 출력
    const sampleExhibitions = await pool.query(`
      SELECT e.title, v.name as venue_name, e.data_quality_score
      FROM global_exhibitions e
      JOIN global_venues v ON e.venue_id = v.id
      WHERE e.data_source = 'timeout_crawled'
      ORDER BY e.data_quality_score DESC
      LIMIT 8
    `);

    if (sampleExhibitions.rows.length > 0) {
      console.log('\n✨ 삽입된 전시 샘플:');
      sampleExhibitions.rows.forEach((ex, i) => {
        console.log(`   ${i + 1}. "${ex.title}" - ${ex.venue_name} (품질: ${ex.data_quality_score})`);
      });
    }

  } catch (error) {
    console.error('❌ 변환 중 오류:', error.message);
  } finally {
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  convertExhibitionsToDb();
}

module.exports = { convertExhibitionsToDb };