const CultureAPIService = require('./src/services/cultureAPIService');
const axios = require('axios');

async function testCultureAPI() {
  console.log('🧪 문화 전시 정보 수집 통합 테스트');
  console.log('=' .repeat(50));
  
  const cultureAPI = new CultureAPIService();
  const testResults = {
    apiKeyStatus: null,
    cultureAPI: { success: false, count: 0, errors: [] },
    seoulAPI: { success: false, count: 0, errors: [] },
    crawling: { success: false, count: 0, errors: [] },
    total: { success: false, count: 0, uniqueCount: 0 }
  };
  
  // 1. API 키 상태 확인
  console.log('\n1️⃣ API 키 상태 확인');
  const keyValidation = cultureAPI.validateAPIKeys();
  testResults.apiKeyStatus = keyValidation;
  
  console.log('🔑 문화데이터광장 API 키:', keyValidation.issues.includes('문화데이터광장') ? '❌ 미설정' : '✅ 설정됨');
  console.log('🔑 서울시 API 키:', keyValidation.issues.includes('서울시') ? '❌ 미설정' : '✅ 설정됨');
  console.log('🔑 크롤링 활성화:', process.env.EXHIBITION_CRAWLING_ENABLED !== 'false' ? '✅ 활성' : '❌ 비활성');
  
  // 2. 각 API 및 크롤링 개별 테스트
  console.log('\n2️⃣ 개별 데이터 소스 테스트\n');
  
  // 2-1. 문화데이터광장 API 테스트
  if (process.env.CULTURE_API_KEY) {
    try {
      console.log('🔵 문화데이터광장 API 테스트...');
      const exhibitions = await cultureAPI.getExhibitionsFromAPI({ rows: 10 });
      testResults.cultureAPI.success = true;
      testResults.cultureAPI.count = exhibitions.length;
      console.log(`  ✅ 성공: ${exhibitions.length}개 전시 정보 수집`);
      
      if (exhibitions.length > 0) {
        const majorCount = exhibitions.filter(e => e.isMajorInstitution).length;
        console.log(`  🏛️ 주요 기관: ${majorCount}개`);
        console.log(`  🗓️ 첫 전시: ${exhibitions[0].title} @ ${exhibitions[0].venue}`);
      }
    } catch (error) {
      testResults.cultureAPI.errors.push(error.message);
      console.error(`  ❌ 실패: ${error.message}`);
    }
  } else {
    console.log('🔵 문화데이터광장 API 테스트...');
    console.log('  ⚠️ 건너뛰: API 키 미설정');
  }
  
  // 2-2. 서울시 API 테스트
  if (process.env.SEOUL_API_KEY) {
    try {
      console.log('\n🔴 서울시 열린데이터 API 테스트...');
      const seoulExhibitions = await cultureAPI.getSeoulExhibitions();
      testResults.seoulAPI.success = true;
      testResults.seoulAPI.count = seoulExhibitions.length;
      console.log(`  ✅ 성공: ${seoulExhibitions.length}개 전시 정보 수집`);
      
      if (seoulExhibitions.length > 0) {
        console.log(`  🗓️ 첫 전시: ${seoulExhibitions[0].title} @ ${seoulExhibitions[0].venue}`);
      }
    } catch (error) {
      testResults.seoulAPI.errors.push(error.message);
      console.error(`  ❌ 실패: ${error.message}`);
    }
  } else {
    console.log('\n🔴 서울시 열린데이터 API 테스트...');
    console.log('  ⚠️ 건너뛰: API 키 미설정');
  }
  
  // 2-3. 크롤링 테스트 (샘플)
  if (process.env.EXHIBITION_CRAWLING_ENABLED !== 'false') {
    try {
      console.log('\n🟢 크롤링 테스트 (샘플: 국립현대미술관)...');
      // 단일 갤러리만 테스트
      const testGallery = {
        name: '국립현대미술관',
        url: 'https://www.mmca.go.kr/exhibitions/exhiList.do?exhiStatusCode=ING',
        selector: '.exhibition-list .exhibition-item',
        titleSelector: '.tit a',
        dateSelector: '.date',
        imageSelector: '.img img',
        venueSelector: '.place',
        linkPrefix: 'https://www.mmca.go.kr'
      };
      
      const crawledData = await cultureAPI.crawlGallery(testGallery);
      testResults.crawling.success = crawledData.length > 0;
      testResults.crawling.count = crawledData.length;
      
      if (crawledData.length > 0) {
        console.log(`  ✅ 성공: ${crawledData.length}개 전시 크롤링`);
        console.log(`  🗓️ 첫 전시: ${crawledData[0].title}`);
      } else {
        console.log('  ⚠️ 크롤링 결과 없음');
      }
    } catch (error) {
      testResults.crawling.errors.push(error.message);
      console.error(`  ❌ 실패: ${error.message}`);
      console.log('  💡 Puppeteer 설치 확인: npm install puppeteer');
    }
  } else {
    console.log('\n🟢 크롤링 테스트...');
    console.log('  ⚠️ 건너뛰: 크롤링 비활성화');
  }
  
  // 3. 통합 테스트
  console.log('\n3️⃣ 통합 전시 정보 수집 테스트\n');
  
  try {
    console.log('🔄 통합 수집 실행 중...');
    const integratedResult = await cultureAPI.collectAllExhibitions();
    
    if (integratedResult.success) {
      testResults.total.success = true;
      testResults.total.count = integratedResult.meta.total;
      testResults.total.uniqueCount = integratedResult.meta.unique;
      
      console.log('\n📊 통합 수집 결과:');
      console.log(`  🔵 문화데이터광장: ${integratedResult.meta.cultureAPI}개`);
      console.log(`  🔴 서울시 API: ${integratedResult.meta.seoulAPI}개`);
      console.log(`  🟢 크롤링: ${integratedResult.meta.crawled}개`);
      console.log(`  📊 총합: ${integratedResult.meta.total}개`);
      console.log(`  🎯 중복 제거 후: ${integratedResult.meta.unique}개`);
      
      // 주요 기관 통계
      const majorInstitutions = integratedResult.data.filter(e => e.isMajorInstitution);
      console.log(`  🏛️ 주요 기관 전시: ${majorInstitutions.length}개`);
    } else {
      console.error('❌ 통합 수집 실패:', integratedResult.error);
    }
  } catch (error) {
    console.error('❌ 통합 테스트 오류:', error.message);
  }
  
  // 4. 최종 결과 요약
  console.log('\n=' .repeat(50));
  console.log('🎯 테스트 결과 요약');
  console.log('=' .repeat(50));
  
  console.log('\n🔑 API 키 상태:');
  console.log(`  - 문화데이터광장: ${process.env.CULTURE_API_KEY ? '✅' : '❌'}`);
  console.log(`  - 서울시: ${process.env.SEOUL_API_KEY ? '✅' : '❌'}`);
  
  console.log('\n📊 수집 결과:');
  console.log(`  - 문화 API: ${testResults.cultureAPI.success ? `✅ ${testResults.cultureAPI.count}개` : '❌'}`);
  console.log(`  - 서울 API: ${testResults.seoulAPI.success ? `✅ ${testResults.seoulAPI.count}개` : '❌'}`);
  console.log(`  - 크롤링: ${testResults.crawling.success ? `✅ ${testResults.crawling.count}개` : '❌'}`);
  console.log(`  - 통합: ${testResults.total.success ? `✅ 총 ${testResults.total.count}개 (중복제거: ${testResults.total.uniqueCount}개)` : '❌'}`);
  
  if (!keyValidation.isValid) {
    console.log('\n📝 다음 단계:');
    console.log('1. 필요한 API 키 발급:');
    console.log('   - 문화데이터광장: https://www.culture.go.kr/data');
    console.log('   - 서울시 열린데이터: https://data.seoul.go.kr');
    console.log('2. backend/.env 파일에 API 키 추가');
    console.log('3. npm install puppeteer (크롤링이 필요한 경우)');
  }
  
  console.log('\n🎉 테스트 완료!');
  console.log('=' .repeat(50));
}

// 스크립트 실행
if (require.main === module) {
  testCultureAPI().catch(console.error);
}

module.exports = testCultureAPI;