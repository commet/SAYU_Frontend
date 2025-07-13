const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs').promises;

/**
 * 전체 URL 수집기
 * 모든 product-sitemap을 스캔하여 충분한 데이터를 수집합니다
 */

class FullArtveeCollector {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.parser = new xml2js.Parser();
    this.allUrls = [];
    this.stats = {
      totalSitemaps: 0,
      successfulSitemaps: 0,
      failedSitemaps: []
    };
  }

  async collectAll() {
    console.log('🎨 Artvee 전체 URL 수집 시작...\n');
    console.log('⚡ 이 작업은 5-10분 정도 소요될 수 있습니다.\n');

    // 먼저 몇 개의 sitemap이 있는지 확인
    console.log('📊 Sitemap 범위 탐색 중...');
    const maxSitemap = await this.findMaxSitemap();
    console.log(`✅ 발견된 Sitemap 범위: 1 ~ ${maxSitemap}\n`);

    // 전체 범위를 10개 구간으로 나누어 수집
    const sections = 10;
    const sectionSize = Math.ceil(maxSitemap / sections);
    
    for (let section = 0; section < sections; section++) {
      const start = section * sectionSize + 1;
      const end = Math.min((section + 1) * sectionSize, maxSitemap);
      
      console.log(`\n📁 섹션 ${section + 1}/${sections}: Sitemap ${start}-${end}`);
      
      // 각 섹션에서 일정 간격으로 샘플링
      const step = Math.max(1, Math.floor((end - start) / 20)); // 각 섹션에서 최대 20개
      
      for (let i = start; i <= end; i += step) {
        await this.processSitemap(i);
        
        // 충분히 수집했으면 조기 종료
        if (this.allUrls.length >= 10000) {
          console.log('\n✅ 충분한 데이터 수집 완료!');
          break;
        }
      }
      
      if (this.allUrls.length >= 10000) break;
    }

    console.log(`\n📊 수집 완료: ${this.allUrls.length}개 URL`);
    
    // 분석 및 선별
    await this.analyzeAndSelect();
  }

  async findMaxSitemap() {
    // 이진 탐색으로 최대 sitemap 번호 찾기
    let low = 1;
    let high = 500; // 추정 최대값
    let maxFound = 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const exists = await this.sitemapExists(mid);
      
      if (exists) {
        maxFound = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return maxFound;
  }

  async sitemapExists(number) {
    try {
      const url = `${this.baseUrl}/product-sitemap${number}.xml`;
      const response = await axios.head(url, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async processSitemap(number) {
    const sitemapName = `product-sitemap${number}.xml`;
    process.stdout.write(`  ${sitemapName}... `);
    
    try {
      const url = `${this.baseUrl}/${sitemapName}`;
      const response = await axios.get(url, {
        timeout: 15000,
        headers: { 'User-Agent': 'SAYU-Bot/1.0' }
      });
      
      const result = await this.parser.parseStringPromise(response.data);
      const urlset = result.urlset?.url || [];
      
      let count = 0;
      for (const item of urlset) {
        const loc = item.loc[0];
        if (loc.includes('/dl/')) {
          this.allUrls.push({
            url: loc,
            lastmod: item.lastmod?.[0] || '',
            sitemap: sitemapName,
            artworkId: this.extractArtworkId(loc),
            metadata: this.extractMetadata(loc)
          });
          count++;
        }
      }
      
      console.log(`✓ ${count}개`);
      this.stats.successfulSitemaps++;
      
      await this.sleep(500); // 서버 부하 경감
    } catch (error) {
      console.log('✗ 실패');
      this.stats.failedSitemaps.push(number);
    }
    
    this.stats.totalSitemaps++;
  }

  extractArtworkId(url) {
    const match = url.match(/\/dl\/([^\/]+)\/?$/);
    return match ? match[1] : '';
  }

  extractMetadata(url) {
    const lower = url.toLowerCase();
    
    // 더 많은 유명 작가들
    const artists = [
      // 르네상스
      'leonardo', 'da-vinci', 'michelangelo', 'raphael', 'botticelli', 
      'titian', 'caravaggio', 'tintoretto', 'veronese',
      // 바로크
      'rembrandt', 'vermeer', 'rubens', 'velazquez', 'el-greco',
      'poussin', 'lorrain', 'hals', 'van-dyck',
      // 낭만주의
      'turner', 'constable', 'delacroix', 'goya', 'friedrich',
      'gericault', 'blake', 'fuseli',
      // 인상주의
      'monet', 'manet', 'renoir', 'degas', 'cezanne', 'pissarro',
      'sisley', 'morisot', 'cassatt', 'caillebotte',
      // 후기인상주의
      'van-gogh', 'gauguin', 'toulouse-lautrec', 'seurat', 'signac',
      // 표현주의
      'munch', 'schiele', 'kirchner', 'kandinsky', 'marc',
      // 기타
      'klimt', 'picasso', 'matisse', 'dali', 'kahlo',
      'hokusai', 'hiroshige', 'whistler', 'sargent', 'hopper',
      'wyeth', 'rockwell', 'basquiat', 'hockney', 'warhol'
    ];

    // 장르 키워드
    const genres = {
      portrait: ['portrait', 'face', 'head', 'self-portrait'],
      landscape: ['landscape', 'mountain', 'river', 'forest', 'valley', 'hill'],
      stillLife: ['still-life', 'still life', 'nature-morte'],
      abstract: ['abstract', 'composition', 'geometric'],
      marine: ['marine', 'seascape', 'ship', 'ocean', 'boat'],
      religious: ['madonna', 'christ', 'saint', 'angel', 'biblical'],
      mythology: ['venus', 'apollo', 'zeus', 'mythology', 'goddess'],
      animal: ['horse', 'dog', 'cat', 'bird', 'animal'],
      floral: ['flower', 'rose', 'bouquet', 'garden', 'floral'],
      cityscape: ['city', 'street', 'building', 'architecture', 'urban']
    };

    const metadata = {
      possibleArtist: null,
      genres: [],
      keywords: []
    };

    // 작가 찾기
    for (const artist of artists) {
      if (lower.includes(artist)) {
        metadata.possibleArtist = artist;
        break;
      }
    }

    // 장르 찾기
    for (const [genre, keywords] of Object.entries(genres)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          metadata.genres.push(genre);
          metadata.keywords.push(keyword);
          break;
        }
      }
    }

    return metadata;
  }

  async analyzeAndSelect() {
    console.log('\n🔍 데이터 분석 중...');
    
    // 중복 제거
    const uniqueMap = new Map();
    this.allUrls.forEach(item => uniqueMap.set(item.url, item));
    const uniqueUrls = Array.from(uniqueMap.values());
    
    console.log(`  - 중복 제거: ${this.allUrls.length} → ${uniqueUrls.length}`);
    
    // 카테고리별 분류
    const categorized = {
      withArtist: uniqueUrls.filter(u => u.metadata.possibleArtist),
      byGenre: {}
    };
    
    // 장르별 분류
    const allGenres = ['portrait', 'landscape', 'stillLife', 'abstract', 'marine', 
                       'religious', 'mythology', 'animal', 'floral', 'cityscape'];
    
    allGenres.forEach(genre => {
      categorized.byGenre[genre] = uniqueUrls.filter(u => 
        u.metadata.genres.includes(genre)
      );
    });

    // 통계 출력
    console.log(`  - 유명 작가 작품: ${categorized.withArtist.length}개`);
    console.log('  - 장르별:');
    Object.entries(categorized.byGenre).forEach(([genre, urls]) => {
      if (urls.length > 0) {
        console.log(`    • ${genre}: ${urls.length}개`);
      }
    });

    // 최종 선별 (1000개)
    console.log('\n⚖️ 최종 1,000개 선별 중...');
    const selected = [];
    
    // 1. 유명 작가 작품 (최대 300개)
    selected.push(...categorized.withArtist.slice(0, 300));
    
    // 2. 각 장르별로 균등 분배 (나머지 700개)
    const genresWithArt = Object.entries(categorized.byGenre)
      .filter(([_, urls]) => urls.length > 0)
      .sort((a, b) => b[1].length - a[1].length);
    
    const perGenre = Math.floor(700 / genresWithArt.length);
    
    genresWithArt.forEach(([genre, urls]) => {
      const filtered = urls.filter(u => !selected.includes(u));
      const toAdd = filtered.slice(0, perGenre);
      selected.push(...toAdd);
      console.log(`    ${genre}: ${toAdd.length}개 추가`);
    });
    
    // 3. 부족하면 랜덤 추가
    if (selected.length < 1000) {
      const remaining = uniqueUrls.filter(u => !selected.includes(u));
      const shuffled = remaining.sort(() => Math.random() - 0.5);
      selected.push(...shuffled.slice(0, 1000 - selected.length));
    }
    
    // 최종 1000개로 제한
    this.allUrls = selected.slice(0, 1000);
    
    // 저장
    await this.saveResults();
  }

  async saveResults() {
    await fs.mkdir('./data', { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    
    // JSON 저장
    const jsonPath = `./data/artvee-collection-${timestamp}.json`;
    await fs.writeFile(
      jsonPath,
      JSON.stringify({
        metadata: {
          total: this.allUrls.length,
          collectedAt: new Date().toISOString(),
          stats: this.stats,
          distribution: {
            withArtist: this.allUrls.filter(u => u.metadata.possibleArtist).length,
            byGenre: this.getGenreDistribution()
          }
        },
        urls: this.allUrls
      }, null, 2)
    );
    
    console.log(`\n💾 저장 완료: ${jsonPath}`);
    
    // 최종 통계
    console.log('\n📊 최종 컬렉션 통계:');
    console.log(`  - 총 작품: ${this.allUrls.length}개`);
    console.log(`  - 유명 작가: ${this.allUrls.filter(u => u.metadata.possibleArtist).length}개`);
    console.log(`  - Sitemap 수: ${new Set(this.allUrls.map(u => u.sitemap)).size}개`);
    
    const genreDist = this.getGenreDistribution();
    console.log('  - 장르 분포:');
    Object.entries(genreDist).forEach(([genre, count]) => {
      if (count > 0) {
        console.log(`    • ${genre}: ${count}개`);
      }
    });
  }

  getGenreDistribution() {
    const dist = {};
    this.allUrls.forEach(url => {
      url.metadata.genres.forEach(genre => {
        dist[genre] = (dist[genre] || 0) + 1;
      });
    });
    return dist;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  console.log('⏱️ 예상 소요 시간: 5-10분\n');
  
  const collector = new FullArtveeCollector();
  await collector.collectAll();
  
  console.log('\n✅ 수집 완료!');
}

main().catch(console.error);