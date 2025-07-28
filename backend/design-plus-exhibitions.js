#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Design+ 매거진에서 확인된 실제 2025년 전시 정보
const DESIGN_PLUS_EXHIBITIONS = [
  {
    title_local: '피에르 위그 개인전',
    title_en: 'Pierre Huyghe',
    venue_name: '리움미술관',
    venue_city: '서울',
    start_date: '2025-02-27',
    end_date: '2025-07-06',
    description: '프랑스 현대미술가 피에르 위그의 국내 첫 개인전. 인공지능과 생명체를 활용한 설치작품.',
    artists: ['피에르 위그'],
    exhibition_type: 'solo',
    source: 'design_plus_verified',
    source_url: 'https://design.co.kr/article/105122'
  },

  {
    title_local: '강명희 개인전',
    title_en: 'Kang Myoung-Hee Solo Exhibition',
    venue_name: '서울시립미술관',
    venue_city: '서울',
    start_date: '2025-03-04',
    end_date: '2025-06-08',
    description: '서울시립미술관 서소문본관에서 열리는 강명희 작가의 개인전.',
    artists: ['강명희'],
    exhibition_type: 'solo',
    source: 'design_plus_verified',
    source_url: 'https://design.co.kr/article/105122'
  },

  {
    title_local: '하종현 전시',
    title_en: 'Ha Chong-Hyun Exhibition',
    venue_name: '아트선재센터',
    venue_city: '서울',
    start_date: '2025-02-14',
    end_date: '2025-04-20',
    description: '한국 단색화의 거장 하종현의 회고전. 아트선재센터에서 진행.',
    artists: ['하종현'],
    exhibition_type: 'solo',
    source: 'design_plus_verified',
    source_url: 'https://design.co.kr/article/105122'
  },

  {
    title_local: '하종현 전시',
    title_en: 'Ha Chong-Hyun Exhibition',
    venue_name: '국제갤러리',
    venue_city: '서울',
    start_date: '2025-03-20',
    end_date: '2025-05-10',
    description: '한국 단색화의 거장 하종현의 회고전. 국제갤러리에서 진행.',
    artists: ['하종현'],
    exhibition_type: 'solo',
    source: 'design_plus_verified',
    source_url: 'https://design.co.kr/article/105122'
  },

  {
    title_local: '론 뮤익 개인전',
    title_en: 'Ron Mueck',
    venue_name: '국립현대미술관',
    venue_city: '서울',
    start_date: '2025-04-01',
    end_date: '2025-07-31',
    description: '호주 출신 조각가 론 뮤익의 아시아 최대 규모 개인전. 극사실주의 인체 조각 작품들.',
    artists: ['론 뮤익'],
    exhibition_type: 'solo',
    source: 'design_plus_verified',
    source_url: 'https://design.co.kr/article/105122'
  }
];

class DesignPlusExhibitionImporter {
  constructor() {
    this.stats = {
      processed: 0,
      inserted: 0,
      errors: 0
    };
  }

  async importVerifiedExhibitions() {
    console.log('🎨 Design+ 매거진 검증된 전시 정보 입력');
    console.log('📋 출처: "2025년 주목해야 할 국내 전시 11" - Design+ 매거진');
    console.log(`📊 ${DESIGN_PLUS_EXHIBITIONS.length}개 검증된 전시 데이터 입력\n`);

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const exhibition of DESIGN_PLUS_EXHIBITIONS) {
        await this.insertVerifiedExhibition(exhibition, client);
        this.stats.processed++;
      }

      await client.query('COMMIT');
      await this.showResults(client);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ 입력 중 오류:', error);
    } finally {
      client.release();
    }
  }

  async insertVerifiedExhibition(exhibition, client) {
    try {
      // venue_id 찾기
      const venueResult = await client.query(
        'SELECT id FROM venues WHERE name ILIKE $1 LIMIT 1',
        [`%${exhibition.venue_name}%`]
      );

      const venueId = venueResult.rows[0]?.id;

      await client.query(`
        INSERT INTO exhibitions (
          venue_id, venue_name, venue_city, venue_country,
          title_local, title_en, description, start_date, end_date,
          artists, exhibition_type, source, source_url, collected_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      `, [
        venueId,
        exhibition.venue_name,
        exhibition.venue_city,
        'KR',
        exhibition.title_local,
        exhibition.title_en,
        exhibition.description,
        exhibition.start_date,
        exhibition.end_date,
        exhibition.artists,
        exhibition.exhibition_type,
        exhibition.source,
        exhibition.source_url
      ]);

      console.log(`   ✅ "${exhibition.title_local}" - ${exhibition.venue_name}`);
      console.log(`      📅 ${exhibition.start_date} ~ ${exhibition.end_date}`);
      this.stats.inserted++;

    } catch (error) {
      console.error(`   ❌ "${exhibition.title_local}" 입력 실패:`, error.message);
      this.stats.errors++;
    }
  }

  async showResults(client) {
    const verifiedExhibitions = await client.query(`
      SELECT 
        title_local, venue_name, start_date, end_date, source_url,
        CASE 
          WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN '진행중'
          WHEN start_date > CURRENT_DATE THEN '예정'
          ELSE '종료'
        END as status
      FROM exhibitions 
      WHERE source = 'design_plus_verified'
      ORDER BY start_date
    `);

    console.log('\n\n🎉 Design+ 검증 전시 정보 입력 완료!');
    console.log('='.repeat(80));
    console.log(`📊 입력 결과:`);
    console.log(`   처리됨: ${this.stats.processed}개`);
    console.log(`   추가됨: ${this.stats.inserted}개`);
    console.log(`   오류: ${this.stats.errors}개`);

    console.log('\n🎭 입력된 검증 전시 목록:');
    verifiedExhibitions.rows.forEach((ex, index) => {
      const statusEmoji = ex.status === '진행중' ? '🟢' : ex.status === '예정' ? '🔵' : '🔴';
      console.log(`${index + 1}. ${statusEmoji} "${ex.title_local}" - ${ex.venue_name}`);
      console.log(`   📅 ${ex.start_date} ~ ${ex.end_date} (${ex.status})`);
    });

    console.log('\n✨ 이제 전문 매거진에서 검증된 정확한 전시 정보가 준비되었습니다!');
    console.log('🔗 출처: https://design.co.kr/article/105122');
    console.log('💡 이 방식으로 다른 전문 매거진들의 전시 정보도 수집할 수 있습니다.');
  }
}

async function main() {
  const importer = new DesignPlusExhibitionImporter();

  try {
    await importer.importVerifiedExhibitions();
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
