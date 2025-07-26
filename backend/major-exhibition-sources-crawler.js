/**
 * Major Exhibition Sources Crawler
 * 진짜 유명한 전시들을 다루는 크롤링 가능한 사이트들 공략
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class MajorExhibitionSourcesCrawler {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    this.requestDelay = 2500;
    this.lastRequestTime = 0;
    
    // 실제 major 전시들을 다루는 크롤링 가능한 소스들
    this.majorSources = {
      // 1. Time Out - 각 도시별 major 전시 커버
      timeout: {
        london: {
          url: 'https://www.timeout.com/london/art/top-10-art-exhibitions-in-london',
          backup_url: 'https://www.timeout.com/london/art',
          selectors: {
            exhibitions: '.feature-item, .card-item, .listing-item, article',
            title: 'h3, h2, .card-title, .listing-title',
            venue: '.venue, .location, .card-venue',
            dates: '.dates, .when, .card-dates',
            description: '.description, .excerpt, .card-description',
            link: 'a'
          }
        },
        paris: {
          url: 'https://www.timeout.com/paris/en/art',
          selectors: {
            exhibitions: '.feature-item, .card-item, article',
            title: 'h3, h2, .card-title',
            venue: '.venue, .location',
            dates: '.dates, .when',
            description: '.description, .excerpt'
          }
        },
        berlin: {
          url: 'https://www.timeout.com/berlin/en/art',
          selectors: {
            exhibitions: '.feature-item, .card-item, article',
            title: 'h3, h2, .card-title',
            venue: '.venue, .location',
            dates: '.dates, .when',
            description: '.description, .excerpt'
          }
        }
      },

      // 2. Artlyst - UK 최고의 아트 정보 사이트
      artlyst: {
        london: {
          url: 'https://artlyst.com/features/london-art-exhibitions-2025-an-artlyst-month-by-month-guide/',
          selectors: {
            exhibitions: '.exhibition-item, .entry-content p, .wp-block-group',
            title: 'strong, b, h3, h4',
            venue: 'em, i, .venue',
            dates: 'em, i, .dates',
            description: 'p, .description'
          }
        }
      },

      // 3. Artforum - 전 세계 전시 정보
      artforum: {
        global: {
          url: 'https://www.artforum.com/picks',
          selectors: {
            exhibitions: '.pick-item, .article-item',
            title: 'h3, h2, .title',
            venue: '.venue, .location',
            dates: '.dates',
            description: '.description, .excerpt'
          }
        }
      },

      // 4. Artnet - 글로벌 전시 뉴스
      artnet: {
        global: {
          url: 'https://news.artnet.com/art-world/exhibitions',
          selectors: {
            exhibitions: '.article-item, .post-item',
            title: 'h3, h2, .article-title',
            venue: '.venue, .location',
            dates: '.date, .published',
            description: '.excerpt, .summary'
          }
        }
      }
    };
  }

  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      console.log(`⏳ Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  async fetchPage(url) {
    await this.respectRateLimit();
    
    try {
      console.log(`🔄 Fetching: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return null;
    }
  }

  async crawlSource(source, city, config) {
    console.log(`\n🎨 Crawling ${source} - ${city}...`);
    
    const html = await this.fetchPage(config.url);
    if (!html) {
      // backup URL 시도
      if (config.backup_url) {
        console.log(`🔄 Trying backup URL...`);
        const backupHtml = await this.fetchPage(config.backup_url);
        if (!backupHtml) return [];
      } else {
        return [];
      }
    }

    const $ = cheerio.load(html);
    const exhibitions = [];

    // 다양한 선택자로 전시 찾기
    const exhibitionSelectors = config.selectors.exhibitions.split(', ');
    
    for (const selector of exhibitionSelectors) {
      const found = $(selector);
      console.log(`   Trying selector "${selector}": found ${found.length} elements`);
      
      if (found.length > 0) {
        found.each((i, element) => {
          if (exhibitions.length >= 20) return false; // 최대 20개로 제한
          
          const $el = $(element);
          
          // 제목 추출
          let title = this.extractText($el, config.selectors.title);
          
          // venue 추출
          let venue = this.extractText($el, config.selectors.venue);
          
          // 날짜 추출
          let dates = this.extractText($el, config.selectors.dates);
          
          // 설명 추출
          let description = this.extractText($el, config.selectors.description);
          
          // 링크 추출
          const link = $el.find('a').first().attr('href');
          let fullUrl = '';
          if (link) {
            fullUrl = link.startsWith('http') ? link : new URL(link, config.url).href;
          }
          
          // 데이터 정제
          title = this.cleanText(title);
          venue = this.cleanText(venue);
          dates = this.cleanText(dates);
          description = this.cleanText(description);
          
          if (title && title.length > 3 && !this.isNavigationItem(title)) {
            exhibitions.push({
              title,
              venue: {
                name: venue || 'Unknown',
                city: city
              },
              dates: {
                original: dates
              },
              description: description.substring(0, 500),
              url: fullUrl,
              city,
              source: source,
              quality: 'high', // major source이므로 고품질
              crawledAt: new Date().toISOString()
            });
          }
        });
        
        if (exhibitions.length > 0) {
          console.log(`   ✅ Success with selector "${selector}"`);
          break; // 첫 번째로 작동하는 선택자 사용
        }
      }
    }

    console.log(`   📊 Found ${exhibitions.length} exhibitions`);
    return exhibitions;
  }

  extractText($el, selectors) {
    const selectorList = selectors.split(', ');
    for (const sel of selectorList) {
      const text = $el.find(sel).first().text().trim();
      if (text) return text;
    }
    return '';
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ') // 여러 공백을 하나로
      .replace(/\n/g, ' ') // 줄바꿈 제거
      .trim()
      .substring(0, 200); // 최대 200자
  }

  isNavigationItem(title) {
    const navItems = [
      'more', 'read more', 'see all', 'next', 'previous', 'home', 'about',
      'contact', 'subscribe', 'newsletter', 'follow', 'share', 'tweet',
      'facebook', 'instagram', 'search', 'menu'
    ];
    
    return navItems.some(nav => 
      title.toLowerCase().includes(nav.toLowerCase())
    );
  }

  async crawlAllMajorSources() {
    console.log('🌟 MAJOR EXHIBITION SOURCES CRAWLER');
    console.log('==================================\n');
    console.log('목표: 실제 유명한 전시들을 다루는 사이트들에서 데이터 수집');
    console.log('소스: Time Out, Artlyst, Artforum, Artnet\n');

    const startTime = Date.now();
    const allExhibitions = [];
    const results = {};

    for (const [source, cities] of Object.entries(this.majorSources)) {
      console.log(`\n📰 ${source.toUpperCase()} 크롤링`);
      console.log('='.repeat(30));
      
      results[source] = {};
      
      for (const [city, config] of Object.entries(cities)) {
        try {
          const exhibitions = await this.crawlSource(source, city, config);
          results[source][city] = exhibitions;
          allExhibitions.push(...exhibitions);
          
          if (exhibitions.length > 0) {
            console.log(`   🎯 ${city}: ${exhibitions.length}개 전시 수집`);
          } else {
            console.log(`   ⚠️  ${city}: 전시 없음 (선택자 조정 필요)`);
          }
          
        } catch (error) {
          console.error(`   ❌ ${city} 크롤링 실패:`, error.message);
          results[source][city] = [];
        }
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // 결과 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `major-sources-collection-${timestamp}.json`;
    
    const finalResult = {
      metadata: {
        collectionDate: new Date().toISOString(),
        totalExhibitions: allExhibitions.length,
        sourcesCovered: Object.keys(this.majorSources).length,
        durationSeconds: duration,
        quality: 'HIGH - Major art publication sources'
      },
      sourceResults: results,
      allExhibitions
    };

    fs.writeFileSync(filename, JSON.stringify(finalResult, null, 2));

    // 최종 보고서
    console.log(`\n🎉 MAJOR SOURCES COLLECTION COMPLETED!`);
    console.log('====================================');
    console.log(`⏰ Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log(`📰 Sources crawled: ${Object.keys(this.majorSources).length}`);
    console.log(`📊 Total exhibitions: ${allExhibitions.length}`);
    console.log(`💎 Quality: HIGH (major art publications)`);
    console.log(`💾 Saved to: ${filename}`);

    // 소스별 결과
    console.log(`\n🏆 Results by Source:`);
    Object.entries(results).forEach(([source, cities]) => {
      const totalForSource = Object.values(cities).flat().length;
      console.log(`   ${source}: ${totalForSource} exhibitions`);
    });

    // 샘플 전시 출력
    if (allExhibitions.length > 0) {
      console.log(`\n✨ Sample Major Exhibitions:`);
      allExhibitions.slice(0, 8).forEach((ex, i) => {
        console.log(`   ${i + 1}. "${ex.title}" - ${ex.venue.name} (${ex.city})`);
      });
    }

    // 품질 분석
    this.analyzeQuality(allExhibitions);

    return finalResult;
  }

  analyzeQuality(exhibitions) {
    console.log(`\n📊 QUALITY ANALYSIS`);
    console.log('==================');
    
    // 유명 키워드 검사
    const famousKeywords = [
      'tate', 'moma', 'louvre', 'guggenheim', 'pompidou', 'national gallery',
      'royal academy', 'met museum', 'whitney', 'serpentine'
    ];
    
    const famousExhibitions = exhibitions.filter(ex => 
      famousKeywords.some(keyword => 
        ex.title.toLowerCase().includes(keyword) ||
        ex.venue.name.toLowerCase().includes(keyword) ||
        ex.description.toLowerCase().includes(keyword)
      )
    );

    console.log(`🏛️  유명 미술관 전시: ${famousExhibitions.length}/${exhibitions.length} (${Math.round(famousExhibitions.length/exhibitions.length*100)}%)`);
    
    // 제목 길이 분석
    const avgTitleLength = exhibitions.reduce((sum, ex) => sum + ex.title.length, 0) / exhibitions.length;
    console.log(`📝 평균 제목 길이: ${Math.round(avgTitleLength)}자`);
    
    // URL 유효성
    const validUrls = exhibitions.filter(ex => ex.url && ex.url.startsWith('http')).length;
    console.log(`🔗 유효한 URL: ${validUrls}/${exhibitions.length} (${Math.round(validUrls/exhibitions.length*100)}%)`);
    
    if (famousExhibitions.length > 0) {
      console.log(`\n✅ 고품질 전시 샘플:`);
      famousExhibitions.slice(0, 3).forEach((ex, i) => {
        console.log(`   ${i + 1}. "${ex.title}" - ${ex.venue.name}`);
      });
    }
  }
}

// 실행
async function main() {
  const crawler = new MajorExhibitionSourcesCrawler();
  
  try {
    await crawler.crawlAllMajorSources();
    
  } catch (error) {
    console.error('Major sources crawler error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = MajorExhibitionSourcesCrawler;