const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importCalligraphyMuseumWuGuanzhong2025() {
  console.log('🎨 서울서예박물관 《우관중: 흑과 백 사이》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '우관중: 흑과 백 사이',
      title_en: 'Wu Guanzhong: Between Black and White',
      subtitle: '우관중 예술후원 해외전시 시리즈',
      
      // 날짜
      start_date: '2025-07-25',
      end_date: '2025-10-19',
      exhibition_type: 'international',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '서울서예박물관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 서초구 남부순환로 2406 서울서예박물관 제3전시실',
      
      // 운영 정보
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:00 입장마감)',
      admission_fee: '무료',
      
      // 전시 설명
      description: `"국제 현대미술 전시에 중국 작품 두 점을 선정해야 한다면, 나는 칠흑색 옻칠 패널과 순수한 흰색의 선지 한 장을 선택할 것입니다." - 우관중

[전시 소개]
우관중(吳冠中, Wu Guanzhong, 1919-2010)은 20세기 중국 현대미술을 대표하는 거장으로, 동서양 미학을 융합한 독창적인 예술 세계를 구축했습니다. 한국에서 처음으로 개최되는 이번 전시는 홍콩예술박물관 소장품인 우관중의 수묵화 및 유화 17점을 엄선하여 선보입니다.

[작가 소개: 우관중 (1919-2010)]
• 20세기 중국 현대미술의 거장
• 1940년대 프랑스 유학 후 중국과 서양 미학 통합에 평생 헌신
• 전통 중국 수묵화에서 시작하여 다채로운 유화 작업으로 확장
• 만년에는 수묵화의 단색적 매력을 독특하고 심오한 방식으로 재발견
• 생존 당시 대영박물관에서 개인전을 개최한 최초의 중국 작가

[전시 구성]

Section 1: 백(白)
• 두 마리 제비 (Two Swallows), 1981
• 강남 회상 (Reminiscences of Jiangnan), 1996
순수한 흰색 화선지와 검은 먹의 대비를 통해 동양적 공간미학을 구현

Section 2: 회색(灰)
• 만남 (Meeting), 1999
• 수로 (Waterway), 1997
강남 지역의 은회색 톤과 시적 분위기를 담은 작품들

Section 3: 흑(黑)
• 여주 고향 (Bitter Gourd Hometown), 1998
• 둥지 (Nest), 2010
검정색이 지닌 깊이와 감정의 농도를 표현

Section 4: 우관중 예술후원 융합 예술 시리즈
• 우관중 x 장한겸 정(h0nh1m) | XCEED
• Sentient Pond - Seoul Edition (감성의 연못 - 서울 판), 2025
• 인터랙티브 몰입형 설치 작품

[주요 관람 포인트]
1. 20세기 중국 현대미술의 거장이자 세계적으로 인정받은 작가
   - 국제적으로 높이 평가받은 동서양 미학의 융합
   - 프랑스, 미국 등에서 활발한 전시 활동

2. 동시대 관람객의 감성을 울리는 독창적인 시각 언어
   - 추상적 구조, 역동적 화면, 서정적 표현
   - 전통 중국 수묵화와 서구 모더니즘의 탁월한 결합

3. 홍콩예술박물관 소장 우관중 컬렉션의 한국 첫 단독전
   - 세계 최대 우관중 컬렉션 보유 기관의 공식 단독전
   - 대표 소장품 17점 국내 최초 공개

[작가의 예술 철학]
우관중의 삶과 예술적 여정은 검정, 흰색, 회색을 감정적으로 깊이 공명하며, 서양 디자인과 중국 미학이 녹아든 상징적인 색조로 변화시켰습니다. 그의 작품은 흑백 사이의 상호 작용 속에서 불러일으켜지는 무한한 열정과 상상력을 담고 있습니다.`,
      
      // 아티스트 정보
      artists: ['우관중(Wu Guanzhong)', '장한겸 정(h0nh1m)'],
      curator: '홍콩특별행정구 정부 여가문화서비스부',
      
      // 태그 정보
      tags: ['예술의전당', '서예박물관', '홍콩예술박물관', '우관중', '무료전시', '중국현대미술', '수묵화', '동서양융합'],
      
      // 연락처 정보
      contact_info: '문의: 1668-1352',
      phone_number: '1668-1352',
      
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
    console.log('🎨 공동주최: 예술의전당, 홍콩예술박물관');
    console.log('🖼️ 작품: 수묵화 및 유화 17점');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importCalligraphyMuseumWuGuanzhong2025();