const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');
const pLimit = require('p-limit');

/**
 * 최적화된 Artvee URL 수집기
 * 빠르게 1,000개의 URL만 수집
 */
class OptimizedArtveeCollector {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.urls = new Set();
    this.parser = new xml2js.Parser();
    this.limit = pLimit(5); // 동시 요청 제한
    this.targetCount = 1000;
  }

  async collectUrls() {
    console.log('🚀 Optimized Artvee URL Collector\n');
    console.log('🎯 목표: 1,000개 작품 URL 빠르게 수집\n');

    try {
      // 1. Sitemap index 파싱
      console.log('1️⃣ Sitemap Index 파싱...');
      const sitemapIndex = await this.parseSitemapIndex();
      
      // 2. 우선순위가 높은 sitemap만 선택
      const prioritySitemaps = this.selectPrioritySitemaps(sitemapIndex);
      
      // 3. URL 수집
      console.log('\n2️⃣ URL 수집 시작...');
      await this.collectFromSitemaps(prioritySitemaps);
      
      // 4. 결과 저장
      await this.saveResults();
      
    } catch (error) {
      console.error('❌ 오류 발생:', error.message);
    }
  }

  async parseSitemapIndex() {
    const response = await axios.get(`${this.baseUrl}/sitemap_index.xml`);
    const result = await this.parser.parseStringPromise(response.data);
    
    const sitemaps = result.sitemapindex.sitemap.map(s => ({
      loc: s.loc[0],
      lastmod: s.lastmod ? s.lastmod[0] : null
    }));
    
    console.log(`   ✅ 총 ${sitemaps.length}개 sitemap 발견`);
    return sitemaps;
  }

  selectPrioritySitemaps(sitemaps) {
    // 우선순위: artist sitemap + 최신 product sitemap
    const artistSitemaps = sitemaps
      .filter(s => s.loc.includes('pa_artist'))
      .slice(0, 3); // 처음 3개만
      
    const latestProducts = sitemaps
      .filter(s => s.loc.includes('product-sitemap'))
      .sort((a, b) => {
        const numA = parseInt(a.loc.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.loc.match(/\d+/)?.[0] || 0);
        return numB - numA; // 최신 순
      })
      .slice(0, 5); // 최신 5개만
      
    return [...artistSitemaps, ...latestProducts];
  }

  async collectFromSitemaps(sitemaps) {
    const promises = sitemaps.map(sitemap => 
      this.limit(() => this.processSitemap(sitemap))
    );
    
    await Promise.all(promises);
  }

  async processSitemap(sitemap) {
    if (this.urls.size >= this.targetCount) return;
    
    try {
      const response = await axios.get(sitemap.loc, { timeout: 10000 });
      const result = await this.parser.parseStringPromise(response.data);
      
      if (result.urlset && result.urlset.url) {
        const urls = result.urlset.url
          .map(u => u.loc[0])
          .filter(url => url.includes('/dl/'));
          
        // 필요한 만큼만 추가
        const needed = this.targetCount - this.urls.size;
        const toAdd = urls.slice(0, needed);
        
        toAdd.forEach(url => this.urls.add(url));
        
        console.log(`   ✓ ${sitemap.loc.split('/').pop()}: ${toAdd.length}개 추가 (총 ${this.urls.size}개)`);
        
        if (this.urls.size >= this.targetCount) {
          console.log(`   🎉 목표 달성! ${this.urls.size}개 수집 완료`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️ ${sitemap.loc.split('/').pop()} 처리 실패: ${error.message}`);
    }
  }

  async saveResults() {
    const urlArray = Array.from(this.urls).slice(0, this.targetCount);
    
    // JSON 저장
    const jsonPath = path.join(__dirname, 'data', 'artwork-urls-optimized.json');
    await fs.writeFile(jsonPath, JSON.stringify(urlArray, null, 2));
    
    // CSV 저장
    const csvPath = path.join(__dirname, 'data', 'artwork-urls-optimized.csv');
    const csvContent = 'url\n' + urlArray.map(url => `"${url}"`).join('\n');
    await fs.writeFile(csvPath, csvContent);
    
    console.log('\n✅ 수집 완료!');
    console.log(`📊 총 ${urlArray.length}개 URL 수집`);
    console.log(`💾 저장 위치:`);
    console.log(`   - ${jsonPath}`);
    console.log(`   - ${csvPath}`);
    
    // 샘플 출력
    console.log('\n📌 샘플 URL (처음 5개):');
    urlArray.slice(0, 5).forEach((url, i) => {
      console.log(`   ${i + 1}. ${url}`);
    });
  }
}

// 실행
const collector = new OptimizedArtveeCollector();
collector.collectUrls().catch(console.error);