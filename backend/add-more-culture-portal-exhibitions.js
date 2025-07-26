#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 추가 문화포털 전시 정보
const MORE_EXHIBITIONS = [
  {
    title_local: "2025 성북 N 아티스트 기획전시 《안성석: 그럼 쪽끔씩 가자》",
    title_en: null,
    venue_name: "성북예술창작터",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-05-30",
    end_date: "2025-11-08",
    description: null,
    artists: ["안성석"],
    exhibition_type: "solo",
    status: "ongoing",
    official_url: "https://www.sbculture.or.kr/culture/main/main.do",
    venue_address: "서울특별시 성북구 성북로 23 성북예술창작터",
    phone: "02-2038-9989",
    admission_fee: "무료",
    source: "culture_portal"
  },
  {
    title_local: "[어반스케처스 서울X딜쿠샤] 기쁜 마음을 그리다",
    title_en: "Sketching Hearts Delight!",
    venue_name: "아트허브 온라인 갤러리(ARTHUB Online Gallery)",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2024-12-03",
    end_date: "2025-11-23",
    description: null,
    artists: [],
    exhibition_type: "group",
    status: "ongoing",
    official_url: "http://arthub.co.kr/sub01/sub00.htm",
    venue_address: null,
    phone: "02-2654-7138",
    admission_fee: "무료",
    source: "culture_portal"
  },
  {
    title_local: "서울남산국악당 갤러리",
    title_en: null,
    venue_name: "남산골한옥마을 서울남산국악당 야외마당",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-03-18",
    end_date: "2025-11-30",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://www.hanokmaeul.or.kr/ko/g/about",
    venue_address: "서울특별시 중구 퇴계로34길 28 남산골한옥마을",
    phone: "02-6358-5533",
    admission_fee: "무료",
    source: "culture_portal"
  },
  {
    title_local: "2025 찾아가는 한글전시",
    title_en: null,
    venue_name: "국립한글박물관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-03-13",
    end_date: "2025-12-07",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://www.hangeul.go.kr",
    venue_address: "서울특별시 용산구 서빙고로 139 국립한글박물관",
    phone: "02-2124-6200",
    admission_fee: "홈페이지 참고",
    source: "culture_portal"
  },
  {
    title_local: "공연장으로 간 미술",
    title_en: null,
    venue_name: "세종문화회관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-07-07",
    end_date: "2025-12-28",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "http://www.sejongpac.or.kr/",
    venue_address: "서울특별시 종로구 세종대로 175 세종문화회관",
    phone: "02-399-1000",
    admission_fee: "무료",
    source: "culture_portal"
  },
  {
    title_local: "두 발로 세계를 재패하다",
    title_en: null,
    venue_name: "국립중앙박물관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-07-25",
    end_date: "2025-12-28",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "http://www.museum.go.kr",
    venue_address: "서울특별시 용산구 서빙고로 137 국립중앙박물관",
    phone: "02-2077-9000",
    admission_fee: "무료",
    source: "culture_portal"
  },
  {
    title_local: "섬유의 시간: 전통을 담고 미래를 잇다",
    title_en: "The Times of Fiber: Carrying Tradition and Connecting the Future",
    venue_name: "숙명여자대학교박물관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-06-08",
    end_date: "2025-12-30",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: null,
    venue_address: "숙명여자대학교박물관",
    phone: "02-710-9134",
    admission_fee: null,
    source: "culture_portal"
  },
  {
    title_local: "[국립중앙도서관 상설 전시] 시간의 기록을 잇다",
    title_en: null,
    venue_name: "국립중앙도서관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2018-10-29",
    end_date: "2025-12-31",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "http://www.nl.go.kr/",
    venue_address: "서울특별시 서초구 반포대로 201 국립중앙도서관",
    phone: "02-590-0500",
    admission_fee: "무료",
    source: "culture_portal"
  },
  {
    title_local: "보자기, 일상을 감싸다",
    title_en: null,
    venue_name: "서울공예박물관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2021-07-16",
    end_date: "2025-12-31",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://craftmuseum.seoul.go.kr/main",
    venue_address: "서울특별시 종로구 율곡로3길 4 서울공예박물관",
    phone: "02-6450-7000",
    admission_fee: "무료",
    source: "culture_portal"
  },
  {
    title_local: "자수, 꽃이 피다",
    title_en: null,
    venue_name: "서울공예박물관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2021-07-16",
    end_date: "2025-12-31",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://craftmuseum.seoul.go.kr/main",
    venue_address: "서울특별시 종로구 율곡로3길 4 서울공예박물관",
    phone: "02-6450-7021",
    admission_fee: "무료",
    source: "culture_portal"
  },
  {
    title_local: "어린이박물관 상설전시 아하! 발견과 공감",
    title_en: "Aha! Discovery and Empathy in Action",
    venue_name: "국립중앙박물관 어린이박물관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2021-12-15",
    end_date: "2025-12-31",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://www.museum.go.kr/site/child/home",
    venue_address: "서울특별시 용산구 서빙고로 137 국립중앙박물관 어린이박물관",
    phone: "02-2077-9647",
    admission_fee: "무료",
    source: "culture_portal"
  },
  {
    title_local: "[상설전시] 훈민정음, 천년의 문자 계획",
    title_en: null,
    venue_name: "국립한글박물관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2022-01-21",
    end_date: "2025-12-31",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://www.hangeul.go.kr",
    venue_address: "서울특별시 용산구 서빙고로 139 국립한글박물관",
    phone: "02-2124-6200",
    admission_fee: "무료",
    source: "culture_portal"
  },
  {
    title_local: "[상시] 2023 돈의문박물관 마을 미디어아트 시화일률",
    title_en: null,
    venue_name: "돈의문박물관마을",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2022-06-16",
    end_date: "2025-12-31",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://dmvillage.info/",
    venue_address: "서울특별시 종로구 송월길 14-3 돈의문박물관마을",
    phone: "02-739-6994",
    admission_fee: "무료",
    source: "culture_portal"
  }
];

