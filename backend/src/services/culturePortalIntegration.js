const axios = require('axios');
const { pool } = require('../config/database');
const { logger } = require('../config/logger');

/**
 * 문화포털 API 통합 서비스
 * 한국 전시 정보의 가장 신뢰할 수 있는 공식 소스
 */
class CulturePortalIntegration {
  constructor() {
    this.baseUrl = 'http://api.kcisa.kr/openapi/CNV_060/request';
    this.apiKey = process.env.CULTURE_API_KEY;
    this.dailyLimit = 1000;
    this.currentUsage = 0;
    
    // 수집 우선순위 지역
    this.priorityRegions = [
      '서울특별시', '경기도', '부산광역시', '대구광역시', 
      '인천광역시', '광주광역시', '대전광역시', '제주특별자치도'
    ];
  }

  /**
   * 일일 전시 정보 수집 (스마트 전략)
   */
  async collectDailyExhibitions() {
    if (!this.apiKey) {
      logger.warn('Culture Portal API key not configured');
      return { success: false, error: 'API key missing' };
    }

    const results = {
      total: 0,
      new: 0,
      updated: 0,
      errors: [],
      regions: {}
    };

    logger.info('Starting Culture Portal daily collection...');

    try {
      // 1. 현재 진행 중인 전시 우선 수집
      const ongoingExhibitions = await this.fetchOngoingExhibitions();
      results.total += ongoingExhibitions.length;
      
      // 2. 지역별 순환 수집 (일일 한도 고려)
      for (const region of this.priorityRegions) {
        if (this.currentUsage >= this.dailyLimit * 0.9) {
          logger.warn(`Approaching daily limit (${this.currentUsage}/${this.dailyLimit})`);
          break;
        }

        const regionResults = await this.fetchRegionExhibitions(region);
        results.regions[region] = regionResults;
        results.total += regionResults.count;
        
        // API 호출 제한 관리
        await this.rateLimitDelay();
      }

      // 3. 데이터베이스 저장
      const saveResults = await this.saveExhibitionsToDB(ongoingExhibitions);
      results.new = saveResults.new;
      results.updated = saveResults.updated;
      results.errors = saveResults.errors;

      logger.info(`Culture Portal collection completed: ${results.total} total, ${results.new} new, ${results.updated} updated`);
      
      return { success: true, data: results };

    } catch (error) {
      logger.error('Culture Portal collection failed:', error);
      return { success: false, error: error.message, data: results };
    }
  }

  /**
   * 현재 진행 중인 전시 수집
   */
  async fetchOngoingExhibitions() {
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const params = {
      serviceKey: this.apiKey,
      realmCode: 'A', // 미술 분야
      from: today.toISOString().split('T')[0],
      to: nextMonth.toISOString().split('T')[0],
      rows: 100,
      pageNo: 1
    };

    const exhibitions = [];
    let hasMore = true;
    
    while (hasMore && this.currentUsage < this.dailyLimit) {
      try {
        const response = await axios.get(this.baseUrl, { params });
        this.currentUsage++;
        
        if (response.data?.response?.body?.items?.item) {
          const items = Array.isArray(response.data.response.body.items.item) 
            ? response.data.response.body.items.item 
            : [response.data.response.body.items.item];
          
          exhibitions.push(...items.map(item => this.standardizeExhibition(item)));
        }
        
        // 페이지네이션
        const totalCount = response.data?.response?.body?.totalCount || 0;
        if (exhibitions.length >= totalCount || params.pageNo * params.rows >= totalCount) {
          hasMore = false;
        } else {
          params.pageNo++;
        }
        
      } catch (error) {
        logger.error(`Failed to fetch page ${params.pageNo}:`, error);
        hasMore = false;
      }
    }
    
    return exhibitions;
  }

