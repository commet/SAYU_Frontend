const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 주요 해외 미술관 전시 정보 (2025년 1월 기준)
const internationalExhibitions = [
  // MoMA
  {
    venue_name: 'Museum of Modern Art',
    venue_city: 'New York',
    venue_country: 'US',
    exhibitions: [
      {
        title_en: 'Ed Ruscha / Now Then',
        title_local: 'Ed Ruscha / Now Then',
        start_date: '2024-09-10',
        end_date: '2025-04-06',
        description: 'A comprehensive retrospective of Ed Ruscha spanning six decades of his groundbreaking work',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'painting', 'conceptual'],
        status: 'ongoing'
      },
      {
        title_en: 'Crafting Modernity: Design in Latin America, 1940-1980',
        title_local: 'Crafting Modernity: Design in Latin America, 1940-1980',
        start_date: '2024-03-08',
        end_date: '2025-09-22',
        description: 'First major exhibition to examine modern design in Latin America on a continental scale',
        exhibition_type: 'temporary',
        genres: ['design', 'modern'],
        status: 'ongoing'
      }
    ]
  },
  // Tate Modern
  {
    venue_name: 'Tate Modern',
    venue_city: 'London',
    venue_country: 'GB',
    exhibitions: [
      {
        title_en: 'Expressionists: Kandinsky, Münter and the Blue Rider',
        title_local: 'Expressionists: Kandinsky, Münter and the Blue Rider',
        start_date: '2024-04-25',
        end_date: '2025-10-20',
        description: 'Major exhibition exploring the revolutionary art movement Der Blaue Reiter',
        exhibition_type: 'temporary',
        genres: ['modern', 'expressionism'],
        status: 'ongoing'
      },
      {
        title_en: 'Mike Kelley: Ghost and Spirit',
        title_local: 'Mike Kelley: Ghost and Spirit',
        start_date: '2025-10-02',
        end_date: '2026-03-09',
        description: 'First major UK survey of influential American artist Mike Kelley',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'installation'],
        status: 'upcoming'
      }
    ]
  },
  // Centre Pompidou
  {
    venue_name: 'Centre Pompidou',
    venue_city: 'Paris',
    venue_country: 'FR',
    exhibitions: [
      {
        title_en: 'Surrealism',
        title_local: 'Le Surréalisme',
        start_date: '2024-09-04',
        end_date: '2025-01-13',
        description: 'Centenary exhibition celebrating 100 years of Surrealism with over 500 works',
        exhibition_type: 'temporary',
        genres: ['modern', 'surrealism'],
        status: 'ongoing'
      },
      {
        title_en: 'Pop Forever: Tom Wesselmann &',
        title_local: 'Pop Forever: Tom Wesselmann &',
        start_date: '2024-10-16',
        end_date: '2025-02-24',
        description: 'Tom Wesselmann in dialogue with contemporary artists exploring Pop Art legacy',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'pop art'],
        status: 'ongoing'
      }
    ]
  },
  // Metropolitan Museum
  {
    venue_name: 'The Metropolitan Museum of Art',
    venue_city: 'New York',
    venue_country: 'US',
    exhibitions: [
      {
        title_en: 'Siena: The Rise of Painting, 1300-1350',
        title_local: 'Siena: The Rise of Painting, 1300-1350',
        start_date: '2024-10-13',
        end_date: '2025-01-26',
        description: 'First major exhibition in the US devoted to Sienese painting',
        exhibition_type: 'temporary',
        genres: ['medieval', 'painting'],
        status: 'ongoing'
      },
      {
        title_en: 'The Harlem Renaissance and Transatlantic Modernism',
        title_local: 'The Harlem Renaissance and Transatlantic Modernism',
        start_date: '2024-02-25',
        end_date: '2025-07-28',
        description: 'Comprehensive look at the Harlem Renaissance and its global impact',
        exhibition_type: 'temporary',
        genres: ['modern', 'painting', 'sculpture'],
        status: 'ongoing'
      }
    ]
  },
  // Guggenheim
  {
    venue_name: 'Solomon R. Guggenheim Museum',
    venue_city: 'New York',
    venue_country: 'US',
    exhibitions: [
      {
        title_en: 'Orphism, 1910-1930',
        title_local: 'Orphism, 1910-1930',
        start_date: '2024-11-08',
        end_date: '2025-03-09',
        description: 'First exhibition to focus on Orphism, examining its international scope',
        exhibition_type: 'temporary',
        genres: ['modern', 'abstract'],
        status: 'ongoing'
      }
    ]
  },
  // Louvre
  {
    venue_name: 'Musée du Louvre',
    venue_city: 'Paris',
    venue_country: 'FR',
    exhibitions: [
      {
        title_en: 'Figures of the Fool',
        title_local: 'Figures du fou',
        start_date: '2024-10-16',
        end_date: '2025-02-03',
        description: 'Exploring the figure of the fool in medieval and Renaissance art',
        exhibition_type: 'temporary',
        genres: ['classical', 'medieval'],
        status: 'ongoing'
      }
    ]
  },
  // Museo Nacional del Prado
  {
    venue_name: 'Museo Nacional del Prado',
    venue_city: 'Madrid',
    venue_country: 'ES',
    exhibitions: [
      {
        title_en: 'The Lost Mirror: Jews and Conversos in Medieval Spain',
        title_local: 'El espejo perdido: judíos y conversos en la España medieval',
        start_date: '2024-12-17',
        end_date: '2025-03-16',
        description: 'Exhibition examining Jewish and converso presence in medieval Spanish art',
        exhibition_type: 'temporary',
        genres: ['medieval', 'painting'],
        status: 'ongoing'
      }
    ]
  },
  // National Gallery London
  {
    venue_name: 'National Gallery',
    venue_city: 'London',
    venue_country: 'GB',
    exhibitions: [
      {
        title_en: 'Van Gogh: Poets and Lovers',
        title_local: 'Van Gogh: Poets and Lovers',
        start_date: '2024-09-14',
        end_date: '2025-01-19',
        description: 'Major exhibition focusing on Van Gogh\'s time in Arles and Saint-Rémy',
        exhibition_type: 'temporary',
        genres: ['impressionism', 'painting'],
        status: 'ongoing'
      }
    ]
  },
  // Uffizi Gallery
  {
    venue_name: 'Galleria degli Uffizi',
    venue_city: 'Florence',
    venue_country: 'IT',
    exhibitions: [
      {
        title_en: 'Michelangelo and the Medici',
        title_local: 'Michelangelo e i Medici',
        start_date: '2025-03-15',
        end_date: '2025-07-15',
        description: 'Exhibition exploring Michelangelo\'s relationship with the Medici family',
        exhibition_type: 'temporary',
        genres: ['renaissance', 'sculpture', 'drawing'],
        status: 'upcoming'
      }
    ]
  },
  // Tokyo National Museum
  {
    venue_name: 'Tokyo National Museum',
    venue_city: 'Tokyo',
    venue_country: 'JP',
    exhibitions: [
      {
        title_en: 'The Tale of Genji and Heian Court Culture',
        title_local: '源氏物語と平安朝の文化',
        start_date: '2025-04-23',
        end_date: '2025-06-15',
        description: 'Exhibition celebrating Japanese court culture through The Tale of Genji',
        exhibition_type: 'temporary',
        genres: ['traditional', 'japanese art'],
        status: 'upcoming'
      }
    ]
  }
];

