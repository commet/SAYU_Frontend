const { Pool } = require('pg');
const axios = require('axios');
const pLimit = require('p-limit');
const ArtworkAnalyzer = require('./lib/artwork-analyzer');
const PerformanceMonitor = require('./lib/performance-monitor');
const SAYUIntegration = require('./lib/sayu-integration');
require('dotenv').config();

/**
 * 마스터 크롤러
 * 모든 크롤링 컴포넌트를 통합 관리하는 메인 시스템
 */
class MasterCrawler {
  constructor(options = {}) {
    // 설정
    this.config = {
      databaseUrl: process.env.DATABASE_URL,
      concurrency: options.concurrency || 3,
      delayMs: options.delayMs || 2500,
      batchSize: options.batchSize || 50,
      maxRetries: options.maxRetries || 3,
      enableAnalysis: options.enableAnalysis !== false,
      enableMonitoring: options.enableMonitoring !== false
    };
    
    // 데이터베이스 연결
    this.pool = new Pool({
      connectionString: this.config.databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // 컴포넌트 초기화
    this.analyzer = new ArtworkAnalyzer();
    this.monitor = new PerformanceMonitor({
      maxMemory: 1024 * 1024 * 1024, // 1GB
      maxErrorRate: 0.1,
      autoOptimize: true
    });
    this.sayuIntegration = new SAYUIntegration(this.config.databaseUrl);
    
    // 동시성 제한
    this.limit = pLimit(this.config.concurrency);
    
    // 상태
    this.state = {
      phase: 'idle', // idle, collecting, crawling, analyzing, complete
      progress: {
        total: 0,
        completed: 0,
        failed: 0
      },
      startTime: null,
      endTime: null
    };
  }

  /**
   * 전체 파이프라인 실행
   */
  async runFullPipeline(options = {}) {
    console.log('🚀 SAYU Artvee Master Crawler 시작\n');
    
    try {
      // 모니터링 시작
      if (this.config.enableMonitoring) {
        this.monitor.start();
        this.setupMonitoringListeners();
      }
      
      this.state.startTime = Date.now();
      this.state.phase = 'collecting';
      
      // 1단계: URL 수집
      console.log('📋 1단계: URL 수집');
      const collectionResult = await this.collectUrls(options);
      console.log(`   ✅ ${collectionResult.count}개 URL 수집 완료\n`);
      
      // 2단계: 메타데이터 크롤링
      console.log('🔍 2단계: 메타데이터 크롤링');
      this.state.phase = 'crawling';
      const crawlResult = await this.crawlMetadata(options);
      console.log(`   ✅ ${crawlResult.successful}개 크롤링 완료\n`);
      
      // 3단계: 이미지 분석 및 APT 태깅
      if (this.config.enableAnalysis) {
        console.log('🎨 3단계: 이미지 분석 및 APT 태깅');
        this.state.phase = 'analyzing';
        const analysisResult = await this.analyzeArtworks(options);
        console.log(`   ✅ ${analysisResult.successful}개 분석 완료\n`);
      }
      
      // 4단계: 품질 검증 및 최적화
      console.log('✨ 4단계: 품질 검증 및 최적화');
      const optimizationResult = await this.optimizeCollection();
      console.log(`   ✅ 최적화 완료\n`);
      
      // 5단계: SAYU 플랫폼 통합 준비
      console.log('🔗 5단계: SAYU 플랫폼 통합 준비');
      const integrationResult = await this.prepareForIntegration();
      console.log(`   ✅ 통합 준비 완료\n`);
      
      this.state.phase = 'complete';
      this.state.endTime = Date.now();
      
      // 최종 보고서
      const report = await this.generateFinalReport();
      console.log(this.formatFinalReport(report));
      
      return report;
      
    } catch (error) {
      console.error('❌ 파이프라인 실행 중 오류:', error);
      throw error;
    } finally {
      if (this.config.enableMonitoring) {
        this.monitor.stop();
      }
      await this.cleanup();
    }
  }

  /**
   * URL 수집 단계
   */
  async collectUrls(options) {
    const { 
      useExisting = false,
      targetCount = 1000 
    } = options;
    
    if (useExisting) {
      // 기존 URL 사용
      const result = await this.pool.query(
        'SELECT COUNT(*) FROM artvee_artworks WHERE processing_status = $1',
        ['url_collected']
      );
      return { count: parseInt(result.rows[0].count) };
    }
    
    // 새로운 URL 수집 (collect-urls-final.js 로직 통합)
    console.log('   🌐 Sitemap에서 URL 수집 중...');
    
    // TODO: collect-urls-final.js의 로직을 여기에 통합
    // 지금은 간단히 DB에서 확인만
    const result = await this.pool.query(
      'SELECT COUNT(*) FROM artvee_artworks'
    );
    
    return { count: parseInt(result.rows[0].count) };
  }

  /**
   * 메타데이터 크롤링 단계
   */
  async crawlMetadata(options) {
    const { limit = null, skipCrawled = true } = options;
    
    // 크롤링 대상 조회
    let query = `
      SELECT id, artvee_id, artvee_url 
      FROM artvee_artworks 
      WHERE is_active = true
    `;
    
    if (skipCrawled) {
      query += ` AND processing_status IN ('url_collected', 'pending')`;
    }
    
    query += ` ORDER BY created_at DESC`;
    if (limit) query += ` LIMIT ${limit}`;
    
    const result = await this.pool.query(query);
    const artworks = result.rows;
    
    console.log(`   📊 크롤링 대상: ${artworks.length}개`);
    
    this.state.progress.total = artworks.length;
    this.state.progress.completed = 0;
    this.state.progress.failed = 0;
    
    // 배치 처리
    const batchSize = this.config.batchSize;
    const results = { successful: 0, failed: 0 };
    
    for (let i = 0; i < artworks.length; i += batchSize) {
      const batch = artworks.slice(i, i + batchSize);
      console.log(`\n   배치 ${Math.floor(i/batchSize) + 1}/${Math.ceil(artworks.length/batchSize)} 처리 중...`);
      
      const batchPromises = batch.map(artwork =>
        this.limit(() => this.crawlSingleArtwork(artwork))
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          results.successful++;
          this.state.progress.completed++;
        } else {
          results.failed++;
          this.state.progress.failed++;
        }
      });
      
      // 진행률 표시
      const progress = Math.round((i + batch.length) / artworks.length * 100);
      console.log(`   진행률: ${progress}% (성공: ${results.successful}, 실패: ${results.failed})`);
      
      // 모니터링 이벤트
      if (this.monitor) {
        this.monitor.emit('progress', {
          phase: 'crawling',
          progress: progress,
          stats: results
        });
      }
    }
    
    return results;
  }

