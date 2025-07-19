const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 2025년 주요 비엔날레 및 특별전
const specialExhibitions = [
  // 베니스 비엔날레
  {
    venue_name: 'Venice Biennale',
    venue_city: 'Venice',
    venue_country: 'IT',
    exhibitions: [
      {
        title_en: '60th International Art Exhibition - Foreigners Everywhere',
        title_local: '60a Esposizione Internazionale d\'Arte - Stranieri Ovunque',
        start_date: '2025-04-26',
        end_date: '2025-11-23',
        description: 'The 60th Venice Biennale curated by Adriano Pedrosa, exploring themes of migration, identity, and belonging',
        exhibition_type: 'biennale',
        genres: ['contemporary', 'international'],
        status: 'upcoming'
      }
    ]
  },
  // 이스탄불 비엔날레
  {
    venue_name: 'Istanbul Modern',
    venue_city: 'Istanbul',
    venue_country: 'TR',
    exhibitions: [
      {
        title_en: '18th Istanbul Biennial',
        title_local: '18. İstanbul Bienali',
        start_date: '2025-09-14',
        end_date: '2025-11-17',
        description: 'Major international contemporary art exhibition in Istanbul',
        exhibition_type: 'biennale',
        genres: ['contemporary', 'international'],
        status: 'upcoming'
      }
    ]
  },
  // 요코하마 트리엔날레
  {
    venue_name: 'Yokohama Museum of Art',
    venue_city: 'Yokohama',
    venue_country: 'JP',
    exhibitions: [
      {
        title_en: '8th Yokohama Triennale 2025',
        title_local: '第8回横浜トリエンナーレ2025',
        start_date: '2025-07-18',
        end_date: '2025-10-11',
        description: 'International contemporary art exhibition held every three years in Yokohama',
        exhibition_type: 'triennale',
        genres: ['contemporary', 'international'],
        status: 'upcoming'
      }
    ]
  },
  // 카셀 도큐멘타 준비전
  {
    venue_name: 'Museum Fridericianum',
    venue_city: 'Kassel',
    venue_country: 'DE',
    exhibitions: [
      {
        title_en: 'documenta 16 Preview Exhibition',
        title_local: 'documenta 16 Vorschau',
        start_date: '2025-06-01',
        end_date: '2025-08-31',
        description: 'Preview exhibition for documenta 16 scheduled for 2027',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'international'],
        status: 'upcoming'
      }
    ]
  },
  // 싱가포르 비엔날레
  {
    venue_name: 'Singapore Art Museum',
    venue_city: 'Singapore',
    venue_country: 'SG',
    exhibitions: [
      {
        title_en: 'Singapore Biennale 2025: Suddenly Turning Visible',
        title_local: 'Singapore Biennale 2025: Suddenly Turning Visible',
        start_date: '2025-10-15',
        end_date: '2026-02-15',
        description: 'Southeast Asia\'s leading contemporary art biennale',
        exhibition_type: 'biennale',
        genres: ['contemporary', 'international', 'southeast asian'],
        status: 'upcoming'
      }
    ]
  },
  // 특별 순회전
  {
    venue_name: 'Fondation Louis Vuitton',
    venue_city: 'Paris',
    venue_country: 'FR',
    exhibitions: [
      {
        title_en: 'The Morozov Collection: Icons of Modern Art',
        title_local: 'La Collection Morozov: Icônes de l\'art moderne',
        start_date: '2025-02-22',
        end_date: '2025-07-25',
        description: 'Exceptional collection of French and Russian modern masterpieces',
        exhibition_type: 'temporary',
        genres: ['modern', 'impressionism', 'post-impressionism'],
        status: 'upcoming'
      }
    ]
  },
  // 국내 특별전
  {
    venue_name: '예술의전당',
    venue_city: '서울',
    venue_country: 'KR',
    exhibitions: [
      {
        title_en: 'Monet to Picasso: Masterpieces from the Albertina',
        title_local: '모네에서 피카소까지: 알베르티나 미술관 특별전',
        start_date: '2025-05-01',
        end_date: '2025-08-31',
        description: '오스트리아 알베르티나 미술관 소장품 특별전',
        exhibition_type: 'temporary',
        genres: ['modern', 'impressionism'],
        status: 'upcoming'
      }
    ]
  },
  {
    venue_name: '국립중앙박물관',
    venue_city: '서울',
    venue_country: 'KR',
    exhibitions: [
      {
        title_en: 'Great Goryeo: A Glorious Dynasty',
        title_local: '대고려전: 찬란한 도자 문명',
        start_date: '2025-03-18',
        end_date: '2025-06-15',
        description: '고려 건국 1107주년 기념 특별전',
        exhibition_type: 'temporary',
        genres: ['traditional', 'ceramic', 'korean art'],
        status: 'upcoming'
      }
    ]
  },
  // 아트페어
  {
    venue_name: 'COEX',
    venue_city: '서울',
    venue_country: 'KR',
    exhibitions: [
      {
        title_en: 'KIAF SEOUL 2025',
        title_local: '키아프 서울 2025',
        start_date: '2025-09-04',
        end_date: '2025-09-08',
        description: '한국 최대 규모의 국제 아트페어',
        exhibition_type: 'art fair',
        genres: ['contemporary', 'international'],
        status: 'upcoming'
      },
      {
        title_en: 'Frieze Seoul 2025',
        title_local: '프리즈 서울 2025',
        start_date: '2025-09-03',
        end_date: '2025-09-07',
        description: '국제적인 현대미술 아트페어 프리즈의 서울 에디션',
        exhibition_type: 'art fair',
        genres: ['contemporary', 'international'],
        status: 'upcoming'
      }
    ]
  },
  // 디지털 아트 특별전
  {
    venue_name: '동대문디자인플라자',
    venue_city: '서울',
    venue_country: 'KR',
    exhibitions: [
      {
        title_en: 'Future Vision: AI and Digital Art',
        title_local: '미래의 시선: AI와 디지털 아트',
        start_date: '2025-04-10',
        end_date: '2025-07-20',
        description: 'AI와 디지털 기술을 활용한 미디어 아트 특별전',
        exhibition_type: 'temporary',
        genres: ['new media', 'digital art', 'ai art'],
        status: 'upcoming'
      }
    ]
  }
];