async function cleanTitle(title) {
  if (!title) return '';
  return title
    .replace(/\s+/g, ' ')
    .replace(/[『』「」<>《》【】]/g, '')
    .trim();
}

async function addExhibitions() {
  const client = await pool.connect();
  
  try {
    console.log('🎨 추가 문화포털 전시 데이터 추가 시작...\n');
    
    let addedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    
    for (const exhibition of MORE_EXHIBITIONS) {
      try {
        // 제목 정제
        const cleanedTitle = await cleanTitle(exhibition.title_local);
        
        // 중복 확인
        const existing = await client.query(
          'SELECT id FROM exhibitions WHERE title_local = $1 AND venue_name = $2 AND start_date = $3',
          [cleanedTitle, exhibition.venue_name, exhibition.start_date]
        );
        
        if (existing.rows.length > 0) {
          console.log(`⚠️  중복: ${cleanedTitle} @ ${exhibition.venue_name}`);
          duplicateCount++;
          continue;
        }
        
        // venue_id 찾기 또는 생성
        let venueId = null;
        const venueResult = await client.query(
          'SELECT id FROM venues WHERE name = $1 AND city = $2',
          [exhibition.venue_name, exhibition.venue_city]
        );
        
        if (venueResult.rows.length > 0) {
          venueId = venueResult.rows[0].id;
        } else {
          // 새 venue 생성
          const newVenue = await client.query(
            `INSERT INTO venues (name, city, country, address, phone, website) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [
              exhibition.venue_name,
              exhibition.venue_city,
              exhibition.venue_country || 'KR',
              exhibition.venue_address,
              exhibition.phone,
              exhibition.official_url
            ]
          );
          venueId = newVenue.rows[0].id;
        }
        
        // 전시 삽입
        await client.query(
          `INSERT INTO exhibitions (
            title_local, title_en, venue_id, venue_name, venue_city, venue_country,
            start_date, end_date, description, artists, exhibition_type, 
            admission_fee, official_url, source, source_url, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
          )`,
          [
            cleanedTitle,
            exhibition.title_en || cleanedTitle,
            venueId,
            exhibition.venue_name,
            exhibition.venue_city,
            exhibition.venue_country || 'KR',
            exhibition.start_date,
            exhibition.end_date,
            exhibition.description,
            exhibition.artists || [],
            exhibition.exhibition_type || 'special',
            exhibition.admission_fee || '무료',
            exhibition.official_url,
            exhibition.source || 'culture_portal',
            exhibition.source_url,
            exhibition.status || 'ongoing'
          ]
        );
        
        console.log(`✅ 추가: ${cleanedTitle} @ ${exhibition.venue_name}`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ 오류: ${exhibition.title_local} - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 최종 결과:');
    console.log(`✅ 추가된 전시: ${addedCount}개`);
    console.log(`⚠️  중복된 전시: ${duplicateCount}개`);
    console.log(`❌ 오류 발생: ${errorCount}개`);
    console.log(`📋 전체 처리: ${MORE_EXHIBITIONS.length}개`);
    
  } catch (error) {
    console.error('전체 오류:', error);
  } finally {
    client.release();
  }
}

// 실행
addExhibitions()
  .then(() => {
    console.log('\n✨ 추가 문화포털 전시 데이터 추가 완료!');
    process.exit(0);
  })
  .catch(error => {
    console.error('실행 오류:', error);
    process.exit(1);
  });