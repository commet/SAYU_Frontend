#!/usr/bin/env node

const axios = require('axios');

// Met Museum API 간단 테스트
async function testMetMuseumAPI() {
  console.log('🏛️ Met Museum API 테스트 시작\n');
  
  const baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';
  
  try {
    console.log('1️⃣ API 연결 테스트...');
    const healthCheck = await axios.get(`${baseUrl}/objects`);
    console.log(`✅ API 연결 성공! 총 작품 수: ${healthCheck.data.total.toLocaleString()}개`);
    
    console.log('\n2️⃣ 한국 관련 작품 검색...');
    const koreanSearch = await axios.get(`${baseUrl}/search?hasImages=true&q=korea`);
    const koreanCount = koreanSearch.data.total;
    console.log(`🇰🇷 한국 관련 작품: ${koreanCount}개`);
    
    if (koreanCount > 0) {
      // 첫 번째 작품 상세 정보 가져오기
      const firstObjectId = koreanSearch.data.objectIDs[0];
      const objectDetail = await axios.get(`${baseUrl}/objects/${firstObjectId}`);
      
      console.log('\n📋 첫 번째 한국 관련 작품:');
      console.log(`   제목: ${objectDetail.data.title}`);
      console.log(`   작가: ${objectDetail.data.artistDisplayName || '미상'}`);
      console.log(`   년도: ${objectDetail.data.objectDate || '미상'}`);
      console.log(`   부서: ${objectDetail.data.department}`);
      console.log(`   이미지: ${objectDetail.data.primaryImageSmall ? '있음' : '없음'}`);
    }
    
    console.log('\n3️⃣ 인상주의 작품 검색...');
    const impressionismSearch = await axios.get(`${baseUrl}/search?hasImages=true&q=impressionism`);
    console.log(`🎨 인상주의 작품: ${impressionismSearch.data.total}개`);
    
    console.log('\n4️⃣ Van Gogh 작품 검색...');
    const vanGoghSearch = await axios.get(`${baseUrl}/search?hasImages=true&q=van gogh`);
    console.log(`🌻 Van Gogh 작품: ${vanGoghSearch.data.total}개`);
    
    if (vanGoghSearch.data.total > 0) {
      const vanGoghId = vanGoghSearch.data.objectIDs[0];
      const vanGoghDetail = await axios.get(`${baseUrl}/objects/${vanGoghId}`);
      
      console.log('\n🖼️ Van Gogh 작품 예시:');
      console.log(`   제목: ${vanGoghDetail.data.title}`);
      console.log(`   년도: ${vanGoghDetail.data.objectDate}`);
      console.log(`   매체: ${vanGoghDetail.data.medium}`);
      console.log(`   이미지 URL: ${vanGoghDetail.data.primaryImageSmall}`);
    }
    
    console.log('\n5️⃣ 최근 하이라이트 작품들...');
    const highlights = await axios.get(`${baseUrl}/search?hasImages=true&isHighlight=true`);
    console.log(`⭐ 하이라이트 작품: ${highlights.data.total}개`);
    
    // 무작위로 5개 하이라이트 작품 정보 가져오기
    if (highlights.data.total > 0) {
      console.log('\n🎯 하이라이트 작품 샘플:');
      const sampleIds = highlights.data.objectIDs.slice(0, 5);
      
      for (let i = 0; i < sampleIds.length; i++) {
        try {
          const detail = await axios.get(`${baseUrl}/objects/${sampleIds[i]}`);
          console.log(`   ${i + 1}. ${detail.data.title} (${detail.data.artistDisplayName || '미상'}) - ${detail.data.objectDate}`);
          
          // API 요청 제한 준수를 위한 지연
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.log(`   ${i + 1}. [데이터 로드 실패]`);
        }
      }
    }
    
    console.log('\n✅ Met Museum API 테스트 완료!');
    console.log('\n💡 결론:');
    console.log('   - Met Museum API는 안정적으로 작동');
    console.log('   - 다양한 카테고리의 작품 검색 가능');
    console.log('   - 고품질 이미지 제공');
    console.log('   - 데일리 챌린지용 작품 선별 가능');
    
  } catch (error) {
    console.error('❌ API 테스트 실패:', error.message);
    if (error.response) {
      console.error('   상태 코드:', error.response.status);
      console.error('   응답 데이터:', error.response.data);
    }
  }
}

// 테스트 실행
testMetMuseumAPI().catch(console.error);