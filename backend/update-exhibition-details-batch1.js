#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 첫 번째 배치 (1-20) 전시의 상세 정보
const exhibitionDetailsBatch1 = [
  {
    title: "Veil Undrawn 열어 둔 베일",
    venue_address: "서울특별시 중구 덕수궁길 61",
    phone_number: "02-120",
    admission_fee: "무료",
    operating_hours: "09:00~20:00(평일), 09:00~19:00(주말·공휴일)"
  },
  {
    title: "우리는 끊임없이 다른 강에 스며든다",
    venue_address: "서울특별시 송파구 올림픽로 300",
    phone_number: "02-2124-5269",
    admission_fee: "무료",
    operating_hours: "10:00~18:00 (월요일 휴관)"
  },
  {
    title: "한국현대미술 거장전 : AGAIN LEGEND AGAIN",
    venue_address: "경기도 광주시 회안대로 816",
    phone_number: "031-766-0119",
    admission_fee: "일반 20,000원 / 청소년 17,000원 / 어린이 15,000원",
    operating_hours: "11:00~19:00"
  },
  {
    title: "빛을 띄워 마음을 밝히다",
    venue_address: "서울특별시 은평구 증산로11가길 8-10",
    phone_number: "02-307-0902",
    admission_fee: "무료",
    operating_hours: "화-일 10:00~18:00 (월요일 휴관)"
  },
  {
    title: "염원을 담아-실로 새겨 부처에 이르다",
    venue_address: "서울특별시 은평구 증산로11가길 8-10",
    phone_number: "02-307-0902",
    admission_fee: "무료",
    operating_hours: "화-일 10:00~18:00 (월요일 휴관)"
  },
  {
    title: "생활문화 조사 연계 특별전 《사진과 전성시대》",
    venue_address: "서울특별시 용산구 서빙고로 135",
    phone_number: "02-3704-3114",
    admission_fee: "무료",
    operating_hours: "10:00~18:00 (월요일 휴관)"
  },
  {
    title: "한글의 숨, 여름의 결",
    venue_address: "서울특별시 용산구 서빙고로 135",
    phone_number: "02-3704-3114",
    admission_fee: "무료",
    operating_hours: "10:00~18:00 (월요일 휴관)"
  },
  {
    title: "[강동문화재단] 에르베 틸레_색색깔깔 뮤지엄",
    venue_address: "서울특별시 강동구 동남로 870",
    phone_number: "02-440-0500",
    admission_fee: "무료",
    operating_hours: "화-일 10:00~18:00 (월요일 휴관)"
  },
  {
    title: "문화역서울284 기획전시 [우리들의 낙원] - Our Enchanting Paradise",
    venue_address: "서울특별시 중구 통일로 1",
    phone_number: "02-3407-3500",
    admission_fee: "무료",
    operating_hours: "10:00~19:00"
  },
  {
    title: "[아마도예술공간] 기획전 《의존하는, 의존하지 않는》",
    venue_address: "서울특별시 영등포구 경인로 775",
    phone_number: "070-7707-5005",
    admission_fee: "무료",
    operating_hours: "09:00~18:00"
  },
  {
    title: "한글의 숨, 여름의 결",
    venue_name: "갤러그리미디어그룹 이(畵)올림",
    venue_address: "서울특별시 강남구 선릉로 438",
    phone_number: "02-521-0805",
    admission_fee: "무료",
    operating_hours: "10:00~18:00"
  },
  {
    title: "글자의 깊이, 1.5mm",
    venue_address: "서울특별시 광진구 아차산로 200",
    phone_number: "02-450-9311",
    admission_fee: "무료",
    operating_hours: "09:00~18:00"
  },
  {
    title: "양민희 <달의 해안>",
    venue_address: "서울특별시 구로구 경인로 662",
    phone_number: "02-2029-1700",
    admission_fee: "무료",
    operating_hours: "10:00~19:00 (월요일 휴관)"
  },
  {
    title: "[2025 신진미술인 지원 프로그램] 박서연 개인전 《접을 풋는 자》",
    venue_address: "서울특별시 종로구 효자로 33",
    phone_number: "02-720-2010",
    admission_fee: "무료",
    operating_hours: "10:00~19:00"
  },
  {
    title: "[2025 신진미술인 지원 프로그램] 박나라 개인전 《제스처들》",
    venue_address: "서울특별시 종로구 효자로 33",
    phone_number: "02-720-2010",
    admission_fee: "무료",
    operating_hours: "10:00~19:00"
  },
  {
    title: "2025 하우스뮤지엄 <조선 남자의 품격, 액자 속의 조선>",
    venue_address: "서울특별시 종로구 율곡로 99",
    phone_number: "02-766-9090",
    admission_fee: "일반 2,000원 / 학생 1,000원",
    operating_hours: "09:00~17:30"
  },
  {
    title: "37°N, 127°E",
    venue_address: "서울특별시 종로구 자하문로7길 63",
    phone_number: "02-541-5701",
    admission_fee: "무료",
    operating_hours: "10:00~18:00"
  },
  {
    title: "[DDP] Prelude to spring_봄을 여는 꽃의 전주곡",
    venue_address: "서울특별시 중구 을지로 281",
    phone_number: "02-2153-0000",
    admission_fee: "무료",
    operating_hours: "10:00~21:00"
  },
  {
    title: "굿페인터스 VOL.2 한여름 소낙비처럼",
    venue_address: "서울특별시 서대문구 서대문로 15",
    phone_number: "02-6949-7001",
    admission_fee: "무료",
    operating_hours: "09:00~18:00"
  },
  {
    title: "2025 경춘선숲길 갤러리 노원×춘천 예술교류 프로젝트 엉겁버린 감각들",
    venue_address: "서울특별시 노원구 화랑로 383",
    phone_number: "02-2289-6870",
    admission_fee: "무료",
    operating_hours: "10:00~18:00"
  }
];

