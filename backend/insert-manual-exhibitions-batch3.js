#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 문화포털에서 수동 수집한 전시 데이터 - 세 번째 배치 (웹사이트 URL 포함)
const manualExhibitionsBatch3 = [
  {
    "title_local": "《온빛》 전시",
    "title_en": "ONBIT",
    "venue_name": "갤러리 인사 1010",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-31",
    "end_date": "2025-08-11",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "upcoming",
    "website_url": "https://www.instagram.com/insa1010"
  },
  {
    "title_local": "고채연 개인전 'FÊTE FANTASTIQUE'",
    "title_en": "FÊTE FANTASTIQUE",
    "venue_name": "갤러리 인사 1010",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-31",
    "end_date": "2025-08-11",
    "description": null,
    "artists": ["고채연"],
    "exhibition_type": "solo",
    "status": "upcoming",
    "website_url": "https://www.instagram.com/insa1010"
  },
  {
    "title_local": "[2025 신진미술인 지원 프로그램] 임지우 개인전 《오늘은 네가 그만 울었으면 좋겠다》",
    "title_en": null,
    "venue_name": "통의동 보안여관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-31",
    "end_date": "2025-08-18",
    "description": null,
    "artists": ["임지우"],
    "exhibition_type": "solo",
    "status": "upcoming",
    "website_url": "http://www.boan1942.com"
  },
  {
    "title_local": "[2025 신진미술인 지원 프로그램] 이예성 개인전 《구병모의 뱀》",
    "title_en": null,
    "venue_name": "통의동 보안여관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-08-01",
    "end_date": "2025-08-18",
    "description": null,
    "artists": ["이예성"],
    "exhibition_type": "solo",
    "status": "upcoming",
    "website_url": "http://www.boan1942.com"
  },
  {
    "title_local": "김도균 개인전 <한낮의 알리바이 High Noon Alibi>",
    "title_en": "High Noon Alibi",
    "venue_name": "아르코미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-08-08",
    "end_date": "2025-10-12",
    "description": null,
    "artists": ["김도균"],
    "exhibition_type": "solo",
    "status": "upcoming",
    "website_url": "https://www.arko.or.kr/arkomuseum"
  },
  {
    "title_local": "서울미술관 특별전《김환기 - 바다의 낯빛》",
    "title_en": null,
    "venue_name": "서울미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-04",
    "end_date": "2025-11-09",
    "description": null,
    "artists": ["김환기"],
    "exhibition_type": "solo",
    "status": "ongoing",
    "website_url": "https://seoulmuseum.org"
  },
  {
    "title_local": "서울미술관 프로젝트 공간《PUSH YOUR LUCK》",
    "title_en": "PUSH YOUR LUCK",
    "venue_name": "서울미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-07",
    "end_date": "2025-12-14",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "ongoing",
    "website_url": "https://seoulmuseum.org"
  },
  {
    "title_local": "세상을 보는 눈: 한원미술관 소장품전",
    "title_en": null,
    "venue_name": "한원미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-01-16",
    "end_date": "2025-08-01",
    "description": null,
    "artists": [],
    "exhibition_type": "collection",
    "status": "ongoing",
    "website_url": "http://www.hanwon.org"
  },
  {
    "title_local": "「당신에게 보내는 신호」",
    "title_en": "Signal to You",
    "venue_name": "서울생활문화센터 서교 서교스케어",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-08-01",
    "end_date": "2025-08-31",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "upcoming",
    "website_url": "https://seogyo.sfac.or.kr"
  },
  {
    "title_local": "어뮤즈원뮤지엄 개관기념전 《아폴로네르와 아방가르드》",
    "title_en": "Apollinaire and the Avant-garde",
    "venue_name": "어뮤즈원뮤지엄",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-30",
    "end_date": "2025-10-31",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "https://amuseummuseum.com"
  },
  {
    "title_local": "영혼의 여정: 고대 이집트 미라전",
    "title_en": "Journey to the Afterlife: Ancient Egyptian Mummies",
    "venue_name": "국립중앙박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-20",
    "end_date": "2025-08-24",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "https://www.museum.go.kr"
  },
  {
    "title_local": "리처드 프린스 전시",
    "title_en": "Richard Prince",
    "venue_name": "리움미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-05",
    "end_date": "2025-12-01",
    "description": null,
    "artists": ["리처드 프린스"],
    "exhibition_type": "solo",
    "status": "ongoing",
    "website_url": "https://www.leeum.org"
  },
  {
    "title_local": "토마스 루프: d.o.pe.",
    "title_en": "Thomas Ruff: d.o.pe.",
    "venue_name": "PKM 갤러리",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-12",
    "end_date": "2025-08-03",
    "description": null,
    "artists": ["토마스 루프"],
    "exhibition_type": "solo",
    "status": "ongoing",
    "website_url": "https://www.pkmgallery.com"
  },
  {
    "title_local": "모네와 친구들, 빛을 그리다",
    "title_en": "Monet & Friends - Alive",
    "venue_name": "롯데뮤지엄",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-28",
    "end_date": "2025-10-12",
    "description": null,
    "artists": ["클로드 모네"],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "https://www.lottemuseum.com"
  },
  {
    "title_local": "불타는 욕망",
    "title_en": "Burning Desire",
    "venue_name": "서울시립미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-16",
    "end_date": "2025-11-09",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "https://sema.seoul.go.kr"
  },
  {
    "title_local": "마음의 공간: K-미술의 내면성",
    "title_en": "Space of Mind: The Interiority of K-Art",
    "venue_name": "서울시립미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-21",
    "end_date": "2025-08-10",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "https://sema.seoul.go.kr"
  },
  {
    "title_local": "디올 스피릿",
    "title_en": "Dior Spirit",
    "venue_name": "롯데뮤지엄",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-04-28",
    "end_date": "2025-08-25",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "https://www.lottemuseum.com"
  },
  {
    "title_local": "조선, 역병에 맞서다",
    "title_en": null,
    "venue_name": "국립고궁박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-08",
    "end_date": "2025-08-10",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "https://www.gogung.go.kr"
  },
  {
    "title_local": "한지, 천 년의 비밀을 품다",
    "title_en": null,
    "venue_name": "국립민속박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-02-19",
    "end_date": "2025-08-18",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "https://www.nfm.go.kr"
  }
];

async function insertManualExhibitionsBatch3() {
  console.log('🎨 문화포털 수동 수집 전시 데이터 입력 (배치 3 - 웹사이트 URL 포함)\n');
  console.log(`📊 총 ${manualExhibitionsBatch3.length}개 전시 데이터`);
  console.log('=' .repeat(60));
  
  const client = await pool.connect();
  let savedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;
  
  try {
    for (const exhibition of manualExhibitionsBatch3) {
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
        
        // 데이터 삽입 (website_url 포함)
        await client.query(`
          INSERT INTO exhibitions (
            title_local, title_en, venue_name, venue_city, venue_country,
            start_date, end_date, description, status, exhibition_type,
            artists, source, website_url, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP
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
          'culture_portal_manual_batch3',
          exhibition.website_url
        ]);
        
        console.log(`✅ 저장: ${exhibition.title_local} ${exhibition.website_url ? '(웹사이트 있음)' : '(웹사이트 없음)'}`);
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
    console.log(`   📥 전체: ${manualExhibitionsBatch3.length}개`);
    console.log('=' .repeat(60));
    console.log('\n✨ 문화포털 수동 수집 데이터 입력 완료! (배치 3)');
    
  } catch (error) {
    console.error('❌ 전체 처리 오류:', error.message);
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  await insertManualExhibitionsBatch3();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = { manualExhibitionsBatch3 };