  /**
   * 단일 작품 크롤링
   */
  async crawlSingleArtwork(artwork) {
    const request = this.monitor ? 
      this.monitor.recordRequestStart(artwork.id, artwork.artvee_url) : 
      { startTime: Date.now() };
    
    try {
      // 페이지 다운로드
      const response = await axios.get(artwork.artvee_url, {
        headers: {
          'User-Agent': 'SAYU-Bot/1.0 (Educational Art Platform)',
          'Accept': 'text/html,application/xhtml+xml'
        },
        timeout: 30000
      });
      
      // 메타데이터 추출 (crawler.js 로직 사용)
      const metadata = this.extractMetadata(response.data, artwork.artvee_url);
      
      // DB 업데이트
      await this.updateArtworkMetadata(artwork.id, metadata);
      
      if (this.monitor) {
        this.monitor.recordRequestComplete(request, true, response.data.length);
      }
      
      // 딜레이
      await this.sleep(this.config.delayMs);
      
      return { success: true, id: artwork.id };
      
    } catch (error) {
      if (this.monitor) {
        this.monitor.recordRequestComplete(request, false);
        this.monitor.recordError(error, { artworkId: artwork.id });
      }
      
      // 재시도 로직
      if (artwork.retryCount < this.config.maxRetries) {
        artwork.retryCount = (artwork.retryCount || 0) + 1;
        await this.sleep(this.config.delayMs * 2);
        return this.crawlSingleArtwork(artwork);
      }
      
      return { success: false, id: artwork.id, error: error.message };
    }
  }

