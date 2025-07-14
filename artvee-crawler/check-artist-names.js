const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Artvee에서 작가 이름 검색
 */
async function searchArtist(searchTerm) {
  try {
    // Artvee 검색 URL
    const searchUrl = `https://artvee.com/?s=${encodeURIComponent(searchTerm)}&post_type=product`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    const artists = new Set();
    
    // 검색 결과에서 작가 이름 추출
    $('.product-artist a').each((i, elem) => {
      const artistLink = $(elem).attr('href');
      if (artistLink && artistLink.includes('/artist/')) {
        const artistSlug = artistLink.split('/artist/')[1].replace('/', '');
        artists.add(artistSlug);
      }
    });
    
    return Array.from(artists);
  } catch (error) {
    console.error(`검색 실패 (${searchTerm}):`, error.message);
    return [];
  }
}

// 테스트할 작가들
const artistsToCheck = [
  'Hieronymus Bosch',
  'Pieter Bruegel',
  'Gustav Klimt',
  'Georges Seurat',
  'Henri de Toulouse-Lautrec',
  'Salvador Dali',
  'Joan Miro',
  'Amedeo Modigliani',
  'Claude Lorrain',
  'Antoine Watteau',
  'Honore Daumier',
  'Artemisia Gentileschi'
];

async function main() {
  console.log('🔍 Artvee 작가 이름 확인\n');
  
  const results = {};
  
  for (const artist of artistsToCheck) {
    console.log(`검색: ${artist}`);
    const found = await searchArtist(artist);
    
    if (found.length > 0) {
      console.log(`  ✅ 찾음: ${found.join(', ')}`);
      results[artist] = found;
    } else {
      console.log(`  ❌ 찾지 못함`);
      results[artist] = [];
    }
    
    // 요청 간 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 결과 요약:');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);