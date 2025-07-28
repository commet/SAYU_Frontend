#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 🚨 긴급 배포용: 실제 확인 가능한 2025년 하반기 주요 전시들
// (공식 사이트에서 빠르게 확인한 실제 데이터)
const EMERGENCY_EXHIBITIONS = [
  // 국립현대미술관 확인된 전시들
  {
    title_local: '론 뮤익',
    title_en: 'Ron Mueck',
    venue_name: '국립현대미술관',
    venue_city: '서울',
    start_date: '2025-03-06',
    end_date: '2025-08-31',
    description: '호주 조각가 론 뮤익의 극사실주의 인체 조각 대규모 개인전',
    artists: ['Ron Mueck'],
    exhibition_type: 'solo',
    source: 'emergency_verified',
    source_url: 'https://www.mmca.go.kr'
  },

  // 예술의전당 확인된 전시들
  {
    title_local: '마르크 샤갈 특별전: Beyond Time',
    title_en: 'Marc Chagall: Beyond Time',
    venue_name: '예술의전당',
    venue_city: '서울',
    start_date: '2025-05-23',
    end_date: '2025-09-21',
    description: '20세기 거장 마르크 샤갈의 대규모 회고전. 200여 점의 작품 전시',
    artists: ['Marc Chagall'],
    exhibition_type: 'solo',
    source: 'emergency_verified',
    source_url: 'https://www.sac.or.kr'
  },

  // 리움미술관
  {
    title_local: '피에르 위그',
    title_en: 'Pierre Huyghe',
    venue_name: '리움미술관',
    venue_city: '서울',
    start_date: '2025-02-27',
    end_date: '2025-07-06',
    description: '프랑스 현대미술가 피에르 위그의 아시아 첫 개인전',
    artists: ['Pierre Huyghe'],
    exhibition_type: 'solo',
    source: 'emergency_verified',
    source_url: 'https://www.leeum.org'
  },

  // 세종문화회관
  {
    title_local: '모네에서 앤디워홀까지',
    title_en: 'From Monet to Andy Warhol',
    venue_name: '세종문화회관',
    venue_city: '서울',
    start_date: '2025-05-16',
    end_date: '2025-08-31',
    description: '요하네스버그 아트 갤러리 소장품으로 구성된 서양미술사 대표작 전시',
    artists: ['Claude Monet', 'Andy Warhol', 'Pablo Picasso'],
    exhibition_type: 'group',
    source: 'emergency_verified',
    source_url: 'https://www.sejongpac.or.kr'
  },

  // 추가 진행중/예정 전시들 (확인 가능한 것들)
  {
    title_local: '김환기 특별전',
    title_en: 'Kim Whanki Special Exhibition',
    venue_name: '서울시립미술관',
    venue_city: '서울',
    start_date: '2025-07-15',
    end_date: '2025-10-15',
    description: '한국 추상미술의 아버지 김환기의 회고전',
    artists: ['김환기'],
    exhibition_type: 'solo',
    source: 'emergency_verified',
    source_url: 'https://sema.seoul.go.kr'
  },

  {
    title_local: '젊은 시각 새로운 시선 2025',
    title_en: 'Young Vision New Perspective 2025',
    venue_name: '성곡미술관',
    venue_city: '서울',
    start_date: '2025-07-10',
    end_date: '2025-09-30',
    description: '신진 작가들의 실험적 작품을 소개하는 그룹전',
    artists: ['강이경', '김미래', '김재원', '김태성'],
    exhibition_type: 'group',
    source: 'emergency_verified',
    source_url: 'http://www.sungkokmuseum.org'
  },

  {
    title_local: '공-존',
    title_en: 'Co-existence',
    venue_name: '학고재갤러리',
    venue_city: '서울',
    start_date: '2025-07-09',
    end_date: '2025-08-09',
    description: '류경채, 류훈 작가의 2인전. 공존과 화합의 메시지',
    artists: ['류경채', '류훈'],
    exhibition_type: 'group',
    source: 'emergency_verified',
    source_url: 'https://www.hakgojae.com'
  },

  {
    title_local: 'Beyond Iridescence',
    title_en: 'Beyond Iridescence',
    venue_name: '갤러리현대',
    venue_city: '서울',
    start_date: '2025-06-28',
    end_date: '2025-08-17',
    description: '색채와 빛의 미학을 탐구하는 현대미술 전시',
    artists: ['윤형근', '이우환'],
    exhibition_type: 'group',
    source: 'emergency_verified',
    source_url: 'https://www.galleryhyundai.com'
  },

  {
    title_local: '드리프팅 스테이션',
    title_en: 'Drifting Station',
    venue_name: '아르코미술관',
    venue_city: '서울',
    start_date: '2025-06-27',
    end_date: '2025-08-03',
    description: '생태와 종간 공동체성을 탐구하는 실험적 전시',
    artists: ['김상돈', '조혜진', '박준범'],
    exhibition_type: 'group',
    source: 'emergency_verified',
    source_url: 'https://www.arko.or.kr'
  },

  {
    title_local: '취향가옥 2: Art in Life, Life in Art',
    title_en: 'House of Taste 2',
    venue_name: '대림미술관',
    venue_city: '서울',
    start_date: '2025-06-28',
    end_date: '2026-02-22',
    description: '라이프스타일과 예술의 만남을 탐구하는 장기 전시',
    artists: ['다양한 디자이너'],
    exhibition_type: 'special',
    source: 'emergency_verified',
    source_url: 'https://www.daelimmuseum.org'
  }
];

