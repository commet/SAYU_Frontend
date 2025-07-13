const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

/**
 * Step 1: Sitemap에서 URL 수집
 * 가장 최근 sitemap들에서 작품 URL을 추출합니다
 */

class ArtveeURLCollector {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.parser = new xml2js.Parser();
    this.urls = [];
  }

  async collectFromSitemaps() {
    console.log('🎨 Artvee URL 수집 시작...\n');

    // 최근 sitemap들 (역순으로 최신 것부터)
    const sitemaps = [
      'product-sitemap339.xml',
      'product-sitemap338.xml', 
      'product-sitemap337.xml',
      'product-sitemap336.xml',
      'product-sitemap335.xml'
    ];

    for (const sitemap of sitemaps) {
      console.log(`📄 처리 중: ${sitemap}`);
      await this.processSitemap(sitemap);
      
      // 1000개 수집되면 중단
      if (this.urls.length >= 1000) {
        console.log(`✅ 목표 달성: ${this.urls.length}개 URL 수집 완료`);
        break;
      }
      
      // 서버 부하 방지
      await this.sleep(2000);
    }

    // 결과 저장
    await this.saveResults();
  }

  async processSitemap(sitemapName) {
    try {
      const url = `${this.baseUrl}/${sitemapName}`;
      const response = await axios.get(url);
      const result = await this.parser.parseStringPromise(response.data);
      
      const urlset = result.urlset.url;
      let count = 0;

      for (const item of urlset) {
        if (this.urls.length >= 1000) break;
        
        const loc = item.loc[0];
        const lastmod = item.lastmod[0];
        
        // /dl/ 경로만 수집 (다운로드 가능한 작품)
        if (loc.includes('/dl/')) {
          this.urls.push({
            url: loc,
            lastmod: lastmod,
            collected_at: new Date().toISOString()
          });
          count++;
        }
      }

      console.log(`  ✓ ${count}개 URL 추출됨`);
    } catch (error) {
      console.error(`  ✗ 에러 발생: ${error.message}`);
    }
  }

  async saveResults() {
    // 데이터 디렉토리 생성
    await fs.mkdir('./data', { recursive: true });
    
    // JSON 저장
    const jsonPath = './data/artvee-urls.json';
    await fs.writeFile(
      jsonPath, 
      JSON.stringify(this.urls, null, 2)
    );
    console.log(`\n💾 JSON 저장: ${jsonPath}`);

    // CSV 저장 (간단 버전)
    const csvPath = './data/artvee-urls.csv';
    const csvContent = 'url,lastmod,collected_at\n' + 
      this.urls.map(u => `"${u.url}","${u.lastmod}","${u.collected_at}"`).join('\n');
    
    await fs.writeFile(csvPath, csvContent);
    console.log(`💾 CSV 저장: ${csvPath}`);

    // 통계 출력
    console.log(`\n📊 수집 통계:`);
    console.log(`  - 총 URL 수: ${this.urls.length}개`);
    console.log(`  - 시작 시간: ${this.urls[0]?.collected_at}`);
    console.log(`  - 종료 시간: ${new Date().toISOString()}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  const collector = new ArtveeURLCollector();
  await collector.collectFromSitemaps();
}

main().catch(console.error);