const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 국내외 갤러리 전시 정보 (2025년 1월 기준)
const galleryExhibitions = [
  // 국내 갤러리
  {
    venue_name: '페이스갤러리',
    venue_city: '서울',
    venue_country: 'KR',
    exhibitions: [
      {
        title_en: 'Kohei Nawa: Foam',
        title_local: '나와 코헤이: 폼',
        start_date: '2024-12-13',
        end_date: '2025-02-08',
        description: '일본 현대미술가 나와 코헤이의 개인전. 비누거품을 모티브로 한 조각 작품들',
        exhibition_type: 'solo',
        genres: ['contemporary', 'sculpture'],
        status: 'ongoing'
      }
    ]
  },
  {
    venue_name: '갤러리현대',
    venue_city: '서울',
    venue_country: 'KR',
    exhibitions: [
      {
        title_en: 'Lee Bae: Black Mapping',
        title_local: '이배: 검은 지도',
        start_date: '2025-01-09',
        end_date: '2025-02-23',
        description: '숯을 주재료로 작업하는 이배 작가의 신작전',
        exhibition_type: 'solo',
        genres: ['contemporary', 'painting'],
        status: 'ongoing'
      }
    ]
  },
  {
    venue_name: '국제갤러리',
    venue_city: '서울',
    venue_country: 'KR',
    exhibitions: [
      {
        title_en: 'Haegue Yang: Mesmerizing Mesh',
        title_local: '양혜규: 메스머라이징 메쉬',
        start_date: '2024-12-05',
        end_date: '2025-01-25',
        description: '양혜규의 블라인드 연작과 신작 조각 설치',
        exhibition_type: 'solo',
        genres: ['contemporary', 'installation'],
        status: 'ongoing'
      }
    ]
  },
  {
    venue_name: 'PKM갤러리',
    venue_city: '서울',
    venue_country: 'KR',
    exhibitions: [
      {
        title_en: 'Chung Sang-hwa: Untitled',
        title_local: '정상화: 무제',
        start_date: '2025-01-15',
        end_date: '2025-03-01',
        description: '단색화 거장 정상화의 신작전',
        exhibition_type: 'solo',
        genres: ['contemporary', 'abstract'],
        status: 'ongoing'
      }
    ]
  },
  {
    venue_name: '아라리오갤러리',
    venue_city: '서울',
    venue_country: 'KR',
    exhibitions: [
      {
        title_en: 'Subodh Gupta: Cooking the World',
        title_local: '수보드 굽타: 세계를 요리하다',
        start_date: '2024-11-28',
        end_date: '2025-01-18',
        description: '인도 현대미술가 수보드 굽타의 주방용품을 활용한 설치 작품전',
        exhibition_type: 'solo',
        genres: ['contemporary', 'installation'],
        status: 'ongoing'
      }
    ]
  },
  // 해외 갤러리
  {
    venue_name: 'Gagosian Gallery',
    venue_city: 'New York',
    venue_country: 'US',
    exhibitions: [
      {
        title_en: 'Georg Baselitz: The Painter in His Bed',
        title_local: 'Georg Baselitz: The Painter in His Bed',
        start_date: '2024-11-07',
        end_date: '2025-01-18',
        description: 'Georg Baselitz new paintings exploring themes of mortality and artistic legacy',
        exhibition_type: 'solo',
        genres: ['contemporary', 'painting'],
        status: 'ongoing'
      }
    ]
  },
  {
    venue_name: 'David Zwirner',
    venue_city: 'New York',
    venue_country: 'US',
    exhibitions: [
      {
        title_en: 'Yayoi Kusama: I Spend Each Day Embracing Flowers',
        title_local: 'Yayoi Kusama: I Spend Each Day Embracing Flowers',
        start_date: '2024-11-09',
        end_date: '2025-01-18',
        description: 'New paintings and sculptures by Yayoi Kusama',
        exhibition_type: 'solo',
        genres: ['contemporary', 'painting', 'sculpture'],
        status: 'ongoing'
      }
    ]
  },
  {
    venue_name: 'Hauser & Wirth',
    venue_city: 'London',
    venue_country: 'GB',
    exhibitions: [
      {
        title_en: 'Philip Guston: Resilience',
        title_local: 'Philip Guston: Resilience',
        start_date: '2024-10-10',
        end_date: '2025-02-01',
        description: 'Major exhibition of Philip Guston late paintings',
        exhibition_type: 'solo',
        genres: ['contemporary', 'painting'],
        status: 'ongoing'
      }
    ]
  },
  {
    venue_name: 'White Cube',
    venue_city: 'London',
    venue_country: 'GB',
    exhibitions: [
      {
        title_en: 'Antony Gormley: Body Politic',
        title_local: 'Antony Gormley: Body Politic',
        start_date: '2024-11-27',
        end_date: '2025-01-25',
        description: 'New sculptures exploring the human form in space',
        exhibition_type: 'solo',
        genres: ['contemporary', 'sculpture'],
        status: 'ongoing'
      }
    ]
  },
  {
    venue_name: 'Perrotin',
    venue_city: 'Paris',
    venue_country: 'FR',
    exhibitions: [
      {
        title_en: 'KAWS: Ups and Downs',
        title_local: 'KAWS: Ups and Downs',
        start_date: '2024-10-12',
        end_date: '2025-01-11',
        description: 'New paintings and sculptures by KAWS',
        exhibition_type: 'solo',
        genres: ['contemporary', 'street art'],
        status: 'ongoing'
      }
    ]
  },
  // 아시아 갤러리
  {
    venue_name: 'Kaikai Kiki Gallery',
    venue_city: 'Tokyo',
    venue_country: 'JP',
    exhibitions: [
      {
        title_en: 'Takashi Murakami: Cherry Blossoms and Skulls',
        title_local: '村上隆: 桜と髑髏',
        start_date: '2025-01-20',
        end_date: '2025-03-30',
        description: 'New works exploring life and death through cherry blossoms and skulls',
        exhibition_type: 'solo',
        genres: ['contemporary', 'pop art'],
        status: 'upcoming'
      }
    ]
  },
  {
    venue_name: 'ShanghART Gallery',
    venue_city: 'Shanghai',
    venue_country: 'CN',
    exhibitions: [
      {
        title_en: 'Zeng Fanzhi: Near and Far',
        title_local: '曾梵志: 远与近',
        start_date: '2024-11-16',
        end_date: '2025-01-31',
        description: 'Recent works by leading Chinese contemporary artist Zeng Fanzhi',
        exhibition_type: 'solo',
        genres: ['contemporary', 'painting'],
        status: 'ongoing'
      }
    ]
  }
];

