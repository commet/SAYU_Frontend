const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('../src/config/database');
const { log } = require('../src/config/logger');

// 한국 주요 미술관 전시 정보
const exhibitions = [
  {
    institution: '국립현대미술관',
    institution_en: 'National Museum of Modern and Contemporary Art',
    city: 'Seoul',
    title_ko: '한국 추상미술의 선구자들',
    title_en: 'Pioneers of Korean Abstract Art',
    start_date: '2025-01-15',
    end_date: '2025-04-30',
    description: '한국 추상미술의 역사와 발전을 조명하는 대규모 회고전',
    artists: ['김환기', '유영국', '이우환'],
    ticket_price: 4000
  },
  {
    institution: '국립현대미술관',
    institution_en: 'National Museum of Modern and Contemporary Art',
    city: 'Seoul',
    title_ko: '미디어 아트의 현재',
    title_en: 'Media Art Now',
    start_date: '2025-02-01',
    end_date: '2025-05-31',
    description: '국내외 미디어 아트 작가들의 최신 작품을 소개',
    artists: ['팀랩', '양민하', '김희천'],
    ticket_price: 10000
  },
  {
    institution: '리움미술관',
    institution_en: 'Leeum Museum of Art',
    city: 'Seoul',
    title_ko: '조선시대 백자의 미',
    title_en: 'Beauty of Joseon White Porcelain',
    start_date: '2025-01-20',
    end_date: '2025-06-20',
    description: '조선시대 백자의 아름다움과 현대적 해석',
    ticket_price: 15000
  },
  {
    institution: '서울시립미술관',
    institution_en: 'Seoul Museum of Art',
    city: 'Seoul',
    title_ko: '서울, 도시의 초상',
    title_en: 'Seoul: Portrait of a City',
    start_date: '2025-01-10',
    end_date: '2025-03-31',
    description: '서울의 변화를 기록한 사진전',
    ticket_price: 0
  },
  {
    institution: 'The Metropolitan Museum of Art',
    institution_en: 'The Metropolitan Museum of Art',
    city: 'New York',
    title_en: 'Manet/Degas',
    start_date: '2025-01-15',
    end_date: '2025-05-05',
    description: 'A landmark exhibition examining the fascinating relationship between Édouard Manet and Edgar Degas',
    artists: ['Édouard Manet', 'Edgar Degas'],
    ticket_price: 30
  },
  {
    institution: 'MoMA',
    institution_en: 'Museum of Modern Art',
    city: 'New York',
    title_en: 'Contemporary Korean Art',
    start_date: '2025-02-01',
    end_date: '2025-06-15',
    description: 'A comprehensive survey of contemporary Korean art',
    artists: ['Lee Bul', 'Haegue Yang', 'Kimsooja'],
    ticket_price: 25
  }
];

async function importExhibitions() {
  try {
    let institutionsCreated = 0;
    let exhibitionsCreated = 0;
    let errors = 0;

    // 각 전시를 개별적으로 처리
    for (const exhibition of exhibitions) {
      try {
        // 1. 기관 확인/생성
        let institutionId;
        const instResult = await pool.query(
          'SELECT id FROM institutions WHERE name_en = $1',
          [exhibition.institution_en]
        );

        if (instResult.rows.length > 0) {
          institutionId = instResult.rows[0].id;
        } else {
          const newInst = await pool.query(
            `INSERT INTO institutions (
              name_local, name_en, city, country, type
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
            RETURNING id`,
            [
              exhibition.institution,
              exhibition.institution_en,
              exhibition.city,
              exhibition.city === 'Seoul' ? 'South Korea' : 'USA',
              'museum'
            ]
          );

          if (newInst.rows.length > 0) {
            institutionId = newInst.rows[0].id;
            institutionsCreated++;
          } else {
            // 이미 존재하는 경우 다시 조회
            const recheck = await pool.query(
              'SELECT id FROM institutions WHERE name_en = $1',
              [exhibition.institution_en]
            );
            institutionId = recheck.rows[0].id;
          }
        }

        // 2. 전시 정보 삽입
        const status = new Date(exhibition.start_date) > new Date() ? 'upcoming' :
                      new Date(exhibition.end_date) < new Date() ? 'past' : 'current';

        await pool.query(
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
            exhibition.title_ko || null,
            exhibition.title_en,
            exhibition.start_date,
            exhibition.end_date,
            status,
            exhibition.description,
            exhibition.artists || null,
            exhibition.ticket_price,
            'temporary',
            exhibition.title_ko ? ['한국미술', '현대미술'] : ['International', 'Contemporary']
          ]
        );

        exhibitionsCreated++;
        log.info(`Added exhibition: ${exhibition.title_en || exhibition.title_ko}`);

      } catch (err) {
        errors++;
        log.error(`Error processing exhibition: ${err.message}`);
      }
    }

    // 통계 출력
    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT e.id) as total_exhibitions,
        COUNT(DISTINCT e.institution_id) as total_institutions,
        COUNT(CASE WHEN e.status = 'current' THEN 1 END) as current_exhibitions,
        COUNT(CASE WHEN e.status = 'upcoming' THEN 1 END) as upcoming_exhibitions
      FROM exhibitions e
    `);

    log.info(`Import complete: ${institutionsCreated} institutions created, ${exhibitionsCreated} exhibitions processed, ${errors} errors`);
    log.info('Current stats:', stats.rows[0]);

  } catch (error) {
    log.error('Import failed:', error);
  } finally {
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  importExhibitions();
}
