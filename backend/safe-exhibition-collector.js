#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 법적/윤리적으로 안전한 샘플 전시 데이터
const sampleExhibitions = [
  {
    institution_id: null, // 나중에 venue와 연결
    title_en: 'Contemporary Korean Art: New Perspectives',
    title_local: '한국 현대미술: 새로운 시각',
    subtitle: '21세기 한국 미술의 다양성',
    start_date: new Date('2025-02-01'),
    end_date: new Date('2025-04-30'),
    status: 'upcoming',
    description: '21세기 한국 현대미술의 다양한 면모를 조망하는 기획전시입니다. 회화, 조각, 설치, 미디어 아트 등 다양한 장르의 작품들을 통해 한국 미술의 현재를 살펴봅니다.',
    curator: '김현주',
    artists: ['이불', '양혜규', '김수자', '서도호'],
    exhibition_type: 'group',
    genres: ['contemporary', 'installation', 'media'],
    tags: ['현대미술', '한국미술', '설치미술', '미디어아트'],
    venue_name: '국립현대미술관 서울',
    venue_city: '서울',
    official_url: 'https://www.mmca.go.kr'
  },
  {
    title_en: 'The Beauty of Traditional Korean Ceramics',
    title_local: '한국 전통 도자의 미',
    subtitle: '고려청자에서 조선백자까지',
    start_date: new Date('2025-01-15'),
    end_date: new Date('2025-05-15'),
    status: 'upcoming',
    description: '고려시대의 청자부터 조선시대의 백자까지, 한국 도자기의 아름다움과 우수성을 보여주는 특별전입니다.',
    curator: '박미경',
    artists: [],
    exhibition_type: 'permanent',
    genres: ['traditional', 'ceramics'],
    tags: ['전통미술', '도자기', '백자', '청자'],
    venue_name: '리움미술관',
    venue_city: '서울',
    official_url: 'https://www.leeum.org'
  },
  {
    title_en: 'Digital Art Revolution',
    title_local: '디지털 아트 레볼루션',
    subtitle: 'AI와 예술의 만남',
    start_date: new Date('2025-02-15'),
    end_date: new Date('2025-06-30'),
    status: 'upcoming',
    description: 'AI, VR, AR 등 최신 기술을 활용한 디지털 아트의 현재와 미래를 탐구하는 전시입니다.',
    curator: '이정호',
    artists: ['teamLab', '라파엘 로자노헤머', '류이치 사카모토'],
    exhibition_type: 'group',
    genres: ['digital', 'new media', 'interactive'],
    tags: ['디지털아트', 'AI', '인터랙티브', '미디어아트'],
    venue_name: '디뮤지엄',
    venue_city: '서울',
    official_url: 'https://www.dmuseum.org'
  },
  {
    title_en: 'Impressionist Masters',
    title_local: '인상주의 거장전',
    subtitle: '빛과 색의 향연',
    start_date: new Date('2025-03-01'),
    end_date: new Date('2025-07-31'),
    status: 'upcoming',
    description: '모네, 르누아르, 드가 등 인상주의 거장들의 대표작을 한자리에서 만나볼 수 있는 특별전입니다.',
    curator: '국제교류팀',
    artists: ['클로드 모네', '피에르 오귀스트 르누아르', '에드가 드가', '카미유 피사로'],
    exhibition_type: 'group',
    genres: ['impressionism', 'painting'],
    tags: ['인상주의', '서양미술', '회화', '국제교류전'],
    venue_name: '예술의전당 한가람미술관',
    venue_city: '서울',
    official_url: 'https://www.sac.or.kr'
  },
  {
    title_en: 'Contemporary Photography: Korean Perspectives',
    title_local: '한국 현대사진: 시선과 관점',
    subtitle: '사진으로 보는 한국 사회',
    start_date: new Date('2025-01-20'),
    end_date: new Date('2025-04-20'),
    status: 'upcoming',
    description: '한국 현대사진의 흐름을 조망하고, 사진을 통해 한국 사회의 변화를 읽어내는 전시입니다.',
    curator: '김영준',
    artists: ['구본창', '배병우', '이갑철', '민병헌'],
    exhibition_type: 'group',
    genres: ['photography', 'contemporary'],
    tags: ['사진', '현대미술', '다큐멘터리', '한국사회'],
    venue_name: '서울시립미술관',
    venue_city: '서울',
    official_url: 'https://sema.seoul.go.kr'
  },
  {
    title_en: 'Busan Biennale 2025: Connecting Waves',
    title_local: '2025 부산비엔날레: 연결하는 파도',
    subtitle: '해양 도시의 예술적 대화',
    start_date: new Date('2025-04-01'),
    end_date: new Date('2025-06-30'),
    status: 'upcoming',
    description: '해양 도시 부산의 정체성을 바탕으로 국제적인 예술 교류를 모색하는 비엔날레입니다.',
    curator: '국제큐레이터팀',
    artists: [],
    exhibition_type: 'biennale',
    genres: ['contemporary', 'international'],
    tags: ['비엔날레', '국제전', '부산', '현대미술'],
    venue_name: '부산현대미술관',
    venue_city: '부산',
    official_url: 'https://www.busan.go.kr/moca'
  },
  {
    title_en: 'Nature and Art: Ecological Perspectives',
    title_local: '자연과 예술: 생태적 관점',
    subtitle: '환경 위기 시대의 예술',
    start_date: new Date('2025-02-10'),
    end_date: new Date('2025-05-10'),
    status: 'upcoming',
    description: '기후 변화와 환경 문제를 예술적으로 성찰하고, 지속가능한 미래를 모색하는 전시입니다.',
    curator: '환경예술팀',
    artists: ['올라퍼 엘리아슨', '정서영', '최정화'],
    exhibition_type: 'thematic',
    genres: ['environmental', 'installation'],
    tags: ['환경', '생태', '지속가능성', '설치미술'],
    venue_name: '국립아시아문화전당',
    venue_city: '광주',
    official_url: 'https://www.acc.go.kr'
  }
];

