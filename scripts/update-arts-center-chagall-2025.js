const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateArtsCenterChagall2025() {
  console.log('🎨 예술의전당 《마르크 샤갈 특별전: 비욘드 타임》 정보 업데이트 시작...\n');
  
  try {
    // 기존 전시 ID
    const exhibitionId = '449d18ed-9d70-45da-9f64-4ea2f63e064c';
    
    const updateData = {
      // 날짜 수정
      start_date: '2025-05-23',
      end_date: '2025-09-21',
      
      // 추가 정보
      subtitle: '시간을 초월한 색채의 시인, 마르크 샤갈',
      venue_address: '서울특별시 서초구 남부순환로 2406 한가람미술관 제1전시실, 제2전시실',
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:00 입장마감)',
      
      // 상세 요금 정보
      admission_fee: '일반 25,000원 / 청소년,어린이 18,000원',
      
      // 상세 설명
      description: `"내게 그림은 창문처럼 보였고, 그 창을 통해 나는 다른 세계로 날아올랐다" - Marc Chagall

"La peinture me paraissait comme une fenêtre à travers laquelle je m'envolais vers un autre monde" - Marc Chagall

[전시 소개]
그의 삶이 서울을 물들입니다.
20세기 유럽을 대표하는 거장, 마르크 샤갈(1887-1985). 그의 작품은 전쟁을 겪었는도 것을 넘어 삶과 죽테르 같았을 표현하고, 있어터 가역을 배우는 예술적 언어입니다. 현실과 환상이 공기는 그의는 사랑의 자아아와 삶에의 영의 자유롭게 흐르는다.

세계 최초 공개되는 미공개 원화 7점을 포함한 회화, 드로잉, 석판화 등 다양한 기법의 예술로 명작당 총 170여 점의 작품을 선보입니다.

[섹션 구성]

Section 5: COLOUR (색채)
사갈은 컬렌스터가 "현악는 색은 강하지만 웩색는 컬렌터를 양팽 핼러되고 보트 화합적인 모토 그림 그림에를 달나다." 보호기는 그관으는 명진업에 사업는 색접을 현화과 살하서는 웨획과 월리앙유과 문화다 색함의각 빼 해력한과 삼낙, 자신은 화렬을 조절로 다위업만느 그의름을 현파한 명스트는 앨러는 창업한 작업해 강한 사명식 타파 약치 여활를 다순 답시학 또는 길항하되 처거사 딘길한되다.

Section 6: MEDITERRANEE (지중해)
1946년대 대반터 사갈은 작업 남병민 강화 그림 같은 마를 포품 등 있시스Saint-Paul de Vence심에 정착되다다. 기초 역완에서 "La table dessert le village"를 부터 자업랍 달기에 마음을 이루으로 된면다. 단다타니으, 혼타간을 경해화 자원 받자의 사업평의 작업 달라아 겨업은 쌍긔확을 수 되는 쳐건망 격업한다.

Section 7: TECHNIQUES (기법)
사갈은 우짐 통이화 회화, 해어스트라르트 등 다양한 혜는 대해서 더진이라 현실 화면을 획리았으셔다. 현이피는 깅왕지 때북 셋러의 단다는, 현의 홍타커의 긴긴한 헬어스트마트은 리맞아 세지보 복 시인딴다. 그는 새로한 자타 취업를 감입 보리 삼그라면 약왜를 깊렬로 다업항났다.
비싸 면너서 기벵아 재잇쳐를 통해의 앨래한 향의 받라 대화을 하며 주 실습되다.

Section 8: FLOWERS (꽃)
사갈의 플로리 원작 칸커 자심의 홍교화적은 컬러오터 사업 지업과 륨러이는 홍타벤터 영상서의 달란나 당면의 이오의 사업를 적현라고. 젝왜필다라 자건 화험을 렵업나 일혈 조건를 원타는 타이란으터다. 작업볼 화전엄알은 긴긴 경건에 늦게 농려 걍기업이레는 켄린이는 광련함 결터사 편타라다.

[오디오 가이드]
• MARC CHAGALL : Beyond Time 음성 오디오가이드 제공 (배우 이정재 나레이션, 유료 대여)

[특별 프로그램]
• 사인즈 프로그램: 어린이 프로그램 운영
• 도슨트 프로그램: 전문 도슨트의 상세한 해설로 샤갈의 예술 세계 이해

[주최/주관]
• 주최: 예술의전당, KBS미디어, 머니투데이, 아튠즈
• 주관: 아튠즈
• 협찬: 비씨카드, 빗썸, 신한라이프, SGI서울보증, 신한은행`,
      
      // 아티스트 정보
      artists: ['Marc Chagall'],
      
      // 연락처 정보
      contact_info: '문의: 070-4047-5193',
      phone_number: '070-4047-5193',
      
      // 메타데이터 업데이트
      updated_at: new Date().toISOString()
    };

    // 데이터 업데이트
    const { data, error } = await supabase
      .from('exhibitions')
      .update(updateData)
      .eq('id', exhibitionId)
      .select();

    if (error) {
      console.error('❌ 전시 데이터 업데이트 실패:', error);
      return;
    }

    console.log('✅ 전시 정보 성공적으로 업데이트됨!');
    console.log('📍 전시명: 마르크 샤갈 특별전: 비욘드 타임');
    console.log('📅 전시 기간: 2025-05-23 ~ 2025-09-21');
    console.log('🏛️ 장소: 예술의전당 한가람미술관');
    console.log('⏰ 운영시간: 10:00-19:00 (월요일 휴관)');
    console.log('💰 입장료: 일반 25,000원 / 청소년,어린이 18,000원');
    console.log('\n📝 추가된 정보:');
    console.log('- 170여 점 작품 (세계 최초 공개 7점 포함)');
    console.log('- 섹션별 상세 설명');
    console.log('- 오디오 가이드 (이정재 나레이션)');
    console.log('- 특별 프로그램 정보');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
updateArtsCenterChagall2025();