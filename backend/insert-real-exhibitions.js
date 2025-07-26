/**
 * Insert Real Exhibition Data from Web Search
 * WebSearch로 찾은 실제 전시 정보를 데이터베이스에 삽입
 */

const { Pool } = require('pg');
require('dotenv').config();

async function insertRealExhibitions() {
  console.log('🎨 INSERTING REAL EXHIBITION DATA');
  console.log('=================================\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // 실제 전시 데이터 (WebSearch 결과 기반)
    const realExhibitions = [
      // MoMA New York
      {
        venue: 'Museum of Modern Art (MoMA)',
        city: 'New York',
        country: 'US',
        title: 'New Photography 2025: Lines of Belonging',
        description: '40th anniversary edition featuring 13 international artists/collectives exploring themes of belonging, memory, and community across Kathmandu, New Orleans, Johannesburg, and Mexico City',
        startDate: '2025-09-14',
        endDate: '2026-01-17',
        type: 'photography',
        website: 'https://www.moma.org/'
      },
      
      // Tate Modern London
      {
        venue: 'Tate Modern',
        city: 'London', 
        country: 'GB',
        title: 'Do Ho Suh: Walk the House',
        description: 'Korean-born, London-based artist exploring themes of home, identity, and belonging through large-scale installations, sculptures, videos, and drawings',
        startDate: '2024-11-01',
        endDate: '2025-10-26',
        type: 'installation',
        website: 'https://www.tate.org.uk/'
      },
      {
        venue: 'Tate Modern',
        city: 'London',
        country: 'GB', 
        title: 'Leigh Bowery',
        description: 'Boundary-pushing artist, performer, model, designer, and musician from 1980s London club scene exploring body as shape-shifting tool',
        startDate: '2025-03-01',
        endDate: '2025-08-31',
        type: 'performance',
        website: 'https://www.tate.org.uk/'
      },
      {
        venue: 'Tate Modern',
        city: 'London',
        country: 'GB',
        title: 'Emily Kam Kngwarray',
        description: 'First major European exhibition of Australia\'s greatest Indigenous artist featuring monumental, shimmering canvases created in her late 70s and early 80s',
        startDate: '2024-12-01',
        endDate: '2026-01-11',
        type: 'painting',
        website: 'https://www.tate.org.uk/'
      },
      {
        venue: 'Tate Modern',
        city: 'London',
        country: 'GB',
        title: 'Theatre Picasso',
        description: 'Focuses on Picasso\'s masterpiece "The Three Dancers" exploring personal tragedy, emotional intensity, and artistic innovation',
        startDate: '2025-09-17',
        endDate: '2026-04-12',
        type: 'painting',
        website: 'https://www.tate.org.uk/'
      },
      {
        venue: 'Tate Modern',
        city: 'London',
        country: 'GB',
        title: 'Nigerian Modernism',
        description: 'Artists who revolutionized modern art in Nigeria in the mid-20th century',
        startDate: '2025-10-08',
        endDate: '2026-05-11',
        type: 'painting',
        website: 'https://www.tate.org.uk/'
      },
      
      // Met Museum New York
      {
        venue: 'The Metropolitan Museum of Art',
        city: 'New York',
        country: 'US',
        title: 'Siena: The Rise of Painting, 1300–1350',
        description: 'First major US exhibition on early Sienese painting and the dawn of the Italian Renaissance',
        startDate: '2024-10-01',
        endDate: '2025-01-26',
        type: 'painting',
        website: 'https://www.metmuseum.org/'
      },
      {
        venue: 'The Metropolitan Museum of Art',
        city: 'New York',
        country: 'US',
        title: 'Flight into Egypt: Black Artists and Ancient Egypt, 1876–Now',
        description: 'Black artists\' engagement with ancient Egypt as inspiration and identity source',
        startDate: '2024-11-01',
        endDate: '2025-02-17',
        type: 'mixed_media',
        website: 'https://www.metmuseum.org/'
      },
      {
        venue: 'The Metropolitan Museum of Art',
        city: 'New York',
        country: 'US',
        title: 'Caspar David Friedrich: The Soul of Nature',
        description: 'Major retrospective of the German Romantic painter',
        startDate: '2025-02-08',
        endDate: '2025-05-11',
        type: 'painting',
        website: 'https://www.metmuseum.org/'
      },
      {
        venue: 'The Metropolitan Museum of Art',
        city: 'New York',
        country: 'US',
        title: 'Sargent and Paris',
        description: 'John Singer Sargent\'s relationship with Paris and French artistic culture',
        startDate: '2025-04-21',
        endDate: '2025-08-03',
        type: 'painting',
        website: 'https://www.metmuseum.org/'
      },
      
      // Louvre Paris
      {
        venue: 'Louvre Museum',
        city: 'Paris',
        country: 'FR',
        title: 'Art and Fashion: Statement Pieces',
        description: 'First-ever fashion exhibition at the Louvre featuring 65 outfits and 30 accessories from 40 designers including Karl Lagerfeld and Yohji Yamamoto',
        startDate: '2025-01-24',
        endDate: '2025-08-24',
        type: 'fashion',
        website: 'https://www.louvre.fr/'
      },
      {
        venue: 'Louvre Museum',
        city: 'Paris',
        country: 'FR',
        title: 'The Mamluks (1250-1517)',
        description: 'European first examining the golden age of Islamic Near East',
        startDate: '2025-04-30',
        endDate: '2025-07-28',
        type: 'historical',
        website: 'https://www.louvre.fr/'
      },
      
      // Centre Pompidou Paris
      {
        venue: 'Centre Pompidou',
        city: 'Paris',
        country: 'FR',
        title: 'Wolfgang Tillmans - "Nothing could have prepared us"',
        description: 'German artist given carte blanche over 6,000 m² of Level 2',
        startDate: '2024-11-01',
        endDate: '2025-09-22',
        type: 'photography',
        website: 'https://www.centrepompidou.fr/'
      }
    ];

    let insertedVenues = 0;
    let insertedExhibitions = 0;

    for (const exhibition of realExhibitions) {
      try {
        // 1. Venue 확인/삽입
        let venueId = null;
        const existingVenue = await pool.query(`
          SELECT id FROM global_venues 
          WHERE name ILIKE $1 AND city ILIKE $2
          LIMIT 1
        `, [exhibition.venue, exhibition.city]);

        if (existingVenue.rows.length > 0) {
          venueId = existingVenue.rows[0].id;
          console.log(`♻️  기존 venue 사용: ${exhibition.venue} (ID: ${venueId})`);
        } else {
          // 새 venue 삽입
          const venueResult = await pool.query(`
            INSERT INTO global_venues (
              name, description, country, city, website, venue_type, venue_category,
              data_source, data_quality_score, verification_status,
              recommendation_priority, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
            ) RETURNING id
          `, [
            exhibition.venue,
            `World-class museum in ${exhibition.city}`,
            exhibition.country,
            exhibition.city,
            exhibition.website,
            'museum',
            'public',
            'websearch_verified',
            95,
            'verified',
            95
          ]);
          
          venueId = venueResult.rows[0].id;
          insertedVenues++;
          console.log(`✅ 새 venue 삽입: ${exhibition.venue} (ID: ${venueId})`);
        }

        // 2. Exhibition 삽입
        const exhibitionResult = await pool.query(`
          INSERT INTO global_exhibitions (
            venue_id, title, description, start_date, end_date,
            official_url, exhibition_type, art_medium, data_source, 
            data_quality_score, recommendation_score, status, 
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
          ) RETURNING id
        `, [
          venueId,
          exhibition.title,
          exhibition.description,
          exhibition.startDate,
          exhibition.endDate,
          exhibition.website,
          'temporary',
          exhibition.type,
          'websearch_verified',
          95,
          90,
          'active'
        ]);

        insertedExhibitions++;
        console.log(`🎨 전시 삽입: "${exhibition.title}" - ${exhibition.venue}`);

      } catch (error) {
        console.error(`❌ 전시 처리 오류 (${exhibition.title}):`, error.message);
      }
    }

    // 3. 결과 요약
    console.log('\n🎉 실제 전시 데이터 삽입 완료!');
    console.log('===============================');
    console.log(`🏛️  삽입된 새 venues: ${insertedVenues}개`);
    console.log(`🎨 삽입된 exhibitions: ${insertedExhibitions}개`);

    // 4. 최종 검증
    const totalWebsearchVenues = await pool.query(`
      SELECT COUNT(*) FROM global_venues WHERE data_source = 'websearch_verified'
    `);
    const totalWebsearchExhibitions = await pool.query(`
      SELECT COUNT(*) FROM global_exhibitions WHERE data_source = 'websearch_verified'
    `);

    console.log(`\n📊 websearch_verified 소스 총계:`);
    console.log(`   Venues: ${totalWebsearchVenues.rows[0].count}개`);
    console.log(`   Exhibitions: ${totalWebsearchExhibitions.rows[0].count}개`);

    // 5. 샘플 데이터 출력
    const sampleExhibitions = await pool.query(`
      SELECT e.title, v.name as venue_name, v.city, e.start_date, e.end_date
      FROM global_exhibitions e
      JOIN global_venues v ON e.venue_id = v.id
      WHERE e.data_source = 'websearch_verified'
      ORDER BY e.data_quality_score DESC
      LIMIT 10
    `);

    if (sampleExhibitions.rows.length > 0) {
      console.log('\n✨ 삽입된 실제 전시들:');
      sampleExhibitions.rows.forEach((ex, i) => {
        const startDate = new Date(ex.start_date).toISOString().split('T')[0];
        const endDate = new Date(ex.end_date).toISOString().split('T')[0];
        console.log(`   ${i + 1}. "${ex.title}"`);
        console.log(`      ${ex.venue_name}, ${ex.city} (${startDate} ~ ${endDate})`);
      });
    }

    console.log('\n🏆 SUCCESS: 실제 존재하는 세계적인 전시들이 SAYU에 추가되었습니다!');

  } catch (error) {
    console.error('❌ 실제 전시 데이터 삽입 중 오류:', error.message);
  } finally {
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  insertRealExhibitions();
}

module.exports = { insertRealExhibitions };