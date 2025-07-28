#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 실제 2025년 7월 진행중/예정 전시들 (수동 큐레이션)
const REAL_EXHIBITIONS = [
  // 국립현대미술관 서울
  {
    title_local: '론 뮤익',
    title_en: 'Ron Mueck',
    venue_name: '국립현대미술관',
    venue_city: '서울',
    start_date: '2025-03-06',
    end_date: '2025-08-31',
    description: '호주 출신 조각가 론 뮤익의 아시아 최대 규모 개인전. 극사실주의 인체 조각 작품들을 선보인다.',
    artists: ['론 뮤익'],
    exhibition_type: 'solo',
    official_url: 'https://www.mmca.go.kr/exhibitions/exhibitionsDetail.do?exhId=202501160001593',
    source: 'manual_curated'
  },

  // 예술의전당
  {
    title_local: '마르크 샤갈 특별전: Beyond Time',
    title_en: 'Marc Chagall: Beyond Time',
    venue_name: '예술의전당',
    venue_city: '서울',
    start_date: '2025-05-23',
    end_date: '2025-09-21',
    description: '20세기 거장 마르크 샤갈의 대규모 회고전. 유화, 판화, 조각 등 200여 점 전시.',
    artists: ['마르크 샤갈'],
    exhibition_type: 'solo',
    official_url: 'https://www.sac.or.kr',
    source: 'manual_curated'
  },

  // 세종문화회관
  {
    title_local: '모네에서 앤디워홀까지',
    title_en: 'From Monet to Andy Warhol',
    venue_name: '세종문화회관',
    venue_city: '서울',
    start_date: '2025-05-16',
    end_date: '2025-08-31',
    description: '요하네스버그 아트 갤러리 소장품으로 구성된 서양미술사 대표작 전시.',
    artists: ['클로드 모네', '앤디 워홀', '파블로 피카소'],
    exhibition_type: 'group',
    official_url: 'https://www.sejongpac.or.kr',
    source: 'manual_curated'
  },

  // 리움미술관
  {
    title_local: '피에르 위그 개인전',
    title_en: 'Pierre Huyghe',
    venue_name: '리움미술관',
    venue_city: '서울',
    start_date: '2025-02-28',
    end_date: '2025-08-25',
    description: '프랑스 현대미술가 피에르 위그의 아시아 첫 개인전. 인공지능과 생명체를 활용한 설치작품.',
    artists: ['피에르 위그'],
    exhibition_type: 'solo',
    official_url: 'https://www.leeum.org',
    source: 'manual_curated'
  },

  // 국제갤러리
  {
    title_local: 'Next Painting: As We Are',
    title_en: 'Next Painting: As We Are',
    venue_name: '국제갤러리',
    venue_city: '서울',
    start_date: '2025-06-05',
    end_date: '2025-07-20',
    description: '회화의 현재와 미래를 탐구하는 그룹전. 국내외 작가들의 실험적 회화 작품.',
    artists: ['김환기', '이우환', 'David Hockney'],
    exhibition_type: 'group',
    official_url: 'https://www.kukjegallery.com',
    source: 'manual_curated'
  },

  // 아르코미술관
  {
    title_local: '드리프팅 스테이션: 찬미와 애도에 관한 행성간 다종 오페라',
    title_en: 'Drifting Station',
    venue_name: '아르코미술관',
    venue_city: '서울',
    start_date: '2025-06-27',
    end_date: '2025-08-03',
    description: '생태와 종간 공동체성을 탐구하는 실험적 전시. 다양한 매체를 통한 생태 담론.',
    artists: ['김상돈', '조혜진', '박준범'],
    exhibition_type: 'group',
    official_url: 'https://www.arko.or.kr',
    source: 'manual_curated'
  },

  // 갤러리현대
  {
    title_local: '한국현대미술 거장전: AGAIN LEGEND AGAIN',
    title_en: 'Masters of Korean Contemporary Art',
    venue_name: '갤러리현대',
    venue_city: '서울',
    start_date: '2025-04-22',
    end_date: '2025-07-27',
    description: '한국 현대미술을 이끈 거장들의 대표작을 한자리에서 만나는 특별전.',
    artists: ['이우환', '박서보', '하종현'],
    exhibition_type: 'group',
    official_url: 'https://www.galleryhyundai.com',
    source: 'manual_curated'
  },

  // 서울시립미술관
  {
    title_local: '하이라이트 2025',
    title_en: 'Highlight 2025',
    venue_name: '서울시립미술관',
    venue_city: '서울',
    start_date: '2025-03-14',
    end_date: '2025-12-31',
    description: '서울시립미술관 소장품 중 주요 작품들을 선별한 상설 전시.',
    artists: ['김환기', '이중섭', '박수근'],
    exhibition_type: 'collection',
    official_url: 'https://sema.seoul.go.kr',
    source: 'manual_curated'
  },

  // 학고재갤러리
  {
    title_local: '공-존',
    title_en: 'Co-existence',
    venue_name: '학고재갤러리',
    venue_city: '서울',
    start_date: '2025-07-09',
    end_date: '2025-08-09',
    description: '류경채, 류훈 작가의 2인전. 공존과 화합의 메시지를 담은 작품들.',
    artists: ['류경채', '류훈'],
    exhibition_type: 'group',
    official_url: 'https://www.hakgojae.com',
    source: 'manual_curated'
  },

  // 대림미술관
  {
    title_local: '취향가옥 2: Art in Life, Life in Art',
    title_en: 'House of Taste 2',
    venue_name: '대림미술관',
    venue_city: '서울',
    start_date: '2025-06-28',
    end_date: '2026-02-22',
    description: '라이프스타일과 예술의 만남을 탐구하는 전시. 일상 속 예술의 역할을 조명.',
    artists: ['다양한 디자이너', '라이프스타일 브랜드'],
    exhibition_type: 'special',
    official_url: 'https://www.daelimmuseum.org',
    source: 'manual_curated'
  }
];

