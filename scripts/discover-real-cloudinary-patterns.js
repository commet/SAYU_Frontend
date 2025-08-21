/**
 * 🔍 실제 Cloudinary URL 패턴 발견
 * Browser DevTools 가이드 + 자동 패턴 발견
 */

console.log('🔍 실제 Cloudinary URL 패턴 발견');
console.log('=====================================');

// 현재까지 시도한 패턴들과 결과
const TESTED_PATTERNS = [
  {
    pattern: 'v1752486974/sayu/artvee/full/masters/',
    status: 'FAILED',
    tested: 13,
    found: 0
  },
  {
    pattern: 'v1752486979/sayu/artvee/full/masters/',
    status: 'FAILED', 
    tested: 1,
    found: 0
  },
  {
    pattern: 'sayu/artvee/full/masters/',
    status: 'FAILED',
    tested: 1, 
    found: 0
  }
];

console.log('📊 현재 상황 분석');
console.log('=====================================');
console.log('✅ 확인된 사실:');
console.log('   - Masters 폴더가 full/masters/로 이동됨');
console.log('   - 13개 정확한 파일명 확보됨');
console.log('   - 모든 URL 패턴 시도 실패 (404 오류)');

console.log('\n❌ 실패한 패턴들:');
TESTED_PATTERNS.forEach(pattern => {
  console.log(`   ${pattern.pattern} → ${pattern.tested}개 테스트, ${pattern.found}개 발견`);
});

console.log('\n💡 가능한 원인들:');
console.log('   1. 버전 번호가 파일 이동 후 변경됨');
console.log('   2. 폴더 이동으로 새로운 URL 구조 생성');
console.log('   3. 권한 설정이나 접근 방식 변경');
console.log('   4. CDN 캐시 지연');

console.log('\n🎯 Browser DevTools 방법 (가장 확실함)');
console.log('=====================================');

const DEVTOOLS_GUIDE = {
  title: 'Cloudinary Media Library에서 실제 URL 발견하기',
  steps: [
    '1. 🌐 https://console.cloudinary.com 로그인',
    '2. 📁 Media Library → sayu → artvee → full → masters 폴더 이동',
    '3. 🖼️ 아무 이미지나 하나 클릭 (예: roses-5.jpg)',
    '4. ⌨️  F12 → Network 탭 열기',
    '5. 🔄 이미지 새로고침 또는 다른 이미지 클릭',
    '6. 📡 Network 탭에서 .jpg 요청 찾기',
    '7. 📋 실제 URL 복사 → 패턴 분석'
  ],
  expectedResult: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v########/sayu/artvee/full/masters/roses-5.jpg',
  javascript: `
// Cloudinary Media Library Console에서 실행할 JavaScript
function findImageUrls() {
  // 현재 보이는 이미지들의 실제 URL 추출
  const images = document.querySelectorAll('img[src*="masters"]');
  const urls = [];
  
  images.forEach(img => {
    if (img.src.includes('masters') && img.src.includes('.jpg')) {
      urls.push({
        src: img.src,
        alt: img.alt || 'unknown',
        filename: img.src.split('/').pop()
      });
    }
  });
  
  console.log('발견된 Masters 이미지 URLs:', urls);
  return urls;
}

// 실행
const masterUrls = findImageUrls();
console.log('총 발견:', masterUrls.length);

// 패턴 분석
if (masterUrls.length > 0) {
  const sampleUrl = masterUrls[0].src;
  console.log('샘플 URL:', sampleUrl);
  
  // 버전 번호 추출
  const versionMatch = sampleUrl.match(/\/v(\\d+)\//);
  if (versionMatch) {
    console.log('실제 버전 번호:', versionMatch[1]);
  }
  
  // 베이스 패턴 추출
  const basePattern = sampleUrl.replace(/[^/]+\\.jpg$/, '');
  console.log('베이스 패턴:', basePattern);
}
`
};

console.log(`\n📋 ${DEVTOOLS_GUIDE.title}`);
DEVTOOLS_GUIDE.steps.forEach(step => {
  console.log(`   ${step}`);
});

console.log('\n⚡ 즉시 실행 JavaScript:');
console.log('=====================================');
console.log(DEVTOOLS_GUIDE.javascript);

