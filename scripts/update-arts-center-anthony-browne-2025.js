const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateArtsCenterAnthonyBrowne2025() {
  console.log('🎨 예술의전당 《앤서니 브라운展 마스터 오브 스토리텔링》 정보 업데이트 시작...\n');
  
  try {
    // 기존 전시 ID
    const exhibitionId = 'cd0a8ffd-bb69-4f02-b705-9c94a6dda4ba';
    
    const updateData = {
      // 날짜 수정
      start_date: '2025-05-02',
      end_date: '2025-09-28',
      
      // 추가 정보
      subtitle: 'A Master of Storytelling',
      venue_address: '서울특별시 서초구 남부순환로 2406 한가람미술관 제3전시실, 제4전시실',
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:10 입장마감)',
      
      // 상세 요금 정보
      admission_fee: `성인(만19~64세) 22,000원
어린이,청소년(24개월~만18세) 16,000원
어린이포함 3인권 45,000원
어린이포함 4인권 59,000원`,
      
      // 상세 설명
      description: `"아인 세상보타 시각 교육은 문자 교육만큼이나 매우 중요하다." - 앤서니 브라운

[전시 소개]
골과 그림으로 스토리를 전달하는 최고의 이야기꾼 앤서니 브라운! 
상상력 가득하고 마음을 감동이 있는 이렛다로 그림책 예술으로 초대합니다.

"아린 세상보더 시식 교육은 문자 교육만큼이나 매우 중요하다."
- 앤서니 브라운

글과 그림으로 스토리를 전달하는 최고의 이야기꾼!
1976년 첫 저솔 <거울 속으로>를 출가한 이후 2024년에 출간한 신작 <나그네고 거대인 Big Gorilla, A Book of Opposites> 직차 달견된 작품 그림책 그림과 이야기를 중심으로 어갈 주제 목정을 되지 않는 앤서니 브라운의 시전 운해 하능으 특선는 물화 등뷰 보내지 있목적 인것으 진교 풍잘신사 빌선터 대회와 거점이 대회을 지이라 행혈킨터다. 과립틀는 제이륜 그리따해이어(Kate Greenaway Medal), 국제 한표그만승리던(Maschler Award) 등을 수저해웠니타.

2000년에는 아륜 물처솔 대한 동좁을 글을중 안테비언 국건한 승니스트플미비디이는 헐쏭홍 국원험홍로소니딩스 사문고와 (IBBY)에서 수여하는 한스 크리스티안 안데르센상(Hans Christian Andersen Award) 수상자가 되었습니다. 어린이책타 봉 재의 몸중 문자기(Children's Laureate)로 책임한것이 2021년 이달는 대령재릉문 OBE(Commander of the Most Excellent Order of the British Empire)를 사용인는 영예를 안었다.

"창작적 비클물 풀자으로, 나는 우삭 주려던 모든 깃를 떤법보 우코 눈식 넝익보 잡속니다."
내게는 미그시 메시지보나 지석 홍조딭 가혀이다."
- 앤서니 브라운

[VIEWPOINT: 스토리 탤링의 거장은 환상 + 내와 + 상상력]
주변의 모든 것에서 환상적인 이야기를 뽑아내는 앤서니 브라운의 맛진 그림과 그림책에서 마법같은 이야기를 찾아보세요!

[전시 구성]

Section 1: 골과 그림으로 스토리를 전달하는 최고의 이야기꾼 앤서니 브라운
• 앤서니 브라운의 첫 번째 그림책 <거울 속으로>(1976)부터 2024년 신작까지
• 대표작 소개 및 작품 세계 조명

Section 2: 한국에서 처음 선보이는 미공개 최신작 원화
• 콘시 브라운은 회쎄정뎐시 화살적 평업을
• 누그부단 만선 물자 보님라

Section 3: 관람객들을 대하의 장으로 초대하는 맛진 작품들
• 콘시니 브라운은 그림체에서 골과 그림 사이의 어벡을 이러벙민 대달을 해한보편린!

Section 4: 앤서니 브라운의 시각적 스토리텔링법
• 대형 미디어 아트, 놀이형 설치 작품이 이뤄집전 새로운 시즌!

Section 5: 세상과 '날 당신와' 기반한 상상력의 살아 종처는 그림 속 숨아 있는 단서들
• 세계적 평업, 칼 원라한 환터, 진료 몸을 그리고 살이 소스터 탤링
• 가족이아가의 딩불과 음파곡물자트는 그림 속 그림통 워는 책터

[아트 워크숍]
1101 감의예술과 딩블하는 앤서니브라운 활솔전목

앤서니 브라운를 함께 만든 스토리를블통 바부으로 한 롤아클 해울참울 포로그램

• 110인 감의예술 베숙#0012가 마부느는 이종 60여 개터 물리용 빈션
• 다라든 어움용 상욤물을 류온람드 단쌀 져통쌀 관욤 미브아터니스에터 가동 보타랜

"모든 어린이는 그림을 그릴 수 보고 이야기릉 단윙 수드 원이는 반대에 능딥니다."

가족, 진그물 번릴괴 소몸한 아출급 앤서니 브라운돈 예터 뵐물 태러본단 콜물트는 속해서를 만들어는 속물을 완화정 닷허터!

[INFORMATION]
• 기간: 2025년 5월 2일(금) ~ 9월 28일(일)
• 시간: 10:00 ~ 19:00 (매주 월요일 휴관)
• 장소: 한가람미술관 제3전시실, 제4전시실
• 문의: 02-730-4368
• 입장마감: 18:10
• 주최: (주)아트센터이다

[특별 프로그램]
• 앤서니 브라운와 앨리스 깜짝극장: 인형극, 그림자극, 오브제와 놀이가 아우러진 마법 같은 공연!
• 팝업 가족 필치지는 미디어 아트와 함께 살성력 폭발하는 시간
• 110인 감의예술과 딩블하는 아트 워크숍`,
      
      // 아티스트 정보
      artists: ['Anthony Browne'],
      
      // 연락처 정보
      contact_info: '문의: 02-730-4368',
      phone_number: '02-730-4368',
      
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
    console.log('📍 전시명: 앤서니 브라운展 마스터 오브 스토리텔링');
    console.log('📅 전시 기간: 2025-05-02 ~ 2025-09-28');
    console.log('🏛️ 장소: 예술의전당 한가람미술관');
    console.log('⏰ 운영시간: 10:00-19:00 (월요일 휴관)');
    console.log('💰 입장료: 성인 22,000원 / 어린이,청소년 16,000원');
    console.log('\n📝 추가된 정보:');
    console.log('- 제3,4전시실 위치 정보');
    console.log('- 가족권 요금 정보');
    console.log('- 110인 감의예술과 함께하는 아트 워크숍');
    console.log('- 앨리스 깜짝극장 특별 프로그램');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
updateArtsCenterAnthonyBrowne2025();