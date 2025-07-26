#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 새로운 전시 데이터
const NEW_EXHIBITIONS = [
  {
    title_local: "2025 여름 전시 <열기>",
    title_en: "2025 Summer EXHIBITION",
    venue_name: "세종문화회관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-06-21",
    end_date: "2025-09-19",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "http://www.sejongpac.or.kr/",
    address: "서울특별시 종로구 세종대로 175 세종문화회관",
    phone: "02-399-1000",
    admission_fee: 0,
    source: "manual",
    source_url: "http://www.sejongpac.or.kr/"
  },
  {
    title_local: "마르크 샤갈 특별전: 비욘드 타임",
    title_en: "MARC CHAGALL Beyond Time",
    venue_name: "예술의전당(한가람미술관)",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-05-23",
    end_date: "2025-09-21",
    description: null,
    artists: ["마르크 샤갈"],
    exhibition_type: "solo",
    status: "ongoing",
    official_url: "https://www.sac.or.kr/site/main/content/exhibitionHallMain",
    address: "서울특별시 서초구 남부순환로 2406 예술의전당(한가람미술관)",
    phone: "02-580-1300",
    admission_fee: 25000,
    source: "manual",
    source_url: "https://www.sac.or.kr"
  },
  {
    title_local: "[서울시립과학관] 과학관 공동기획 순회전 [과학마을 탐구여행]",
    title_en: null,
    venue_name: "서울시립과학관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-07-15",
    end_date: "2025-09-21",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "upcoming",
    official_url: "https://science.seoul.go.kr/main",
    address: "서울특별시 노원구 한글비석로 160 서울시립과학관",
    phone: "02-970-4500",
    admission_fee: 0,
    source: "manual",
    source_url: "https://science.seoul.go.kr"
  },
  {
    title_local: "필라코리아 2025",
    title_en: "PHILAKOREA 2025 WORLD STAMP EXHIBITION",
    venue_name: "코엑스 마곡",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-09-17",
    end_date: "2025-09-21",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "upcoming",
    official_url: null,
    address: "우정사업본부",
    phone: null,
    admission_fee: 2000,
    source: "manual",
    source_url: null
  },
  {
    title_local: "앤서니 브라운展 마스터 오브 스토리텔링",
    title_en: "Anthony Browne Exhibition: A Master of Storytelling",
    venue_name: "예술의전당(한가람미술관)",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-05-02",
    end_date: "2025-09-28",
    description: null,
    artists: ["앤서니 브라운"],
    exhibition_type: "solo",
    status: "ongoing",
    official_url: "https://www.sac.or.kr/site/main/content/exhibitionHallMain",
    address: "서울특별시 서초구 남부순환로 2406 예술의전당(한가람미술관)",
    phone: "02-730-4368",
    admission_fee: 22000,
    source: "manual",
    source_url: "https://www.sac.or.kr"
  },
  {
    title_local: "라이징 북서울",
    title_en: "RISING NORTH, SEOUL",
    venue_name: "서울생활사박물관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-05-16",
    end_date: "2025-09-28",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://museum.seoul.go.kr/sulm/index.do",
    address: "서울특별시 노원구 동일로174길 27 서울생활사박물관",
    phone: "02-3399-2900",
    admission_fee: 0,
    source: "manual",
    source_url: "https://museum.seoul.go.kr/sulm"
  },
  {
    title_local: "캐서린 번하드 展",
    title_en: "Some of All My Work",
    venue_name: "예술의전당(한가람미술관)",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-06-06",
    end_date: "2025-09-28",
    description: null,
    artists: ["캐서린 번하드"],
    exhibition_type: "solo",
    status: "ongoing",
    official_url: "https://www.sac.or.kr/site/main/content/exhibitionHallMain",
    address: "서울특별시 서초구 남부순환로 2406 예술의전당(한가람미술관)",
    phone: "02-733-2798",
    admission_fee: 22000,
    source: "manual",
    source_url: "https://www.sac.or.kr"
  },
  {
    title_local: "자문밖아트레지던시 제5기 입주작가展 《그 곳에 도착하기 전 Almost There》",
    title_en: "Almost There",
    venue_name: "서울교육박물관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-07-15",
    end_date: "2025-09-28",
    description: null,
    artists: [],
    exhibition_type: "group",
    status: "upcoming",
    official_url: "http://edumuseum.sen.go.kr/edumuseum_index.jsp",
    address: "서울특별시 종로구 북촌로5길 48 서울교육박물관",
    phone: "02-2011-5782",
    admission_fee: 0,
    source: "manual",
    source_url: "http://edumuseum.sen.go.kr"
  },
  {
    title_local: "시대의 언어",
    title_en: "The Language of an Era",
    venue_name: "DDP 동대문디자인플라자",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-07-14",
    end_date: "2025-10-10",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "upcoming",
    official_url: null,
    address: "서울 | DDP 동대문디자인플라자",
    phone: "02-2153-0000",
    admission_fee: 0,
    source: "manual",
    source_url: null
  },
  {
    title_local: "청계천의 낮과 밤",
    title_en: "The Day and Night of Cheonggyecheon",
    venue_name: "청계천박물관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-05-02",
    end_date: "2025-10-12",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://museum.seoul.go.kr/cgcm/index.do",
    address: "서울특별시 성동구 청계천로 530 청계천박물관",
    phone: "02-2286-3410",
    admission_fee: 0,
    source: "manual",
    source_url: "https://museum.seoul.go.kr/cgcm"
  },
  {
    title_local: "《광채 光彩: 시작의 순간들》",
    title_en: null,
    venue_name: "서울시립 사진미술관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-05-29",
    end_date: "2025-10-12",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://sema.seoul.go.kr/",
    address: "서울시립 사진미술관",
    phone: "02-2124-7600",
    admission_fee: 0,
    source: "manual",
    source_url: "https://sema.seoul.go.kr"
  },
  {
    title_local: "스토리지 스토리 Storage Story",
    title_en: "Storage Story",
    venue_name: "서울시립 사진미술관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-05-29",
    end_date: "2025-10-12",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://sema.seoul.go.kr/kr/visit/photosema",
    address: "서울특별시 도봉구 마들로13길 68 서울시립 사진미술관",
    phone: "02-2124-7600",
    admission_fee: 0,
    source: "manual",
    source_url: "https://sema.seoul.go.kr"
  },
  {
    title_local: "광복80주년 가나아트컬렉션 특별전 《서사: 별을 노래하는 마음으로》",
    title_en: null,
    venue_name: "서울시립미술관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-03-20",
    end_date: "2025-10-26",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://sema.seoul.go.kr/",
    address: "서울특별시 중구 덕수궁길 61 서울시립미술관 서소문본관",
    phone: "02-2124-8800",
    admission_fee: 0,
    source: "manual",
    source_url: "https://sema.seoul.go.kr"
  },
  {
    title_local: "2025 SMA 아뜰리에 《먹의 춤, 사람의 노래》",
    title_en: null,
    venue_name: "성북정보도서관",
    venue_city: "서울",
    venue_country: "KR",
    start_date: "2025-04-10",
    end_date: "2025-11-01",
    description: null,
    artists: [],
    exhibition_type: "special",
    status: "ongoing",
    official_url: "https://www.facebook.com/woljangsegkfriends/",
    address: "서울특별시 성북구 화랑로18자길 13 성북도서관 내 지하1층",
    phone: "02-6906-3146",
    admission_fee: 0,
    source: "manual",
    source_url: "https://www.facebook.com/woljangsegkfriends"
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
    console.log('🎨 SAYU 전시 데이터 추가 시작...\n');
    
    // 트랜잭션 제거 - 각 전시 개별 처리
    
    let addedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    
    for (const exhibition of NEW_EXHIBITIONS) {
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
              exhibition.address,
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
            exhibition.title_en || cleanedTitle,  // title_en이 없으면 title_local 사용
            venueId,
            exhibition.venue_name,
            exhibition.venue_city,
            exhibition.venue_country || 'KR',
            exhibition.start_date,
            exhibition.end_date,
            exhibition.description,
            exhibition.artists || [],
            exhibition.exhibition_type || 'special',
            exhibition.admission_fee ? exhibition.admission_fee.toString() : '무료',
            exhibition.official_url,
            exhibition.source || 'manual',
            exhibition.source_url,
            exhibition.status || 'upcoming'
          ]
        );
        
        console.log(`✅ 추가: ${cleanedTitle} @ ${exhibition.venue_name}`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ 오류: ${exhibition.title_local} - ${error.message}`);
        errorCount++;
      }
    }
    
    // 트랜잭션 제거됨
    
    console.log('\n📊 최종 결과:');
    console.log(`✅ 추가된 전시: ${addedCount}개`);
    console.log(`⚠️  중복된 전시: ${duplicateCount}개`);
    console.log(`❌ 오류 발생: ${errorCount}개`);
    console.log(`📋 전체 처리: ${NEW_EXHIBITIONS.length}개`);
    
  } catch (error) {
    console.error('전체 오류:', error);
  } finally {
    client.release();
  }
}

// 실행
addExhibitions()
  .then(() => {
    console.log('\n✨ 전시 데이터 추가 완료!');
    process.exit(0);
  })
  .catch(error => {
    console.error('실행 오류:', error);
    process.exit(1);
  });