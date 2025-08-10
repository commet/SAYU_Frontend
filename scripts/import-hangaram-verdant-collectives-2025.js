const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHangaramVerdantCollectives2025() {
  console.log('🎨 한가람디자인미술관 《조경가그룹전: 연두빛사람들》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '조경가그룹전: 연두빛사람들',
      title_en: 'Verdant Collectives',
      subtitle: '한국 조경 디자인의 현재와 미래',
      
      // 날짜
      start_date: '2025-08-01',
      end_date: '2025-08-10',
      exhibition_type: 'group',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '한가람디자인미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 서초구 남부순환로 2406 한가람디자인미술관 제3전시실',
      
      // 운영 정보
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:30 입장마감)',
      admission_fee: '무료',
      
      // 전시 설명
      description: `[전시 소개]
《조경가그룹전: 연두빛사람들》은 한국을 대표하는 조경 디자인 스튜디오들이 한자리에 모이는 특별한 전시입니다. 'Verdant Collectives'라는 영문명이 시사하듯, 푸른 생명력을 품은 조경가들이 모여 도시와 자연, 인간과 환경의 관계를 새롭게 제시합니다.

[참여 조경 스튜디오 및 대표]
• 조제(Joje) - 조용준
• 도감(Dohgam) - 최웅재
• 제이더블유엘(JWL) - 원종호, 정욱주
• 안마당더랩(Anmadang the Lab) - 오현주, 이범수
• 랩디에이치(Lab D+H Seoul) - 최영준
• 오픈니스 스튜디오(OPENNESS) - 최재혁
• 얼라이브어스(ALIVEUS) - 강한솔, 김태경

[Studio Day Schedule]
각 스튜디오의 대표 조경가를 직접 만날 수 있는 특별한 기회!

• 8/02(토): 조제(Joje) - 조용준
• 8/03(일): 도감(Dohgam) - 최웅재
• 8/04(월): [휴관]
• 8/05(화): 제이더블유엘(JWL) - 원종호, 정욱주
• 8/06(수): 안마당더랩(Anmadang the Lab) - 오현주, 이범수
• 8/07(목): 랩디에이치(Lab D+H Seoul) - 최영준
• 8/08(금): 오픈니스 스튜디오(OPENNESS) - 최재혁
• 8/09(토): 얼라이브어스(ALIVEUS) - 강한솔, 김태경

[특별 프로그램]
• 8/01(금) 17:30: 비공식 프레스 오프닝
  - 참여 조경가가 모두 한 자리에 모이는 특별한 시간
  - 작품 설명과 네트워킹 기회

[전시 특징]
• 한국 조경 디자인의 최신 트렌드와 비전 제시
• 7개 대표 조경 스튜디오의 작품 세계
• 도시 공간과 자연의 조화로운 공존 모색
• 지속가능한 환경 디자인의 미래
• 각 스튜디오별 고유한 디자인 철학과 방법론 소개

[관람 포인트]
• 한국 조경 디자인의 현재 지형도를 한눈에 파악
• 일상 속 공간을 새롭게 바라보는 시각 제공
• 도시와 자연의 경계를 넘나드는 창의적 제안
• 환경과 인간의 지속가능한 관계 모색

최신 전시정보: Instagram @Verdant.Collectives`,
      
      // 아티스트 정보
      artists: ['조용준', '최웅재', '원종호', '정욱주', '오현주', '이범수', '최영준', '최재혁', '강한솔', '김태경'],
      curator: '최영준',
      
      // 태그 정보
      tags: ['VerdantCollectives', '조경가그룹전', '연두빛사람들', '조경디자인', '도시계획', '환경디자인'],
      
      // 연락처 정보
      contact_info: '문의: 02-880-4887',
      phone_number: '02-880-4887',
      
      // 메타데이터
      source: 'seoul_arts_center',
      source_url: 'https://www.sac.or.kr',
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
    console.log('⏰ 운영시간:', exhibitionData.operating_hours);
    console.log('💰 입장료: 무료');
    console.log('🌿 참여: 7개 조경 스튜디오, 10명 조경가');
    console.log('📅 Studio Day: 매일 다른 스튜디오 대표 만남');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importHangaramVerdantCollectives2025();