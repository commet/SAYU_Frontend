const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHangaramIsabelleDeGanayMoments2025() {
  console.log('🎨 한가람미술관 《이자벨 드 가네 : 모먼츠》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '이자벨 드 가네 : 모먼츠',
      title_en: 'Isabelle de Ganay : Moments',
      subtitle: '순간을 포착하는 프랑스 현대 화가의 감성',
      
      // 날짜
      start_date: '2025-09-12',
      end_date: '2025-10-12',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '한가람미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 서초구 남부순환로 2406 한가람미술관 제7전시실',
      
      // 운영 정보
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:20 입장마감)',
      admission_fee: `대인(만 19세-64세) 12,000원
소인(만 3세-18세) 9,000원
우대 및 특별할인 대상자 정가 -2,000원 할인`,
      
      // 전시 설명
      description: `[전시 소개]
《이자벨 드 가네 : 모먼츠》는 프랑스 현대미술을 대표하는 화가 이자벨 드 가네(Isabelle de Ganay)의 국내 첫 개인전입니다.

[작가 소개: 이자벨 드 가네 (Isabelle de Ganay)]
프랑스 파리를 기반으로 활동하는 현대 화가로, 일상의 아름다운 순간들을 섬세하고 서정적인 화풍으로 표현하는 작가입니다. 그녀의 작품은 빛과 색채의 조화를 통해 관람객에게 평온함과 감동을 선사합니다.

[전시 특징]
• 한국 최초 개인전
• 일상 속 아름다운 순간들을 포착한 작품들
• 프랑스 현대미술의 서정적 감성
• 빛과 색채의 섬세한 표현
• 인상주의적 화풍의 현대적 해석

[작품 세계]
이자벨 드 가네의 작품은 '모먼츠(Moments)', 즉 '순간'을 주제로 합니다. 작가는 일상생활에서 마주치는 소중한 순간들 - 햇빛이 스며드는 창가, 꽃이 피어나는 정원, 평화로운 풍경 등을 캔버스에 담아냅니다.

[주요 작품 시리즈]

**Section 1: 빛의 순간들**
• 창을 통해 들어오는 자연광
• 시간에 따라 변화하는 빛의 표정
• 일상 공간 속 빛과 그림자의 조화

**Section 2: 자연의 순간들**
• 꽃과 나무, 정원의 풍경
• 계절의 변화를 담은 자연화
• 프랑스 시골 풍경의 목가적 아름다움

**Section 3: 고요한 순간들**
• 평온한 실내 풍경
• 정적 속에서 발견하는 아름다움
• 명상적 분위기의 정물화

**Section 4: 일상의 순간들**
• 소박하지만 소중한 일상의 장면들
• 가족과 함께하는 따뜻한 시간
• 평범한 하루 속 특별한 발견

[작품 기법과 특징]
• 부드러운 색조와 온화한 붓터치
• 자연광을 활용한 빛의 표현
• 인상주의적 기법의 현대적 활용
• 감정을 자극하는 서정적 분위기
• 프랑스 전통 회화의 정서적 계승

[관람 포인트]
• 프랑스 현대미술의 서정적 감성
• 일상 속에서 발견하는 아름다운 순간들
• 빛과 색채의 섬세한 조화
• 평온함과 위안을 주는 작품들
• 인상주의 전통의 현대적 계승

[전시 의미]
이번 전시는 바쁜 현대 생활 속에서 우리가 놓치기 쉬운 일상의 소중한 순간들을 다시 발견하게 하는 의미 있는 전시입니다. 이자벨 드 가네의 작품을 통해 관람객들은 삶의 여유와 아름다움을 재발견할 수 있을 것입니다.

[특별 프로그램]
• 작가와의 만남 (온라인 화상 토크)
• 갤러리 토크
• 도슨트 투어
• 어린이 체험 프로그램

프랑스 파리의 감성이 가득한 이자벨 드 가네의 작품을 통해 일상의 소중한 순간들을 새롭게 바라보는 특별한 시간이 되시기 바랍니다.`,
      
      // 아티스트 정보
      artists: ['Isabelle de Ganay'],
      
      // 태그 정보
      tags: ['이자벨드가네', 'IsabelledeGanay', '모먼츠', 'Moments', '프랑스미술', '현대미술', '인상주의', '가을전시'],
      
      // 연락처 정보
      contact_info: '문의: 02-723-6577, 02-723-6578',
      phone_number: '02-723-6577',
      
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
    console.log('💰 입장료: 대인 12,000원 / 소인 9,000원');
    console.log('🎨 주최/주관: 동성갤러리');
    console.log('🇫🇷 후원: 주한 프랑스대사관 문화과');
    console.log('✨ 특징: 프랑스 현대화가의 국내 첫 개인전');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importHangaramIsabelleDeGanayMoments2025();