  /**
   * 메타데이터 추출 (cheerio 사용)
   */
  extractMetadata(html, url) {
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    
    // 기본 crawler.js의 추출 로직 재사용
    const metadata = {
      title: $('h1').first().text().trim() || 
             $('meta[property="og:title"]').attr('content'),
      artist: this.extractArtist($),
      year: this.extractYear($),
      imageUrl: $('meta[property="og:image"]').attr('content'),
      description: $('.artwork-description').text().trim()
    };
    
    return metadata;
  }

  extractArtist($) {
    const artistLink = $('a[href*="/artist/"]').first().text().trim();
    if (artistLink) return artistLink;
    
    const patterns = [
      $('.artist-name'),
      $('.artwork-artist'),
      $('p:contains("Artist:")')
    ];
    
    for (const pattern of patterns) {
      const text = pattern.text ? pattern.text().trim() : '';
      if (text) return text.replace('Artist:', '').trim();
    }
    
    return null;
  }

  extractYear($) {
    const text = $('body').text();
    const datePatterns = [
      /\b(c\.\s*1[0-9]{3})\b/,
      /\b(1[0-9]{3})\b/,
      /\b([0-9]{1,2}th century)\b/
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    
    return null;
  }

  /**
   * 작품 메타데이터 업데이트
   */
  async updateArtworkMetadata(artworkId, metadata) {
    await this.pool.query(`
      UPDATE artvee_artworks
      SET 
        title = COALESCE($2, title),
        artist = COALESCE($3, artist),
        year_created = COALESCE($4, year_created),
        cdn_url = COALESCE($5, cdn_url),
        description = COALESCE($6, description),
        processing_status = 'crawled',
        updated_at = NOW()
      WHERE id = $1
    `, [
      artworkId,
      metadata.title,
      metadata.artist,
      metadata.year,
      metadata.imageUrl,
      metadata.description
    ]);
  }

  /**
   * 이미지 분석 단계
   */
  async analyzeArtworks(options) {
    const { limit = 100, onlyHighQuality = true } = options;
    
    console.log('   🎨 이미지 분석을 위한 작품 로드 중...');
    
    // 분석 대상 조회
    let query = `
      SELECT id, cdn_url, title, artist
      FROM artvee_artworks
      WHERE 
        processing_status = 'crawled'
        AND cdn_url IS NOT NULL
        AND is_active = true
    `;
    
    if (onlyHighQuality) {
      query += ` AND (
        cdn_url LIKE '%high%' OR 
        cdn_url LIKE '%large%' OR
        cdn_url NOT LIKE '%thumb%'
      )`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT ${limit}`;
    
    const result = await this.pool.query(query);
    const artworks = result.rows;
    
    console.log(`   📊 분석 대상: ${artworks.length}개`);
    
    const results = { successful: 0, failed: 0 };
    
    // 배치 분석
    for (let i = 0; i < artworks.length; i += 10) {
      const batch = artworks.slice(i, i + 10);
      
      const batchPromises = batch.map(artwork =>
        this.sayuIntegration.analyzeAndTagArtwork(artwork.id)
          .catch(error => ({ success: false, error: error.message }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) results.successful++;
        else results.failed++;
      });
      
      // 진행률
      const progress = Math.round((i + batch.length) / artworks.length * 100);
      console.log(`   분석 진행률: ${progress}%`);
      
      // API 제한 고려
      await this.sleep(2000);
    }
    
    return results;
  }

  /**
   * 컬렉션 최적화
   */
  async optimizeCollection() {
    console.log('   🔧 품질 기준 적용 중...');
    
    // 저품질 작품 비활성화
    const deactivateResult = await this.pool.query(`
      UPDATE artvee_artworks
      SET is_active = false
      WHERE 
        image_quality_score < 0.5
        OR cdn_url IS NULL
        OR title IS NULL
      RETURNING id
    `);
    
    console.log(`   - ${deactivateResult.rowCount}개 저품질 작품 제외`);
    
    // APT 균형 확인
    const balanceResult = await this.pool.query(`
      SELECT 
        unnest(personality_tags) as apt_type,
        COUNT(*) as count
      FROM artvee_artworks
      WHERE is_active = true
      GROUP BY apt_type
      ORDER BY count DESC
    `);
    
    console.log('   - APT 분포:');
    balanceResult.rows.forEach(row => {
      console.log(`     ${row.apt_type}: ${row.count}개`);
    });
    
    // 중복 제거
    const duplicateResult = await this.pool.query(`
      WITH duplicates AS (
        SELECT 
          id,
          ROW_NUMBER() OVER (
            PARTITION BY artist, title 
            ORDER BY image_quality_score DESC, created_at ASC
          ) as rn
        FROM artvee_artworks
        WHERE artist IS NOT NULL AND title IS NOT NULL
      )
      UPDATE artvee_artworks
      SET is_active = false
      WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
      )
      RETURNING id
    `);
    
    console.log(`   - ${duplicateResult.rowCount}개 중복 작품 제거`);
    
    return {
      deactivated: deactivateResult.rowCount,
      duplicatesRemoved: duplicateResult.rowCount,
      aptBalance: balanceResult.rows
    };
  }

  /**
   * SAYU 통합 준비
   */
  async prepareForIntegration() {
    // 추천 캐시 생성
    console.log('   📦 APT별 추천 캐시 생성 중...');
    
    const aptTypes = [
      'INTJ', 'INTP', 'ENTJ', 'ENTP',
      'INFJ', 'INFP', 'ENFJ', 'ENFP',
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
      'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ];
    
    for (const aptType of aptTypes) {
      try {
        const recommendations = await this.sayuIntegration.getPersonalizedRecommendations(
          aptType,
          { limit: 50 }
        );
        console.log(`   - ${aptType}: ${recommendations.length}개 추천 생성`);
      } catch (error) {
        console.error(`   - ${aptType}: 실패 - ${error.message}`);
      }
    }
    
    // 갤러리 경로 샘플 생성
    console.log('   🎨 갤러리 경로 샘플 생성 중...');
    
    const samplePath = await this.sayuIntegration.generatePersonalizedGalleryPath(
      'INFP',
      { duration: 30 }
    );
    
    console.log(`   - 샘플 경로: ${samplePath.sections.length}개 섹션`);
    
    // 통계 생성
    const stats = await this.pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN processing_status = 'processed' THEN 1 END) as processed,
        COUNT(DISTINCT artist) as artists,
        COUNT(DISTINCT period) as periods,
        AVG(image_quality_score) as avg_quality
      FROM artvee_artworks
      WHERE is_active = true
    `);
    
    return {
      recommendationsGenerated: aptTypes.length,
      samplePathCreated: true,
      statistics: stats.rows[0]
    };
  }

