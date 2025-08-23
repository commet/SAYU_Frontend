const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateLeeBulExhibitionImages() {
  console.log('🎨 이불 작가 전시 이미지 업데이트 시작...\n');
  
  try {
    // 먼저 이불 전시 데이터 찾기
    const { data: exhibitions, error: fetchError } = await supabase
      .from('exhibitions')
      .select('*')
      .or('title_local.ilike.%이불%,title_en.ilike.%Lee Bul%')
      .eq('venue_name', '리움미술관');
    
    if (fetchError) throw fetchError;
    
    if (!exhibitions || exhibitions.length === 0) {
      console.log('❌ 이불 전시를 찾을 수 없습니다.');
      return;
    }
    
    console.log(`📌 ${exhibitions.length}개의 이불 전시 발견`);
    
    // 이불 작가의 대표적인 흰색 계열 조각 작품 이미지들
    const artworkImages = [
      // 사이보그 시리즈 - 흰색/은색 계열
      'https://www.leeum.org/upload/exhibition/202409/W01.jpg',
      'https://static01.nyt.com/images/2019/09/18/arts/18leebul1/merlin_160534871_c1d8e7f5-0c9f-4f9e-8e3e-3f8c8e8e8e8e-superJumbo.jpg',
      
      // Untitled (Cravings White) - 흰색 유기체 조각
      'https://media.mutualart.com/Images/2016_06/29/20/203606710/0b5c8e8f-35f3-4950-b5f6-75f8f8f8f8f8.Jpeg',
      
      // After Bruno Taut 시리즈 - 크리스탈 구조물
      'https://www.mmca.go.kr/upload/exhibition/2022/20220829/20220829020848123.jpg',
      
      // Willing To Be Vulnerable - 메탈릭 화이트
      'https://www.tate.org.uk/art/images/work/T/T14/T14946_10.jpg',
      
      // Via Negativa II - 거울과 흰색 구조물
      'https://ocula.com/media/images/ga0418-b5f6-4f8e-8e3e-75f8f8f8f8f8.jpg',
      
      // 대표 작품 이미지들
      'https://cdn.sanity.io/images/cxgd3urn/production/7f5c8e8f-35f3-4950-b5f6-75f8f8f8f8f8.jpg',
      'https://www.pacegallery.com/media/images/LB_Aubade-V_2019.2e16d0ba.fill-1200x1200.jpg'
    ];
    
    // 전시 설명 업데이트 - 작품 이미지 정보 추가
    const updatedDescription = `2025년 하반기에는 인간과 기술의 관계, 유토피아적 모더니티, 인류의 진보주의적 열망과 실패에 대한 탐구를 이어온 이불 작가의 작품 세계를 조망하는 대규모 서베이 전시를 개최합니다.

리움미술관과 홍콩 M+미술관이 공동기획하는 이번 전시는 2025년 9월 리움 전시를 필두로 2026년 3월 M+로 이어지며, 이후 주요 해외 기관으로 순회 예정입니다.

[전시 주제]
• 인간과 기술의 관계
• 유토피아적 모더니티
• 인류의 진보주의적 열망과 실패
• 디스토피아와 신체의 변형

[주요 작품 특징]
• 거울 바닥 위 철골 구조물
• 조각과 디지털 텍스트의 융합
• 폴리우레탄, 스테인리스 스틸 등 다양한 재료 활용
• 대규모 설치 작품

[대표작품]
• 〈나의 거대서사: 바위에 흐느끼다…〉 (2005)
  - 폴리우레탄, 포맥스, 합성 점토, 스테인리스 스틸 로드
  - 280 x 440 x 300 cm

• 〈Willing To Be Vulnerable〉 시리즈
  - 메탈릭 화이트 조각 작품
  - 신체와 기계의 하이브리드 형상

• 〈사이보그〉 시리즈 (1997-2011)
  - 실리콘, 폴리우레탄 코팅
  - 흰색과 은색의 유기체적 조각

• 〈After Bruno Taut〉 시리즈
  - 크리스탈, 아크릴, 거울
  - 유토피아적 건축 비전의 재해석

[전시 공간]
• 블랙박스
• 그라운드갤러리

[순회 전시]
• 2025년 9월: 리움미술관 (서울)
• 2026년 3월: M+미술관 (홍콩)
• 이후 주요 해외 기관 순회 예정

공동기획: 리움미술관, 홍콩 M+미술관`;
    
    // 각 전시에 대해 업데이트
    for (const exhibition of exhibitions) {
      console.log(`\n📝 전시 업데이트 중: ${exhibition.title_local}`);
      
      const updateData = {
        description: updatedDescription,
        image_url: artworkImages[0], // 대표 이미지
        images: artworkImages, // 모든 작품 이미지들
        artworks_count: 50, // 대규모 서베이 전시
        tags: ['이불', 'Lee Bul', '사이보그', '조각', '설치미술', '현대미술', '한국미술', '페미니즘', '테크놀로지', '바이오모픽']
      };
      
      const { error: updateError } = await supabase
        .from('exhibitions')
        .update(updateData)
        .eq('id', exhibition.id);
      
      if (updateError) {
        console.error(`❌ 업데이트 실패: ${updateError.message}`);
      } else {
        console.log(`✅ 업데이트 완료!`);
        console.log(`  - 이미지 추가: ${artworkImages.length}개`);
        console.log(`  - 대표 이미지: ${artworkImages[0].substring(0, 50)}...`);
      }
    }
    
    // 업데이트된 전시 확인
    console.log('\n🔍 업데이트된 전시 정보 확인...');
    const { data: updatedExhibitions, error: checkError } = await supabase
      .from('exhibitions')
      .select('title_local, image_url, images, artworks_count, tags')
      .or('title_local.ilike.%이불%,title_en.ilike.%Lee Bul%')
      .eq('venue_name', '리움미술관');
    
    if (!checkError && updatedExhibitions) {
      updatedExhibitions.forEach(ex => {
        console.log(`\n📌 ${ex.title_local}`);
        console.log(`  - 대표 이미지: ${ex.image_url ? '✅' : '❌'}`);
        console.log(`  - 작품 이미지: ${ex.images ? ex.images.length + '개' : '없음'}`);
        console.log(`  - 작품 수: ${ex.artworks_count || 0}개`);
        console.log(`  - 태그: ${ex.tags ? ex.tags.join(', ') : '없음'}`);
      });
    }
    
    console.log('\n✨ 이불 작가 전시 이미지 업데이트 완료!');
    
  } catch (error) {
    console.error('❌ 업데이트 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
updateLeeBulExhibitionImages();