const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 작가별 총 작품 수 확인
 */
async function checkArtistTotalWorks(artistSlug) {
  try {
    const url = `https://artvee.com/artist/${artistSlug}/`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    const totalWorks = $('.product-item').length;
    
    // 페이지네이션 확인
    const hasPages = $('.pagination').length > 0;
    const pageNumbers = [];
    if (hasPages) {
      $('.pagination a').each((i, elem) => {
        const pageNum = $(elem).text().trim();
        if (pageNum && !isNaN(pageNum)) {
          pageNumbers.push(parseInt(pageNum));
        }
      });
    }
    
    const maxPage = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;
    
    return {
      artist: artistSlug,
      worksOnFirstPage: totalWorks,
      hasMultiplePages: hasPages,
      estimatedTotalPages: maxPage,
      estimatedTotalWorks: totalWorks * maxPage
    };
    
  } catch (error) {
    return {
      artist: artistSlug,
      error: error.message
    };
  }
}

// 주요 작가들 확인
const majorArtists = [
  'vincent-van-gogh',
  'claude-monet',
  'leonardo-da-vinci',
  'rembrandt-van-rijn',
  'pablo-picasso',
  'michelangelo',
  'johannes-vermeer',
  'william-turner',
  'turner',
  'j-m-w-turner',
  'auguste-rodin',
  'impressionism',
  'renaissance'
];

async function main() {
  console.log('🔍 작가별 작품 수 확인\n');
  
  for (const artist of majorArtists) {
    const result = await checkArtistTotalWorks(artist);
    
    if (result.error) {
      console.log(`❌ ${artist}: ${result.error}`);
    } else {
      console.log(`✅ ${artist}:`);
      console.log(`   첫 페이지 작품: ${result.worksOnFirstPage}개`);
      console.log(`   여러 페이지: ${result.hasMultiplePages ? '예' : '아니오'}`);
      if (result.hasMultiplePages) {
        console.log(`   예상 총 작품: ${result.estimatedTotalWorks}개 (${result.estimatedTotalPages} 페이지)`);
      }
    }
    
    // 요청 간 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

main().catch(console.error);