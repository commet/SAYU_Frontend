const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// HTTPS 에이전트
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// 사용 가능한 API들 최대 활용
async function maximizeAvailableAPIs() {
  console.log('🚀 사용 가능한 API들 최대 활용 시작...\n');
  
  const allArtworks = [];
  
  // 1. Art Institute of Chicago 대량 확장 수집
  console.log('🎨 1단계: Art Institute of Chicago 대량 확장');
  const chicagoArtworks = await maxChicagoCollection();
  allArtworks.push(...chicagoArtworks);
  console.log(`  ✅ Chicago 확장: ${chicagoArtworks.length}개\n`);
  
  // 2. 다른 무료 API들 재시도 (개선된 방법)
  console.log('🌐 2단계: 다른 무료 API들 개선된 방법으로 재시도');
  
  // 2-1. Walters Art Museum (볼티모어)
  const waltersArt = await collectWaltersArt();
  allArtworks.push(...waltersArt);
  console.log(`  ✅ Walters Art Museum: ${waltersArt.length}개`);
  
  // 2-2. Minneapolis Institute of Art
  const miaArt = await collectMinneapolisArt();
  allArtworks.push(...miaArt);
  console.log(`  ✅ Minneapolis Institute: ${miaArt.length}개`);
  
  // 2-3. National Gallery of Art (워싱턴)
  const ngaArt = await collectNationalGalleryArt();
  allArtworks.push(...ngaArt);
  console.log(`  ✅ National Gallery of Art: ${ngaArt.length}개`);
  
  // 2-4. Museum of Fine Arts Boston
  const mfaArt = await collectMFABoston();
  allArtworks.push(...mfaArt);
  console.log(`  ✅ MFA Boston: ${mfaArt.length}개`);
  
  // 2-5. Philadelphia Museum of Art
  const pmaArt = await collectPhiladelphiaArt();
  allArtworks.push(...pmaArt);
  console.log(`  ✅ Philadelphia Museum: ${pmaArt.length}개`);
  
  // 3. 기존 데이터와 통합
  console.log('\\n🔄 3단계: 기존 데이터와 통합');
  const existingData = await loadExistingData();
  allArtworks.push(...existingData);
  console.log(`  ✅ 기존 데이터: ${existingData.length}개`);
  
  // 4. 중복 제거 및 정리
  const uniqueArtworks = removeDuplicatesAdvanced(allArtworks);
  console.log(`  ✅ 중복 제거 후: ${uniqueArtworks.length}개`);
  
  // 5. 유명 작가 우선 정렬
  const sortedArtworks = sortByFamousArtists(uniqueArtworks);
  
  // 6. 결과 저장
  await saveMaximizedResults(sortedArtworks);
  
  console.log('\\n✨ API 최대 활용 완료!');
  console.log(`  - 총 수집: ${sortedArtworks.length}개`);
  console.log(`  - 목표 달성: ${sortedArtworks.length >= 1000 ? '✅' : '❌'}`);
  
  return sortedArtworks;
}

// Art Institute of Chicago 대량 확장 수집
async function maxChicagoCollection() {
  const artworks = [];
  
  // 확장된 검색어 리스트
  const expandedSearches = [
    // 장르별
    'painting', 'portrait', 'landscape', 'still life', 'sculpture', 'drawing',
    'watercolor', 'oil painting', 'pastel', 'print', 'lithograph', 'etching',
    'photography', 'modern', 'contemporary', 'abstract', 'figurative',
    
    // 유명 작가별
    'monet', 'renoir', 'degas', 'picasso', 'matisse', 'cezanne', 'van gogh',
    'manet', 'pissarro', 'cassatt', 'toulouse-lautrec', 'gauguin', 'seurat',
    'rodin', 'hokusai', 'hiroshige', 'whistler', 'sargent', 'homer',
    
    // 스타일/운동별
    'impressionist', 'post-impressionist', 'fauvism', 'cubism', 'surrealism',
    'expressionism', 'abstract expressionism', 'pop art', 'minimalism',
    
    // 지역별
    'french', 'american', 'european', 'japanese', 'italian', 'dutch',
    'german', 'spanish', 'british', 'russian',
    
    // 시대별
    'renaissance', 'baroque', 'neoclassical', 'romantic', '19th century',
    '20th century', 'medieval', 'ancient',
    
    // 주제별
    'flowers', 'nature', 'cityscape', 'seascape', 'nude', 'religious',
    'mythology', 'history', 'genre', 'interior'
  ];
  
  console.log(`  🔍 ${expandedSearches.length}개 검색어로 확장 수집...`);
  
  for (const term of expandedSearches) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
      
      const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(term)}&fields=id,title,artist_display,date_display,image_id,is_public_domain,classification_title,medium_display&limit=100`;
      
      const response = await axios.get(url, {
        httpsAgent,
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Educational Research)'
        }
      });
      
      if (response.data?.data) {
        let termCount = 0;
        for (const item of response.data.data) {
          if (item.is_public_domain && item.image_id) {
            const artwork = {
              objectID: `chicago-${item.id}`,
              title: item.title || 'Untitled',
              artist: item.artist_display || 'Unknown',
              date: item.date_display || '',
              medium: item.medium_display || '',
              department: 'Art Institute of Chicago',
              classification: item.classification_title || '',
              primaryImage: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
              primaryImageSmall: `https://www.artic.edu/iiif/2/${item.image_id}/full/200,/0/default.jpg`,
              metUrl: `https://www.artic.edu/artworks/${item.id}`,
              source: 'Art Institute of Chicago',
              searchTerm: term
            };
            
            artworks.push(artwork);
            termCount++;
          }
        }
        
        if (termCount > 0) {
          console.log(`    ✅ "${term}": ${termCount}개`);
        }
      }
      
    } catch (error) {
      console.error(`    ❌ "${term}" 오류: ${error.message}`);
    }
  }
  
  return artworks;
}

