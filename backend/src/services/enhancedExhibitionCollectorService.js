const axios = require('axios');
const puppeteer = require('puppeteer');
const { pool } = require('../config/database');
const { log } = require('../config/logger');

class EnhancedExhibitionCollectorService {
  constructor() {
    // 각 미술관별 크롤링 설정
    this.museumCrawlers = {
      // 국립현대미술관
      'mmca': {
        name: '국립현대미술관',
        baseUrl: 'https://www.mmca.go.kr',
        exhibitionListUrl: 'https://www.mmca.go.kr/exhibitions/exhibitionsList.do',
        selector: {
          list: '.exhibition_list li',
          title: '.tit',
          date: '.date',
          venue: '.place',
          link: 'a'
        },
        locations: ['서울', '덕수궁', '과천', '청주']
      },
      
      // 서울시립미술관
      'sema': {
        name: '서울시립미술관',
        baseUrl: 'https://sema.seoul.go.kr',
        exhibitionListUrl: 'https://sema.seoul.go.kr/ex/exList.do',
        selector: {
          list: '.exhibit_list li',
          title: '.tit',
          date: '.date',
          venue: '.location',
          link: 'a'
        },
        locations: ['서소문본관', '북서울미술관', '남서울미술관', '백남준기념관']
      },

      // 리움미술관
      'leeum': {
        name: '리움미술관',
        baseUrl: 'https://www.leeum.org',
        exhibitionListUrl: 'https://www.leeum.org/exhibition/',
        selector: {
          list: '.exhibition-item',
          title: '.exhibition-title',
          date: '.exhibition-date',
          link: 'a'
        }
      },

      // 국립중앙박물관
      'museum': {
        name: '국립중앙박물관',
        baseUrl: 'https://www.museum.go.kr',
        exhibitionListUrl: 'https://www.museum.go.kr/site/main/exhiSpecial/list/current',
        selector: {
          list: '.card-body',
          title: '.card-title',
          date: '.date',
          link: 'a'
        }
      },

      // 예술의전당
      'sac': {
        name: '예술의전당',
        baseUrl: 'https://www.sac.or.kr',
        exhibitionListUrl: 'https://www.sac.or.kr/site/main/show/list',
        selector: {
          list: '.show-item',
          title: '.show-title',
          date: '.show-date',
          venue: '.show-venue',
          link: 'a'
        }
      },

      // 대림미술관
      'daelim': {
        name: '대림미술관',
        baseUrl: 'https://www.daelimmuseum.org',
        exhibitionListUrl: 'https://www.daelimmuseum.org/exhibition/current',
        api: {
          endpoint: '/api/exhibitions/current',
          method: 'GET'
        }
      },

      // 아모레퍼시픽미술관
      'amore': {
        name: '아모레퍼시픽미술관',
        baseUrl: 'https://www.amorepacific.com/museum',
        exhibitionListUrl: 'https://www.amorepacific.com/museum/exhibition',
        selector: {
          list: '.exhibition-item',
          title: '.title',
          date: '.period',
          link: 'a'
        }
      },

      // 호암미술관
      'hoam': {
        name: '호암미술관',
        baseUrl: 'https://hoam.samsungfoundation.org',
        exhibitionListUrl: 'https://hoam.samsungfoundation.org/exhibition',
        selector: {
          list: '.exhibition-list-item',
          title: '.title',
          date: '.date',
          link: 'a'
        }
      }
    };

    // 지역별 주요 미술관 추가
    this.regionalMuseums = {
      busan: [
        { name: '부산시립미술관', url: 'https://art.busan.go.kr' },
        { name: '부산현대미술관', url: 'https://www.busan.go.kr/moca' },
        { name: 'F1963', url: 'https://www.f1963.org' }
      ],
      daegu: [
        { name: '대구미술관', url: 'https://artmuseum.daegu.go.kr' },
        { name: '대구문화예술회관', url: 'https://www.daeguartscenter.or.kr' }
      ],
      gwangju: [
        { name: '광주시립미술관', url: 'https://artmuse.gwangju.go.kr' },
        { name: '국립아시아문화전당', url: 'https://www.acc.go.kr' }
      ],
      daejeon: [
        { name: '대전시립미술관', url: 'https://dmma.daejeon.go.kr' },
        { name: '대전예술의전당', url: 'https://www.daejeon.go.kr/djac' }
      ],
      jeju: [
        { name: '제주도립미술관', url: 'https://www.jeju.go.kr/jejumuseum' },
        { name: '제주현대미술관', url: 'https://www.jejumuseum.go.kr' }
      ]
    };
  }

