const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importDDPDesignMiami2025() {
  console.log('🎨 DDP 《디자인 마이애미 인 시투 서울》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '디자인 마이애미 인 시투 서울',
      title_en: 'DESIGN MIAMI IN SITU SEOUL - Illuminated: A Spotlight on Korean Design',
      subtitle: '창작의 빛: 한국을 비추다',
      
      // 날짜
      start_date: '2025-09-01',
      end_date: '2025-09-14',
      exhibition_type: 'international',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: 'DDP 동대문디자인플라자',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: 'DDP 이간수문 전시장',
      
      // 운영 정보
      operating_hours: '10:00-20:00',
      admission_fee: '무료',
      
      // 전시 설명
      description: `세계적인 디자인 페어 '디자인 마이애미(Design Miami)'가 아시아 최초로 DDP에서 콜렉터블 디자인 전시를 개최합니다.

[전시 개요]
《Illuminated: A Spotlight on Korean Design》이라는 주제로, 총 170여 점의 작품을 통해 한국 디자인 특유의 감각과 철학을 세계에 소개합니다. 이번 전시는 서울이라는 도시의 맥락과 한국의 지역성을 진정성 있게 반영하며, 한국 디자인만의 독창성을 조명하고 국내 콜렉터블 디자인의 흐름을 이끌어온 거장들을 소개합니다.

[전시 특징]
• 아시아 최초 디자인 마이애미 개최
• 전통 공예부터 혁신적인 현대 디자인까지 아우르는 한국 디자인의 풍부한 유산
• 차세대 디자이너들에게 새로운 영감 제공
• 국제 디자인 트렌드와 산업의 미래에 대한 담론의 장

[참여 갤러리 (16개)]
세계적인 디자인 갤러리들이 참여합니다:
• Carpenters Workshop Gallery (런던, 파리, 뉴욕, LA)
• Salon 94 Design (뉴욕)
• Charles Burnand Gallery (런던)
• Objects With Narratives (브뤼셀, 제네바)
• Friedman Benda
• Gallery LVS & Craft
• Gallery O
• Gallery SKLO
• Hostler Burrows
• J. Lohmann Gallery
• Marta
• Mindy Solomon Gallery
• R & Company
• SIDE Gallery
• SOLUNA FINE CRAFT
• Todd Merrill Studio

[참여 작가]
김민재, 이광호, 정다혜, 최병훈 등 글로벌 무대에서 주목받고 있는 국내 작가 총 71명이 참여합니다.

[토크 프로그램]
디자인의 주요 이슈를 다루는 토크 프로그램이 운영됩니다. 동시대 디자인의 최전선에서 활동하는 작가, 브랜드, 컬렉터, 업계 관계자들이 한자리에 모여, 국제 디자인 트렌드와 산업의 미래에 대해 깊이 있는 담론을 나눕니다.

[관람 안내]
• 9월 1일: 초청자 한정 오픈
• 9월 2일부터: 일반 관람 가능
• 작품 수: 170여 점

이번 전시는 세계가 주목하는 한국 디자인의 현재를 보여주는 중요한 플랫폼이 될 것입니다.`,
      
      // 아티스트 정보
      artists: ['김민재', '이광호', '정다혜', '최병훈', '외 67명'],
      artworks_count: 170,
      
      // 연락처 정보
      contact_info: '전시팀 02-2153-0064',
      
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
    console.log('🎨 작품 수: 170여 점');
    console.log('👥 참여 작가: 71명');
    console.log('🏢 주최: 서울디자인재단, 디자인마이애미');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importDDPDesignMiami2025();