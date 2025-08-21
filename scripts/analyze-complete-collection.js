/**
 * 🔍 Artvee-Complete 컬렉션 분석
 * sayu/artvee-complete 폴더의 874개 작품 구조 분석 및 중복 확인
 */

const { spawn } = require('child_process');

console.log('🔍 Artvee-Complete 컬렉션 분석 시작!');
console.log('======================================');

// artvee-complete 폴더에서 예상되는 파일명 패턴들
const testPatterns = [
  // 기본 패턴들
  'sayu/artvee-complete/{id}.jpg',
  'sayu/artvee-complete/artwork-{id}.jpg',
  'sayu/artvee-complete/complete-{id}.jpg',
  // 작가명 기반
  'sayu/artvee-complete/van-gogh-{id}.jpg',
  'sayu/artvee-complete/monet-{id}.jpg',
  'sayu/artvee-complete/picasso-{id}.jpg',
  // 알려진 작품명 기반 (현재 컬렉션에서 추출)
  'sayu/artvee-complete/starry-night.jpg',
  'sayu/artvee-complete/mona-lisa.jpg',
  'sayu/artvee-complete/the-scream.jpg',
  'sayu/artvee-complete/water-lilies.jpg',
  'sayu/artvee-complete/sunflowers.jpg',
  // 숫자 패턴들
  'sayu/artvee-complete/1.jpg',
  'sayu/artvee-complete/001.jpg',
  'sayu/artvee-complete/0001.jpg'
];

const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/';
let successCount = 0;
let testCount = 0;
const workingUrls = [];
const failedUrls = [];