  // 전체 수집 프로세스
  async collectAllExhibitions() {
    const results = {
      total: 0,
      success: 0,
      failed: 0,
      sources: {},
      exhibitions: []
    };

    log.info('Starting enhanced exhibition collection...');

    // 1. 네이버 API 수집
    try {
      const naverResults = await this.collectFromNaverAPI();
      results.sources.naver = naverResults;
      results.total += naverResults.count;
      results.success += naverResults.success;
    } catch (error) {
      log.error('Naver API collection failed:', error);
      results.failed++;
    }

    // 2. 주요 미술관 웹사이트 크롤링
    for (const [key, config] of Object.entries(this.museumCrawlers)) {
      try {
        const crawlResults = await this.crawlMuseumWebsite(key, config);
        results.sources[key] = crawlResults;
        results.total += crawlResults.count;
        results.success += crawlResults.success;
      } catch (error) {
        log.error(`${config.name} crawling failed:`, error);
        results.failed++;
      }
    }

    // 3. 통합 전시 정보 API 활용 (있는 경우)
    try {
      const apiResults = await this.collectFromPublicAPIs();
      results.sources.publicAPIs = apiResults;
      results.total += apiResults.count;
      results.success += apiResults.success;
    } catch (error) {
      log.error('Public API collection failed:', error);
    }

    // 4. 중복 제거 및 데이터 정제
    const cleanedExhibitions = await this.cleanAndDeduplicateExhibitions(results.exhibitions);
    
    // 5. 데이터베이스 저장
    const saveResults = await this.saveExhibitionsToDB(cleanedExhibitions);
    
    log.info(`Collection completed. Total: ${results.total}, Success: ${results.success}, Failed: ${results.failed}`);
    
    return {
      ...results,
      saved: saveResults.saved,
      duplicates: saveResults.duplicates
    };
  }

  // 네이버 API를 통한 수집 (기존 로직 개선)
  async collectFromNaverAPI() {
    const venues = await this.getActiveVenues();
    const results = { count: 0, success: 0, exhibitions: [] };
    
    for (const venue of venues) {
      try {
        // 다양한 검색 쿼리 사용
        const queries = [
          `${venue.name} 전시`,
          `${venue.name} 기획전`,
          `${venue.name} 특별전`,
          `${venue.name} ${new Date().getFullYear()}`
        ];

        for (const query of queries) {
          const blogResults = await this.searchNaverBlog(query);
          const newsResults = await this.searchNaverNews(query);
          
          const exhibitions = this.parseNaverResults([...blogResults, ...newsResults], venue);
          results.exhibitions.push(...exhibitions);
          results.count += exhibitions.length;
        }
        
        results.success++;
      } catch (error) {
        log.error(`Naver API error for ${venue.name}:`, error);
      }
    }

    return results;
  }

