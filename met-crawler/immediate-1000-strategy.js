const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// 즉시 1000개 달성 전략
async function immediate1000Strategy() {
  console.log('🎯 즉시 1000개 달성 전략 시작...\n');
  
  const allArtworks = [];
  
  // 1. 기존 데이터 로드
  console.log('📊 1단계: 기존 데이터 통합');
  const existingData = await loadExistingData();
  allArtworks.push(...existingData);
  console.log(`  ✅ 기존: ${existingData.length}개\n`);
  
  // 2. 무료 API들 최대 활용
  console.log('🌐 2단계: 다른 미술관 API 최대 활용');
  
  // Art Institute of Chicago (무료, 무제한)
  const chicagoArt = await massCollectChicago();
  allArtworks.push(...chicagoArt);
  console.log(`  ✅ Chicago: ${chicagoArt.length}개`);
  
  // Smithsonian (무료, 대량)
  const smithsonianArt = await collectSmithsonian();
  allArtworks.push(...smithsonianArt);
  console.log(`  ✅ Smithsonian: ${smithsonianArt.length}개`);
  
  // Cooper Hewitt (무료)
  const cooperHewittArt = await collectCooperHewitt();
  allArtworks.push(...cooperHewittArt);
  console.log(`  ✅ Cooper Hewitt: ${cooperHewittArt.length}개`);
  
  // European APIs
  const europeanArt = await collectEuropeanMuseums();
  allArtworks.push(...europeanArt);
  console.log(`  ✅ European Museums: ${europeanArt.length}개`);
  
  // 3. 중복 제거 및 품질 필터링
  console.log('\\n🔄 3단계: 데이터 정제');
  const cleanedArtworks = cleanAndFilter(allArtworks);
  console.log(`  ✅ 정제 후: ${cleanedArtworks.length}개`);
  
  // 4. 결과 저장
  await saveStrategy1000Results(cleanedArtworks);
  
  console.log('\\n✨ 즉시 1000개 전략 완료!');
  console.log(`  - 총 수집: ${cleanedArtworks.length}개`);
  console.log(`  - 목표 달성: ${cleanedArtworks.length >= 1000 ? '✅' : '❌'}`);
  
  return cleanedArtworks;
}

// 기존 데이터 로드
async function loadExistingData() {
  const dataDir = './met-artworks-data';
  const artworks = [];
  
  try {
    // 통합 파일 우선
    const files = fs.readdirSync(dataDir).filter(f => 
      f.includes('consolidated') && f.endsWith('.json')
    );
    
    if (files.length > 0) {
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, files[0]), 'utf8'));
      return data.artworks || [];
    }
    
    // 개별 파일들
    const allFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    for (const file of allFiles) {
      if (file.includes('progress') || file.includes('upload')) continue;
      
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
      if (data.artworks) artworks.push(...data.artworks);
    }
    
  } catch (error) {
    console.error('기존 데이터 로드 오류:', error.message);
  }
  
  return artworks;
}

