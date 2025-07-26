#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 두 번째 배치 (21-40) 전시의 상세 정보
const exhibitionDetailsBatch2 = [
  {
    title: "강승희 <새벽, 여백을 열다>",
    venue_address: "서울특별시 종로구 인사동길 44",
    phone_number: "02-738-8866",
    admission_fee: "무료",
    operating_hours: "10:00~18:00 (일요일 휴관)"
  },
  {
    title: "박노수미술관 개관11주년 기념전시 「간원일기」",
    venue_address: "서울특별시 종로구 옥인1길 34",
    phone_number: "02-2148-4171",
    admission_fee: "일반 3,000원 / 학생 2,000원",
    operating_hours: "10:00~18:00 (월요일 휴관)"
  },
  {
    title: "[2차] 장난감으로 만나는 독립운동가",
    venue_address: "서울특별시 종로구 대학로 164",
    phone_number: "02-311-1444",
    admission_fee: "무료",
    operating_hours: "09:00~18:00 (평일), 09:00~17:00 (주말)"
  },
  {
    title: "[서울] 차정숙 개인전 <CHROMA DOT: 시간의 밀도>",
    venue_address: "서울특별시 영등포구 여의대로 77-1",
    phone_number: "02-2626-2114",
    admission_fee: "무료",
    operating_hours: "10:30~20:00"
  },
  {
    title: "우리옛돌박물관 기획전 <정의 바다>",
    venue_address: "서울특별시 성북구 대사관로13길 66",
    phone_number: "02-986-1001",
    admission_fee: "일반 7,000원 / 학생 5,000원",
    operating_hours: "10:00~18:00 (월요일 휴관)"
  },
  {
    title: "2025 서울시립과학관 생태화 수강생 작품 전시회 [봄으로의 초대]",
    venue_address: "서울특별시 노원구 한글비석로 160",
    phone_number: "02-970-4500",
    admission_fee: "무료",
    operating_hours: "평일 09:30~17:30, 주말 09:30~18:30 (월요일 휴관)"
  },
  {
    title: "「예술X기술」 전시 <캡차시티 Captcha_city> 차유나",
    venue_address: "서울특별시 관악구 신림로3길 35",
    phone_number: "02-877-5447",
    admission_fee: "무료",
    operating_hours: "화-일 10:00~19:00"
  },
  {
    title: "권재나, 이채, 최제이 <자연을 훔친 붓질>",
    venue_address: "서울특별시 강남구 테헤란로87길 36",
    phone_number: null,
    admission_fee: "무료",
    operating_hours: "10:00~18:00"
  },
  {
    title: "《도와줘! 네 개의 목구멍으로부터의 하이퍼텍스트》",
    venue_address: "서울특별시 성북구 화랑로13길 17",
    phone_number: "02-746-9681",
    admission_fee: "무료",
    operating_hours: "10:00~19:00"
  },
  {
    title: "정유미 초대전 《블루스 Blues》",
    venue_address: "서울특별시 서초구 남부순환로 2406",
    phone_number: "02-598-6246",
    admission_fee: "무료",
    operating_hours: "10:00~19:00"
  },
  {
    title: "서리풀 휴(休) 갤러리 <금빛 흙터 : 금빛 치유>",
    venue_address: "서울특별시 서초구 서초대로 398",
    phone_number: null,
    admission_fee: "무료",
    operating_hours: "09:00~18:00"
  },
  {
    title: "SNOW WHITE BLOOM 보테니컬아트 작가그룹전",
    venue_address: null,
    phone_number: null,
    admission_fee: "무료",
    operating_hours: null
  },
  {
    title: "이재혁의 멸종위기 새 프로젝트: 페이퍼 아트로 만나는 멸종위기 새들의 초상",
    venue_address: "서울특별시 종로구 삼청로 125-1",
    phone_number: "02-736-4371",
    admission_fee: "일반 5,000원 / 학생 3,000원",
    operating_hours: "10:00~19:00"
  },
  {
    title: "《생태의 집 - 한옥》",
    venue_address: "서울특별시 종로구 삼청로 125-1",
    phone_number: "02-736-4371",
    admission_fee: "일반 5,000원 / 학생 3,000원",
    operating_hours: "10:00~19:00"
  },
  {
    title: "드리프팅 스테이션 - 찬미와 애도에 관한 행성간 다종 오페라",
    venue_address: "서울특별시 서초구 남부순환로 2364",
    phone_number: "02-3446-5614",
    admission_fee: "무료",
    operating_hours: "화-일 11:00~20:00"
  },
  {
    title: "청풍전, 바람의 축제",
    venue_address: "서울특별시 중구 퇴계로36길 2",
    phone_number: null,
    admission_fee: "무료",
    operating_hours: "09:00~18:00"
  },
  {
    title: "소목장 소병진과 제자 동행전",
    venue_address: "서울특별시 중구 동호로 268",
    phone_number: "02-2261-0500",
    admission_fee: "무료",
    operating_hours: "09:00~18:00"
  },
  {
    title: "Tremor&Gaze",
    venue_address: "서울특별시 강남구 논현로26길 39",
    phone_number: "02-511-6388",
    admission_fee: "무료",
    operating_hours: "11:00~18:00"
  },
  {
    title: "[문화철도959] 임주작가 조혜은 개인전 <미래에게 말을 걸다>",
    venue_address: "서울특별시 구로구 경인로 472",
    phone_number: "02-867-0959",
    admission_fee: "무료",
    operating_hours: "11:00~18:00"
  },
  {
    title: "Skinship",
    venue_address: "서울특별시 성북구 정릉로 77",
    phone_number: null,
    admission_fee: "무료",
    operating_hours: "10:00~18:00"
  }
];

