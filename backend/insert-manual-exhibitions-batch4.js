#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 문화포털에서 수동 수집한 전시 데이터 - 네 번째 배치 (새로운 전시들)
const manualExhibitionsBatch4 = [
  {
    "title_local": "공원의 낮과 밤 - 만들어진 풍경, 재생되는 자연",
    "title_en": null,
    "venue_name": "소마미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-04-11",
    "end_date": "2025-08-31",
    "description": null,
    "artists": ["강현아", "권다애", "나점수", "박문희", "소수빈", "송미리내", "정재희", "홍이가"],
    "exhibition_type": "group",
    "status": "ongoing",
    "website_url": null,
    "venue_address": "서울특별시 송파구 올림픽로 424",
    "phone_number": "02-425-1077",
    "admission_fee": "개인 3,000원(연령구분없음), 단체 20명이상 50%할인",
    "operating_hours": "10:00~18:00(17:30 입장마감)"
  },
  {
    "title_local": "푸릇푸릇프렌즈_빠씨를 찾아서",
    "title_en": null,
    "venue_name": "소마미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-04-11",
    "end_date": "2025-08-31",
    "description": null,
    "artists": ["김연익", "김혜민", "노동식", "이진형", "장진연", "푸릇푸릇아트랩", "프로젝트그룹엽", "Hexter", "LaLa Lee"],
    "exhibition_type": "group",
    "status": "ongoing",
    "website_url": null,
    "venue_address": "서울특별시 송파구 올림픽로 424",
    "phone_number": "02-425-1077",
    "admission_fee": "개인 3,000원(연령구분없음), 단체 20명이상 50%할인",
    "operating_hours": "10:00~18:00(17:00 입장마감)"
  },
  {
    "title_local": "체험전_올림픽조각체험프로젝트 #01",
    "title_en": null,
    "venue_name": "소마미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-04-11",
    "end_date": "2025-08-31",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": null,
    "venue_address": "서울특별시 송파구 올림픽로 424",
    "phone_number": "02-425-1077",
    "admission_fee": "개인 3,000원(연령구분없음)",
    "operating_hours": "10:00~18:00(17:30 입장마감)"
  },
  {
    "title_local": "모네에서 앤디워홀까지 : 요하네스버그 아트 갤러리 특별전",
    "title_en": "monet to warhol",
    "venue_name": "세종문화회관 미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-16",
    "end_date": "2025-08-31",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "https://www.sejongpac.or.kr/organization/main/contents.do?menuNo=500142",
    "venue_address": "서울특별시 종로구 세종대로 175 세종문화회관 미술관",
    "phone_number": "02-399-1000",
    "admission_fee": "성인 20,000원, 청소년 16,000원, 어린이 12,000원",
    "operating_hours": "10:00~20:00"
  },
  {
    "title_local": "새나라 새미술: 조선 전기 미술 대전",
    "title_en": "Art of Early Joseon",
    "venue_name": "국립중앙박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-10",
    "end_date": "2025-08-31",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": null,
    "venue_address": "서울특별시 용산구 서빙고로 137 국립중앙박물관 특별전시실",
    "phone_number": null,
    "admission_fee": null,
    "operating_hours": null
  },
  {
    "title_local": "조선 전기 미술(가제)",
    "title_en": "Art of Early Joseon",
    "venue_name": "국립중앙박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-10",
    "end_date": "2025-08-31",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "http://www.museum.go.kr",
    "venue_address": "서울특별시 용산구 서빙고로 137 국립중앙박물관",
    "phone_number": "02-2077-9000",
    "admission_fee": null,
    "operating_hours": "월·화·목·금·일 10:00~18:00 / 수·토 10:00~21:00"
  },
  {
    "title_local": "<Time back in your hands> Fori Sim - NINETAILS - Hedwig gallery",
    "title_en": "Time back in your hands",
    "venue_name": "현대백화점 무역센터점",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-16",
    "end_date": "2025-08-31",
    "description": null,
    "artists": ["Fori Sim", "NINETAILS"],
    "exhibition_type": "group",
    "status": "ongoing",
    "website_url": "https://www.ehyundai.com/newPortal/DP/DP000000_V.do?branchCd=B00122000",
    "venue_address": "서울특별시 강남구 테헤란로 517 현대백화점 무역센터점",
    "phone_number": "02-552-2233",
    "admission_fee": "무료",
    "operating_hours": "현대백화점 무역센터점 운영시간 참조"
  },
  {
    "title_local": "숲속도서관 <도서 전시> 25년 7월~8월",
    "title_en": null,
    "venue_name": "종로문화재단",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-01",
    "end_date": "2025-08-31",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "http://jfac.or.kr/",
    "venue_address": "서울특별시 종로구 삼청공원 숲속도서관(서울 종로구 북촌로 134-3)",
    "phone_number": "02-734-3900",
    "admission_fee": "무료",
    "operating_hours": "화요일~일요일 10:00~19:00 *매주 월요일 휴관"
  },
  {
    "title_local": "김성엽 개인전 <Sand Garden>",
    "title_en": "Sand Garden",
    "venue_name": "현대백화점 무역센터점",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-08-01",
    "end_date": "2025-08-31",
    "description": null,
    "artists": ["김성엽"],
    "exhibition_type": "solo",
    "status": "ongoing",
    "website_url": "https://www.ehyundai.com/newPortal/DP/DP000000_V.do?branchCd=B00122000",
    "venue_address": "서울특별시 강남구 테헤란로 517 현대백화점 무역센터점",
    "phone_number": "02-552-2233",
    "admission_fee": "무료",
    "operating_hours": "현대백화점 무역센터점 운영시간 참조"
  },
  {
    "title_local": "[국립민속박물관] 오늘도, 기념: 우리가 기념품을 간직하는 이유",
    "title_en": null,
    "venue_name": "국립민속박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-27",
    "end_date": "2025-09-04",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "http://www.nfm.go.kr/",
    "venue_address": "서울특별시 종로구 삼청로 37 국립민속박물관",
    "phone_number": "02-3704-3114",
    "admission_fee": "무료",
    "operating_hours": "09:00~18:00 *매주 화요일 9:00~20:00"
  },
  {
    "title_local": "[종랑아트센터] 실감미디어로 보는 그림책 [수박 수영장]",
    "title_en": null,
    "venue_name": "종랑아트센터",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2024-11-06",
    "end_date": "2025-09-06",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "https://www.jnfac.or.kr/art/index",
    "venue_address": "서울특별시 중랑구 망우로 353 지하2층 종랑아트센터",
    "phone_number": "02-3407-6541",
    "admission_fee": "무료",
    "operating_hours": "10:00~17:30"
  },
  {
    "title_local": "[허준박물관] 조선의 의사들, 인(仁)을 실천하다",
    "title_en": null,
    "venue_name": "허준박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-03-21",
    "end_date": "2025-09-07",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "https://culture.gangseo.seoul.kr",
    "venue_address": "서울특별시 강서구 허준로 87 허준박물관",
    "phone_number": "02-3661-8686",
    "admission_fee": "성인 1,000원 / 학생 및 군경 500원",
    "operating_hours": "10:00~18:00"
  },
  {
    "title_local": "현대카드 컬처프로젝트 29 톰 삭스 전",
    "title_en": "Tom Sachs: SPACE PROGRAM: INFINITY ∞",
    "venue_name": "DDP 동대문디자인플라자",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-04-25",
    "end_date": "2025-09-07",
    "description": null,
    "artists": ["톰 삭스", "Tom Sachs"],
    "exhibition_type": "solo",
    "status": "ongoing",
    "website_url": "http://www.ddp.or.kr/",
    "venue_address": "서울특별시 중구 을지로 281",
    "phone_number": "02-2153-0000",
    "admission_fee": "성인 25,000원",
    "operating_hours": "10:00~20:00"
  },
  {
    "title_local": "2025 Summer Project 《허윤희: 영원은 순간 속에》",
    "title_en": "THE ETERNAL WITHIN A MOMENT",
    "venue_name": "성북구립미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-08",
    "end_date": "2025-09-07",
    "description": null,
    "artists": ["허윤희"],
    "exhibition_type": "solo",
    "status": "ongoing",
    "website_url": "http://sma.sbculture.or.kr/",
    "venue_address": "서울특별시 성북구 화랑로13길 102",
    "phone_number": "02-6925-5040",
    "admission_fee": "무료",
    "operating_hours": "10:00~18:00 (월요일 휴관)"
  },
  {
    "title_local": "Return to Earth",
    "title_en": "Return to Earth",
    "venue_name": "가나아트",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-25",
    "end_date": "2025-09-07",
    "description": null,
    "artists": ["SHIOTA CHIHARU"],
    "exhibition_type": "solo",
    "status": "ongoing",
    "website_url": "http://www.ganaart.com",
    "venue_address": "서울특별시 종로구 평창31길 28",
    "phone_number": "02-720-1020",
    "admission_fee": "무료",
    "operating_hours": "10:00~19:00"
  },
  {
    "title_local": "KF XR 갤러리 기획전 <공명하는 문자>",
    "title_en": "MOVING LETTERS",
    "venue_name": "KF갤러리",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-03-31",
    "end_date": "2025-09-12",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "http://www.kf.or.kr/?menuno=3274",
    "venue_address": "서울특별시 중구 을지로5길 26",
    "phone_number": "02-2151-6500",
    "admission_fee": "무료",
    "operating_hours": "10:00~18:00"
  },
  {
    "title_local": "2025 막간: 경계에 머무는 시선",
    "title_en": null,
    "venue_name": "국립현대미술관 서울관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-11",
    "end_date": "2025-09-13",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "http://www.mmca.go.kr/",
    "venue_address": "서울특별시 종로구 삼청로 30",
    "phone_number": "02-3701-9500",
    "admission_fee": "무료",
    "operating_hours": "10:00~18:00 (수·토 10:00~21:00)"
  },
  {
    "title_local": "마나 모아나 - 신성한 바다의 예술, 오세아니아",
    "title_en": "MANA MOANA",
    "venue_name": "국립중앙박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-04-30",
    "end_date": "2025-09-14",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "http://www.museum.go.kr",
    "venue_address": "서울특별시 용산구 서빙고로 137 국립중앙박물관",
    "phone_number": "02-2077-9000",
    "admission_fee": "성인 5,000원 / 청소년 및 어린이 3,000원",
    "operating_hours": "월·화·목·금·일 10:00~18:00 / 수·토 10:00~21:00 / ※1월 1일, 설날, 추석 당일 휴관"
  },
  {
    "title_local": "도상(途上)의 추상(抽象) - 세속의 길에서 추상하다",
    "title_en": "Deep into Abstraction - On the Way",
    "venue_name": "서울대학교 미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-19",
    "end_date": "2025-09-14",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "http://www.snumoa.org/",
    "venue_address": "서울특별시 관악구 관악로 1 서울대학교 미술관",
    "phone_number": "02-880-9504",
    "admission_fee": "무료",
    "operating_hours": "화-일 10:00~18:00 / 월요일 휴관"
  },
  {
    "title_local": "바티칸 선교박람회 개최 100주년 기념 특별기획전 <아니마문디: 세상의 영혼들>",
    "title_en": "Anima Mundi - Souls of the world",
    "venue_name": "서소문성지 역사박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-05",
    "end_date": "2025-09-14",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing",
    "website_url": "https://www.seosomun.org",
    "venue_address": "서울특별시 중구 칠패로 5 서소문성지 역사박물관",
    "phone_number": "02-3147-2401",
    "admission_fee": "무료",
    "operating_hours": "09:30~17:30(오후 5시까지 입장가능)"
  }
];