async function safeCollectExhibitions() {
  console.log('🎨 안전한 전시 데이터 수집 시작');
  console.log('📋 법적 고지: 모든 데이터는 공개된 정보를 기반으로 하며, 저작권을 준수합니다.\n');

  const client = await pool.connect();
  let addedCount = 0;
  let skippedCount = 0;

  try {
    await client.query('BEGIN');

    for (const exhibition of sampleExhibitions) {
      try {
        // venue 찾기
        const venueResult = await client.query(
          'SELECT id FROM venues WHERE name = $1',
          [exhibition.venue_name]
        );

        if (venueResult.rows.length === 0) {
          console.log(`⚠️  Venue not found: ${exhibition.venue_name}`);
          skippedCount++;
          continue;
        }

        const venueId = venueResult.rows[0].id;

        // 중복 확인
        const existingExhibition = await client.query(
          'SELECT id FROM exhibitions WHERE title_local = $1 AND start_date = $2',
          [exhibition.title_local, exhibition.start_date]
        );

        if (existingExhibition.rows.length > 0) {
          console.log(`⏭️  Already exists: ${exhibition.title_local}`);
          skippedCount++;
          continue;
        }

        // 전시 추가
        const exhibitionId = uuidv4();
        await client.query(`
          INSERT INTO exhibitions (
            id, institution_id, title_en, title_local, subtitle,
            start_date, end_date, status, description, curator,
            artists, exhibition_type, genres, tags,
            venue_id, venue_name, venue_city, venue_country,
            official_url, source, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            NOW(), NOW()
          )
        `, [
          exhibitionId,
          null, // institution_id는 나중에 연결
          exhibition.title_en,
          exhibition.title_local,
          exhibition.subtitle,
          exhibition.start_date,
          exhibition.end_date,
          exhibition.status,
          exhibition.description,
          exhibition.curator,
          exhibition.artists,
          exhibition.exhibition_type,
          exhibition.genres,
          exhibition.tags,
          venueId,
          exhibition.venue_name,
          exhibition.venue_city,
          'KR',
          exhibition.official_url,
          'sample_data',
        ]);

        console.log(`✅ Added: ${exhibition.title_local} at ${exhibition.venue_name}`);
        addedCount++;

      } catch (error) {
        console.error(`❌ Error adding exhibition "${exhibition.title_local}":`, error.message);
      }
    }

    await client.query('COMMIT');

    console.log('\n📊 수집 결과:');
    console.log(`   ✅ 추가됨: ${addedCount}개`);
    console.log(`   ⏭️  건너뜀: ${skippedCount}개`);

    // 전체 통계
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'current' THEN 1 END) as current,
        COUNT(CASE WHEN status = 'past' THEN 1 END) as past
      FROM exhibitions
    `);

    const cityStats = await client.query(`
      SELECT venue_city, COUNT(*) as count
      FROM exhibitions
      WHERE venue_country = 'KR'
      GROUP BY venue_city
      ORDER BY count DESC
    `);

    console.log('\n📈 전체 전시 현황:');
    console.log(`   총 전시: ${stats.rows[0].total}개`);
    console.log(`   예정: ${stats.rows[0].upcoming}개`);
    console.log(`   진행중: ${stats.rows[0].current}개`);
    console.log(`   종료: ${stats.rows[0].past}개`);

    console.log('\n🗺️  도시별 분포:');
    cityStats.rows.forEach(city => {
      console.log(`   ${city.venue_city}: ${city.count}개`);
    });

    console.log('\n✨ 안전한 전시 데이터 수집 완료!');
    console.log('💡 실제 운영 시에는 각 미술관의 공식 API나 RSS 피드를 활용하세요.');
    console.log('📱 수집된 데이터는 출처를 명시하고 링크만 제공합니다.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  safeCollectExhibitions().catch(console.error);
}

module.exports = { safeCollectExhibitions };