  /**
   * 모니터링 이벤트 설정
   */
  setupMonitoringListeners() {
    this.monitor.on('alert', (alert) => {
      console.warn(`\n⚠️ 성능 알림: ${alert.type}`);
      console.warn(`   세부사항:`, alert.details);
    });
    
    this.monitor.on('optimization', (settings) => {
      console.log(`\n🔧 성능 최적화 적용:`);
      console.log(`   - 동시 실행: ${settings.concurrencyLevel}`);
      console.log(`   - 요청 지연: ${settings.requestDelay}ms`);
      
      // 설정 업데이트
      this.config.concurrency = settings.concurrencyLevel;
      this.config.delayMs = settings.requestDelay;
      this.limit = pLimit(settings.concurrencyLevel);
    });
  }

  /**
   * 최종 보고서 생성
   */
  async generateFinalReport() {
    const duration = this.state.endTime - this.state.startTime;
    
    // DB 통계
    const dbStats = await this.pool.query(`
      SELECT 
        COUNT(*) as total_artworks,
        COUNT(CASE WHEN is_active THEN 1 END) as active_artworks,
        COUNT(CASE WHEN processing_status = 'processed' THEN 1 END) as fully_processed,
        COUNT(DISTINCT artist) as unique_artists,
        COUNT(DISTINCT period) as unique_periods,
        COUNT(DISTINCT unnest(personality_tags)) as apt_coverage,
        AVG(image_quality_score) as avg_quality_score
      FROM artvee_artworks
    `);
    
    const stats = dbStats.rows[0];
    
    // 성능 보고서
    const performanceReport = this.monitor ? 
      await this.monitor.generateReport() : 
      null;
    
    return {
      summary: {
        duration: Math.round(duration / 1000) + ' seconds',
        startTime: new Date(this.state.startTime).toISOString(),
        endTime: new Date(this.state.endTime).toISOString(),
        finalPhase: this.state.phase
      },
      results: {
        totalArtworks: parseInt(stats.total_artworks),
        activeArtworks: parseInt(stats.active_artworks),
        fullyProcessed: parseInt(stats.fully_processed),
        uniqueArtists: parseInt(stats.unique_artists),
        uniquePeriods: parseInt(stats.unique_periods),
        aptCoverage: parseInt(stats.apt_coverage),
        avgQualityScore: parseFloat(stats.avg_quality_score || 0).toFixed(2)
      },
      performance: performanceReport,
      recommendations: {
        nextSteps: [
          stats.fully_processed < stats.active_artworks ? 
            '추가 이미지 분석 필요' : null,
          stats.apt_coverage < 16 ? 
            'APT 태깅 보강 필요' : null,
          parseFloat(stats.avg_quality_score) < 0.7 ? 
            '품질 기준 재검토 필요' : null
        ].filter(Boolean)
      }
    };
  }

