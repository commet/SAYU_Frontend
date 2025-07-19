const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('../src/config/database');
const { log } = require('../src/config/logger');

// 한국 주요 미술관 전시 정보 (예시 데이터)
const koreanMuseumExhibitions = [
  {
    institution: '국립현대미술관',
    institution_en: 'National Museum of Modern and Contemporary Art',
    city: 'Seoul',
    exhibitions: [
      {
        title_ko: '한국 추상미술의 선구자들',
        title_en: 'Pioneers of Korean Abstract Art',
        start_date: '2025-01-15',
        end_date: '2025-04-30',
        description: '한국 추상미술의 역사와 발전을 조명하는 대규모 회고전',
        artists: ['김환기', '유영국', '이우환'],
        ticket_price: 4000
      },
      {
        title_ko: '미디어 아트의 현재',
        title_en: 'Media Art Now',
        start_date: '2025-02-01',
        end_date: '2025-05-31',
        description: '국내외 미디어 아트 작가들의 최신 작품을 소개',
        artists: ['팀랩', '양민하', '김희천'],
        ticket_price: 10000
      }
    ]
  },
  {
    institution: '리움미술관',
    institution_en: 'Leeum Museum of Art',
    city: 'Seoul',
    exhibitions: [
      {
        title_ko: '조선시대 백자의 미',
        title_en: 'Beauty of Joseon White Porcelain',
        start_date: '2025-01-20',
        end_date: '2025-06-20',
        description: '조선시대 백자의 아름다움과 현대적 해석',
        ticket_price: 15000
      }
    ]
  },
  {
    institution: '서울시립미술관',
    institution_en: 'Seoul Museum of Art',
    city: 'Seoul',
    exhibitions: [
      {
        title_ko: '서울, 도시의 초상',
        title_en: 'Seoul: Portrait of a City',
        start_date: '2025-01-10',
        end_date: '2025-03-31',
        description: '서울의 변화를 기록한 사진전',
        ticket_price: 0
      }
    ]
  }
];

// 해외 미술관 전시 정보 (Met Museum API 사용)
async function fetchMetExhibitions() {
  try {
    // Met Museum은 현재 전시 API를 제공하지 않으므로 예시 데이터 사용
    return [
      {
        institution: 'The Metropolitan Museum of Art',
        city: 'New York',
        exhibitions: [
          {
            title_en: 'Manet/Degas',
            start_date: '2025-01-15',
            end_date: '2025-05-05',
            description: 'A landmark exhibition examining the fascinating relationship between Édouard Manet and Edgar Degas',
            artists: ['Édouard Manet', 'Edgar Degas'],
            official_url: 'https://www.metmuseum.org/exhibitions/manet-degas'
          },
          {
            title_en: 'The Harlem Renaissance and Transatlantic Modernism',
            start_date: '2025-02-25',
            end_date: '2025-07-28',
            description: 'First major museum survey of the Harlem Renaissance in a generation',
            official_url: 'https://www.metmuseum.org/exhibitions/harlem-renaissance'
          }
        ]
      }
    ];
  } catch (error) {
    log.error('Error fetching Met exhibitions:', error);
    return [];
  }
}

async function importExhibitions() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 기관 정보 먼저 확인/삽입
    const institutionMap = new Map();
    
    // 한국 미술관 처리
    for (const museum of koreanMuseumExhibitions) {
      let institutionId;
      
      // 기관 조회
      const instResult = await client.query(
        'SELECT id FROM institutions WHERE name_local = $1 OR name_en = $2',
        [museum.institution, museum.institution_en]
      );
      
      if (instResult.rows.length > 0) {
        institutionId = instResult.rows[0].id;
      } else {
        // 기관 생성
        const newInst = await client.query(
          `INSERT INTO institutions (
            name_local, name_en, city, country, type
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id`,
          [
            museum.institution,
            museum.institution_en,
            museum.city,
            'South Korea',
            'museum'
          ]
        );
        institutionId = newInst.rows[0].id;
      }
      
      institutionMap.set(museum.institution, institutionId);
      
      // 전시 정보 삽입
      for (const exhibition of museum.exhibitions) {
        try {
          await client.query(
            `INSERT INTO exhibitions (
              institution_id,
              title_local,
              title_en,
              start_date,
              end_date,
              status,
              description,
              artists,
              ticket_price,
              exhibition_type,
              tags
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT DO NOTHING`,
            [
              institutionId,
              exhibition.title_ko,
              exhibition.title_en,
              exhibition.start_date,
              exhibition.end_date,
              new Date(exhibition.start_date) > new Date() ? 'upcoming' : 'current',
              exhibition.description,
              exhibition.artists ? JSON.stringify(exhibition.artists) : null,
              exhibition.ticket_price,
              'temporary',
              JSON.stringify(['한국미술', '현대미술'])
            ]
          );
        } catch (err) {
          log.error(`Error inserting exhibition: ${exhibition.title_ko}`, err.message);
        }
      }
    }
    
    // 해외 미술관 처리
    const metExhibitions = await fetchMetExhibitions();
    for (const museum of metExhibitions) {
      let institutionId;
      
      // Met Museum 기관 조회/생성
      const instResult = await client.query(
        'SELECT id FROM institutions WHERE name_en = $1',
        [museum.institution]
      );
      
      if (instResult.rows.length > 0) {
        institutionId = instResult.rows[0].id;
      } else {
        const newInst = await client.query(
          `INSERT INTO institutions (
            name_en, city, country, type
          ) VALUES ($1, $2, $3, $4)
          RETURNING id`,
          [museum.institution, museum.city, 'USA', 'museum']
        );
        institutionId = newInst.rows[0].id;
      }
      
      // 전시 삽입
      for (const exhibition of museum.exhibitions) {
        try {
          await client.query(
            `INSERT INTO exhibitions (
              institution_id,
              title_en,
              start_date,
              end_date,
              status,
              description,
              artists,
              official_url,
              exhibition_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT DO NOTHING`,
            [
              institutionId,
              exhibition.title_en,
              exhibition.start_date,
              exhibition.end_date,
              new Date(exhibition.start_date) > new Date() ? 'upcoming' : 'current',
              exhibition.description,
              exhibition.artists ? JSON.stringify(exhibition.artists) : null,
              exhibition.official_url,
              'temporary'
            ]
          );
        } catch (err) {
          log.error(`Error inserting exhibition: ${exhibition.title_en}`, err.message);
        }
      }
    }
    
    await client.query('COMMIT');
    
    // 통계 출력
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_exhibitions,
        COUNT(DISTINCT institution_id) as total_institutions,
        COUNT(CASE WHEN status = 'current' THEN 1 END) as current_exhibitions,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming_exhibitions
      FROM exhibitions
    `);
    
    log.info('Exhibition import complete:', stats.rows[0]);
    
  } catch (error) {
    await client.query('ROLLBACK');
    log.error('Import failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  importExhibitions();
}