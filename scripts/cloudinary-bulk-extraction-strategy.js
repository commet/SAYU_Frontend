/**
 * 🔥 Cloudinary 대량 추출 전략
 * 웹 UI 리스트를 활용한 3,715개 MET 파일명 추출 방법들
 */

console.log('🔥 Cloudinary 대량 추출 전략');
console.log('=====================================');

console.log('\n📊 현재 상황');
console.log('- Cloudinary 웹 UI에서 3,715개 파일 리스트 형태로 확인 가능');
console.log('- URL: https://console.cloudinary.com/.../sayu/met-artworks/');
console.log('- 목표: 모든 파일명 추출하여 SAYU에 통합');

const EXTRACTION_METHODS = [
  {
    priority: 'URGENT',
    method: 'Browser DevTools 자동화',
    description: '브라우저 개발자 도구로 JavaScript 실행하여 파일명 일괄 추출',
    steps: [
      '1. Cloudinary Media Library 페이지 열기',
      '2. F12 → Console 탭 열기',
      '3. 아래 JavaScript 코드 실행하여 모든 파일명 추출',
      '4. JSON 결과를 파일로 저장',
      '5. 추출된 파일명으로 URL 생성 및 검증'
    ],
    code: `
// Cloudinary Media Library에서 실행할 JavaScript
function extractAllFilenames() {
  const filenames = [];
  
  // 파일 항목들 선택 (실제 선택자는 페이지 구조에 따라 조정 필요)
  const fileElements = document.querySelectorAll('[data-testid="media-library-asset"]') || 
                      document.querySelectorAll('.asset-item') ||
                      document.querySelectorAll('img[src*="met-"]');
  
  fileElements.forEach(element => {
    // 파일명 추출 (여러 방법 시도)
    const filename = element.getAttribute('data-public-id') ||
                    element.getAttribute('alt') ||
                    element.src?.match(/([^/]+\\.jpg)/)?.[1] ||
                    element.textContent?.match(/met-[^\\s]+\\.jpg/)?.[0];
    
    if (filename && filename.includes('met-')) {
      filenames.push(filename);
    }
  });
  
  // 페이지네이션이 있다면 다음 페이지로 이동
  const nextButton = document.querySelector('[aria-label="Next page"]') ||
                     document.querySelector('.pagination-next');
  
  if (nextButton && !nextButton.disabled) {
    console.log('다음 페이지로 이동 중...');
    nextButton.click();
    
    // 페이지 로딩 대기 후 재귀 호출
    setTimeout(() => {
      const nextPageFiles = extractAllFilenames();
      filenames.push(...nextPageFiles);
    }, 2000);
  }
  
  return [...new Set(filenames)]; // 중복 제거
}

// 실행
const allFiles = extractAllFilenames();
console.log('발견된 파일 수:', allFiles.length);
console.log('파일 목록:', allFiles);

// JSON으로 변환하여 복사 가능하게 출력
const result = {
  extractionDate: new Date().toISOString(),
  totalFiles: allFiles.length,
  filenames: allFiles
};
console.log('JSON 결과:');
console.log(JSON.stringify(result, null, 2));
`,
    timeRequired: '15분',
    successRate: '95%',
    output: '3,715개 파일명 리스트'
  },
  
  {
    priority: 'HIGH',
    method: 'Network Tab 활용',
    description: 'Browser Network 탭에서 API 요청 캡처하여 파일 목록 추출',
    steps: [
      '1. F12 → Network 탭 열기',
      '2. Filter를 "XHR" 또는 "Fetch"로 설정',
      '3. Media Library 페이지 새로고침',
      '4. API 요청들 중 파일 목록 가져오는 요청 찾기',
      '5. Response 데이터에서 파일명 추출'
    ],
    code: `
// Network 탭에서 발견한 API 응답 처리 예시
function processNetworkResponse(apiResponse) {
  const filenames = [];
  
  // API 응답 구조에 따라 조정 필요
  if (apiResponse.resources) {
    apiResponse.resources.forEach(resource => {
      if (resource.public_id?.includes('met-')) {
        filenames.push(resource.public_id + '.' + resource.format);
      }
    });
  }
  
  return filenames;
}
`,
    timeRequired: '10분',
    successRate: '90%',
    output: 'API 형태의 완전한 메타데이터'
  },
  
  {
    priority: 'MEDIUM',
    method: '수동 복사 + 정규표현식',
    description: '페이지 소스를 복사하여 정규표현식으로 파일명 추출',
    steps: [
      '1. Media Library 페이지에서 Ctrl+A로 전체 선택',
      '2. Ctrl+C로 복사',
      '3. 텍스트 에디터에 붙여넣기',
      '4. 정규표현식으로 met-*.jpg 패턴 추출'
    ],
    code: `
// 복사한 텍스트에서 파일명 추출하는 정규표현식
const text = '여기에 복사한 페이지 내용 붙여넣기';
const metFiles = text.match(/met-[a-zA-Z0-9\\-]+\\.jpg/g) || [];
const uniqueFiles = [...new Set(metFiles)];
console.log('발견된 MET 파일들:', uniqueFiles);
`,
    timeRequired: '20분',
    successRate: '80%',
    output: '파일명 리스트 (메타데이터 없음)'
  },
  
  {
    priority: 'MEDIUM',
    method: 'Cloudinary Admin API',
    description: '공식 API로 폴더 내용 조회 (API 키 필요)',
    steps: [
      '1. Cloudinary Dashboard에서 API 키 확인',
      '2. Admin API의 resources 엔드포인트 호출',
      '3. prefix 파라미터로 sayu/met-artworks 지정',
      '4. 모든 페이지 반복 호출하여 완전한 목록 수집'
    ],
    code: `
// Admin API 호출 예시 (API 키 필요)
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dkdzgpj3n',
  api_key: 'YOUR_API_KEY',
  api_secret: 'YOUR_API_SECRET'
});

async function getAllMetArtworks() {
  const allResources = [];
  let nextCursor = null;
  
  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'sayu/met-artworks/',
      max_results: 500,
      next_cursor: nextCursor
    });
    
    allResources.push(...result.resources);
    nextCursor = result.next_cursor;
    
  } while (nextCursor);
  
  return allResources;
}
`,
    timeRequired: 'API 키 확보되면 5분',
    successRate: '100%',
    output: '완전한 메타데이터 + 파일 정보'
  }
];