async function updateExhibitionDetailsBatch2() {
  console.log('🔄 전시 상세 정보 업데이트 (배치 2: 21-40)\n');
  console.log(`📊 업데이트할 전시 수: ${exhibitionDetailsBatch2.length}개`);
  console.log('=' .repeat(60));
  
  const client = await pool.connect();
  let updatedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;
  
  try {
    for (const detail of exhibitionDetailsBatch2) {
      try {
        // 전시 찾기
        const existingResult = await client.query(
          'SELECT id, title_local, venue_name FROM exhibitions WHERE title_local = $1',
          [detail.title]
        );
        
        if (existingResult.rows.length === 0) {
          console.log(`❌ 찾을 수 없음: ${detail.title}`);
          notFoundCount++;
          continue;
        }
        
        const exhibition = existingResult.rows[0];
        
        // 상세 정보 업데이트
        const updateResult = await client.query(`
          UPDATE exhibitions SET 
            venue_address = $1,
            phone_number = $2,
            admission_fee = $3,
            operating_hours = $4,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
        `, [
          detail.venue_address,
          detail.phone_number,
          detail.admission_fee,
          detail.operating_hours,
          exhibition.id
        ]);
        
        if (updateResult.rowCount > 0) {
          console.log(`✅ 업데이트: ${exhibition.title_local}`);
          console.log(`   📍 주소: ${detail.venue_address || '정보 없음'}`);
          console.log(`   📞 전화: ${detail.phone_number || '정보 없음'}`);
          console.log(`   💰 가격: ${detail.admission_fee}`);
          console.log(`   🕐 시간: ${detail.operating_hours || '정보 없음'}`);
          console.log('');
          updatedCount++;
        }
        
      } catch (err) {
        console.error(`❌ 오류: ${detail.title} - ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('=' .repeat(60));
    console.log('📊 배치 2 업데이트 결과:');
    console.log(`   ✅ 업데이트 완료: ${updatedCount}개`);
    console.log(`   ❌ 찾을 수 없음: ${notFoundCount}개`);
    console.log(`   ❌ 오류: ${errorCount}개`);
    console.log(`   📥 전체: ${exhibitionDetailsBatch2.length}개`);
    console.log('=' .repeat(60));
    console.log('\n✨ 배치 2 상세 정보 업데이트 완료!');
    
  } catch (error) {
    console.error('❌ 전체 처리 오류:', error.message);
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  await updateExhibitionDetailsBatch2();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = { exhibitionDetailsBatch2 };