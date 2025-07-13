const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

/**
 * Axios + Cheerio를 사용한 간단한 크롤링 테스트
 */
async function testAxiosCrawl() {
  console.log('🎨 Artvee 크롤링 테스트 (Axios + Cheerio)\n');
  
  try {
    // 테스트 URL
    const testUrl = 'https://artvee.com/dl/molens-oliemolen-de-zeemeeuw-westzaandam/';
    
    console.log('1️⃣ 페이지 요청...');
    console.log(`   URL: ${testUrl}`);
    
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    
    console.log('\n2️⃣ 작품 정보 추출...');
    
    const artwork = {
      url: testUrl,
      title: $('h1').first().text().trim() || 'Unknown',
      artist: $('.product-artist a').first().text().trim() || 'Unknown',
      imageUrl: $('.woocommerce-product-gallery__image img').first().attr('src') || null,
      tags: [],
      metadata: {}
    };
    
    // 태그 수집
    $('.product-tags a').each((i, el) => {
      artwork.tags.push($(el).text().trim());
    });
    
    // 메타데이터 수집
    $('.product-meta span').each((i, el) => {
      const text = $(el).text();
      if (text.includes('Date:')) {
        artwork.metadata.date = text.replace('Date:', '').trim();
      } else if (text.includes('Medium:')) {
        artwork.metadata.medium = text.replace('Medium:', '').trim();
      } else if (text.includes('Location:')) {
        artwork.metadata.location = text.replace('Location:', '').trim();
      }
    });
    
    // 설명
    artwork.description = $('.product-description').text().trim() || '';
    
    console.log('✅ 크롤링 성공!');
    console.log('\n📊 추출된 정보:');
    console.log(`   - 제목: ${artwork.title}`);
    console.log(`   - 작가: ${artwork.artist}`);
    console.log(`   - 태그: ${artwork.tags.slice(0, 5).join(', ')}${artwork.tags.length > 5 ? '...' : ''}`);
    console.log(`   - 이미지: ${artwork.imageUrl ? '있음' : '없음'}`);
    
    if (artwork.metadata.date) {
      console.log(`   - 날짜: ${artwork.metadata.date}`);
    }
    if (artwork.metadata.medium) {
      console.log(`   - 매체: ${artwork.metadata.medium}`);
    }
    
    // SAYU 타입 매칭 분석
    console.log('\n3️⃣ SAYU 타입 매칭 분석...');
    
    const sayuTypes = {
      'LAEF': '여우 - 몽환적 방랑자',
      'LAEC': '고양이 - 감성 큐레이터',
      'LAMF': '올빼미 - 직관적 탐구자',
      'LAMC': '거북이 - 철학적 수집가',
      'LREF': '카멜레온 - 고독한 관찰자',
      'LREC': '고슴도치 - 섬세한 감정가',
      'LRMF': '문어 - 디지털 탐험가',
      'LRMC': '비버 - 학구적 연구자'
    };
    
    const matching = analyzeSayuMatching(artwork, sayuTypes);
    
    console.log('   🎯 추천 SAYU 타입:');
    Object.entries(matching)
      .sort(([,a], [,b]) => b.score - a.score)
      .slice(0, 3)
      .forEach(([type, data]) => {
        if (data.score > 0) {
          console.log(`      - ${type} (${sayuTypes[type]}): ${data.score}점`);
          data.reasons.forEach(reason => {
            console.log(`        • ${reason}`);
          });
        }
      });
    
    // 결과 저장
    const result = {
      crawledAt: new Date().toISOString(),
      artwork,
      sayuMatching: matching
    };
    
    await fs.writeFile(
      'data/test-axios-crawl-result.json',
      JSON.stringify(result, null, 2)
    );
    
    console.log('\n💾 결과가 data/test-axios-crawl-result.json에 저장되었습니다.');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    if (error.response) {
      console.error('   상태 코드:', error.response.status);
    }
  }
  
  console.log('\n✨ 테스트 완료!');
}

/**
 * SAYU 타입 매칭 분석
 */
function analyzeSayuMatching(artwork, sayuTypes) {
  const matching = {};
  
  // 각 타입별 초기화
  Object.keys(sayuTypes).forEach(type => {
    matching[type] = { score: 0, reasons: [] };
  });
  
  // 태그 기반 분석
  artwork.tags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    
    // LAEF - 몽환적, 감정적, 꿈같은
    if (['dream', 'mystical', 'romantic', 'ethereal', 'fantasy', 'surreal'].some(word => lowerTag.includes(word))) {
      matching.LAEF.score += 15;
      matching.LAEF.reasons.push(`관련 태그: ${tag}`);
    }
    
    // LAEC - 우아한, 세련된, 감성적
    if (['elegant', 'refined', 'delicate', 'sophisticated', 'graceful'].some(word => lowerTag.includes(word))) {
      matching.LAEC.score += 15;
      matching.LAEC.reasons.push(`관련 태그: ${tag}`);
    }
    
    // LAMF - 신비로운, 상징적, 직관적
    if (['symbolic', 'mysterious', 'contemplative', 'spiritual', 'mystical'].some(word => lowerTag.includes(word))) {
      matching.LAMF.score += 15;
      matching.LAMF.reasons.push(`관련 태그: ${tag}`);
    }
    
    // LAMC - 철학적, 역사적, 고전적
    if (['philosophical', 'historical', 'classical', 'ancient', 'traditional'].some(word => lowerTag.includes(word))) {
      matching.LAMC.score += 15;
      matching.LAMC.reasons.push(`관련 태그: ${tag}`);
    }
    
    // LREC - 섬세한, 감정적, 부드러운
    if (['gentle', 'tender', 'soft', 'delicate', 'intimate'].some(word => lowerTag.includes(word))) {
      matching.LREC.score += 15;
      matching.LREC.reasons.push(`관련 태그: ${tag}`);
    }
  });
  
  // 작가 기반 분석
  const artistLower = artwork.artist.toLowerCase();
  
  if (['van gogh', 'turner', 'blake'].some(name => artistLower.includes(name))) {
    matching.LAEF.score += 25;
    matching.LAEF.reasons.push(`선호 작가: ${artwork.artist}`);
  }
  
  if (['monet', 'degas', 'cassatt'].some(name => artistLower.includes(name))) {
    matching.LAEC.score += 25;
    matching.LAEC.reasons.push(`선호 작가: ${artwork.artist}`);
  }
  
  if (['vermeer', 'hopper', 'hammershoi'].some(name => artistLower.includes(name))) {
    matching.LAMF.score += 25;
    matching.LAMF.reasons.push(`선호 작가: ${artwork.artist}`);
  }
  
  // 시대/스타일 기반 (메타데이터)
  if (artwork.metadata.date) {
    const year = parseInt(artwork.metadata.date.match(/\d{4}/)?.[0]);
    if (year && year < 1800) {
      matching.LAMC.score += 10;
      matching.LAMC.reasons.push('고전 시대 작품');
    }
  }
  
  return matching;
}

// 실행
testAxiosCrawl().catch(console.error);