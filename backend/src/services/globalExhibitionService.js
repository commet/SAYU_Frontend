const db = require('../config/database');
const Redis = require('ioredis');
const { log } = require('../config/logger');
const puppeteer = require('puppeteer');
const EventEmitter = require('events');

class GlobalExhibitionService extends EventEmitter {
  constructor() {
    super();
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL);
        this.redis.on('error', (error) => {
          log.error('Redis error in Global Exhibition service:', error);
          this.redis = null;
        });
      } catch (error) {
        log.warn('Redis connection failed in Global Exhibition service, running without cache:', error.message);
        this.redis = null;
      }
    } else {
      this.redis = null;
      log.warn('Global Exhibition service running without Redis cache - REDIS_URL not configured');
    }
    this.browser = null;
    this.initializeService();
  }

  async initializeService() {
    try {
      if (this.redis) {
        await this.redis.ping();
        log.info('Global Exhibition service initialized with Redis');
      } else {
        log.info('Global Exhibition service initialized without Redis (cache disabled)');
      }
      
      // 브라우저 초기화
      await this.initializeBrowser();
      
      // 정기 업데이트 스케줄러 시작
      this.startUpdateScheduler();
    } catch (error) {
      log.error('Service initialization failed:', error);
      this.redis = null;
    }
  }

  async initializeBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      log.info('Puppeteer browser initialized');
    } catch (error) {
      log.error('Browser initialization failed:', error);
    }
  }

  // 글로벌 기관 데이터 수집
  async collectInstitutions(region = 'all') {
    const institutionSources = {
      seoul: {
        museums: [
          { name: '국립현대미술관', url: 'https://www.mmca.go.kr', type: 'museum' },
          { name: '서울시립미술관', url: 'https://sema.seoul.go.kr', type: 'museum' },
          { name: '리움미술관', url: 'https://www.leeum.org', type: 'museum' },
          { name: '대림미술관', url: 'https://www.daelimmuseum.org', type: 'museum' },
          { name: '아모레퍼시픽미술관', url: 'https://www.apmuseum.or.kr', type: 'museum' }
        ],
        galleries: [
          { name: '갤러리현대', url: 'https://www.galleryhyundai.com', type: 'gallery' },
          { name: '국제갤러리', url: 'https://www.kukjegallery.com', type: 'gallery' },
          { name: '아라리오갤러리', url: 'https://www.arario.com', type: 'gallery' }
        ]
      },
      newyork: {
        museums: [
          { name: 'Museum of Modern Art', url: 'https://www.moma.org', type: 'museum' },
          { name: 'Metropolitan Museum', url: 'https://www.metmuseum.org', type: 'museum' },
          { name: 'Guggenheim Museum', url: 'https://www.guggenheim.org', type: 'museum' },
          { name: 'Whitney Museum', url: 'https://whitney.org', type: 'museum' }
        ],
        galleries: [
          { name: 'Gagosian Gallery', url: 'https://gagosian.com', type: 'gallery' },
          { name: 'David Zwirner', url: 'https://www.davidzwirner.com', type: 'gallery' }
        ]
      },
      paris: {
        museums: [
          { name: 'Louvre Museum', url: 'https://www.louvre.fr', type: 'museum' },
          { name: 'Musée d\'Orsay', url: 'https://www.musee-orsay.fr', type: 'museum' },
          { name: 'Centre Pompidou', url: 'https://www.centrepompidou.fr', type: 'museum' }
        ]
      }
    };

    const targetSources = region === 'all' 
      ? Object.values(institutionSources).flat() 
      : institutionSources[region] || [];

    const results = [];

    for (const source of targetSources) {
      try {
        const institutionData = await this.scrapeInstitutionData(source);
        if (institutionData) {
          const saved = await this.saveInstitution(institutionData);
          results.push(saved);
        }
      } catch (error) {
        log.error(`Failed to collect data for ${source.name}:`, error);
      }
    }

    return results;
  }

  // 기관 정보 스크래핑
  async scrapeInstitutionData(source) {
    if (!this.browser) {
      await this.initializeBrowser();
    }

    const page = await this.browser.newPage();
    
    try {
      await page.goto(source.url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      const institutionData = await page.evaluate((source) => {
        // 기본 정보 추출
        const name = document.querySelector('h1, .museum-name, .gallery-name, .institution-name')?.textContent?.trim() ||
                    document.title.split('|')[0].trim();
        
        // 주소 정보 추출
        const addressSelectors = [
          '.address', '.location', '.contact-address', 
          '[class*="address"]', '[class*="location"]'
        ];
        
        let address = '';
        for (const selector of addressSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            address = element.textContent.trim();
            break;
          }
        }

        // 운영시간 정보 추출
        const hoursSelectors = [
          '.hours', '.opening-hours', '.visit-hours',
          '[class*="hours"]', '[class*="time"]'
        ];
        
        let hours = '';
        for (const selector of hoursSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            hours = element.textContent.trim();
            break;
          }
        }

        // 연락처 정보
        const phone = document.querySelector('a[href^="tel:"], .phone, .tel')?.textContent?.trim() || '';
        const email = document.querySelector('a[href^="mailto:"], .email')?.textContent?.trim() || '';

        // 설명 정보
        const description = document.querySelector('.about, .description, .intro, .museum-intro')?.textContent?.trim() || '';

        return {
          name_en: name,
          name_local: source.type === 'korean' ? name : '',
          type: source.type,
          website: source.url,
          address,
          phone,
          email,
          opening_hours: hours,
          description: description.substring(0, 1000), // 최대 1000자
          data_source: 'web_scraping'
        };
      }, source);

      // 지리 정보 추가
      if (institutionData.address) {
        const coordinates = await this.geocodeAddress(institutionData.address);
        if (coordinates) {
          institutionData.latitude = coordinates.lat;
          institutionData.longitude = coordinates.lng;
          institutionData.city = coordinates.city;
          institutionData.country = coordinates.country;
        }
      }

      return institutionData;
    } catch (error) {
      log.error(`Scraping failed for ${source.url}:`, error);
      return null;
    } finally {
      await page.close();
    }
  }

  // 전시 정보 수집
  async collectExhibitions(institutionId, options = {}) {
    const { deep = false, limit = 50 } = options;

    try {
      // 기관 정보 조회
      const institutionQuery = 'SELECT * FROM institutions WHERE id = $1';
      const institution = await db.query(institutionQuery, [institutionId]);
      
      if (institution.rows.length === 0) {
        throw new Error('Institution not found');
      }

      const institutionData = institution.rows[0];
      const exhibitions = await this.scrapeExhibitions(institutionData, { deep, limit });

      const results = [];
      for (const exhibitionData of exhibitions) {
        try {
          const saved = await this.saveExhibition(exhibitionData, institutionId);
          results.push(saved);
        } catch (error) {
          log.error(`Failed to save exhibition:`, error);
        }
      }

      return results;
    } catch (error) {
      log.error('Exhibition collection error:', error);
      throw error;
    }
  }

  // 전시 정보 스크래핑
  async scrapeExhibitions(institution, options = {}) {
    if (!this.browser) {
      await this.initializeBrowser();
    }

    const page = await this.browser.newPage();
    const exhibitions = [];

    try {
      // 전시 페이지 URL 추측
      const exhibitionUrls = this.generateExhibitionUrls(institution.website);
      
      for (const url of exhibitionUrls) {
        try {
          await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
          });

          const pageExhibitions = await page.evaluate(() => {
            // 전시 목록 요소 찾기
            const exhibitionSelectors = [
              '.exhibition-item', '.exhibition', '.show', 
              '.event-item', '.current-exhibition', '.upcoming-exhibition',
              '[class*="exhibition"]', '[class*="show"]'
            ];

            let exhibitionElements = [];
            for (const selector of exhibitionSelectors) {
              exhibitionElements = document.querySelectorAll(selector);
              if (exhibitionElements.length > 0) break;
            }

            const exhibitions = [];
            for (const element of exhibitionElements) {
              const title = element.querySelector('h1, h2, h3, .title, .name')?.textContent?.trim() || '';
              const dates = element.querySelector('.date, .period, .duration')?.textContent?.trim() || '';
              const description = element.querySelector('.description, .summary, .intro')?.textContent?.trim() || '';
              const imageUrl = element.querySelector('img')?.src || '';
              const detailUrl = element.querySelector('a')?.href || '';
              
              if (title) {
                exhibitions.push({
                  title_en: title,
                  title_local: '',
                  description,
                  image_url: imageUrl,
                  detail_url: detailUrl,
                  date_string: dates,
                  scraped_at: new Date().toISOString()
                });
              }
            }

            return exhibitions;
          });

          exhibitions.push(...pageExhibitions);
          
          if (exhibitions.length >= options.limit) break;
        } catch (error) {
          log.warn(`Failed to scrape ${url}:`, error.message);
        }
      }

      // 날짜 파싱 및 정규화
      return exhibitions.map(exhibition => this.normalizeExhibitionData(exhibition));
    } catch (error) {
      log.error('Exhibition scraping error:', error);
      return [];
    } finally {
      await page.close();
    }
  }

  // 주소 지오코딩
  async geocodeAddress(address) {
    try {
      // 실제 구현에서는 Google Maps API 또는 다른 지오코딩 서비스 사용
      // 여기서는 간단한 더미 데이터 반환
      const dummyCoordinates = {
        '서울': { lat: 37.5665, lng: 126.9780, city: 'Seoul', country: 'South Korea' },
        '뉴욕': { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'United States' },
        '파리': { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France' }
      };

      for (const [city, coords] of Object.entries(dummyCoordinates)) {
        if (address.includes(city)) {
          return coords;
        }
      }

      return null;
    } catch (error) {
      log.error('Geocoding error:', error);
      return null;
    }
  }

  // 기관 정보 저장
  async saveInstitution(institutionData) {
    try {
      const query = `
        INSERT INTO institutions (
          name_en, name_local, type, category, country, city, address,
          coordinates, website, email, phone, opening_hours, description,
          data_source, verified_date, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 
          ST_MakePoint($8, $9), $10, $11, $12, $13, $14,
          $15, CURRENT_DATE, NOW(), NOW()
        )
        ON CONFLICT (website) 
        DO UPDATE SET
          name_en = $1,
          name_local = $2,
          address = $7,
          coordinates = ST_MakePoint($8, $9),
          email = $11,
          phone = $12,
          opening_hours = $13,
          description = $14,
          updated_at = NOW()
        RETURNING *
      `;

      const values = [
        institutionData.name_en,
        institutionData.name_local || '',
        institutionData.type,
        'public', // 기본 카테고리
        institutionData.country || '',
        institutionData.city || '',
        institutionData.address || '',
        institutionData.longitude || 0,
        institutionData.latitude || 0,
        institutionData.website,
        institutionData.email || '',
        institutionData.phone || '',
        institutionData.opening_hours ? JSON.stringify({ raw: institutionData.opening_hours }) : '{}',
        institutionData.description || '',
        institutionData.data_source || 'manual'
      ];

      const result = await db.query(query, values);
      log.info(`Institution saved: ${institutionData.name_en}`);
      
      return result.rows[0];
    } catch (error) {
      log.error('Institution save error:', error);
      throw error;
    }
  }

  // 전시 정보 저장
  async saveExhibition(exhibitionData, institutionId) {
    try {
      const query = `
        INSERT INTO exhibitions (
          institution_id, title_en, title_local, subtitle, 
          start_date, end_date, status, description, 
          official_url, exhibition_type, genres, tags,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
        )
        ON CONFLICT (institution_id, title_en, start_date)
        DO UPDATE SET
          description = $8,
          official_url = $9,
          updated_at = NOW()
        RETURNING *
      `;

      const values = [
        institutionId,
        exhibitionData.title_en,
        exhibitionData.title_local || '',
        exhibitionData.subtitle || '',
        exhibitionData.start_date,
        exhibitionData.end_date,
        exhibitionData.status || 'upcoming',
        exhibitionData.description || '',
        exhibitionData.detail_url || '',
        exhibitionData.exhibition_type || 'temporary',
        exhibitionData.genres || [],
        exhibitionData.tags || []
      ];

      const result = await db.query(query, values);
      log.info(`Exhibition saved: ${exhibitionData.title_en}`);
      
      return result.rows[0];
    } catch (error) {
      log.error('Exhibition save error:', error);
      throw error;
    }
  }

  // 데이터 품질 검증
  async validateData(type, data) {
    const validators = {
      institution: (inst) => {
        const score = {
          required: 0,
          important: 0,
          optional: 0
        };

        // 필수 필드 (50점)
        if (inst.name_en) score.required += 15;
        if (inst.type) score.required += 10;
        if (inst.country) score.required += 10;
        if (inst.city) score.required += 10;
        if (inst.website) score.required += 5;

        // 중요 필드 (30점)
        if (inst.address) score.important += 10;
        if (inst.coordinates) score.important += 10;
        if (inst.opening_hours) score.important += 10;

        // 선택 필드 (20점)
        if (inst.phone) score.optional += 5;
        if (inst.email) score.optional += 5;
        if (inst.description) score.optional += 10;

        const total = score.required + score.important + score.optional;
        return {
          score: total,
          details: score,
          missing: this.getMissingFields('institution', inst)
        };
      },

      exhibition: (exh) => {
        const score = {
          required: 0,
          important: 0,
          optional: 0
        };

        // 필수 필드 (50점)
        if (exh.title_en) score.required += 20;
        if (exh.start_date) score.required += 15;
        if (exh.end_date) score.required += 15;

        // 중요 필드 (30점)
        if (exh.description) score.important += 15;
        if (exh.official_url) score.important += 10;
        if (exh.genres?.length > 0) score.important += 5;

        // 선택 필드 (20점)
        if (exh.subtitle) score.optional += 5;
        if (exh.artists?.length > 0) score.optional += 10;
        if (exh.tags?.length > 0) score.optional += 5;

        const total = score.required + score.important + score.optional;
        return {
          score: total,
          details: score,
          missing: this.getMissingFields('exhibition', exh)
        };
      }
    };

    return validators[type]?.(data) || { score: 0, details: {}, missing: [] };
  }

  // 헬퍼 메소드들
  generateExhibitionUrls(baseUrl) {
    const commonPaths = [
      '/exhibitions',
      '/exhibitions/current',
      '/exhibitions/upcoming',
      '/shows',
      '/events',
      '/visit/exhibitions',
      '/en/exhibitions',
      '/current-exhibitions'
    ];

    return commonPaths.map(path => `${baseUrl.replace(/\/$/, '')}${path}`);
  }

  normalizeExhibitionData(rawData) {
    // 날짜 파싱
    const dates = this.parseDateString(rawData.date_string);
    
    // 장르 추론
    const genres = this.inferGenres(rawData.title_en, rawData.description);
    
    // 태그 생성
    const tags = this.generateTags(rawData);

    return {
      ...rawData,
      start_date: dates.start,
      end_date: dates.end,
      status: dates.status,
      genres,
      tags,
      exhibition_type: 'temporary'
    };
  }

  parseDateString(dateString) {
    // 간단한 날짜 파싱 로직
    // 실제 구현에서는 더 정교한 파싱 필요
    const now = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);

    return {
      start: now.toISOString().split('T')[0],
      end: futureDate.toISOString().split('T')[0],
      status: 'upcoming'
    };
  }

  inferGenres(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const genreKeywords = {
      'contemporary': ['contemporary', 'modern', '현대'],
      'classical': ['classical', 'traditional', '고전'],
      'photography': ['photography', 'photo', '사진'],
      'sculpture': ['sculpture', '조각'],
      'painting': ['painting', '회화', '그림']
    };

    const genres = [];
    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        genres.push(genre);
      }
    }

    return genres;
  }

  generateTags(data) {
    const tags = [];
    
    if (data.title_en.includes('Special')) tags.push('special');
    if (data.description.includes('free')) tags.push('free-admission');
    
    return tags;
  }

  getMissingFields(type, data) {
    const requiredFields = {
      institution: ['name_en', 'type', 'country', 'city'],
      exhibition: ['title_en', 'start_date', 'end_date']
    };

    return requiredFields[type]?.filter(field => !data[field]) || [];
  }

  // 정기 업데이트 스케줄러
  startUpdateScheduler() {
    // 매일 자정에 실행
    const schedule = '0 0 * * *';
    
    setInterval(async () => {
      try {
        await this.dailyUpdate();
      } catch (error) {
        log.error('Scheduled update error:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24시간
  }

  async dailyUpdate() {
    log.info('Starting daily data update...');
    
    // 활성 기관들의 전시 정보 업데이트
    const activeInstitutions = await db.query(`
      SELECT id, name_en FROM institutions 
      WHERE verified_date > CURRENT_DATE - INTERVAL '30 days'
      LIMIT 10
    `);

    for (const institution of activeInstitutions.rows) {
      try {
        await this.collectExhibitions(institution.id, { limit: 20 });
        await this.delay(5000); // 5초 대기
      } catch (error) {
        log.error(`Update failed for ${institution.name_en}:`, error);
      }
    }

    log.info('Daily update completed');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (error) {
        log.warn('Redis close failed:', error.message);
      }
    }
  }
}

module.exports = new GlobalExhibitionService();