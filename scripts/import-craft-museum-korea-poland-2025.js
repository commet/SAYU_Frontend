const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importCraftMuseumKoreaPoland2025() {
  console.log('🎨 서울공예박물관 《집, 옷을 입다》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '집, 옷을 입다',
      title_en: 'House, Dressed in Textiles',
      subtitle: '한국-폴란드 섬유공예 교류전',
      
      // 날짜
      start_date: '2025-08-26',
      end_date: '2025-10-19',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '서울공예박물관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 종로구 율곡로3길 4 (안국동) 전시1동 1층 및 안내동',
      
      // 전시 설명
      description: `서울공예박물관은 폴란드 아담 미츠키에비츠 문화원과 함께, 양국의 전통 섬유문화를 통해 계절의 감각과 삶의 지혜를 되돌아보는 《집, 옷을 입다》전을 개최합니다.

섬유는 단순한 장식이나 기능을 넘어, 사람과 자연, 공간을 잇는 감각의 매개체였습니다. 서로 다른 기후와 문화 속에서 발전해온 한국과 폴란드의 섬유공예는 <공간의 호흡>과 <계절의 조율>이라는 두 부제를 통해 자연과 더불어 살아가는 지혜와 감각을 새롭게 일깨웁니다.

자연의 결을 따라 집을 짓고, 손의 온기로 공간을 채워온 두 나라의 섬유 문화를 통해, 기후위기 시대에 지속가능한 삶의 방식을 함께 생각해보는 계기가 되시길 바랍니다.

[전시 구성]
1. 공간의 호흡
   - 섬유가 만들어내는 공간의 변화와 확장
   - 한국과 폴란드의 실내 섬유 문화

2. 계절의 조율
   - 계절에 따른 섬유의 변화
   - 자연과 조화를 이루는 섬유 공예

[전시 특징]
• 한국-폴란드 국제 교류전
• 폴란드 아담 미츠키에비츠 문화원 협력
• 양국의 전통 섬유문화 비교 전시
• 사람과 자연, 공간을 잇는 섬유의 역할 조명
• 기후위기 시대의 지속가능한 삶 모색
• 자연과 더불어 살아가는 지혜와 감각
• 직물공예와 현대공예의 만남`,
      
      // 전시 타입 정보
      genres: ['직물공예', '현대공예', '섬유공예'],
      tags: ['섬유공예', '기후위기', '실내문화', '국제교류', '한국-폴란드', '지속가능성'],
      
      // 연락처 정보
      contact_info: '대표전화: 02-6450-7000',
      phone_number: '02-6450-7000',
      
      // 메타데이터
      source: 'seoul_craft_museum',
      source_url: 'https://craftmuseum.seoul.go.kr',
      collected_at: new Date().toISOString(),
      ai_verified: false,
      ai_confidence: 0,
      view_count: 0
    };

    // 데이터 삽입
    const { data, error } = await supabase
      .from('exhibitions')
      .insert([exhibitionData])
      .select();

    if (error) {
      console.error('❌ 전시 데이터 삽입 실패:', error);
      return;
    }

    console.log('✅ 전시 데이터 성공적으로 추가됨!');
    console.log('📍 전시명:', exhibitionData.title_local);
    console.log('📅 전시 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
    console.log('🏛️ 장소:', exhibitionData.venue_name);
    console.log('📍 위치: 전시1동 1층 및 안내동');
    console.log('🌍 협력: 폴란드 아담 미츠키에비츠 문화원');
    console.log('🧵 전시소재: 섬유');
    console.log('🔑 키워드: 섬유공예, 기후위기, 실내문화');
    console.log('📞 대표전화: 02-6450-7000');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importCraftMuseumKoreaPoland2025();