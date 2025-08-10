const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHangaramOrangerieOrsayCezanneRenoir2025() {
  console.log('🎨 한가람디자인미술관 《오랑주리 - 오르세미술관 특별전 : 세잔, 르누아르》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '오랑주리 - 오르세미술관 특별전 : 세잔, 르누아르',
      title_en: 'Orangerie - Musée d\'Orsay Special Exhibition: Cezanne, Renoir',
      subtitle: '프랑스 국립 오랑주리미술관과 오르세미술관 컬렉션',
      
      // 날짜
      start_date: '2025-09-20',
      end_date: '2026-01-25',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '한가람디자인미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 서초구 남부순환로 2406 한가람디자인미술관 제1전시실, 제2전시실, 제3전시실',
      
      // 운영 정보
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:00 입장마감)',
      admission_fee: `일반(만 19-64세) 22,000원
청소년(만 13-18세 이하) 18,000원
어린이(만 7-12세 이하) 15,000원
미취학 아동(만 4-6세) 12,000원`,
      
      // 전시 설명
      description: `[전시 소개]
프랑스 파리에 위치한 오랑주리미술관과 오르세미술관의 대표 컬렉션이 한국을 찾아옵니다. 인상주의 거장 폴 세잔(Paul Cézanne)과 피에르 오귀스트 르누아르(Pierre-Auguste Renoir)의 걸작들을 만날 수 있는 특별한 기회입니다.

[참여 미술관]
• 오랑주리미술관(Musée de l'Orangerie): 모네의 수련 연작으로 유명한 파리의 대표 미술관
• 오르세미술관(Musée d'Orsay): 세계 최고의 인상주의 컬렉션을 보유한 파리의 명문 미술관

[주요 작가]

**폴 세잔 (Paul Cézanne, 1839-1906)**
• "현대 회화의 아버지"로 불리는 후기 인상주의의 거장
• 기하학적 형태와 색채의 혁신적 탐구
• 피카소와 마티스 등 20세기 현대미술에 결정적 영향
• 정물화, 풍경화, 인물화 전 장르에서 독창적 화풍 구축

**피에르 오귀스트 르누아르 (Pierre-Auguste Renoir, 1841-1919)**
• 인상주의를 대표하는 화가 중 한 명
• 따뜻하고 밝은 색채로 행복한 일상을 그린 작가
• 《피아노치는 소녀들》, 《물랭 드 라 갈레트의 무도회》 등 대표작
• 여성과 어린이의 아름다움을 특별히 사랑한 화가

[전시 구성]

**Section 1: 세잔의 혁신**
• 생트 빅투아르 산 연작
• 정물화의 새로운 시각
• 기하학적 형태 탐구
• 색채와 형태의 조화

**Section 2: 르누아르의 행복**
• 《피아노치는 소녀들》 - 대표작
• 일상 속 아름다운 순간들
• 여성과 어린이 초상화
• 인상주의적 빛과 색채

**Section 3: 19세기 말 파리 예술계**
• 인상주의 운동의 배경
• 예술가들의 교류와 영향
• 근대 도시 파리의 모습
• 부르주아 문화와 예술

**Section 4: 후기 인상주의로의 발전**
• 인상주의를 넘어선 새로운 시도
• 20세기 현대미술의 출발점
• 각 작가의 독창적 화풍 발전
• 동시대 다른 작가들과의 비교

[주요 작품]
• 르누아르 《피아노치는 소녀들》(Jeunes filles au piano)
• 세잔 《생트 빅투아르 산》 연작
• 르누아르 초상화 및 풍속화 작품들
• 세잔의 정물화와 풍경화 걸작들
• 양 미술관의 대표 소장품 다수

[관람 포인트]
• 세계적 명문 미술관 오랑주리와 오르세의 컬렉션
• 인상주의와 후기 인상주의의 정수
• 19세기 말 프랑스 예술의 황금시대
• 현대미술사에 미친 결정적 영향
• 두 거장의 서로 다른 예술적 접근법 비교

[특별 프로그램]
• 오디오 가이드 (한국어, 영어, 중국어, 일본어)
• 도슨트 투어
• 전문가 특별 강연
• 어린이 교육 프로그램
• VIP 프리뷰 및 큐레이터 토크

[전시의 의미]
이번 전시는 한국에서 만날 수 있는 최고 수준의 인상주의 전시로, 프랑스 국립 미술관의 엄선된 컬렉션을 통해 19세기 말 서구 미술사의 가장 중요한 순간들을 생생하게 경험할 수 있는 기회입니다.

세잔과 르누아르, 두 거장의 작품을 통해 인상주의에서 현대미술로 이어지는 예술사의 흐름을 이해하고, 예술이 어떻게 시대를 반영하고 미래를 이끌어가는지를 확인할 수 있을 것입니다.`,
      
      // 아티스트 정보
      artists: ['Paul Cézanne', 'Pierre-Auguste Renoir'],
      
      // 태그 정보
      tags: ['오랑주리', '오르세미술관', '세잔', '르누아르', 'Cézanne', 'Renoir', '인상주의', '후기인상주의', '피아노치는소녀들', '프랑스미술'],
      
      // 연락처 정보
      contact_info: '문의: 02-325-1077',
      phone_number: '02-325-1077',
      
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
    console.log('🏛️ 장소: 한가람디자인미술관 제1,2,3전시실');
    console.log('⏰ 운영시간:', exhibitionData.operating_hours);
    console.log('💰 입장료: 일반 22,000원 / 청소년 18,000원 / 어린이 15,000원');
    console.log('🎨 주최: 예술의전당, 지엔씨미디어');
    console.log('🖼️ 특징: 프랑스 오랑주리미술관 × 오르세미술관 컬렉션');
    console.log('👨‍🎨 작가: 세잔, 르누아르');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importHangaramOrangerieOrsayCezanneRenoir2025();