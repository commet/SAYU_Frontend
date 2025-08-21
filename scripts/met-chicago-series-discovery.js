/**
 * 🔥 MET Chicago 시리즈 집중 탐색
 * MET API Chicago 검색 결과로 Cloudinary URL 매칭
 */

const https = require('https');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 MET Chicago 시리즈 집중 탐색!');
console.log('=====================================');

const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752840033/sayu/met-artworks/';
let discoveredArtworks = [];
let totalTests = 0;

function apiRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`JSON 파싱 오류: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

function testUrl(url, description = '') {
  return new Promise((resolve) => {
    const curl = spawn('curl', ['-I', url], { stdio: 'pipe' });
    let responseData = '';
    
    curl.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    curl.on('close', () => {
      const isWorking = responseData.includes('HTTP/1.1 200') || responseData.includes('HTTP/2 200');
      totalTests++;
      
      if (isWorking) {
        const sizeMatch = responseData.match(/content-length: (\d+)/i);
        const fileSize = sizeMatch ? parseInt(sizeMatch[1]) : 0;
        
        discoveredArtworks.push({
          url,
          description,
          fileSize,
          sizeMB: (fileSize / 1024 / 1024).toFixed(2),
          objectId: url.match(/met-chicago-(\d+)/)?.[1]
        });
        
        console.log(`✅ ${totalTests.toString().padStart(3)}: FOUND! ${url}`);
        console.log(`    💾 ${(fileSize / 1024 / 1024).toFixed(2)}MB | 🎯 ${description}`);
      } else {
        console.log(`❌ ${totalTests.toString().padStart(3)}: Not found: ${url}`);
      }
      
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {});
  });
}

async function getChicagoArtworks() {
  console.log('🔍 1. MET API에서 Chicago 관련 작품 ID 수집...\n');
  
  try {
    const chicagoSearch = await apiRequest('https://collectionapi.metmuseum.org/public/collection/v1/search?q=chicago');
    console.log(`✅ Chicago 검색 결과: ${chicagoSearch.total?.toLocaleString()}개 작품`);
    
    if (chicagoSearch.objectIDs && chicagoSearch.objectIDs.length > 0) {
      console.log(`📋 처음 50개 Chicago Object ID: ${chicagoSearch.objectIDs.slice(0, 50).join(', ')}`);
      return chicagoSearch.objectIDs.slice(0, 200); // 처음 200개만 테스트
    }
  } catch (error) {
    console.log(`❌ Chicago 검색 실패: ${error.message}`);
  }
  
  return [];
}

async function testChicagoSeries(chicagoIds) {
  console.log('\n🧪 2. Chicago Object ID들로 Cloudinary URL 테스트...\n');
  
  let successCount = 0;
  const successfulIds = [];
  
  // 알려진 성공 ID부터 시작
  const knownSuccessId = 205641;
  console.log(`🎯 알려진 성공 ID ${knownSuccessId}부터 시작...`);
  
  for (const objectId of chicagoIds) {
    const url = `${baseUrl}met-chicago-${objectId}.jpg`;
    const success = await testUrl(url, `Chicago Series Object ID ${objectId}`);
    
    if (success) {
      successCount++;
      successfulIds.push(objectId);
      console.log(`   🎉 성공! ${successCount}번째 발견`);
      
      // 성공한 ID 주변도 테스트 (±10 범위)
      console.log(`   🔍 성공 ID ${objectId} 주변 탐색...`);
      for (let adjacent = objectId - 5; adjacent <= objectId + 5; adjacent++) {
        if (adjacent === objectId || adjacent <= 0) continue;
        
        const adjacentUrl = `${baseUrl}met-chicago-${adjacent}.jpg`;
        const adjacentSuccess = await testUrl(adjacentUrl, `Adjacent to ${objectId}: ${adjacent}`);
        
        if (adjacentSuccess) {
          successfulIds.push(adjacent);
        }
      }
      
      // 10개 발견하면 일단 중단
      if (successCount >= 10) {
        console.log('\n🎯 충분한 패턴 발견! 추가 탐색 중단');
        break;
      }
    }
    
    // API 호출 제한 준수
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { successCount, successfulIds };
}

async function collectMetadata(successfulIds) {
  console.log('\n📚 3. 발견된 작품들의 MET API 메타데이터 수집...\n');
  
  const artworksWithMetadata = [];
  
  for (const objectId of successfulIds) {
    try {
      console.log(`📖 Object ID ${objectId} 메타데이터 수집...`);
      const metadata = await apiRequest(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`);
      
      if (metadata.objectID) {
        const artwork = {
          objectId: objectId,
          cloudinaryUrl: `${baseUrl}met-chicago-${objectId}.jpg`,
          metadata: {
            title: metadata.title || 'Untitled',
            artist: metadata.artistDisplayName || 'Unknown Artist',
            artistBio: metadata.artistBio || '',
            department: metadata.department || '',
            classification: metadata.classification || '',
            medium: metadata.medium || '',
            dimensions: metadata.dimensions || '',
            date: metadata.objectDate || '',
            period: metadata.period || '',
            culture: metadata.culture || '',
            region: metadata.region || '',
            creditLine: metadata.creditLine || '',
            isPublicDomain: metadata.isPublicDomain || false,
            primaryImage: metadata.primaryImage || '',
            additionalImages: metadata.additionalImages || [],
            tags: metadata.tags || []
          }
        };
        
        artworksWithMetadata.push(artwork);
        
        console.log(`   ✅ ${artwork.metadata.title}`);
        console.log(`      👨‍🎨 ${artwork.metadata.artist} | 📅 ${artwork.metadata.date}`);
        console.log(`      🏛️ ${artwork.metadata.department} | 🎨 ${artwork.metadata.medium}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500)); // API 제한 준수
      
    } catch (error) {
      console.log(`❌ Object ID ${objectId} 메타데이터 수집 실패: ${error.message}`);
    }
  }
  
  return artworksWithMetadata;
}

function generateSayuIntegration(artworksWithMetadata) {
  console.log('\n🎨 4. SAYU 컬렉션 통합 데이터 생성...\n');
  
  const sayuArtworks = artworksWithMetadata.map(artwork => {
    // APT 유형 추론 (도자기, 장식예술 → 세련되고 예술적인 성향)
    const suggestedAptTypes = [];
    
    if (artwork.metadata.classification?.toLowerCase().includes('ceramics')) {
      suggestedAptTypes.push('SAEF', 'LAEF', 'SREF'); // 세련된, 예술적 유형들
    }
    
    if (artwork.metadata.department?.toLowerCase().includes('decorative')) {
      suggestedAptTypes.push('SREF', 'SAEF', 'LRMF'); // 세련된, 미적 감각
    }
    
    return {
      id: `met-chicago-${artwork.objectId}`,
      title: artwork.metadata.title,
      artist: artwork.metadata.artist,
      year: artwork.metadata.date?.match(/\d{4}/)?.[0] || null,
      medium: artwork.metadata.medium,
      dimensions: artwork.metadata.dimensions,
      url: artwork.cloudinaryUrl,
      source: 'MET Museum',
      department: artwork.metadata.department,
      isPublicDomain: artwork.metadata.isPublicDomain,
      suggestedAptTypes: suggestedAptTypes.slice(0, 3), // 상위 3개 추천
      metObjectId: artwork.objectId,
      metPrimaryImage: artwork.metadata.primaryImage,
      tags: artwork.metadata.tags?.map(tag => tag.term).filter(Boolean) || []
    };
  });
  
  console.log(`✅ SAYU 통합 준비 완료: ${sayuArtworks.length}개 작품`);
  
  sayuArtworks.forEach((artwork, i) => {
    console.log(`\n${i+1}. ${artwork.title}`);
    console.log(`   👨‍🎨 ${artwork.artist} (${artwork.year || 'Unknown'})`);
    console.log(`   🎨 ${artwork.medium}`);
    console.log(`   🔗 ${artwork.url}`);
    console.log(`   🧬 추천 APT: ${artwork.suggestedAptTypes.join(', ')}`);
  });
  
  return sayuArtworks;
}

// 메인 실행
async function runChicagoSeriesDiscovery() {
  try {
    console.log('🚀 MET Chicago 시리즈 집중 탐색 시작...\n');
    
    // 1. Chicago 관련 Object ID 수집
    const chicagoIds = await getChicagoArtworks();
    if (chicagoIds.length === 0) {
      console.log('❌ Chicago Object ID 수집 실패');
      return;
    }
    
    // 2. Cloudinary URL 테스트
    const { successCount, successfulIds } = await testChicagoSeries(chicagoIds);
    
    if (successCount === 0) {
      console.log('\n❌ Chicago 시리즈에서 추가 작품 발견 실패');
      console.log('💡 205641만이 유일한 접근 가능한 작품일 수 있음');
      return;
    }
    
    // 3. 메타데이터 수집
    const artworksWithMetadata = await collectMetadata(successfulIds);
    
    // 4. SAYU 통합 데이터 생성
    const sayuArtworks = generateSayuIntegration(artworksWithMetadata);
    
    // 결과 요약
    console.log('\n🏆 Chicago 시리즈 발견 결과');
    console.log('=====================================');
    console.log(`📊 총 테스트: ${totalTests}개 URL`);
    console.log(`✅ 발견: ${successCount}개 작품`);
    console.log(`📈 성공률: ${Math.round(successCount / totalTests * 100)}%`);
    console.log(`🎨 완전한 메타데이터: ${artworksWithMetadata.length}개`);
    
    if (sayuArtworks.length > 0) {
      console.log('\n🚀 SAYU 통합 준비 완료!');
      console.log(`📈 컬렉션 증가: 773개 → ${773 + sayuArtworks.length}개`);
      console.log(`🎯 증가율: ${Math.round(sayuArtworks.length / 773 * 100)}%`);
      
      // 결과 저장
      const results = {
        discoveryDate: new Date().toISOString(),
        totalTested: totalTests,
        successCount,
        artworks: sayuArtworks,
        readyForIntegration: true
      };
      
      const resultsDir = path.join(__dirname, '../artvee-crawler/met-chicago-discovery');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(resultsDir, 'chicago-series-ready-for-sayu.json'),
        JSON.stringify(results, null, 2)
      );
      
      console.log('\n💾 통합 준비 데이터 저장 완료');
      console.log('📂 파일: met-chicago-discovery/chicago-series-ready-for-sayu.json');
      
      console.log('\n⚡ 다음 단계:');
      console.log('1. 이 데이터를 Supabase artwork 테이블에 삽입');
      console.log('2. APT 매칭 알고리즘 적용');
      console.log('3. Gallery 컴포넌트에서 바로 표시');
      console.log('4. 사용자에게 새로운 MET 컬렉션 알림');
    }
    
  } catch (error) {
    console.error('❌ Chicago 시리즈 탐색 중 오류:', error.message);
  }
}

runChicagoSeriesDiscovery();