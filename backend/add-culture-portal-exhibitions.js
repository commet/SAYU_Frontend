#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 문화포털에서 캡쳐한 전시 정보
const CULTURE_PORTAL_EXHIBITIONS = [
  {
    title_local: "[상시] 2022 기억 전당포 展",
    title_en: null,
    venue_name: "돈의문박물관마을",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2022-11-25",
    end_date: "2025-12-31",
    description: null,
    artists: [],
    exhibition_type: "special",
    admission_fee: "무료",
    venue_address: "서울특별시 종로구 송월길 14-3 돈의문박물관마을",
    phone: "02-739-6994",
    official_url: "https://dmvillage.info/",
    source: "culture_portal",
    status: "ongoing"
  },
  {
    title_local: "[상시] 권진규의 영원한 집",
    title_en: null,
    venue_name: "서울시립미술관 남서울미술관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2023-01-01",
    end_date: "2025-12-31",
    description: null,
    artists: ["권진규"],
    exhibition_type: "solo",
    admission_fee: "무료",
    venue_address: "서울특별시 관악구 남부순환로 2076 서울시립미술관 남서울미술관",
    phone: "02-598-6246~7",
    official_url: "https://sema.seoul.go.kr/kr/visit/namseoul",
    source: "culture_portal",
    status: "ongoing"
  },
  {
    title_local: "서울시립 북서울미술관 상설전 《서도호와 아이들: 아트랜드》",
    title_en: null,
    venue_name: "서울시립미술관 북서울미술관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2023-05-02",
    end_date: "2025-12-31",
    description: null,
    artists: ["서도호"],
    exhibition_type: "solo",
    admission_fee: "무료",
    venue_address: "서울특별시 노원구 동일로 1238 서울시립미술관 북서울미술관",
    phone: "02-2124-5201",
    official_url: "https://sema.seoul.go.kr",
    source: "culture_portal",
    status: "ongoing"
  },
  {
    title_local: "[서울상상나라] 상설전시 - 우리, 캠핑 가요!",
    title_en: null,
    venue_name: "서울상상나라",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2023-10-31",
    end_date: "2025-12-31",
    description: null,
    artists: [],
    exhibition_type: "special",
    admission_fee: "36개월 이상 어린이, 성인 4,000원 / 단체 20명 이상(36개월 이상 어린이) 3,000원 / 연간회원(회원카드 지참 필수) 무료",
    venue_address: "서울특별시 광진구 능동로 216 상상나라 B1층",
    phone: "02-6450-9500",
    official_url: "https://www.seoulchildrensmuseum.org/",
    source: "culture_portal",
    status: "ongoing"
  },
  {
    title_local: "국토, 다시 세우다",
    title_en: null,
    venue_name: "국토발전전시관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2023-12-29",
    end_date: "2025-12-31",
    description: null,
    artists: [],
    exhibition_type: "special",
    admission_fee: "무료",
    venue_address: "서울특별시 중구 정동길 18 국토발전전시관",
    phone: "02-3425-8900",
    official_url: "https://www.molit.go.kr/molitum/intro.do",
    source: "culture_portal",
    status: "ongoing"
  },
  {
    title_local: "상설전시_이른열매",
    title_en: null,
    venue_name: "대안예술공간 이포",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-01-13",
    end_date: "2025-12-26",
    description: null,
    artists: [],
    exhibition_type: "special",
    admission_fee: "무료",
    venue_address: "서울특별시 종로구 익선동 166-11",
    phone: "02-722-9887",
    official_url: null,
    source: "culture_portal",
    status: "ongoing"
  },
  {
    title_local: "박생광, 예술혼의 소리전",
    title_en: null,
    venue_name: "박생광 미술관",
    venue_city: "진안",
    venue_country: "KR",
    start_date: "2025-04-03",
    end_date: "2025-09-30",
    description: null,
    artists: ["박생광"],
    exhibition_type: "solo",
    admission_fee: "무료",
    venue_address: "전라북도 진안군 백운면 반송리",
    phone: null,
    official_url: null,
    source: "culture_portal",
    status: "ongoing"
  },
  {
    title_local: "한밤의 美술관 산책",
    title_en: null,
    venue_name: "동아대학교석당박물관",
    venue_city: "부산",
    venue_country: "KR",
    start_date: "2025-05-03",
    end_date: "2025-11-22",
    description: null,
    artists: [],
    exhibition_type: "special",
    admission_fee: "무료",
    venue_address: "부산광역시 서구 구덕로 225",
    phone: "051-200-8491~8495",
    official_url: "http://museum.donga.ac.kr",
    source: "culture_portal",
    status: "ongoing"
  },
  {
    title_local: "상시 운영 프로그램 〈아트메이커 스페이스>",
    title_en: null,
    venue_name: "대구미술관",
    venue_city: "대구",
    venue_country: "KR",
    start_date: "2025-04-01",
    end_date: "2025-11-30",
    description: null,
    artists: [],
    exhibition_type: "special",
    admission_fee: "무료",
    venue_address: "대구 수성구 미술관로 40",
    phone: "053-803-7900",
    official_url: "https://artmuseum.daegu.go.kr/",
    source: "culture_portal",
    status: "ongoing"
  },
  {
    title_local: "상시운영 < DRAWING MACHINE >",
    title_en: null,
    venue_name: "창원시립마산문신미술관",
    venue_city: "창원",
    venue_country: "KR",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    description: null,
    artists: [],
    exhibition_type: "special",
    admission_fee: "무료",
    venue_address: "경남 창원시 마산합포구 문신길 147",
    phone: "055-225-7181",
    official_url: "https://moonshin.changwon.go.kr/",
    source: "culture_portal",
    status: "ongoing"
  },
  {
    title_local: "[SeMA 백남준기념관 - 상시] 내일, 세상은 아름다울 것이다",
    title_en: null,
    venue_name: "SeMA 백남준기념관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2024-01-01",
    end_date: "2025-12-31",
    description: null,
    artists: ["백남준"],
    exhibition_type: "solo",
    admission_fee: "무료",
    venue_address: "서울특별시 종로구 종로53길 12-1 백남준기념관",
    phone: "02-2124-5268",
    official_url: "https://sema.seoul.go.kr/kr/visit/nam_june_paik_house",
    source: "culture_portal",
    status: "ongoing"
  },
  {
    title_local: "서울상상나라 특별전 '상상 우주여행'",
    title_en: null,
    venue_name: "서울상상나라",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2024-04-30",
    end_date: "2025-12-31",
    description: null,
    artists: [],
    exhibition_type: "special",
    admission_fee: "36개월 이상 어린이, 성인 4,000원",
    venue_address: "서울특별시 광진구 능동로 216 상상나라 B1층",
    phone: "02-456-0116",
    official_url: "https://www.seoulchildrensmuseum.org/",
    source: "culture_portal",
    status: "ongoing"
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
    console.log('🎨 문화포털 전시 데이터 추가 시작...\n');
    
    let addedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    
    for (const exhibition of CULTURE_PORTAL_EXHIBITIONS) {
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
    console.log(`📋 전체 처리: ${CULTURE_PORTAL_EXHIBITIONS.length}개`);
    
  } catch (error) {
    console.error('전체 오류:', error);
  } finally {
    client.release();
  }
}

// 실행
addExhibitions()
  .then(() => {
    console.log('\n✨ 문화포털 전시 데이터 추가 완료!');
    process.exit(0);
  })
  .catch(error => {
    console.error('실행 오류:', error);
    process.exit(1);
  });