const axios = require('axios');
const cheerio = require('cheerio');

async function testRenoir() {
  console.log('🎨 르누아르 작품 테스트\n');
  
  try {
    const response = await axios.get('https://artvee.com/artist/pierre-auguste-renoir/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const artworks = [];
    
    // 작품 링크 수집
    $('a[href*="/dl/"]').each((i, el) => {
      if (i >= 10) return false; // 처음 10개만
      
      const artworkUrl = $(el).attr('href');
      const imgEl = $(el).find('img').first();
      
      if (artworkUrl && imgEl.length) {
        const artwork = {
          url: artworkUrl,
          title: imgEl.attr('alt') || 'Untitled',
          thumbnail: imgEl.attr('src') || imgEl.attr('data-src'),
          artveeId: artworkUrl.match(/\/dl\/([^\/]+)\//)?.[1]
        };
        
        artworks.push(artwork);
      }
    });
    
    console.log(`✅ ${artworks.length}개 르누아르 작품 발견:\n`);
    
    artworks.forEach((artwork, i) => {
      console.log(`${i + 1}. ${artwork.title}`);
      console.log(`   URL: ${artwork.url}`);
      console.log(`   ID: ${artwork.artveeId}`);
      console.log(`   썸네일: ${artwork.thumbnail ? '있음' : '없음'}\n`);
    });
    
    // 첫 번째 작품의 상세 정보 크롤링
    if (artworks.length > 0) {
      console.log('📋 첫 번째 작품 상세 정보:\n');
      await testArtworkDetails(artworks[0].url);
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

async function testArtworkDetails(artworkUrl) {
  try {
    const response = await axios.get(artworkUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const details = {
      title: $('h1').first().text().trim(),
      artist: $('.product-artist a').first().text().trim() || 'Unknown',
      tags: [],
      metadata: {},
      imageUrl: null
    };
    
    // 이미지 URL
    const imgEl = $('.woocommerce-product-gallery__image img').first();
    if (imgEl.length) {
      details.imageUrl = imgEl.attr('src') || imgEl.attr('data-src');
    }
    
    // 태그 수집
    $('.product-tags a').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag) details.tags.push(tag);
    });
    
    // 메타데이터
    $('.woocommerce-product-attributes-item').each((i, el) => {
      const label = $(el).find('.woocommerce-product-attributes-item__label').text().trim();
      const value = $(el).find('.woocommerce-product-attributes-item__value').text().trim();
      
      if (label && value) {
        details.metadata[label.toLowerCase().replace(':', '')] = value;
      }
    });
    
    console.log(`제목: ${details.title}`);
    console.log(`작가: ${details.artist}`);
    console.log(`태그: ${details.tags.join(', ')}`);
    console.log(`이미지: ${details.imageUrl ? '있음' : '없음'}`);
    console.log(`메타데이터:`, details.metadata);
    
    // SAYU 타입 매칭 (르누아르 = LREC - 섬세한 감정가)
    const sayuScore = calculateSayuScore(details, 'LREC');
    console.log(`\n🎯 LREC(고슴도치) 매칭 점수: ${sayuScore.score}점`);
    sayuScore.reasons.forEach(reason => {
      console.log(`   • ${reason}`);
    });
    
  } catch (error) {
    console.error('❌ 상세 정보 오류:', error.message);
  }
}

function calculateSayuScore(artwork, targetType) {
  let score = 0;
  const reasons = [];
  
  // 작가 기반 점수 (르누아르 = LREC)
  if (targetType === 'LREC' && artwork.artist.toLowerCase().includes('renoir')) {
    score += 50;
    reasons.push('르누아르 작품 (LREC 선호 작가)');
  }
  
  // 태그 기반 점수
  const lrecKeywords = ['portrait', 'woman', 'children', 'gentle', 'soft', 'impressionist'];
  artwork.tags.forEach(tag => {
    if (lrecKeywords.some(keyword => tag.toLowerCase().includes(keyword))) {
      score += 10;
      reasons.push(`관련 태그: ${tag}`);
    }
  });
  
  // 기본 점수
  if (score === 0) {
    score = 20;
    reasons.push('일반적 호환성');
  }
  
  return { score, reasons };
}

testRenoir();