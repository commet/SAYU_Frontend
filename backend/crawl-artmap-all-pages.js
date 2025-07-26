/**
 * Artmap.com 모든 페이지에서 전시 정보 수집
 * 특히 아시아/한국 전시 찾기
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class ArtmapFullCrawler {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.exhibitions = [];
    this.cityStats = {};
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
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      return null;
    }
  }

  parseExhibitions(html) {
    const $ = cheerio.load(html);
    const pageExhibitions = [];

    $('tr').each((i, row) => {
      const $row = $(row);
      const cells = $row.find('td');
      
      if (cells.length === 3) {
        const allLinks = $row.find('a');
        let venueLink = null;
        let exhibitionLink = null;
        
        allLinks.each((j, link) => {
          const href = $(link).attr('href') || '';
          if (href.includes('/exhibition/')) {
            exhibitionLink = $(link);
          } else if (!href.includes('.jpg') && !href.includes('.png') && !venueLink) {
            venueLink = $(link);
          }
        });
        
        if (exhibitionLink) {
          const venue = venueLink ? venueLink.text().trim() : 'Unknown';
          const title = exhibitionLink.text().trim();
          const exhibitionUrl = exhibitionLink.attr('href');
          const rowText = $row.text();
          const dateMatch = rowText.match(/(\d{1,2}\s+\w{3})\s*[-–]\s*(\d{1,2}\s+\w{3}\s+\d{4})/);
          
          // 도시 추출
          let city = 'Unknown';
          const cityMatch = venue.match(/,\s*([^,]+)$/);
          if (cityMatch) {
            city = cityMatch[1].trim();
          } else if (venue.toLowerCase().includes('seoul')) {
            city = 'Seoul';
          } else if (venue.toLowerCase().includes('tokyo')) {
            city = 'Tokyo';
          } else if (venue.toLowerCase().includes('london')) {
            city = 'London';
          } else if (venue.toLowerCase().includes('new york')) {
            city = 'New York';
          } else if (venue.toLowerCase().includes('paris')) {
            city = 'Paris';
          } else if (venue.toLowerCase().includes('berlin')) {
            city = 'Berlin';
          }
          
          const exhibition = {
            venue,
            city,
            title,
            url: this.baseUrl + exhibitionUrl,
            dates: dateMatch ? dateMatch[0] : 'N/A',
            crawledAt: new Date().toISOString()
          };
          
          pageExhibitions.push(exhibition);
          
          // 도시별 통계
          this.cityStats[city] = (this.cityStats[city] || 0) + 1;
        }
      }
    });

    return pageExhibitions;
  }

  async crawlAllPages() {
    console.log('=== Starting Artmap Full Crawl ===\n');
    
    // 다양한 정렬 옵션으로 크롤링
    const sortOptions = [
      'current',      // 현재 진행 중
      'opening',      // 곧 시작
      'closing',      // 곧 종료
      'permanent'     // 상설 전시
    ];
    
    for (const sort of sortOptions) {
      console.log(`\n=== Crawling ${sort} exhibitions ===`);
      
      // 기관 전시
      const institutionsUrl = `${this.baseUrl}/exhibitions/institutions/${sort}/worldwide`;
      const institutionsHtml = await this.fetchPage(institutionsUrl);
      if (institutionsHtml) {
        const exhibitions = this.parseExhibitions(institutionsHtml);
        this.exhibitions.push(...exhibitions);
        console.log(`Found ${exhibitions.length} exhibitions in institutions/${sort}`);
      }
      
      await this.delay(2000); // 2초 대기
      
      // 갤러리 전시
      const galleriesUrl = `${this.baseUrl}/exhibitions/galleries/${sort}/worldwide`;
      const galleriesHtml = await this.fetchPage(galleriesUrl);
      if (galleriesHtml) {
        const exhibitions = this.parseExhibitions(galleriesHtml);
        this.exhibitions.push(...exhibitions);
        console.log(`Found ${exhibitions.length} exhibitions in galleries/${sort}`);
      }
      
      await this.delay(2000);
    }
    
    // 중복 제거
    const uniqueExhibitions = this.removeDuplicates();
    
    // 결과 저장
    this.saveResults(uniqueExhibitions);
    
    // 통계 출력
    this.printStatistics(uniqueExhibitions);
    
    return uniqueExhibitions;
  }

  removeDuplicates() {
    const seen = new Set();
    const unique = [];
    
    this.exhibitions.forEach(ex => {
      const key = `${ex.venue}-${ex.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(ex);
      }
    });
    
    return unique;
  }

  saveResults(exhibitions) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `artmap-all-exhibitions-${timestamp}.json`;
    
    const data = {
      totalExhibitions: exhibitions.length,
      cityStats: this.cityStats,
      exhibitions: exhibitions,
      crawledAt: new Date().toISOString()
    };
    
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`\nResults saved to: ${filename}`);
  }

  printStatistics(exhibitions) {
    console.log('\n=== CRAWLING STATISTICS ===');
    console.log(`Total unique exhibitions: ${exhibitions.length}`);
    
    console.log('\n=== City Distribution ===');
    const sortedCities = Object.entries(this.cityStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    sortedCities.forEach(([city, count]) => {
      console.log(`${city}: ${count} exhibitions`);
    });
    
    // 아시아 전시 찾기
    console.log('\n=== Asian Exhibitions ===');
    const asianCities = ['Seoul', 'Tokyo', 'Beijing', 'Shanghai', 'Hong Kong', 'Singapore', 'Bangkok', 'Taipei'];
    const asianExhibitions = exhibitions.filter(ex => 
      asianCities.some(city => ex.city.includes(city)) ||
      ex.venue.toLowerCase().includes('asia') ||
      ex.venue.toLowerCase().includes('seoul') ||
      ex.venue.toLowerCase().includes('korea')
    );
    
    console.log(`Total Asian exhibitions: ${asianExhibitions.length}`);
    
    // 한국 관련 전시
    const koreaExhibitions = exhibitions.filter(ex => 
      ex.city.toLowerCase().includes('seoul') ||
      ex.venue.toLowerCase().includes('seoul') ||
      ex.venue.toLowerCase().includes('korea') ||
      ex.venue.toLowerCase().includes('korean')
    );
    
    console.log(`\nKorea-related exhibitions: ${koreaExhibitions.length}`);
    if (koreaExhibitions.length > 0) {
      console.log('\nKorean Exhibitions:');
      koreaExhibitions.forEach((ex, i) => {
        console.log(`\n${i + 1}. ${ex.title}`);
        console.log(`   Venue: ${ex.venue}`);
        console.log(`   City: ${ex.city}`);
        console.log(`   Dates: ${ex.dates}`);
        console.log(`   URL: ${ex.url}`);
      });
    }
  }
}

// 실행
async function main() {
  const crawler = new ArtmapFullCrawler();
  await crawler.crawlAllPages();
}

main().catch(console.error);