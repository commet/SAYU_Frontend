const axios = require('axios');
const cheerio = require('cheerio');

async function fixedRenoirTest() {
  console.log('🎨 수정된 르누아르 테스트\n');
  
  try {
    const response = await axios.get('https://artvee.com/artist/pierre-auguste-renoir/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const artworks = [];
    
    // 텍스트 링크라도 수집
    $('a[href*="/dl/"]').each((i, el) => {
      if (i >= 5) return false; // 처음 5개만
      
      const $link = $(el);
      const artworkUrl = $link.attr('href');
      const title = $link.text().trim();
      
      if (artworkUrl && title) {
        const artwork = {
          url: artworkUrl,
          title: title,
          artist: 'Pierre-Auguste Renoir',
          artveeId: artworkUrl.match(/\/dl\/([^\/]+)\//)?.[1]
        };
        
        artworks.push(artwork);
      }
    });
    
    console.log(`✅ ${artworks.length}개 르누아르 작품 발견:\n`);
    
    artworks.forEach((artwork, i) => {
      console.log(`${i + 1}. ${artwork.title}`);
      console.log(`   URL: ${artwork.url}`);
      console.log(`   ID: ${artwork.artveeId}\n`);
    });
    
    // 실제 작품 페이지 테스트
    if (artworks.length > 0) {
      console.log('📋 작품 상세 정보 테스트:\n');
      await testArtworkPage(artworks[0]);
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

async function testArtworkPage(artwork) {
  try {
    console.log(`테스트 작품: ${artwork.title}`);
    console.log(`URL: ${artwork.url}\n`);
    
    const response = await axios.get(artwork.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const details = {
      title: $('h1').first().text().trim(),
      artist: null,
      tags: [],
      imageUrl: null,
      metadata: {}
    };
    
    // 작가 정보 찾기 (다양한 선택자)
    const artistSelectors = [
      '.product-artist a',
      '.artist-name',
      'a[href*="artist"]',
      '.woocommerce-product-attributes-item__value a'
    ];
    
    for (const selector of artistSelectors) {
      const artistEl = $(selector).first();
      if (artistEl.length && artistEl.text().trim()) {
        details.artist = artistEl.text().trim();
        break;
      }
    }
    
    // 이미지 URL 찾기
    const imageSelectors = [
      '.woocommerce-product-gallery__image img',
      '.product-image img',
      '.artwork-image img',
      'img[src*="mdl.artvee.com"]'
    ];
    
    for (const selector of imageSelectors) {
      const imgEl = $(selector).first();
      if (imgEl.length && imgEl.attr('src')) {
        details.imageUrl = imgEl.attr('src');
        break;
      }
    }
    
    // 태그 수집
    $('.product-tags a, .tags a, a[rel="tag"]').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag && !details.tags.includes(tag)) {
        details.tags.push(tag);
      }
    });
    
    // 메타데이터 수집
    $('.woocommerce-product-attributes-item').each((i, el) => {
      const $el = $(el);
      const label = $el.find('.woocommerce-product-attributes-item__label').text().trim();
      const value = $el.find('.woocommerce-product-attributes-item__value').text().trim();
      
      if (label && value) {
        details.metadata[label.replace(':', '').toLowerCase()] = value;
      }
    });
    
    console.log('✅ 상세 정보 추출 결과:');
    console.log(`   제목: ${details.title}`);
    console.log(`   작가: ${details.artist || '찾을 수 없음'}`);
    console.log(`   이미지: ${details.imageUrl ? '있음' : '없음'}`);
    console.log(`   태그: ${details.tags.length > 0 ? details.tags.join(', ') : '없음'}`);
    console.log(`   메타데이터: ${Object.keys(details.metadata).length}개 항목`);
    
    // 메타데이터 출력
    if (Object.keys(details.metadata).length > 0) {
      console.log('\n📊 메타데이터:');
      Object.entries(details.metadata).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }
    
    // SAYU 매칭 점수
    const sayuScore = calculateSayuMatching(details);
    console.log('\n🎯 SAYU 타입 매칭:');
    Object.entries(sayuScore)
      .sort(([,a], [,b]) => b.score - a.score)
      .slice(0, 3)
      .forEach(([type, data]) => {
        console.log(`   ${type}: ${data.score}점`);
        data.reasons.forEach(reason => {
          console.log(`      • ${reason}`);
        });
      });
    
    return details;
    
  } catch (error) {
    console.error('❌ 작품 페이지 오류:', error.message);
  }
}

function calculateSayuMatching(artwork) {
  const sayuTypes = {
    'LAEF': { score: 0, reasons: [] }, // 여우 - 몽환적 방랑자
    'LAEC': { score: 0, reasons: [] }, // 고양이 - 감성 큐레이터
    'LREC': { score: 0, reasons: [] }, // 고슴도치 - 섬세한 감정가
    'SAEF': { score: 0, reasons: [] }, // 나비 - 감성 나눔이
    'SREC': { score: 0, reasons: [] }  // 오리 - 따뜻한 안내자
  };
  
  // 작가가 르누아르인 경우
  if (artwork.artist && artwork.artist.toLowerCase().includes('renoir')) {
    sayuTypes.LREC.score += 40;
    sayuTypes.LREC.reasons.push('르누아르 작품 (LREC 선호 작가)');
    
    sayuTypes.SAEF.score += 30;
    sayuTypes.SAEF.reasons.push('인상파 화가 (밝고 사교적)');
  }
  
  // 태그 기반 매칭
  artwork.tags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    
    if (['portrait', 'woman', 'children', 'family'].some(word => lowerTag.includes(word))) {
      sayuTypes.LREC.score += 15;
      sayuTypes.LREC.reasons.push(`관련 태그: ${tag}`);
    }
    
    if (['landscape', 'garden', 'nature', 'outdoor'].some(word => lowerTag.includes(word))) {
      sayuTypes.LAEF.score += 15;
      sayuTypes.LAEF.reasons.push(`관련 태그: ${tag}`);
    }
    
    if (['impressionist', 'colorful', 'bright'].some(word => lowerTag.includes(word))) {
      sayuTypes.SAEF.score += 15;
      sayuTypes.SAEF.reasons.push(`관련 태그: ${tag}`);
    }
  });
  
  // 제목 기반 매칭
  const titleLower = artwork.title.toLowerCase();
  if (['portrait', 'woman', 'girl', 'child'].some(word => titleLower.includes(word))) {
    sayuTypes.LREC.score += 10;
    sayuTypes.LREC.reasons.push('인물화 (LREC 선호)');
  }
  
  // 기본 점수
  Object.keys(sayuTypes).forEach(type => {
    if (sayuTypes[type].score === 0) {
      sayuTypes[type].score = 5;
      sayuTypes[type].reasons.push('일반적 호환성');
    }
  });
  
  return sayuTypes;
}

fixedRenoirTest();