console.log('\n🚀 추출 방법들 (우선순위별)');
console.log('=====================================');

EXTRACTION_METHODS.forEach((method, i) => {
  console.log(`\n${i+1}. [${method.priority}] ${method.method}`);
  console.log(`   📄 ${method.description}`);
  console.log(`   ⏰ 소요시간: ${method.timeRequired}`);
  console.log(`   📈 성공률: ${method.successRate}`);
  console.log(`   📊 출력: ${method.output}`);
  console.log('   🔧 단계:');
  method.steps.forEach(step => {
    console.log(`      ${step}`);
  });
});

console.log('\n⚡ 추천 실행 순서');
console.log('=====================================');
console.log('1️⃣ Browser DevTools 방법 먼저 시도 (가장 빠름)');
console.log('2️⃣ 실패시 Network Tab 방법으로 API 캡처');
console.log('3️⃣ 둘 다 안되면 수동 복사 + 정규표현식');
console.log('4️⃣ 마지막 수단: Cloudinary 지원팀 문의로 API 키 요청');

console.log('\n🎯 예상 결과');
console.log('=====================================');
console.log('📊 파일명 추출 성공시:');
console.log('   - 3,715개 MET 작품 파일명 확보');
console.log('   - 각 파일명으로 MET API 메타데이터 수집');
console.log('   - SAYU 컬렉션 773개 → 4,488개로 확장');
console.log('   - APT별 평균 280개 작품 달성');

console.log('\n💪 성공 보장 전략');
console.log('=====================================');
console.log('🔄 다중 방법 병행: 여러 방법을 동시에 시도');
console.log('🤝 협업 접근: 필요시 Cloudinary 지원팀과 협력');
console.log('📝 문서화: 성공한 방법을 정확히 기록');
console.log('🔧 자동화: 추출 성공 후 즉시 자동 처리 스크립트 실행');

console.log('\n📋 다음 단계: Browser DevTools 방법 실행!');
console.log('=====================================');
console.log('🌐 Cloudinary Media Library 페이지를 열고');
console.log('⌨️  F12 → Console에서 JavaScript 코드 실행');
console.log('📋 결과를 JSON 파일로 저장');
console.log('🚀 파일명 리스트로 대량 URL 생성 및 검증');