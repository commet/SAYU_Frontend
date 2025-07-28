const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');
require('dotenv').config();

class ArtMapCrawler {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // 요청 헤더 설정
    this.axiosConfig = {
      headers: {
        'User-Agent': 'SAYU Art Platform Crawler (contact@sayu.com)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    };

    // 크롤링 지연 시간 (밀리초)
    this.requestDelay = 2000;

    // 도시별 slug (확장된 목록)
    this.cities = {
      // 북미
      newyork: 'new-york',
      losangeles: 'los-angeles',
      chicago: 'chicago',
      sanfrancisco: 'san-francisco',
      miami: 'miami',
      washington: 'washington-dc',
      boston: 'boston',
      seattle: 'seattle',
      toronto: 'toronto',
      montreal: 'montreal',

      // 유럽
      london: 'london',
      paris: 'paris',
      berlin: 'berlin',
      amsterdam: 'amsterdam',
      zurich: 'zurich',
      basel: 'basel',
      vienna: 'vienna',
      madrid: 'madrid',
      barcelona: 'barcelona',
      rome: 'rome',
      milan: 'milan',
      venice: 'venice',
      brussels: 'brussels',
      copenhagen: 'copenhagen',
      stockholm: 'stockholm',
      oslo: 'oslo',
      munich: 'munich',
      frankfurt: 'frankfurt',

      // 아시아
      seoul: 'seoul',
      tokyo: 'tokyo',
      hongkong: 'hong-kong',
      shanghai: 'shanghai',
      beijing: 'beijing',
      singapore: 'singapore',
      taipei: 'taipei',
      bangkok: 'bangkok',

      // 기타
      sydney: 'sydney',
      melbourne: 'melbourne',
      dubai: 'dubai',
      telaviv: 'tel-aviv',
      mexico: 'mexico-city',
      saopaulo: 'sao-paulo',
      buenosaires: 'buenos-aires'
    };
  }

  // 지연 함수
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 안전한 HTTP 요청
  async safeFetch(url) {
    try {
      await this.delay(this.requestDelay);
      console.log(`Fetching: ${url}`);
      const response = await axios.get(url, this.axiosConfig);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      return null;
    }
  }

  // 도시별 venue 목록 수집 (ArtMap 실제 구조에 맞춰 수정)
  async fetchCityVenues(citySlug) {
    const venues = {
      institutions: [],
      galleries: [],
      furtherSpaces: []
    };

    try {
      // 각 venue 타입별로 별도 페이지 접근
      const venueTypes = [
        { type: 'institutions', url: `${this.baseUrl}/${citySlug}/venues/institutions` },
        { type: 'galleries', url: `${this.baseUrl}/${citySlug}/venues/galleries` },
        { type: 'furtherSpaces', url: `${this.baseUrl}/${citySlug}/venues/furtherspaces` }
      ];

      for (const { type, url } of venueTypes) {
        try {
          const html = await this.safeFetch(url);
          if (!html) continue;

          const $ = cheerio.load(html);

          // ArtMap의 실제 구조에 맞는 셀렉터 사용
          $('.venuesListTableRow, .venue-row, tr').each((i, elem) => {
            const venue = this.parseVenueTableRow($, elem, citySlug);
            if (venue) {
              venue.type = type;
              venues[type].push(venue);
            }
          });

          console.log(`Found ${venues[type].length} ${type} in ${citySlug}`);

        } catch (error) {
          console.error(`Error fetching ${type} for ${citySlug}:`, error.message);
        }
      }

      console.log(`Total venues in ${citySlug}:`, {
        institutions: venues.institutions.length,
        galleries: venues.galleries.length,
        furtherSpaces: venues.furtherSpaces.length
      });

    } catch (error) {
      console.error(`Error parsing venues for ${citySlug}:`, error);
    }

    return venues;
  }

  // ArtMap 테이블 행 파싱
  parseVenueTableRow($, elem, citySlug) {
    try {
      const $elem = $(elem);

      // 링크와 이름 추출
      const linkElement = $elem.find('a').first();
      const name = linkElement.text().trim() || $elem.find('td').first().text().trim();
      const href = linkElement.attr('href');

      if (!name || !href) return null;

      // 주소 추출 (보통 두 번째 또는 세 번째 컬럼)
      const cells = $elem.find('td');
      let address = '';
      if (cells.length > 1) {
        address = $(cells[1]).text().trim() || $(cells[2]).text().trim();
      }

      const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;

      return {
        name,
        url: fullUrl,
        address,
        slug: this.extractSlugFromUrl(href),
        city: citySlug
      };
    } catch (error) {
      console.error('Error parsing venue table row:', error);
      return null;
    }
  }

  // Venue 아이템 파싱
  parseVenueItem($, elem) {
    try {
      const $elem = $(elem);
      const name = $elem.find('.venue-name').text().trim();
      const url = $elem.find('a').attr('href');
      const address = $elem.find('.venue-address').text().trim();

      if (!name || !url) return null;

      return {
        name,
        url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
        address,
        slug: this.extractSlugFromUrl(url)
      };
    } catch (error) {
      console.error('Error parsing venue item:', error);
      return null;
    }
  }

  // URL에서 slug 추출
  extractSlugFromUrl(url) {
    const matches = url.match(/\/venues\/([^\/]+)/);
    return matches ? matches[1] : null;
  }

  // 특정 venue의 현재 전시 정보 수집 (향상된 버전)
  async fetchVenueExhibitions(venueUrl) {
    const exhibitions = [];
    const venueDetails = {};

    try {
      const html = await this.safeFetch(venueUrl);
      if (!html) return { exhibitions, venueDetails };

      const $ = cheerio.load(html);

      // Venue 상세 정보 추출
      venueDetails.name = $('.venue-name, .institution-name, h1').first().text().trim();
      venueDetails.address = $('.address, .venue-address, .location').text().trim();
      venueDetails.phone = $('.phone, .tel, .contact-phone').text().trim();
      venueDetails.email = $('.email, .contact-email').text().trim();
      venueDetails.website = $('a.website, .venue-website').attr('href');
      venueDetails.openingHours = $('.opening-hours, .hours').text().trim();
      venueDetails.description = $('.venue-description, .about').text().trim();

      // GPS 좌표 추출 시도
      const mapLink = $('a[href*="maps.google"], a[href*="map"]').attr('href');
      if (mapLink) {
        const coords = this.extractCoordinatesFromMapLink(mapLink);
        if (coords) {
          venueDetails.latitude = coords.lat;
          venueDetails.longitude = coords.lng;
        }
      }

      // 현재 전시 파싱 (다양한 셀렉터 사용)
      $('.current-exhibitions .exhibition-item, .exhibition-list-item, .event-item, .show-item, article.exhibition').each((i, elem) => {
        const exhibition = this.parseExhibitionItem($, elem);
        if (exhibition) {
          exhibition.venueUrl = venueUrl;
          exhibition.venueName = venueDetails.name;
          exhibitions.push(exhibition);
        }
      });

      // 예정된 전시도 수집
      $('.upcoming-exhibitions .exhibition-item, .future-exhibitions .event-item').each((i, elem) => {
        const exhibition = this.parseExhibitionItem($, elem);
        if (exhibition) {
          exhibition.venueUrl = venueUrl;
          exhibition.venueName = venueDetails.name;
          exhibition.status = 'upcoming';
          exhibitions.push(exhibition);
        }
      });

      console.log(`Found ${exhibitions.length} exhibitions at ${venueDetails.name || venueUrl}`);

    } catch (error) {
      console.error(`Error fetching exhibitions from ${venueUrl}:`, error);
    }

    return { exhibitions, venueDetails };
  }

  // 지도 링크에서 GPS 좌표 추출
  extractCoordinatesFromMapLink(mapLink) {
    try {
      // Google Maps 링크에서 좌표 추출
      const match = mapLink.match(/[@,](-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }
    } catch (error) {
      console.error('Error extracting coordinates:', error);
    }
    return null;
  }

  // 전시 아이템 파싱 (향상된 버전)
  parseExhibitionItem($, elem) {
    try {
      const $elem = $(elem);

      // 다양한 셀렉터로 정보 추출
      const title = $elem.find('.exhibition-title, .title, h3, h2, .event-title').first().text().trim();
      const artists = $elem.find('.exhibition-artists, .artist-name, .artist, .artists')
        .map((i, el) => $(el).text().trim())
        .get()
        .filter(Boolean);

      const dateText = $elem.find('.exhibition-dates, .dates, .date, .event-date').text().trim();
      const dates = this.parseDates(dateText);

      const description = $elem.find('.exhibition-description, .description, .text, .event-text').text().trim();
      const imageUrl = $elem.find('img').attr('src') || $elem.find('img').attr('data-src');

      // 큐레이터 정보
      const curator = $elem.find('.curator, .curated-by').text().trim();

      // 전시 타입 (solo/group)
      const exhibitionType = artists.length === 1 ? 'solo' : 'group';

      // 오프닝 정보
      const openingInfo = $elem.find('.opening, .vernissage').text().trim();

      if (!title) return null;

      return {
        title,
        artists: artists.length > 0 ? artists : ['Group Exhibition'],
        startDate: dates.start,
        endDate: dates.end,
        description: description || null,
        imageUrl: imageUrl ? this.normalizeImageUrl(imageUrl) : null,
        sourceUrl: $elem.find('a').attr('href') || null,
        curator: curator || null,
        exhibitionType,
        openingInfo: openingInfo || null
      };
    } catch (error) {
      console.error('Error parsing exhibition item:', error);
      return null;
    }
  }

  // 이미지 URL 정규화
  normalizeImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return this.baseUrl + url;
    return url;
  }

  // 날짜 텍스트 파싱
  parseDates(dateText) {
    const dates = { start: null, end: null };

    try {
      // 다양한 날짜 형식 처리
      // 예: "Jan 15 - Mar 20, 2025"
      // 예: "15.01.2025 - 20.03.2025"
      // 예: "January 15 - March 20"

      const datePatterns = [
        /(\w+\s+\d{1,2})\s*[-–]\s*(\w+\s+\d{1,2}),?\s*(\d{4})/,
        /(\d{1,2}\.\d{1,2}\.\d{4})\s*[-–]\s*(\d{1,2}\.\d{1,2}\.\d{4})/,
        /(\d{4}-\d{2}-\d{2})\s*[-–]\s*(\d{4}-\d{2}-\d{2})/
      ];

      for (const pattern of datePatterns) {
        const match = dateText.match(pattern);
        if (match) {
          // 날짜 파싱 로직 구현
          // 실제 구현시 moment.js 또는 date-fns 사용 권장
          break;
        }
      }
    } catch (error) {
      console.error('Error parsing dates:', dateText, error);
    }

    return dates;
  }

  // 전시 정보를 DB에 저장 (기존 스키마에 맞춰 수정)
  async saveExhibitionToDB(exhibition, venue, city) {
    try {
      // venue_id는 이미 저장된 venue ID 사용
      const venueId = venue.id || await this.getOrCreateVenue(venue, city);

      // 전시 정보 저장 (기존 스키마 컬럼 사용)
      const query = `
        INSERT INTO exhibitions (
          title_en, title_local, venue_id, venue_name, venue_city, venue_country,
          start_date, end_date, description, curator, artists,
          source_url, source, created_at, updated_at, collected_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW())
        ON CONFLICT (title_en, venue_id, start_date) DO UPDATE SET
          updated_at = NOW(),
          description = EXCLUDED.description,
          curator = EXCLUDED.curator
        RETURNING id
      `;

      const values = [
        exhibition.title, // title_en
        exhibition.title, // title_local (같은 값)
        venueId,
        venue.name,
        city,
        this.getCountryFromCity(city),
        exhibition.startDate,
        exhibition.endDate,
        exhibition.description,
        exhibition.curator,
        exhibition.artists, // 배열로 저장
        exhibition.sourceUrl,
        'artmap' // source
      ];

      const result = await this.pool.query(query, values);
      console.log(`Saved exhibition: ${exhibition.title} (ID: ${result.rows[0].id})`);

      return result.rows[0].id;
    } catch (error) {
      console.error('Error saving exhibition:', error);
      return null;
    }
  }

  // Venue 조회 또는 생성
  async getOrCreateVenue(venue, city) {
    try {
      // 기존 venue 확인
      const checkQuery = 'SELECT id FROM venues WHERE name = $1 AND city = $2';
      const checkResult = await this.pool.query(checkQuery, [venue.name, city]);

      if (checkResult.rows.length > 0) {
        return checkResult.rows[0].id;
      }

      // 새 venue 생성
      const insertQuery = `
        INSERT INTO venues (name, address, city, country, website, type)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      const values = [
        venue.name,
        venue.address,
        city,
        this.getCountryFromCity(city),
        venue.url,
        venue.type || 'gallery'
      ];

      const insertResult = await this.pool.query(insertQuery, values);
      console.log(`Created new venue: ${venue.name} (ID: ${insertResult.rows[0].id})`);

      return insertResult.rows[0].id;
    } catch (error) {
      console.error('Error in getOrCreateVenue:', error);
      throw error;
    }
  }

  // 도시명으로 국가 코드 반환 (ISO 3166-1 alpha-2)
  getCountryFromCity(city) {
    const cityCountryMap = {
      // 북미
      newyork: 'US',
      losangeles: 'US',
      chicago: 'US',
      sanfrancisco: 'US',
      miami: 'US',
      washington: 'US',
      boston: 'US',
      seattle: 'US',
      toronto: 'CA',
      montreal: 'CA',

      // 유럽
      london: 'GB',
      paris: 'FR',
      berlin: 'DE',
      amsterdam: 'NL',
      zurich: 'CH',
      basel: 'CH',
      vienna: 'AT',
      madrid: 'ES',
      barcelona: 'ES',
      rome: 'IT',
      milan: 'IT',
      venice: 'IT',
      brussels: 'BE',
      copenhagen: 'DK',
      stockholm: 'SE',
      oslo: 'NO',
      munich: 'DE',
      frankfurt: 'DE',

      // 아시아
      seoul: 'KR',
      tokyo: 'JP',
      hongkong: 'HK',
      shanghai: 'CN',
      beijing: 'CN',
      singapore: 'SG',
      taipei: 'TW',
      bangkok: 'TH',

      // 기타
      sydney: 'AU',
      melbourne: 'AU',
      dubai: 'AE',
      telaviv: 'IL',
      mexico: 'MX',
      saopaulo: 'BR',
      buenosaires: 'AR'
    };

    return cityCountryMap[city] || 'XX';
  }

  // 특정 도시의 모든 전시 수집 (향상된 버전)
  async crawlCity(citySlug, options = {}) {
    console.log(`\n=== Starting crawl for ${citySlug} ===`);
    console.log(`Time: ${new Date().toISOString()}`);

    const {
      maxVenues = 10,
      venueTypes = ['institutions', 'galleries', 'furtherSpaces'],
      saveToJson = true
    } = options;

    const stats = {
      city: citySlug,
      country: this.getCountryFromCity(citySlug),
      startTime: new Date().toISOString(),
      venuesProcessed: 0,
      exhibitionsFound: 0,
      exhibitionsSaved: 0,
      upcomingExhibitions: 0,
      venuesWithCoordinates: 0,
      errors: [],
      exhibitions: [], // JSON 백업용
      venues: [] // JSON 백업용
    };

    try {
      // 1. 도시의 venue 목록 수집
      const venues = await this.fetchCityVenues(citySlug);

      // 2. 각 venue 타입별로 처리
      for (const type of venueTypes) {
        if (!venues[type]) continue;

        console.log(`\nProcessing ${type} in ${citySlug}...`);

        const venueList = venues[type].slice(0, maxVenues);

        for (const venue of venueList) {
          try {
            venue.type = type;

            // 3. venue의 전시 정보와 상세 정보 수집
            const { exhibitions, venueDetails } = await this.fetchVenueExhibitions(venue.url);

            // venue 상세 정보 병합
            Object.assign(venue, venueDetails);

            stats.exhibitionsFound += exhibitions.length;
            stats.upcomingExhibitions += exhibitions.filter(e => e.status === 'upcoming').length;

            if (venue.latitude && venue.longitude) {
              stats.venuesWithCoordinates++;
            }

            // 4. venue를 먼저 저장/업데이트
            const venueId = await this.saveVenueToDB(venue, citySlug);

            // JSON 백업용
            stats.venues.push(venue);

            // 5. 각 전시를 DB에 저장
            for (const exhibition of exhibitions) {
              const saved = await this.saveExhibitionToDB(exhibition, venue, citySlug);
              if (saved) {
                stats.exhibitionsSaved++;
                // JSON 백업용
                stats.exhibitions.push({
                  ...exhibition,
                  city: citySlug,
                  country: this.getCountryFromCity(citySlug)
                });
              }
            }

            stats.venuesProcessed++;

            // 진행 상황 출력
            if (stats.venuesProcessed % 5 === 0) {
              console.log(`Progress: ${stats.venuesProcessed} venues, ${stats.exhibitionsSaved} exhibitions saved`);
            }

          } catch (error) {
            console.error(`Error processing venue ${venue.name}:`, error.message);
            stats.errors.push({ venue: venue.name, error: error.message });
          }
        }
      }

    } catch (error) {
      console.error(`Critical error crawling ${citySlug}:`, error);
      stats.errors.push({ city: citySlug, error: error.message });
    }

    stats.endTime = new Date().toISOString();
    stats.duration = (new Date(stats.endTime) - new Date(stats.startTime)) / 1000; // 초

    console.log(`\n=== Crawl completed for ${citySlug} ===`);
    console.log(`Duration: ${stats.duration} seconds`);
    console.log(`Venues processed: ${stats.venuesProcessed}`);
    console.log(`Exhibitions found: ${stats.exhibitionsFound} (${stats.upcomingExhibitions} upcoming)`);
    console.log(`Exhibitions saved: ${stats.exhibitionsSaved}`);
    console.log(`Venues with GPS: ${stats.venuesWithCoordinates}`);
    console.log(`Errors: ${stats.errors.length}`);

    // JSON 백업 저장
    if (saveToJson) {
      await this.saveJsonBackup(citySlug, stats);
    }

    return stats;
  }

  // 여러 도시 순차 크롤링
  async crawlMultipleCities(cityList, options = {}) {
    const results = [];

    for (const city of cityList) {
      const citySlug = this.cities[city] || city;
      const result = await this.crawlCity(citySlug, options);
      results.push(result);

      // 도시 간 대기 시간
      await this.delay(5000);
    }

    return results;
  }

  // venue 정보를 DB에 저장/업데이트 (기존 스키마에 맞춰 수정)
  async saveVenueToDB(venue, city) {
    try {
      const checkQuery = 'SELECT id FROM venues WHERE name = $1 AND city = $2';
      const checkResult = await this.pool.query(checkQuery, [venue.name, city]);

      if (checkResult.rows.length > 0) {
        // 기존 venue 업데이트
        const updateQuery = `
          UPDATE venues SET 
            address = $1, website = $2, phone = $3, latitude = $4, longitude = $5,
            updated_at = NOW(), last_updated = NOW()
          WHERE id = $6
          RETURNING id
        `;

        const updateValues = [
          venue.address, venue.website, venue.phone,
          venue.latitude, venue.longitude, checkResult.rows[0].id
        ];

        const updateResult = await this.pool.query(updateQuery, updateValues);
        return updateResult.rows[0].id;
      } else {
        // 새 venue 생성
        const insertQuery = `
          INSERT INTO venues (
            name, address, city, country, website, type, phone,
            latitude, longitude, created_at, updated_at, last_updated
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
          RETURNING id
        `;

        const insertValues = [
          venue.name, venue.address, city, this.getCountryFromCity(city),
          venue.website, venue.type || 'gallery', venue.phone,
          venue.latitude, venue.longitude
        ];

        const insertResult = await this.pool.query(insertQuery, insertValues);
        console.log(`Created new venue: ${venue.name} (ID: ${insertResult.rows[0].id})`);
        return insertResult.rows[0].id;
      }
    } catch (error) {
      console.error('Error in saveVenueToDB:', error);
      throw error;
    }
  }

  // JSON 백업 저장
  async saveJsonBackup(citySlug, stats) {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const backupDir = path.join(__dirname, 'backups');
      await fs.mkdir(backupDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `${citySlug}_${timestamp}.json`;
      const filepath = path.join(backupDir, filename);

      await fs.writeFile(filepath, JSON.stringify(stats, null, 2));
      console.log(`JSON backup saved: ${filepath}`);
    } catch (error) {
      console.error('Error saving JSON backup:', error);
    }
  }

  // 크롤러 종료
  async close() {
    await this.pool.end();
  }
}

module.exports = ArtMapCrawler;
