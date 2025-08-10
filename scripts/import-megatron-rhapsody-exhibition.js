const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importMegatronRhapsodyExhibition() {
  console.log('📺 메가트론 랩소디 상설전 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '메가트론 랩소디',
      title_en: 'Megatron Rhapsody',
      subtitle: '백남준을 기억하는 집 상설전',
      
      // 날짜 (상설 전시)
      start_date: '2025-06-17',
      end_date: '2099-12-31', // 상설 전시
      exhibition_type: 'permanent',
      status: 'upcoming', // 2025년 6월 17일 개막 예정
      
      // 장소 정보
      venue_name: '서울시립 백남준을 기억하는 집',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 종로구 창신동, 1층 전시실',
      
      // 전시 설명
      description: `2025년 6월 17일 개막하는 상설전 《메가트론 랩소디》는 백남준이 창신동에 살았던 유년부터 세계적인 명성을 획득한 말년까지 그의 여정과 후기 대표작 〈서울 랩소디〉에 관한 심도 있는 이해를 바탕으로 백남준의 동시대성을 살펴보는 전시입니다.

전시 제목은 서울시립미술관 본관 상설 설치작품 〈서울 랩소디〉와 해당 작업의 주요 형식인 '메가트론'에서 연유합니다. 〈서울 랩소디〉가 600년 넘게 한국의 수도로 이어져 내려온 서울의 역동성과 다층성을 자유롭게 풀어낸 작품이라면, 《메가트론 랩소디》는 백남준의 생애와 후기 작업, 동시대 작가의 작업을 자유롭게 오가며 백남준 예술 세계의 진폭을 확장하는 전시입니다.

[전시 구성]

【리믹스】
백남준이 기존 영상을 재편집하고 리믹스한 비디오 소스를 활용했듯이, 작가에 관한 기존 정보를 재조합하고 편집하여 백남준을 새롭게 읽기

【메가트론】
백남준 탄생 90주년 기념 국제심포지엄 자료를 중심으로 '메가트론' 개념과 〈서울 랩소디〉의 제작기 및 운영 구조 분석

【동기신호】
관객 참여를 중시한 백남준의 의지를 계승한 동시대 작가의 관객 참여형 작품
격년으로 선보일 미디어 기반의 실험적 작업

[참여 작가]
• 김상돈, 노치욱, 이정성, 최욱, 황병기
• 폴 개린(Paul Garrin)
• 프로토룸(Protorrom)

[연계 프로그램]
• 프로토룸 〈Matter Matters: 탐색을 기다리며〉 퍼포먼스
• 일시: 2025년 6월 21일(토) 16:00-16:40

[운영 정보]
• 관람 시간: 10:00-19:00 (화-일)
• 휴관일: 매주 월요일, 1월 1일
• 도슨트: 매주 일요일 15:00
• 관람료: 무료

문의: 유은순 02-2124-5268`,
      
      // 작가 정보
      artists: ['김상돈', '노치욱', '이정성', '최욱', '황병기', '폴 개린', '프로토룸'],
      curator: '서울시립 백남준을 기억하는 집',
      
      // 작품 정보 - 미디어아트 중심
      artworks_count: 0, // 구체적 작품 수 미정
      
      // 관람 정보
      admission_fee: '무료',
      operating_hours: JSON.stringify({
        평일: '10:00-19:00 (화-금)',
        주말: '10:00-19:00',
        휴관일: '월요일, 1월 1일',
        도슨트: '매주 일요일 15:00'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        전시문의: '유은순 02-2124-5268',
        관람문의: 'SeMA 백남준기념관 02-2124-5268'
      }),
      phone_number: '02-2124-5268',
      
      // URL 정보
      official_url: 'https://sema.seoul.go.kr',
      website_url: 'https://sema.seoul.go.kr',
      
      // 데이터 메타정보
      source: 'seoul_museum_official',
      source_url: 'https://sema.seoul.go.kr',
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
    
    console.log('✅ 메가트론 랩소디 상설전 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 장소: ${data[0].venue_name}`);
    console.log(`  - 유형: ${data[0].exhibition_type} (상설 전시)`);
    console.log(`  - 개막일: 2025년 6월 17일`);
    console.log(`  - 참여 작가: ${data[0].artists.length}명`);
    console.log(`  - 상태: ${data[0].status}`);
    
    // 서울시립미술관 전체 상설 전시 최종 통계
    console.log('\n🔍 서울시립미술관 최종 상설 전시 현황...');
    const { data: allPermanent, error: allError } = await supabase
      .from('exhibitions')
      .select('venue_name, title_local, start_date, status')
      .eq('exhibition_type', 'permanent')
      .or('venue_name.ilike.%서울시립%,venue_name.ilike.%백남준%')
      .order('venue_name');
    
    if (!allError && allPermanent) {
      const semaOnly = allPermanent.filter(ex => 
        ex.venue_name && (ex.venue_name.includes('서울시립') || ex.venue_name.includes('백남준'))
      );
      
      console.log(`\n📌 서울시립미술관 계열 상설 전시 총 ${semaOnly.length}개`);
      
      const byStatus = {
        ongoing: [],
        upcoming: []
      };
      
      semaOnly.forEach(ex => {
        if (ex.status) {
          if (!byStatus[ex.status]) byStatus[ex.status] = [];
          byStatus[ex.status].push(ex);
        }
      });
      
      if (byStatus.ongoing.length > 0) {
        console.log(`\n[현재 운영중] ${byStatus.ongoing.length}개`);
        byStatus.ongoing.forEach(ex => {
          console.log(`  - ${ex.title_local} (${ex.venue_name})`);
        });
      }
      
      if (byStatus.upcoming.length > 0) {
        console.log(`\n[개막 예정] ${byStatus.upcoming.length}개`);
        byStatus.upcoming.forEach(ex => {
          console.log(`  - ${ex.title_local} (${ex.venue_name}) - ${ex.start_date}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importMegatronRhapsodyExhibition();