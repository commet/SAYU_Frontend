const axios = require('axios');
const xml2js = require('xml2js');

/**
 * Korean Cultural API Service
 * 
 * Integrates with official Korean government cultural APIs:
 * 1. Korea Culture and Tourism Institute (한국문화관광연구원)
 * 2. Culture Portal (문화포털)
 * 3. Seoul Open Data Plaza (서울열린데이터광장)
 * 4. Arts Management Support Center (예술경영지원센터)
 */
class KoreanCulturalAPIService {
  constructor() {
    this.apis = {
      // 한국문화정보원 - 공연/전시 정보
      kculture: {
        name: '한국문화정보원',
        baseUrl: 'http://www.culture.go.kr/openapi/rest/publicperformancedisplays/area',
        serviceKey: process.env.CULTURE_GO_KR_API_KEY,
        encoding: 'UTF-8',
        rateLimit: 1000, // per day
        priority: 1
      },

      // 문화포털 - 전국 문화행사 정보
      culturePortal: {
        name: '문화포털',
        baseUrl: 'http://api.kcisa.kr/openapi/CNV_060/request',
        serviceKey: process.env.CULTURE_PORTAL_API_KEY,
        encoding: 'UTF-8',
        rateLimit: 1000,
        priority: 2
      },

      // 서울 열린데이터광장 - 서울시 전시 정보
      seoulOpenData: {
        name: '서울열린데이터광장',
        baseUrl: 'http://openapi.seoul.go.kr:8088',
        serviceKey: process.env.SEOUL_OPENDATA_API_KEY,
        format: 'json',
        rateLimit: 1000,
        priority: 1
      },

      // 예술경영지원센터 - 공연/전시 정보
      gokams: {
        name: '예술경영지원센터',
        baseUrl: 'http://www.gokams.or.kr/web/board/openapi.do',
        serviceKey: process.env.GOKAMS_API_KEY,
        priority: 3
      },

      // 한국관광공사 - TourAPI
      visitKorea: {
        name: '한국관광공사',
        baseUrl: 'http://apis.data.go.kr/B551011/KorService1',
        serviceKey: process.env.VISITKOREA_API_KEY,
        contentTypeId: '85', // 전시/공연/행사
        priority: 2
      }
    };

    // Seoul district codes for targeted collection
    this.seoulDistricts = {
      '종로구': '11110',
      '중구': '11140',
      '용산구': '11170',
      '성동구': '11200',
      '광진구': '11215',
      '동대문구': '11230',
      '중랑구': '11260',
      '성북구': '11290',
      '강북구': '11305',
      '도봉구': '11320',
      '노원구': '11350',
      '은평구': '11380',
      '서대문구': '11410',
      '마포구': '11440',
      '양천구': '11470',
      '강서구': '11500',
      '구로구': '11530',
      '금천구': '11545',
      '영등포구': '11560',
      '동작구': '11590',
      '관악구': '11620',
      '서초구': '11650',
      '강남구': '11680',
      '송파구': '11710',
      '강동구': '11740'
    };
  }

  // Main collection function
  async collectAllExhibitions() {
    console.log('🎭 Starting Korean Cultural API collection...');
    
    const results = {
      total: 0,
      bySource: {},
      exhibitions: [],
      errors: []
    };

    // Collect from each API source
    const collectors = [
      this.collectFromCulturePortal.bind(this),
      this.collectFromSeoulOpenData.bind(this),
      this.collectFromKCulture.bind(this),
      this.collectFromTourAPI.bind(this)
    ];

    for (const collector of collectors) {
      try {
        const sourceResults = await collector();
        results.exhibitions.push(...sourceResults.exhibitions);
        results.bySource[sourceResults.source] = sourceResults;
        results.total += sourceResults.exhibitions.length;
        
        console.log(`✅ ${sourceResults.source}: ${sourceResults.exhibitions.length} exhibitions`);
      } catch (error) {
        console.error(`❌ Collection failed for source:`, error.message);
        results.errors.push(error);
      }
    }

    return results;
  }

  // 문화포털 API (Culture Portal)
  async collectFromCulturePortal() {
    if (!this.apis.culturePortal.serviceKey) {
      throw new Error('Culture Portal API key not configured');
    }

    const exhibitions = [];
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0].replace(/-/g, '');

    try {
      const params = {
        serviceKey: this.apis.culturePortal.serviceKey,
        numOfRows: 100,
        pageNo: 1,
        arrange: 'A', // 지역별
        listYN: 'Y',
        areaCode: 1, // 서울
        sigunguCode: '',
        cat1: 'A02', // 역사관광지
        cat2: 'A0206', // 전시관
        eventStartDate: today,
        eventEndDate: futureDate
      };

      const response = await axios.get(this.apis.culturePortal.baseUrl, {
        params,
        timeout: 15000
      });

      if (response.data?.response?.body?.items?.item) {
        const items = Array.isArray(response.data.response.body.items.item)
          ? response.data.response.body.items.item
          : [response.data.response.body.items.item];

        for (const item of items) {
          if (this.isExhibitionContent(item.title)) {
            exhibitions.push(this.standardizeExhibition(item, 'culture_portal'));
          }
        }
      }

    } catch (error) {
      console.error('Culture Portal API error:', error.message);
    }

