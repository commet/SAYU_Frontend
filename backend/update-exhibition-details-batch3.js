#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 세 번째 배치 (41-60) 전시의 상세 정보 - 실제로는 19개 전시 (60번은 41번과 중복)
const exhibitionDetailsBatch3 = [
  {
    title: "《온빛》 전시",
    venue_address: "서울특별시 중구 퇴계로36길 2",
    phone_number: null,
    admission_fee: "무료",
    operating_hours: "09:00~18:00"
  },
  {
    title: "고채연 개인전 'FÊTE FANTASTIQUE'",
    venue_address: "서울특별시 중구 퇴계로36길 2",
    phone_number: null,
    admission_fee: "무료",
    operating_hours: "09:00~18:00"
  },
  {
    title: "[2025 신진미술인 지원 프로그램] 임지우 개인전 《오늘은 네가 그만 울었으면 좋겠다》",
    venue_address: "서울특별시 종로구 효자로 33",
    phone_number: "02-720-2010",
    admission_fee: "무료",
    operating_hours: "10:00~19:00"
  },
  {
    title: "[2025 신진미술인 지원 프로그램] 이예성 개인전 《구병모의 뱀》",
    venue_address: "서울특별시 종로구 효자로 33",
    phone_number: "02-720-2010",
    admission_fee: "무료",
    operating_hours: "10:00~19:00"
  },
  {
    title: "김도균 개인전 <한낮의 알리바이 High Noon Alibi>",
    venue_address: "서울특별시 서초구 남부순환로 2364",
    phone_number: "02-3446-5614",
    admission_fee: "무료",
    operating_hours: "화-일 11:00~20:00"
  },
  {
    title: "서울미술관 특별전《김환기 - 바다의 낯빛》",
    venue_address: "서울특별시 종로구 대학로 102",
    phone_number: "02-394-8735",
    admission_fee: "성인 15,000원 / 청소년 12,000원 / 어린이 10,000원",
    operating_hours: "10:00~19:00"
  },
  {
    title: "서울미술관 프로젝트 공간《PUSH YOUR LUCK》",
    venue_address: "서울특별시 종로구 대학로 102",
    phone_number: "02-394-8735",
    admission_fee: "무료",
    operating_hours: "10:00~19:00"
  },
  {
    title: "세상을 보는 눈: 한원미술관 소장품전",
    venue_address: "서울특별시 서초구 남부순환로 2406",
    phone_number: "02-598-6246",
    admission_fee: "무료",
    operating_hours: "10:00~19:00"
  },
  {
    title: "「당신에게 보내는 신호」",
    venue_address: "서울특별시 서대문구 서대문로 15",
    phone_number: "02-6949-7001",
    admission_fee: "무료",
    operating_hours: "09:00~18:00"
  },
  {
    title: "어뮤즈원뮤지엄 개관기념전 《아폴로네르와 아방가르드》",
    venue_address: "서울특별시 강남구 압구정로30길 68",
    phone_number: "02-512-8865",
    admission_fee: "성인 20,000원 / 청소년 15,000원 / 어린이 12,000원",
    operating_hours: "10:00~20:00"
  },
  {
    title: "영혼의 여정: 고대 이집트 미라전",
    venue_address: "서울특별시 용산구 서빙고로 137",
    phone_number: "02-2077-9000",
    admission_fee: "성인 20,000원 / 청소년 18,000원 / 어린이 16,000원",
    operating_hours: "10:00~18:00 (월요일 휴관)"
  },
  {
    title: "리처드 프린스 전시",
    venue_address: "서울특별시 용산구 한남대로27길 60",
    phone_number: "02-2014-6900",
    admission_fee: "성인 20,000원 / 학생 16,000원",
    operating_hours: "10:00~18:00 (월요일 휴관)"
  },
  {
    title: "토마스 루프: d.o.pe.",
    venue_address: "서울특별시 종로구 소격동 165",
    phone_number: "02-734-9467",
    admission_fee: "무료",
    operating_hours: "10:00~18:30 (일·월요일 휴관)"
  },
  {
    title: "모네와 친구들, 빛을 그리다",
    venue_address: "서울특별시 송파구 올림픽로 300",
    phone_number: "1544-0331",
    admission_fee: "성인 25,000원 / 청소년 20,000원 / 어린이 18,000원",
    operating_hours: "일-목 10:00~20:00 / 금-토 10:00~21:00"
  },
  {
    title: "불타는 욕망",
    venue_address: "서울특별시 중구 덕수궁길 61",
    phone_number: "02-2124-8800",
    admission_fee: "무료",
    operating_hours: "평일 09:00~20:00 / 주말 09:00~19:00 (월요일 휴관)"
  },
  {
    title: "마음의 공간: K-미술의 내면성",
    venue_address: "서울특별시 중구 덕수궁길 61",
    phone_number: "02-2124-8800",
    admission_fee: "무료",
    operating_hours: "평일 09:00~20:00 / 주말 09:00~19:00 (월요일 휴관)"
  },
  {
    title: "디올 스피릿",
    venue_address: "서울특별시 송파구 올림픽로 300",
    phone_number: "1544-0331",
    admission_fee: "성인 25,000원 / 청소년 20,000원 / 어린이 18,000원",
    operating_hours: "일-목 10:00~20:00 / 금-토 10:00~21:00"
  },
  {
    title: "조선, 역병에 맞서다",
    venue_address: "서울특별시 종로구 효자로 12",
    phone_number: "02-3701-7500",
    admission_fee: "무료",
    operating_hours: "09:00~18:00 (월요일 휴관)"
  },
  {
    title: "한지, 천 년의 비밀을 품다",
    venue_address: "서울특별시 용산구 서빙고로 135",
    phone_number: "02-3704-3114",
    admission_fee: "무료",
    operating_hours: "10:00~18:00 (월요일 휴관)"
  }
];

async function updateExhibitionDetailsBatch3() {
  console.log('🔄 전시 상세 정보 업데이트 (배치 3: 세 번째 배치 전시들)\n');
  console.log(`📊 업데이트할 전시 수: ${exhibitionDetailsBatch3.length}개`);
  console.log('=' .repeat(60));
  
  const client = await pool.connect();
  let updatedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;
  
  try {
    for (const detail of exhibitionDetailsBatch3) {
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
    console.log('📊 배치 3 업데이트 결과:');
    console.log(`   ✅ 업데이트 완료: ${updatedCount}개`);
    console.log(`   ❌ 찾을 수 없음: ${notFoundCount}개`);
    console.log(`   ❌ 오류: ${errorCount}개`);
    console.log(`   📥 전체: ${exhibitionDetailsBatch3.length}개`);
    console.log('=' .repeat(60));
    console.log('\n✨ 배치 3 상세 정보 업데이트 완료!');
    
  } catch (error) {
    console.error('❌ 전체 처리 오류:', error.message);
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  await updateExhibitionDetailsBatch3();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = { exhibitionDetailsBatch3 };