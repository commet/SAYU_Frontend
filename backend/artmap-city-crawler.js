/**
 * Artmap.com 도시별 전시 크롤러
 * 더 많은 전시를 찾기 위해 개별 도시 페이지 탐색
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class ArtmapCityCrawler {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    this.requestDelay = 2500;
    this.lastRequestTime = 0;
    
    // 주요 도시들
    this.targetCities = [
      'london', 'paris', 'berlin', 'munich', 'hamburg', 'cologne', 
      'zurich', 'basel', 'geneva', 'vienna', 'amsterdam', 'rotterdam',
      'brussels', 'antwerp', 'milan', 'rome', 'madrid', 'barcelona',
      'stockholm', 'copenhagen', 'oslo', 'helsinki',
      'newyork', 'losangeles', 'chicago', 'miami', 'sanfrancisco',
      'toronto', 'montreal', 'sydney', 'melbourne', 'tokyo', 'hongkong'
    ];
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
      console.error(`❌ Error: ${error.message}`);
      return null;
    }
  }

  async exploreCityPage(city) {
    console.log(`\n🌍 Exploring ${city}...`);
    
    const cityUrl = `${this.baseUrl}/${city}`;
    const html = await this.fetchPage(cityUrl);
    
    if (!html) return { city, exhibitions: [], venues: [] };

    const $ = cheerio.load(html);
    const exhibitions = new Set();
    const venues = new Set();

    // 전시 링크 찾기 (다양한 패턴)
    $('a[href*="/exhibition/"], a[href*="/show/"], a[href*="/event/"]').each((i, link) => {
      const href = $(link).attr('href');
      const text = $(link).text().trim();
      
      if (href && text && text.length > 3) {
        exhibitions.add({
          title: text,
          url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
          city: city
        });
      }
    });

    // venue 링크 찾기
    $('a[href*="/venue/"], a[href*="/gallery/"], a[href*="/museum/"]').each((i, link) => {
      const href = $(link).attr('href');
      const text = $(link).text().trim();
      
      if (href && text && text.length > 3) {
        venues.add({
          name: text,
          url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
          city: city
        });
      }
    });

    // 현재 진행 중인 전시 섹션 찾기
    $('.current-exhibitions, .ongoing-exhibitions, .now-showing').each((i, section) => {
      $(section).find('a').each((j, link) => {
        const href = $(link).attr('href');
        const text = $(link).text().trim();
        
        if (href && text && (href.includes('exhibition') || href.includes('show'))) {
          exhibitions.add({
            title: text,
            url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
            city: city,
            status: 'current'
          });
        }
      });
    });

    console.log(`  📊 Found ${exhibitions.size} exhibition links, ${venues.size} venue links`);
    
    return {
      city,
      exhibitions: Array.from(exhibitions),
      venues: Array.from(venues)
    };
  }

  async crawlCityExhibitionsPage(city) {
    console.log(`\n🎭 Checking ${city} exhibitions page...`);
    
    const possiblePaths = [
      `${city}/exhibitions`,
      `${city}/shows`,
      `${city}/events`,
      `${city}/current`,
      `${city}/venues/museums`,
      `${city}/venues/galleries`
    ];

    const allFindings = [];

    for (const path of possiblePaths) {
      try {
        const url = `${this.baseUrl}/${path}`;
        const html = await this.fetchPage(url);
        
        if (html) {
          const $ = cheerio.load(html);
          const pageFindings = [];

          // 전시 목록 테이블이 있는지 확인
          if ($('.exibitionsListTable').length > 0) {
            $('.exibitionsListTable tr').each((i, row) => {
              const $row = $(row);
              const title = $row.find('h2 a').text().trim();
              const venue = $row.find('h3 a').first().text().trim();
              const dates = $row.find('h3.txGray').text().trim();
              const link = $row.find('h2 a').attr('href');
              const image = $row.find('img').attr('src');

              if (title && venue) {
                pageFindings.push({
                  title,
                  venue: { name: venue },
                  dates: { original: dates },
                  url: link ? `${this.baseUrl}${link}` : null,
                  imageUrl: image ? `${this.baseUrl}${image}` : null,
                  city,
                  path,
                  source: 'artmap'
                });
              }
            });
          }

          // 일반적인 링크 패턴도 확인
          $('a[href*="exhibition"], a[href*="show"]').each((i, link) => {
            const href = $(link).attr('href');
            const text = $(link).text().trim();
            
            if (text && text.length > 5 && !text.toLowerCase().includes('more')) {
              pageFindings.push({
                title: text,
                url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
                city,
                path,
                type: 'link'
              });
            }
          });

          if (pageFindings.length > 0) {
            console.log(`  ✅ ${path}: Found ${pageFindings.length} items`);
            allFindings.push(...pageFindings);
          } else {
            console.log(`  ⚫ ${path}: No structured data found`);
          }
        }
      } catch (error) {
        console.log(`  ❌ ${path}: ${error.message}`);
      }
    }

    return allFindings;
  }

  async massiveCityCollection(maxCities = 10) {
    console.log(`🚀 CITY-BASED ARTMAP COLLECTION`);
    console.log(`🌍 Target cities: ${maxCities}`);
    console.log(`📋 Available cities: ${this.targetCities.length}\n`);

    const startTime = Date.now();
    const results = [];
    const allExhibitions = [];
    let processedCities = 0;

    for (const city of this.targetCities.slice(0, maxCities)) {
      try {
        // 1. 도시 메인 페이지 탐색
        const cityData = await this.exploreCityPage(city);
        
        // 2. 전시 전용 페이지들 탐색
        const exhibitionData = await this.crawlCityExhibitionsPage(city);
        
        const cityResult = {
          city,
          mainPageFindings: cityData.exhibitions.length,
          exhibitionPagesFindings: exhibitionData.length,
          totalExhibitions: cityData.exhibitions.length + exhibitionData.length,
          venues: cityData.venues.length,
          exhibitions: [...cityData.exhibitions, ...exhibitionData]
        };

        results.push(cityResult);
        allExhibitions.push(...cityResult.exhibitions);
        processedCities++;

        console.log(`\n📊 ${city} Summary:`);
        console.log(`   Main page: ${cityData.exhibitions.length} exhibitions, ${cityData.venues.length} venues`);
        console.log(`   Exhibition pages: ${exhibitionData.length} items`);
        console.log(`   Total: ${cityResult.totalExhibitions} items`);

      } catch (error) {
        console.error(`❌ Error processing ${city}:`, error.message);
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // 결과 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `artmap-city-collection-${timestamp}.json`;
    
    const finalResult = {
      metadata: {
        collectionDate: new Date().toISOString(),
        targetCities: maxCities,
        processedCities,
        totalExhibitions: allExhibitions.length,
        durationSeconds: duration
      },
      cityResults: results,
      allExhibitions
    };

    fs.writeFileSync(filename, JSON.stringify(finalResult, null, 2));

    // 보고서
    console.log(`\n🎉 CITY COLLECTION COMPLETED!`);
    console.log(`================================`);
    console.log(`⏰ Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log(`🌍 Cities processed: ${processedCities}`);
    console.log(`📊 Total items found: ${allExhibitions.length}`);
    console.log(`💾 Saved to: ${filename}`);

    console.log(`\n🏆 Top Cities by Findings:`);
    results
      .sort((a, b) => b.totalExhibitions - a.totalExhibitions)
      .slice(0, 5)
      .forEach((city, i) => {
        console.log(`   ${i + 1}. ${city.city}: ${city.totalExhibitions} items`);
      });

    return finalResult;
  }
}

// 실행
async function main() {
  const crawler = new ArtmapCityCrawler();
  
  try {
    // 상위 10개 도시에서 전시 수집
    await crawler.massiveCityCollection(10);
    
  } catch (error) {
    console.error('Collection error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = ArtmapCityCrawler;