    return {
      source: 'culture_portal',
      exhibitions,
      count: exhibitions.length
    };
  }

  // 서울 열린데이터광장 API
  async collectFromSeoulOpenData() {
    if (!this.apis.seoulOpenData.serviceKey) {
      throw new Error('Seoul Open Data API key not configured');
    }

    const exhibitions = [];

    try {
      // 서울시 전시정보
      const exhibitUrl = `${this.apis.seoulOpenData.baseUrl}/${this.apis.seoulOpenData.serviceKey}/json/SebcExhibitInfo/1/100/`;
      
      const response = await axios.get(exhibitUrl, { timeout: 15000 });

      if (response.data?.SebcExhibitInfo?.row) {
        const items = response.data.SebcExhibitInfo.row;

        for (const item of items) {
          exhibitions.push({
            external_id: `seoul_${item.SN}`,
            title: item.TITLE?.trim(),
            venue: item.PLACE?.trim(),
            venue_address: item.ADDR?.trim(),
            start_date: this.parseKoreanDate(item.START_DATE),
            end_date: this.parseKoreanDate(item.END_DATE),
            description: item.PROGRAM?.trim(),
            image_url: item.MAIN_IMG?.trim(),
            ticket_url: item.HOMEPAGE?.trim() || item.HMPG_ADDR?.trim(),
            phone: item.PHONE?.trim(),
            ticket_price: item.USE_FEE?.trim(),
            source: 'seoul_opendata',
            raw_data: item
          });
        }
      }

      // 서울시 문화행사 정보도 수집
      const cultureUrl = `${this.apis.seoulOpenData.baseUrl}/${this.apis.seoulOpenData.serviceKey}/json/culturalEventInfo/1/100/`;
      
      const cultureResponse = await axios.get(cultureUrl, { timeout: 15000 });

      if (cultureResponse.data?.culturalEventInfo?.row) {
        const cultureItems = cultureResponse.data.culturalEventInfo.row;

        for (const item of cultureItems) {
          if (this.isExhibitionContent(item.TITLE)) {
            exhibitions.push({
              external_id: `seoul_culture_${item.CODENAME}`,
              title: item.TITLE?.trim(),
              venue: item.PLACE?.trim(),
              venue_address: `${item.GUNAME} ${item.PLACE}`.trim(),
              start_date: this.parseKoreanDate(item.STRTDATE),
              end_date: this.parseKoreanDate(item.END_DATE),
              description: item.PROGRAM?.trim(),
              image_url: item.MAIN_IMG?.trim(),
              ticket_url: item.HMPG_ADDR?.trim(),
              phone: item.INQUIRY?.trim(),
              ticket_price: item.USE_FEE?.trim(),
              source: 'seoul_culture',
              raw_data: item
            });
          }
        }
      }

    } catch (error) {
      console.error('Seoul Open Data API error:', error.message);
    }

    return {
      source: 'seoul_opendata',
      exhibitions,
      count: exhibitions.length
    };
  }

  // 한국문화정보원 API
  async collectFromKCulture() {
    if (!this.apis.kculture.serviceKey) {
      throw new Error('K-Culture API key not configured');
    }

    const exhibitions = [];
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0].replace(/-/g, '');

    try {
      const params = {
        serviceKey: this.apis.kculture.serviceKey,
        sido: '서울',
        cPage: 1,
        rows: 100,
        from: today,
        to: futureDate
      };

      const response = await axios.get(this.apis.kculture.baseUrl, {
        params,
        timeout: 15000
      });

      // Parse XML response
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      if (result?.response?.body?.[0]?.items?.[0]?.item) {
        const items = result.response.body[0].items[0].item;

        for (const item of items) {
          const itemData = {};
          Object.keys(item).forEach(key => {
            itemData[key] = item[key][0]; // xml2js wraps values in arrays
          });

          if (this.isExhibitionContent(itemData.title)) {
            exhibitions.push({
              external_id: `kculture_${itemData.seq}`,
              title: itemData.title?.trim(),
              venue: itemData.place?.trim(),
              venue_address: itemData.addr?.trim(),
              start_date: this.parseKoreanDate(itemData.startDate),
              end_date: this.parseKoreanDate(itemData.endDate),
              description: itemData.contents?.trim(),
              image_url: itemData.firstimage?.trim(),
              ticket_url: itemData.homepage?.trim(),
              phone: itemData.tel?.trim(),
              source: 'kculture',
              raw_data: itemData
            });
          }
        }
      }

    } catch (error) {
      console.error('K-Culture API error:', error.message);
    }

    return {
      source: 'kculture',
      exhibitions,
      count: exhibitions.length
    };
  }

  // 한국관광공사 TourAPI
  async collectFromTourAPI() {
    if (!this.apis.visitKorea.serviceKey) {
      throw new Error('Visit Korea API key not configured');
    }

    const exhibitions = [];

    try {
      // 축제/공연/행사 정보 조회
      const params = {
        serviceKey: this.apis.visitKorea.serviceKey,
        numOfRows: 100,
        pageNo: 1,
        MobileOS: 'ETC',
        MobileApp: 'SAYU',
        arrange: 'C', // 수정일순
        listYN: 'Y',
        areaCode: 1, // 서울
        contentTypeId: 85, // 전시/공연/행사
        eventStartDate: new Date().toISOString().split('T')[0].replace(/-/g, ''),
        _type: 'json'
      };

      const response = await axios.get(
        `${this.apis.visitKorea.baseUrl}/searchFestival1`,
        { params, timeout: 15000 }
      );

      if (response.data?.response?.body?.items?.item) {
        const items = response.data.response.body.items.item;

        for (const item of items) {
          if (this.isExhibitionContent(item.title)) {
            exhibitions.push({
              external_id: `tourapi_${item.contentid}`,
              title: item.title?.trim(),
              venue: item.addr1?.trim(),
              venue_address: `${item.addr1} ${item.addr2 || ''}`.trim(),
              start_date: this.parseKoreanDate(item.eventstartdate),
              end_date: this.parseKoreanDate(item.eventenddate),
              description: item.overview?.trim(),
              image_url: item.firstimage?.trim(),
              ticket_url: item.homepage?.trim(),
              phone: item.tel?.trim(),
              source: 'tour_api',
              raw_data: item
            });
          }
        }
      }

    } catch (error) {
      console.error('Tour API error:', error.message);
    }

    return {
      source: 'tour_api',
      exhibitions,
      count: exhibitions.length
    };
  }

  // Check if content is exhibition-related
  isExhibitionContent(title) {
    if (!title) return false;

    const exhibitionKeywords = [
      '전시', '展', 'exhibition', 'expo',
      '기획전', '특별전', '개인전', '기획', '특별',
      '미술관', '갤러리', 'gallery', 'museum',
      '작품전', '작가전', '회고전', '순회전',
      '아트', 'art', '예술', '미술',
      '설치', '조각', '회화', '사진', '영상',
      '현대미술', '전통미술', '민화', '서예',
      '디지털아트', '미디어아트', '인터랙티브'
    ];

    const lowerTitle = title.toLowerCase();
    return exhibitionKeywords.some(keyword => 
      lowerTitle.includes(keyword.toLowerCase()) ||
      title.includes(keyword)
    );
  }

  // Standardize exhibition data format
  standardizeExhibition(item, source) {
    const baseData = {
      external_id: `${source}_${item.contentid || item.seq || Date.now()}`,
      title: item.title?.trim() || item.TITLE?.trim(),
      venue: item.place?.trim() || item.PLACE?.trim() || item.addr1?.trim(),
      venue_address: item.addr1?.trim() || item.ADDR?.trim(),
      start_date: this.parseKoreanDate(item.eventstartdate || item.startDate || item.START_DATE),
      end_date: this.parseKoreanDate(item.eventenddate || item.endDate || item.END_DATE),
      description: (item.overview || item.contents || item.PROGRAM || '')?.trim(),
      image_url: (item.firstimage || item.MAIN_IMG || '')?.trim(),
      ticket_url: (item.homepage || item.HOMEPAGE || item.HMPG_ADDR || '')?.trim(),
      phone: (item.tel || item.PHONE || item.INQUIRY || '')?.trim(),
      source: source,
      raw_data: item
    };

    // Clean up empty strings
    Object.keys(baseData).forEach(key => {
      if (baseData[key] === '') {
        baseData[key] = null;
      }
    });

    return baseData;
  }

  // Parse Korean date formats
  parseKoreanDate(dateStr) {
    if (!dateStr) return null;

    // Remove any non-numeric characters except hyphens and dots
    const cleaned = dateStr.toString().replace(/[^0-9.-]/g, '');

    // Try different date formats
    const patterns = [
      /^(\d{4})(\d{2})(\d{2})$/, // YYYYMMDD
      /^(\d{4})[.-](\d{2})[.-](\d{2})$/, // YYYY-MM-DD or YYYY.MM.DD
      /^(\d{4})(\d{2})$/, // YYYYMM (month only)
      /^(\d{2})(\d{2})(\d{4})$/, // MMDDYYYY
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        let year, month, day;
        
        if (match[3]?.length === 4) {
          // MMDDYYYY format
          [, month, day, year] = match;
        } else {
          // YYYY... formats
          [, year, month, day = '01'] = match;
        }

        // Validate date components
        if (year && month && day) {
          const yearNum = parseInt(year);
          const monthNum = parseInt(month);
          const dayNum = parseInt(day);

          if (yearNum >= 2020 && yearNum <= 2030 && 
              monthNum >= 1 && monthNum <= 12 &&
              dayNum >= 1 && dayNum <= 31) {
            
            const date = new Date(yearNum, monthNum - 1, dayNum);
            return date.toISOString().split('T')[0];
          }
        }
      }
    }

    return null;
  }
}

module.exports = new KoreanCulturalAPIService();