async function collectInternationalExhibitions() {
  try {
    console.log('🌍 해외 주요 미술관 전시 정보 수집 시작...\n');
    
    let totalInserted = 0;
    
    for (const venue of internationalExhibitions) {
      console.log(`\n📍 ${venue.venue_name} (${venue.venue_city}, ${venue.venue_country})`);
      
      // venue_id 찾기
      const venueResult = await pool.query(
        `SELECT id FROM venues WHERE name = $1 AND city = $2`,
        [venue.venue_name, venue.venue_city]
      );
      
      const venueId = venueResult.rows[0]?.id;
      
      for (const exhibition of venue.exhibitions) {
        try {
          // 중복 체크
          const existing = await pool.query(
            `SELECT id FROM exhibitions 
             WHERE title_en = $1 AND venue_name = $2 
             AND start_date = $3`,
            [exhibition.title_en, venue.venue_name, exhibition.start_date]
          );
          
          if (existing.rows.length > 0) {
            console.log(`  ⏭️  이미 존재: ${exhibition.title_en}`);
            continue;
          }
          
          // 새 전시 추가
          await pool.query(`
            INSERT INTO exhibitions (
              venue_id, venue_name, venue_city, venue_country,
              title_en, title_local, 
              start_date, end_date,
              description, exhibition_type, 
              genres, status,
              source, collected_at
            ) VALUES (
              $1, $2, $3, $4,
              $5, $6,
              $7, $8,
              $9, $10,
              $11, $12,
              $13, $14
            )
          `, [
            venueId, venue.venue_name, venue.venue_city, venue.venue_country,
            exhibition.title_en, exhibition.title_local,
            exhibition.start_date, exhibition.end_date,
            exhibition.description, exhibition.exhibition_type,
            exhibition.genres, exhibition.status,
            '수동 큐레이션', new Date()
          ]);
          
          console.log(`  ✅ 추가됨: ${exhibition.title_en}`);
          totalInserted++;
          
        } catch (error) {
          console.error(`  ❌ 오류: ${exhibition.title_en} - ${error.message}`);
        }
      }
    }
    
    console.log(`\n✨ 총 ${totalInserted}개의 해외 전시 정보가 추가되었습니다.`);
    
    // 현재 전체 통계
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN venue_country = 'KR' THEN 1 END) as korean,
        COUNT(CASE WHEN venue_country != 'KR' THEN 1 END) as international
      FROM exhibitions
    `);
    
    console.log(`\n📊 전체 통계:`);
    console.log(`  총 전시: ${stats.rows[0].total}개`);
    console.log(`  - 국내: ${stats.rows[0].korean}개`);
    console.log(`  - 해외: ${stats.rows[0].international}개`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

// Chicago Art Institute API로 실제 전시 정보 수집
async function collectChicagoArtExhibitions() {
  try {
    console.log('\n🎨 Chicago Art Institute 현재 전시 수집 중...');
    
    const response = await axios.get('https://api.artic.edu/api/v1/exhibitions?is_featured=true&limit=10');
    const exhibitions = response.data.data;
    
    let added = 0;
    
    for (const ex of exhibitions) {
      try {
        // 상세 정보 가져오기
        const detailResponse = await axios.get(`https://api.artic.edu/api/v1/exhibitions/${ex.id}`);
        const detail = detailResponse.data.data;
        
        // 중복 체크
        const existing = await pool.query(
          `SELECT id FROM exhibitions WHERE source_url = $1`,
          [`https://www.artic.edu/exhibitions/${ex.id}`]
        );
        
        if (existing.rows.length > 0) continue;
        
        await pool.query(`
          INSERT INTO exhibitions (
            venue_name, venue_city, venue_country,
            title_en, title_local,
            start_date, end_date,
            description, exhibition_type,
            status, source, source_url,
            collected_at
          ) VALUES (
            'Art Institute of Chicago', 'Chicago', 'US',
            $1, $1,
            $2, $3,
            $4, 'temporary',
            $5, 'Chicago Art Institute API', $6,
            NOW()
          )
        `, [
          detail.title,
          detail.aic_start_at ? new Date(detail.aic_start_at) : null,
          detail.aic_end_at ? new Date(detail.aic_end_at) : null,
          detail.short_description || detail.description || '',
          detail.status || 'ongoing',
          `https://www.artic.edu/exhibitions/${ex.id}`
        ]);
        
        console.log(`  ✅ Chicago Art Institute: ${detail.title}`);
        added++;
        
      } catch (error) {
        console.error(`  ❌ 오류: ${ex.title} - ${error.message}`);
      }
    }
    
    console.log(`  Chicago Art Institute에서 ${added}개 전시 추가`);
    
  } catch (error) {
    console.error('Chicago API 오류:', error.message);
  }
}

// 메인 실행
async function main() {
  await collectInternationalExhibitions();
  await collectChicagoArtExhibitions();
  process.exit(0);
}

main();