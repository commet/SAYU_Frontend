/**
 * 다중 작품 크롤링 테스트
 */
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

async function testMultipleArtworks() {
  console.log('🎨 다중 작품 크롤링 테스트\n');
  
  try {
    const urlsFile = path.join(__dirname, 'data', 'artwork-urls-optimized.json');
    const urlsData = await fs.readFile(urlsFile, 'utf8');
    const urls = JSON.parse(urlsData);
    
    console.log(`📊 총 ${urls.length}개 URL 중 처음 5개 테스트\n`);
    
    const results = [];
    
    for (let i = 0; i < Math.min(5, urls.length); i++) {
      const url = urls[i];
      console.log(`[${i + 1}/5] 테스트 중: ${url}`);
      
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        const artwork = {
          url,
          artveeId: url.match(/\/dl\/([^\/]+)\//)?.[1] || 'unknown',
          title: $('h1').first().text().trim(),
          artist: null,
          imageUrl: null,
          tags: [],
          metadata: {}
        };
        
        // 다양한 선택자로 작가 찾기
        const artistSelectors = [
          '.product-artist a',
          '.artist-name',
          'a[href*="artist"]',
          '.woocommerce-product-attributes-item__value a'
        ];
        
        for (const selector of artistSelectors) {
          const artistEl = $(selector).first();
          if (artistEl.length && artistEl.text().trim()) {
            artwork.artist = artistEl.text().trim();
            break;
          }
        }
        
        if (!artwork.artist) {
          artwork.artist = 'Unknown';
        }
        
        // 다양한 선택자로 이미지 찾기
        const imageSelectors = [
          '.woocommerce-product-gallery__image img',
          '.product-image img',
          '.artwork-image img',
          'img[src*="artvee"]'
        ];
        
        for (const selector of imageSelectors) {
          const imgEl = $(selector).first();
          if (imgEl.length && imgEl.attr('src')) {
            artwork.imageUrl = imgEl.attr('src');
            break;
          }
        }
        
        // 태그 수집
        const tagSelectors = [
          '.product-tags a',
          '.artwork-tags a',
          '.categories a',
          'a[rel="tag"]'
        ];
        
        for (const selector of tagSelectors) {
          $(selector).each((i, el) => {
            const tag = $(el).text().trim().toLowerCase();
            if (tag && !artwork.tags.includes(tag)) {
              artwork.tags.push(tag);
            }
          });
          if (artwork.tags.length > 0) break;
        }
        
        // 메타데이터 수집
        $('.woocommerce-product-attributes-item').each((i, el) => {
          const label = $(el).find('.woocommerce-product-attributes-item__label').text().toLowerCase();
          const value = $(el).find('.woocommerce-product-attributes-item__value').text().trim();
          
          if (label.includes('date') || label.includes('year')) {
            artwork.metadata.date = value;
          } else if (label.includes('medium') || label.includes('technique')) {
            artwork.metadata.medium = value;
          } else if (label.includes('size') || label.includes('dimension')) {
            artwork.metadata.dimensions = value;
          }
        });
        
        results.push(artwork);
        
        console.log(`   ✅ 성공: ${artwork.title}`);
        console.log(`      작가: ${artwork.artist}`);
        console.log(`      태그: ${artwork.tags.slice(0, 3).join(', ')}`);
        console.log(`      이미지: ${artwork.imageUrl ? '있음' : '없음'}\n`);
        
        // 요청 간 지연
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`   ❌ 실패: ${error.message}\n`);
        results.push({ url, error: error.message });
      }
    }
    
    // 결과 분석
    console.log('📊 결과 분석:\n');
    
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);
    
    console.log(`   성공: ${successful.length}개`);
    console.log(`   실패: ${failed.length}개\n`);
    
    if (successful.length > 0) {
      console.log('✅ 성공한 작품들:');
      successful.forEach((artwork, i) => {
        console.log(`   ${i + 1}. ${artwork.title} - ${artwork.artist}`);
        if (artwork.tags.length > 0) {
          console.log(`      태그: ${artwork.tags.slice(0, 5).join(', ')}`);
        }
      });
      
      // 결과 저장
      const outputFile = path.join(__dirname, 'data', 'test-crawl-results.json');
      await fs.writeFile(outputFile, JSON.stringify(results, null, 2));
      console.log(`\n💾 결과 저장: ${outputFile}`);
    }
    
    if (failed.length > 0) {
      console.log('\n❌ 실패한 URL들:');
      failed.forEach((item, i) => {
        console.log(`   ${i + 1}. ${item.url}`);
        console.log(`      오류: ${item.error}`);
      });
    }
    
    // 개선 제안
    console.log('\n💡 개선 제안:');
    
    const hasImages = successful.filter(a => a.imageUrl).length;
    const hasArtists = successful.filter(a => a.artist !== 'Unknown').length;
    const hasTags = successful.filter(a => a.tags.length > 0).length;
    
    console.log(`   - 이미지 추출률: ${hasImages}/${successful.length}`);
    console.log(`   - 작가 추출률: ${hasArtists}/${successful.length}`);
    console.log(`   - 태그 추출률: ${hasTags}/${successful.length}`);
    
    if (hasImages < successful.length) {
      console.log('   → 이미지 선택자 개선 필요');
    }
    if (hasArtists < successful.length) {
      console.log('   → 작가 정보 추출 로직 개선 필요');
    }
    if (hasTags < successful.length) {
      console.log('   → 태그 수집 방법 개선 필요');
    }
    
  } catch (error) {
    console.error('❌ 전체 테스트 실패:', error.message);
  }
  
  console.log('\n✨ 다중 테스트 완료!');
}

// 실행
testMultipleArtworks().catch(console.error);