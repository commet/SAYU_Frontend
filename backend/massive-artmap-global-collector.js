/**
 * 대규모 Artmap.com 전시 수집기
 * 목표: 1000+ 전시 수집을 위한 고성능 크롤러
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class MassiveArtmapCollector {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.requestDelay = 2000; // 2초 딜레이 (빠른 수집)
    this.lastRequestTime = 0;
    this.collectPaths = [
      // 다양한 카테고리와 지역 조합
      'exhibitions/institutions/opening/worldwide',
      'exhibitions/galleries/opening/worldwide',
      'exhibitions/furtherspaces/opening/worldwide',
      'exhibitions/institutions/upcoming/worldwide',
      'exhibitions/galleries/upcoming/worldwide',
      'exhibitions/furtherspaces/upcoming/worldwide',
      'exhibitions/institutions/closing/worldwide',
      'exhibitions/galleries/closing/worldwide',
      'exhibitions/furtherspaces/closing/worldwide'
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
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching ${url}:`, error.message);
      return null;
    }
  }

  async crawlExhibitionList(path, maxPerPage = 200) {
    const url = `${this.baseUrl}/${path}`;
    const html = await this.fetchPage(url);
    
    if (!html) return [];

    const $ = cheerio.load(html);
    const exhibitions = [];

    $('.exibitionsListTable tr').each((index, element) => {
      if (exhibitions.length >= maxPerPage) return false;

      const $row = $(element);
      
      // 이미지와 링크
      const exhibitionLink = $row.find('td:first-child a').attr('href');
      const imageUrl = $row.find('img').attr('src');
      
      // 정보 셀
      const $infoCell = $row.find('td:nth-child(3)');
      
      // 장소 정보
      const venueLink = $infoCell.find('h3:first-child a');
      const venueName = venueLink.text().trim();
      const venueUrl = venueLink.attr('href');
      
      // 전시 제목
      const titleLink = $infoCell.find('h2 a');
      const title = titleLink.text().trim();
      
      // 날짜
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
          category: this.extractCategory(path),
          status: this.extractStatus(path),
          source: 'artmap',
          crawledAt: new Date().toISOString()
        });
      }
    });

    return exhibitions;
  }

  extractCategory(path) {
    if (path.includes('institutions')) return 'institutions';
    if (path.includes('galleries')) return 'galleries';
    if (path.includes('furtherspaces')) return 'furtherspaces';
    return 'unknown';
  }

  extractStatus(path) {
    if (path.includes('opening')) return 'opening';
    if (path.includes('upcoming')) return 'upcoming';
    if (path.includes('closing')) return 'closing';
    return 'unknown';
  }

  async massiveCollection(targetCount = 1000) {
    console.log(`🚀 MASSIVE ARTMAP COLLECTION STARTED`);
    console.log(`📊 Target: ${targetCount} exhibitions`);
    console.log(`🔍 Paths to crawl: ${this.collectPaths.length}`);
    console.log(`⏱️  Estimated time: ${Math.ceil(this.collectPaths.length * 5 / 60)} minutes\n`);

    const startTime = Date.now();
    const allExhibitions = new Set(); // 중복 제거용
    const exhibitionsArray = [];
    const stats = {
      pathsProcessed: 0,
      totalFound: 0,
      duplicatesSkipped: 0,
      categories: {},
      statuses: {},
      venues: new Set()
    };

    for (const path of this.collectPaths) {
      console.log(`\n📂 Processing: ${path}`);
      
      try {
        const exhibitions = await this.crawlExhibitionList(path, Math.ceil(targetCount / this.collectPaths.length));
        
        for (const exhibition of exhibitions) {
          const key = `${exhibition.title}|${exhibition.venue.name}`;
          
          if (!allExhibitions.has(key)) {
            allExhibitions.add(key);
            exhibitionsArray.push(exhibition);
            
            // 통계 수집
            stats.venues.add(exhibition.venue.name);
            stats.categories[exhibition.category] = (stats.categories[exhibition.category] || 0) + 1;
            stats.statuses[exhibition.status] = (stats.statuses[exhibition.status] || 0) + 1;
          } else {
            stats.duplicatesSkipped++;
          }
        }

        stats.pathsProcessed++;
        stats.totalFound = exhibitionsArray.length;
        
        console.log(`  ✅ Found: ${exhibitions.length} exhibitions`);
        console.log(`  📊 Total unique: ${exhibitionsArray.length}`);
        console.log(`  🔄 Duplicates skipped: ${stats.duplicatesSkipped}`);

        // 목표 달성 시 조기 종료
        if (exhibitionsArray.length >= targetCount) {
          console.log(`\n🎯 Target reached! Stopping collection.`);
          break;
        }

      } catch (error) {
        console.error(`❌ Error processing ${path}:`, error.message);
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // 결과 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `artmap-massive-collection-${timestamp}.json`;
    
    const result = {
      metadata: {
        collectionDate: new Date().toISOString(),
        targetCount,
        actualCount: exhibitionsArray.length,
        durationSeconds: duration,
        pathsProcessed: stats.pathsProcessed,
        totalPaths: this.collectPaths.length,
        duplicatesSkipped: stats.duplicatesSkipped,
        uniqueVenues: stats.venues.size
      },
      stats: {
        categories: stats.categories,
        statuses: stats.statuses,
        topVenues: this.getTopVenues(exhibitionsArray, 10)
      },
      exhibitions: exhibitionsArray
    };

    fs.writeFileSync(filename, JSON.stringify(result, null, 2));

    // 최종 보고서
    console.log(`\n🎉 MASSIVE COLLECTION COMPLETED!`);
    console.log(`================================`);
    console.log(`⏰ Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log(`📊 Collected: ${exhibitionsArray.length} exhibitions`);
    console.log(`🏛️  Unique venues: ${stats.venues.size}`);
    console.log(`🔄 Duplicates skipped: ${stats.duplicatesSkipped}`);
    console.log(`💾 Saved to: ${filename}`);
    
    console.log(`\n📈 Categories:`);
    Object.entries(stats.categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} exhibitions`);
    });

    console.log(`\n🏆 Top 10 Venues:`);
    this.getTopVenues(exhibitionsArray, 10).forEach(([venue, count], i) => {
      console.log(`   ${i + 1}. ${venue}: ${count} exhibitions`);
    });

    return result;
  }

  getTopVenues(exhibitions, limit = 10) {
    const venueCounts = {};
    exhibitions.forEach(ex => {
      venueCounts[ex.venue.name] = (venueCounts[ex.venue.name] || 0) + 1;
    });
    
    return Object.entries(venueCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
  }

  // 특정 도시 집중 수집
  async collectByCity(city, maxExhibitions = 200) {
    console.log(`🌍 Collecting exhibitions in ${city}...`);
    
    const cityPaths = [
      `${city}/exhibitions/current`,
      `${city}/exhibitions/upcoming`,
      `${city}/venues/institutions`,
      `${city}/venues/galleries`
    ];

    const allExhibitions = [];

    for (const path of cityPaths) {
      try {
        const url = `${this.baseUrl}/${path}`;
        const exhibitions = await this.crawlExhibitionList(path, maxExhibitions / cityPaths.length);
        allExhibitions.push(...exhibitions);
      } catch (error) {
        console.error(`Error collecting from ${path}:`, error.message);
      }
    }

    return allExhibitions;
  }

  // 특정 venue의 모든 전시 수집
  async collectVenueExhibitions(venueSlug) {
    console.log(`🏛️  Collecting all exhibitions from ${venueSlug}...`);
    
    const venueUrl = `${this.baseUrl}/${venueSlug}`;
    const html = await this.fetchPage(venueUrl);
    
    if (!html) return [];

    const $ = cheerio.load(html);
    const exhibitions = [];

    // venue 페이지에서 전시 링크 추출
    $('a[href*="/exhibition/"]').each((i, link) => {
      const href = $(link).attr('href');
      const title = $(link).text().trim();
      
      if (title && href) {
        exhibitions.push({
          title,
          url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
          venue: { name: venueSlug },
          source: 'artmap'
        });
      }
    });

    return exhibitions;
  }
}

// 실행
async function main() {
  const collector = new MassiveArtmapCollector();
  
  try {
    // 대규모 수집 (목표: 1000개)
    await collector.massiveCollection(1000);
    
  } catch (error) {
    console.error('Collection error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = MassiveArtmapCollector;