  // 네이버 블로그 검색
  async searchNaverBlog(query) {
    try {
      const response = await axios.get('https://openapi.naver.com/v1/search/blog.json', {
        params: {
          query,
          display: 20,
          sort: 'date'
        },
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
        }
      });

      return response.data.items || [];
    } catch (error) {
      log.error('Naver blog search error:', error);
      return [];
    }
  }

  // 네이버 뉴스 검색
  async searchNaverNews(query) {
    try {
      const response = await axios.get('https://openapi.naver.com/v1/search/news.json', {
        params: {
          query,
          display: 20,
          sort: 'date'
        },
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
        }
      });

      return response.data.items || [];
    } catch (error) {
      log.error('Naver news search error:', error);
      return [];
    }
  }

  // 네이버 검색 결과 파싱 (개선된 정규식)
  parseNaverResults(items, venue) {
    const exhibitions = [];
    const patterns = {
      title: [
        /『(.+?)』/,
        /「(.+?)」/,
        /<(.+?)>/,
        /\[(.+?)\]/,
        /전시\s*[:：]\s*(.+?)(?=展|전시|기간|일정|장소)/
      ],
      date: [
        /(\d{4})[.\s년]?\s*(\d{1,2})[.\s월]?\s*(\d{1,2})/g,
        /(\d{1,2})[\/\.](\d{1,2})\s*[-~]\s*(\d{1,2})[\/\.](\d{1,2})/
      ],
      artist: [
        /작가\s*[:：]\s*([^,\s]+)/,
        /아티스트\s*[:：]\s*([^,\s]+)/,
        /([가-힣]+)\s*작가/
      ],
      admission: [
        /관람료\s*[:：]\s*(무료|[\d,]+원)/,
        /입장료\s*[:：]\s*(무료|[\d,]+원)/,
        /티켓\s*[:：]\s*([\d,]+원)/
      ]
    };

    items.forEach(item => {
      const text = this.stripHtml(item.title + ' ' + item.description);
      
      // 제목 추출
      let title = null;
      for (const pattern of patterns.title) {
        const match = text.match(pattern);
        if (match) {
          title = match[1].trim();
          break;
        }
      }

      if (!title) return;

      // 날짜 추출
      const dates = this.extractDates(text);
      if (!dates.start) return;

      exhibitions.push({
        title,
        venue_name: venue.name,
        venue_id: venue.id,
        venue_city: venue.city,
        start_date: dates.start,
        end_date: dates.end || dates.start,
        description: item.description.substring(0, 500),
        source_url: item.link,
        source: 'naver_api',
        collected_at: new Date()
      });
    });

    return exhibitions;
  }

  // 미술관 웹사이트 크롤링
  async crawlMuseumWebsite(key, config) {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const results = { count: 0, success: 0, exhibitions: [] };

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // API 엔드포인트가 있는 경우
      if (config.api) {
        const apiData = await this.fetchMuseumAPI(config);
        results.exhibitions = apiData;
        results.count = apiData.length;
        results.success = apiData.length > 0 ? 1 : 0;
      } else {
        // 웹페이지 크롤링
        await page.goto(config.exhibitionListUrl, { waitUntil: 'networkidle2' });
        
        // 전시 목록 추출
        const exhibitions = await page.evaluate((selector) => {
          const items = document.querySelectorAll(selector.list);
          return Array.from(items).map(item => {
            const titleEl = item.querySelector(selector.title);
            const dateEl = item.querySelector(selector.date);
            const linkEl = item.querySelector(selector.link);
            const venueEl = selector.venue ? item.querySelector(selector.venue) : null;
            
            return {
              title: titleEl?.textContent?.trim(),
              date: dateEl?.textContent?.trim(),
              link: linkEl?.href,
              venue: venueEl?.textContent?.trim()
            };
          });
        }, config.selector);

        // 각 전시 상세 정보 수집
        for (const exhibition of exhibitions) {
          if (!exhibition.title || !exhibition.link) continue;
          
          try {
            const detailPage = await browser.newPage();
            await detailPage.goto(exhibition.link, { waitUntil: 'networkidle2' });
            
            // 상세 정보 추출 (각 미술관별로 커스터마이즈 필요)
            const details = await this.extractExhibitionDetails(detailPage, key);
            
            results.exhibitions.push({
              ...exhibition,
              ...details,
              venue_name: config.name,
              source: `${key}_crawler`,
              source_url: exhibition.link
            });
            
            await detailPage.close();
            results.count++;
            
          } catch (error) {
            log.error(`Failed to get details for ${exhibition.title}:`, error);
          }
        }
        
        results.success = 1;
      }
      
    } catch (error) {
      log.error(`Crawling error for ${config.name}:`, error);
      results.success = 0;
    } finally {
      await browser.close();
    }

    return results;
  }

  // 전시 상세 정보 추출 (미술관별 커스터마이징)
  async extractExhibitionDetails(page, museumKey) {
    const selectors = {
      mmca: {
        description: '.exh_info_text',
        artists: '.artist_name',
        admission: '.admission_fee',
        period: '.exhibition_period'
      },
      sema: {
        description: '.exhibit_detail',
        artists: '.artist_info',
        admission: '.fee_info',
        period: '.date_info'
      }
      // 각 미술관별 셀렉터 추가
    };

    const museumSelectors = selectors[museumKey] || {};
    
    return await page.evaluate((sel) => {
      const details = {};
      
      if (sel.description) {
        const desc = document.querySelector(sel.description);
        details.description = desc?.textContent?.trim();
      }
      
      if (sel.artists) {
        const artists = document.querySelectorAll(sel.artists);
        details.artists = Array.from(artists).map(a => a.textContent.trim());
      }
      
      if (sel.admission) {
        const admission = document.querySelector(sel.admission);
        details.admission_fee = admission?.textContent?.trim();
      }
      
      if (sel.period) {
        const period = document.querySelector(sel.period);
        details.period = period?.textContent?.trim();
      }
      
      return details;
    }, museumSelectors);
  }

  // 공공 API 활용 (문화포털, 공공데이터포털 등)
  async collectFromPublicAPIs() {
    const results = { count: 0, success: 0, exhibitions: [] };
    
    // 1. 문화포털 API (문화체육관광부)
    try {
      const cultureResponse = await axios.get('http://www.culture.go.kr/openapi/rest/publicperformancedisplays', {
        params: {
          serviceKey: process.env.CULTURE_API_KEY,
          realmCode: 'A', // 미술
          from: new Date().toISOString().split('T')[0],
          to: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          rows: 100
        }
      });
      
      if (cultureResponse.data?.response?.body?.items) {
        const items = cultureResponse.data.response.body.items.item;
        results.exhibitions.push(...this.parseCultureAPIData(items));
        results.count += items.length;
        results.success++;
      }
    } catch (error) {
      log.error('Culture API error:', error);
    }

    // 2. 서울 열린데이터광장 API
    try {
      const seoulResponse = await axios.get('http://openapi.seoul.go.kr:8088/API_KEY/json/SebcExhibitInfo/1/100/');
      
      if (seoulResponse.data?.SebcExhibitInfo?.row) {
        const items = seoulResponse.data.SebcExhibitInfo.row;
        results.exhibitions.push(...this.parseSeoulAPIData(items));
        results.count += items.length;
        results.success++;
      }
    } catch (error) {
      log.error('Seoul API error:', error);
    }

    return results;
  }

  // 활성 미술관 목록 조회
  async getActiveVenues() {
    const result = await pool.query(`
      SELECT id, name, city, tier, website
      FROM venues
      WHERE is_active = true
      ORDER BY tier, name
    `);
    
    return result.rows;
  }

  // 데이터 정제 및 중복 제거
  async cleanAndDeduplicateExhibitions(exhibitions) {
    const uniqueExhibitions = new Map();
    
    exhibitions.forEach(exhibition => {
      // 키 생성 (제목 + 장소 + 시작일)
      const key = `${exhibition.title?.toLowerCase().replace(/\s+/g, '')}_${exhibition.venue_name}_${exhibition.start_date}`;
      
      if (!uniqueExhibitions.has(key)) {
        // 데이터 정제
        const cleaned = {
          ...exhibition,
          title: this.cleanTitle(exhibition.title),
          description: this.cleanDescription(exhibition.description),
          start_date: this.normalizeDate(exhibition.start_date),
          end_date: this.normalizeDate(exhibition.end_date || exhibition.start_date),
          admission_fee: this.parseAdmissionFee(exhibition.admission_fee),
          artists: this.normalizeArtists(exhibition.artists)
        };
        
        uniqueExhibitions.set(key, cleaned);
      }
    });
    
    return Array.from(uniqueExhibitions.values());
  }

  // 전시 정보 DB 저장
  async saveExhibitionsToDB(exhibitions) {
    const results = { saved: 0, duplicates: 0, errors: [] };
    
    for (const exhibition of exhibitions) {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // 중복 확인
        const existing = await client.query(
          'SELECT id FROM exhibitions WHERE title = $1 AND venue_name = $2 AND start_date = $3',
          [exhibition.title, exhibition.venue_name, exhibition.start_date]
        );
        
        if (existing.rows.length > 0) {
          results.duplicates++;
          await client.query('ROLLBACK');
          continue;
        }
        
        // 전시 저장
        const insertResult = await client.query(`
          INSERT INTO exhibitions (
            title, description, venue_id, venue_name, venue_city,
            start_date, end_date, admission_fee, source_url,
            source, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
          RETURNING id
        `, [
          exhibition.title,
          exhibition.description,
          exhibition.venue_id,
          exhibition.venue_name,
          exhibition.venue_city || '서울',
          exhibition.start_date,
          exhibition.end_date,
          exhibition.admission_fee || 0,
          exhibition.source_url,
          exhibition.source,
          this.determineStatus(exhibition.start_date, exhibition.end_date)
        ]);
        
        const exhibitionId = insertResult.rows[0].id;
        
        // 아티스트 정보 저장
        if (exhibition.artists && exhibition.artists.length > 0) {
          for (const artistName of exhibition.artists) {
            await this.linkArtistToExhibition(client, exhibitionId, artistName);
          }
        }
        
        await client.query('COMMIT');
        results.saved++;
        
      } catch (error) {
        await client.query('ROLLBACK');
        log.error(`Failed to save exhibition "${exhibition.title}":`, error);
        results.errors.push({ exhibition: exhibition.title, error: error.message });
      } finally {
        client.release();
      }
    }
    
    return results;
  }

  // 유틸리티 함수들
  stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, '').replace(/&[^;]+;/g, ' ');
  }

  cleanTitle(title) {
    if (!title) return '';
    return title
      .replace(/\s+/g, ' ')
      .replace(/[『』「」<>《》【】]/g, '')
      .trim();
  }

  cleanDescription(desc) {
    if (!desc) return '';
    return this.stripHtml(desc).substring(0, 1000).trim();
  }

  normalizeDate(dateStr) {
    if (!dateStr) return null;
    
    // 다양한 날짜 형식 처리
    const patterns = [
      /(\d{4})[.-](\d{1,2})[.-](\d{1,2})/,
      /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
      /(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/
    ];
    
    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        const year = match[1].length === 4 ? match[1] : match[3];
        const month = match[1].length === 4 ? match[2] : match[1];
        const day = match[1].length === 4 ? match[3] : match[2];
        
        return new Date(year, month - 1, day).toISOString().split('T')[0];
      }
    }
    
    return null;
  }

  parseAdmissionFee(feeStr) {
    if (!feeStr) return 0;
    if (feeStr.includes('무료')) return 0;
    
    const match = feeStr.match(/[\d,]+/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''));
    }
    
    return 0;
  }

  normalizeArtists(artists) {
    if (!artists) return [];
    if (typeof artists === 'string') {
      return artists.split(/[,;]/).map(a => a.trim()).filter(a => a);
    }
    if (Array.isArray(artists)) {
      return artists.map(a => a.trim()).filter(a => a);
    }
    return [];
  }

  determineStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'ongoing';
  }

  extractDates(text) {
    const result = { start: null, end: null };
    
    // 기간 패턴 매칭
    const periodPattern = /(\d{4})[.\s년]*(\d{1,2})[.\s월]*(\d{1,2})[일]?\s*[-~]\s*(\d{4})?[.\s년]*(\d{1,2})[.\s월]*(\d{1,2})[일]?/;
    const match = text.match(periodPattern);
    
    if (match) {
      const startYear = match[1];
      const startMonth = match[2].padStart(2, '0');
      const startDay = match[3].padStart(2, '0');
      
      const endYear = match[4] || startYear;
      const endMonth = match[5].padStart(2, '0');
      const endDay = match[6].padStart(2, '0');
      
      result.start = `${startYear}-${startMonth}-${startDay}`;
      result.end = `${endYear}-${endMonth}-${endDay}`;
    }
    
    return result;
  }

  async linkArtistToExhibition(client, exhibitionId, artistName) {
    // 아티스트 찾기 또는 생성
    let artist = await client.query(
      'SELECT id FROM artists WHERE name = $1',
      [artistName]
    );
    
    if (artist.rows.length === 0) {
      const newArtist = await client.query(
        'INSERT INTO artists (name, source) VALUES ($1, $2) RETURNING id',
        [artistName, 'exhibition_collection']
      );
      artist = newArtist;
    }
    
    // 전시-아티스트 연결
    await client.query(
      'INSERT INTO exhibition_artists (exhibition_id, artist_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [exhibitionId, artist.rows[0].id]
    );
  }
}

module.exports = new EnhancedExhibitionCollectorService();