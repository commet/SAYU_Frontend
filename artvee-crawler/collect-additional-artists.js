const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { additionalArtists, artistsToCheck } = require('./additional-artists.js');

/**
 * 추가 작가들의 작품 수집기
 */
class AdditionalArtistCollector {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.delay = 2000;
    this.maxArtworksPerArtist = 10;
  }

  /**
   * 작가 URL에서 작품 수집
   */
  async collectFromArtist(artistSlug, sayuType) {
    try {
      const artistUrl = `${this.baseUrl}/artist/${artistSlug}/`;
      console.log(`   작가: ${artistSlug}`);
      
      const response = await axios.get(artistUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      const artworks = [];
      
      // 작품 링크 수집
      $('.product-item').each((i, elem) => {
        if (i >= this.maxArtworksPerArtist) return false;
        
        const $elem = $(elem);
        const url = $elem.find('a').first().attr('href');
        
        if (url) {
          artworks.push(url);
        }
      });
      
      console.log(`   ✅ ${artworks.length}개 작품 URL 수집`);
      
      // 각 작품 상세 정보 수집
      const detailedArtworks = [];
      for (const artworkUrl of artworks) {
        await this.sleep(1000); // 요청 간 대기
        
        try {
          const artworkData = await this.fetchArtworkDetails(artworkUrl, artistSlug, sayuType);
          if (artworkData) {
            detailedArtworks.push(artworkData);
          }
        } catch (error) {
          console.error(`   ❌ 작품 수집 실패: ${artworkUrl}`);
        }
      }
      
      return detailedArtworks;
      
    } catch (error) {
      console.error(`   ❌ 오류: ${error.message}`);
      return [];
    }
  }

  /**
   * 작품 상세 정보 가져오기
   */
  async fetchArtworkDetails(url, artistSlug, sayuType) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      
      // URL에서 ID 추출
      const artveeId = url.split('/').filter(s => s).pop();
      
      return {
        url: url,
        artist: $('.product-artist a').first().text().trim() || 'Unknown',
        artistSlug: artistSlug,
        sayuType: sayuType,
        title: $('h1').first().text().trim() || 'Unknown',
        thumbnail: $('.woocommerce-product-gallery__image img').first().attr('src') || null,
        artveeId: artveeId
      };
      
    } catch (error) {
      return null;
    }
  }

  /**
   * 모든 추가 작가들의 작품 수집
   */
  async collectAdditionalArtworks() {
    console.log('🎨 추가 작가들의 작품 수집 시작\n');
    
    const collectedArtworks = [];
    const failedArtists = [];
    
    // 각 SAYU 타입별로 처리
    for (const [sayuType, artists] of Object.entries(additionalArtists)) {
      console.log(`🎯 ${sayuType} 타입 추가 작가들 처리...`);
      
      for (const artist of artists) {
        try {
          const artworks = await this.collectFromArtist(artist, sayuType);
          collectedArtworks.push(...artworks);
          
          // 요청 간 대기
          await this.sleep(this.delay);
        } catch (error) {
          failedArtists.push({ artist, sayuType, error: error.message });
        }
      }
    }
    
    // 결과 요약
    console.log('\n📊 추가 수집 결과:');
    console.log(`   성공: ${collectedArtworks.length}개 작품`);
    console.log(`   실패: ${failedArtists.length}명 작가`);
    
    if (failedArtists.length > 0) {
      console.log('\n❌ 실패한 작가들:');
      failedArtists.forEach(({ artist, error }) => {
        console.log(`   - ${artist}: ${error}`);
      });
    }
    
    // 파일 저장
    if (collectedArtworks.length > 0) {
      await this.saveResults(collectedArtworks);
    }
    
    return collectedArtworks;
  }

  /**
   * 결과 저장
   */
  async saveResults(artworks) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 기존 데이터 로드
    let existingData = [];
    try {
      const data = await fs.readFile('./data/famous-artists-artworks.json', 'utf8');
      existingData = JSON.parse(data);
    } catch (error) {
      console.log('기존 데이터 없음, 새로 생성');
    }
    
    // 중복 제거하여 병합
    const existingUrls = new Set(existingData.map(a => a.url));
    const newArtworks = artworks.filter(a => !existingUrls.has(a.url));
    const mergedData = [...existingData, ...newArtworks];
    
    // 저장
    await fs.writeFile(
      './data/famous-artists-artworks.json',
      JSON.stringify(mergedData, null, 2)
    );
    
    await fs.writeFile(
      `./data/additional-artists-${timestamp}.json`,
      JSON.stringify(artworks, null, 2)
    );
    
    console.log(`\n💾 파일 저장 완료:`);
    console.log(`   - 전체: ./data/famous-artists-artworks.json (${mergedData.length}개)`);
    console.log(`   - 추가분: ./data/additional-artists-${timestamp}.json (${artworks.length}개)`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  const collector = new AdditionalArtistCollector();
  await collector.collectAdditionalArtworks();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AdditionalArtistCollector;