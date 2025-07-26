#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 문화포털에서 수동 수집한 전시 데이터
const manualExhibitions = [
  {
    "title_local": "Veil Undrawn 열어 둔 베일",
    "title_en": "Veil Undrawn",
    "venue_name": "서울문화재단 본관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-01",
    "end_date": "2025-07-26",
    "description": null,
    "artists": ["김수진", "정서나", "정영수"],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "우리는 끊임없이 다른 강에 스며든다", // 수정됨: 꿈임없이 -> 끊임없이
    "title_en": "Rivers Rivers Rivers Into Other Rivers Into Other Rivers",
    "venue_name": "서울시립미술아카이브",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-03-06",
    "end_date": "2025-07-27",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "한국현대미술 거장전 : AGAIN LEGEND AGAIN",
    "title_en": "AGAIN LEGEND AGAIN",
    "venue_name": "모다갤러리",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-04-22",
    "end_date": "2025-07-27",
    "description": null,
    "artists": [],
    "exhibition_type": "collection",
    "status": "ongoing"
  },
  {
    "title_local": "빛을 띄워 마음을 밝히다",
    "title_en": "Light Awakens the Heart",
    "venue_name": "서울공예박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-04-25",
    "end_date": "2025-07-27",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "염원을 담아-실로 새겨 부처에 이르다",
    "title_en": "Sacred Stitches Leading to Nirvana",
    "venue_name": "서울공예박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-03",
    "end_date": "2025-07-27",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "생활문화 조사 연계 특별전 《사진과 전성시대》",
    "title_en": null,
    "venue_name": "국립민속박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-14",
    "end_date": "2025-07-27",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "한글의 숨, 여름의 결",
    "title_en": null,
    "venue_name": "세종이야기 충무공이야기 전시장",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-01",
    "end_date": "2025-07-27",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "[강동문화재단] 에르베 틸레_색색깔깔 뮤지엄",
    "title_en": null,
    "venue_name": "강동아트센터",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-20",
    "end_date": "2025-07-27",
    "description": null,
    "artists": ["에르베 틸레"],
    "exhibition_type": "solo",
    "status": "ongoing"
  },
  {
    "title_local": "문화역서울284 기획전시 [우리들의 낙원] - Our Enchanting Paradise",
    "title_en": "Our Enchanting Paradise",
    "venue_name": "문화역서울 284",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-13",
    "end_date": "2025-07-27",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "[아마도예술공간] 기획전 《의존하는, 의존하지 않는》",
    "title_en": null,
    "venue_name": "아마도 예술 공간(Amado Art Space)",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-27",
    "end_date": "2025-07-27",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "한글의 숨, 여름의 결",
    "title_en": null,
    "venue_name": "갤러그리미디어그룹 이(畵)올림",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-01",
    "end_date": "2025-07-27",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "글자의 깊이, 1.5mm",
    "title_en": "The Depth of the Characters, 1.5mm",
    "venue_name": "서울역사박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-01",
    "end_date": "2025-07-27",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "양민희 <달의 해안>",
    "title_en": "THE COAST OF THE MOON",
    "venue_name": "강남문화재단",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-03",
    "end_date": "2025-07-27",
    "description": null,
    "artists": ["양민희"],
    "exhibition_type": "solo",
    "status": "ongoing"
  },
  {
    "title_local": "[2025 신진미술인 지원 프로그램] 박서연 개인전 《접을 풋는 자》",
    "title_en": null,
    "venue_name": "통의동 보안여관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-03",
    "end_date": "2025-07-27",
    "description": null,
    "artists": ["박서연"],
    "exhibition_type": "solo",
    "status": "ongoing"
  },
  {
    "title_local": "[2025 신진미술인 지원 프로그램] 박나라 개인전 《제스처들》",
    "title_en": "GESTURES",
    "venue_name": "통의동 보안여관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-04",
    "end_date": "2025-07-27",
    "description": null,
    "artists": ["박나라"],
    "exhibition_type": "solo",
    "status": "ongoing"
  },
  {
    "title_local": "2025 하우스뮤지엄 <조선 남자의 품격, 액자 속의 조선>",
    "title_en": null,
    "venue_name": "운현궁",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-22",
    "end_date": "2025-07-27",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "37°N, 127°E",
    "title_en": "37°N, 127°E",
    "venue_name": "갤러리 그림손",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-23",
    "end_date": "2025-07-29",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "[DDP] Prelude to spring_봄을 여는 꽃의 전주곡",
    "title_en": "Prelude to spring",
    "venue_name": "DDP 동대문디자인플라자",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-01",
    "end_date": "2025-07-30",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "굿페인터스 VOL.2 한여름 소낙비처럼",
    "title_en": null,
    "venue_name": "서울생활문화센터 서교 서교스케어",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-01",
    "end_date": "2025-07-30",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "2025 경춘선숲길 갤러리 노원×춘천 예술교류 프로젝트 엉겁버린 감각들",
    "title_en": null,
    "venue_name": "경춘선숲길 갤러리",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-12",
    "end_date": "2025-07-30",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "강승희 <새벽, 여백을 열다>",
    "title_en": null,
    "venue_name": "노화랑",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-16",
    "end_date": "2025-07-30",
    "description": null,
    "artists": ["강승희"],
    "exhibition_type": "solo",
    "status": "ongoing"
  }
];

async function insertManualExhibitions() {
  console.log('🎨 문화포털 수동 수집 전시 데이터 입력\n');
  console.log(`📊 총 ${manualExhibitions.length}개 전시 데이터`);
  console.log('=' .repeat(60));
  
  const client = await pool.connect();
  let savedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;
  
  try {
    for (const exhibition of manualExhibitions) {
      try {
        // 중복 확인
        const existing = await client.query(
          'SELECT id FROM exhibitions WHERE title_local = $1 AND venue_name = $2 AND start_date = $3',
          [exhibition.title_local, exhibition.venue_name, exhibition.start_date]
        );
        
        if (existing.rows.length > 0) {
          console.log(`⏭️  중복: ${exhibition.title_local}`);
          duplicateCount++;
          continue;
        }
        
        // 데이터 삽입
        await client.query(`
          INSERT INTO exhibitions (
            title_local, title_en, venue_name, venue_city, venue_country,
            start_date, end_date, description, status, exhibition_type,
            artists, source, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP
          )
        `, [
          exhibition.title_local,
          exhibition.title_en || exhibition.title_local, // title_en이 null이면 title_local 사용
          exhibition.venue_name,
          exhibition.venue_city,
          exhibition.venue_country,
          exhibition.start_date,
          exhibition.end_date,
          exhibition.description,
          exhibition.status,
          exhibition.exhibition_type,
          exhibition.artists,
          'culture_portal_manual'
        ]);
        
        console.log(`✅ 저장: ${exhibition.title_local}`);
        savedCount++;
        
      } catch (err) {
        console.error(`❌ 오류: ${exhibition.title_local} - ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 처리 결과:');
    console.log(`   ✅ 신규 저장: ${savedCount}개`);
    console.log(`   ⏭️  중복 제외: ${duplicateCount}개`);
    console.log(`   ❌ 오류: ${errorCount}개`);
    console.log(`   📥 전체: ${manualExhibitions.length}개`);
    console.log('=' .repeat(60));
    console.log('\n✨ 문화포털 수동 수집 데이터 입력 완료!');
    
  } catch (error) {
    console.error('❌ 전체 처리 오류:', error.message);
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  await insertManualExhibitions();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = { manualExhibitions };