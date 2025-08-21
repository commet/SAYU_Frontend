/**
 * 🏛️ MET Museum API 탐색
 * 공식 API로 Object ID와 메타데이터 수집
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🏛️ MET Museum API 탐색 시작!');
console.log('=====================================');

function apiRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`JSON 파싱 오류: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function exploreMetAPI() {
  try {
    console.log('🔍 1. MET API 기본 정보 확인...\n');
    
    // 1. 전체 Object ID 목록 (처음 100개만)
    console.log('📊 전체 컬렉션 Object ID 조회...');
    const allObjects = await apiRequest('https://collectionapi.metmuseum.org/public/collection/v1/objects');
    console.log(`✅ 총 MET 작품 수: ${allObjects.total?.toLocaleString() || 'Unknown'}개`);
    console.log(`📋 처음 20개 Object ID: ${allObjects.objectIDs?.slice(0, 20).join(', ')}`);
    
    // 2. 알려진 ID 205641 주변 확인
    console.log('\n🔍 2. 205641 주변 Object ID들 정보 조회...\n');
    
    const targetIds = [205641, 205640, 205639, 205642, 205643, 205644];
    const foundObjects = [];
    
    for (const objectId of targetIds) {
      try {
        console.log(`🔍 Object ID ${objectId} 조회 중...`);
        const objectData = await apiRequest(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`);
        
        if (objectData.objectID) {
          foundObjects.push(objectData);
          console.log(`✅ ID ${objectId}: ${objectData.title || 'No Title'}`);
          console.log(`   작가: ${objectData.artistDisplayName || 'Unknown'}`);
          console.log(`   부서: ${objectData.department || 'Unknown'}`);
          console.log(`   연도: ${objectData.objectDate || 'Unknown'}`);
          console.log(`   문화권: ${objectData.culture || 'Unknown'}`);
          console.log(`   분류: ${objectData.classification || 'Unknown'}`);
          console.log(`   공개여부: ${objectData.isPublicDomain ? '공개' : '비공개'}`);
          
          if (objectData.primaryImage) {
            console.log(`   📸 이미지: ${objectData.primaryImage.substring(0, 80)}...`);
          }
        } else {
          console.log(`❌ ID ${objectId}: 데이터 없음`);
        }
        console.log('');
        
        // API 속도 제한 준수
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`❌ ID ${objectId}: 조회 실패 (${error.message})`);
      }
    }
    
    // 3. 시카고 관련 작품들 검색
    console.log('🔍 3. "Chicago" 관련 작품 검색...\n');
    try {
      const chicagoSearch = await apiRequest('https://collectionapi.metmuseum.org/public/collection/v1/search?q=chicago');
      console.log(`✅ Chicago 검색 결과: ${chicagoSearch.total}개 작품`);
      
      if (chicagoSearch.objectIDs && chicagoSearch.objectIDs.length > 0) {
        console.log(`📋 처음 20개 Chicago 관련 ID: ${chicagoSearch.objectIDs.slice(0, 20).join(', ')}`);
        
        // 몇 개 샘플 확인
        for (let i = 0; i < Math.min(3, chicagoSearch.objectIDs.length); i++) {
          const sampleId = chicagoSearch.objectIDs[i];
          try {
            const sampleObject = await apiRequest(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${sampleId}`);
            console.log(`\n📋 샘플 ${i+1} - ID ${sampleId}:`);
            console.log(`   제목: ${sampleObject.title || 'No Title'}`);
            console.log(`   작가: ${sampleObject.artistDisplayName || 'Unknown'}`);
            console.log(`   부서: ${sampleObject.department || 'Unknown'}`);
            
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.log(`❌ 샘플 ${sampleId} 조회 실패`);
          }
        }
      }
    } catch (error) {
      console.log(`❌ Chicago 검색 실패: ${error.message}`);
    }
    
    // 4. 부서별 작품 분석
    console.log('\n🔍 4. 주요 부서별 작품 ID 패턴 분석...\n');
    const departments = ['American Decorative Arts', 'European Paintings', 'Asian Art', 'Modern Art'];
    
    for (const dept of departments) {
      try {
        console.log(`🏛️ ${dept} 부서 검색...`);
        const deptSearch = await apiRequest(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(dept)}`);
        
        if (deptSearch.objectIDs && deptSearch.objectIDs.length > 0) {
          const sampleIds = deptSearch.objectIDs.slice(0, 10);
          console.log(`   ✅ ${deptSearch.total}개 작품, 샘플 ID: ${sampleIds.join(', ')}`);
          
          // ID 범위 분석
          const minId = Math.min(...sampleIds);
          const maxId = Math.max(...sampleIds);
          console.log(`   📊 ID 범위: ${minId} ~ ${maxId}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`❌ ${dept} 검색 실패`);
      }
    }
    
    // 결과 분석 및 Cloudinary 매칭 전략
    console.log('\n🧠 분석 결과 및 Cloudinary 매칭 전략');
    console.log('=====================================');
    
    if (foundObjects.length > 0) {
      console.log('✅ 발견된 패턴들:');
      foundObjects.forEach(obj => {
        console.log(`   ID ${obj.objectID}: ${obj.department} - ${obj.classification}`);
      });
      
      // Cloudinary 파일명 추론
      console.log('\n🔍 Cloudinary 파일명 추론:');
      console.log('현재 알려진: met-chicago-205641.jpg');
      
      foundObjects.forEach(obj => {
        if (obj.objectID !== 205641) {
          const possibleNames = [
            `met-${obj.department?.toLowerCase().replace(/\s+/g, '-')}-${obj.objectID}`,
            `met-${obj.classification?.toLowerCase().replace(/\s+/g, '-')}-${obj.objectID}`,
            `met-${obj.culture?.toLowerCase().replace(/\s+/g, '-')}-${obj.objectID}`,
            `met-obj-${obj.objectID}`,
            `met-art-${obj.objectID}`
          ].filter(name => name && !name.includes('undefined'));
          
          console.log(`   ID ${obj.objectID} 가능한 파일명:`);
          possibleNames.forEach(name => {
            console.log(`      ${name}.jpg`);
          });
        }
      });
    }
    
    // 다음 단계 제안
    console.log('\n🚀 다음 단계 실행 계획');
    console.log('=====================================');
    console.log('1. 위 추론된 파일명들로 Cloudinary URL 테스트');
    console.log('2. 성공한 패턴으로 대량 ID 범위 스캔');
    console.log('3. MET API 메타데이터와 Cloudinary 이미지 매칭');
    console.log('4. APT 유형별 작품 분류');
    
    // 결과 저장
    const results = {
      apiExplorationDate: new Date().toISOString(),
      totalMetObjects: allObjects.total,
      sampleObjectIds: allObjects.objectIDs?.slice(0, 100),
      foundObjects,
      chicagoRelated: chicagoSearch?.total || 0,
      filenameSuggestions: foundObjects.map(obj => ({
        objectId: obj.objectID,
        possibleFilenames: [
          `met-${obj.department?.toLowerCase().replace(/\s+/g, '-')}-${obj.objectID}`,
          `met-${obj.classification?.toLowerCase().replace(/\s+/g, '-')}-${obj.objectID}`,
          `met-obj-${obj.objectID}`,
          `met-art-${obj.objectID}`
        ].filter(name => name && !name.includes('undefined'))
      }))
    };
    
    const resultsDir = path.join(__dirname, '../artvee-crawler/met-api-analysis');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, 'met-api-exploration.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\n💾 결과 저장: met-api-analysis/met-api-exploration.json');
    
  } catch (error) {
    console.error('❌ MET API 탐색 중 오류:', error.message);
  }
}

exploreMetAPI();