async function collectGalleryExhibitions() {
  try {
    console.log('🖼️  갤러리 전시 정보 수집 시작...\n');
    
    let totalInserted = 0;
    let koreanInserted = 0;
    let internationalInserted = 0;
    
    for (const venue of galleryExhibitions) {
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
            '갤러리 큐레이션', new Date()
          ]);
          
          console.log(`  ✅ 추가됨: ${exhibition.title_local}`);
          totalInserted++;
          
          if (venue.venue_country === 'KR') {
            koreanInserted++;
          } else {
            internationalInserted++;
          }
          
        } catch (error) {
          console.error(`  ❌ 오류: ${exhibition.title_local} - ${error.message}`);
        }
      }
    }
    
    console.log(`\n✨ 총 ${totalInserted}개의 갤러리 전시 정보가 추가되었습니다.`);
    console.log(`  - 국내 갤러리: ${koreanInserted}개`);
    console.log(`  - 해외 갤러리: ${internationalInserted}개`);
    
    // 현재 전체 통계
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN venue_country = 'KR' THEN 1 END) as korean,
        COUNT(CASE WHEN venue_country != 'KR' THEN 1 END) as international,
        COUNT(DISTINCT venue_name) as unique_venues
      FROM exhibitions
    `);
    
    console.log(`\n📊 전체 전시 데이터 현황:`);
    console.log(`  총 전시: ${stats.rows[0].total}개`);
    console.log(`  - 국내: ${stats.rows[0].korean}개`);
    console.log(`  - 해외: ${stats.rows[0].international}개`);
    console.log(`  참여 기관: ${stats.rows[0].unique_venues}개`);
    
    // 상태별 통계
    const statusStats = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM exhibitions
      GROUP BY status
      ORDER BY count DESC
    `);
    
    console.log(`\n📅 전시 상태별 현황:`);
    statusStats.rows.forEach(stat => {
      console.log(`  ${stat.status}: ${stat.count}개`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

collectGalleryExhibitions();