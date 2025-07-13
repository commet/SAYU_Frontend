const puppeteer = require('puppeteer');
const fs = require('fs').promises;

/**
 * 간단한 Artvee 크롤링 테스트
 */
async function testSimpleCrawl() {
  console.log('🎨 Artvee 간단한 크롤링 테스트\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // 테스트용 URL (수집한 URL 중 하나)
    const testUrl = 'https://artvee.com/dl/molens-oliemolen-de-zeemeeuw-westzaandam/';
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    console.log('1️⃣ 페이지 접속...');
    console.log(`   URL: ${testUrl}`);
    
    await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('\n2️⃣ 작품 정보 추출...');
    
    const artwork = await page.evaluate(() => {
      const data = {};
      
      // 제목
      const titleEl = document.querySelector('h1');
      data.title = titleEl ? titleEl.textContent.trim() : 'Unknown';
      
      // 작가
      const artistEl = document.querySelector('.product-artist a');
      data.artist = artistEl ? artistEl.textContent.trim() : 'Unknown';
      
      // 이미지 URL
      const imageEl = document.querySelector('.woocommerce-product-gallery__image img');
      data.imageUrl = imageEl ? imageEl.src : null;
      
      // 태그
      const tagEls = document.querySelectorAll('.product-tags a');
      data.tags = Array.from(tagEls).map(el => el.textContent.trim());
      
      // 설명
      const descEl = document.querySelector('.product-description');
      data.description = descEl ? descEl.textContent.trim() : '';
      
      // 메타 정보
      const metaEls = document.querySelectorAll('.product-meta span');
      data.metadata = {};
      metaEls.forEach(el => {
        const text = el.textContent;
        if (text.includes('Date:')) {
          data.metadata.date = text.replace('Date:', '').trim();
        } else if (text.includes('Medium:')) {
          data.metadata.medium = text.replace('Medium:', '').trim();
        } else if (text.includes('Location:')) {
          data.metadata.location = text.replace('Location:', '').trim();
        }
      });
      
      return data;
    });
    
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
    
    const sayuMatching = {
      'LAEF': { score: 0, reasons: [] }, // 몽환적 방랑자
      'LAEC': { score: 0, reasons: [] }, // 감성 큐레이터
      'LAMF': { score: 0, reasons: [] }, // 직관적 탐구자
      'LAMC': { score: 0, reasons: [] }  // 철학적 수집가
    };
    
    // 태그 기반 매칭
    artwork.tags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      
      if (['dream', 'mystical', 'romantic', 'ethereal'].some(word => lowerTag.includes(word))) {
        sayuMatching.LAEF.score += 10;
        sayuMatching.LAEF.reasons.push(`태그: ${tag}`);
      }
      
      if (['elegant', 'refined', 'delicate', 'sophisticated'].some(word => lowerTag.includes(word))) {
        sayuMatching.LAEC.score += 10;
        sayuMatching.LAEC.reasons.push(`태그: ${tag}`);
      }
      
      if (['symbolic', 'mysterious', 'contemplative'].some(word => lowerTag.includes(word))) {
        sayuMatching.LAMF.score += 10;
        sayuMatching.LAMF.reasons.push(`태그: ${tag}`);
      }
      
      if (['philosophical', 'historical', 'classical'].some(word => lowerTag.includes(word))) {
        sayuMatching.LAMC.score += 10;
        sayuMatching.LAMC.reasons.push(`태그: ${tag}`);
      }
    });
    
    // 작가 기반 매칭
    const artistLower = artwork.artist.toLowerCase();
    if (artistLower.includes('van gogh') || artistLower.includes('turner')) {
      sayuMatching.LAEF.score += 20;
      sayuMatching.LAEF.reasons.push(`작가: ${artwork.artist}`);
    }
    
    console.log('   🎯 타입별 매칭 점수:');
    Object.entries(sayuMatching)
      .sort(([,a], [,b]) => b.score - a.score)
      .forEach(([type, data]) => {
        if (data.score > 0) {
          console.log(`      - ${type}: ${data.score}점`);
          data.reasons.forEach(reason => {
            console.log(`        • ${reason}`);
          });
        }
      });
    
    // 결과 저장
    const result = {
      url: testUrl,
      crawledAt: new Date().toISOString(),
      artwork,
      sayuMatching
    };
    
    await fs.writeFile(
      'data/test-crawl-result.json',
      JSON.stringify(result, null, 2)
    );
    
    console.log('\n💾 결과가 data/test-crawl-result.json에 저장되었습니다.');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n✨ 테스트 완료!');
}

// 실행
testSimpleCrawl().catch(console.error);