/**
 * Enhanced Major Sources Crawler
 * 더 많은 high-quality 소스 추가
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class EnhancedMajorSourcesCrawler {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    this.requestDelay = 2000;
    this.lastRequestTime = 0;

    // 확장된 major exhibition 소스들
    this.enhancedSources = {
      // 1. 공식 관광청 (신뢰도 최고)
      visitlondon: {
        london: {
          url: 'https://www.visitlondon.com/things-to-do/whats-on/art-and-exhibitions',
          selectors: {
            exhibitions: '.listing-item, .event-item, .attraction-item, article, .card',
            title: 'h3, h2, .title, .heading, .name',
            venue: '.venue, .location, .address, .where',
            dates: '.date, .when, .period, .duration',
            description: '.description, .summary, .excerpt, p',
            link: 'a'
          }
        }
      },

      // 2. 더 많은 Time Out 페이지들
      timeout_extended: {
        london_new: {
          url: 'https://www.timeout.com/london/things-to-do/new-exhibitions-in-london',
          selectors: {
            exhibitions: 'article, .card, .listing-item',
            title: 'h3, h2, .title',
            venue: '.venue, .location',
            dates: '.date, .when',
            description: '.description, .excerpt'
          }
        },
        london_museums: {
          url: 'https://www.timeout.com/london/museums',
          selectors: {
            exhibitions: 'article, .venue-item, .listing-item',
            title: 'h3, h2, .title',
            venue: '.venue-name, .name',
            dates: '.date, .when',
            description: '.description, .excerpt'
          }
        }
      },

      // 3. Culture Whisper (런던 전문)
      culture_whisper: {
        london: {
          url: 'https://www.culturewhisper.com/london/art',
          selectors: {
            exhibitions: '.event-listing, .listing-item, article',
            title: 'h3, h2, .event-title',
            venue: '.venue, .location',
            dates: '.date, .when',
            description: '.description, .excerpt'
          }
        }
      },

      // 4. 런던 전문 아트 사이트들
      london_art: {
        london_galleries: {
          url: 'https://www.timeout.com/london/art/london-art-galleries',
          selectors: {
            exhibitions: 'article, .gallery-item, .listing-item',
            title: 'h3, h2, .title',
            venue: '.gallery-name, .venue',
            dates: '.date, .when',
            description: '.description, .excerpt'
          }
        }
      },

      // 5. 일반적인 웹 구조 패턴들 (포괄적 접근)
      generic_patterns: {
        test_sites: {
          urls: [
            'https://www.timeout.com/london/art',
            'https://artlyst.com/reviews/london-exhibitions',
            'https://www.theguardian.com/artanddesign/exhibitions'
          ],
          selectors: {
            exhibitions: 'article, .card, .item, .post, .entry, .listing, .exhibition, .event',
            title: 'h1, h2, h3, h4, .title, .headline, .name, .exhibition-title',
            venue: '.venue, .location, .museum, .gallery, .where, .address',
            dates: '.date, .dates, .when, .period, .time, .duration',
            description: '.description, .excerpt, .summary, .content, .text, p',
            link: 'a'
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
          'Cache-Control': 'no-cache',
          'Referer': 'https://www.google.com/'
        },
        timeout: 20000
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return null;
    }
  }

  async smartCrawlSource(source, city, config) {
    console.log(`\n🎨 Smart crawling ${source} - ${city}...`);

    let html = null;

    // 여러 URL 시도 (generic_patterns의 경우)
    if (config.urls) {
      for (const url of config.urls) {
        html = await this.fetchPage(url);
        if (html) {
          console.log(`   ✅ Success with URL: ${url}`);
          break;
        }
      }
    } else {
      html = await this.fetchPage(config.url);
    }

    if (!html) return [];

    const $ = cheerio.load(html);
    const exhibitions = [];

    // 스마트 선택자 시도
    const exhibitionSelectors = config.selectors.exhibitions.split(', ');

    for (const selector of exhibitionSelectors) {
      const found = $(selector);
      console.log(`   Trying "${selector}": ${found.length} elements`);

      if (found.length > 0) {
        let validCount = 0;

        found.each((i, element) => {
          if (exhibitions.length >= 25) return false; // 최대 25개

          const $el = $(element);
          const result = this.extractExhibitionData($el, config.selectors, city, source);

          if (result && this.isValidExhibition(result)) {
            exhibitions.push(result);
            validCount++;
          }
        });

        if (validCount > 0) {
          console.log(`   ✅ Found ${validCount} valid exhibitions with "${selector}"`);
          break;
        }
      }
    }

    console.log(`   📊 Total: ${exhibitions.length} exhibitions`);
    return exhibitions;
  }

  extractExhibitionData($el, selectors, city, source) {
    // 제목 추출 (더 스마트하게)
    let title = this.smartExtractText($el, selectors.title);

    // venue 추출
    let venue = this.smartExtractText($el, selectors.venue);

    // 날짜 추출
    let dates = this.smartExtractText($el, selectors.dates);

    // 설명 추출
    let description = this.smartExtractText($el, selectors.description);

    // 링크 추출
    const link = $el.find('a').first().attr('href') || $el.attr('href');
    let fullUrl = '';
    if (link && link !== '#') {
      try {
        fullUrl = link.startsWith('http') ? link : new URL(link, 'https://www.timeout.com').href;
      } catch (e) {
        fullUrl = '';
      }
    }

    // 데이터 정제
    title = this.cleanText(title);
    venue = this.cleanText(venue);
    dates = this.cleanText(dates);
    description = this.cleanText(description);

    if (!title || title.length < 3) return null;

    return {
      title,
      venue: {
        name: venue || this.extractVenueFromTitle(title),
        city
      },
      dates: {
        original: dates
      },
      description: description.substring(0, 300),
      url: fullUrl,
      city,
      source,
      quality: this.assessQuality(title, venue, description),
      crawledAt: new Date().toISOString()
    };
  }

  smartExtractText($el, selectors) {
    // 1. 선택자로 찾기
    const selectorList = selectors.split(', ');
    for (const sel of selectorList) {
      const text = $el.find(sel).first().text().trim();
      if (text && text.length > 2) return text;
    }

    // 2. 직접 텍스트
    const directText = $el.text().trim();
    if (directText && directText.length > 2) return directText;

    // 3. alt 텍스트
    const altText = $el.find('img').first().attr('alt');
    if (altText && altText.length > 2) return altText;

    return '';
  }

  extractVenueFromTitle(title) {
    // 제목에서 venue 추출 시도
    const venuePatterns = [
      /at\s+([^,\n]+)/i,
      /\|\s*([^,\n]+)/,
      /-\s*([^,\n]+)/
    ];

    for (const pattern of venuePatterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return 'Unknown Venue';
  }

  assessQuality(title, venue, description) {
    let score = 0;

    // 유명 미술관/갤러리 키워드
    const famousVenues = [
      'tate', 'moma', 'national gallery', 'royal academy', 'v&a', 'british museum',
      'serpentine', 'hayward', 'whitechapel', 'saatchi', 'barbican', 'ica'
    ];

    // 유명 아티스트 키워드
    const famousArtists = [
      'picasso', 'monet', 'van gogh', 'warhol', 'hockney', 'kusama', 'banksy',
      'ai weiwei', 'koons', 'hirst', 'giacometti', 'nara', 'basquiat'
    ];

    // venue 점수
    if (famousVenues.some(v => (title + venue).toLowerCase().includes(v))) {
      score += 3;
    }

    // 아티스트 점수
    if (famousArtists.some(a => title.toLowerCase().includes(a))) {
      score += 2;
    }

    // 설명 길이 점수
    if (description && description.length > 50) {
      score += 1;
    }

    if (score >= 3) return 'world_class';
    if (score >= 2) return 'high';
    if (score >= 1) return 'medium';
    return 'low';
  }

  isValidExhibition(exhibition) {
    // 네비게이션 아이템 필터링
    const navItems = [
      'more', 'read more', 'see all', 'next', 'previous', 'home', 'about',
      'contact', 'subscribe', 'newsletter', 'follow', 'share', 'menu', 'search',
      'login', 'sign up', 'book now', 'buy tickets', 'view all'
    ];

    const title = exhibition.title.toLowerCase();

    // 너무 짧거나 네비게이션 아이템인 경우 제외
    if (title.length < 3 || navItems.some(nav => title.includes(nav))) {
      return false;
    }

    // 숫자만 있는 제목 제외
    if (/^\d+\.?\s*$/.test(title)) {
      return false;
    }

    return true;
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/[^\w\s\-:.,!?'"()&]/g, '')
      .trim()
      .substring(0, 200);
  }

  async crawlAllEnhancedSources() {
    console.log('🌟 ENHANCED MAJOR SOURCES CRAWLER');
    console.log('=================================\n');
    console.log('목표: 확장된 고품질 소스들에서 major 전시 수집');
    console.log('소스: Visit London, Extended Time Out, Culture Whisper 등\n');

    const startTime = Date.now();
    const allExhibitions = [];
    const results = {};

    for (const [source, cities] of Object.entries(this.enhancedSources)) {
      console.log(`\n📰 ${source.toUpperCase()} 크롤링`);
      console.log('='.repeat(40));

      results[source] = {};

      for (const [city, config] of Object.entries(cities)) {
        try {
          const exhibitions = await this.smartCrawlSource(source, city, config);
          results[source][city] = exhibitions;
          allExhibitions.push(...exhibitions);

          if (exhibitions.length > 0) {
            const worldClass = exhibitions.filter(ex => ex.quality === 'world_class').length;
            console.log(`   🎯 ${city}: ${exhibitions.length}개 전시 (world-class: ${worldClass}개)`);
          } else {
            console.log(`   ⚠️  ${city}: 전시 없음`);
          }

        } catch (error) {
          console.error(`   ❌ ${city} 크롤링 실패:`, error.message);
          results[source][city] = [];
        }
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // 품질별 분류
    const qualityGroups = allExhibitions.reduce((acc, ex) => {
      acc[ex.quality] = (acc[ex.quality] || 0) + 1;
      return acc;
    }, {});

    // 결과 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `enhanced-sources-collection-${timestamp}.json`;

    const finalResult = {
      metadata: {
        collectionDate: new Date().toISOString(),
        totalExhibitions: allExhibitions.length,
        sourcesCovered: Object.keys(this.enhancedSources).length,
        durationSeconds: duration,
        quality: 'ENHANCED - Multiple high-quality sources',
        qualityBreakdown: qualityGroups
      },
      sourceResults: results,
      allExhibitions
    };

    fs.writeFileSync(filename, JSON.stringify(finalResult, null, 2));

    // 최종 보고서
    console.log(`\n🎉 ENHANCED COLLECTION COMPLETED!`);
    console.log('=================================');
    console.log(`⏰ Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log(`📰 Sources: ${Object.keys(this.enhancedSources).length}`);
    console.log(`📊 Total: ${allExhibitions.length} exhibitions`);
    console.log(`💾 Saved to: ${filename}`);

    // 품질 분석
    console.log(`\n🏆 Quality Breakdown:`);
    Object.entries(qualityGroups).forEach(([quality, count]) => {
      console.log(`   ${quality}: ${count} exhibitions`);
    });

    // World-class 전시들 출력
    const worldClassExhibitions = allExhibitions.filter(ex => ex.quality === 'world_class');
    if (worldClassExhibitions.length > 0) {
      console.log(`\n✨ World-Class Exhibitions Found:`);
      worldClassExhibitions.slice(0, 5).forEach((ex, i) => {
        console.log(`   ${i + 1}. "${ex.title}" - ${ex.venue.name}`);
      });
    }

    return finalResult;
  }
}

// 실행
async function main() {
  const crawler = new EnhancedMajorSourcesCrawler();

  try {
    await crawler.crawlAllEnhancedSources();

  } catch (error) {
    console.error('Enhanced crawler error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = EnhancedMajorSourcesCrawler;