// Walters Art Museum (볼티모어)
async function collectWaltersArt() {
  const artworks = [];
  
  try {
    const url = 'https://api.thewalters.org/v1/objects?orderBy=ObjectID&Page=1&PageSize=100';
    
    const response = await axios.get(url, {
      httpsAgent,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Educational Research)'
      }
    });
    
    if (response.data?.Items) {
      for (const item of response.data.Items) {
        if (item.Images && item.Images.length > 0) {
          artworks.push({
            objectID: `walters-${item.ObjectID}`,
            title: item.Title || 'Untitled',
            artist: item.Creator || 'Unknown',
            date: item.DateText || '',
            medium: item.Medium || '',
            department: 'Walters Art Museum',
            classification: item.Classification || '',
            primaryImage: item.Images[0].Raw || '',
            primaryImageSmall: item.Images[0].Small || '',
            metUrl: `https://art.thewalters.org/detail/${item.ObjectID}`,
            source: 'Walters Art Museum'
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Walters Art Museum 수집 오류:', error.message);
  }
  
  return artworks;
}

// Minneapolis Institute of Art
async function collectMinneapolisArt() {
  const artworks = [];
  
  try {
    const url = 'https://search.artsmia.org/api/search/artworks?q=*&size=100&from=0';
    
    const response = await axios.get(url, {
      httpsAgent,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Educational Research)'
      }
    });
    
    if (response.data?.hits?.hits) {
      for (const hit of response.data.hits.hits) {
        const item = hit._source;
        if (item.image_copyright === 'Public Domain' && item.image) {
          artworks.push({
            objectID: `mia-${item.id}`,
            title: item.title || 'Untitled',
            artist: item.artist || 'Unknown',
            date: item.dated || '',
            medium: item.medium || '',
            department: 'Minneapolis Institute of Art',
            classification: item.classification || '',
            primaryImage: `https://api.artsmia.org/images/${item.id}/large.jpg`,
            primaryImageSmall: `https://api.artsmia.org/images/${item.id}/small.jpg`,
            metUrl: `https://collections.artsmia.org/art/${item.id}`,
            source: 'Minneapolis Institute of Art'
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Minneapolis Institute 수집 오류:', error.message);
  }
  
  return artworks;
}

// National Gallery of Art (워싱턴)
async function collectNationalGalleryArt() {
  const artworks = [];
  
  try {
    const url = 'https://api.nga.gov/art?size=100&from=0&q=*';
    
    const response = await axios.get(url, {
      httpsAgent,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Educational Research)'
      }
    });
    
    if (response.data?.data) {
      for (const item of response.data.data) {
        if (item.images && item.images.length > 0) {
          artworks.push({
            objectID: `nga-${item.id}`,
            title: item.title || 'Untitled',
            artist: item.attribution || 'Unknown',
            date: item.displaydate || '',
            medium: item.medium || '',
            department: 'National Gallery of Art',
            classification: item.classification || '',
            primaryImage: item.images[0].iiifbaseuri + '/full/!800,800/0/default.jpg',
            primaryImageSmall: item.images[0].iiifbaseuri + '/full/!200,200/0/default.jpg',
            metUrl: `https://www.nga.gov/collection/art-object-page.${item.id}.html`,
            source: 'National Gallery of Art'
          });
        }
      }
    }
    
  } catch (error) {
    console.error('National Gallery 수집 오류:', error.message);
  }
  
  return artworks;
}

// Museum of Fine Arts Boston
async function collectMFABoston() {
  const artworks = [];
  
  try {
    const url = 'https://collections.mfa.org/api/collection/search?q=*&size=100&from=0';
    
    const response = await axios.get(url, {
      httpsAgent,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Educational Research)'
      }
    });
    
    if (response.data?.results) {
      for (const item of response.data.results) {
        if (item.images && item.images.length > 0) {
          artworks.push({
            objectID: `mfa-${item.id}`,
            title: item.title || 'Untitled',
            artist: item.people?.[0]?.name || 'Unknown',
            date: item.dated || '',
            medium: item.medium || '',
            department: 'Museum of Fine Arts Boston',
            classification: item.classification || '',
            primaryImage: item.images[0].primary_image,
            primaryImageSmall: item.images[0].primary_image,
            metUrl: `https://collections.mfa.org/objects/${item.id}`,
            source: 'Museum of Fine Arts Boston'
          });
        }
      }
    }
    
  } catch (error) {
    console.error('MFA Boston 수집 오류:', error.message);
  }
  
  return artworks;
}

// Philadelphia Museum of Art
async function collectPhiladelphiaArt() {
  const artworks = [];
  
  try {
    const url = 'https://www.philamuseum.org/api/collections/search?q=*&size=100';
    
    const response = await axios.get(url, {
      httpsAgent,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Educational Research)'
      }
    });
    
    if (response.data?.results) {
      for (const item of response.data.results) {
        if (item.images && item.images.length > 0) {
          artworks.push({
            objectID: `pma-${item.id}`,
            title: item.title || 'Untitled',
            artist: item.artist || 'Unknown',
            date: item.date || '',
            medium: item.medium || '',
            department: 'Philadelphia Museum of Art',
            classification: item.classification || '',
            primaryImage: item.images[0].url,
            primaryImageSmall: item.images[0].url,
            metUrl: `https://www.philamuseum.org/collections/permanent/${item.id}`,
            source: 'Philadelphia Museum of Art'
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Philadelphia Museum 수집 오류:', error.message);
  }
  
  return artworks;
}

// 기존 데이터 로드
async function loadExistingData() {
  const dataDir = './met-artworks-data';
  const artworks = [];
  
  try {
    const files = fs.readdirSync(dataDir).filter(f => 
      f.includes('strategy-1000') && f.endsWith('.json')
    );
    
    if (files.length > 0) {
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, files[0]), 'utf8'));
      return data.artworks || [];
    }
    
  } catch (error) {
    console.error('기존 데이터 로드 오류:', error.message);
  }
  
  return artworks;
}

// 고급 중복 제거
function removeDuplicatesAdvanced(artworks) {
  const unique = [];
  const seen = new Set();
  
  for (const artwork of artworks) {
    if (!artwork.objectID || !artwork.title || !artwork.primaryImage) continue;
    
    // 더 정교한 중복 검사
    const normalizedTitle = artwork.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedArtist = (artwork.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `${normalizedTitle}-${normalizedArtist}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(artwork);
    }
  }
  
  return unique;
}

// 유명 작가 우선 정렬
function sortByFamousArtists(artworks) {
  const famousKeywords = [
    'van gogh', 'monet', 'renoir', 'degas', 'picasso', 'matisse', 'cezanne',
    'rembrandt', 'vermeer', 'hokusai', 'hiroshige', 'manet', 'pissarro',
    'gauguin', 'seurat', 'toulouse-lautrec', 'cassatt', 'whistler', 'sargent'
  ];
  
  return artworks.sort((a, b) => {
    const aIsFamous = famousKeywords.some(k => 
      (a.artist || '').toLowerCase().includes(k)
    );
    const bIsFamous = famousKeywords.some(k => 
      (b.artist || '').toLowerCase().includes(k)
    );
    
    if (aIsFamous && !bIsFamous) return -1;
    if (!aIsFamous && bIsFamous) return 1;
    
    return 0;
  });
}

// 결과 저장
async function saveMaximizedResults(artworks) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join('./met-artworks-data', `maximized-collection-${timestamp}.json`);
  
  const sources = {};
  artworks.forEach(artwork => {
    sources[artwork.source] = (sources[artwork.source] || 0) + 1;
  });
  
  const data = {
    metadata: {
      strategy: 'Maximized Available APIs Collection',
      date: new Date().toISOString(),
      total: artworks.length,
      sources
    },
    artworks
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  
  // CSV도 생성
  const csvContent = [
    'ObjectID,Title,Artist,Date,Source,Department,Classification,ImageURL',
    ...artworks.map(a => 
      `"${a.objectID}","${(a.title || '').replace(/"/g, '""')}","${(a.artist || '').replace(/"/g, '""')}","${a.date || ''}","${a.source || ''}","${a.department || ''}","${a.classification || ''}","${a.primaryImage || ''}"`
    )
  ].join('\\n');
  
  fs.writeFileSync(outputFile.replace('.json', '.csv'), csvContent);
  
  console.log(`\\n💾 저장 완료:`);
  console.log(`  - JSON: ${outputFile}`);
  console.log(`  - CSV: ${outputFile.replace('.json', '.csv')}`);
  
  console.log(`\\n📊 소스별 최종 분포:`);
  Object.entries(sources)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      console.log(`  - ${source}: ${count}개`);
    });
  
  // 유명 작가 통계
  const famousArtists = artworks.filter(a => 
    ['van gogh', 'monet', 'renoir', 'degas', 'picasso'].some(k => 
      (a.artist || '').toLowerCase().includes(k)
    )
  );
  
  console.log(`\\n👨‍🎨 유명 작가 작품: ${famousArtists.length}개`);
  
  return outputFile;
}

// 실행
if (require.main === module) {
  maximizeAvailableAPIs().catch(console.error);
}

module.exports = { maximizeAvailableAPIs };