  /**
   * 보고서 포맷팅
   */
  formatFinalReport(report) {
    return `
=====================================
      SAYU Artvee 크롤링 완료
=====================================

📊 요약
  • 소요 시간: ${report.summary.duration}
  • 시작: ${report.summary.startTime}
  • 종료: ${report.summary.endTime}

📈 결과
  • 총 작품 수: ${report.results.totalArtworks.toLocaleString()}
  • 활성 작품: ${report.results.activeArtworks.toLocaleString()}
  • 완전 처리: ${report.results.fullyProcessed.toLocaleString()}
  • 작가 수: ${report.results.uniqueArtists.toLocaleString()}명
  • 시대: ${report.results.uniquePeriods}개
  • APT 커버리지: ${report.results.aptCoverage}/16
  • 평균 품질: ${report.results.avgQualityScore}

${report.performance ? `
⚡ 성능
  • 처리율: ${report.performance.summary.successRate}
  • 평균 응답시간: ${report.performance.performance.avgResponseTime}
  • 처리량: ${report.performance.performance.throughput}
  • 오류율: ${report.performance.errors.rate}
` : ''}

💡 다음 단계
${report.recommendations.nextSteps.map(step => `  • ${step}`).join('\n')}

=====================================
`;
  }

  /**
   * 정리 작업
   */
  async cleanup() {
    await this.pool.end();
    console.log('\n🔌 연결 종료 완료');
  }

  /**
   * 유틸리티: 슬립
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI 실행
if (require.main === module) {
  const crawler = new MasterCrawler({
    concurrency: 3,
    delayMs: 2500,
    enableAnalysis: true,
    enableMonitoring: true
  });
  
  // 명령줄 옵션
  const args = process.argv.slice(2);
  const options = {
    useExisting: args.includes('--use-existing'),
    limit: args.find(a => a.startsWith('--limit='))?.split('=')[1],
    skipAnalysis: args.includes('--skip-analysis')
  };
  
  console.log('🎯 SAYU Artvee Master Crawler v1.0\n');
  console.log('옵션:', options);
  console.log('');
  
  crawler.runFullPipeline(options)
    .then(report => {
      console.log('\n✅ 크롤링 파이프라인 완료!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 크롤링 실패:', error);
      process.exit(1);
    });
}

module.exports = MasterCrawler;