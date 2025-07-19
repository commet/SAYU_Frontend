const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 주요 국내 미술관 전시 정보 (2025년 1월 기준)
const koreanExhibitions = [
  // 국립현대미술관
  {
    venue_name: '국립현대미술관 서울',
    venue_city: '서울',
    exhibitions: [
      {
        title_en: 'MMCA Hyundai Motor Series 2024: Yang Haegue',
        title_local: 'MMCA 현대차 시리즈 2024: 양혜규',
        start_date: '2024-10-23',
        end_date: '2025-02-23',
        description: '양혜규 작가의 대규모 개인전으로, 빛과 움직임을 활용한 신작 설치 작품들을 선보입니다.',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'installation'],
        status: 'ongoing'
      },
      {
        title_en: 'Only the Young: Experimental Art in Korea, 1960s-1970s',
        title_local: '젊은 모색: 한국 실험미술 1960-1970년대',
        start_date: '2024-11-15',
        end_date: '2025-03-16',
        description: '1960-70년대 한국 실험미술의 역사를 재조명하는 아카이브 전시',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'experimental'],
        status: 'ongoing'
      }
    ]
  },
  // 서울시립미술관
  {
    venue_name: '서울시립미술관',
    venue_city: '서울',
    exhibitions: [
      {
        title_en: 'David Hockney: My Window',
        title_local: '데이비드 호크니: 나의 창',
        start_date: '2024-12-20',
        end_date: '2025-03-23',
        description: '데이비드 호크니가 팬데믹 기간 동안 노르망디에서 그린 풍경화 시리즈',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'painting'],
        status: 'ongoing'
      },
      {
        title_en: 'Seoul Photo 2025',
        title_local: '서울사진축제 2025',
        start_date: '2025-03-15',
        end_date: '2025-05-18',
        description: '국내외 현대 사진작가들의 작품을 소개하는 연례 사진축제',
        exhibition_type: 'temporary',
        genres: ['photography', 'contemporary'],
        status: 'upcoming'
      }
    ]
  },
  // 리움미술관
  {
    venue_name: '리움미술관',
    venue_city: '서울',
    exhibitions: [
      {
        title_en: 'Beyond the Scene',
        title_local: '장면 너머',
        start_date: '2024-09-26',
        end_date: '2025-01-26',
        description: '한국 현대미술의 새로운 경향을 보여주는 그룹전',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'mixed media'],
        status: 'ongoing'
      },
      {
        title_en: 'Lee Ufan: Dialogue',
        title_local: '이우환: 대화',
        start_date: '2025-02-20',
        end_date: '2025-06-15',
        description: '이우환 작가의 최근 10년간의 작품 세계를 조망하는 대규모 회고전',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'minimalism'],
        status: 'upcoming'
      }
    ]
  },
  // 아모레퍼시픽미술관
  {
    venue_name: '아모레퍼시픽미술관',
    venue_city: '서울',
    exhibitions: [
      {
        title_en: 'Rafael Lozano-Hemmer: Unstable Presence',
        title_local: '라파엘 로자노-헤머: 불안정한 존재',
        start_date: '2024-11-01',
        end_date: '2025-02-16',
        description: '관객 참여형 미디어 아트의 선구자 라파엘 로자노-헤머의 아시아 첫 대규모 개인전',
        exhibition_type: 'temporary',
        genres: ['new media', 'interactive'],
        status: 'ongoing'
      }
    ]
  },
  // 대림미술관
  {
    venue_name: '대림미술관',
    venue_city: '서울',
    exhibitions: [
      {
        title_en: 'Yayoi Kusama: A Dream I Dreamed',
        title_local: '쿠사마 야요이: 꿈꾸었던 꿈',
        start_date: '2024-12-14',
        end_date: '2025-04-27',
        description: '쿠사마 야요이의 대표작들과 국내 첫 공개 신작을 포함한 대규모 전시',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'installation'],
        status: 'ongoing'
      }
    ]
  },
  // 부산시립미술관
  {
    venue_name: '부산시립미술관',
    venue_city: '부산',
    exhibitions: [
      {
        title_en: 'Busan Biennale 2025: Seeing in the Dark',
        title_local: '부산비엔날레 2025: 어둠 속에서 보기',
        start_date: '2025-05-03',
        end_date: '2025-09-21',
        description: '제12회 부산비엔날레. 불확실한 시대의 예술적 비전을 탐구',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'international'],
        status: 'upcoming'
      }
    ]
  },
  // 대구미술관
  {
    venue_name: '대구미술관',
    venue_city: '대구',
    exhibitions: [
      {
        title_en: 'The Power of Color: Korean Contemporary Art',
        title_local: '색의 힘: 한국 현대미술',
        start_date: '2025-01-15',
        end_date: '2025-04-20',
        description: '색채를 중심으로 한국 현대미술의 흐름을 살펴보는 주제전',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'painting'],
        status: 'ongoing'
      }
    ]
  },
  // 광주시립미술관
  {
    venue_name: '광주시립미술관',
    venue_city: '광주',
    exhibitions: [
      {
        title_en: 'Gwangju Biennale 2025: Pansori, a soundscape of the 21st century',
        title_local: '광주비엔날레 2025: 판소리, 21세기 소리풍경',
        start_date: '2025-09-05',
        end_date: '2025-11-30',
        description: '제15회 광주비엔날레. 전통과 현대, 로컬과 글로벌의 소리를 탐구',
        exhibition_type: 'temporary',
        genres: ['contemporary', 'international', 'sound art'],
        status: 'upcoming'
      }
    ]
  }
];

async function insertExhibitions() {
  try {
    console.log('🎨 국내 주요 미술관 전시 정보 수집 시작...\n');
    
    let totalInserted = 0;
    
    for (const venue of koreanExhibitions) {
      console.log(`\n📍 ${venue.venue_name} (${venue.venue_city})`);
      
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
            venueId, venue.venue_name, venue.venue_city, 'KR',
            exhibition.title_en, exhibition.title_local,
            exhibition.start_date, exhibition.end_date,
            exhibition.description, exhibition.exhibition_type,
            exhibition.genres, exhibition.status,
            '수동 큐레이션', new Date()
          ]);
          
          console.log(`  ✅ 추가됨: ${exhibition.title_local}`);
          totalInserted++;
          
        } catch (error) {
          console.error(`  ❌ 오류: ${exhibition.title_local} - ${error.message}`);
        }
      }
    }
    
    console.log(`\n✨ 총 ${totalInserted}개의 전시 정보가 추가되었습니다.`);
    
    // 현재 전체 통계
    const stats = await pool.query(`
      SELECT COUNT(*) as total FROM exhibitions
    `);
    
    console.log(`📊 전체 전시 수: ${stats.rows[0].total}개`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

insertExhibitions();