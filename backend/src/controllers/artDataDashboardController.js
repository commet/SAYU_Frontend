const { pool } = require('../config/database');
const { logger } = require('../config/logger');
const culturePortalIntegration = require('../services/culturePortalIntegration');
const museumAPIService = require('../services/museumAPIService');
const enhancedExhibitionCollector = require('../services/enhancedExhibitionCollectorService');

/**
 * 아트 데이터 통합 모니터링 대시보드 컨트롤러
 */
class ArtDataDashboardController {

  /**
   * 종합 데이터 상태 대시보드
   */
  async getDataOverview(req, res) {
    try {
      const overview = {
        exhibitions: await this.getExhibitionStats(),
        artworks: await this.getArtworkStats(),
        artists: await this.getArtistStats(),
        venues: await this.getVenueStats(),
        dataSources: await this.getDataSourceStats(),
        dataQuality: await this.getDataQualityMetrics(),
        recentActivity: await this.getRecentActivity(),
        systemHealth: await this.getSystemHealth()
      };

      res.json({
        success: true,
        data: overview,
        lastUpdated: new Date()
      });

    } catch (error) {
      logger.error('Dashboard overview error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 전시 데이터 통계
   */
  async getExhibitionStats() {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'ended' THEN 1 END) as ended,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as added_today,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as added_this_week,
        COUNT(CASE WHEN source = 'culture_portal' THEN 1 END) as from_culture_portal,
        COUNT(CASE WHEN source = 'naver_api' THEN 1 END) as from_naver,
        COUNT(CASE WHEN source = 'image_extraction' THEN 1 END) as from_images,
        COUNT(CASE WHEN source LIKE '%_crawler' THEN 1 END) as from_crawlers
      FROM exhibitions
    `);

    const cityStats = await pool.query(`
      SELECT venue_city, COUNT(*) as count
      FROM exhibitions
      WHERE status IN ('ongoing', 'upcoming')
      GROUP BY venue_city
      ORDER BY count DESC
      LIMIT 10
    `);

    const monthlyTrend = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM exhibitions
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month
    `);

    return {
      summary: stats.rows[0],
      cityDistribution: cityStats.rows,
      monthlyTrend: monthlyTrend.rows
    };
  }

  /**
   * 미술 작품 통계
   */
  async getArtworkStats() {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_public_domain = true THEN 1 END) as public_domain,
        COUNT(CASE WHEN primary_image_url IS NOT NULL THEN 1 END) as with_images,
        COUNT(CASE WHEN artist_display_name IS NOT NULL THEN 1 END) as with_artist,
        COUNT(CASE WHEN api_source = 'met' THEN 1 END) as from_met,
        COUNT(CASE WHEN api_source = 'cleveland' THEN 1 END) as from_cleveland,
        COUNT(CASE WHEN api_source = 'rijks' THEN 1 END) as from_rijks
      FROM artworks_extended
    `);

    const mediumStats = await pool.query(`
      SELECT medium, COUNT(*) as count
      FROM artworks_extended
      WHERE medium IS NOT NULL
      GROUP BY medium
      ORDER BY count DESC
      LIMIT 10
    `);

    const cultureStats = await pool.query(`
      SELECT culture, COUNT(*) as count
      FROM artworks_extended
      WHERE culture IS NOT NULL
      GROUP BY culture
      ORDER BY count DESC
      LIMIT 10
    `);

    return {
      summary: stats.rows[0],
      mediumDistribution: mediumStats.rows,
      cultureDistribution: cultureStats.rows
    };
  }

  /**
   * 아티스트 통계
   */
  async getArtistStats() {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN nationality IS NOT NULL THEN 1 END) as with_nationality,
        COUNT(CASE WHEN birth_year IS NOT NULL THEN 1 END) as with_birth_year,
        COUNT(CASE WHEN source = 'museum_api' THEN 1 END) as from_museums,
        COUNT(CASE WHEN source = 'exhibition_collection' THEN 1 END) as from_exhibitions
      FROM artists
    `);

    const nationalityStats = await pool.query(`
      SELECT nationality, COUNT(*) as count
      FROM artists
      WHERE nationality IS NOT NULL
      GROUP BY nationality
      ORDER BY count DESC
      LIMIT 10
    `);

    const centuryStats = await pool.query(`
      SELECT 
        CASE 
          WHEN birth_year < 1800 THEN 'Before 1800'
          WHEN birth_year BETWEEN 1800 AND 1850 THEN '1800-1850'
          WHEN birth_year BETWEEN 1851 AND 1900 THEN '1851-1900'
          WHEN birth_year BETWEEN 1901 AND 1950 THEN '1901-1950'
          WHEN birth_year BETWEEN 1951 AND 2000 THEN '1951-2000'
          WHEN birth_year > 2000 THEN 'After 2000'
          ELSE 'Unknown'
        END as period,
        COUNT(*) as count
      FROM artists
      GROUP BY period
      ORDER BY period
    `);

