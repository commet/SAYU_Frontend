/**
 * 개선된 Artmap.com 크롤러
 * 실제 HTML 구조에 맞춰 정확한 데이터 추출
 */

const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./src/config/database');

class ImprovedArtmapCrawler {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.requestDelay = 3000; // 3초 딜레이 (안전한 수준)
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
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      return null;
    }
  }

  /**
   * 전시 목록 크롤링 (개선된 버전)
   */
  async crawlExhibitions(limit = 10) {
    const urls = [
      `${this.baseUrl}/exhibitions/institutions/opening/worldwide`,
      `${this.baseUrl}/exhibitions/galleries/opening/worldwide`,
      `${this.baseUrl}/exhibitions/furtherspaces/opening/worldwide`
    ];
    
    const exhibitions = [];
    
    for (const url of urls) {
      console.log(`Fetching from: ${url}`);
      const html = await this.fetchPage(url);
      
      if (!html) continue;

      const $ = cheerio.load(html);
      const currentExhibitions = [];

      // 실제 HTML 구조에 맞춘 파싱
      $('.exibitionsListTable tr').each((index, element) => {
        if (currentExhibitions.length >= limit/3) return false; // 각 카테고리에서 limit/3만큼 수집

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
        // 날짜 파싱
        const dateMatch = dateText.match(/(\d{1,2}\s+\w+)\s*-\s*(\d{1,2}\s+\w+\s+\d{4})/);
        let startDate = null;
        let endDate = null;
        
        if (dateMatch) {
          startDate = dateMatch[1];
          endDate = dateMatch[2];
        }
        
        exhibitions.push({
          title,
          titleEn: title, // 대부분 영문
          venue: {
            name: venueName,
            url: venueUrl ? `${this.baseUrl}${venueUrl}` : null
          },
          dates: {
            original: dateText,
            start: startDate,
            end: endDate
          },
          url: exhibitionLink ? `${this.baseUrl}${exhibitionLink}` : null,
          imageUrl: imageUrl ? `${this.baseUrl}${imageUrl}` : null,
          source: 'artmap',
          crawledAt: new Date()
        });
      }
    });

    console.log(`Successfully parsed ${exhibitions.length} exhibitions`);
    return exhibitions;
  }

  /**
   * 전시 상세 정보 크롤링
   */
  async crawlExhibitionDetail(exhibitionUrl) {
    const html = await this.fetchPage(exhibitionUrl);
    
    if (!html) return null;

    const $ = cheerio.load(html);
    
    const details = {
      description: '',
      artists: [],
      curator: '',
      additionalInfo: {}
    };

    // 설명 텍스트 추출
    const $textBlock = $('#text-block, .exhibition-description, .content-text');
    if ($textBlock.length > 0) {
      details.description = $textBlock.text().trim();
    }

    // 아티스트 정보 추출 (프로필 링크에서)
    $('a[href*="/profile/"]').each((i, link) => {
      const artistName = $(link).text().trim();
      if (artistName && !details.artists.includes(artistName)) {
        details.artists.push(artistName);
      }
    });

    // 큐레이터 정보 찾기
    const curatorMatch = $('body').text().match(/[Cc]urated by:?\s*([^.\n]+)/);
    if (curatorMatch) {
      details.curator = curatorMatch[1].trim();
    }

    return details;
  }

  /**
   * 날짜 형식 변환 (예: "11 Jul 2025" -> "2025-07-11")
   */
  parseDate(dateStr) {
    if (!dateStr) return null;
    
    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const match = dateStr.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})?/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = months[match[2]] || '01';
      const year = match[3] || new Date().getFullYear();
      return `${year}-${month}-${day}`;
    }
    
    return null;
  }

  /**
   * 데이터베이스에 전시 정보 저장
   */
  async saveExhibition(exhibition) {
    try {
      // 1. 장소 정보 저장/업데이트
      const venueQuery = `
        INSERT INTO venues (name, name_en, type, source, external_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (external_id, source) DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = NOW()
        RETURNING id
      `;
      
      const venueValues = [
        exhibition.venue.name,
        exhibition.venue.name, // 영문명
        'museum',
        'artmap',
        exhibition.venue.url
      ];
      
      const venueResult = await db.query(venueQuery, venueValues);
      const venueId = venueResult.rows[0].id;

      // 2. 전시 정보 저장
      const exhibitionQuery = `
        INSERT INTO exhibitions (
          title, title_en, venue_id, start_date, end_date,
          description, image_url, source_url, source,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (title, venue_id, start_date) DO UPDATE SET
          description = COALESCE(EXCLUDED.description, exhibitions.description),
          image_url = COALESCE(EXCLUDED.image_url, exhibitions.image_url),
          updated_at = NOW()
        RETURNING id
      `;
      
      const startDate = this.parseDate(exhibition.dates.start);
      const endDate = this.parseDate(exhibition.dates.end);
      
      const exhibitionValues = [
        exhibition.title,
        exhibition.titleEn,
        venueId,
        startDate,
        endDate,
        exhibition.description || '',
        exhibition.imageUrl,
        exhibition.url,
        'artmap'
      ];
      
      const exhibitionResult = await db.query(exhibitionQuery, exhibitionValues);
      const exhibitionId = exhibitionResult.rows[0].id;

      // 3. 아티스트 정보가 있으면 연결
      if (exhibition.artists && exhibition.artists.length > 0) {
        for (const artistName of exhibition.artists) {
          // 아티스트 저장
          const artistQuery = `
            INSERT INTO artists (name, name_en, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
            ON CONFLICT (name) DO UPDATE SET
              updated_at = NOW()
            RETURNING id
          `;
          
          const artistResult = await db.query(artistQuery, [artistName, artistName]);
          const artistId = artistResult.rows[0].id;

          // 전시-아티스트 연결
          const linkQuery = `
            INSERT INTO exhibition_artists (exhibition_id, artist_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `;
          
          await db.query(linkQuery, [exhibitionId, artistId]);
        }
      }

      console.log(`✅ Saved exhibition: ${exhibition.title} at ${exhibition.venue.name}`);
      return exhibitionId;

    } catch (error) {
      console.error('Error saving exhibition:', error.message);
      console.error('Exhibition data:', exhibition);
      return null;
    }
  }

  /**
   * 메인 크롤링 프로세스
   */
  async crawl(options = {}) {
    const { limit = 10, saveToDb = true } = options;
    
    console.log('🎨 Starting Artmap.com crawling...');
    console.log(`📊 Will collect ${limit} exhibitions`);
    console.log(`💾 Save to DB: ${saveToDb}`);
    console.log('⏱️ Request delay: 3 seconds\n');

    // 1. 전시 목록 수집
    const exhibitions = await this.crawlExhibitions(limit);
    
    if (exhibitions.length === 0) {
      console.log('❌ No exhibitions found');
      return [];
    }

    // 2. 각 전시의 상세 정보 수집
    for (let i = 0; i < exhibitions.length; i++) {
      const exhibition = exhibitions[i];
      console.log(`\n[${i + 1}/${exhibitions.length}] Processing: ${exhibition.title}`);
      
      if (exhibition.url) {
        const details = await this.crawlExhibitionDetail(exhibition.url);
        if (details) {
          // 상세 정보 병합
          exhibition.description = details.description;
          exhibition.artists = details.artists;
          exhibition.curator = details.curator;
        }
      }

      // 3. 데이터베이스에 저장
      if (saveToDb) {
        await this.saveExhibition(exhibition);
      }
    }

    console.log(`\n✅ Crawling completed! Collected ${exhibitions.length} exhibitions`);
    return exhibitions;
  }
}

// 실행
async function main() {
  const crawler = new ImprovedArtmapCrawler();
  
  try {
    // 100개의 전시 수집
    const exhibitions = await crawler.crawl({
      limit: 100,
      saveToDb: false // 먼저 테스트로 확인
    });
    
    // 결과 출력
    console.log('\n=== COLLECTED EXHIBITIONS ===');
    exhibitions.forEach((ex, i) => {
      console.log(`\n${i + 1}. ${ex.title}`);
      console.log(`   Venue: ${ex.venue.name}`);
      console.log(`   Dates: ${ex.dates.original}`);
      console.log(`   Artists: ${ex.artists ? ex.artists.join(', ') : 'N/A'}`);
      console.log(`   Description: ${ex.description ? ex.description.substring(0, 100) + '...' : 'N/A'}`);
    });
    
  } catch (error) {
    console.error('Crawler error:', error);
  } finally {
    // 데이터베이스 연결 종료
    if (db.end) {
      await db.end();
    } else if (db.pool && db.pool.end) {
      await db.pool.end();
    }
  }
}

// 모듈로 사용하거나 직접 실행
if (require.main === module) {
  main();
}

module.exports = ImprovedArtmapCrawler;