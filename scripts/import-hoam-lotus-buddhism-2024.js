const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHoamLotusBuddhism2024() {
  console.log('🎨 호암미술관 《진흙에 물들지 않는 연꽃처럼》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '진흙에 물들지 않는 연꽃처럼',
      title_en: 'Like a Lotus Untainted by Mud',
      subtitle: '젠더 관점에서 조망한 동아시아 불교미술 최초 대규모 기획전',
      
      // 날짜
      start_date: '2024-03-27',
      end_date: '2024-06-16',
      exhibition_type: 'special',
      status: 'closed', // 이미 종료된 전시
      
      // 장소 정보
      venue_name: '호암미술관',
      venue_city: '용인',
      venue_country: 'KR',
      venue_address: '경기도 용인시 처인구 포곡읍 에버랜드로 562번길 38',
      
      // 전시 설명
      description: `호암미술관은 젠더라는 관점에서 동아시아 불교미술을 조망하는 최초의 대규모 기획전 《진흙에 물들지 않는 연꽃처럼》을 개최합니다. 불교 속에서 여성은 어떤 존재였으며 여성은 불교에서 무엇을 찾았던 것일까요. 이번 전시는 92건의 동아시아 불교미술품을 통해 '불교미술 속 여성'과 '제작과 후원의 주체로서 여성'이라는 두 주제를 조명합니다.

[전시 의의]
• 젠더 관점에서 동아시아 불교미술을 조망하는 최초의 대규모 기획전
• 불교미술에 담긴 여성의 염원과 고뇌, 공헌에 주목
• 전통 속에서 동시대적 의미를 읽을 수 있는 기회
• 사회적, 제도적 차별에 얽매이지 않고 깨달음을 향한 실천을 이어간 여성들 조명

[참여 기관 - 국내외 27개 기관]
• 국내: 리움미술관 외 9개 기관
• 해외: 유럽 3개 기관, 미국 4개 기관, 일본 11개 기관
• 주요 소장처: 메트로폴리탄미술관, 보스턴미술관, 영국박물관, 도쿄국립박물관, 클리블랜드미술관 등

[전시 구성]

**1부: 다시 나타나는 여성**
불교미술 속에 재현된 여성상을 인간, 보살, 여신으로 나누어 살펴봄으로써 지난 시대와 사회가 여성을 바라본 시선을 조명

• "여성의 몸: 모성母性과 부정不淨" - 인간 여성상
• "관음: 변신變身과 변성變性" - 여성형으로 나타나는 특별한 보살
• "여신들의 세계: 추앙과 길들임 사이" - 여성 신격

**2부: 여성의 행원行願**
찬란한 불교미술품 너머 후원자와 제작자로서 여성을 발굴, 사회와 제도의 제약에서 벗어나 자기로서 살고자 했던 여성들을 조명

• "간절히 바라옵건대: 성불成佛과 왕생往生" - 불교도의 궁극적 바람과 염원
• "'암탉이 울 때': 유교사회의 불교여성" - 조선 왕실 여성들의 불교 지지
• "여공女工: 바늘과 실의 공덕" - 여성들의 신앙과 창조적 역량이 교차한 불교 자수와 복식

[주요 작품]

**고려불화 걸작들**
• 《수월관음보살도》 (고려 14세기, 개인 소장, 보물) - 5.7~6.16 전시
• 《아미타여래삼존도》 (고려 14세기, 리움미술관)
• 《천수천안관음보살도》 (고려 14세기, 국립중앙박물관, 보물, 이건희 회장 기증)

**사경류**
• 《감지금니 묘법연화경》 권1-7 (고려 1345년, 리움미술관)
• 《불설대보부모은중경》 (고려 1378년, 국립중앙박물관, 보물, 이건희 회장 기증)

**조선불화**
• 《석가여래삼존도》 (조선 1565년, 메트로폴리탄미술관)
• 《약사여래삼존도》 (조선 1565년, 국립중앙박물관, 보물)
• 《석가여래설법도》 (조선 1592년, 리움미술관)

**일본불교미술**
• 《보현보살십나찰녀도》 (일본 가마쿠라시대 14세기, 나라국립박물관)
• 《아미타여래이십오보살내영도》 (일본 무로마치/모모야마시대 16세기, 나라국립박물관)

**불교 자수와 복식**
• 《자수 가사》 (중국 명 15세기, 클리블랜드미술관)
• 《자수 아미타여래삼존내영도》 (일본 가마쿠라/난보쿠초시대 13-14세기)
• 《송광사 목조관음보살좌상 복장물》 (조선 1662년, 송광사성보박물관, 보물)

[작품 교체 일정]
전시 기간 중 보존을 위해 단계별 작품 교체가 진행되었습니다:
• 전기 4주 (3.27-4.12): 《자수 아미타여래삼존내영도》 등
• 전기 6주 (3.27-5.5): 《석가탄생도》, 《구상시회권》 등 12점
• 후기 8주 (4.23-6.16): 《자수 아미타여래도》
• 후기 6주 (5.7-6.16): 《수월관음보살도》 등 12점

[관람 지원]
• 큐피커 App을 통한 오디오가이드
• 도슨트 전시설명: 화-일, 오후 2시/4시 (일 2회)
• 1층 전시실 입구에서 시작
• 이어폰 대여 가능

[전시의 현대적 의미]
불교미술을 통해 여성의 역할과 지위, 신앙과 예술적 기여를 재조명함으로써 성평등과 여성 권익에 대한 현대적 시각을 제공합니다. 전통문화 속에서 여성이 수행했던 적극적이고 창조적인 역할을 발굴하여 동시대적 의미를 부여합니다.`,
      
      // 작가 정보 (시대별 작가들)
      artists: [
        '고려시대 불화 화사들', '조선시대 불화 화사들', '일본 가마쿠라시대 화사들',
        '기쿠치 요사이', '중국 명/청 자수 장인들'
      ],
      curator: '호암미술관',
      
      // 작품 정보
      artworks_count: 92, // 92건의 동아시아 불교미술품
      
      // 관람 정보
      admission_fee: '별도 공지',
      operating_hours: JSON.stringify({
        운영시간: '화-일 10:00-18:00',
        휴관일: '매주 월요일',
        예약: '전시예약 필요',
        도슨트: '화-일 오후 2시, 4시 (일 2회)',
        오디오가이드: '큐피커 App 이용'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        대표: '031-320-1801~2',
        문의: '031-320-1801',
        홈페이지: 'hoam.samsung.org',
        예약: '전시예약 시스템 이용',
        오디오가이드: '큐피커 App 다운로드'
      }),
      phone_number: '031-320-1801',
      
      // URL 정보
      official_url: 'https://hoam.samsung.org',
      website_url: 'https://hoam.samsung.org',
      
      // 데이터 메타정보
      source: 'hoam_official',
      source_url: 'https://hoam.samsung.org',
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
    
    console.log('✅ 《진흙에 물들지 않는 연꽃처럼》 전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 부제: ${data[0].subtitle}`);
    console.log(`  - 장소: ${data[0].venue_name} (전시실 1, 2)`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 작품수: ${data[0].artworks_count}건 (국내외 27개 기관)`);
    console.log(`  - 상태: ${data[0].status} (종료)`);
    console.log(`  - 주제: 젠더 관점의 동아시아 불교미술`);
    console.log(`  - 특징: 고려불화 걸작, 작품 교체 전시`);
    
    // 호암미술관 2024년 전시 현황
    console.log('\n🔍 호암미술관 2024년 전시 현황...');
    const { data: hoam2024, error: hoamError } = await supabase
      .from('exhibitions')
      .select('title_local, start_date, end_date, status')
      .eq('venue_name', '호암미술관')
      .gte('start_date', '2024-01-01')
      .lt('start_date', '2025-01-01')
      .order('start_date', { ascending: true });
    
    if (!hoamError && hoam2024) {
      console.log(`\n🏛️ 호암미술관 2024년: ${hoam2024.length}개`);
      hoam2024.forEach((ex, index) => {
        const statusIcon = ex.status === 'closed' ? '✅' : 
                          ex.status === 'ongoing' ? '🔄' : '📅';
        console.log(`${index + 1}. ${ex.title_local} ${statusIcon}`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
    // 불교미술 전시 검색
    console.log('\n🔍 불교미술 관련 전시 검색...');
    const { data: buddhismExhibitions, error: buddhismError } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, start_date, end_date')
      .or('description.ilike.%불교%,description.ilike.%불화%,description.ilike.%관음%,description.ilike.%아미타%,description.ilike.%보살%,title_local.ilike.%불교%')
      .order('start_date', { ascending: false });
    
    if (!buddhismError && buddhismExhibitions) {
      console.log(`\n🙏 불교미술 관련 전시: ${buddhismExhibitions.length}개`);
      buddhismExhibitions.slice(0, 5).forEach((ex, index) => {
        console.log(`${index + 1}. ${ex.title_local} (${ex.venue_name})`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
    // 젠더/여성 관점 전시 검색
    console.log('\n🔍 젠더/여성 관점 전시 검색...');
    const { data: genderExhibitions, error: genderError } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, start_date, end_date')
      .or('description.ilike.%젠더%,description.ilike.%여성%,description.ilike.%모성%,title_local.ilike.%여성%')
      .order('start_date', { ascending: false });
    
    if (!genderError && genderExhibitions) {
      console.log(`\n👩 젠더/여성 관점 전시: ${genderExhibitions.length}개`);
      genderExhibitions.slice(0, 3).forEach((ex, index) => {
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
importHoamLotusBuddhism2024();