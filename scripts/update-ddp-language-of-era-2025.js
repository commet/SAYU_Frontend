const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateDDPLanguageOfEra() {
  console.log('🎨 DDP 《시대의 언어》 전시 정보 업데이트 시작...\n');
  
  try {
    // 기존 전시 ID
    const exhibitionId = '0ac0e167-1687-43b1-b9c3-579d4d94c734';
    
    const updateData = {
      // 날짜 수정 (14일로 변경)
      start_date: '2025-07-14',
      end_date: '2025-10-10',
      
      // 추가 정보
      subtitle: 'AI와 함께 재해석하는 아날로그 시대의 디자인 언어',
      venue_address: 'DDP 뮤지엄 3층 둘레길갤러리',
      operating_hours: '10:00-20:00',
      admission_fee: '무료',
      
      // 상세 설명
      description: `기술의 발전은 인간의 삶을 혁신적으로 변화시켜 왔습니다. 그러나 그 변화의 속도만큼이나, 우리는 종종 한 시대를 함께 살아온 사물들과 그 사물이 품고 있던 감성과 의미를 잊곤 합니다. 이 전시는 타자기, 라디오, 텔레비전, 전화기 등 1920년대부터 최근까지 사용되었던 아날로그 시대의 생활디자인 사물들을 통해, 기술이 인간의 일상과 감각, 그리고 디자인 언어에 어떤 흔적을 남겼는지를 되짚어 봅니다.

[전시 개요]
이 사물들은 단순한 도구를 넘어, 각 시대의 기술과 문화, 그리고 사용자의 감성을 반영하는 '시대의 언어'였습니다. 타자기의 기계적 리듬, 라디오의 따뜻한 음색, 다이얼 전화기의 손끝 감각은 그 시대 사람들의 삶의 방식과 소통의 방식을 말해주는 디자인 언어이자 감각적 기호였습니다.

[현대적 의미]
오늘날 스마트폰 하나로 많은 기능이 통합된 현실 속에서, 다양한 기기들이 개별적으로 존재하던 시절의 경험은 점차 희미해지고 있습니다. 그러나 바로 그 '잊힌 언어' 속에 인간과 기술, 사물 사이의 섬세한 상호작용과 디자인 철학이 담겨 있습니다.

[AI와의 협업]
이번 전시는 인공지능(AI)이 기획 과정에 직접 참여함으로써, 과거의 기술 언어를 오늘의 기술 언어로 재해석하는 실험적 시도를 담고 있습니다. 전시의 형식 자체가 하나의 메시지가 되며, 기술과 디자인이 어떻게 시대의 말하기 방식—곧 언어—로 작동해왔는지를 보여줍니다.

[전시 구성]
• 1920년대부터 최근까지의 생활디자인 사물 전시
• 타자기, 라디오, 텔레비전, 전화기 등 아날로그 기기
• DDP 소장품을 중심으로 한 큐레이션
• AI 기술을 활용한 전시 기획 및 해석

[관람 포인트]
DDP가 소장한 생활디자인 사물들을 통해, 우리는 기술의 진보와 그 이면에 숨겨진 감각과 감성, 그리고 인간 중심의 디자인 철학을 다시금 마주하게 됩니다. [시대의 언어]가 과거의 사물을 통해 현재를 성찰하고, AI와 함께 미래의 언어를 상상하는 장이 되기를 바랍니다.`,
      
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
    console.log('📍 전시명: 시대의 언어');
    console.log('📅 전시 기간: 2025-07-14 ~ 2025-10-10');
    console.log('🏛️ 장소: DDP 뮤지엄 3층 둘레길갤러리');
    console.log('⏰ 운영시간: 10:00-20:00');
    console.log('💰 관람료: 무료');
    console.log('\n📝 추가된 정보:');
    console.log('- 부제목 추가');
    console.log('- 상세 전시 설명 추가');
    console.log('- 운영시간 및 상세 주소 추가');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
updateDDPLanguageOfEra();