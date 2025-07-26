/**
 * Artmap.com 도시별 페이지 직접 크롤링
 * 아시아 도시들 중심으로
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class ArtmapCityCrawler {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.exhibitions = [];
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchPage(url) {
    try {
      console.log(`Fetching: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8'
        },
        timeout: 15000
      });
      console.log(`Status: ${response.status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      return null;
    }
  }

  async crawlCity(cityName) {
    console.log(`\n=== Crawling ${cityName} ===`);
    
    // 가능한 URL 패턴들
    const urlPatterns = [
      `${this.baseUrl}/${cityName.toLowerCase().replace(' ', '-')}`,
      `${this.baseUrl}/city/${cityName.toLowerCase().replace(' ', '-')}`,
      `${this.baseUrl}/cities/${cityName.toLowerCase().replace(' ', '-')}`,
      `${this.baseUrl}/${cityName.toLowerCase()}`
    ];
    
    for (const url of urlPatterns) {
      const html = await this.fetchPage(url);
      if (html) {
        const $ = cheerio.load(html);
        const title = $('title').text();
        console.log(`Page title: ${title}`);
        
        // 전시 링크 찾기
        const exhibitionLinks = [];
        $('a').each((i, link) => {
          const href = $(link).attr('href') || '';
          const text = $(link).text().trim();
          if (href.includes('/exhibition/') && text) {
            exhibitionLinks.push({
              title: text,
              url: href,
              city: cityName
            });
          }
        });
        
        if (exhibitionLinks.length > 0) {
          console.log(`Found ${exhibitionLinks.length} exhibition links in ${cityName}`);
          this.exhibitions.push(...exhibitionLinks);
          return exhibitionLinks;
        }
      }
      
      await this.delay(1000);
    }
    
    console.log(`No exhibitions found for ${cityName}`);
    return [];
  }

  async searchExhibitions(keyword) {
    console.log(`\n=== Searching for "${keyword}" ===`);
    
    // 검색 URL (추정)
    const searchUrls = [
      `${this.baseUrl}/search?q=${encodeURIComponent(keyword)}`,
      `${this.baseUrl}/exhibitions/search/${encodeURIComponent(keyword)}`,
      `${this.baseUrl}/venues/search/${encodeURIComponent(keyword)}`
    ];
    
    for (const url of searchUrls) {
      const html = await this.fetchPage(url);
      if (html && !html.includes('404')) {
        const $ = cheerio.load(html);
        console.log('Search page found!');
        
        // 결과 분석
        const results = [];
        $('a').each((i, link) => {
          const href = $(link).attr('href') || '';
          const text = $(link).text().trim();
          if ((href.includes('/exhibition/') || href.includes('/venue/')) && text) {
            results.push({ text, href });
          }
        });
        
        console.log(`Found ${results.length} results`);
        return results;
      }
    }
    
    return [];
  }

  async crawlAsianCities() {
    console.log('=== Crawling Asian Cities ===\n');
    
    const asianCities = [
      'Seoul', 'Busan', 'Daegu', 'Gwangju',  // Korea
      'Tokyo', 'Osaka', 'Kyoto',              // Japan
      'Beijing', 'Shanghai', 'Guangzhou',     // China
      'Hong-Kong', 'Singapore', 'Bangkok',    // Others
      'Taipei', 'Jakarta', 'Manila'
    ];
    
    const results = {};
    
    for (const city of asianCities) {
      const exhibitions = await this.crawlCity(city);
      results[city] = exhibitions;
      await this.delay(2000);
    }
    
    // 키워드 검색도 시도
    const searchKeywords = ['Korea', 'Korean', 'Seoul', 'Asia', 'Asian'];
    for (const keyword of searchKeywords) {
      await this.searchExhibitions(keyword);
      await this.delay(2000);
    }
    
    // 결과 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `artmap-asian-cities-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify({
      cities: results,
      totalExhibitions: this.exhibitions.length,
      exhibitions: this.exhibitions,
      crawledAt: new Date().toISOString()
    }, null, 2));
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total exhibitions found: ${this.exhibitions.length}`);
    Object.entries(results).forEach(([city, exhibitions]) => {
      if (exhibitions.length > 0) {
        console.log(`${city}: ${exhibitions.length} exhibitions`);
      }
    });
    
    console.log(`\nResults saved to: ${filename}`);
  }

  async analyzeVenuesPage() {
    console.log('\n=== Analyzing Venues Structure ===');
    
    // 장소 목록 페이지
    const venuesUrl = `${this.baseUrl}/venues/institutions/a/worldwide`;
    const html = await this.fetchPage(venuesUrl);
    
    if (html) {
      const $ = cheerio.load(html);
      
      // 한국 관련 장소 찾기
      const koreaVenues = [];
      $('.venulistentry, .venue-item, tr').each((i, elem) => {
        const text = $(elem).text();
        if (text.toLowerCase().includes('seoul') || 
            text.toLowerCase().includes('korea') ||
            text.toLowerCase().includes('busan')) {
          const links = $(elem).find('a');
          links.each((j, link) => {
            const href = $(link).attr('href');
            const name = $(link).text().trim();
            if (href && name) {
              koreaVenues.push({ name, url: href, fullText: text.trim() });
            }
          });
        }
      });
      
      console.log(`Found ${koreaVenues.length} Korea-related venues`);
      if (koreaVenues.length > 0) {
        console.log('\nKorean Venues:');
        koreaVenues.forEach(venue => {
          console.log(`- ${venue.name}: ${venue.url}`);
        });
      }
    }
  }
}

// 실행
async function main() {
  const crawler = new ArtmapCityCrawler();
  
  // 아시아 도시들 크롤링
  await crawler.crawlAsianCities();
  
  // 장소 페이지 분석
  await crawler.analyzeVenuesPage();
}

main().catch(console.error);