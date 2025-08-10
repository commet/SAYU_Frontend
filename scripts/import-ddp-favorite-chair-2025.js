const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importDDPFavoriteChair2025() {
  console.log('🎨 DDP 《What\'s your favorite chair》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: 'What\'s your favorite chair',
      title_en: 'What\'s your favorite chair',
      subtitle: 'DDP 매거진 라이브러리 x 매거진<C>',
      
      // 날짜
      start_date: '2025-07-17',
      end_date: '2025-08-30',
      exhibition_type: 'design',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: 'DDP 동대문디자인플라자',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '디자인랩 3층 디자인홀',
      
      // 운영 정보
      operating_hours: '10:00-20:00',
      admission_fee: '무료',
      
      // 전시 설명
      description: `의자는 디자이너의 창의성과 실험 정신이 응축된 대표적 오브제입니다. 매거진 <C>는 매호 하나의 아이콘 체어를 선정해, 그 의자가 현대인의 라이프스타일과 관련 산업에 끼친 영향을 조명하며 '좋은 디자인'의 의미를 함께 고민합니다.

[기획 의도]
전시 제목이기도 한 'What's your favorite chair?'는 단순히 디자인 취향을 묻는 질문을 넘어, 지금까지 등장한 수많은 의자 중 오랫동안 기억되고 시장에서 살아남아 사랑받는 디자인의 조건은 무엇인지 되묻게 만듭니다.

[매거진 <C> 소개]
세계 최초의 의자 전문 잡지, 매거진 <C>는 그란데클립과 매거진 <B>가 매호 아이콘 체어를 선정해 이를 중심으로 한 디자인, 라이프스타일을 소개하는 체어 다큐멘터리 매거진입니다.

선정 기준:
• 조형적 원본성
• 기술적 혁신
• 산업적 영향력
• 대중의 라이프스타일에 끼친 영향
• 변하지 않는 가치

발행 정보:
• 2024년 창간
• 연간 4회 발행
• 한글과 영어판 발행 및 전세계 배포
• Instagram: @chair.magazine.c

[소개된 아이콘 체어]
1호: 장 프루베의 스탠더드 체어 (제조: 비트라)
2호: 미하엘 토네트의 14번 의자 (제조: 톤)
3호: 필립 스탁의 루이 고스트 (제조: 카르텔)
4호: 르 코르뷔지에 & 샤를로트 페리앙 & 피에르 잔느레의 포퇴유 그랑 콩포르 (제조: 까시나)
5호: 이츠오 오쿠야마의 K 체어 (제조: 가리모쿠)

[왜 의자인가?]
• 의자는 기술과 문화, 예술이 교차하는 지점
• 가구·패션·리빙·F&B 등 현대인의 삶 전반으로 확장되는 관문
• 20세기 디자인 역사 속 특정 스타일과 트렌드를 대표하는 아이콘
• 파이돈 <999개의 디자인 클래식>에서 의자는 총 297개로 전체의 약 30% 차지

[주요 콘텐츠]
1. 전시존: 매거진 <C>가 소개하는 디자인 아이콘
   - 매거진 <C> 1호~5호의 전문 콘텐츠와 현지 촬영 사진 소개

2. 앉는 디자인:
   - 매거진 <C>가 소개한 아이코닉 체어
   - 국내 디자이너의 재해석 작품
   - DDP 소장 아이코닉 체어 전시

[연계 행사: 2025 디자이너 가구 브랜드 비즈니스 포럼]
일시: 2025년 7월 17일(목) 10:00 ~ 20:00
장소: DDP 디자인랩 3층 디자인홀

연사 라인업:
• 세션 1: 양윤선 (레어로우 대표) - "레어로우 3세대 업그레이드 운영 전략"
• 세션 2: 문승지 (하바구든 디렉터) - "하바구든, 디자이너가 설계하는 삶의 형태"
• 세션 3: 황두현 (잭슨 카멜레온 공동 창업자) - "집으로 가는 길, 하우스 오브 잭슨카멜레온"
• 세션 4: 최중호 (최중호 스튜디오 대표) - "브랜드와 디자이너의 창의적 동행"
• 세션 5: Q&A 세션

모더레이터: 전은경 (매거진 <C> 디렉터)`,
      
      // 기획 정보
      curator: '매거진 <C>',
      
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
    console.log('🪑 기획: 매거진 <C>');
    console.log('📚 주최: 서울디자인재단');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importDDPFavoriteChair2025();