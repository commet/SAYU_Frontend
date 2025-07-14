const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

/**
 * 기존 작가들의 추가 작품 수집
 */
class CollectionExpander {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.delay = 2000;
    this.maxArtworksPerArtist = 20; // 기존 10개에서 20개로 확대
  }

  /**
   * 추가 수집이 필요한 작가 목록
   */
  getExpandableArtists() {
    return {
      // 각 10개씩 더 수집 (총 20개씩)
      'LAEF': [
        'vincent-van-gogh', 'joseph-mallord-william-turner', 'caspar-david-friedrich', 
        'william-blake', 'edvard-munch', 'paul-gauguin'
      ],
      'LAEC': [
        'claude-monet', 'edgar-degas', 'mary-cassatt', 'john-singer-sargent',
        'berthe-morisot', 'camille-pissarro', 'alfred-sisley'
      ],
      'SRMC': [
        'leonardo-da-vinci', 'michelangelo', 'raphael', 'sandro-botticelli'
      ],
      'SRMF': [
        'rembrandt-van-rijn', 'peter-paul-rubens', 'titian'
      ],
      'SAEF': [
        'henri-matisse', 'marc-chagall', 'andre-derain'
      ],
      'LAMC': [
        'paul-cezanne', 'georges-braque', 'paul-klee'
      ],
      // 새로운 작가 추가
      'LREC': [
        'antoine-watteau', 'jean-baptiste-simeon-chardin', 'elisabeth-louise-vigee-lebrun'
      ],
      'LRMF': [
        'francisco-de-goya', 'artemisia-gentileschi', 'georges-de-la-tour'
      ],
      'SAEC': [
        'pablo-picasso', 'francis-picabia', 'robert-delaunay'
      ]
    };
  }

  /**
   * 작가의 추가 작품 수집
   */
  async collectAdditionalArtworks(artistSlug, sayuType, startIndex = 10) {
    try {
      const artistUrl = `${this.baseUrl}/artist/${artistSlug}/page/2/`;
      console.log(`   작가: ${artistSlug} (추가 수집)`);
      
      const response = await axios.get(artistUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      const artworks = [];
      
      // 작품 정보 수집
      $('.product-item').each((i, elem) => {
        if (artworks.length >= 10) return false; // 추가로 10개만
        
        const $elem = $(elem);
        const url = $elem.find('a').first().attr('href');
        const title = $elem.find('.entry-title').text().trim();
        const artistName = $elem.find('.product-artist').text().trim() || artistSlug.replace(/-/g, ' ');
        
        if (url) {
          const artveeId = url.split('/').filter(s => s).pop();
          
          artworks.push({
            url: url,
            artist: artistName,
            artistSlug: artistSlug,
            sayuType: sayuType,
            title: title || 'Untitled',
            thumbnail: null,
            artveeId: artveeId
          });
        }
      });
      
      console.log(`   ✅ ${artworks.length}개 추가 작품 수집`);
      return artworks;
      
    } catch (error) {
      // 페이지 2가 없으면 page 파라미터 없이 시도
      if (error.response?.status === 404) {
        return await this.collectFromMainPage(artistSlug, sayuType, startIndex);
      }
      console.error(`   ❌ 오류: ${error.message}`);
      return [];
    }
  }

  /**
   * 메인 페이지에서 추가 수집
   */
  async collectFromMainPage(artistSlug, sayuType, startIndex) {
    try {
      const artistUrl = `${this.baseUrl}/artist/${artistSlug}/`;
      
      const response = await axios.get(artistUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      const artworks = [];
      let currentIndex = 0;
      
      $('.product-item').each((i, elem) => {
        if (currentIndex < startIndex) {
          currentIndex++;
          return true; // skip
        }
        if (artworks.length >= 10) return false;
        
        const $elem = $(elem);
        const url = $elem.find('a').first().attr('href');
        const title = $elem.find('.entry-title').text().trim();
        const artistName = $elem.find('.product-artist').text().trim() || 
                          artistSlug.replace(/-/g, ' ').split(' ')
                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' ');
        
        if (url) {
          const artveeId = url.split('/').filter(s => s).pop();
          
          artworks.push({
            url: url,
            artist: artistName,
            artistSlug: artistSlug,
            sayuType: sayuType,
            title: title || 'Untitled',
            thumbnail: null,
            artveeId: artveeId
          });
        }
        
        currentIndex++;
      });
      
      return artworks;
    } catch (error) {
      console.error(`   ❌ 오류: ${error.message}`);
      return [];
    }
  }

  /**
   * 전체 확장 수집 실행
   */
  async expandCollection() {
    console.log('🎨 작품 수집 확장 시작\n');
    
    // 기존 데이터 로드
    let existingArtworks = [];
    try {
      const data = await fs.readFile('./data/famous-artists-artworks.json', 'utf8');
      existingArtworks = JSON.parse(data);
      console.log(`📊 기존 작품 수: ${existingArtworks.length}개\n`);
    } catch (error) {
      console.log('기존 데이터 없음\n');
    }
    
    const expandableArtists = this.getExpandableArtists();
    const newArtworks = [];
    
    // 각 SAYU 타입별로 처리
    for (const [sayuType, artists] of Object.entries(expandableArtists)) {
      console.log(`🎯 ${sayuType} 타입 작가들 처리...`);
      
      for (const artist of artists) {
        const artworks = await this.collectAdditionalArtworks(artist, sayuType);
        newArtworks.push(...artworks);
        
        // 요청 간 대기
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    // 중복 제거 및 병합
    const existingIds = new Set(existingArtworks.map(a => a.artveeId));
    const uniqueNewArtworks = newArtworks.filter(a => !existingIds.has(a.artveeId));
    const mergedArtworks = [...existingArtworks, ...uniqueNewArtworks];
    
    // 결과 저장
    await this.saveResults(mergedArtworks, uniqueNewArtworks);
    
    console.log('\n📊 확장 수집 결과:');
    console.log(`   기존: ${existingArtworks.length}개`);
    console.log(`   신규: ${uniqueNewArtworks.length}개`);
    console.log(`   총계: ${mergedArtworks.length}개`);
    
    return mergedArtworks;
  }

  /**
   * 결과 저장
   */
  async saveResults(allArtworks, newArtworks) {
    // 전체 데이터 저장
    await fs.writeFile(
      './data/famous-artists-artworks.json',
      JSON.stringify(allArtworks, null, 2)
    );
    
    // 신규 데이터만 별도 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeFile(
      `./data/expanded-artworks-${timestamp}.json`,
      JSON.stringify(newArtworks, null, 2)
    );
    
    console.log('\n💾 파일 저장 완료');
  }
}

// 실행
async function main() {
  const expander = new CollectionExpander();
  await expander.expandCollection();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CollectionExpander;