// Art Institute of Chicago 대량 수집
async function massCollectChicago() {
  const artworks = [];
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  
  try {
    // 여러 검색어로 대량 수집
    const searches = [
      'painting', 'portrait', 'landscape', 'impressionist', 'modern',
      'french', 'american', 'european', 'sculpture', 'drawing',
      'photography', 'print', 'watercolor', 'oil painting', 'pastel'
    ];
    
    for (const term of searches) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const url = `https://api.artic.edu/api/v1/artworks/search?q=${term}&fields=id,title,artist_display,date_display,image_id,is_public_domain&limit=100`;
        
        const response = await axios.get(url, { httpsAgent, timeout: 15000 });
        
        if (response.data?.data) {
          for (const item of response.data.data) {
            if (item.is_public_domain && item.image_id) {
              artworks.push({
                objectID: `chicago-${item.id}`,
                title: item.title || 'Untitled',
                artist: item.artist_display || 'Unknown',
                date: item.date_display || '',
                department: 'Art Institute of Chicago',
                primaryImage: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
                primaryImageSmall: `https://www.artic.edu/iiif/2/${item.image_id}/full/200,/0/default.jpg`,
                metUrl: `https://www.artic.edu/artworks/${item.id}`,
                source: 'Art Institute of Chicago'
              });
            }
          }
        }
      } catch (error) {
        console.error(`Chicago ${term} 오류:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Chicago 수집 오류:', error.message);
  }
  
  return artworks;
}

// Smithsonian 수집
async function collectSmithsonian() {
  const artworks = [];
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  
  try {
    const url = 'https://api.si.edu/openaccess/api/v1.0/search?q=painting&media.guid=*&rows=200';
    
    const response = await axios.get(url, { httpsAgent, timeout: 15000 });
    
    if (response.data?.response?.rows) {
      for (const item of response.data.response.rows) {
        if (item.content?.descriptiveNonRepeating?.online_media?.[0]) {
          const media = item.content.descriptiveNonRepeating.online_media[0];
          
          artworks.push({
            objectID: `smithsonian-${item.id}`,
            title: item.title || 'Untitled',
            artist: item.content?.freetext?.name?.[0]?.content || 'Unknown',
            date: item.content?.freetext?.date?.[0]?.content || '',
            department: 'Smithsonian Institution',
            primaryImage: media.media?.[0]?.content || '',
            primaryImageSmall: media.thumbnail || '',
            metUrl: item.content?.descriptiveNonRepeating?.record_link || '',
            source: 'Smithsonian Institution'
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Smithsonian 수집 오류:', error.message);
  }
  
  return artworks;
}

// Cooper Hewitt 수집
async function collectCooperHewitt() {
  const artworks = [];
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  
  try {
    const url = 'https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.objects.getRandomObjects&has_images=1&per_page=100';
    
    const response = await axios.get(url, { httpsAgent, timeout: 15000 });
    
    if (response.data?.objects) {
      for (const item of response.data.objects) {
        if (item.images && item.images.length > 0) {
          artworks.push({
            objectID: `cooper-${item.id}`,
            title: item.title || 'Untitled',
            artist: item.participants?.[0]?.person_name || 'Unknown',
            date: item.date || '',
            department: 'Cooper Hewitt',
            primaryImage: item.images[0].b?.url || '',
            primaryImageSmall: item.images[0].sq?.url || '',
            metUrl: item.url || '',
            source: 'Cooper Hewitt'
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Cooper Hewitt 수집 오류:', error.message);
  }
  
  return artworks;
}

// 유럽 미술관들 수집
async function collectEuropeanMuseums() {
  const artworks = [];
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  
  try {
    // Victoria & Albert Museum (공개 API)
    const vaUrl = 'https://api.vam.ac.uk/v2/objects/search?q=painting&images_exist=1&page_size=100';
    
    const vaResponse = await axios.get(vaUrl, { httpsAgent, timeout: 15000 });
    
    if (vaResponse.data?.records) {
      for (const item of vaResponse.data.records) {
        if (item._images?.imageExists) {
          artworks.push({
            objectID: `va-${item.systemNumber}`,
            title: item._primaryTitle || 'Untitled',
            artist: item._primaryMaker?.name || 'Unknown',
            date: item._primaryDate || '',
            department: 'Victoria & Albert Museum',
            primaryImage: `https://framemark.vam.ac.uk/collections/${item.systemNumber}/full/735,/0/default.jpg`,
            primaryImageSmall: `https://framemark.vam.ac.uk/collections/${item.systemNumber}/full/200,/0/default.jpg`,
            metUrl: `https://collections.vam.ac.uk/item/${item.systemNumber}/`,
            source: 'Victoria & Albert Museum'
          });
        }
      }
    }
    
  } catch (error) {
    console.error('European Museums 수집 오류:', error.message);
  }
  
  return artworks;
}

// 데이터 정제 및 필터링
function cleanAndFilter(artworks) {
  const unique = [];
  const seen = new Set();
  
  for (const artwork of artworks) {
    if (!artwork.objectID || !artwork.title || !artwork.primaryImage) continue;
    
    const key = `${artwork.title}-${artwork.artist}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(artwork);
    }
  }
  
  // 유명 작가 우선 정렬
  const famousKeywords = [
    'van gogh', 'monet', 'renoir', 'degas', 'picasso', 'rembrandt', 'vermeer'
  ];
  
  return unique.sort((a, b) => {
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
async function saveStrategy1000Results(artworks) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join('./met-artworks-data', `strategy-1000-${timestamp}.json`);
  
  const sources = {};
  artworks.forEach(artwork => {
    sources[artwork.source] = (sources[artwork.source] || 0) + 1;
  });
  
  const data = {
    metadata: {
      strategy: 'Immediate 1000 Collection Strategy',
      date: new Date().toISOString(),
      total: artworks.length,
      sources
    },
    artworks
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  
  // CSV도 생성
  const csvContent = [
    'ObjectID,Title,Artist,Date,Source,Department,ImageURL',
    ...artworks.map(a => 
      `"${a.objectID}","${(a.title || '').replace(/"/g, '""')}","${(a.artist || '').replace(/"/g, '""')}","${a.date || ''}","${a.source || ''}","${a.department || ''}","${a.primaryImage || ''}"`
    )
  ].join('\\n');
  
  fs.writeFileSync(outputFile.replace('.json', '.csv'), csvContent);
  
  console.log(`\\n💾 저장 완료:`);
  console.log(`  - JSON: ${outputFile}`);
  console.log(`  - CSV: ${outputFile.replace('.json', '.csv')}`);
  
  console.log(`\\n📊 소스별 분포:`);
  Object.entries(sources)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      console.log(`  - ${source}: ${count}개`);
    });
}

// 실행
if (require.main === module) {
  immediate1000Strategy().catch(console.error);
}

module.exports = { immediate1000Strategy };