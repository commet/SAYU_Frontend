const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { log } = require('../config/logger');

/**
 * Supabase를 사용하는 전시 수집 서비스
 * Railway cron job에서 사용
 */
class SupabaseExhibitionCollector {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    this.naverClientId = process.env.NAVER_CLIENT_ID;
    this.naverClientSecret = process.env.NAVER_CLIENT_SECRET;
  }

  async collectExhibitionsFromNaver(options = {}) {
    const {
      maxResults = 50,
      region = 'all',
      category = 'exhibition'
    } = options;

    const results = {
      collected: 0,
      duplicates: 0,
      errors: 0,
      details: []
    };

    try {
      log.info('Starting Naver exhibition collection', { maxResults, region });

      // Naver 검색 API 호출
      const searchQueries = [
        '전시회 서울',
        '미술관 전시',
        '갤러리 전시',
        '현대미술 전시',
        '기획전시'
      ];

      for (const query of searchQueries) {
        try {
          const naverData = await this.searchNaverExhibitions(query, Math.ceil(maxResults / searchQueries.length));
          
          for (const item of naverData) {
            try {
              const exhibition = await this.processExhibitionData(item);
              if (exhibition.isNew) {
                results.collected++;
                results.details.push({
                  title: exhibition.title,
                  venue: exhibition.venue_name,
                  status: 'new'
                });
              } else {
                results.duplicates++;
                results.details.push({
                  title: exhibition.title,
                  venue: exhibition.venue_name,
                  status: 'duplicate'
                });
              }
            } catch (error) {
              results.errors++;
              log.warn('Failed to process exhibition', {
                title: item.title,
                error: error.message
              });
            }
          }
        } catch (error) {
          log.error('Naver search failed', { query, error: error.message });
          results.errors++;
        }
      }

      log.info('Naver collection completed', results);
      return results;

    } catch (error) {
      log.error('Naver exhibition collection failed', { error: error.message });
      throw error;
    }
  }

  async searchNaverExhibitions(query, count = 10) {
    try {
      const response = await axios.get('https://openapi.naver.com/v1/search/local.json', {
        headers: {
          'X-Naver-Client-Id': this.naverClientId,
          'X-Naver-Client-Secret': this.naverClientSecret
        },
        params: {
          query: query,
          display: count,
          start: 1,
          sort: 'random'
        }
      });

      return response.data.items || [];
    } catch (error) {
      log.error('Naver API call failed', {
        query,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }

  async processExhibitionData(naverItem) {
    const exhibitionData = this.parseNaverData(naverItem);
    
    // 중복 확인
    const { data: existing } = await this.supabase
      .from('exhibitions')
      .select('id')
      .eq('title', exhibitionData.title)
      .eq('venue_name', exhibitionData.venue_name)
      .single();

    if (existing) {
      return { ...exhibitionData, isNew: false, id: existing.id };
    }

    // 새로운 전시 추가
    const { data: newExhibition, error } = await this.supabase
      .from('exhibitions')
      .insert(exhibitionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert exhibition: ${error.message}`);
    }

    return { ...newExhibition, isNew: true };
  }

  parseNaverData(item) {
    // Naver 지역 검색 결과를 전시 데이터로 변환
    const title = this.cleanText(item.title);
    const description = this.cleanText(item.description || '');
    
    // 주소에서 도시 추출
    const address = this.cleanText(item.address || '');
    const city = this.extractCity(address);
    
    // 전화번호 정리
    const phone = item.telephone ? this.cleanText(item.telephone) : null;
    
    // 카테고리에 따른 상태 결정
    const status = this.determineStatus(item.category);
    
    return {
      title,
      description: description || `${title}에 대한 정보입니다.`,
      venue_name: this.cleanText(item.title),
      venue_address: address,
      venue_city: city,
      venue_phone: phone,
      start_date: this.getDefaultStartDate(),
      end_date: this.getDefaultEndDate(),
      admission_fee: 0, // 기본값
      website_url: item.link || null,
      status,
      view_count: 0,
      like_count: 0,
      tags: this.extractTags(item),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '') // HTML 태그 제거
      .replace(/&[a-zA-Z0-9#]+;/g, '') // HTML 엔티티 제거
      .trim();
  }

  extractCity(address) {
    if (!address) return '서울';
    
    const cityPatterns = [
      /서울특별시|서울시|서울/,
      /부산광역시|부산시|부산/,
      /대구광역시|대구시|대구/,
      /인천광역시|인천시|인천/,
      /광주광역시|광주시|광주/,
      /대전광역시|대전시|대전/,
      /울산광역시|울산시|울산/,
      /세종특별자치시|세종시|세종/,
      /경기도|경기/,
      /강원도|강원/,
      /충청북도|충북/,
      /충청남도|충남/,
      /전라북도|전북/,
      /전라남도|전남/,
      /경상북도|경북/,
      /경상남도|경남/,
      /제주특별자치도|제주도|제주/
    ];

    for (const pattern of cityPatterns) {
      if (pattern.test(address)) {
        const match = address.match(pattern);
        if (match) {
          return match[0].replace(/(특별시|광역시|특별자치시|특별자치도|도)/, '');
        }
      }
    }

    return '서울'; // 기본값
  }

  determineStatus(category) {
    if (!category) return 'upcoming';
    
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('전시') || categoryLower.includes('미술') || categoryLower.includes('갤러리')) {
      return 'upcoming';
    }
    
    return 'draft';
  }

  getDefaultStartDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getDefaultEndDate() {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 3); // 3개월 후
    return endDate.toISOString().split('T')[0];
  }

  extractTags(item) {
    const tags = [];
    
    if (item.category) {
      const categories = item.category.split(',').map(c => c.trim());
      tags.push(...categories);
    }
    
    // 제목에서 태그 추출
    const title = item.title || '';
    if (title.includes('현대미술')) tags.push('현대미술');
    if (title.includes('기획전')) tags.push('기획전');
    if (title.includes('개인전')) tags.push('개인전');
    if (title.includes('단체전')) tags.push('단체전');
    if (title.includes('사진')) tags.push('사진');
    if (title.includes('조각')) tags.push('조각');
    if (title.includes('회화')) tags.push('회화');
    
    return tags.slice(0, 5); // 최대 5개
  }

  // 월별 전시 통계 업데이트
  async updateMonthlyStats() {
    try {
      const { data: stats } = await this.supabase
        .from('exhibitions')
        .select('status, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const summary = {
        total: stats.length,
        upcoming: stats.filter(s => s.status === 'upcoming').length,
        ongoing: stats.filter(s => s.status === 'ongoing').length,
        ended: stats.filter(s => s.status === 'ended').length
      };

      log.info('Monthly exhibition stats', summary);
      return summary;
    } catch (error) {
      log.error('Failed to update monthly stats', { error: error.message });
      throw error;
    }
  }
}

module.exports = SupabaseExhibitionCollector;