const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

/**
 * 스마트 URL 수집기
 * 다양성을 고려하여 전략적으로 수집합니다
 */

class SmartArtveeCollector {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.parser = new xml2js.Parser();
    this.allUrls = [];
    this.selectedUrls = [];
  }

  async collectStrategically() {
    console.log('🎨 Artvee 스마트 URL 수집 시작...\n');
    console.log('📊 수집 전략: 다양한 sitemap에서 골고루 수집\n');

    // Step 1: 여러 sitemap에서 URL 수집
    const sitemaps = [
      'product-sitemap339.xml', // 최신
      'product-sitemap330.xml', // 중간
      'product-sitemap320.xml', // 중간
      'product-sitemap310.xml', // 중간  
      'product-sitemap300.xml', // 오래된
      'product-sitemap290.xml', // 오래된
      'product-sitemap280.xml', // 오래된
      'product-sitemap270.xml', // 더 오래된
      'product-sitemap250.xml', // 더 오래된
      'product-sitemap200.xml', // 꽤 오래된
      'product-sitemap150.xml', // 많이 오래된
      'product-sitemap100.xml', // 많이 오래된
      'product-sitemap50.xml',  // 아주 오래된
      'product-sitemap10.xml',  // 아주 오래된
      'product-sitemap1.xml'    // 가장 오래된
    ];

    // 각 sitemap에서 일부씩 수집
    for (const sitemap of sitemaps) {
      console.log(`📄 처리 중: ${sitemap}`);
      const urls = await this.extractUrlsFromSitemap(sitemap);
      
      if (urls.length > 0) {
        // 각 sitemap에서 최대 100개씩만
        const selected = urls.slice(0, 100);
        this.allUrls.push(...selected);
        console.log(`  ✓ ${selected.length}개 URL 수집됨`);
      }
      
      await this.sleep(1500);
    }

    console.log(`\n📊 전체 수집된 URL: ${this.allUrls.length}개`);

    // Step 2: 전략적 선별
    await this.selectDiverseUrls();
    
    // Step 3: 결과 저장
    await this.saveResults();
  }

  async extractUrlsFromSitemap(sitemapName) {
    try {
      const url = `${this.baseUrl}/${sitemapName}`;
      const response = await axios.get(url);
      const result = await this.parser.parseStringPromise(response.data);
      
      const urls = [];
      const urlset = result.urlset.url || [];

      for (const item of urlset) {
        const loc = item.loc[0];
        const lastmod = item.lastmod ? item.lastmod[0] : '';
        
        if (loc.includes('/dl/')) {
          urls.push({
            url: loc,
            lastmod: lastmod,
            sitemap: sitemapName,
            // 작품 ID 추출 (URL에서)
            artworkId: loc.split('/dl/')[1]?.replace('/', '') || ''
          });
        }
      }

      return urls;
    } catch (error) {
      console.error(`  ✗ ${sitemapName} 처리 실패: ${error.message}`);
      return [];
    }
  }

  async selectDiverseUrls() {
    console.log('\n🎯 다양성을 고려한 URL 선별 중...');

    // 1. 유명 작가 우선
    const famousArtists = [
      'van-gogh', 'monet', 'klimt', 'picasso', 'rembrandt', 
      'vermeer', 'da-vinci', 'hokusai', 'manet', 'degas',
      'cezanne', 'renoir', 'turner', 'whistler', 'sargent'
    ];

    const famousWorks = this.allUrls.filter(item => 
      famousArtists.some(artist => item.url.toLowerCase().includes(artist))
    );

    console.log(`  - 유명 작가 작품: ${famousWorks.length}개 발견`);

    // 2. 카테고리별 분류 (URL 패턴으로 추정)
    const categories = {
      portrait: [],
      landscape: [],
      still: [],
      abstract: [],
      japanese: [],
      poster: [],
      illustration: [],
      other: []
    };

    this.allUrls.forEach(item => {
      const url = item.url.toLowerCase();
      if (url.includes('portrait')) categories.portrait.push(item);
      else if (url.includes('landscape')) categories.landscape.push(item);
      else if (url.includes('still-life')) categories.still.push(item);
      else if (url.includes('abstract')) categories.abstract.push(item);
      else if (url.includes('japanese') || url.includes('hokusai')) categories.japanese.push(item);
      else if (url.includes('poster')) categories.poster.push(item);
      else if (url.includes('illustration')) categories.illustration.push(item);
      else categories.other.push(item);
    });

    // 3. 균형잡힌 선택
    this.selectedUrls = [];
    
    // 유명 작품 200개
    this.selectedUrls.push(...famousWorks.slice(0, 200));
    
    // 각 카테고리에서 100개씩
    Object.entries(categories).forEach(([category, urls]) => {
      const needed = Math.min(100, urls.length);
      const selected = urls.slice(0, needed);
      this.selectedUrls.push(...selected);
      console.log(`  - ${category}: ${selected.length}개 선택`);
    });

    // 중복 제거
    const uniqueUrls = new Map();
    this.selectedUrls.forEach(item => {
      uniqueUrls.set(item.url, item);
    });
    this.selectedUrls = Array.from(uniqueUrls.values());

    // 1000개로 제한
    this.selectedUrls = this.selectedUrls.slice(0, 1000);
    
    console.log(`\n✅ 최종 선택: ${this.selectedUrls.length}개`);
  }

  async saveResults() {
    await fs.mkdir('./data', { recursive: true });
    
    // 상세 정보 포함 JSON
    const jsonPath = './data/artvee-urls-smart.json';
    await fs.writeFile(
      jsonPath, 
      JSON.stringify({
        metadata: {
          total: this.selectedUrls.length,
          collectedAt: new Date().toISOString(),
          strategy: 'diverse selection'
        },
        urls: this.selectedUrls
      }, null, 2)
    );
    console.log(`\n💾 JSON 저장: ${jsonPath}`);

    // 간단한 URL 리스트
    const urlListPath = './data/artvee-urls-list.txt';
    const urlList = this.selectedUrls.map(item => item.url).join('\n');
    await fs.writeFile(urlListPath, urlList);
    console.log(`💾 URL 리스트 저장: ${urlListPath}`);

    // 통계 출력
    console.log(`\n📊 수집 통계:`);
    console.log(`  - 총 URL 수: ${this.selectedUrls.length}개`);
    console.log(`  - Sitemap 수: ${new Set(this.selectedUrls.map(u => u.sitemap)).size}개`);
    console.log(`  - 시간 범위: ${this.getTimeRange()}`);
  }

  getTimeRange() {
    const dates = this.selectedUrls
      .filter(u => u.lastmod)
      .map(u => new Date(u.lastmod));
    
    if (dates.length === 0) return 'N/A';
    
    const oldest = new Date(Math.min(...dates));
    const newest = new Date(Math.max(...dates));
    
    return `${oldest.toISOString().split('T')[0]} ~ ${newest.toISOString().split('T')[0]}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  const collector = new SmartArtveeCollector();
  await collector.collectStrategically();
}

main().catch(console.error);