async function updateExhibitionDetailsBatch1() {
  console.log('🔄 전시 상세 정보 업데이트 (배치 1: 1-20)\n');
  console.log(`📊 업데이트할 전시 수: ${exhibitionDetailsBatch1.length}개`);
  console.log('=' .repeat(60));
  
  const client = await pool.connect();
  let updatedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;
  
  try {
    for (const detail of exhibitionDetailsBatch1) {
      try {
        // 전시 찾기 (venue_name이 있는 경우와 없는 경우 구분)
        let query, params;
        if (detail.venue_name) {
          query = 'SELECT id, title_local, venue_name FROM exhibitions WHERE title_local = $1 AND venue_name = $2';
          params = [detail.title, detail.venue_name];
        } else {
          query = 'SELECT id, title_local, venue_name FROM exhibitions WHERE title_local = $1';
          params = [detail.title];
        }
        
        const existingResult = await client.query(query, params);
        
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
          console.log(`   📍 주소: ${detail.venue_address}`);
          console.log(`   📞 전화: ${detail.phone_number}`);
          console.log(`   💰 가격: ${detail.admission_fee}`);
          console.log(`   🕐 시간: ${detail.operating_hours}`);
          console.log('');
          updatedCount++;
        }
        
      } catch (err) {
        console.error(`❌ 오류: ${detail.title} - ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('=' .repeat(60));
    console.log('📊 배치 1 업데이트 결과:');
    console.log(`   ✅ 업데이트 완료: ${updatedCount}개`);
    console.log(`   ❌ 찾을 수 없음: ${notFoundCount}개`);
    console.log(`   ❌ 오류: ${errorCount}개`);
    console.log(`   📥 전체: ${exhibitionDetailsBatch1.length}개`);
    console.log('=' .repeat(60));
    console.log('\n✨ 배치 1 상세 정보 업데이트 완료!');
    
  } catch (error) {
    console.error('❌ 전체 처리 오류:', error.message);
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  await updateExhibitionDetailsBatch1();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = { exhibitionDetailsBatch1 };