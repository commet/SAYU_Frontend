/**
 * 🔍 Cloudinary API 엔드포인트 테스트
 * 다양한 공개 API 엔드포인트로 파일 목록 추출 시도
 */

const https = require('https');

console.log('🔍 Cloudinary API 엔드포인트 테스트');
console.log('=====================================');

function testApiEndpoint(url, description) {
  return new Promise((resolve) => {
    console.log(`🔍 테스트: ${description}`);
    console.log(`   URL: ${url}`);
    
    const request = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log(`   ✅ 성공! 데이터 타입: ${typeof parsed}`);
            
            if (Array.isArray(parsed)) {
              console.log(`   📊 배열 길이: ${parsed.length}`);
              if (parsed.length > 0) {
                console.log(`   📋 첫 번째 항목: ${JSON.stringify(parsed[0]).substring(0, 100)}...`);
              }
            } else if (typeof parsed === 'object') {
              console.log(`   📊 객체 키들: ${Object.keys(parsed).join(', ')}`);
              if (parsed.resources) {
                console.log(`   📋 resources 길이: ${parsed.resources.length}`);
              }
            }
            
            resolve({ success: true, data: parsed, url });
          } catch (error) {
            console.log(`   ❌ JSON 파싱 실패: ${error.message}`);
            console.log(`   📄 응답 미리보기: ${data.substring(0, 200)}...`);
            resolve({ success: false, error: 'JSON parse error', url });
          }
        } else {
          console.log(`   ❌ HTTP 오류: ${res.statusCode}`);
          console.log(`   📄 응답: ${data.substring(0, 200)}...`);
          resolve({ success: false, error: `HTTP ${res.statusCode}`, url });
        }
      });
    });
    
    request.on('error', (error) => {
      console.log(`   ❌ 요청 실패: ${error.message}`);
      resolve({ success: false, error: error.message, url });
    });
    
    request.setTimeout(10000, () => {
      console.log(`   ⏰ 타임아웃`);
      request.destroy();
      resolve({ success: false, error: 'Timeout', url });
    });
  });
}

async function testCloudinaryEndpoints() {
  console.log('🚀 Cloudinary API 엔드포인트 테스트 시작...\n');
  
  const endpoints = [
    {
      url: 'https://res.cloudinary.com/dkdzgpj3n/image/list/sayu.json',
      description: 'sayu 폴더 리스트'
    },
    {
      url: 'https://res.cloudinary.com/dkdzgpj3n/image/list/sayu/met-artworks.json',
      description: 'met-artworks 폴더 리스트'
    },
    {
      url: 'https://res.cloudinary.com/dkdzgpj3n/image/list.json',
      description: '전체 이미지 리스트'
    },
    {
      url: 'https://res.cloudinary.com/dkdzgpj3n/resources/image/list',
      description: 'resources 엔드포인트'
    },
    {
      url: 'https://api.cloudinary.com/v1_1/dkdzgpj3n/resources/image',
      description: 'Management API (인증 필요할 수 있음)'
    },
    {
      url: 'https://api.cloudinary.com/v1_1/dkdzgpj3n/folders/sayu/met-artworks',
      description: 'Folders API'
    },
    {
      url: 'https://res.cloudinary.com/dkdzgpj3n/folder/list/sayu.json',
      description: 'folder/list 엔드포인트'
    },
    {
      url: 'https://res.cloudinary.com/dkdzgpj3n/auto/upload/sayu/met-artworks/',
      description: 'auto/upload 엔드포인트'
    }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testApiEndpoint(endpoint.url, endpoint.description);
    results.push(result);
    console.log(''); // 빈 줄
    
    // 성공한 경우 더 자세히 분석
    if (result.success && result.data) {
      console.log('   🔍 상세 분석:');
      
      if (Array.isArray(result.data)) {
        const metFiles = result.data.filter(item => 
          (typeof item === 'string' && item.includes('met-')) ||
          (typeof item === 'object' && (item.public_id?.includes('met-') || item.url?.includes('met-')))
        );
        console.log(`   🎯 MET 관련 항목: ${metFiles.length}개`);
        
        if (metFiles.length > 0) {
          console.log(`   📋 샘플: ${JSON.stringify(metFiles.slice(0, 3), null, 2)}`);
        }
      } else if (result.data.resources) {
        const metResources = result.data.resources.filter(resource => 
          resource.public_id?.includes('met-')
        );
        console.log(`   🎯 MET 리소스: ${metResources.length}개`);
        
        if (metResources.length > 0) {
          console.log(`   📋 샘플: ${JSON.stringify(metResources.slice(0, 2), null, 2)}`);
        }
      }
    }
    
    console.log('─'.repeat(50));
    
    // 성공하면 더 탐색할 필요 없음
    if (result.success && result.data && 
        ((Array.isArray(result.data) && result.data.length > 100) ||
         (result.data.resources && result.data.resources.length > 100))) {
      console.log('🎉 대량 데이터 발견! 추가 테스트 중단');
      break;
    }
  }
  
  // 결과 요약
  console.log('\n🏆 API 테스트 결과 요약');
  console.log('=====================================');
  
  const successfulEndpoints = results.filter(r => r.success);
  console.log(`✅ 성공한 엔드포인트: ${successfulEndpoints.length}개`);
  console.log(`❌ 실패한 엔드포인트: ${results.length - successfulEndpoints.length}개`);
  
  if (successfulEndpoints.length > 0) {
    console.log('\n🎯 활용 가능한 엔드포인트:');
    successfulEndpoints.forEach(endpoint => {
      console.log(`   ✅ ${endpoint.url}`);
    });
    
    console.log('\n⚡ 다음 단계:');
    console.log('1. 성공한 엔드포인트로 전체 데이터 수집');
    console.log('2. MET 파일들 필터링');
    console.log('3. URL 생성 및 유효성 검증');
    console.log('4. MET API 메타데이터 수집');
    console.log('5. SAYU 통합');
    
  } else {
    console.log('\n💡 대안 방법:');
    console.log('1. Cloudinary Management API 키 요청');
    console.log('2. 브라우저 DevTools 방법');
    console.log('3. 페이지 소스 수동 추출');
    console.log('4. Network 탭에서 실제 API 요청 캡처');
  }
  
  return results;
}

// 실행
testCloudinaryEndpoints().catch(console.error);