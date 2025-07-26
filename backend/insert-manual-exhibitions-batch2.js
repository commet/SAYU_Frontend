#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 문화포털에서 수동 수집한 전시 데이터 - 두 번째 배치
const manualExhibitionsBatch2 = [
  {
    "title_local": "박노수미술관 개관11주년 기념전시 「간원일기」",
    "title_en": null,
    "venue_name": "종로구립 박노수미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2024-05-10",
    "end_date": "2025-07-31",
    "description": null,
    "artists": [],
    "exhibition_type": "collection",
    "status": "ongoing"
  },
  {
    "title_local": "[2차] 장난감으로 만나는 독립운동가",
    "title_en": null,
    "venue_name": "서울교육박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2024-09-11",
    "end_date": "2025-07-31",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "[서울] 차정숙 개인전 <CHROMA DOT: 시간의 밀도>",
    "title_en": "CHROMA DOT",
    "venue_name": "현대백화점 무역센터점",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-02",
    "end_date": "2025-07-31",
    "description": null,
    "artists": ["차정숙"],
    "exhibition_type": "solo",
    "status": "ongoing"
  },
  {
    "title_local": "우리옛돌박물관 기획전 <정의 바다>",
    "title_en": null,
    "venue_name": "우리옛돌박물관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-12",
    "end_date": "2025-07-31",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "2025 서울시립과학관 생태화 수강생 작품 전시회 [봄으로의 초대]",
    "title_en": null,
    "venue_name": "서울시립과학관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-20",
    "end_date": "2025-07-31",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "「예술X기술」 전시 <캡차시티 Captcha_city> 차유나",
    "title_en": "Captcha_city",
    "venue_name": "솔숨센터",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-08",
    "end_date": "2025-07-31",
    "description": null,
    "artists": ["차유나"],
    "exhibition_type": "solo",
    "status": "ongoing"
  },
  {
    "title_local": "권재나, 이채, 최제이 <자연을 훔친 붓질>",
    "title_en": null,
    "venue_name": "슈페리어갤러리",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-09",
    "end_date": "2025-07-31",
    "description": null,
    "artists": ["권재나", "이채", "최제이"],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "《도와줘! 네 개의 목구멍으로부터의 하이퍼텍스트》",
    "title_en": null,
    "venue_name": "한국예술종합학교",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-16",
    "end_date": "2025-07-31",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "정유미 초대전 《블루스 Blues》",
    "title_en": "Blues",
    "venue_name": "한원미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-29",
    "end_date": "2025-08-01",
    "description": null,
    "artists": ["정유미"],
    "exhibition_type": "solo",
    "status": "ongoing"
  },
  {
    "title_local": "서리풀 휴(休) 갤러리 <금빛 흙터 : 금빛 치유>",
    "title_en": null,
    "venue_name": "서리풀 아트홀",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-07",
    "end_date": "2025-08-02",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "SNOW WHITE BLOOM 보테니컬아트 작가그룹전",
    "title_en": "SNOW WHITE BLOOM",
    "venue_name": "디크레센도",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-22",
    "end_date": "2025-08-02",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "이재혁의 멸종위기 새 프로젝트: 페이퍼 아트로 만나는 멸종위기 새들의 초상",
    "title_en": null,
    "venue_name": "사비나미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-03",
    "end_date": "2025-08-03",
    "description": null,
    "artists": ["이재혁"],
    "exhibition_type": "solo",
    "status": "ongoing"
  },
  {
    "title_local": "《생태의 집 - 한옥》",
    "title_en": "Hanok, Living with Nature",
    "venue_name": "사비나미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-05-03",
    "end_date": "2025-08-03",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "드리프팅 스테이션 - 찬미와 애도에 관한 행성간 다종 오페라",
    "title_en": "Drifting Station",
    "venue_name": "아르코미술관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-27",
    "end_date": "2025-08-03",
    "description": null,
    "artists": [],
    "exhibition_type": "special",
    "status": "ongoing"
  },
  {
    "title_local": "청풍전, 바람의 축제",
    "title_en": null,
    "venue_name": "갤러리 인사 1010",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-30",
    "end_date": "2025-08-04",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "소목장 소병진과 제자 동행전",
    "title_en": null,
    "venue_name": "국가무형문화재전수교육관",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-28",
    "end_date": "2025-08-05",
    "description": null,
    "artists": ["소병진"],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "Tremor&Gaze",
    "title_en": "Tremor&Gaze",
    "venue_name": "히든엠갤러리",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-17",
    "end_date": "2025-08-07",
    "description": null,
    "artists": [],
    "exhibition_type": "group",
    "status": "ongoing"
  },
  {
    "title_local": "[문화철도959] 임주작가 조혜은 개인전 <미래에게 말을 걸다>",
    "title_en": null,
    "venue_name": "문화철도 959",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-21",
    "end_date": "2025-08-08",
    "description": null,
    "artists": ["조혜은"],
    "exhibition_type": "solo",
    "status": "ongoing"
  },
  {
    "title_local": "권아람 | 피버 아이",
    "title_en": "FEVER EYE",
    "venue_name": "강남문화재단",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-06-24",
    "end_date": "2025-08-09",
    "description": null,
    "artists": ["권아람"],
    "exhibition_type": "solo",
    "status": "ongoing"
  },
  {
    "title_local": "Skinship",
    "title_en": "Skinship",
    "venue_name": "PS CENTER",
    "venue_city": "서울",
    "venue_country": "KR",
    "start_date": "2025-07-15",
    "end_date": "2025-08-09",
    "description": null,
    "artists": ["Yeon Jinyeong"],
    "exhibition_type": "solo",
    "status": "ongoing"
  }
];

async function insertManualExhibitionsBatch2() {
  console.log('🎨 문화포털 수동 수집 전시 데이터 입력 (배치 2)\n');
  console.log(`📊 총 ${manualExhibitionsBatch2.length}개 전시 데이터`);
  console.log('=' .repeat(60));
  
  const client = await pool.connect();
  let savedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;
  
  try {
    for (const exhibition of manualExhibitionsBatch2) {
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
          'culture_portal_manual_batch2'
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
    console.log(`   📥 전체: ${manualExhibitionsBatch2.length}개`);
    console.log('=' .repeat(60));
    console.log('\n✨ 문화포털 수동 수집 데이터 입력 완료! (배치 2)');
    
  } catch (error) {
    console.error('❌ 전체 처리 오류:', error.message);
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  await insertManualExhibitionsBatch2();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = { manualExhibitionsBatch2 };