/**
 * 주요 미술관 공식 웹사이트 직접 크롤링
 * artmap.com의 한계를 보완하여 실제 유명한 전시 수집
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class MajorMuseumsCrawler {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    this.requestDelay = 3000;
    this.lastRequestTime = 0;

    // 세계 주요 미술관들
    this.majorMuseums = {
      london: [
        {
          name: 'Tate Modern',
          url: 'https://www.tate.org.uk/whats-on',
          selectors: {
            exhibitions: '.exhibition-item, .event-item',
            title: 'h3, .title',
            dates: '.dates, .when',
            description: '.description, .summary'
          }
        },
        {
          name: 'National Gallery',
          url: 'https://www.nationalgallery.org.uk/whats-on',
          selectors: {
            exhibitions: '.event-card, .exhibition-card',
            title: 'h3, .event-title',
            dates: '.date, .when',
            description: '.summary'
          }
        },
        {
          name: 'Royal Academy',
          url: 'https://www.royalacademy.org.uk/whats-on',
          selectors: {
            exhibitions: '.exhibition-item',
            title: 'h3',
            dates: '.dates',
            description: '.description'
          }
        }
      ],
      paris: [
        {
          name: 'Centre Pompidou',
          url: 'https://www.centrepompidou.fr/en/program/exhibitions',
          selectors: {
            exhibitions: '.exhibition-card, .event-card',
            title: 'h3, .title',
            dates: '.dates',
            description: '.description'
          }
        },
        {
          name: 'Musée d\'Orsay',
          url: 'https://www.musee-orsay.fr/en/whats-on/exhibitions',
          selectors: {
            exhibitions: '.exhibition-item',
            title: 'h3',
            dates: '.dates',
            description: '.description'
          }
        },
        {
          name: 'Louvre',
          url: 'https://www.louvre.fr/en/whats-on/exhibitions',
          selectors: {
            exhibitions: '.exhibition-card',
            title: 'h3',
            dates: '.dates',
            description: '.description'
          }
        }
      ],
      berlin: [
        {
          name: 'Hamburger Bahnhof',
          url: 'https://www.smb.museum/en/museums-institutions/hamburger-bahnhof/exhibitions/current/',
          selectors: {
            exhibitions: '.exhibition-item',
            title: 'h3',
            dates: '.dates',
            description: '.description'
          }
        },
        {
          name: 'Neue Nationalgalerie',
          url: 'https://www.smb.museum/en/museums-institutions/neue-nationalgalerie/exhibitions/current/',
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
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000
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
      $(selector).each((i, element) => {
        const $el = $(element);

        // 제목 추출
        let title = '';
        const titleSelectors = museum.selectors.title.split(', ');
        for (const titleSel of titleSelectors) {
          title = $el.find(titleSel).first().text().trim();
          if (title) break;
        }

        // 날짜 추출
        let dates = '';
        const dateSelectors = museum.selectors.dates.split(', ');
        for (const dateSel of dateSelectors) {
          dates = $el.find(dateSel).first().text().trim();
          if (dates) break;
        }

        // 설명 추출
        let description = '';
        const descSelectors = museum.selectors.description.split(', ');
        for (const descSel of descSelectors) {
          description = $el.find(descSel).first().text().trim();
          if (description) break;
        }

        // 링크 추출
        const link = $el.find('a').first().attr('href');
        let fullUrl = '';
        if (link) {
          fullUrl = link.startsWith('http') ? link : new URL(link, museum.url).href;
        }

        if (title && title.length > 3) {
          exhibitions.push({
            title,
            venue: {
              name: museum.name,
              url: museum.url
            },
            dates: {
              original: dates
            },
            description: description.substring(0, 500),
            url: fullUrl,
            city,
            source: 'major_museum',
            quality: 'high', // 주요 미술관이므로 고품질로 표시
            crawledAt: new Date().toISOString()
          });
        }
      });

      if (exhibitions.length > 0) break; // 첫 번째로 작동하는 선택자 사용
    }

    console.log(`   📊 Found ${exhibitions.length} exhibitions`);
    return exhibitions;
  }

  async crawlAllMajorMuseums() {
    console.log('🌟 MAJOR MUSEUMS CRAWLER');
    console.log('========================\n');
    console.log('목표: 세계 주요 미술관의 현재 전시 수집');
    console.log('품질: HIGH - 사용자들이 실제로 찾는 유명한 전시들\n');

    const startTime = Date.now();
    const allExhibitions = [];
    const results = {
      london: [],
      paris: [],
      berlin: []
    };

    for (const [city, museums] of Object.entries(this.majorMuseums)) {
      console.log(`\n📍 ${city.toUpperCase()} MAJOR MUSEUMS`);
      console.log('='.repeat(30));

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
    const filename = `major-museums-collection-${timestamp}.json`;

    const finalResult = {
      metadata: {
        collectionDate: new Date().toISOString(),
        totalExhibitions: allExhibitions.length,
        citiesCovered: Object.keys(this.majorMuseums).length,
        museumsCovered: Object.values(this.majorMuseums).flat().length,
        durationSeconds: duration,
        quality: 'HIGH - Major museum exhibitions only'
      },
      cityResults: results,
      allExhibitions
    };

    fs.writeFileSync(filename, JSON.stringify(finalResult, null, 2));

    // 최종 보고서
    console.log(`\n🎉 MAJOR MUSEUMS COLLECTION COMPLETED!`);
    console.log('=====================================');
    console.log(`⏰ Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log(`🏛️  Museums crawled: ${Object.values(this.majorMuseums).flat().length}`);
    console.log(`📊 Total exhibitions: ${allExhibitions.length}`);
    console.log(`💎 Quality: HIGH (major museums only)`);
    console.log(`💾 Saved to: ${filename}`);

    // 도시별 결과
    console.log(`\n🏆 Results by City:`);
    Object.entries(results).forEach(([city, exhibitions]) => {
      console.log(`   ${city}: ${exhibitions.length} exhibitions`);
    });

    // 샘플 전시 출력
    if (allExhibitions.length > 0) {
      console.log(`\n✨ Sample High-Quality Exhibitions:`);
      allExhibitions.slice(0, 5).forEach((ex, i) => {
        console.log(`   ${i + 1}. "${ex.title}" - ${ex.venue.name} (${ex.city})`);
      });
    }

    return finalResult;
  }

  // Google Arts & Culture API 대안 크롤링
  async crawlGoogleArtsAndCulture() {
    console.log('\n🎨 Google Arts & Culture 보완 크롤링...');

    const googleArtsUrl = 'https://artsandculture.google.com/partner';
    // 구현 가능하다면 추가

    return [];
  }

  // 현지 아트 매거진 크롤링
  async crawlArtMagazines() {
    console.log('\n📰 아트 매거진 보완 크롤링...');

    const artSources = [
      'https://www.timeout.com/london/art',
      'https://artlyst.com',
      'https://www.artforum.com/picks'
    ];

    // 구현 가능하다면 추가

    return [];
  }
}

// 실행
async function main() {
  const crawler = new MajorMuseumsCrawler();

  try {
    await crawler.crawlAllMajorMuseums();

  } catch (error) {
    console.error('Major museums crawler error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = MajorMuseumsCrawler;