  /**
   * 지역별 전시 정보 수집
   */
  async fetchRegionExhibitions(region) {
    const results = { count: 0, exhibitions: [] };
    
    try {
      const params = {
        serviceKey: this.apiKey,
        realmCode: 'A',
        area: region,
        rows: 50,
        pageNo: 1
      };

      const response = await axios.get(this.baseUrl, { params });
      this.currentUsage++;
      
      if (response.data?.response?.body?.items?.item) {
        const items = Array.isArray(response.data.response.body.items.item) 
          ? response.data.response.body.items.item 
          : [response.data.response.body.items.item];
        
        results.exhibitions = items.map(item => this.standardizeExhibition(item));
        results.count = results.exhibitions.length;
      }
      
    } catch (error) {
      logger.error(`Failed to fetch exhibitions for ${region}:`, error);
    }
    
    return results;
  }

  /**
   * 전시 정보 표준화
   */
  standardizeExhibition(rawData) {
    return {
      title: rawData.title || '',
      titleEn: null, // 추후 번역 API 연동
      description: rawData.contents || '',
      venue: {
        name: rawData.place || '',
        address: rawData.addr || '',
        phone: rawData.phone || '',
        region: rawData.area || ''
      },
      period: {
        start: this.parseDate(rawData.startDate),
        end: this.parseDate(rawData.endDate)
      },
      admission: {
        fee: this.parseAdmissionFee(rawData.price),
        description: rawData.price || '미정'
      },
      contact: {
        phone: rawData.phone || '',
        url: rawData.url || ''
      },
      images: rawData.imgUrl ? [rawData.imgUrl] : [],
      source: 'culture_portal',
      apiId: rawData.seq,
      collectDate: new Date(),
      
      // SAYU 특화 필드
      emotionProfile: null, // AI 분석 예정
      personalityMatch: null, // 성격 유형 매칭 예정
      tags: this.extractTags(rawData),
      status: this.determineStatus(rawData.startDate, rawData.endDate)
    };
  }

  /**
   * 데이터베이스 저장
   */
  async saveExhibitionsToDB(exhibitions) {
    const results = { new: 0, updated: 0, errors: [] };
    
    for (const exhibition of exhibitions) {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // 중복 확인 (API ID 기반)
        const existing = await client.query(
          'SELECT id FROM exhibitions WHERE source = $1 AND api_id = $2',
          ['culture_portal', exhibition.apiId]
        );
        
        if (existing.rows.length > 0) {
          // 기존 전시 업데이트
          await this.updateExhibition(client, existing.rows[0].id, exhibition);
          results.updated++;
        } else {
          // 새 전시 생성
          await this.createExhibition(client, exhibition);
          results.new++;
        }
        
        await client.query('COMMIT');
        
      } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Failed to save exhibition "${exhibition.title}":`, error);
        results.errors.push({
          title: exhibition.title,
          error: error.message
        });
      } finally {
        client.release();
      }
    }
    
    return results;
  }

  /**
   * 새 전시 생성
   */
  async createExhibition(client, exhibition) {
    // 1. 장소 찾기/생성
    const venue = await this.findOrCreateVenue(client, exhibition.venue);
    
    // 2. 전시 생성
    const exhibitionResult = await client.query(`
      INSERT INTO exhibitions (
        title, description, venue_id, venue_name, venue_city,
        start_date, end_date, admission_fee, source_url, source,
        api_id, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING id
    `, [
      exhibition.title,
      exhibition.description,
      venue.id,
      exhibition.venue.name,
      this.extractCity(exhibition.venue.region),
      exhibition.period.start,
      exhibition.period.end,
      exhibition.admission.fee,
      exhibition.contact.url,
      exhibition.source,
      exhibition.apiId,
      exhibition.status
    ]);
    
    // 3. 이미지 저장
    if (exhibition.images.length > 0) {
      for (const imageUrl of exhibition.images) {
        await client.query(
          'INSERT INTO exhibition_images (exhibition_id, image_url, is_primary) VALUES ($1, $2, $3)',
          [exhibitionResult.rows[0].id, imageUrl, true]
        );
      }
    }
    
    return exhibitionResult.rows[0].id;
  }

  /**
   * 기존 전시 업데이트
   */
  async updateExhibition(client, exhibitionId, exhibition) {
    await client.query(`
      UPDATE exhibitions SET
        title = $1,
        description = $2,
        start_date = $3,
        end_date = $4,
        admission_fee = $5,
        status = $6,
        updated_at = NOW()
      WHERE id = $7
    `, [
      exhibition.title,
      exhibition.description,
      exhibition.period.start,
      exhibition.period.end,
      exhibition.admission.fee,
      exhibition.status,
      exhibitionId
    ]);
  }

  /**
   * 장소 찾기/생성
   */
  async findOrCreateVenue(client, venueData) {
    // 이름으로 기존 장소 찾기
    let venue = await client.query(
      'SELECT * FROM venues WHERE name = $1',
      [venueData.name]
    );
    
    if (venue.rows.length === 0) {
      // 새 장소 생성
      const newVenue = await client.query(`
        INSERT INTO venues (
          name, address, city, country, phone, type, tier, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        venueData.name,
        venueData.address,
        this.extractCity(venueData.region),
        'KR',
        venueData.phone,
        'gallery',
        this.determineTier(venueData.name),
        true
      ]);
      
      venue = newVenue;
    }
    
