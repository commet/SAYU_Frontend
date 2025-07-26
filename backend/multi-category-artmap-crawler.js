/**
 * 다중 카테고리 Artmap.com 크롤러
 * 기관, 갤러리, 기타 공간에서 전시 정보 수집
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class MultiCategoryArtmapCrawler {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.requestDelay = 3000;
    this.lastRequestTime = 0;
  }

  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      console.log(`Waiting ${waitTime}ms before next request...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  async fetchPage(url) {
    await this.respectRateLimit();
    
    try {
      console.log(`Fetching: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      return null;
    }
  }

  async crawlCategory(categoryPath, limit = 50) {
    const url = `${this.baseUrl}/exhibitions/${categoryPath}/opening/worldwide`;
    const html = await this.fetchPage(url);
    
    if (!html) return [];

    const $ = cheerio.load(html);
    const exhibitions = [];

    $('.exibitionsListTable tr').each((index, element) => {
      if (exhibitions.length >= limit) return false;

      const $row = $(element);
      
      // 이미지 링크에서 전시 URL 추출
      const exhibitionLink = $row.find('td:first-child a').attr('href');
      const imageUrl = $row.find('img').attr('src');
      
      // 텍스트 정보가 있는 세 번째 td
      const $infoCell = $row.find('td:nth-child(3)');
      
      // 장소 정보
      const venueLink = $infoCell.find('h3:first-child a');
      const venueName = venueLink.text().trim();
      const venueUrl = venueLink.attr('href');
      
      // 전시 제목
      const titleLink = $infoCell.find('h2 a');
      const title = titleLink.text().trim();
      
      // 날짜 정보
      const dateText = $infoCell.find('h3.txGray').text().trim();
      
      if (title && venueName && dateText) {
        exhibitions.push({
          title,
          venue: {
            name: venueName,
            url: venueUrl ? `${this.baseUrl}${venueUrl}` : null
          },
          dates: {
            original: dateText
          },
          url: exhibitionLink ? `${this.baseUrl}${exhibitionLink}` : null,
          imageUrl: imageUrl ? `${this.baseUrl}${imageUrl}` : null,
          category: categoryPath,
          source: 'artmap',
          crawledAt: new Date().toISOString()
        });
      }
    });

    console.log(`Found ${exhibitions.length} exhibitions in ${categoryPath}`);
    return exhibitions;
  }

  async crawlAllCategories(limitPerCategory = 50) {
    console.log('🎨 Starting multi-category Artmap.com crawling...');
    console.log(`📊 Will collect up to ${limitPerCategory} exhibitions per category`);
    
    const categories = [
      'institutions',
      'galleries', 
      'furtherspaces'
    ];

    const allExhibitions = [];

    for (const category of categories) {
      console.log(`\n--- Processing ${category} ---`);
      const exhibitions = await this.crawlCategory(category, limitPerCategory);
      allExhibitions.push(...exhibitions);
    }

    console.log(`\n✅ Total collected: ${allExhibitions.length} exhibitions`);
    
    // JSON 파일로 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `artmap-multi-category-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(allExhibitions, null, 2));
    console.log(`💾 Saved to: ${filename}`);

    return allExhibitions;
  }

  async getExhibitionDetails(exhibitionUrl) {
    const html = await this.fetchPage(exhibitionUrl);
    if (!html) return null;

    const $ = cheerio.load(html);
    const details = {
      description: '',
      artists: []
    };

    // 설명 텍스트 추출
    const $textBlock = $('#text-block, .exhibition-description, .content-text');
    if ($textBlock.length > 0) {
      details.description = $textBlock.text().trim();
    }

    // 아티스트 정보 추출
    $('a[href*="/profile/"]').each((i, link) => {
      const artistName = $(link).text().trim();
      if (artistName && !details.artists.includes(artistName)) {
        details.artists.push(artistName);
      }
    });

    return details;
  }
}

// 실행
async function main() {
  const crawler = new MultiCategoryArtmapCrawler();
  
  try {
    // 각 카테고리에서 50개씩, 총 최대 150개 수집
    const exhibitions = await crawler.crawlAllCategories(50);
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total exhibitions: ${exhibitions.length}`);
    
    // 카테고리별 통계
    const stats = exhibitions.reduce((acc, ex) => {
      acc[ex.category] = (acc[ex.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('By category:');
    Object.entries(stats).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} exhibitions`);
    });
    
    // 상위 5개 전시 출력
    console.log('\n=== TOP 5 EXHIBITIONS ===');
    exhibitions.slice(0, 5).forEach((ex, i) => {
      console.log(`${i + 1}. ${ex.title}`);
      console.log(`   Venue: ${ex.venue.name}`);
      console.log(`   Dates: ${ex.dates.original}`);
      console.log(`   Category: ${ex.category}`);
    });
    
  } catch (error) {
    console.error('Crawler error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = MultiCategoryArtmapCrawler;