console.log('\n🔄 자동 버전 스캔 (백업 방법)');
console.log('=====================================');

const { spawn } = require('child_process');

// 최신 버전들 추정해서 테스트할 목록
const POTENTIAL_VERSIONS = [
  // 오늘 날짜 기반 추정
  'v1752487000', 'v1752487100', 'v1752487200', 'v1752487300',
  'v1752487400', 'v1752487500', 'v1752487600', 'v1752487700',
  'v1752487800', 'v1752487900', 'v1752488000',
  // 기존 발견된 버전들 주변
  'v1752486975', 'v1752486976', 'v1752486977', 'v1752486978',
  'v1752486980', 'v1752486981', 'v1752486982',
  // 버전 없는 경우
  ''
];

async function testVersionsAutomatically() {
  const testFile = 'roses-5.jpg'; // 가장 간단한 파일명으로 테스트
  
  console.log(`🧪 자동 버전 테스트 시작 (테스트 파일: ${testFile})`);
  console.log(`📊 테스트할 버전: ${POTENTIAL_VERSIONS.length}개\n`);
  
  for (const version of POTENTIAL_VERSIONS) {
    const versionPath = version ? `${version}/` : '';
    const url = `https://res.cloudinary.com/dkdzgpj3n/image/upload/${versionPath}sayu/artvee/full/masters/${testFile}`;
    
    console.log(`🔍 버전 테스트: ${version || '버전없음'}`);
    
    const success = await testSingleUrl(url);
    
    if (success) {
      console.log(`\n🎉 성공! 올바른 패턴 발견!`);
      console.log(`✅ 작동하는 URL: ${url}`);
      console.log(`🎯 패턴: ${versionPath}sayu/artvee/full/masters/`);
      
      // 성공하면 다른 파일들도 테스트
      console.log('\n🚀 다른 Masters 파일들 테스트...');
      const otherFiles = [
        'portrait-after-a-costume-ball-portrait-of-madame-dietz-monnin.jpg',
        'charing-cross-bridge.jpg',
        'wheat-field-with-cypresses.jpg'
      ];
      
      for (const file of otherFiles) {
        const testUrl = `https://res.cloudinary.com/dkdzgpj3n/image/upload/${versionPath}sayu/artvee/full/masters/${file}`;
        const fileSuccess = await testSingleUrl(testUrl);
        console.log(`   ${fileSuccess ? '✅' : '❌'} ${file}`);
      }
      
      return { success: true, pattern: `${versionPath}sayu/artvee/full/masters/` };
    }
    
    // 요청 간 지연
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n❌ 모든 자동 버전 테스트 실패');
  return { success: false };
}

function testSingleUrl(url) {
  return new Promise((resolve) => {
    const curl = spawn('curl', ['-I', url], { stdio: 'pipe' });
    let responseData = '';
    
    curl.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    curl.on('close', () => {
      const isWorking = responseData.includes('HTTP/1.1 200') || responseData.includes('HTTP/2 200');
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {});
  });
}

console.log('\n🎯 실행 계획');
console.log('=====================================');
console.log('1️⃣ Browser DevTools 방법 (권장)');
console.log('   → 가장 확실하고 빠른 방법');
console.log('   → 실제 Cloudinary가 사용하는 URL 직접 확인');

console.log('\n2️⃣ 자동 버전 스캔 (백업)');
console.log('   → node scripts/discover-real-cloudinary-patterns.js');
console.log('   → 가능한 모든 버전 번호 자동 테스트');

console.log('\n3️⃣ 성공 시 즉시 통합');
console.log('   → 올바른 패턴 발견 즉시 13개 Masters 작품 SAYU 추가');
console.log('   → 773개 → 786개 컬렉션 확장');

// DevTools 방법이 실패할 경우를 대비한 자동 실행
if (require.main === module) {
  console.log('\n🚀 자동 버전 스캔 실행 중...');
  testVersionsAutomatically().then(result => {
    if (result.success) {
      console.log('\n🎉 자동 발견 성공!');
      console.log('📋 다음 단계: 이 패턴으로 모든 Masters 파일 통합');
    } else {
      console.log('\n💡 Browser DevTools 방법을 시도해주세요:');
      console.log('🌐 Cloudinary Media Library → full/masters → F12 → Network');
    }
  });
}