async function insertManualExhibitionsBatch4() {
  console.log('🎨 문화포털 수동 수집 전시 데이터 입력 (배치 4 - 새로운 전시들 61-80)\n');
  console.log(`📊 총 ${manualExhibitionsBatch4.length}개 전시 데이터`);
  console.log('=' .repeat(60));
  
  const client = await pool.connect();
  let savedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;
  
  try {
    for (const exhibition of manualExhibitionsBatch4) {
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
        
        // 데이터 삽입 (상세 정보 포함)
        await client.query(`
          INSERT INTO exhibitions (
            title_local, title_en, venue_name, venue_city, venue_country,
            start_date, end_date, description, status, exhibition_type,
            artists, source, website_url, venue_address, phone_number,
            admission_fee, operating_hours, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP
          )
        `, [
          exhibition.title_local,
          exhibition.title_en || exhibition.title_local,
          exhibition.venue_name,
          exhibition.venue_city,
          exhibition.venue_country,
          exhibition.start_date,
          exhibition.end_date,
          exhibition.description,
          exhibition.status,
          exhibition.exhibition_type,
          exhibition.artists,
          'culture_portal_manual_batch4',
          exhibition.website_url,
          exhibition.venue_address,
          exhibition.phone_number,
          exhibition.admission_fee,
          exhibition.operating_hours
        ]);
        
        console.log(`✅ 저장: ${exhibition.title_local}`);
        console.log(`   📍 주소: ${exhibition.venue_address}`);
        console.log(`   💰 가격: ${exhibition.admission_fee}`);
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
    console.log(`   📥 전체: ${manualExhibitionsBatch4.length}개`);
    console.log('=' .repeat(60));
    console.log('\n✨ 문화포털 수동 수집 데이터 입력 완료! (배치 4)');
    
  } catch (error) {
    console.error('❌ 전체 처리 오류:', error.message);
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  await insertManualExhibitionsBatch4();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = { manualExhibitionsBatch4 };