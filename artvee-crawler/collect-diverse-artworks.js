const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

/**
 * 시대와 유형별로 다양한 작품 수집
 */
class DiverseArtworkCollector {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.delay = 2000;
    this.batchSize = 50;
  }

  /**
   * 다양한 카테고리 URL 생성
   */
  getDiverseCategories() {
    return [
      // 시대별
      { url: '/browse/?filter_movement=renaissance', category: 'Renaissance', sayuType: 'SRMC' },
      { url: '/browse/?filter_movement=baroque', category: 'Baroque', sayuType: 'SRMF' },
      { url: '/browse/?filter_movement=romanticism', category: 'Romanticism', sayuType: 'LAEF' },
      { url: '/browse/?filter_movement=impressionism', category: 'Impressionism', sayuType: 'LAEC' },
      { url: '/browse/?filter_movement=post-impressionism', category: 'Post-Impressionism', sayuType: 'LAEF' },
      { url: '/browse/?filter_movement=expressionism', category: 'Expressionism', sayuType: 'LRMF' },
      { url: '/browse/?filter_movement=surrealism', category: 'Surrealism', sayuType: 'LAMF' },
      { url: '/browse/?filter_movement=realism', category: 'Realism', sayuType: 'LREF' },
      { url: '/browse/?filter_movement=symbolism', category: 'Symbolism', sayuType: 'LAMF' },
      { url: '/browse/?filter_movement=art-nouveau', category: 'Art Nouveau', sayuType: 'SREC' },
      
      // 장르별
      { url: '/browse/?filter_genre=portrait', category: 'Portrait', sayuType: 'LREC' },
      { url: '/browse/?filter_genre=landscape', category: 'Landscape', sayuType: 'LAEF' },
      { url: '/browse/?filter_genre=still-life', category: 'Still Life', sayuType: 'LAMC' },
      { url: '/browse/?filter_genre=religious', category: 'Religious', sayuType: 'SRMC' },
      { url: '/browse/?filter_genre=mythology', category: 'Mythology', sayuType: 'SRMF' },
      { url: '/browse/?filter_genre=abstract', category: 'Abstract', sayuType: 'SAEC' },
      { url: '/browse/?filter_genre=figurative', category: 'Figurative', sayuType: 'LREF' },
      { url: '/browse/?filter_genre=genre-painting', category: 'Genre Painting', sayuType: 'SREF' },
      
      // 지역별
      { url: '/browse/?filter_origin=italian', category: 'Italian Art', sayuType: 'SRMC' },
      { url: '/browse/?filter_origin=dutch', category: 'Dutch Art', sayuType: 'LRMC' },
      { url: '/browse/?filter_origin=french', category: 'French Art', sayuType: 'LAEC' },
      { url: '/browse/?filter_origin=spanish', category: 'Spanish Art', sayuType: 'LRMF' },
      { url: '/browse/?filter_origin=german', category: 'German Art', sayuType: 'LRMF' },
      { url: '/browse/?filter_origin=american', category: 'American Art', sayuType: 'SAMF' },
      { url: '/browse/?filter_origin=japanese', category: 'Japanese Art', sayuType: 'LAMF' },
      
      // 특별 컬렉션
      { url: '/browse/?s=masterpiece', category: 'Masterpieces', sayuType: 'SRMC' },
      { url: '/browse/?s=famous', category: 'Famous Works', sayuType: 'SRMF' },
      { url: '/browse/?s=museum', category: 'Museum Collection', sayuType: 'SRMC' }
    ];
  }

  /**
   * 카테고리별 작품 수집
   */
  async collectFromCategory(categoryInfo, maxItems = 30) {
    try {
      const fullUrl = `${this.baseUrl}${categoryInfo.url}`;
      console.log(`\n📁 카테고리: ${categoryInfo.category}`);
      console.log(`   URL: ${fullUrl}`);
      
      const response = await axios.get(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      const artworks = [];
      
      $('.product-item').each((i, elem) => {
        if (artworks.length >= maxItems) return false;
        
        const $elem = $(elem);
        const url = $elem.find('a').first().attr('href');
        const title = $elem.find('.entry-title').text().trim();
        const artist = $elem.find('.product-artist').text().trim();
        const image = $elem.find('img').first().attr('src');
        
        if (url) {
          const artveeId = url.split('/').filter(s => s).pop();
          
          artworks.push({
            url: url,
            artist: artist || 'Unknown',
            artistSlug: artist ? artist.toLowerCase().replace(/ /g, '-') : 'unknown',
            sayuType: categoryInfo.sayuType,
            title: title || 'Untitled',
            thumbnail: image || null,
            artveeId: artveeId,
            category: categoryInfo.category,
            collectedAt: new Date().toISOString()
          });
        }
      });
      
      console.log(`   ✅ ${artworks.length}개 작품 수집`);
      return artworks;
      
    } catch (error) {
      console.error(`   ❌ 오류: ${error.message}`);
      return [];
    }
  }

  /**
   * 검색을 통한 수집
   */
  async collectFromSearch(searchTerm, sayuType, maxItems = 20) {
    try {
      const searchUrl = `${this.baseUrl}/?s=${encodeURIComponent(searchTerm)}&post_type=product`;
      console.log(`\n🔍 검색: ${searchTerm}`);
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      const artworks = [];
      
      $('.product-item').each((i, elem) => {
        if (artworks.length >= maxItems) return false;
        
        const $elem = $(elem);
        const url = $elem.find('a').first().attr('href');
        const title = $elem.find('.entry-title').text().trim();
        const artist = $elem.find('.product-artist').text().trim();
        const image = $elem.find('img').first().attr('src');
        
        if (url) {
          const artveeId = url.split('/').filter(s => s).pop();
          
          artworks.push({
            url: url,
            artist: artist || 'Unknown',
            artistSlug: artist ? artist.toLowerCase().replace(/ /g, '-') : 'unknown',
            sayuType: sayuType,
            title: title || 'Untitled',
            thumbnail: image || null,
            artveeId: artveeId,
            searchTerm: searchTerm,
            collectedAt: new Date().toISOString()
          });
        }
      });
      
      console.log(`   ✅ ${artworks.length}개 작품 수집`);
      return artworks;
      
    } catch (error) {
      console.error(`   ❌ 오류: ${error.message}`);
      return [];
    }
  }

  /**
   * 다양한 검색어로 수집
   */
  async collectDiverseSearches() {
    const searchTerms = [
      // 시대별
      { term: 'medieval art', sayuType: 'SRMC' },
      { term: 'gothic art', sayuType: 'SRMC' },
      { term: 'neoclassical', sayuType: 'SRMC' },
      { term: 'rococo', sayuType: 'LREC' },
      { term: 'modern art', sayuType: 'SAEC' },
      { term: 'contemporary', sayuType: 'SAMF' },
      
      // 주제별
      { term: 'battle scene', sayuType: 'SRMF' },
      { term: 'biblical', sayuType: 'SRMC' },
      { term: 'mythological', sayuType: 'SRMF' },
      { term: 'allegory', sayuType: 'LAMF' },
      { term: 'nude', sayuType: 'LREF' },
      { term: 'self portrait', sayuType: 'LREC' },
      { term: 'cityscape', sayuType: 'LAEC' },
      { term: 'seascape', sayuType: 'LAEF' },
      { term: 'flowers', sayuType: 'LAMC' },
      { term: 'animals', sayuType: 'LREF' },
      
      // 기법별
      { term: 'watercolor', sayuType: 'LAEC' },
      { term: 'etching', sayuType: 'LRMC' },
      { term: 'drawing', sayuType: 'LRMC' },
      { term: 'sketch', sayuType: 'LRMC' },
      { term: 'fresco', sayuType: 'SRMC' },
      { term: 'miniature', sayuType: 'LRMC' }
    ];
    
    const allArtworks = [];
    
    for (const searchInfo of searchTerms) {
      const artworks = await this.collectFromSearch(searchInfo.term, searchInfo.sayuType);
      allArtworks.push(...artworks);
      
      // 요청 간 대기
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
    
    return allArtworks;
  }

  /**
   * 전체 다양한 수집 실행
   */
  async collectDiverseArtworks() {
    console.log('🎨 다양한 작품 수집 시작\n');
    
    const allArtworks = [];
    
    // 1. 카테고리별 수집
    console.log('📂 카테고리별 수집...');
    const categories = this.getDiverseCategories();
    
    for (const category of categories) {
      const artworks = await this.collectFromCategory(category);
      allArtworks.push(...artworks);
      
      // 요청 간 대기
      await new Promise(resolve => setTimeout(resolve, this.delay));
      
      // 진행 상황 저장
      if (allArtworks.length % 100 === 0) {
        await this.saveProgress(allArtworks);
      }
    }
    
    // 2. 검색어별 수집
    console.log('\n🔍 검색어별 수집...');
    const searchArtworks = await this.collectDiverseSearches();
    allArtworks.push(...searchArtworks);
    
    // 3. 중복 제거
    const uniqueArtworks = this.removeDuplicates(allArtworks);
    
    // 4. 결과 저장
    await this.saveResults(uniqueArtworks);
    
    // 5. 통계 출력
    this.printStatistics(uniqueArtworks);
    
    return uniqueArtworks;
  }

  /**
   * 중복 제거
   */
  removeDuplicates(artworks) {
    const seen = new Set();
    const unique = [];
    
    artworks.forEach(artwork => {
      const id = artwork.artveeId || artwork.url;
      if (!seen.has(id)) {
        seen.add(id);
        unique.push(artwork);
      }
    });
    
    return unique;
  }

  /**
   * 진행 상황 저장
   */
  async saveProgress(artworks) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeFile(
      `./data/diverse-progress-${timestamp}.json`,
      JSON.stringify(artworks, null, 2)
    );
    console.log(`💾 진행 상황 저장: ${artworks.length}개`);
  }

  /**
   * 최종 결과 저장
   */
  async saveResults(artworks) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // JSON 저장
    await fs.writeFile(
      './data/diverse-artworks.json',
      JSON.stringify(artworks, null, 2)
    );
    
    // 타임스탬프 버전도 저장
    await fs.writeFile(
      `./data/diverse-artworks-${timestamp}.json`,
      JSON.stringify(artworks, null, 2)
    );
    
    console.log(`\n💾 파일 저장 완료:`);
    console.log(`   - diverse-artworks.json`);
    console.log(`   - diverse-artworks-${timestamp}.json`);
  }

  /**
   * 통계 출력
   */
  printStatistics(artworks) {
    const stats = {
      byCategory: {},
      bySayuType: {},
      byArtist: {}
    };
    
    artworks.forEach(artwork => {
      // 카테고리별
      if (artwork.category) {
        stats.byCategory[artwork.category] = (stats.byCategory[artwork.category] || 0) + 1;
      }
      
      // SAYU 타입별
      stats.bySayuType[artwork.sayuType] = (stats.bySayuType[artwork.sayuType] || 0) + 1;
      
      // 작가별
      stats.byArtist[artwork.artist] = (stats.byArtist[artwork.artist] || 0) + 1;
    });
    
    console.log('\n📊 수집 통계:');
    console.log(`   총 작품 수: ${artworks.length}개`);
    
    console.log('\n📁 카테고리별:');
    Object.entries(stats.byCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count}개`);
      });
    
    console.log('\n🦊 SAYU 타입별:');
    Object.entries(stats.bySayuType)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}개`);
      });
  }
}

// 실행
async function main() {
  const collector = new DiverseArtworkCollector();
  await collector.collectDiverseArtworks();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DiverseArtworkCollector;