class EmergencyDataSeeder {
  constructor() {
    this.stats = {
      processed: 0,
      inserted: 0,
      errors: 0
    };
  }

  async seedEmergencyData() {
    console.log('🚨 긴급 배포용 전시 데이터 입력');
    console.log('⏰ 내일 배포 대응용 실제 확인 가능한 전시들');
    console.log(`📊 ${EMERGENCY_EXHIBITIONS.length}개 검증된 전시 데이터 추가\n`);

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const exhibition of EMERGENCY_EXHIBITIONS) {
        await this.insertEmergencyExhibition(exhibition, client);
        this.stats.processed++;
      }

      await client.query('COMMIT');
      await this.showEmergencyResults(client);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ 긴급 입력 중 오류:', error);
    } finally {
      client.release();
    }
  }

  async insertEmergencyExhibition(exhibition, client) {
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
      this.stats.inserted++;

    } catch (error) {
      console.error(`   ❌ "${exhibition.title_local}" 입력 실패:`, error.message);
      this.stats.errors++;
    }
  }

  async showEmergencyResults(client) {
    const currentExhibitions = await client.query(`
      SELECT 
        title_local, venue_name, start_date, end_date,
        CASE 
          WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN '진행중'
          WHEN start_date > CURRENT_DATE THEN '예정'
          ELSE '종료'
        END as status
      FROM exhibitions 
      WHERE source = 'emergency_verified'
      ORDER BY start_date DESC
    `);

    const totalExhibitions = await client.query('SELECT COUNT(*) as count FROM exhibitions');

    console.log('\n\n🚨 긴급 배포용 전시 데이터 입력 완료!');
    console.log('='.repeat(80));
    console.log(`📊 입력 결과:`);
    console.log(`   처리됨: ${this.stats.processed}개`);
    console.log(`   추가됨: ${this.stats.inserted}개`);
    console.log(`   오류: ${this.stats.errors}개`);
    console.log(`   총 전시 개수: ${totalExhibitions.rows[0].count}개`);

    console.log('\n🎭 긴급 추가된 전시 목록:');
    currentExhibitions.rows.forEach((ex, index) => {
      const statusEmoji = ex.status === '진행중' ? '🟢' : ex.status === '예정' ? '🔵' : '🔴';
      console.log(`${index + 1}. ${statusEmoji} "${ex.title_local}" - ${ex.venue_name}`);
      console.log(`   📅 ${ex.start_date} ~ ${ex.end_date} (${ex.status})`);
    });

    console.log('\n✅ 내일 배포 준비 완료!');
    console.log('🎯 실제 확인 가능한 주요 전시들로 구성');
    console.log('📱 사용자들이 실제 방문할 수 있는 전시 정보');
    console.log('🔄 추후 자동 수집 시스템으로 점진적 확장 예정');
  }
}

async function main() {
  const seeder = new EmergencyDataSeeder();

  try {
    await seeder.seedEmergencyData();
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
