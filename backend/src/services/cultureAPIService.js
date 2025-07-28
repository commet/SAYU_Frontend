const axios = require('axios');
const cheerio = require('cheerio');

// 타임아웃 에러 클래스
class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// API 에러 클래스
class APIError extends Error {
  constructor(message, statusCode = null, response = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

class CultureAPIService {
  constructor() {
    // 문화데이터광장 API 키 (환경변수에서 가져옴)
    this.API_KEY = process.env.CULTURE_API_KEY || '';
    this.BASE_URL = 'https://www.culture.go.kr/openapi/rest/publicperformancedisplays/period';

    // Axios 인스턴스 설정 (공통 설정)
    this.axiosInstance = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent': 'SAYU-Exhibition-Collector/1.0',
        'Accept': 'application/json'
      },
      validateStatus (status) {
        return status >= 200 && status < 500; // 4xx 에러도 resolve
      }
    });

    // 재시도 설정
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryCondition: (error) => {
        return !error.response ||
               error.response.status >= 500 ||
               error.code === 'ECONNABORTED' ||
               error.code === 'ETIMEDOUT' ||
               error.code === 'ENOTFOUND';
      }
    };

    // 주요 문화기관 목록 (문화데이터광장 API는 통합 방식)
    this.MAJOR_INSTITUTIONS = [
      '국립현대미술관',
      '국립중앙박물관',
      '서울시립미술관',
      '경기도미술관',
      '대림미술관',
      '학고재갤러리',
      '갤러리현대',
      '국제갤러리',
      '아라리오갤러리',
      '토탈미술관',
      '리움미술관',
      '서울역사박물관',
      '예술의전당',
      '한국예술종합학교',
      '국립민속박물관',
      '국립고궁박물관',
      '전쟁기념관',
      '서울공예박물관',
      '북서울미술관',
      '백남준아트센터',
      '경기도어린이박물관',
      '국립한글박물관',
      '성남아트센터',
      '고양아람누리',
      '일민미술관',
      '코리아나미술관',
      '소마미술관'
    ];
  }

  /**
   * 문화데이터광장 API를 통해 전시 정보 가져오기
   */
  async getExhibitionsFromAPI(params = {}) {
    try {
      const {
        from = this.getDateString(-30), // 30일 전부터
        to = this.getDateString(60),    // 60일 후까지
        cPage = 1,
        rows = 100,
        realmCode = 'D000'  // 전시 분야
      } = params;

      const response = await axios.get(this.BASE_URL, {
        params: {
          serviceKey: this.API_KEY,
          cPage,
          rows,
          from,
          to,
          realmCode,
          area: '11', // 서울
          keyword: '',
          sortStdr: '1' // 등록일순
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SAYU-Exhibition-Collector/1.0'
        },
        timeout: 10000
      });

      if (response.data && response.data.response) {
        const exhibitions = response.data.response.body.items.item || [];
        return this.processExhibitions(exhibitions);
      }

      return [];
    } catch (error) {
      console.error('문화데이터광장 API 오류:', error.message);
      return [];
    }
  }

  /**
   * 서울시 열린데이터광장 API 연동
   */
  async getSeoulExhibitions() {
    try {
      const SEOUL_API_KEY = process.env.SEOUL_API_KEY || '';
      const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/culturalEventInfo/1/100/`;

      const response = await axios.get(url);

      if (response.data && response.data.culturalEventInfo) {
        const exhibitions = response.data.culturalEventInfo.row || [];
        return this.processSeoulExhibitions(exhibitions);
      }

      return [];
    } catch (error) {
      console.error('서울시 API 오류:', error.message);
      return [];
    }
  }

  /**
   * 주요 미술관 직접 크롤링 (API가 없는 경우)
   */
  async crawlMajorGalleries() {
    const galleries = [
      {
        name: '국립현대미술관',
        url: 'https://www.mmca.go.kr/exhibitions/exhiList.do?exhiStatusCode=ING',
        selector: '.exhibition-list .exhibition-item',
        titleSelector: '.tit a',
        dateSelector: '.date',
        imageSelector: '.img img',
        venueSelector: '.place',
        linkPrefix: 'https://www.mmca.go.kr'
      },
      {
        name: '서울시립미술관',
        url: 'https://sema.seoul.go.kr/ex/currEx',
        selector: '.exhibition_list li',
        titleSelector: '.subject',
        dateSelector: '.date',
        imageSelector: '.thumb img',
        venueSelector: '.place',
        linkPrefix: 'https://sema.seoul.go.kr'
      },
      {
        name: '대림미술관',
        url: 'https://www.daelimmuseum.org/',
        selector: '.main-exhibition',
        titleSelector: '.exhibition-title',
        dateSelector: '.exhibition-date',
        imageSelector: '.exhibition-image img',
        venueSelector: '.exhibition-venue',
        waitForSelector: '.main-exhibition',
        requiresJS: true
      },
      {
        name: '리움미술관',
        url: 'https://www.leeum.org/exhibition/exhibition01.asp',
        selector: '.exhibition-item',
        titleSelector: '.title',
        dateSelector: '.period',
        imageSelector: '.thumb img',
        venueSelector: '.location',
        requiresJS: true
      },
      {
        name: '아모레퍼시픽미술관',
        url: 'https://apma.amorepacific.com/exhibition/current',
        selector: '.exhibition-list-item',
        titleSelector: '.title',
        dateSelector: '.date',
        imageSelector: '.thumb img',
        requiresJS: true
      }
    ];

    const allExhibitions = [];

    for (const gallery of galleries) {
      try {
        const exhibitions = await this.crawlGallery(gallery);
        allExhibitions.push(...exhibitions);
      } catch (error) {
        console.error(`${gallery.name} 크롤링 오류:`, error.message);
      }
    }

    return allExhibitions;
  }

  /**
   * 개별 갤러리 크롤링
   */
  async crawlGallery(gallery) {
    const puppeteer = require('puppeteer');

    let browser = null;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // 이미지 로드 비활성화로 속도 향상
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if(req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(gallery.url, {
        waitUntil: gallery.requiresJS ? 'networkidle0' : 'domcontentloaded',
        timeout: 30000
      });

      // JavaScript가 필요한 경우 대기
      if (gallery.waitForSelector) {
        await page.waitForSelector(gallery.waitForSelector, { timeout: 10000 });
      }

      const exhibitions = await page.evaluate((gallery) => {
        const items = document.querySelectorAll(gallery.selector);
        const results = [];

        items.forEach((item, index) => {
          if (index >= 20) return; // 최대 20개만

          try {
            const titleEl = gallery.titleSelector ?
              item.querySelector(gallery.titleSelector) :
              item.querySelector('h3, .title, .exhibition-title');

            const dateEl = gallery.dateSelector ?
              item.querySelector(gallery.dateSelector) :
              item.querySelector('.date, .period, .exhibition-date');

            const imageEl = gallery.imageSelector ?
              item.querySelector(gallery.imageSelector) :
              item.querySelector('img');

            const linkEl = item.querySelector('a');
            const venueEl = gallery.venueSelector ?
              item.querySelector(gallery.venueSelector) : null;

            // 이미지 URL 처리
            let imageUrl = imageEl ? imageEl.src || imageEl.dataset.src : null;
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = new URL(imageUrl, window.location.origin).href;
            }

            // 링크 URL 처리
            let linkUrl = linkEl ? linkEl.href : null;
            if (linkUrl && gallery.linkPrefix && !linkUrl.startsWith('http')) {
              linkUrl = gallery.linkPrefix + linkUrl;
            }

            const title = titleEl ? titleEl.textContent.trim() : '';
            const period = dateEl ? dateEl.textContent.trim() : '';
            const venue = venueEl ? venueEl.textContent.trim() : gallery.name;

            if (title && title !== '제목 없음') {
              results.push({
                title,
                period,
                image: imageUrl,
                link: linkUrl,
                venue,
                source: 'crawl',
                crawledAt: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error('Item parsing error:', error);
          }
        });

        return results;
      }, gallery);

      return exhibitions.filter(ex => ex.title && ex.title !== '제목 없음');

    } catch (error) {
      console.error(`${gallery.name} 크롤링 실패:`, error.message);

      // 크롤링 실패시 기본 정보라도 반환
      if (gallery.fallbackInfo) {
        return [{
          title: gallery.fallbackInfo.title || `${gallery.name} 현재 전시`,
          venue: gallery.name,
          link: gallery.url,
          source: 'fallback',
          error: error.message
        }];
      }

      return [];
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Browser close error:', closeError);
        }
      }
    }
  }

  /**
   * 통합 전시 정보 수집
   */
  async collectAllExhibitions() {
    console.log('📊 통합 전시 정보 수집 시작...');

    const results = {
      cultureAPI: [],
      seoulAPI: [],
      crawled: [],
      total: 0,
      errors: []
    };

    try {
      // 1. 문화데이터광장 API
      console.log('1️⃣ 문화데이터광장 API 수집 중...');
      results.cultureAPI = await this.getExhibitionsFromAPI();
      console.log(`✅ 문화데이터광장: ${results.cultureAPI.length}개`);

      // 2. 서울시 API
      console.log('2️⃣ 서울시 열린데이터 API 수집 중...');
      results.seoulAPI = await this.getSeoulExhibitions();
      console.log(`✅ 서울시 API: ${results.seoulAPI.length}개`);

      // 3. 직접 크롤링 (선택적)
      if (process.env.EXHIBITION_CRAWLING_ENABLED !== 'false') {
        console.log('3️⃣ 주요 갤러리 크롤링 중...');
        try {
          results.crawled = await this.crawlMajorGalleries();
          console.log(`✅ 크롤링: ${results.crawled.length}개`);
        } catch (crawlError) {
          console.error('❌ 크롤링 오류:', crawlError.message);
          results.crawled = [];
          results.errors.push(`크롤링 오류: ${crawlError.message}`);
        }
      } else {
        console.log('ℹ️ 크롤링 비활성화됨');
        results.crawled = [];
      }

      // 4. 중복 제거 및 통합
      const allExhibitions = [
        ...results.cultureAPI,
        ...results.seoulAPI,
        ...results.crawled
      ];

      results.total = allExhibitions.length;
      results.unique = this.removeDuplicates(allExhibitions);

      console.log(`🎯 총 수집: ${results.total}개, 중복 제거 후: ${results.unique.length}개`);

      return {
        success: true,
        data: results.unique,
        meta: {
          cultureAPI: results.cultureAPI.length,
          seoulAPI: results.seoulAPI.length,
          crawled: results.crawled.length,
          total: results.total,
          unique: results.unique.length,
          collectedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ 전시 정보 수집 실패:', error);
      results.errors.push(error.message);

      return {
        success: false,
        error: error.message,
        data: [],
        meta: results
      };
    }
  }

  /**
   * 전시 정보 처리 (문화데이터광장)
   */
  processExhibitions(exhibitions) {
    return exhibitions.map(item => {
      // 날짜 포맷 변환 (YYYYMMDD -> YYYY-MM-DD)
      const formatDate = (dateStr) => {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        return `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
      };

      return {
        title: item.title || '제목 없음',
        venue: item.place || item.fcltynm || '장소 미정',
        period: `${formatDate(item.startDate)} ~ ${formatDate(item.endDate)}`,
        area: item.area || item.sido || '서울',
        realmName: item.realmName || '전시',
        url: item.url || '',
        phone: item.phone || '',
        imgUrl: item.imgUrl || item.thumbnail || '',
        price: item.price || item.gfree || '무료',
        placeUrl: item.placeUrl || '',
        source: 'culture_api',
        apiId: item.seq || item.perforcode || '',
        isMajorInstitution: this.MAJOR_INSTITUTIONS.some(inst =>
          (item.place || '').includes(inst) || (item.fcltynm || '').includes(inst)
        ),
        collectedAt: new Date().toISOString()
      };
    });
  }

  /**
   * 서울시 전시 정보 처리
   */
  processSeoulExhibitions(exhibitions) {
    return exhibitions.map(item => ({
      title: item.TITLE,
      venue: item.PLACE,
      period: `${item.STRTDATE} ~ ${item.END_DATE}`,
      area: '서울',
      description: item.PROGRAM,
      url: item.HMPG_ADDR,
      phone: item.INQUIRY,
      price: item.USE_FEE,
      source: 'seoul_api',
      apiId: item.CULTCODE,
      collectedAt: new Date().toISOString()
    }));
  }

  /**
   * 중복 제거
   */
  removeDuplicates(exhibitions) {
    const seen = new Set();
    return exhibitions.filter(ex => {
      const key = `${ex.title}-${ex.venue}`.toLowerCase().replace(/\s/g, '');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * 날짜 문자열 생성 (YYYYMMDD)
   */
  getDateString(days = 0) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }

  /**
   * API 키 검증
   */
  validateAPIKeys() {
    const issues = [];

    if (!this.API_KEY) {
      issues.push('문화데이터광장 API 키가 설정되지 않았습니다.');
    }

    if (!process.env.SEOUL_API_KEY) {
      issues.push('서울시 API 키가 설정되지 않았습니다.');
    }

    return {
      isValid: issues.length === 0,
      issues,
      hasAnyKey: !!(this.API_KEY || process.env.SEOUL_API_KEY)
    };
  }

  /**
   * 재시도 로직이 포함된 HTTP 요청
   */
  async requestWithRetry(requestFn, retryConfig = this.retryConfig) {
    const { maxRetries, retryDelay, retryCondition } = retryConfig;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFn();
        return result;
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !retryCondition(error)) {
          throw error;
        }

        const delay = retryDelay * Math.pow(2, attempt - 1); // 지수 백오프
        console.log(`   ⏳ ${delay / 1000}초 후 재시도 (${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * 에러 처리 및 로깅
   */
  handleError(error, context) {
    const errorInfo = {
      context,
      message: error.message,
      timestamp: new Date().toISOString()
    };

    if (error.response) {
      errorInfo.status = error.response.status;
      errorInfo.statusText = error.response.statusText;
      errorInfo.data = error.response.data;
    } else if (error.request) {
      errorInfo.type = 'NO_RESPONSE';
      errorInfo.code = error.code;
    } else {
      errorInfo.type = 'REQUEST_SETUP_ERROR';
    }

    console.error('🚨 API 에러:', JSON.stringify(errorInfo, null, 2));

    return errorInfo;
  }

  /**
   * 회로 차단기 패턴 구현 (Circuit Breaker)
   */
  createCircuitBreaker(name, threshold = 5, timeout = 60000) {
    if (!this.circuitBreakers) {
      this.circuitBreakers = new Map();
    }

    if (!this.circuitBreakers.has(name)) {
      this.circuitBreakers.set(name, {
        failures: 0,
        lastFailure: null,
        isOpen: false,
        threshold,
        timeout
      });
    }

    return this.circuitBreakers.get(name);
  }

  async executeWithCircuitBreaker(name, fn) {
    const breaker = this.createCircuitBreaker(name);

    // 회로가 열려있는지 확인
    if (breaker.isOpen) {
      const timeSinceFailure = Date.now() - breaker.lastFailure;
      if (timeSinceFailure < breaker.timeout) {
        throw new Error(`Circuit breaker is OPEN for ${name}. Wait ${Math.ceil((breaker.timeout - timeSinceFailure) / 1000)}s`);
      } else {
        // 타임아웃 후 회로 재설정
        breaker.isOpen = false;
        breaker.failures = 0;
      }
    }

    try {
      const result = await fn();
      // 성공 시 실패 카운트 리셋
      breaker.failures = 0;
      return result;
    } catch (error) {
      breaker.failures++;
      breaker.lastFailure = Date.now();

      if (breaker.failures >= breaker.threshold) {
        breaker.isOpen = true;
        console.error(`🔴 Circuit breaker OPENED for ${name} after ${breaker.failures} failures`);
      }

      throw error;
    }
  }
}

module.exports = CultureAPIService;
