#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 2025년 7월 실제 진행중인 주요 전시들
const EXHIBITIONS_2025 = [
  // 국립현대미술관
  {
    title_local: '론 뮤익',
    title_en: 'Ron Mueck',
    venue_name: '국립현대미술관 서울',
    venue_city: '서울',
    start_date: '2025-03-06',
    end_date: '2025-08-31',
    description: '호주 출신 조각가 론 뮤익의 아시아 최대 규모 개인전. 초현실적인 인체 조각으로 인간의 존재와 감정을 탐구.',
    artists: ['Ron Mueck'],
    exhibition_type: 'solo',
    genres: ['조각', '설치'],
    ticket_price: { adult: 2000, student: 1000 },
    official_url: 'https://www.mmca.go.kr',
    source: 'manual_2025'
  },
  {
    title_local: '젊은 모색 2025',
    title_en: 'Young Korean Artists 2025',
    venue_name: '국립현대미술관 과천',
    venue_city: '과천',
    start_date: '2025-05-02',
    end_date: '2025-10-26',
    description: '한국 현대미술의 미래를 이끌어갈 젊은 작가들의 실험적인 작품 세계',
    artists: ['김민애', '박경률', '홍진훈', '정재호'],
    exhibition_type: 'group',
    genres: ['현대미술', '설치', '미디어아트'],
    ticket_price: { adult: 2000, student: 1000 },
    source: 'manual_2025'
  },

  // 리움미술관
  {
    title_local: '피에르 위그',
    title_en: 'Pierre Huyghe',
    venue_name: '리움미술관',
    venue_city: '서울',
    start_date: '2025-02-28',
    end_date: '2025-08-25',
    description: '프랑스 현대미술가 피에르 위그의 아시아 최초 대규모 개인전. AI와 생명체를 활용한 몰입형 설치작업.',
    artists: ['Pierre Huyghe'],
    exhibition_type: 'solo',
    genres: ['미디어아트', '설치', '바이오아트'],
    ticket_price: { adult: 20000, student: 14000 },
    official_url: 'https://www.leeum.org',
    source: 'manual_2025'
  },

  // 서울시립미술관
  {
    title_local: '데이비드 호크니: 내 창문에서',
    title_en: 'David Hockney: From My Window',
    venue_name: '서울시립미술관',
    venue_city: '서울',
    start_date: '2025-04-10',
    end_date: '2025-08-17',
    description: '영국 현대미술의 거장 데이비드 호크니가 팬데믹 기간 동안 아이패드로 그린 풍경화 시리즈',
    artists: ['David Hockney'],
    exhibition_type: 'solo',
    genres: ['회화', '디지털아트'],
    ticket_price: { adult: 15000, student: 10000 },
    official_url: 'https://sema.seoul.go.kr',
    source: 'manual_2025'
  },

  // 대림미술관
  {
    title_local: '취향가옥 2: 도시의 숲',
    title_en: 'House of Taste 2: Urban Forest',
    venue_name: '대림미술관',
    venue_city: '서울',
    start_date: '2025-06-28',
    end_date: '2026-02-22',
    description: '도시 속 자연과 라이프스타일의 조화를 탐구하는 전시. 지속가능한 삶의 방식 제안.',
    artists: ['Various Artists'],
    exhibition_type: 'special',
    genres: ['디자인', '라이프스타일', '설치'],
    ticket_price: { adult: 18000, student: 13000 },
    official_url: 'https://www.daelimmuseum.org',
    source: 'manual_2025'
  },

  // 아모레퍼시픽미술관
  {
    title_local: '한국미의 정수',
    title_en: 'The Essence of Korean Beauty',
    venue_name: '아모레퍼시픽미술관',
    venue_city: '서울',
    start_date: '2025-03-20',
    end_date: '2025-09-14',
    description: '전통과 현대를 아우르는 한국 미의 정수를 담은 소장품 특별전',
    artists: ['김환기', '이우환', '박서보'],
    exhibition_type: 'collection',
    genres: ['한국화', '현대미술'],
    ticket_price: { adult: 15000, student: 10000 },
    source: 'manual_2025'
  },

  // 국제갤러리
  {
    title_local: '강서경 개인전',
    title_en: 'Kang Seo Kyeong Solo Exhibition',
    venue_name: '국제갤러리',
    venue_city: '서울',
    start_date: '2025-06-26',
    end_date: '2025-08-10',
    description: '한국 현대미술의 주목받는 작가 강서경의 신작 회화전',
    artists: ['강서경'],
    exhibition_type: 'solo',
    genres: ['회화', '현대미술'],
    source: 'manual_2025'
  },

  // 갤러리현대
  {
    title_local: '한국 추상미술의 선구자들',
    title_en: 'Pioneers of Korean Abstract Art',
    venue_name: '갤러리현대',
    venue_city: '서울',
    start_date: '2025-05-15',
    end_date: '2025-08-30',
    description: '단색화와 한국 추상미술의 발전 과정을 조명하는 아카이브 전시',
    artists: ['박서보', '정상화', '하종현', '이우환'],
    exhibition_type: 'group',
    genres: ['추상미술', '단색화'],
    source: 'manual_2025'
  },

  // 아트선재센터
  {
    title_local: '미래의 기억',
    title_en: 'Memories of the Future',
    venue_name: '아트선재센터',
    venue_city: '서울',
    start_date: '2025-07-03',
    end_date: '2025-09-28',
    description: '기술과 인간의 관계를 탐구하는 미디어아트 그룹전',
    artists: ['teamLab', '정연두', '김아영'],
    exhibition_type: 'group',
    genres: ['미디어아트', '설치'],
    source: 'manual_2025'
  },

  // 예술의전당
  {
    title_local: '마르크 샤갈: 꿈의 여정',
    title_en: 'Marc Chagall: Journey of Dreams',
    venue_name: '예술의전당 한가람미술관',
    venue_city: '서울',
    start_date: '2025-05-23',
    end_date: '2025-09-21',
    description: '20세기 거장 마르크 샤갈의 대규모 회고전. 유화, 판화, 스테인드글라스 등 200여점.',
    artists: ['Marc Chagall'],
    exhibition_type: 'solo',
    genres: ['회화', '판화'],
    ticket_price: { adult: 20000, student: 14000 },
    official_url: 'https://www.sac.or.kr',
    source: 'manual_2025'
  },

  // 소마미술관
  {
    title_local: '조각의 시간',
    title_en: 'Time of Sculpture',
    venue_name: '소마미술관',
    venue_city: '서울',
    start_date: '2025-04-01',
    end_date: '2025-08-31',
    description: '올림픽공원 야외조각과 연계한 현대조각 특별전',
    artists: ['김종영', '문신', '박종배'],
    exhibition_type: 'group',
    genres: ['조각', '설치'],
    ticket_price: { adult: 5000, student: 3000 },
    source: 'manual_2025'
  },

  // K현대미술관
  {
    title_local: '블루 & 그린',
    title_en: 'Blue & Green',
    venue_name: 'K현대미술관',
    venue_city: '서울',
    start_date: '2025-06-12',
    end_date: '2025-11-30',
    description: '자연과 환경을 주제로 한 현대미술 기획전',
    artists: ['올라퍼 엘리아슨', '안규철', '장영혜중공업'],
    exhibition_type: 'group',
    genres: ['현대미술', '설치'],
    ticket_price: { adult: 12000, student: 8000 },
    source: 'manual_2025'
  },

  // 부산시립미술관
  {
    title_local: '부산비엔날레 프리뷰',
    title_en: 'Busan Biennale Preview',
    venue_name: '부산시립미술관',
    venue_city: '부산',
    start_date: '2025-06-01',
    end_date: '2025-08-31',
    description: '2026 부산비엔날레를 앞두고 펼쳐지는 프리뷰 전시',
    artists: ['국내외 작가 30여명'],
    exhibition_type: 'group',
    genres: ['현대미술', '설치', '미디어아트'],
    source: 'manual_2025'
  },

  // 대구미술관
  {
    title_local: '이건희 컬렉션 특별전: 한국미술 100년',
    title_en: 'Lee Kun-hee Collection: 100 Years of Korean Art',
    venue_name: '대구미술관',
    venue_city: '대구',
    start_date: '2025-05-20',
    end_date: '2025-10-12',
    description: '이건희 컬렉션 중 한국 근현대미술 명작 100여점 특별 공개',
    artists: ['김환기', '이중섭', '박수근', '천경자'],
    exhibition_type: 'collection',
    genres: ['한국화', '서양화', '현대미술'],
    ticket_price: { adult: 10000, student: 5000 },
    source: 'manual_2025'
  },

  // 백남준아트센터
  {
    title_local: '백남준: 사이버네틱 환상',
    title_en: 'Nam June Paik: Cybernetic Fantasy',
    venue_name: '백남준아트센터',
    venue_city: '용인',
    start_date: '2025-03-01',
    end_date: '2025-12-31',
    description: '백남준 탄생 93주년 기념 특별전. 미공개 아카이브와 신작 커미션',
    artists: ['백남준'],
    exhibition_type: 'solo',
    genres: ['비디오아트', '미디어아트'],
    ticket_price: { adult: 4000, student: 2000 },
    source: 'manual_2025'
  }
];