function testUrl(url, description = '') {
  return new Promise((resolve) => {
    const curl = spawn('curl', ['-I', url], { stdio: 'pipe' });
    let responseData = '';
    
    curl.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    curl.on('close', () => {
      const isWorking = responseData.includes('HTTP/1.1 200') || responseData.includes('HTTP/2 200');
      testCount++;
      
      if (isWorking) {
        successCount++;
        workingUrls.push({ url, description });
        console.log(`✅ ${testCount.toString().padStart(3)}: FOUND! ${url} ${description ? `(${description})` : ''}`);
      } else {
        failedUrls.push({ url, description });
        console.log(`❌ ${testCount.toString().padStart(3)}: Not found: ${url} ${description ? `(${description})` : ''}`);
      }
      
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {
      // Suppress curl errors
    });
  });
}

async function testCompleteCollection() {
  console.log('🧪 Artvee-Complete 폴더 패턴 테스트...\n');
  
  // 1. 기본 숫자 패턴 테스트
  console.log('🔍 기본 숫자 패턴 테스트...');
  const numberTests = ['1', '2', '5', '10', '100', '500', '001', '002', '0001'];
  
  for (const num of numberTests) {
    const patterns = [
      `sayu/artvee-complete/${num}.jpg`,
      `sayu/artvee-complete/artwork-${num}.jpg`,
      `sayu/artvee-complete/complete-${num}.jpg`
    ];
    
    for (const pattern of patterns) {
      const url = baseUrl + pattern;
      await testUrl(url, `숫자 패턴 ${num}`);
      
      // 성공하면 추가 테스트
      if (workingUrls.length > 0 && workingUrls[workingUrls.length - 1].url === url) {
        console.log(`   🎯 작동하는 패턴 발견! 연속 테스트...`);
        
        // 이 패턴으로 10개 더 테스트
        for (let extra = parseInt(num.replace(/^0+/, '') || '0') + 1; extra <= parseInt(num.replace(/^0+/, '') || '0') + 10; extra++) {
          const extraPattern = pattern.replace(num, extra.toString().padStart(num.length, '0'));
          await testUrl(baseUrl + extraPattern, `연속 패턴 ${extra}`);
        }
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (workingUrls.length >= 10) break;
  }
  
  // 2. 유명 작품명 테스트 (우리가 알고 있는 것들)
  if (workingUrls.length < 5) {
    console.log('\n🎨 유명 작품명 패턴 테스트...');
    const famousArtworks = [
      'starry-night', 'mona-lisa', 'the-scream', 'water-lilies',
      'sunflowers', 'girl-with-pearl-earring', 'the-kiss',
      'guernica', 'birth-of-venus', 'last-supper'
    ];
    
    for (const artwork of famousArtworks) {
      const patterns = [
        `sayu/artvee-complete/${artwork}.jpg`,
        `sayu/artvee-complete/${artwork}-1.jpg`,
        `sayu/artvee-complete/${artwork}_complete.jpg`
      ];
      
      for (const pattern of patterns) {
        await testUrl(baseUrl + pattern, `유명 작품 ${artwork}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      if (workingUrls.length >= 10) break;
    }
  }
  
  // 3. 작가명 기반 테스트
  if (workingUrls.length < 5) {
    console.log('\n👨‍🎨 작가명 기반 패턴 테스트...');
    const famousArtists = [
      'van-gogh', 'monet', 'picasso', 'da-vinci', 'michelangelo',
      'rembrandt', 'degas', 'renoir', 'cezanne', 'gauguin'
    ];
    
    for (const artist of famousArtists) {
      const patterns = [
        `sayu/artvee-complete/${artist}-1.jpg`,
        `sayu/artvee-complete/${artist}-001.jpg`,
        `sayu/artvee-complete/${artist}.jpg`
      ];
      
      for (const pattern of patterns) {
        await testUrl(baseUrl + pattern, `작가 ${artist}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      if (workingUrls.length >= 10) break;
    }
  }
  
  // 4. 현재 컬렉션의 작품들을 complete 폴더에서 찾아보기
  if (workingUrls.length < 5) {
    console.log('\n🔄 현재 컬렉션 작품을 Complete 폴더에서 검색...');
    
    // 현재 컬렉션에서 몇 개 작품의 ID 추출해서 테스트
    const knownArtworks = [
      'a-peasant-woman-digging-in-front-of-her-cottage',
      'adeline-ravoux',
      'girl-in-white',
      'la-mousme',
      'cypresses'
    ];
    
    for (const artwork of knownArtworks) {
      const patterns = [
        `sayu/artvee-complete/${artwork}.jpg`,
        `sayu/artvee-complete/thumbnails/${artwork}.jpg`
      ];
      
      for (const pattern of patterns) {
        await testUrl(baseUrl + pattern, `기존 작품 ${artwork}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // 결과 분석
  console.log('\n🏆 Artvee-Complete 분석 결과');
  console.log('=====================================');
  console.log(`📊 총 테스트: ${testCount}개 URL`);
  console.log(`✅ 발견: ${successCount}개`);
  console.log(`❌ 실패: ${failedUrls.length}개`);
  console.log(`📈 발견률: ${Math.round(successCount / testCount * 100)}%`);
  
  if (workingUrls.length > 0) {
    console.log('\n🎯 발견된 Complete 컬렉션 작품들:');
    workingUrls.forEach((item, i) => {
      console.log(`   ${i+1}. ${item.url}`);
      if (item.description) console.log(`      -> ${item.description}`);
    });
    
    // 패턴 분석
    const patterns = workingUrls.map(item => {
      const match = item.url.match(/sayu\/artvee-complete\/(.*)/);
      return match ? match[1] : 'unknown';
    });
    
    const uniquePatterns = [...new Set(patterns.map(p => p.replace(/\d+/g, '{id}')))];
    
    console.log('\n📋 발견된 URL 패턴:');
    uniquePatterns.forEach(pattern => {
      console.log(`   ✅ sayu/artvee-complete/${pattern}`);
    });
    
    // 중복 분석
    console.log('\n🔍 중복 분석:');
    const duplicateAnalysis = workingUrls.filter(item => {
      const filename = item.url.split('/').pop()?.replace('.jpg', '');
      return ['a-peasant-woman-digging-in-front-of-her-cottage', 'adeline-ravoux', 'girl-in-white'].includes(filename || '');
    });
    
    if (duplicateAnalysis.length > 0) {
      console.log(`   ⚠️ 현재 컬렉션과 중복 가능성: ${duplicateAnalysis.length}개`);
      duplicateAnalysis.forEach(item => {
        console.log(`      - ${item.url}`);
      });
    } else {
      console.log(`   ✅ 중복 없음 - Complete는 추가 작품들로 구성된 듯`);
    }
    
  } else {
    console.log('\n❌ Artvee-Complete 컬렉션 접근 실패');
    console.log('   💡 가능한 원인:');
    console.log('      1. URL 패턴이 예상과 다름');
    console.log('      2. 폴더 구조가 복잡함');
    console.log('      3. 파일명이 완전히 다른 체계');
    console.log('   🔧 해결 방안:');
    console.log('      1. Cloudinary Media Library에서 직접 확인');
    console.log('      2. API를 통한 폴더 리스팅');
    console.log('      3. 다른 패턴 시도');
  }
  
  return {
    testCount,
    successCount,
    workingUrls,
    patterns: workingUrls.length > 0 ? uniquePatterns : [],
    potentialDuplicates: workingUrls.filter(item => 
      ['a-peasant-woman', 'adeline-ravoux', 'girl-in-white'].some(known => 
        item.url.includes(known)
      )
    ).length
  };
}

// 실행
testCompleteCollection().catch(console.error);