async function collectSpecialExhibitions() {
  try {
    console.log('🌟 비엔날레 및 특별전 정보 수집 시작...\n');
    
    let totalInserted = 0;
    let biennaleCount = 0;
    let artFairCount = 0;
    let specialCount = 0;
    
    for (const venue of specialExhibitions) {
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
             WHERE title_local = $1 AND venue_name = $2 
             AND start_date = $3`,
            [exhibition.title_local, venue.venue_name, exhibition.start_date]
          );
          
          if (existing.rows.length > 0) {
            console.log(`  ⏭️  이미 존재: ${exhibition.title_local}`);
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
            '특별전 큐레이션', new Date()
          ]);
          
          console.log(`  ✅ 추가됨: ${exhibition.title_local}`);
          totalInserted++;
          
          // 타입별 카운트
          if (exhibition.exhibition_type.includes('biennale') || exhibition.exhibition_type.includes('triennale')) {
            biennaleCount++;
          } else if (exhibition.exhibition_type === 'art fair') {
            artFairCount++;
          } else {
            specialCount++;
          }
          
        } catch (error) {
          console.error(`  ❌ 오류: ${exhibition.title_local} - ${error.message}`);
        }
      }
    }
    
    console.log(`\n✨ 총 ${totalInserted}개의 특별 전시 정보가 추가되었습니다.`);
    console.log(`  - 비엔날레/트리엔날레: ${biennaleCount}개`);
    console.log(`  - 아트페어: ${artFairCount}개`);
    console.log(`  - 특별전: ${specialCount}개`);
    
    // 최종 통계
    const finalStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN venue_country = 'KR' THEN 1 END) as korean,
        COUNT(CASE WHEN venue_country != 'KR' THEN 1 END) as international,
        COUNT(DISTINCT venue_name) as unique_venues,
        COUNT(DISTINCT venue_city) as unique_cities
      FROM exhibitions
    `);
    
    console.log(`\n📊 최종 전시 데이터베이스 현황:`);
    console.log(`  총 전시: ${finalStats.rows[0].total}개`);
    console.log(`  - 국내: ${finalStats.rows[0].korean}개`);
    console.log(`  - 해외: ${finalStats.rows[0].international}개`);
    console.log(`  참여 기관: ${finalStats.rows[0].unique_venues}개`);
    console.log(`  도시: ${finalStats.rows[0].unique_cities}개`);
    
    // 전시 타입별 통계
    const typeStats = await pool.query(`
      SELECT exhibition_type, COUNT(*) as count
      FROM exhibitions
      WHERE exhibition_type IS NOT NULL
      GROUP BY exhibition_type
      ORDER BY count DESC
    `);
    
    console.log(`\n🎨 전시 유형별 현황:`);
    typeStats.rows.forEach(stat => {
      console.log(`  ${stat.exhibition_type}: ${stat.count}개`);
    });
    
    // 장르별 통계
    const genreStats = await pool.query(`
      SELECT genre, COUNT(*) as count
      FROM (
        SELECT unnest(genres) as genre
        FROM exhibitions
        WHERE genres IS NOT NULL
      ) g
      GROUP BY genre
      ORDER BY count DESC
      LIMIT 10
    `);
    
    console.log(`\n🎭 인기 장르 TOP 10:`);
    genreStats.rows.forEach((stat, i) => {
      console.log(`  ${i+1}. ${stat.genre}: ${stat.count}개`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

collectSpecialExhibitions();