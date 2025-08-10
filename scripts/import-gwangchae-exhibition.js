const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importGwangchaeExhibition() {
  console.log('📸 광채: 시작의 순간들 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '광채: 시작의 순간들',
      title_en: 'Luminescence: Moments of Beginning',
      subtitle: '서울시립 사진미술관 개관특별전',
      
      // 날짜
      start_date: '2025-05-29',
      end_date: '2025-10-12',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '서울시립 사진미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 도봉구 창동, 3층 3·4전시실',
      
      // 전시 설명
      description: `서울시립 사진미술관의 개관 특별전 《광채 光彩: 시작의 순간들》은, 한국에서 사진이 예술로 자리 잡아 온 여정을 다시 살펴보는 자리입니다.

1880년대 한국 사진이 시작된 이후 사진은 단순한 기록 매체를 넘어 미학적 실험과 사회적 메시지를 전하는 도구로 확장됩니다. 이 전시는 다섯 명의 작가인 정해창, 임석제, 이형록, 조현두, 박영숙이 펼쳐 온 다층적인 실천 속에서 사진이 기술에서 예술로 전환되는 순간들에 주목합니다.

[전시 특징]
• 한국사진사의 형성과 전개 조명
• 2015년부터 10년간의 수집·연구 성과
• 식민지 시기부터 현대까지 사진 예술의 변천사
• 5명 작가의 다층적 실천 탐구

[주요 작가 및 의의]
• 정해창: 식민지 시기 전통 미의식과 서구 조형 언어의 융합
• 임석제: 사진 매체의 비판적 시선
• 이형록: 형식적 실험과 이미지 구성
• 조현두: 주체의 재현 방식 탐구
• 박영숙: 미학적 실험과 사회적 메시지

[전시 정보]
• 장소: 3층 3·4전시실
• 작품수: 157점
• 장르: 사진, 영상
• 관람료: 무료

[도슨트 프로그램]
• 매주 화~일요일 오전 11시, 오후 2시

[운영 시간]
• 평일(화-금): 10:00-20:00
• 주말: 10:00-19:00 (하절기) / 10:00-18:00 (동절기)
• 휴관일: 매주 월요일, 1월 1일

문의: 손현정 02-2124-7617`,
      
      // 작가 정보
      artists: ['정해창', '이형록', '임석제', '조현두', '박영숙'],
      curator: '서울시립 사진미술관',
      
      // 작품 정보
      artworks_count: 157,
      
      // 관람 정보
      admission_fee: '무료',
      operating_hours: JSON.stringify({
        평일: '10:00-20:00 (화-금)',
        주말: '10:00-19:00 (하절기) / 10:00-18:00 (동절기)',
        휴관일: '월요일, 1월 1일',
        도슨트: '화~일 11:00, 14:00'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        전시문의: '손현정 02-2124-7617',
        관람문의: '안내데스크 02-2124-7600'
      }),
      phone_number: '02-2124-7600',
      
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
    
    console.log('✅ 광채: 시작의 순간들 전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 부제: ${data[0].subtitle}`);
    console.log(`  - 장소: ${data[0].venue_name}`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 참여 작가: ${data[0].artists.length}명`);
    console.log(`  - 작품수: ${data[0].artworks_count}점`);
    console.log(`  - 상태: ${data[0].status}`);
    
    // 사진미술관 전시 현황 확인
    console.log('\n🔍 서울시립 사진미술관 전시 현황...');
    const { data: photoMuseumExhibitions, error: photoError } = await supabase
      .from('exhibitions')
      .select('title_local, subtitle, artists, artworks_count')
      .eq('venue_name', '서울시립 사진미술관')
      .order('start_date', { ascending: true });
    
    if (!photoError && photoMuseumExhibitions) {
      console.log(`\n📌 사진미술관 개관특별전: ${photoMuseumExhibitions.length}개`);
      photoMuseumExhibitions.forEach((ex, idx) => {
        console.log(`\n${idx + 1}. ${ex.title_local}`);
        if (ex.subtitle) console.log(`   부제: ${ex.subtitle}`);
        console.log(`   작가: ${ex.artists.join(', ')}`);
        console.log(`   작품: ${ex.artworks_count}점`);
      });
      
      const totalWorks = photoMuseumExhibitions.reduce((sum, ex) => sum + (ex.artworks_count || 0), 0);
      console.log(`\n📊 개관전 총 작품수: ${totalWorks}점`);
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importGwangchaeExhibition();