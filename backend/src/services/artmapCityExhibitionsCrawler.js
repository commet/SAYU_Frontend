/**
 * Artmap.com 도시별 전시 정보 크롤러
 * 각 도시의 현재 진행중인 전시 정보를 수집
 */

const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../config/database');

class ArtmapCityExhibitionsCrawler {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.requestDelay = 2000; // 2초 딜레이
    this.lastRequestTime = 0;
    
    // 주요 도시 목록
    this.targetCities = [
      'seoul',
      'new-york',
      'london',
      'paris',
      'tokyo',
      'berlin',
      'hong-kong',
      'singapore',
      'shanghai',
      'beijing'
    ];
  }

  /**
   * 요청 간 딜레이 적용
   */
  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * HTTP 요청 헬퍼
   */
  async fetchPage(url) {
    await this.respectRateLimit();
    
    try {
      console.log(`Fetching: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        },
        timeout: 15000,
        maxRedirects: 5
      });
      
      console.log(`Response status: ${response.status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      if (error.response) {
        console.error(`Response status: ${error.response.status}`);
        console.error(`Response headers:`, error.response.headers);
      }
      return null;
    }
  }

  /**
   * 도시별 전시 목록 페이지 분석
   */
  async analyzeCityPage(city) {
    // 여러 가능한 URL 패턴 시도
    const urlPatterns = [
      `${this.baseUrl}/${city}`,
      `${this.baseUrl}/${city}/exhibitions`,
      `${this.baseUrl}/${city}/current`,
      `${this.baseUrl}/exhibitions/current/${city}`,
      `${this.baseUrl}/exhibitions/institutions/current/${city}`,
      `${this.baseUrl}/exhibitions/institutions/current/worldwide`,
      `${this.baseUrl}/exhibitions/galleries/current/worldwide`,
      `${this.baseUrl}/exhibitions/institutions/opening/worldwide`
    ];

    for (const url of urlPatterns) {
      const html = await this.fetchPage(url);
      if (html) {
        console.log(`\nAnalyzing ${city} page structure from: ${url}`);
        const $ = cheerio.load(html);
        
        // 페이지 구조 분석
        console.log('Page title:', $('title').text());
        console.log('H1 tags:', $('h1').map((i, el) => $(el).text().trim()).get());
        console.log('H2 tags:', $('h2').length);
        
        // 가능한 전시 컨테이너 찾기
        const possibleSelectors = [
          '.exhibition-list',
          '.exhibitions-list',
          '.exibitionsListTable',
          '.exhibition-item',
          '.venue-exhibitions',
          '.current-exhibitions',
          '[class*="exhibition"]',
          '[class*="exhibit"]',
          '.list-item',
          '.event-list',
          'article',
          '.card',
          '.item',
          'table',
          'tr',
          '.content-item',
          '.listing'
        ];

        for (const selector of possibleSelectors) {
          const elements = $(selector);
          if (elements.length > 0) {
            console.log(`Found ${elements.length} elements with selector: ${selector}`);
            
            // 첫 번째 요소의 구조 분석
            const firstElement = elements.first();
            console.log('First element HTML preview:');
            console.log(firstElement.html()?.substring(0, 500) + '...');
          }
        }

        // 링크 패턴 분석
        const exhibitionLinks = $('a').filter((i, el) => {
          const href = $(el).attr('href') || '';
          return href.includes('/exhibition') || href.includes('/show') || href.includes('/event');
        });
        
        if (exhibitionLinks.length > 0) {
          console.log(`\nFound ${exhibitionLinks.length} potential exhibition links`);
          exhibitionLinks.slice(0, 5).each((i, el) => {
            console.log(`- ${$(el).text().trim()} -> ${$(el).attr('href')}`);
          });
        }
        
        // 실제 전시 정보 수집 (분석된 링크에서)
        const exhibitionData = [];
        exhibitionLinks.each((i, el) => {
          const $link = $(el);
          const href = $link.attr('href');
          const title = $link.text().trim();
          
          // 부모 요소에서 추가 정보 찾기
          const $parent = $link.closest('div, article, li, tr, td');
          const parentText = $parent.text();
          
          // 날짜 패턴 찾기
          const dateMatch = parentText.match(/(\d{1,2}\.\d{1,2}\.)\s*[-–]\s*(\d{1,2}\.\d{1,2}\.\d{4})/);
          
          if (title && href && title.length > 3) {
            exhibitionData.push({
              title,
              url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
              dates: dateMatch ? `${dateMatch[1]} - ${dateMatch[2]}` : '',
              venue: this.extractVenueFromHref(href)
            });
          }
        });
        
        if (exhibitionData.length > 0) {
          console.log(`\nExtracted ${exhibitionData.length} exhibitions from links`);
          return { url, html, $, exhibitions: exhibitionData };
        }

        return { url, html, $ };
      }
    }

    return null;
  }

  /**
   * 전세계 전시 목록에서 도시 필터링
   */
  async crawlWorldwideExhibitions(filterCity = null, maxPages = 5) {
    const exhibitions = [];
    
    // 여러 페이지 크롤링
    for (let page = 1; page <= maxPages; page++) {
      const url = `${this.baseUrl}/exhibitions/institutions/`;
      const pageUrl = page > 1 ? `${url}?page=${page}` : url;
      
      console.log(`Fetching exhibitions page ${page}...`);
      const html = await this.fetchPage(pageUrl);
      
      if (!html) {
        console.log(`Could not fetch page ${page}`);
        break;
      }

      const $ = cheerio.load(html);
      let pageExhibitions = 0;

      // artmap의 전시 테이블 구조 파싱
      $('tr').each((index, row) => {
        const $row = $(row);
        const links = $row.find('a');
        
        // 전시 링크가 있는 행인지 확인
        const hasExhibitionLink = links.toArray().some(link => {
          const href = $(link).attr('href') || '';
          return href.includes('/exhibition/');
        });
        
        if (hasExhibitionLink && links.length >= 2) {
          const exhibition = this.extractExhibitionFromArtmapRow($, $row);
          
          if (exhibition) {
            // 도시 필터링
            if (!filterCity || 
                (exhibition.venue && exhibition.venue.toLowerCase().includes(filterCity.toLowerCase())) ||
                (exhibition.city && exhibition.city.toLowerCase().includes(filterCity.toLowerCase()))) {
              exhibitions.push(exhibition);
              pageExhibitions++;
            }
          }
        }
      });

      console.log(`Found ${pageExhibitions} exhibitions on page ${page}`);
      
      // 페이지에 전시가 없으면 중단
      if (pageExhibitions === 0) {
        break;
      }
    }

    return exhibitions;
  }
  
  /**
   * Artmap 행에서 전시 정보 추출 (개선된 버전)
   */
  extractExhibitionFromArtmapRow($, $row) {
    const links = $row.find('a');
    if (links.length < 2) return null;
    
    // 링크 분석
    let venueLink = null;
    let exhibitionLink = null;
    
    links.each((i, link) => {
      const href = $(link).attr('href') || '';
      if (href.includes('/exhibition/')) {
        exhibitionLink = $(link);
      } else if (!venueLink && !href.includes('/exhibition/')) {
        venueLink = $(link);
      }
    });
    
    if (!exhibitionLink) return null;
    
    const title = exhibitionLink.text().trim();
    const exhibitionUrl = exhibitionLink.attr('href');
    const venue = venueLink ? venueLink.text().trim() : '';
    const venueUrl = venueLink ? venueLink.attr('href') : '';
    
    // 날짜 추출
    const rowText = $row.text();
    const dateMatch = rowText.match(/(\d{1,2}\s+\w{3})\s*[-–]\s*(\d{1,2}\s+\w{3}\s+\d{4})/);
    
    // 도시 추출 (venue에서)
    let city = '';
    if (venue) {
      const cityMatch = venue.match(/,\s*([^,]+)$/);
      city = cityMatch ? cityMatch[1].trim() : '';
      
      // 특별한 경우 처리
      if (venue.toLowerCase().includes('seoul')) city = 'Seoul';
      if (venue.toLowerCase().includes('new york')) city = 'New York';
      if (venue.toLowerCase().includes('london')) city = 'London';
      if (venue.toLowerCase().includes('paris')) city = 'Paris';
      if (venue.toLowerCase().includes('tokyo')) city = 'Tokyo';
      if (venue.toLowerCase().includes('berlin')) city = 'Berlin';
    }
    
    return {
      title,
      url: exhibitionUrl ? (exhibitionUrl.startsWith('http') ? exhibitionUrl : `${this.baseUrl}${exhibitionUrl}`) : '',
      venue,
      venueUrl: venueUrl ? (venueUrl.startsWith('http') ? venueUrl : `${this.baseUrl}${venueUrl}`) : '',
      city,
      startDate: dateMatch ? dateMatch[1] : null,
      endDate: dateMatch ? dateMatch[2] : null,
      dateText: dateMatch ? `${dateMatch[1]} - ${dateMatch[2]}` : ''
    };
  }

  /**
   * 도시별 전시 정보 크롤링 (개선된 버전)
   */
  async crawlCityExhibitions(city) {
    // 도시별 페이지 분석 시도
    const result = await this.analyzeCityPage(city);
    if (!result) {
      console.log(`Could not find valid page for ${city}`);
      return [];
    }

    const { url, html, $, exhibitions: analyzedExhibitions } = result;
    
    // 분석 단계에서 이미 전시 정보를 찾았다면 반환
    if (analyzedExhibitions && analyzedExhibitions.length > 0) {
      console.log(`Using ${analyzedExhibitions.length} exhibitions from page analysis`);
      return analyzedExhibitions;
    }
    
    let exhibitions = [];
    
    // 전세계 전시에서 도시별로 필터링 시도
    console.log(`Trying worldwide exhibitions filtered by ${city}...`);
    exhibitions = await this.crawlWorldwideExhibitions(city);
    
    if (exhibitions.length > 0) {
      console.log(`Found ${exhibitions.length} exhibitions via worldwide filter`);
      return exhibitions;
    }

    // 전시 정보 추출 시도 1: 테이블 형식
    $('.exibitionsListTable tr, .exhibitions-table tr, table tr').each((index, row) => {
      const $row = $(row);
      const exhibition = this.extractExhibitionFromRow($, $row);
      if (exhibition && exhibition.title) {
        exhibitions.push(exhibition);
      }
    });

    // 전시 정보 추출 시도 2: 리스트 아이템 형식
    if (exhibitions.length === 0) {
      $('.exhibition-item, .list-item, article.exhibition').each((index, item) => {
        const $item = $(item);
        const exhibition = this.extractExhibitionFromItem($, $item);
        if (exhibition && exhibition.title) {
          exhibitions.push(exhibition);
        }
      });
    }

    // 전시 정보 추출 시도 3: 일반 링크 패턴
    if (exhibitions.length === 0) {
      const exhibitionPattern = /\/([^\/]+)\/(exhibitions?|shows?|events?)\/([^\/]+)/;
      $('a').each((index, link) => {
        const $link = $(link);
        const href = $link.attr('href');
        const title = $link.text().trim();
        
        if (href && exhibitionPattern.test(href) && title && title.length > 5) {
          // 부모 요소에서 추가 정보 찾기
          const $parent = $link.closest('div, article, li, tr');
          const exhibition = {
            title: title,
            url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
            venue: this.extractVenueFromParent($, $parent),
            dates: this.extractDatesFromParent($, $parent),
            city: city
          };
          
          if (exhibition.venue || exhibition.dates) {
            exhibitions.push(exhibition);
          }
        }
      });
    }

    console.log(`Found ${exhibitions.length} exhibitions in ${city}`);
    return exhibitions;
  }

  /**
   * 테이블 행에서 전시 정보 추출
   */
  extractExhibitionFromRow($, $row) {
    // 모든 링크 찾기
    const links = $row.find('a');
    if (links.length < 2) return null; // 최소 2개 링크 필요 (전시명, 장소)
    
    // 첫 번째 링크는 보통 장소
    const venueLink = links.eq(0);
    const venueName = venueLink.text().trim();
    const venueUrl = venueLink.attr('href');
    
    // 두 번째 링크는 보통 전시명
    const titleLink = links.eq(1);
    const title = titleLink.text().trim();
    const exhibitionUrl = titleLink.attr('href');
    
    // 날짜 정보 추출
    const rowText = $row.text();
    const dateMatch = rowText.match(/(\d{1,2}\.\d{1,2}\.)\s*[-–]\s*(\d{1,2}\.\d{1,2}\.\d{4})/);
    
    // 도시 정보 추출 (장소명에서)
    const cityMatch = venueName.match(/,\s*([^,]+)$/);
    const city = cityMatch ? cityMatch[1].trim() : '';
    
    if (!title || !exhibitionUrl) return null;
    
    return {
      title,
      url: exhibitionUrl ? (exhibitionUrl.startsWith('http') ? exhibitionUrl : `${this.baseUrl}${exhibitionUrl}`) : '',
      venue: venueName,
      venueUrl: venueUrl ? (venueUrl.startsWith('http') ? venueUrl : `${this.baseUrl}${venueUrl}`) : '',
      city,
      startDate: dateMatch ? dateMatch[1] : null,
      endDate: dateMatch ? dateMatch[2] : null,
      dateText: dateMatch ? `${dateMatch[1]} - ${dateMatch[2]}` : ''
    };
  }

  /**
   * 리스트 아이템에서 전시 정보 추출
   */
  extractExhibitionFromItem($, $item) {
    const titleElement = $item.find('h2, h3, h4, .title, .exhibition-title').first();
    const title = titleElement.text().trim() || $item.find('a').first().text().trim();
    
    const link = $item.find('a').first();
    const url = link.attr('href');
    
    const venue = $item.find('.venue, .location, .institution').text().trim();
    const dates = $item.find('.dates, .date, .period').text().trim();
    
    return {
      title,
      url: url ? (url.startsWith('http') ? url : `${this.baseUrl}${url}`) : '',
      venue,
      dates,
      description: $item.find('.description, .excerpt').text().trim()
    };
  }

  /**
   * 부모 요소에서 장소 정보 추출
   */
  extractVenueFromParent($, $parent) {
    const venueSelectors = ['.venue', '.location', '.institution', '.gallery'];
    for (const selector of venueSelectors) {
      const venue = $parent.find(selector).text().trim();
      if (venue) return venue;
    }
    
    // 두 번째 링크가 보통 장소인 경우가 많음
    const secondLink = $parent.find('a').eq(1);
    if (secondLink.length && !secondLink.attr('href')?.includes('/exhibition')) {
      return secondLink.text().trim();
    }
    
    return '';
  }

  /**
   * 부모 요소에서 날짜 정보 추출
   */
  extractDatesFromParent($, $parent) {
    const dateSelectors = ['.dates', '.date', '.period', '.duration'];
    for (const selector of dateSelectors) {
      const dates = $parent.find(selector).text().trim();
      if (dates) return dates;
    }
    
    // 텍스트에서 날짜 패턴 찾기
    const text = $parent.text();
    const dateMatch = text.match(/(\d{1,2}[\.\/]\d{1,2}[\.\/]?\d{0,4})\s*[-–]\s*(\d{1,2}[\.\/]\d{1,2}[\.\/]\d{2,4})/);
    if (dateMatch) {
      return `${dateMatch[1]} - ${dateMatch[2]}`;
    }
    
    return '';
  }

  /**
   * URL에서 장소명 추출
   */
  extractVenueFromHref(href) {
    // URL 패턴: /venue-name/exhibition/exhibition-name
    const parts = href.split('/').filter(p => p);
    if (parts.length >= 1) {
      // 첫 번째 부분이 보통 장소명
      return parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return '';
  }

  /**
   * 전시 상세 정보 크롤링
   */
  async crawlExhibitionDetail(exhibitionUrl) {
    const html = await this.fetchPage(exhibitionUrl);
    if (!html) return null;

    const $ = cheerio.load(html);
    
    const details = {
      title: $('h1').first().text().trim(),
      subtitle: $('h2').first().text().trim(),
      venue: {
        name: '',
        address: '',
        city: '',
        country: ''
      },
      dates: '',
      artists: [],
      curator: '',
      description: '',
      images: []
    };

    // 아티스트 정보
    $('a[href*="/artist/"], a[href*="/profile/"]').each((i, link) => {
      const artistName = $(link).text().trim();
      if (artistName && !details.artists.includes(artistName)) {
        details.artists.push(artistName);
      }
    });

    // 설명 텍스트
    const descriptionSelectors = [
      '.exhibition-description',
      '.description',
      '#text-block',
      '.content',
      'article p'
    ];
    
    for (const selector of descriptionSelectors) {
      const desc = $(selector).text().trim();
      if (desc && desc.length > 50) {
        details.description = desc;
        break;
      }
    }

    // 이미지 수집
    $('img').each((i, img) => {
      const src = $(img).attr('src');
      if (src && (src.includes('exhibition') || src.includes('artwork'))) {
        const fullSrc = src.startsWith('http') ? src : `${this.baseUrl}${src}`;
        details.images.push(fullSrc);
      }
    });

    return details;
  }

  /**
   * 데이터베이스에 전시 정보 저장
   */
  async saveExhibition(exhibition, city) {
    const query = `
      INSERT INTO exhibitions (
        title, title_en, venue_id, start_date, end_date,
        description, artists, curator, source, external_url,
        city, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (external_url) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        artists = EXCLUDED.artists,
        updated_at = NOW()
      RETURNING id
    `;

    try {
      // 날짜 파싱
      const startDate = this.parseDate(exhibition.startDate || exhibition.dates);
      const endDate = this.parseDate(exhibition.endDate || exhibition.dates);

      const values = [
        exhibition.title,
        exhibition.title, // 영문 제목 (추후 번역 가능)
        null, // venue_id (별도 처리 필요)
        startDate,
        endDate,
        exhibition.description || '',
        exhibition.artists || [],
        exhibition.curator || '',
        'artmap',
        exhibition.url,
        city
      ];

      const result = await db.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error saving exhibition:', error.message);
      return null;
    }
  }

  /**
   * 날짜 파싱 헬퍼
   */
  parseDate(dateString) {
    if (!dateString) return null;
    
    // 다양한 날짜 형식 처리
    const patterns = [
      /(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
      /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{4})-(\d{2})-(\d{2})/,   // YYYY-MM-DD
    ];

    for (const pattern of patterns) {
      const match = dateString.match(pattern);
      if (match) {
        if (match[1].length === 4) {
          // YYYY-MM-DD
          return `${match[1]}-${match[2]}-${match[3]}`;
        } else {
          // DD.MM.YYYY or DD/MM/YYYY
          return `${match[3]}-${match[2]}-${match[1]}`;
        }
      }
    }

    return null;
  }

  /**
   * 도시별 크롤링 실행
   */
  async crawlCity(city, limit = 100) {
    console.log(`\n========== Crawling ${city.toUpperCase()} ==========`);
    
    const exhibitions = await this.crawlCityExhibitions(city);
    console.log(`Found ${exhibitions.length} exhibitions in ${city}`);

    const savedExhibitions = [];
    const exhibitionsToProcess = exhibitions.slice(0, limit);

    for (let i = 0; i < exhibitionsToProcess.length; i++) {
      const exhibition = exhibitionsToProcess[i];
      console.log(`\n[${i + 1}/${exhibitionsToProcess.length}] Processing: ${exhibition.title}`);
      
      // 상세 정보 가져오기
      if (exhibition.url) {
        const details = await this.crawlExhibitionDetail(exhibition.url);
        if (details) {
          const fullExhibition = { ...exhibition, ...details };
          const saved = await this.saveExhibition(fullExhibition, city);
          if (saved) {
            savedExhibitions.push(fullExhibition);
            console.log('✓ Saved to database');
          }
        }
      }
    }

    return savedExhibitions;
  }

  /**
   * 모든 도시 크롤링
   */
  async crawlAllCities() {
    const results = {};
    
    for (const city of this.targetCities) {
      try {
        const exhibitions = await this.crawlCity(city, 100);
        results[city] = exhibitions;
        console.log(`\nCompleted ${city}: ${exhibitions.length} exhibitions saved`);
      } catch (error) {
        console.error(`Error crawling ${city}:`, error.message);
        results[city] = [];
      }
    }

    // 결과 요약
    console.log('\n========== CRAWLING SUMMARY ==========');
    let totalExhibitions = 0;
    for (const [city, exhibitions] of Object.entries(results)) {
      console.log(`${city}: ${exhibitions.length} exhibitions`);
      totalExhibitions += exhibitions.length;
    }
    console.log(`\nTotal exhibitions collected: ${totalExhibitions}`);

    return results;
  }

  /**
   * 테스트 실행
   */
  async testCrawl(city = 'seoul') {
    console.log(`Testing crawler with ${city}...`);
    
    // 1. 페이지 구조 분석
    await this.analyzeCityPage(city);
    
    // 2. 전시 목록 수집
    const exhibitions = await this.crawlCityExhibitions(city);
    
    // 3. 처음 5개 전시 상세 정보
    for (let i = 0; i < Math.min(5, exhibitions.length); i++) {
      const exhibition = exhibitions[i];
      console.log(`\n--- Exhibition ${i + 1} ---`);
      console.log('Title:', exhibition.title);
      console.log('Venue:', exhibition.venue);
      console.log('Dates:', exhibition.dates || `${exhibition.startDate} - ${exhibition.endDate}`);
      console.log('URL:', exhibition.url);
      
      if (exhibition.url) {
        const details = await this.crawlExhibitionDetail(exhibition.url);
        if (details) {
          console.log('Artists:', details.artists.join(', '));
          console.log('Description:', details.description?.substring(0, 200) + '...');
        }
      }
    }

    return exhibitions;
  }
}

module.exports = ArtmapCityExhibitionsCrawler;