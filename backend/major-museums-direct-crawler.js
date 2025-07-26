/**
 * Major Museums Direct Crawler
 * 세계 주요 미술관 공식 사이트에서 직접 전시 정보 수집
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class MajorMuseumsDirectCrawler {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    this.requestDelay = 3000;
    this.lastRequestTime = 0;
    
    // 세계 주요 미술관들 공식 사이트
    this.majorMuseums = {
      // 뉴욕
      new_york: [
        {
          name: 'MoMA',
          url: 'https://www.moma.org/calendar/exhibitions',
          selectors: {
            exhibitions: '.exhibition-card, .event-card, article',
            title: 'h3, h2, .title',
            dates: '.dates, .date',
            description: '.description, .summary'
          }
        },
        {
          name: 'Met Museum',
          url: 'https://www.metmuseum.org/exhibitions',
          selectors: {
            exhibitions: '.exhibition-item, .card',
            title: 'h3, .title',
            dates: '.dates',
            description: '.description'
          }
        },
        {
          name: 'Guggenheim',
          url: 'https://www.guggenheim.org/exhibitions',
          selectors: {
            exhibitions: '.exhibition-card',
            title: 'h3',
            dates: '.dates',
            description: '.description'
          }
        }
      ],
      
      // 런던
      london: [
        {
          name: 'Tate Modern',
          url: 'https://www.tate.org.uk/whats-on/tate-modern',
          selectors: {
            exhibitions: '.exhibition-card, .event-card',
            title: 'h3, .title',
            dates: '.dates',
            description: '.description'
          }
        },
        {
          name: 'British Museum',
          url: 'https://www.britishmuseum.org/whats-on',
          selectors: {
            exhibitions: '.exhibition-item',
            title: 'h3',
            dates: '.dates',
            description: '.description'
          }
        },
        {
          name: 'National Gallery',
          url: 'https://www.nationalgallery.org.uk/whats-on',
          selectors: {
            exhibitions: '.event-card',
            title: 'h3',
            dates: '.dates',
            description: '.description'
          }
        }
      ],
      
      // 파리
      paris: [
        {
          name: 'Louvre',
          url: 'https://www.louvre.fr/en/whats-on',
          selectors: {
            exhibitions: '.exhibition-card',
            title: 'h3',
            dates: '.dates',
            description: '.description'
          }
        },
        {
          name: 'Centre Pompidou',
          url: 'https://www.centrepompidou.fr/en/program/exhibitions',
          selectors: {
            exhibitions: '.event-card',
            title: 'h3',
            dates: '.dates',
            description: '.description'
          }
        },
        {
          name: 'Musée d\'Orsay',
          url: 'https://www.musee-orsay.fr/en/whats-on',
          selectors: {
            exhibitions: '.exhibition-item',
            title: 'h3',
            dates: '.dates',
            description: '.description'
          }
        }
      ]
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
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 20000
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching ${url}:`, error.message);
      return null;
    }
  }

  async crawlMuseum(museum, city) {
    console.log(`\n🏛️  Crawling ${museum.name}...`);
    
    const html = await this.fetchPage(museum.url);
    if (!html) return [];

    const $ = cheerio.load(html);
    const exhibitions = [];

    // 다양한 선택자로 전시 찾기
    const exhibitionSelectors = museum.selectors.exhibitions.split(', ');
    
    for (const selector of exhibitionSelectors) {
      console.log(`   Trying selector: ${selector}`);
      const found = $(selector);
      console.log(`   Found: ${found.length} elements`);
      
      if (found.length > 0) {
        found.each((i, element) => {
          if (exhibitions.length >= 10) return false; // 최대 10개
          
          const $el = $(element);
          
          // 제목 추출
          let title = this.extractText($el, museum.selectors.title);
          
          // 날짜 추출
          let dates = this.extractText($el, museum.selectors.dates);
          
          // 설명 추출
          let description = this.extractText($el, museum.selectors.description);
          
          // 링크 추출
          const link = $el.find('a').first().attr('href');
          let fullUrl = '';
          if (link) {
            try {
              fullUrl = link.startsWith('http') ? link : new URL(link, museum.url).href;
            } catch (e) {
              fullUrl = museum.url + link;
            }
          }
          
          if (title && title.length > 3) {
            exhibitions.push({
              title: this.cleanText(title),
              venue: {
                name: museum.name,
                city: city,
                url: museum.url
              },
              dates: {
                original: this.cleanText(dates)
              },
              description: this.cleanText(description).substring(0, 500),
              url: fullUrl,
              city,
              source: 'major_museum_official',
              quality: 'world_class', // 주요 미술관이므로 최고 품질
              crawledAt: new Date().toISOString()
            });
          }
        });
        
        if (exhibitions.length > 0) {
          console.log(`   ✅ Success with selector "${selector}"`);
          break;
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
    return $el.text().trim();
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .trim()
      .substring(0, 300);
  }

  async crawlAllMajorMuseums() {
    console.log('🌟 MAJOR MUSEUMS OFFICIAL SITES CRAWLER');
    console.log('======================================\n');
    console.log('목표: 세계 주요 미술관 공식 사이트에서 현재 전시 수집');
    console.log('품질: WORLD-CLASS - 직접 공식 소스에서 수집\n');

    const startTime = Date.now();
    const allExhibitions = [];
    const results = {};

    for (const [city, museums] of Object.entries(this.majorMuseums)) {
      console.log(`\n📍 ${city.toUpperCase()} MAJOR MUSEUMS`);
      console.log('='.repeat(40));
      
      results[city] = [];
      
      for (const museum of museums) {
        try {
          const exhibitions = await this.crawlMuseum(museum, city);
          results[city].push(...exhibitions);
          allExhibitions.push(...exhibitions);
        } catch (error) {
          console.error(`❌ Error crawling ${museum.name}:`, error.message);
        }
      }
      
      console.log(`\n🎯 ${city} 총 수집: ${results[city].length}개 전시`);
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // 결과 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `major-museums-official-${timestamp}.json`;
    
    const finalResult = {
      metadata: {
        collectionDate: new Date().toISOString(),
        totalExhibitions: allExhibitions.length,
        citiesCovered: Object.keys(this.majorMuseums).length,
        museumsCovered: Object.values(this.majorMuseums).flat().length,
        durationSeconds: duration,
        quality: 'WORLD-CLASS - Official museum sources'
      },
      cityResults: results,
      allExhibitions
    };

    fs.writeFileSync(filename, JSON.stringify(finalResult, null, 2));

    // 최종 보고서
    console.log(`\n🎉 MAJOR MUSEUMS OFFICIAL COLLECTION COMPLETED!`);
    console.log('===============================================');
    console.log(`⏰ Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log(`🏛️  Museums crawled: ${Object.values(this.majorMuseums).flat().length}`);
    console.log(`📊 Total exhibitions: ${allExhibitions.length}`);
    console.log(`💎 Quality: WORLD-CLASS (official sources)`);
    console.log(`💾 Saved to: ${filename}`);

    // 도시별 결과
    console.log(`\n🏆 Results by City:`);
    Object.entries(results).forEach(([city, exhibitions]) => {
      console.log(`   ${city}: ${exhibitions.length} exhibitions`);
    });

    // 샘플 전시 출력
    if (allExhibitions.length > 0) {
      console.log(`\n✨ Sample World-Class Exhibitions:`);
      allExhibitions.slice(0, 8).forEach((ex, i) => {
        console.log(`   ${i + 1}. "${ex.title}" - ${ex.venue.name} (${ex.city})`);
      });
    }

    return finalResult;
  }
}

// 실행
async function main() {
  const crawler = new MajorMuseumsDirectCrawler();
  
  try {
    await crawler.crawlAllMajorMuseums();
    
  } catch (error) {
    console.error('Major museums official crawler error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = MajorMuseumsDirectCrawler;