    return venue.rows[0];
  }

  /**
   * 유틸리티 함수들
   */
  parseDate(dateStr) {
    if (!dateStr) return null;
    
    try {
      // YYYY-MM-DD 형식으로 변환
      const cleanDate = dateStr.replace(/[^\d-]/g, '');
      return new Date(cleanDate).toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  parseAdmissionFee(priceStr) {
    if (!priceStr) return 0;
    if (priceStr.includes('무료') || priceStr.includes('free')) return 0;
    
    const match = priceStr.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : 0;
  }

  extractCity(region) {
    if (!region) return '서울';
    
    const cityMap = {
      '서울': '서울',
      '부산': '부산',
      '대구': '대구',
      '인천': '인천',
      '광주': '광주',
      '대전': '대전',
      '울산': '울산',
      '세종': '세종',
      '경기': '경기',
      '강원': '강원',
      '충북': '충북',
      '충남': '충남',
      '전북': '전북',
      '전남': '전남',
      '경북': '경북',
      '경남': '경남',
      '제주': '제주'
    };
    
    for (const [key, value] of Object.entries(cityMap)) {
      if (region.includes(key)) return value;
    }
    
    return '서울'; // 기본값
  }

  extractTags(rawData) {
    const tags = [];
    
    // 제목에서 키워드 추출
    if (rawData.title) {
      if (rawData.title.includes('개인전')) tags.push('개인전');
      if (rawData.title.includes('특별전')) tags.push('특별전');
      if (rawData.title.includes('기획전')) tags.push('기획전');
      if (rawData.title.includes('조각')) tags.push('조각');
      if (rawData.title.includes('회화')) tags.push('회화');
      if (rawData.title.includes('사진')) tags.push('사진');
      if (rawData.title.includes('미디어')) tags.push('미디어아트');
      if (rawData.title.includes('현대')) tags.push('현대미술');
    }
    
    return tags;
  }

  determineStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'ongoing';
  }

  determineTier(venueName) {
    const tier1 = ['국립', '시립', '도립', '문화예술회관'];
    const tier2 = ['미술관', '박물관', '갤러리'];
    
    for (const keyword of tier1) {
      if (venueName.includes(keyword)) return 1;
    }
    
    for (const keyword of tier2) {
      if (venueName.includes(keyword)) return 2;
    }
    
    return 3;
  }

  async rateLimitDelay() {
    // 1초 대기 (안전한 속도)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * 수집 상태 조회
   */
  async getCollectionStatus() {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_today,
        COUNT(CASE WHEN created_at::date = $1 THEN 1 END) as new_today,
        COUNT(CASE WHEN updated_at::date = $1 AND created_at::date != $1 THEN 1 END) as updated_today
      FROM exhibitions 
      WHERE source = 'culture_portal'
    `, [today]);
    
    return {
      currentUsage: this.currentUsage,
      dailyLimit: this.dailyLimit,
      todayStats: result.rows[0]
    };
  }
}

module.exports = new CulturePortalIntegration();