class ManualExhibitionSeeder {
  constructor() {
    this.stats = {
      processed: 0,
      inserted: 0,
      updated: 0,
      errors: 0
    };
  }

  async seedRealExhibitions() {
    console.log('🎨 실제 전시 데이터 수동 입력 시작');
    console.log(`📋 ${REAL_EXHIBITIONS.length}개 큐레이션된 전시 데이터 입력\n`);

    const client = await pool.connect();

    try {
      // 기존 더미 데이터 정리
      await this.cleanupDummyData(client);

      await client.query('BEGIN');

      for (const exhibition of REAL_EXHIBITIONS) {
        await this.insertRealExhibition(exhibition, client);
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

  async cleanupDummyData(client) {
    console.log('🧹 기존 더미 데이터 정리 중...');

    // 네이버 블로그에서 수집한 부정확한 데이터 삭제
    const deleteResult = await client.query(`
      DELETE FROM exhibitions 
      WHERE source = 'naver_blog' 
        AND (
          title_local LIKE '%블로그%' 
          OR title_local LIKE '%#%'
          OR title_local LIKE '%여행%'
          OR title_local LIKE '%덴마크%'
          OR title_local LIKE '%에세이%'
          OR length(title_local) < 5
        )
    `);

    console.log(`   ✅ ${deleteResult.rowCount}개 부정확한 데이터 삭제`);
  }

  async insertRealExhibition(exhibition, client) {
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
          artists, exhibition_type, official_url, source, collected_at
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
        exhibition.official_url,
        exhibition.source
      ]);

      console.log(`   ✅ "${exhibition.title_local}" - ${exhibition.venue_name}`);
      this.stats.inserted++;

    } catch (error) {
      console.error(`   ❌ "${exhibition.title_local}" 입력 실패:`, error.message);
      this.stats.errors++;
    }
  }

  async showResults(client) {
    const currentExhibitions = await client.query(`
      SELECT 
        title_local, venue_name, start_date, end_date, source,
        CASE 
          WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN '진행중'
          WHEN start_date > CURRENT_DATE THEN '예정'
          ELSE '종료'
        END as status
      FROM exhibitions 
      WHERE source = 'manual_curated'
      ORDER BY start_date DESC
    `);

    console.log('\n\n🎉 실제 전시 데이터 입력 완료!');
    console.log('='.repeat(80));
    console.log(`📊 입력 결과:`);
    console.log(`   처리됨: ${this.stats.processed}개`);
    console.log(`   추가됨: ${this.stats.inserted}개`);
    console.log(`   오류: ${this.stats.errors}개`);

    console.log('\n🎭 입력된 실제 전시 목록:');
    currentExhibitions.rows.forEach((ex, index) => {
      const statusEmoji = ex.status === '진행중' ? '🟢' : ex.status === '예정' ? '🔵' : '🔴';
      console.log(`${index + 1}. ${statusEmoji} "${ex.title_local}" - ${ex.venue_name}`);
      console.log(`   📅 ${ex.start_date} ~ ${ex.end_date} (${ex.status})`);
    });

    console.log('\n✨ 이제 실제 정확한 전시 정보가 준비되었습니다!');
    console.log('💡 추가 전시는 같은 방식으로 계속 큐레이션할 수 있습니다.');
  }
}

async function main() {
  const seeder = new ManualExhibitionSeeder();

  try {
    await seeder.seedRealExhibitions();
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