    return {
      summary: stats.rows[0],
      nationalityDistribution: nationalityStats.rows,
      periodDistribution: centuryStats.rows
    };
  }

  /**
   * 미술관/갤러리 통계
   */
  async getVenueStats() {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN tier = 1 THEN 1 END) as tier_1,
        COUNT(CASE WHEN tier = 2 THEN 1 END) as tier_2,
        COUNT(CASE WHEN tier = 3 THEN 1 END) as tier_3,
        COUNT(CASE WHEN type = 'museum' THEN 1 END) as museums,
        COUNT(CASE WHEN type = 'gallery' THEN 1 END) as galleries,
        COUNT(CASE WHEN country = 'KR' THEN 1 END) as korean_venues
      FROM venues
    `);

    const cityStats = await pool.query(`
      SELECT city, type, COUNT(*) as count
      FROM venues
      WHERE is_active = true
      GROUP BY city, type
      ORDER BY count DESC
      LIMIT 15
    `);

    const exhibitionCounts = await pool.query(`
      SELECT 
        v.name,
        v.city,
        COUNT(e.id) as exhibition_count
      FROM venues v
      LEFT JOIN exhibitions e ON v.id = e.venue_id
      WHERE v.is_active = true
      GROUP BY v.id, v.name, v.city
      ORDER BY exhibition_count DESC
      LIMIT 10
    `);

    return {
      summary: stats.rows[0],
      cityTypeDistribution: cityStats.rows,
      topVenuesByExhibitions: exhibitionCounts.rows
    };
  }

  /**
   * 데이터 소스별 통계
   */
  async getDataSourceStats() {
    // API 동기화 상태
    const apiSyncStatus = await museumAPIService.getSyncStatus();

    // 문화포털 수집 상태
    const culturePortalStatus = await culturePortalIntegration.getCollectionStatus();

    // 크롤링 성공률
    const crawlingStats = await pool.query(`
      SELECT 
        source,
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
        MAX(last_updated) as last_successful
      FROM data_collection_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY source
    `);

    return {
      apiSync: apiSyncStatus,
      culturePortal: culturePortalStatus,
      crawling: crawlingStats.rows
    };
  }

  /**
   * 데이터 품질 메트릭
   */
  async getDataQualityMetrics() {
    // 전시 데이터 품질
    const exhibitionQuality = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN title IS NOT NULL AND title != '' THEN 1 END) as has_title,
        COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as has_description,
        COUNT(CASE WHEN start_date IS NOT NULL THEN 1 END) as has_start_date,
        COUNT(CASE WHEN end_date IS NOT NULL THEN 1 END) as has_end_date,
        COUNT(CASE WHEN venue_id IS NOT NULL THEN 1 END) as has_venue,
        COUNT(CASE WHEN source_url IS NOT NULL AND source_url != '' THEN 1 END) as has_source_url
      FROM exhibitions
    `);

    // 중복 데이터 확인
    const duplicates = await pool.query(`
      SELECT 
        COUNT(*) - COUNT(DISTINCT title, venue_name, start_date) as potential_duplicates
      FROM exhibitions
    `);

    // 이미지 품질
    const imageQuality = await pool.query(`
      SELECT 
        COUNT(*) as total_artworks,
        COUNT(CASE WHEN primary_image_url IS NOT NULL THEN 1 END) as with_primary_image,
        COUNT(CASE WHEN array_length(additional_images, 1) > 0 THEN 1 END) as with_additional_images
      FROM artworks_extended
    `);

    // 누락 필드 분석
    const missingFields = await pool.query(`
      SELECT 
        'exhibitions' as table_name,
        SUM(CASE WHEN title IS NULL OR title = '' THEN 1 ELSE 0 END) as missing_title,
        SUM(CASE WHEN description IS NULL OR description = '' THEN 1 ELSE 0 END) as missing_description,
        SUM(CASE WHEN start_date IS NULL THEN 1 ELSE 0 END) as missing_start_date,
        SUM(CASE WHEN venue_id IS NULL THEN 1 ELSE 0 END) as missing_venue
      FROM exhibitions
      
      UNION ALL
      
      SELECT 
        'artists' as table_name,
        SUM(CASE WHEN name IS NULL OR name = '' THEN 1 ELSE 0 END) as missing_name,
        SUM(CASE WHEN nationality IS NULL OR nationality = '' THEN 1 ELSE 0 END) as missing_nationality,
        SUM(CASE WHEN birth_year IS NULL THEN 1 ELSE 0 END) as missing_birth_year,
        0 as missing_venue
      FROM artists
    `);

    return {
      exhibitions: exhibitionQuality.rows[0],
      duplicates: duplicates.rows[0],
      images: imageQuality.rows[0],
      missingFields: missingFields.rows
    };
  }

  /**
   * 최근 활동 로그
   */
  async getRecentActivity() {
    const recentExhibitions = await pool.query(`
      SELECT title, venue_name, source, created_at
      FROM exhibitions
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const recentArtworks = await pool.query(`
      SELECT title, artist_display_name, api_source, last_synced
      FROM artworks_extended
      ORDER BY last_synced DESC NULLS LAST
      LIMIT 10
    `);

    const recentErrors = await pool.query(`
      SELECT source, error_message, created_at
      FROM error_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    return {
      exhibitions: recentExhibitions.rows,
      artworks: recentArtworks.rows,
      errors: recentErrors.rows
    };
  }

  /**
   * 시스템 건강 상태
   */
  async getSystemHealth() {
    // 데이터베이스 연결 상태
    const dbHealth = await this.checkDatabaseHealth();

    // API 상태 확인
    const apiHealth = await this.checkAPIHealth();

    // 디스크 사용량 (근사치)
    const storageStats = await pool.query(`
      SELECT 
        pg_database_size(current_database()) as db_size,
        COUNT(*) as total_records
      FROM exhibitions
    `);

    // 최근 수집 성공률
    const collectionHealth = await pool.query(`
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_attempts
      FROM data_collection_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours'
    `);

    return {
      database: dbHealth,
      apis: apiHealth,
      storage: storageStats.rows[0],
      collection: collectionHealth.rows[0],
      lastHealthCheck: new Date()
    };
  }

  /**
   * 데이터 수집 트리거
   */
  async triggerDataCollection(req, res) {
    try {
      const { sources = ['culture_portal', 'museum_apis', 'crawlers'] } = req.body;
      const results = {};

      if (sources.includes('culture_portal')) {
        logger.info('Triggering Culture Portal collection...');
        results.culturePortal = await culturePortalIntegration.collectDailyExhibitions();
      }

      if (sources.includes('museum_apis')) {
        logger.info('Triggering Museum API sync...');
        results.museumAPIs = await museumAPIService.syncAllMuseums();
      }

      if (sources.includes('crawlers')) {
        logger.info('Triggering enhanced exhibition collection...');
        results.crawlers = await enhancedExhibitionCollector.collectAllExhibitions();
      }

      res.json({
        success: true,
        message: 'Data collection triggered successfully',
        results
      });

    } catch (error) {
      logger.error('Data collection trigger error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 데이터 품질 리포트 생성
   */
  async generateQualityReport(req, res) {
    try {
      const report = {
        timestamp: new Date(),
        summary: await this.getDataQualityMetrics(),
        recommendations: await this.generateQualityRecommendations(),
        trends: await this.getQualityTrends()
      };

      res.json({
        success: true,
        data: report
      });

    } catch (error) {
      logger.error('Quality report generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 검색 및 필터링
   */
  async searchData(req, res) {
    try {
      const {
        type, // 'exhibitions', 'artworks', 'artists', 'venues'
        query,
        filters = {},
        page = 1,
        limit = 20
      } = req.query;

      const offset = (page - 1) * limit;
      let searchResults;

      switch (type) {
        case 'exhibitions':
          searchResults = await this.searchExhibitions(query, filters, limit, offset);
          break;
        case 'artworks':
          searchResults = await this.searchArtworks(query, filters, limit, offset);
          break;
        case 'artists':
          searchResults = await this.searchArtists(query, filters, limit, offset);
          break;
        case 'venues':
          searchResults = await this.searchVenues(query, filters, limit, offset);
          break;
        default:
          throw new Error('Invalid search type');
      }

      res.json({
        success: true,
        data: searchResults.results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: searchResults.total,
          pages: Math.ceil(searchResults.total / limit)
        }
      });

    } catch (error) {
      logger.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // 헬퍼 메서드들
  async checkDatabaseHealth() {
    try {
      await pool.query('SELECT 1');
      return { status: 'healthy', lastCheck: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, lastCheck: new Date() };
    }
  }

  async checkAPIHealth() {
    const apis = {
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
      culture_portal: process.env.CULTURE_API_KEY ? 'configured' : 'missing',
      naver: process.env.NAVER_CLIENT_ID ? 'configured' : 'missing',
      rijks: process.env.RIJKS_API_KEY ? 'configured' : 'missing'
    };

    return apis;
  }

  async generateQualityRecommendations() {
    const recommendations = [];

    // 데이터 품질 메트릭 기반 추천사항 생성 로직
    const qualityMetrics = await this.getDataQualityMetrics();

    if (qualityMetrics.duplicates.potential_duplicates > 10) {
      recommendations.push({
        priority: 'high',
        type: 'data_quality',
        message: `${qualityMetrics.duplicates.potential_duplicates}개의 중복 가능 전시가 발견되었습니다. 중복 제거 작업이 필요합니다.`
      });
    }

    return recommendations;
  }

  async getQualityTrends() {
    // 지난 30일간의 데이터 품질 변화 추이
    return [];
  }

  async searchExhibitions(query, filters, limit, offset) {
    // 전시 검색 로직
    return { results: [], total: 0 };
  }

  async searchArtworks(query, filters, limit, offset) {
    // 작품 검색 로직
    return { results: [], total: 0 };
  }

  async searchArtists(query, filters, limit, offset) {
    // 아티스트 검색 로직
    return { results: [], total: 0 };
  }

  async searchVenues(query, filters, limit, offset) {
    // 미술관 검색 로직
    return { results: [], total: 0 };
  }
}

module.exports = new ArtDataDashboardController();
