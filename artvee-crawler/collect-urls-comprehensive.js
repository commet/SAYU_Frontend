const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs').promises;

/**
 * 포괄적 URL 수집기
 * 더 많은 sitemap에서 충분한 URL을 수집합니다
 */

class ComprehensiveArtveeCollector {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.parser = new xml2js.Parser();
    this.allUrls = [];
  }

  async collectComprehensive() {
    console.log('🎨 Artvee 포괄적 URL 수집 시작...\n');
    console.log('📊 목표: 다양한 작품 1,000개 수집\n');

    // 더 많은 sitemap 확인
    const sitemapRanges = [
      { start: 330, end: 339, priority: 'high' },    // 최신
      { start: 300, end: 329, priority: 'medium' },  // 최근
      { start: 250, end: 299, priority: 'medium' },  // 중간
      { start: 200, end: 249, priority: 'medium' },  // 중간
      { start: 150, end: 199, priority: 'low' },     // 오래된
      { start: 100, end: 149, priority: 'low' },     // 오래된
      { start: 50, end: 99, priority: 'low' },       // 더 오래된
      { start: 1, end: 49, priority: 'low' }         // 가장 오래된
    ];

    // 각 범위에서 수집
    for (const range of sitemapRanges) {
      console.log(`\n📁 Sitemap ${range.start}-${range.end} 범위 처리 중...`);
      
      // 각 범위에서 몇 개의 sitemap을 샘플링
      const step = Math.ceil((range.end - range.start) / 5); // 각 범위에서 5개 정도
      
      for (let i = range.start; i <= range.end; i += step) {
        const sitemapName = `product-sitemap${i}.xml`;
        console.log(`  📄 ${sitemapName} 처리 중...`);
        
        const urls = await this.extractUrlsFromSitemap(sitemapName);
        if (urls.length > 0) {
          this.allUrls.push(...urls);
          console.log(`    ✓ ${urls.length}개 URL 수집`);
        }
        
        // 이미 충분히 수집했으면 중단
        if (this.allUrls.length >= 5000) {
          console.log(`\n✅ 충분한 URL 수집 완료!`);
          break;
        }
        
        await this.sleep(1000);
      }
      
      if (this.allUrls.length >= 5000) break;
    }

    console.log(`\n📊 총 수집된 URL: ${this.allUrls.length}개`);

    // 중복 제거
    this.removeDuplicates();

    // 균등 분배로 1000개 선택
    this.selectBalanced();

    // 결과 저장
    await this.saveResults();
  }

  async extractUrlsFromSitemap(sitemapName) {
    try {
      const url = `${this.baseUrl}/${sitemapName}`;
      const response = await axios.get(url, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'SAYU-Bot/1.0 (Educational)'
        }
      });
      
      const result = await this.parser.parseStringPromise(response.data);
      const urls = [];
      const urlset = result.urlset?.url || [];

      for (const item of urlset) {
        const loc = item.loc[0];
        const lastmod = item.lastmod ? item.lastmod[0] : '';
        
        if (loc.includes('/dl/')) {
          urls.push({
            url: loc,
            lastmod: lastmod,
            sitemap: sitemapName,
            artworkId: loc.split('/dl/')[1]?.replace('/', '') || '',
            // 작품명에서 힌트 추출
            hints: this.extractHints(loc)
          });
        }
      }

      return urls;
    } catch (error) {
      console.error(`    ✗ 실패: ${error.message}`);
      return [];
    }
  }

  extractHints(url) {
    const hints = {
      hasPortrait: url.includes('portrait'),
      hasLandscape: url.includes('landscape'),
      hasStillLife: url.includes('still-life'),
      hasAbstract: url.includes('abstract'),
      // 유명 작가 이름이 URL에 있는지 체크
      possibleArtist: this.checkForArtistNames(url)
    };
    return hints;
  }

  checkForArtistNames(url) {
    const artists = [
      'van-gogh', 'monet', 'klimt', 'picasso', 'rembrandt',
      'vermeer', 'da-vinci', 'hokusai', 'manet', 'degas',
      'cezanne', 'renoir', 'turner', 'whistler', 'sargent',
      'goya', 'rubens', 'botticelli', 'caravaggio', 'raphael',
      'michelangelo', 'dürer', 'bruegel', 'velázquez', 'el-greco'
    ];
    
    const lowerUrl = url.toLowerCase();
    for (const artist of artists) {
      if (lowerUrl.includes(artist)) {
        return artist;
      }
    }
    return null;
  }

  removeDuplicates() {
    const uniqueMap = new Map();
    this.allUrls.forEach(item => {
      uniqueMap.set(item.url, item);
    });
    this.allUrls = Array.from(uniqueMap.values());
    console.log(`\n🔍 중복 제거 후: ${this.allUrls.length}개`);
  }

  selectBalanced() {
    console.log('\n⚖️ 균형잡힌 선택 중...');
    
    const selected = [];
    
    // 1. 가능한 유명 작가 작품 우선
    const withArtists = this.allUrls.filter(u => u.hints.possibleArtist);
    console.log(`  - 유명 작가 가능성: ${withArtists.length}개`);
    selected.push(...withArtists.slice(0, 200));

    // 2. 카테고리별 분류
    const categories = {
      portrait: this.allUrls.filter(u => u.hints.hasPortrait),
      landscape: this.allUrls.filter(u => u.hints.hasLandscape),
      stillLife: this.allUrls.filter(u => u.hints.hasStillLife),
      abstract: this.allUrls.filter(u => u.hints.hasAbstract)
    };

    // 각 카테고리에서 균등 선택
    Object.entries(categories).forEach(([cat, urls]) => {
      const needed = Math.min(150, urls.length);
      const filtered = urls.filter(u => !selected.includes(u));
      selected.push(...filtered.slice(0, needed));
      console.log(`  - ${cat}: ${filtered.slice(0, needed).length}개 추가`);
    });

    // 3. 나머지는 랜덤하게
    const remaining = this.allUrls.filter(u => !selected.includes(u));
    const shuffled = remaining.sort(() => Math.random() - 0.5);
    const needed = 1000 - selected.length;
    selected.push(...shuffled.slice(0, needed));

    this.allUrls = selected.slice(0, 1000);
    console.log(`\n✅ 최종 선택: ${this.allUrls.length}개`);
  }

  async saveResults() {
    await fs.mkdir('./data', { recursive: true });
    
    // 메인 JSON 파일
    const jsonPath = './data/artvee-urls-final.json';
    await fs.writeFile(
      jsonPath,
      JSON.stringify({
        metadata: {
          total: this.allUrls.length,
          collectedAt: new Date().toISOString(),
          strategy: 'comprehensive balanced selection'
        },
        urls: this.allUrls
      }, null, 2)
    );
    console.log(`\n💾 JSON 저장: ${jsonPath}`);

    // CSV 형식
    const csvPath = './data/artvee-urls-final.csv';
    const csvHeader = 'url,artwork_id,lastmod,sitemap,possible_artist\n';
    const csvContent = this.allUrls.map(u => 
      `"${u.url}","${u.artworkId}","${u.lastmod}","${u.sitemap}","${u.hints.possibleArtist || ''}"`
    ).join('\n');
    
    await fs.writeFile(csvPath, csvHeader + csvContent);
    console.log(`💾 CSV 저장: ${csvPath}`);

    // 통계
    const stats = {
      total: this.allUrls.length,
      bySitemap: {},
      withPossibleArtist: this.allUrls.filter(u => u.hints.possibleArtist).length,
      byCategory: {
        portrait: this.allUrls.filter(u => u.hints.hasPortrait).length,
        landscape: this.allUrls.filter(u => u.hints.hasLandscape).length,
        stillLife: this.allUrls.filter(u => u.hints.hasStillLife).length,
        abstract: this.allUrls.filter(u => u.hints.hasAbstract).length
      }
    };

    // Sitemap별 통계
    this.allUrls.forEach(u => {
      stats.bySitemap[u.sitemap] = (stats.bySitemap[u.sitemap] || 0) + 1;
    });

    console.log('\n📊 최종 통계:');
    console.log(`  - 총 작품: ${stats.total}개`);
    console.log(`  - 유명 작가 가능성: ${stats.withPossibleArtist}개`);
    console.log(`  - 카테고리별:`);
    Object.entries(stats.byCategory).forEach(([cat, count]) => {
      console.log(`    • ${cat}: ${count}개`);
    });
    console.log(`  - Sitemap 분포: ${Object.keys(stats.bySitemap).length}개 파일에서 수집`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  const collector = new ComprehensiveArtveeCollector();
  await collector.collectComprehensive();
}

main().catch(console.error);