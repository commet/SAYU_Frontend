/**
 * Artmap.com 한국 전시 정보 수집 전문 크롤러
 * 실제 한국에서 열리는 전시만 필터링하여 수집
 */

const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../config/database');

class ArtmapKoreaExhibitionsCrawler {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.requestDelay = 2000;
    this.lastRequestTime = 0;

    // 한국 미술관/갤러리 키워드
    this.koreaVenueKeywords = [
      // 주요 미술관
      'national museum of modern and contemporary art',
      'mmca', 'nmoca',
      'seoul museum of art', 'sema',
      'leeum', 'samsung museum',
      'national museum of korea',
      'seoul arts center', 'sac',
      'daelim museum',
      'amorepacific museum',
      'plateau',
      'd museum',
      'piknic',

      // 갤러리
      'kukje gallery',
      'gallery hyundai',
      'arario gallery',
      'pace gallery seoul',
      'perrotin seoul',
      'thaddaeus ropac seoul',
      'lehmann maupin seoul',
      'gallery baton',
      'one and j gallery',
      'pkm gallery',

      // 도시명
      'seoul', 'busan', 'daegu', 'gwangju', 'daejeon',
      'korea', 'korean'
    ];
  }

  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  async fetchPage(url) {
    await this.respectRateLimit();

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
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

  /**
   * 전시 정보가 한국 관련인지 확인
   */
  isKoreanExhibition(venue, title, url) {
    const checkText = `${venue} ${title} ${url}`.toLowerCase();
    return this.koreaVenueKeywords.some(keyword =>
      checkText.includes(keyword.toLowerCase())
    );
  }

  /**
   * 전 세계 전시 목록에서 한국 전시만 필터링
   */
  async crawlKoreanExhibitions() {
    console.log('=== Searching for Korean exhibitions on Artmap ===\n');

    const exhibitions = [];
    const urls = [
      `${this.baseUrl}/exhibitions/institutions/opening/worldwide`,
      `${this.baseUrl}/exhibitions/institutions/closing/worldwide`,
      `${this.baseUrl}/exhibitions/galleries/opening/worldwide`,
      `${this.baseUrl}/exhibitions/galleries/closing/worldwide`
    ];

    for (const url of urls) {
      console.log(`\nChecking: ${url}`);
      const html = await this.fetchPage(url);

      if (html) {
        const $ = cheerio.load(html);

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

            if (exhibitionLink && venueLink) {
              const venue = venueLink.text().trim();
              const title = exhibitionLink.text().trim();
              const exhibitionUrl = exhibitionLink.attr('href');

              // 한국 전시인지 확인
              if (this.isKoreanExhibition(venue, title, exhibitionUrl)) {
                const rowText = $row.text();
                const dateMatch = rowText.match(/(\d{1,2}\s+\w{3})\s*[-–]\s*(\d{1,2}\s+\w{3}\s+\d{4})/);

                exhibitions.push({
                  venue,
                  title,
                  url: this.baseUrl + exhibitionUrl,
                  startDate: dateMatch ? dateMatch[1] : null,
                  endDate: dateMatch ? dateMatch[2] : null,
                  source: 'artmap',
                  foundAt: url
                });

                console.log(`✓ Found Korean exhibition: ${title} at ${venue}`);
              }
            }
          }
        });
      }
    }

    console.log(`\n\nTotal Korean exhibitions found: ${exhibitions.length}`);
    return exhibitions;
  }

  /**
   * 한국 미술관/갤러리 직접 검색
   */
  async searchKoreanVenues() {
    console.log('\n=== Searching for Korean venues ===\n');

    const venues = [];
    const searchTerms = ['seoul', 'korea', 'mmca', 'leeum', 'sema'];

    for (const term of searchTerms) {
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(term)}`;
      console.log(`Searching for: ${term}`);

      const html = await this.fetchPage(searchUrl);
      if (html) {
        const $ = cheerio.load(html);

        $('a').each((i, link) => {
          const href = $(link).attr('href') || '';
          const text = $(link).text().trim();

          if (href.includes('/venue/') || href.includes('/institution/') || href.includes('/gallery/')) {
            if (this.isKoreanExhibition(text, '', href)) {
              venues.push({
                name: text,
                url: this.baseUrl + href,
                searchTerm: term
              });
              console.log(`✓ Found venue: ${text}`);
            }
          }
        });
      }
    }

    return venues;
  }

  /**
   * 전시 상세 정보 가져오기
   */
  async getExhibitionDetails(exhibitionUrl) {
    const html = await this.fetchPage(exhibitionUrl);
    if (!html) return null;

    const $ = cheerio.load(html);

    return {
      title: $('h1').first().text().trim(),
      description: $('#text-block, .description, .exhibition-text').first().text().trim(),
      artists: $('a[href*="/artist/"], a[href*="/profile/"]').map((i, el) =>
        $(el).text().trim()
      ).get().filter(name => name),
      images: $('img').map((i, img) => {
        const src = $(img).attr('src');
        if (src && !src.includes('logo') && !src.includes('icon')) {
          return src.startsWith('http') ? src : this.baseUrl + src;
        }
      }).get().filter(src => src)
    };
  }

  /**
   * 데이터베이스에 전시 정보 저장
   */
  async saveExhibition(exhibition) {
    try {
      // 날짜 변환
      const startDate = this.convertDate(exhibition.startDate);
      const endDate = this.convertDate(exhibition.endDate);

      const query = `
        INSERT INTO exhibitions (
          title, title_en, venue_name, start_date, end_date,
          description, artists, source, external_url,
          city, country, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        ON CONFLICT (external_url) DO UPDATE SET
          title = EXCLUDED.title,
          end_date = EXCLUDED.end_date,
          updated_at = NOW()
        RETURNING id
      `;

      const values = [
        exhibition.title,
        exhibition.title, // 영문 제목 (추후 번역 가능)
        exhibition.venue,
        startDate,
        endDate,
        exhibition.description || '',
        exhibition.artists || [],
        'artmap',
        exhibition.url,
        'Seoul', // 기본값
        'South Korea'
      ];

      const result = await db.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error saving exhibition:', error.message);
      return null;
    }
  }

  /**
   * 날짜 형식 변환 (예: "26 Jan" -> "2025-01-26")
   */
  convertDate(dateStr) {
    if (!dateStr) return null;

    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    const match = dateStr.match(/(\d{1,2})\s+(\w{3})(?:\s+(\d{4}))?/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = months[match[2]] || '01';
      const year = match[3] || new Date().getFullYear();
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  /**
   * 전체 크롤링 프로세스
   */
  async crawlAndSave() {
    console.log('Starting Korean exhibitions crawl...\n');

    // 1. 한국 전시 찾기
    const exhibitions = await this.crawlKoreanExhibitions();

    // 2. 한국 장소 검색
    const venues = await this.searchKoreanVenues();
    console.log(`\nFound ${venues.length} Korean venues`);

    // 3. 전시 상세 정보 가져오고 저장
    let savedCount = 0;
    for (const exhibition of exhibitions) {
      console.log(`\nProcessing: ${exhibition.title}`);

      // 상세 정보 가져오기
      const details = await this.getExhibitionDetails(exhibition.url);
      if (details) {
        exhibition.description = details.description;
        exhibition.artists = details.artists;
      }

      // DB 저장
      const saved = await this.saveExhibition(exhibition);
      if (saved) {
        savedCount++;
        console.log('✓ Saved to database');
      }
    }

    console.log(`\n\n=== SUMMARY ===`);
    console.log(`Total exhibitions found: ${exhibitions.length}`);
    console.log(`Successfully saved: ${savedCount}`);
    console.log(`Korean venues found: ${venues.length}`);

    return {
      exhibitions,
      venues,
      savedCount
    };
  }
}

module.exports = ArtmapKoreaExhibitionsCrawler;
