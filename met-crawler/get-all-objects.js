const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// HTTPS 에이전트
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Met Museum API 기본 설정
const axiosInstance = axios.create({
  httpsAgent,
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

async function getAllObjectIDs() {
  console.log('📋 Met Museum 전체 오브젝트 ID 목록 가져오기...\n');
  
  try {
    // 전체 오브젝트 ID 목록 가져오기
    const response = await axiosInstance.get(
      'https://collectionapi.metmuseum.org/public/collection/v1/objects'
    );
    
    console.log(`✅ 총 ${response.data.total} 개의 오브젝트 발견!`);
    console.log(`📊 ID 개수: ${response.data.objectIDs.length}`);
    
    // 파일로 저장
    const outputPath = path.join(__dirname, 'met-all-object-ids.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      total: response.data.total,
      date: new Date().toISOString(),
      objectIDs: response.data.objectIDs
    }, null, 2));
    
    console.log(`\n💾 저장 완료: ${outputPath}`);
    
    // 랜덤하게 섞은 버전도 저장
    const shuffled = [...response.data.objectIDs].sort(() => Math.random() - 0.5);
    const shuffledPath = path.join(__dirname, 'met-object-ids-shuffled.json');
    fs.writeFileSync(shuffledPath, JSON.stringify({
      total: response.data.total,
      date: new Date().toISOString(),
      objectIDs: shuffled
    }, null, 2));
    
    console.log(`🔀 무작위 섞은 버전 저장: ${shuffledPath}`);
    
    return response.data.objectIDs;
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    return null;
  }
}

// 특정 부서의 오브젝트만 가져오기
async function getObjectsByDepartment(departmentId, departmentName) {
  try {
    console.log(`\n🏛️ ${departmentName} 부서 오브젝트 조회 중...`);
    
    const response = await axiosInstance.get(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${departmentId}`
    );
    
    console.log(`  ✅ ${response.data.total} 개 발견`);
    return response.data.objectIDs || [];
    
  } catch (error) {
    console.error(`  ❌ 오류: ${error.message}`);
    return [];
  }
}

// 주요 부서별로 오브젝트 수집
async function collectByDepartments() {
  console.log('\n📂 주요 부서별 오브젝트 수집...\n');
  
  const departments = [
    { id: 11, name: 'European Paintings' },
    { id: 9, name: 'Drawings and Prints' },
    { id: 6, name: 'Asian Art' },
    { id: 21, name: 'Modern and Contemporary Art' },
    { id: 19, name: 'Photographs' },
    { id: 1, name: 'American Decorative Arts' },
    { id: 10, name: 'Egyptian Art' },
    { id: 13, name: 'Greek and Roman Art' },
    { id: 14, name: 'Islamic Art' },
    { id: 17, name: 'Medieval Art' }
  ];
  
  const allDepartmentObjects = {};
  
  for (const dept of departments) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
    const objects = await getObjectsByDepartment(dept.id, dept.name);
    if (objects.length > 0) {
      allDepartmentObjects[dept.name] = objects.slice(0, 1000); // 각 부서당 최대 1000개
    }
  }
  
  // 저장
  const outputPath = path.join(__dirname, 'met-objects-by-department.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    date: new Date().toISOString(),
    departments: allDepartmentObjects,
    totalObjects: Object.values(allDepartmentObjects).reduce((sum, arr) => sum + arr.length, 0)
  }, null, 2));
  
  console.log(`\n💾 부서별 오브젝트 저장: ${outputPath}`);
}

// 실행
async function main() {
  // 1. 전체 오브젝트 ID 가져오기
  await getAllObjectIDs();
  
  // 2. 부서별로도 가져오기
  await collectByDepartments();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getAllObjectIDs, getObjectsByDepartment };