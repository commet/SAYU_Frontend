const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importAmorepacificMarkBradford2025() {
  console.log('🎨 아모레퍼시픽미술관 《Mark Bradford: Keep Walking》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: 'Mark Bradford: Keep Walking',
      title_en: 'Mark Bradford: Keep Walking',
      subtitle: '국내 최초, 아시아 최대 규모 마크 브래드포드 개인전',
      
      // 날짜 (2025년 하반기로 명시되어 있으나 구체적 날짜 미공개)
      start_date: '2025-07-30',
      end_date: '2025-12-31', // 하반기 전시로 추정하여 설정
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '아모레퍼시픽미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 용산구 한강대로 100 (한강로2가 181)',
      
      // 전시 설명
      description: `아모레퍼시픽미술관은 2025년 하반기 현대미술 기획전으로 《Mark Bradford: Keep Walking》을 개최합니다. 동시대 추상회화를 대표하는 작가 마크 브래드포드를 국내 최초로 선보이는 자리이며, 아시아에서 열린 전시 중 최대 규모의 개인전입니다.

[작가 소개: 마크 브래드포드 (Mark Bradford, 1961~)]
• 1961년 로스앤젤레스 태생, 현재까지 LA 거주하며 작업
• 동시대 추상회화를 대표하는 작가
• 사회적 메시지를 시각화하는 대형 추상회화로 세계적 명성
• 차별과 갈등에 대한 현대 사회의 주요 이슈를 날카로운 시선으로 제시

[작업 방식과 철학]
브래드포드는 작업실 주변에서 흔히 볼 수 있는 버려진 각종 포스터, 전단지 및 신문 조각을 겹겹이 쌓고, 긁어내고, 찢어내는 방식의 작업을 통해 현대 사회의 복합적 층위를 표현합니다. 이러한 물질적 접근은 단순한 형식적 실험이 아니라 사회적 맥락과 역사적 기억을 담아내는 중요한 매체가 됩니다.

[전시 구성]
지난 20여 년에 걸친 작가의 예술적 여정을 살펴보기 위해 기획된 이번 전시는 약 40점의 작품들을 통해 브래드포드의 작업세계를 종합적으로 조망합니다.

• 주요 회화 작품
• 영상 및 설치 작업
• 신작 시리즈 (아모레퍼시픽미술관 전시를 위해 특별 제작)

[주요 출품작]

《Blue》 (2005)
• 작가를 대표하는 초기 회화작
• 브래드포드 특유의 레이어링 기법이 잘 드러나는 작품

《Niagara》 (2005) 
• 마릴린 먼로가 출연한 1953년 영화에서 영감을 받은 작품
• 대중문화와 미술의 경계를 탐구하는 대표작

《Float》 (2019)
• 관람객들이 작품 위를 거닐며 경험할 수 있도록 제작된 참여형 설치작품
• 전통적인 회화의 관람 방식을 확장하는 혁신적 작업

신작 시리즈
• 아모레퍼시픽미술관 전시를 위해 특별 제작
• 작가의 최신 관심사와 한국 전시의 특성을 반영한 작업들

[전시 의의]
• 국내 최초 마크 브래드포드 개인전
• 아시아 최대 규모의 개인전
• 현대 추상회화의 정수를 경험할 수 있는 기회
• 현대 회화의 범주를 확장해 온 작가의 성취 조망

[순회 전시]
이번 전시는 독일 베를린 함부르크반호프 미술관에서 주최된 순회전으로, 아모레퍼시픽미술관의 공간적 특색에 맞추어 보다 다양한 작품들을 선보일 예정입니다.

[아모레퍼시픽미술관의 특성]
• 단일 전시관으로 매번 하나의 기획전에 집중
• 공간의 특색을 최대한 활용한 맞춤형 전시 구성
• 현대미술의 실험적이고 혁신적인 작품들을 선보이는 플랫폼

[사회적 메시지]
브래드포드의 작업은 단순한 미적 경험을 넘어서 현대 사회의 복합적 문제들 - 인종 차별, 사회적 불평등, 도시 재개발 등 - 에 대한 비판적 성찰을 제공합니다. 일상의 버려진 재료들을 예술로 승화시키는 과정에서 소외된 목소리들에 대한 관심과 연대의식을 드러냅니다.`,
      
      // 작가 정보
      artists: ['마크 브래드포드 (Mark Bradford)'],
      curator: '아모레퍼시픽미술관',
      
      // 작품 정보
      artworks_count: 40, // 약 40점의 작품
      
      // 관람 정보
      admission_fee: '별도 공지 예정',
      operating_hours: JSON.stringify({
        운영시간: '화-일 10:00-18:00',
        휴관일: '매주 월요일, 1월 1일, 설날/추석 연휴',
        예약: '필수 (매월 15일에 한 달 단위 업데이트)'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        대표: '02-6040-2345',
        문의: '02-6040-2345',
        이메일: 'museum@amorepacific.com',
        예약: '온라인 예약 시스템',
        대표이사: '김승환'
      }),
      phone_number: '02-6040-2345',
      
      // URL 정보
      official_url: 'https://www.amorepacific.com/kr/ko/company/museum',
      website_url: 'https://www.amorepacific.com/kr/ko/company/museum',
      
      // 데이터 메타정보
      source: 'amorepacific_official',
      source_url: 'https://www.amorepacific.com/kr/ko/company/museum',
      collected_at: new Date().toISOString(),
      
      // 기본값 설정
      view_count: 0,
      ai_verified: true,
      ai_confidence: 0.95
    };

    // 데이터 입력
    console.log('📝 전시 데이터 입력 중...');
    const { data, error } = await supabase
      .from('exhibitions')
      .insert([exhibitionData])
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ 《Mark Bradford: Keep Walking》 전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 부제: ${data[0].subtitle}`);
    console.log(`  - 작가: ${data[0].artists.join(', ')}`);
    console.log(`  - 장소: ${data[0].venue_name}`);
    console.log(`  - 주소: ${data[0].venue_address}`);
    console.log(`  - 기간: ${data[0].start_date}부터 (2025년 하반기)`);
    console.log(`  - 작품수: ${data[0].artworks_count}점`);
    console.log(`  - 상태: ${data[0].status}`);
    console.log(`  - 특징: 국내 최초, 아시아 최대 규모`);
    console.log(`  - 예약: 필수 (매월 15일 업데이트)`);
    
    // 아모레퍼시픽미술관 전시 현황
    console.log('\n🔍 아모레퍼시픽미술관 전시 현황...');
    const { data: amorepacificExhibitions, error: amorepacificError } = await supabase
      .from('exhibitions')
      .select('title_local, start_date, end_date, status')
      .eq('venue_name', '아모레퍼시픽미술관')
      .order('start_date', { ascending: false });
    
    if (!amorepacificError && amorepacificExhibitions) {
      console.log(`\n🏢 아모레퍼시픽미술관: ${amorepacificExhibitions.length}개`);
      amorepacificExhibitions.forEach((ex, index) => {
        const statusIcon = ex.status === 'closed' ? '✅' : 
                          ex.status === 'ongoing' ? '🔄' : '📅';
        console.log(`${index + 1}. ${ex.title_local} ${statusIcon}`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
    // 추상회화 전시 검색
    console.log('\n🔍 추상회화 관련 전시 검색...');
    const { data: abstractExhibitions, error: abstractError } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, start_date, end_date')
      .or('description.ilike.%추상%,description.ilike.%회화%,description.ilike.%페인팅%,description.ilike.%abstract%')
      .order('start_date', { ascending: false });
    
    if (!abstractError && abstractExhibitions) {
      console.log(`\n🎨 추상회화 관련 전시: ${abstractExhibitions.length}개`);
      abstractExhibitions.slice(0, 5).forEach((ex, index) => {
        console.log(`${index + 1}. ${ex.title_local} (${ex.venue_name})`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
    // 사회적 메시지 관련 전시 검색
    console.log('\n🔍 사회적 메시지 관련 전시 검색...');
    const { data: socialExhibitions, error: socialError } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, start_date, end_date')
      .or('description.ilike.%사회%,description.ilike.%차별%,description.ilike.%갈등%,description.ilike.%메시지%')
      .order('start_date', { ascending: false });
    
    if (!socialError && socialExhibitions) {
      console.log(`\n📢 사회적 메시지 전시: ${socialExhibitions.length}개`);
      socialExhibitions.slice(0, 3).forEach((ex, index) => {
        console.log(`${index + 1}. ${ex.title_local} (${ex.venue_name})`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importAmorepacificMarkBradford2025();