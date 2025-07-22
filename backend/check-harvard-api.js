#!/usr/bin/env node
const axios = require('axios');

// Harvard Art Museums API 테스트
async function testHarvardAPI() {
  console.log('🏛️ Harvard Art Museums API 테스트\n');
  
  const API_KEY = process.env.HARVARD_API_KEY || ''; // 환경변수에서 가져오기
  
  if (!API_KEY) {
    console.error('❌ HARVARD_API_KEY 환경변수가 설정되지 않았습니다.');
    console.log('터미널에서: export HARVARD_API_KEY="your-api-key-here"');
    console.log('또는 .env 파일에: HARVARD_API_KEY=your-api-key-here');
    process.exit(1);
  }
  const baseUrl = 'https://api.harvardartmuseums.org';
  
  try {
    // 1. 전시 엔드포인트 테스트
    console.log('1️⃣ 전시(Exhibition) 엔드포인트 테스트:');
    const exhibitionResponse = await axios.get(`${baseUrl}/exhibition`, {
      params: {
        apikey: API_KEY,
        status: 'current',
        size: 5
      }
    });
    
    if (exhibitionResponse.data.records) {
      console.log(`✅ 현재 전시: ${exhibitionResponse.data.records.length}개`);
      exhibitionResponse.data.records.forEach(ex => {
        console.log(`   - ${ex.title || 'Untitled'}`);
        console.log(`     기간: ${ex.begindate} ~ ${ex.enddate}`);
        console.log(`     장소: ${ex.venues?.[0]?.name || 'N/A'}`);
      });
    }
    
    // 2. 갤러리 정보
    console.log('\n2️⃣ 갤러리(Gallery) 엔드포인트 테스트:');
    const galleryResponse = await axios.get(`${baseUrl}/gallery`, {
      params: {
        apikey: API_KEY,
        floor: 2,
        size: 3
      }
    });
    
    if (galleryResponse.data.records) {
      console.log(`✅ 갤러리 정보: ${galleryResponse.data.records.length}개`);
    }
    
    // 3. 이벤트 정보
    console.log('\n3️⃣ 이벤트(Event) 엔드포인트 테스트:');
    const eventResponse = await axios.get(`${baseUrl}/event`, {
      params: {
        apikey: API_KEY,
        venue: 'Lecture Hall',
        size: 3
      }
    });
    
    if (eventResponse.data.records) {
      console.log(`✅ 이벤트: ${eventResponse.data.records.length}개`);
    }
    
  } catch (error) {
    console.error('❌ API 오류:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n📝 API 키 발급 방법:');
      console.log('1. https://www.harvardartmuseums.org/collections/api 방문');
      console.log('2. "Get started" 클릭');
      console.log('3. 이메일로 회원가입 (무료)');
      console.log('4. API 키 즉시 발급');
      console.log('5. 일일 2,500 요청 제한');
      
      console.log('\n✅ 장점:');
      console.log('- 실제 전시 정보 제공');
      console.log('- 갤러리별 현재 전시 작품');
      console.log('- 이벤트 정보 포함');
      console.log('- 높은 데이터 품질');
    }
  }
}

testHarvardAPI();