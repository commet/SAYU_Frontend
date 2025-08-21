/**
 * 🎨 현재 컬렉션에서 Masters 작품들 확인
 * Masters 폴더 작품들이 이미 포함되어 있는지 검사
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🎨 현재 컬렉션에서 Masters 작품들 확인');
console.log('=====================================');

// 사용자가 언급한 Masters 작품들
const SUSPECTED_MASTERS = [
  'woman-with-a-parasol-madame-monet-and-her-son',
  'roses-5',
  'starry-night',
  'mona-lisa',
  'water-lilies',
  'sunflowers',
  'the-scream',
  'guernica',
  'birth-of-venus'
];

function testUrl(url, description = '') {
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

async function checkCurrentCollection() {
  console.log('📊 1. 현재 컬렉션에서 Masters 작품명 검색...\n');
  
  const collectionPath = path.join(__dirname, '../artvee-crawler/validation-results/valid-cloudinary-urls.json');
  
  if (!fs.existsSync(collectionPath)) {
    console.log('❌ 검증된 컬렉션 파일을 찾을 수 없습니다.');
    return { foundInCollection: [], notFoundInCollection: SUSPECTED_MASTERS };
  }
  
  const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
  
  const foundInCollection = [];
  const notFoundInCollection = [];
  
  console.log('🔍 컬렉션에서 Masters 작품명 찾기...');
  
  SUSPECTED_MASTERS.forEach(masterTitle => {
    let found = false;
    
    // URL이나 제목에서 찾기
    Object.entries(collection).forEach(([key, artwork]) => {
      const url = artwork.full?.url || artwork.url || '';
      const title = artwork.artwork?.title || '';
      const artist = artwork.artwork?.artist || '';
      
      // 파일명에서 찾기
      if (url.includes(masterTitle)) {
        foundInCollection.push({
          searchTerm: masterTitle,
          found: 'URL 파일명',
          key,
          title,
          artist,
          url
        });
        found = true;
      }
      
      // 제목에서 유사한 것 찾기
      const titleWords = title.toLowerCase().split(/\s+/);
      const searchWords = masterTitle.replace(/-/g, ' ').toLowerCase().split(/\s+/);
      const matchingWords = searchWords.filter(word => 
        titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
      );
      
      if (matchingWords.length >= Math.min(2, searchWords.length) && !found) {
        foundInCollection.push({
          searchTerm: masterTitle,
          found: '제목 유사',
          key,
          title,
          artist,
          url,
          matchingWords
        });
        found = true;
      }
    });
    
    if (!found) {
      notFoundInCollection.push(masterTitle);
    }
  });
  
  console.log(`✅ 컬렉션에서 발견: ${foundInCollection.length}개`);
  console.log(`❌ 컬렉션에서 미발견: ${notFoundInCollection.length}개\n`);
  
  if (foundInCollection.length > 0) {
    console.log('🎯 발견된 Masters 작품들:');
    foundInCollection.forEach((item, i) => {
      console.log(`   ${i+1}. ${item.searchTerm} (${item.found})`);
      console.log(`      제목: ${item.title}`);
      console.log(`      작가: ${item.artist}`);
      console.log(`      URL: ${item.url}`);
      if (item.matchingWords) {
        console.log(`      매칭 단어: ${item.matchingWords.join(', ')}`);
      }
      console.log('');
    });
  }
  
  if (notFoundInCollection.length > 0) {
    console.log('❌ 컬렉션에서 찾지 못한 작품들:');
    notFoundInCollection.forEach(title => {
      console.log(`   - ${title}`);
    });
  }
  
  return { foundInCollection, notFoundInCollection };
}

async function testMastersUrls() {
  console.log('\n🧪 2. Masters 폴더 URL 직접 테스트...\n');
  
  const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/';
  const mastersUrls = [];
  
  // 다양한 버전과 폴더 패턴으로 테스트
  const patterns = [
    'sayu/artvee/masters/',
    'v1752486974/sayu/artvee/masters/',
    'sayu/masters/',
    'v1752486974/sayu/masters/'
  ];
  
  console.log('🔍 Masters 폴더 URL 패턴 테스트...');
  
  for (const pattern of patterns) {
    console.log(`\n📁 패턴: ${pattern}`);
    
    for (const artwork of SUSPECTED_MASTERS.slice(0, 3)) { // 처음 3개만 테스트
      const url = `${baseUrl}${pattern}${artwork}.jpg`;
      const isWorking = await testUrl(url, `Masters: ${artwork}`);
      
      if (isWorking) {
        mastersUrls.push({ artwork, url, pattern });
        console.log(`   ✅ ${artwork}: 접근 가능!`);
        
        // 성공한 패턴으로 더 많이 테스트
        console.log(`   🎯 성공 패턴 발견! 더 많은 작품 테스트...`);
        for (const extraArtwork of SUSPECTED_MASTERS.slice(3)) {
          const extraUrl = `${baseUrl}${pattern}${extraArtwork}.jpg`;
          const extraWorking = await testUrl(extraUrl);
          if (extraWorking) {
            mastersUrls.push({ artwork: extraArtwork, url: extraUrl, pattern });
            console.log(`   ✅ ${extraArtwork}: 추가 발견!`);
          }
        }
        break; // 성공한 패턴 발견하면 다음 패턴 테스트 불필요
      } else {
        console.log(`   ❌ ${artwork}: 접근 불가`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (mastersUrls.length > 0) break; // 성공한 패턴 있으면 중단
  }
  
  return mastersUrls;
}

async function analyzeCollectionGaps(foundInCollection, notFoundInCollection, mastersUrls) {
  console.log('\n📊 3. 컬렉션 gap 분석...\n');
  
  console.log('🏆 분석 결과:');
  console.log(`   📚 현재 컬렉션에 이미 있는 Masters: ${foundInCollection.length}개`);
  console.log(`   🔍 새로 발견된 Masters URL: ${mastersUrls.length}개`);
  console.log(`   ❓ 여전히 미발견: ${notFoundInCollection.length - mastersUrls.length}개`);
  
  if (mastersUrls.length > 0) {
    console.log('\n🎉 새로 발견된 Masters 작품들:');
    mastersUrls.forEach((item, i) => {
      console.log(`   ${i+1}. ${item.artwork}`);
      console.log(`      URL: ${item.url}`);
      console.log(`      패턴: ${item.pattern}`);
    });
    
    console.log('\n⚡ 즉시 실행 가능:');
    console.log(`   1. ${mastersUrls.length}개 Masters 작품을 현재 컬렉션에 추가`);
    console.log(`   2. 성공한 패턴(${mastersUrls[0]?.pattern})으로 더 많은 작품 스캔`);
    console.log(`   3. 총 컬렉션: 773개 → ${773 + mastersUrls.length}개`);
    
  } else {
    console.log('\n💡 Masters 폴더 접근 실패:');
    console.log('   - URL 패턴이 예상과 다를 수 있음');
    console.log('   - 브라우저 DevTools로 실제 패턴 확인 필요');
    console.log('   - 또는 Enhanced 폴더 우선 시도');
  }
  
  if (foundInCollection.length > 0) {
    console.log('\n✅ 좋은 소식:');
    console.log(`   현재 컬렉션에 이미 ${foundInCollection.length}개 Masters급 작품 포함!`);
    console.log('   이들의 메타데이터나 카테고리를 "Masters" 로 표시할 수 있음');
  }
  
  return {
    currentMasters: foundInCollection.length,
    newMasters: mastersUrls.length,
    totalPotential: foundInCollection.length + mastersUrls.length
  };
}

// 메인 실행
async function checkMastersStatus() {
  try {
    console.log('🚀 Masters 작품 상태 확인 시작...\n');
    
    const { foundInCollection, notFoundInCollection } = await checkCurrentCollection();
    const mastersUrls = await testMastersUrls();
    const analysis = await analyzeCollectionGaps(foundInCollection, notFoundInCollection, mastersUrls);
    
    console.log('\n🎯 최종 결론');
    console.log('=====================================');
    
    if (analysis.newMasters > 0) {
      console.log('🎉 Masters 폴더 접근 성공!');
      console.log(`📈 즉시 추가 가능: ${analysis.newMasters}개 작품`);
      console.log(`🎨 총 Masters급 작품: ${analysis.totalPotential}개`);
    } else if (analysis.currentMasters > 0) {
      console.log('✅ 현재 컬렉션에 이미 Masters급 작품 포함');
      console.log(`🎨 발견된 Masters: ${analysis.currentMasters}개`);
      console.log('💡 추가 최적화: 이들을 "거장 컬렉션"으로 특별 분류');
    } else {
      console.log('🔍 Masters 작품들 추가 탐색 필요');
      console.log('💡 대안: Enhanced 폴더나 다른 패턴 시도');
    }
    
  } catch (error) {
    console.error('❌ Masters 확인 중 오류:', error.message);
  }
}

checkMastersStatus();