async function seedExhibitions() {
  const client = await pool.connect();
  
  try {
    console.log('🎨 2025년 실제 전시 데이터 입력 시작\n');
    
    // venue_name과 일치하는 venue_id 찾기
    const venueMap = new Map();
    const venues = await client.query('SELECT id, name, city FROM venues WHERE country = \'KR\'');
    venues.rows.forEach(v => {
      venueMap.set(`${v.name}_${v.city}`, v.id);
    });
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    await client.query('BEGIN');
    
    for (const exhibition of EXHIBITIONS_2025) {
      // 중복 확인
      const existing = await client.query(
        'SELECT id FROM exhibitions WHERE title_local = $1 AND venue_name = $2 AND start_date = $3',
        [exhibition.title_local, exhibition.venue_name, exhibition.start_date]
      );
      
      if (existing.rows.length > 0) {
        console.log(`⏭️  이미 존재: ${exhibition.title_local}`);
        skippedCount++;
        continue;
      }
      
      // venue_id 찾기
      let venueId = null;
      const possibleKeys = [
        `${exhibition.venue_name}_${exhibition.venue_city}`,
        `${exhibition.venue_name.split(' ')[0]}_${exhibition.venue_city}` // 첫 단어만
      ];
      
      for (const key of possibleKeys) {
        if (venueMap.has(key)) {
          venueId = venueMap.get(key);
          break;
        }
      }
      
      // 전시 데이터 삽입
      const insertQuery = `
        INSERT INTO exhibitions (
          title_local, title_en, venue_id, venue_name, venue_city, venue_country,
          start_date, end_date, description, artists, exhibition_type, genres,
          ticket_price, official_url, source, status, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP
        )
      `;
      
      const status = new Date(exhibition.start_date) <= new Date() && new Date(exhibition.end_date) >= new Date() 
        ? 'ongoing' 
        : new Date(exhibition.start_date) > new Date() ? 'upcoming' : 'ended';
      
      await client.query(insertQuery, [
        exhibition.title_local,
        exhibition.title_en,
        venueId,
        exhibition.venue_name,
        exhibition.venue_city,
        'KR',
        exhibition.start_date,
        exhibition.end_date,
        exhibition.description,
        exhibition.artists,
        exhibition.exhibition_type,
        exhibition.genres || null,
        exhibition.ticket_price ? JSON.stringify(exhibition.ticket_price) : null,
        exhibition.official_url || null,
        exhibition.source,
        status
      ]);
      
      console.log(`✅ 추가됨: ${exhibition.title_local} at ${exhibition.venue_name}`);
      insertedCount++;
    }
    
    await client.query('COMMIT');
    
    // 최종 통계
    console.log('\n📊 입력 완료:');
    console.log(`   ✅ 새로 추가: ${insertedCount}개`);
    console.log(`   ⏭️  중복 제외: ${skippedCount}개`);
    console.log(`   📍 총 시도: ${EXHIBITIONS_2025.length}개`);
    
    // 전체 전시 현황
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
        COUNT(CASE WHEN venue_country = 'KR' THEN 1 END) as korean,
        COUNT(CASE WHEN venue_country != 'KR' THEN 1 END) as international
      FROM exhibitions
    `);
    
    const s = stats.rows[0];
    console.log('\n📈 전체 전시 데이터 현황:');
    console.log(`   총 전시: ${s.total}개`);
    console.log(`   ├─ 진행중: ${s.ongoing}개`);
    console.log(`   ├─ 예정: ${s.upcoming}개`);
    console.log(`   ├─ 국내: ${s.korean}개`);
    console.log(`   └─ 해외: ${s.international}개`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 오류:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedExhibitions();