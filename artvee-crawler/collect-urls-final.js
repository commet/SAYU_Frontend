const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const pLimit = require('p-limit');
require('dotenv').config();

/**
 * 최종 URL 수집기 - sitemap_index.xml 기반
 * 387개의 sitemap에서 SAYU에 최적화된 1000개 작품 선별
 */

class FinalArtveeCollector {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.parser = new xml2js.Parser();
    this.allUrls = [];
    this.artistSitemaps = [];
    this.collectionSitemaps = [];
    
    // 우선순위 작가 목록 (APT와 연관)
    this.priorityArtists = [
      // 감정 표현이 강한 작가들 (F 타입)
      'van-gogh', 'monet', 'renoir', 'degas', 'cezanne', 'gauguin',
      'toulouse-lautrec', 'manet', 'pissarro', 'sisley', 'cassatt',
      
      // 구조와 형태가 명확한 작가들 (T 타입)
      'picasso', 'mondrian', 'kandinsky', 'klee', 'miro', 
      'dali', 'duchamp', 'braque', 'leger', 'malevich',
      
      // 상상력과 환상적 요소 (N 타입)
      'chagall', 'klimt', 'schiele', 'bosch', 'bruegel',
      'blake', 'fuseli', 'moreau', 'redon', 'rousseau',
      
      // 현실적이고 구체적인 작가들 (S 타입)
      'vermeer', 'rembrandt', 'caravaggio', 'velazquez', 'rubens',
      'titian', 'raphael', 'botticelli', 'leonardo', 'michelangelo',
      
      // 추가 주요 작가들
      'hokusai', 'hiroshige', 'turner', 'constable', 'goya',
      'hopper', 'whistler', 'sargent', 'homer', 'wyeth'
    ];
    
    this.stats = {
      totalSitemaps: 0,
      processedSitemaps: 0,
      totalUrls: 0,
      byType: {
        product: 0,
        artist: 0,
        collection: 0,
        other: 0
      }
    };
  }

  async collectFinal() {
    console.log('🎨 Final Artvee URL Collection 시작...\n');
    console.log('📋 목표: 387개 sitemap에서 최적화된 1,000개 작품 선별\n');
    
    // 1단계: sitemap index 파싱
    console.log('1️⃣ Sitemap Index 분석...');
    const sitemapList = await this.parseSitemapIndex();
    console.log(`   ✅ 총 ${sitemapList.length}개 sitemap 발견\n`);
    
    // 2단계: sitemap 분류
    console.log('2️⃣ Sitemap 분류...');
    this.categorizeSitemaps(sitemapList);
    
    // 3단계: 전략적 수집
    console.log('\n3️⃣ 전략적 URL 수집...');
    await this.strategicCollection();
    
    // 4단계: 최종 선별
    console.log('\n4️⃣ SAYU 맞춤 1,000개 선별...');
    await this.finalSelection();
    
    // 5단계: 저장
    await this.saveResults();
  }

  async parseSitemapIndex() {
    try {
      const response = await axios.get(`${this.baseUrl}/sitemap_index.xml`, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 30000
      });
      
      const result = await this.parser.parseStringPromise(response.data);
      const sitemaps = [];
      
      if (result.sitemapindex && result.sitemapindex.sitemap) {
        for (const sitemap of result.sitemapindex.sitemap) {
          sitemaps.push({
            loc: sitemap.loc[0],
            lastmod: sitemap.lastmod ? sitemap.lastmod[0] : null
          });
        }
      }
      
      return sitemaps;
    } catch (error) {
      console.error('❌ Sitemap index 읽기 실패:', error.message);
      throw error;
    }
  }

  categorizeSitemaps(sitemapList) {
    const categories = {
      product: [],
      artist: [],
      collection: [],
      books: [],
      topics: [],
      other: []
    };
    
    sitemapList.forEach(sitemap => {
      const url = sitemap.loc;
      
      if (url.includes('product-sitemap')) {
        categories.product.push(sitemap);
      } else if (url.includes('pa_artist-sitemap') || url.includes('pa_pa_artist-sitemap')) {
        categories.artist.push(sitemap);
      } else if (url.includes('collection-sitemap')) {
        categories.collection.push(sitemap);
      } else if (url.includes('books-sitemap')) {
        categories.books.push(sitemap);
      } else if (url.includes('topics-sitemap')) {
        categories.topics.push(sitemap);
      } else {
        categories.other.push(sitemap);
      }
    });
    
    console.log('   📊 Sitemap 분류:');
    console.log(`      • Product: ${categories.product.length}개`);
    console.log(`      • Artist: ${categories.artist.length}개`);
    console.log(`      • Collection: ${categories.collection.length}개`);
    console.log(`      • Books: ${categories.books.length}개`);
    console.log(`      • Topics: ${categories.topics.length}개`);
    console.log(`      • Other: ${categories.other.length}개`);
    
    this.categorizedSitemaps = categories;
  }

  async strategicCollection() {
    const limit = pLimit(3); // 동시 3개 처리
    
    // 1. 우선순위 작가 페이지 수집 (artist sitemaps)
    console.log('\n   🎯 우선순위 작가 수집...');
    const artistPromises = this.categorizedSitemaps.artist.slice(0, 10).map(sitemap =>
      limit(() => this.processSitemap(sitemap, 'artist'))
    );
    await Promise.all(artistPromises);
    
    // 2. 최신 작품 수집 (최근 product sitemaps)
    console.log('\n   📅 최신 작품 수집...');
    const recentProducts = this.categorizedSitemaps.product.slice(-20); // 마지막 20개
    const recentPromises = recentProducts.map(sitemap =>
      limit(() => this.processSitemap(sitemap, 'recent'))
    );
    await Promise.all(recentPromises);
    
    // 3. 중간 시대 작품 수집
    console.log('\n   🕐 중간 시대 작품 수집...');
    const midProducts = this.categorizedSitemaps.product.slice(150, 170); // 중간 20개
    const midPromises = midProducts.map(sitemap =>
      limit(() => this.processSitemap(sitemap, 'middle'))
    );
    await Promise.all(midPromises);
    
    // 4. 초기 작품 수집
    console.log('\n   🏛️ 클래식 작품 수집...');
    const earlyProducts = this.categorizedSitemaps.product.slice(0, 20); // 처음 20개
    const earlyPromises = earlyProducts.map(sitemap =>
      limit(() => this.processSitemap(sitemap, 'classic'))
    );
    await Promise.all(earlyPromises);
    
    // 5. 컬렉션 수집 (있다면)
    if (this.categorizedSitemaps.collection.length > 0) {
      console.log('\n   🖼️ 컬렉션 수집...');
      const collectionPromises = this.categorizedSitemaps.collection.map(sitemap =>
        limit(() => this.processSitemap(sitemap, 'collection'))
      );
      await Promise.all(collectionPromises);
    }
    
    console.log(`\n   💾 총 수집: ${this.allUrls.length}개 URL`);
  }

  async processSitemap(sitemapInfo, category) {
    try {
      const response = await axios.get(sitemapInfo.loc, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 30000
      });
      
      const result = await this.parser.parseStringPromise(response.data);
      const urls = [];
      
      if (result.urlset && result.urlset.url) {
        for (const urlItem of result.urlset.url) {
          const url = urlItem.loc[0];
          const metadata = this.extractMetadata(url, category);
          
          urls.push({
            url: url,
            lastmod: urlItem.lastmod ? urlItem.lastmod[0] : null,
            sitemap: sitemapInfo.loc.split('/').pop(),
            category: category,
            metadata: metadata
          });
        }
      }
      
      this.allUrls.push(...urls);
      this.stats.processedSitemaps++;
      this.stats.byType[category] = (this.stats.byType[category] || 0) + urls.length;
      
      console.log(`      ✓ ${sitemapInfo.loc.split('/').pop()}: ${urls.length}개`);
      
      // 딜레이
      await this.sleep(100);
      
    } catch (error) {
      console.error(`      ❌ ${sitemapInfo.loc.split('/').pop()}: ${error.message}`);
    }
  }

  extractMetadata(url, category) {
    const metadata = {
      possibleArtist: null,
      genres: [],
      emotions: [],
      personalityMatch: [],
      priority: 'normal'
    };
    
    const urlLower = url.toLowerCase();
    
    // 우선순위 작가 체크
    for (const artist of this.priorityArtists) {
      if (urlLower.includes(artist)) {
        metadata.possibleArtist = artist;
        metadata.priority = 'high';
        break;
      }
    }
    
    // 장르 추출
    const genreKeywords = {
      'portrait': ['ESFJ', 'ENFJ'],
      'landscape': ['ISFP', 'INFP'],
      'still-life': ['ISTJ', 'ISFJ'],
      'abstract': ['INTP', 'ENTP'],
      'cityscape': ['ESTP', 'ESFP'],
      'nature': ['ISFP', 'INFP'],
      'religious': ['INFJ', 'ISFJ'],
      'mythology': ['INFP', 'ENFP'],
      'marine': ['ISTP', 'ESTP'],
      'animal': ['ISFP', 'ESFP']
    };
    
    for (const [genre, types] of Object.entries(genreKeywords)) {
      if (urlLower.includes(genre)) {
        metadata.genres.push(genre);
        metadata.personalityMatch.push(...types);
      }
    }
    
    // 감정 키워드
    const emotionKeywords = {
      'serene': ['calm', 'peaceful', 'tranquil'],
      'dramatic': ['storm', 'battle', 'intense'],
      'joyful': ['celebration', 'dance', 'bright'],
      'melancholic': ['solitude', 'autumn', 'rain'],
      'mysterious': ['night', 'shadow', 'dark']
    };
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(kw => urlLower.includes(kw))) {
        metadata.emotions.push(emotion);
      }
    }
    
    // 카테고리별 추가 태그
    if (category === 'artist') {
      metadata.priority = 'high';
    } else if (category === 'recent') {
      metadata.freshness = 'new';
    } else if (category === 'classic') {
      metadata.era = 'classical';
    }
    
    return metadata;
  }

  async finalSelection() {
    // 중복 제거
    const uniqueMap = new Map();
    this.allUrls.forEach(item => uniqueMap.set(item.url, item));
    const uniqueUrls = Array.from(uniqueMap.values());
    
    console.log(`   ✅ 중복 제거: ${this.allUrls.length} → ${uniqueUrls.length}`);
    
    const selected = [];
    const used = new Set();
    
    // 1. 우선순위 작가 작품 (300개)
    const priorityArtworks = uniqueUrls
      .filter(item => item.metadata.priority === 'high')
      .sort(() => Math.random() - 0.5)
      .slice(0, 300);
    
    priorityArtworks.forEach(item => {
      selected.push(item);
      used.add(item.url);
    });
    console.log(`   🎯 우선순위 작가: ${priorityArtworks.length}개`);
    
    // 2. APT 균형 맞추기 (400개)
    const aptTypes = ['E', 'I', 'N', 'S', 'T', 'F', 'J', 'P'];
    const perType = 50;
    
    console.log('   🧠 APT 유형별 선별:');
    for (const aptType of aptTypes) {
      const typeUrls = uniqueUrls
        .filter(item => 
          !used.has(item.url) && 
          item.metadata.personalityMatch.includes(aptType)
        )
        .slice(0, perType);
      
      typeUrls.forEach(item => {
        selected.push(item);
        used.add(item.url);
      });
      
      console.log(`      • ${aptType}: ${typeUrls.length}개`);
    }
    
    // 3. 시대별 균형 (200개)
    const eras = ['recent', 'middle', 'classic'];
    const perEra = 67;
    
    console.log('   🕐 시대별 선별:');
    for (const era of eras) {
      const eraUrls = uniqueUrls
        .filter(item => 
          !used.has(item.url) && 
          item.category === era
        )
        .slice(0, perEra);
      
      eraUrls.forEach(item => {
        selected.push(item);
        used.add(item.url);
      });
      
      console.log(`      • ${era}: ${eraUrls.length}개`);
    }
    
    // 4. 다양성 추가 (100개)
    const remaining = uniqueUrls
      .filter(item => !used.has(item.url))
      .sort(() => Math.random() - 0.5)
      .slice(0, 100);
    
    selected.push(...remaining);
    console.log(`   🎲 다양성: ${remaining.length}개`);
    
    // 최종 1000개로 조정
    this.allUrls = selected.slice(0, 1000);
    console.log(`\n   ✅ 최종 선별: ${this.allUrls.length}개`);
  }

  async saveResults() {
    await fs.mkdir('./data', { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    
    // 메인 데이터
    const mainData = {
      metadata: {
        total: this.allUrls.length,
        collectedAt: new Date().toISOString(),
        strategy: 'Final Collection from 387 Sitemaps',
        version: '3.0',
        stats: this.stats
      },
      urls: this.allUrls
    };
    
    // JSON 저장
    await fs.writeFile('./data/artvee-urls-final.json', JSON.stringify(mainData, null, 2));
    
    // CSV 저장
    const csvContent = this.generateCSV();
    await fs.writeFile('./data/artvee-urls-final.csv', csvContent);
    
    // 리포트 저장
    const report = this.generateReport();
    await fs.writeFile('./data/collection-report-final.md', report);
    
    console.log('\n💾 저장 완료:');
    console.log('   • artvee-urls-final.json');
    console.log('   • artvee-urls-final.csv');
    console.log('   • collection-report-final.md');
  }

  generateCSV() {
    const headers = ['URL', 'Artist', 'Category', 'Sitemap', 'Priority', 'APT Match'];
    const rows = [headers.join(',')];
    
    this.allUrls.forEach(item => {
      const row = [
        item.url,
        item.metadata.possibleArtist || '',
        item.category,
        item.sitemap,
        item.metadata.priority,
        item.metadata.personalityMatch.join(';')
      ];
      rows.push(row.map(cell => `"${cell}"`).join(','));
    });
    
    return rows.join('\n');
  }

  generateReport() {
    const priorityCount = this.allUrls.filter(u => u.metadata.priority === 'high').length;
    const withArtist = this.allUrls.filter(u => u.metadata.possibleArtist).length;
    
    return `# Final Artvee Collection Report

## 📊 Collection Summary
- **Total Artworks**: ${this.allUrls.length}
- **Collection Date**: ${new Date().toISOString()}
- **Sitemaps Processed**: ${this.stats.processedSitemaps}
- **Strategy**: Final Collection v3.0

## 🎨 Statistics
- **Priority Artists**: ${priorityCount}
- **Identified Artists**: ${withArtist}
- **Recent Works**: ${this.allUrls.filter(u => u.category === 'recent').length}
- **Classic Works**: ${this.allUrls.filter(u => u.category === 'classic').length}
- **Middle Era**: ${this.allUrls.filter(u => u.category === 'middle').length}

## 🧠 APT Coverage
${['E', 'I', 'N', 'S', 'T', 'F', 'J', 'P'].map(type => 
  `- ${type}: ${this.allUrls.filter(u => u.metadata.personalityMatch.includes(type)).length}`
).join('\n')}

## ✅ Quality Metrics
- **High Priority**: ${priorityCount}
- **Multi-personality Match**: ${this.allUrls.filter(u => u.metadata.personalityMatch.length > 1).length}
- **With Emotions**: ${this.allUrls.filter(u => u.metadata.emotions.length > 0).length}
`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  console.log('🚀 Final Artvee Collector v3.0\n');
  console.log('⏱️ 예상 소요 시간: 15-20분\n');
  
  const collector = new FinalArtveeCollector();
  
  try {
    await collector.collectFinal();
    console.log('\n✅ Collection 완료!');
    console.log('📁 다음 단계: node db-import.js ./data/artvee-urls-final.json');
  } catch (error) {
    console.error('\n❌ 수집 실패:', error.message);
    console.error(error.stack);
  }
}

main().catch(console.error);