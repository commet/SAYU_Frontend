const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importDDPShowroomAdultZone2025() {
  console.log('🎨 DDP 《DDP SHOWROOM: 어른이 보호구역》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: 'DDP SHOWROOM: 어른이 보호구역',
      title_en: 'DDP SHOWROOM: Adult Protection Zone',
      subtitle: '그네 타며 힐링하는 미디어 아트 전시',
      
      // 날짜
      start_date: '2025-07-28',
      end_date: '2025-08-30',
      exhibition_type: 'media_art',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: 'DDP 동대문디자인플라자',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '디자인랩 1층 DDP 쇼룸 스테이지',
      
      // 운영 정보
      operating_hours: '매일 10:00-19:00',
      admission_fee: '무료',
      
      // 전시 설명
      description: `쉼이 필요한 어른이들을 위한 특별한 힐링 공간! 그네 타며 힐링하는 미디어 아트 전시부터 귀염뽀짝 캐릭터들과 체험, 굿즈까지!

[메인 콘텐츠: 그네와 미디어 아트가 만나다]
몽환적인 사운드와 함께 그네를 타며 중력·속도·시간 등 과학법칙 속 인문철학을 예술적으로 체험하는 전시입니다.

• 미디어아트 레이블 'VERSEDAY'와 뮤지션 '오혁'의 특별 협업
• 그네를 타며 느끼는 몰입형 미디어 아트 체험
• 과학과 예술, 철학이 융합된 독특한 경험

[서브 콘텐츠: 귀여운 캐릭터들과 체험 + 굿즈존]
어른이들의 마음을 지켜줄 특별한 캐릭터들이 DDP 쇼룸에 모였습니다!

참여 캐릭터:
• 우주먼지 (@pettydust)
• 왈맹이 (@waalmaeng)
• 파파고파파 (@papa.go.papa)
• 헐랭이물개 (@nopaper.studio)

[전시 특징]
• 인터랙티브 미디어 아트 체험
• 캐릭터 체험존 및 포토존
• 캐릭터 굿즈 쇼핑 공간
• "충동구매는 어른이보호구역에서 감사합니다" 컨셉의 굿즈존

[관람 포인트]
1. 그네를 타며 체험하는 독특한 미디어 아트
2. 힐링과 위로를 주는 캐릭터 콘텐츠
3. 어른이들을 위한 놀이와 쉼의 공간
4. 예술과 기술, 감성이 결합된 복합 문화 체험

이 전시는 일상에 지친 어른들에게 잠시나마 동심으로 돌아가 쉬어갈 수 있는 특별한 공간을 제공합니다.`,
      
      // 아티스트/협업 정보
      artists: ['VERSEDAY', '오혁'],
      
      // 메타데이터
      source: 'ddp_official',
      source_url: 'https://www.ddp.or.kr',
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
    console.log('🏛️ 장소:', exhibitionData.venue_address);
    console.log('⏰ 운영시간:', exhibitionData.operating_hours);
    console.log('💰 관람료: 무료');
    console.log('🎨 협업 아티스트:', exhibitionData.artists.join(', '));
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importDDPShowroomAdultZone2025();