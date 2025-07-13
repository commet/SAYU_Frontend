const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

/**
 * 저명한 작가들의 작품 수집기
 */
class FamousArtistCollector {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    
    // SAYU 타입별 저명한 작가들 (Artvee URL 형식)
    // 동물 이름은 SAYU_TYPE_DEFINITIONS.md 참조
    this.famousArtists = {
      // L+A 그룹 (혼자서 분위기를 음미하는)
      'LAEF': [
        'vincent-van-gogh', 'joseph-mallord-william-turner', 'caspar-david-friedrich', 'odilon-redon', 'gustave-moreau',
        'william-blake', 'edvard-munch', 'paul-gauguin'
      ], // 🦊 여우
      
      'LAEC': [
        'claude-monet', 'edgar-degas', 'mary-cassatt', 'john-singer-sargent', 'james-mcneill-whistler',
        'berthe-morisot', 'camille-pissarro', 'alfred-sisley'
      ], // 🐱 고양이
      
      'LAMF': [
        'johannes-vermeer', 'edward-hopper', 'giorgio-de-chirico', 'rene-magritte',
        'arthur-rackham', 'gustave-dore', 'aubrey-beardsley'
      ], // 🦉 올빼미
      
      'LAMC': [
        'paul-cezanne', 'georges-braque', 'paul-klee', 'jean-simeon-chardin',
        'juan-gris', 'fernand-leger', 'marcel-duchamp'
      ], // 🐢 거북이
      
      // L+R 그룹 (혼자서 정밀하게 관찰하는)
      'LREF': [
        'diego-velazquez', 'edouard-manet', 'gustave-courbet', 'thomas-eakins',
        'john-constable', 'jean-francois-millet', 'winslow-homer'
      ], // 🦎 카멜레온
      
      'LREC': [
        'pierre-auguste-renoir', 'jean-honore-fragonard', 'francois-boucher', 'thomas-gainsborough',
        'joshua-reynolds', 'george-romney', 'jean-baptiste-greuze'
      ], // 🦔 고슴도치
      
      'LRMF': [
        'caravaggio', 'francisco-goya', 'theodore-gericault', 'eugene-delacroix',
        'otto-dix', 'egon-schiele', 'chaim-soutine'
      ], // 🐙 문어
      
      'LRMC': [
        'albrecht-durer', 'jan-van-eyck', 'hans-holbein', 'jean-auguste-dominique-ingres',
        'william-bouguereau', 'lawrence-alma-tadema', 'frederic-leighton'
      ], // 🦫 비버
      
      // S+A 그룹 (함께 분위기를 느끼는)
      'SAEF': [
        'henri-matisse', 'marc-chagall', 'raoul-dufy', 'robert-delaunay',
        'andre-derain', 'maurice-de-vlaminck', 'kees-van-dongen'
      ], // 🦋 나비
      
      'SAEC': [
        'piet-mondrian', 'wassily-kandinsky', 'kazimir-malevich', 'josef-albers',
        'theo-van-doesburg', 'el-lissitzky', 'lyonel-feininger'
      ], // 🐧 펭귄
      
      'SAMF': [
        'grant-wood', 'edward-hopper', 'georgia-okeeffe',
        'stuart-davis', 'charles-demuth', 'marsden-hartley'
      ], // 🦜 앵무새
      
      'SAMC': [
        'roy-lichtenstein', 'jasper-johns', 'robert-rauschenberg', 'alexander-calder',
        'tom-wesselmann', 'james-rosenquist', 'claes-oldenburg'
      ], // 🦌 사슴
      
      // S+R 그룹 (함께 정확히 감상하는)
      'SREF': [
        'norman-rockwell', 'j-c-leyendecker', 'maxfield-parrish',
        'n-c-wyeth', 'howard-pyle', 'dean-cornwell'
      ], // 🐕 강아지
      
      'SREC': [
        'john-everett-millais', 'dante-gabriel-rossetti', 'john-william-waterhouse', 'alphonse-mucha',
        'edward-burne-jones', 'william-morris', 'aubrey-beardsley'
      ], // 🦆 오리
      
      'SRMF': [
        'rembrandt-van-rijn', 'peter-paul-rubens', 'titian', 'nicolas-poussin',
        'anthony-van-dyck', 'jacques-louis-david', 'eugene-delacroix'
      ], // 🐘 코끼리
      
      'SRMC': [
        'raphael', 'leonardo-da-vinci', 'michelangelo', 'sandro-botticelli',
        'andrea-mantegna', 'piero-della-francesca', 'giotto'
      ] // 🦅 독수리
    };
  }

  /**
   * 저명한 작가들의 작품 수집
   */
  async collectFamousArtworks() {
    console.log('🎨 저명한 작가들의 작품 수집 시작\n');
    
    const collectedArtworks = [];
    let totalProcessed = 0;
    
    // 각 SAYU 타입별로 처리
    for (const [sayuType, artists] of Object.entries(this.famousArtists)) {
      console.log(`🎯 ${sayuType} 타입 작가들 처리...`);
      
      for (const artist of artists) {
        try {
          console.log(`   작가: ${artist}`);
          
          const artworks = await this.getArtistArtworks(artist, sayuType);
          
          if (artworks.length > 0) {
            collectedArtworks.push(...artworks);
            console.log(`   ✅ ${artworks.length}개 작품 수집`);
            totalProcessed += artworks.length;
          } else {
            console.log(`   ⚠️ 작품을 찾을 수 없음`);
          }
          
          // 요청 간 지연
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.log(`   ❌ 오류: ${error.message}`);
        }
      }
      
      console.log('');
    }
    
    // 결과 저장
    await this.saveResults(collectedArtworks);
    
    console.log(`✅ 수집 완료!`);
    console.log(`📊 총 ${totalProcessed}개 작품 수집`);
    console.log(`🎨 ${Object.keys(this.famousArtists).length}개 SAYU 타입`);
    
    return collectedArtworks;
  }

  /**
   * 특정 작가의 작품들 수집
   */
  async getArtistArtworks(artistSlug, sayuType, limit = 10) {
    const artistUrl = `${this.baseUrl}/artist/${artistSlug}/`;
    
    try {
      const response = await axios.get(artistUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      const artworks = [];
      
      // 작가 정보 추출
      const artistName = $('h1').first().text().trim() || artistSlug.replace(/-/g, ' ');
      
      // 작품 링크들 수집 (이미지가 없는 텍스트 링크도 포함)
      $('a[href*="/dl/"]').each((i, el) => {
        if (i >= limit) return false; // 제한 수만큼만
        
        const $link = $(el);
        const artworkUrl = $link.attr('href');
        const imgEl = $link.find('img').first();
        
        if (artworkUrl) {
          let title = 'Untitled';
          let thumbnail = null;
          
          if (imgEl.length) {
            // 이미지가 있는 경우
            title = imgEl.attr('alt') || imgEl.attr('title') || 'Untitled';
            thumbnail = imgEl.attr('src') || imgEl.attr('data-src');
          } else {
            // 텍스트만 있는 경우
            title = $link.text().trim() || 'Untitled';
          }
          
          const artwork = {
            url: artworkUrl.startsWith('http') ? artworkUrl : `${this.baseUrl}${artworkUrl}`,
            artist: artistName,
            artistSlug,
            sayuType,
            title: title,
            thumbnail: thumbnail,
            artveeId: artworkUrl.match(/\/dl\/([^\/]+)\//)?.[1]
          };
          
          // 중복 제거
          if (!artworks.find(a => a.artveeId === artwork.artveeId)) {
            artworks.push(artwork);
          }
        }
      });
      
      return artworks;
      
    } catch (error) {
      if (error.response?.status === 404) {
        // 404는 작가가 없는 것이므로 다른 이름 시도
        const alternativeName = artistSlug.replace(/-/g, '_');
        if (alternativeName !== artistSlug) {
          return await this.getArtistArtworks(alternativeName, sayuType, limit);
        }
      }
      throw error;
    }
  }

  /**
   * 결과 저장
   */
  async saveResults(artworks) {
    const dataDir = path.join(__dirname, 'data');
    
    // 전체 결과 저장
    const allFile = path.join(dataDir, 'famous-artists-artworks.json');
    await fs.writeFile(allFile, JSON.stringify(artworks, null, 2));
    
    // URL만 추출해서 저장
    const urls = artworks.map(a => a.url);
    const urlsFile = path.join(dataDir, 'famous-artists-urls.json');
    await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2));
    
    // CSV 형태로도 저장
    const csvContent = [
      'url,artist,sayuType,title,artveeId',
      ...artworks.map(a => 
        `"${a.url}","${a.artist}","${a.sayuType}","${a.title}","${a.artveeId}"`
      )
    ].join('\n');
    
    const csvFile = path.join(dataDir, 'famous-artists-artworks.csv');
    await fs.writeFile(csvFile, csvContent);
    
    // SAYU 타입별 통계
    const typeStats = {};
    artworks.forEach(a => {
      typeStats[a.sayuType] = (typeStats[a.sayuType] || 0) + 1;
    });
    
    console.log('\n📊 SAYU 타입별 수집 현황:');
    Object.entries(typeStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}개`);
      });
    
    console.log(`\n💾 파일 저장:`);
    console.log(`   - ${allFile}`);
    console.log(`   - ${urlsFile}`);
    console.log(`   - ${csvFile}`);
  }

  /**
   * 특정 작가 테스트
   */
  async testSingleArtist(artistSlug) {
    console.log(`🧪 작가 테스트: ${artistSlug}\n`);
    
    try {
      const artworks = await this.getArtistArtworks(artistSlug, 'TEST', 5);
      
      console.log(`✅ ${artworks.length}개 작품 발견:`);
      artworks.forEach((artwork, i) => {
        console.log(`   ${i + 1}. ${artwork.title}`);
        console.log(`      URL: ${artwork.url}`);
        console.log(`      썸네일: ${artwork.thumbnail ? '있음' : '없음'}`);
      });
      
      return artworks;
      
    } catch (error) {
      console.log(`❌ 오류: ${error.message}`);
      return [];
    }
  }
}

// CLI 사용
async function main() {
  const collector = new FamousArtistCollector();
  
  const args = process.argv.slice(2);
  
  if (args[0] === 'test' && args[1]) {
    // 단일 작가 테스트: node collect-famous-artists.js test van-gogh
    await collector.testSingleArtist(args[1]);
  } else {
    // 전체 수집: node collect-famous-artists.js
    await collector.collectFamousArtworks();
  }
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = FamousArtistCollector;