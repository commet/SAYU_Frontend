const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateDDPTomSachs() {
  console.log('🎨 DDP 《현대카드 컬처프로젝트 29 톰 삭스 전》 정보 업데이트 시작...\n');
  
  try {
    // 기존 전시 ID
    const exhibitionId = '2b8ac592-137f-416f-90ce-1f6fef772bd4';
    
    const updateData = {
      // 날짜 수정
      start_date: '2025-04-25',
      end_date: '2025-09-07',
      
      // 추가 정보
      subtitle: '스페이스 프로그램: 무한대',
      venue_address: '뮤지엄 전시1관 (B2F)',
      operating_hours: '10:00-20:00 (관람 종료 1시간 전 입장 마감)',
      
      // 상세 요금 정보
      admission_fee: `성인: 20,000원 (만 19세-64세)
청소년: 15,000원 (만 13세-18세)
어린이: 13,000원 (만 7세-12세)
특별권: 10,000원 (미취학 아동 만 4-6세, 경로우대 만 65세 이상, 장애인, 독립·국가 유공자)
무료입장: 48개월 미만 (증빙서류 필참)`,
      
      // 상세 설명
      description: `음악, 연극, 미술, 무용, 건축 등 다양한 분야의 혁신적인 문화 아이콘을 소개하는 현대카드 컬처프로젝트입니다. 2011년부터 아티스트 위켄드(The Weeknd), 아리아나 그란데(Ariana Grande) 등의 공연과 영화감독 팀 버튼(Tim Burton), 스탠리 큐브릭(Stanley Kubrick) 등의 전시를 통해 세계적인 문화 예술 아이콘을 소개해 온 컬처프로젝트의 스물아홉 번째 주인공은 세계적인 조각가 톰 삭스(Tom Sachs)입니다.

[전시 개요: 스페이스 프로그램: 무한대]
이번 컬처프로젝트에서 선보일 톰 삭스의 전시 《스페이스 프로그램: 무한대》는 2007년부터 시작된 그의 대표작 《스페이스 프로그램》 시리즈 200여 점을 포함해 최초 공개하는 신작 10여 점을 소개하는 역대 최대 규모의 전시입니다.

[스페이스 프로그램 시리즈]
톰 삭스의 《스페이스 프로그램》은 2007년 실제 크기의 아폴로 달 착륙선(LEM)을 브리콜라주 방식으로 구현한 작품으로 시작되었습니다. 이후 그는 우주 탐험을 위한 도구와 탐사의 가능성에 대해 연구하며 지속적인 작업을 이어왔습니다.

주요 여정:
• 첫 번째 항해 (2007)
• 화성 샘플 채취 (2012)
• 유로파에서의 다도회 (2017)
• 소행성 베스타의 광물 채굴 (2021)

[무한대로의 여정]
《스페이스 프로그램: 무한대》는 그의 미션 중 최초로 우주로 향하는 경로를 수정하여 외계 생명체와의 만남, 광대한 우주 탐사의 위험과 보상을 탐구합니다. 관람객은 《Robert Irwin Scrim Clean Air Room(RISCAR)》을 통해 본격적인 전시 공간에 진입하게 됩니다.

[개막일 특별 프로그램: 라이브 데몬스트레이션]
4월 25일(금) 개막일에는 아시아 최초로 작가의 작업 세계를 직접 경험할 수 있는 퍼포먼스 형식의 특별 프로그램 《라이브 데몬스트레이션》이 진행됩니다.

• 시간: 오후 5시부터 약 6시간 진행
• 입장: 현장 대기 등록을 통한 선착순 입장 (오후 4시부터 키오스크 등록)
• 관람: 전시장 내 준비된 좌석에서만 착석 관람 가능
• 주의: 제한된 좌석으로 당일 입장이 불가할 수 있음

※ 4월 25일은 특별 프로그램으로 일반 전시 관람 불가
※ 자유 관람은 4월 26일(토)부터 가능`,
      
      // 아티스트 정보
      artists: ['Tom Sachs'],
      
      // 연락처 정보
      contact_info: 'Tel: 02-325-1077, Email: gnc@gncmedia.com, Instagram: @tomsachs_ddp',
      
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
    console.log('📍 전시명: 현대카드 컬처프로젝트 29 톰 삭스 전');
    console.log('📅 전시 기간: 2025-04-25 ~ 2025-09-07');
    console.log('🏛️ 장소: DDP 뮤지엄 전시1관 (B2F)');
    console.log('⏰ 운영시간: 10:00-20:00');
    console.log('\n📝 추가된 정보:');
    console.log('- 부제목: 스페이스 프로그램: 무한대');
    console.log('- 상세 관람료 정보 (연령별)');
    console.log('- 전시 상세 설명 및 작품 구성');
    console.log('- 개막일 특별 프로그램 안내');
    console.log('- 연락처 정보');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
updateDDPTomSachs();