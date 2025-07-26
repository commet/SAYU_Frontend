const { pool } = require('../config/database');
const { logger } = require('../config/logger');
const EnhancedArtistCollectorService = require('../services/enhancedArtistCollectorService');
const PythonWikipediaService = require('../services/pythonWikipediaService');

/**
 * 아티스트 데이터 수집 및 관리 컨트롤러
 * 
 * 엔드포인트:
 * POST /api/artists/collect-single - 단일 아티스트 수집
 * POST /api/artists/collect-batch - 배치 아티스트 수집
 * POST /api/artists/collect-hybrid - 하이브리드 수집
 * GET /api/artists/collection-stats - 수집 통계
 * GET /api/artists/setup-guide - Python 환경 설정 가이드
 */

/**
 * 단일 아티스트 정보 수집
 */
exports.collectSingleArtist = async (req, res) => {
  try {
    const { artistName, method = 'enhanced', forceUpdate = false } = req.body;

    if (!artistName) {
      return res.status(400).json({ 
        error: 'Artist name is required',
        example: { artistName: 'Pablo Picasso' }
      });
    }

    logger.info(`🎨 단일 아티스트 수집 요청: ${artistName} (method: ${method})`);

    let result;

    switch (method) {
      case 'enhanced':
        // Node.js 향상된 수집기 사용
        result = await EnhancedArtistCollectorService.collectArtistInfo(artistName, { forceUpdate });
        break;

      case 'python':
        // Python Wikipedia API 사용
        result = await PythonWikipediaService.collectSingleArtist(artistName, { forceUpdate });
        break;

      case 'hybrid':
        // 하이브리드 수집 (Node.js + Python)
        result = await PythonWikipediaService.hybridArtistCollection(artistName, { forceUpdate });
        break;

      default:
        return res.status(400).json({ 
          error: 'Invalid collection method',
          validMethods: ['enhanced', 'python', 'hybrid']
        });
    }

    if (result && (result.id || result.success)) {
      res.json({
        success: true,
        method: method,
        artist: result,
        message: `Artist '${artistName}' collected successfully`
      });
    } else {
      res.status(404).json({
        success: false,
        method: method,
        error: result?.error || 'Artist not found or collection failed',
        artistName: artistName
      });
    }

  } catch (error) {
    logger.error('단일 아티스트 수집 실패', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * 배치 아티스트 수집
 */
exports.collectArtistsBatch = async (req, res) => {
  try {
    const { 
      artistNames, 
      method = 'enhanced', 
      batchSize = 10,
      delay = 2000,
      forceUpdate = false 
    } = req.body;

    if (!Array.isArray(artistNames) || artistNames.length === 0) {
      return res.status(400).json({ 
        error: 'Artist names array is required',
        example: { 
          artistNames: ['Pablo Picasso', 'Vincent van Gogh', 'Frida Kahlo'],
          method: 'hybrid',
          batchSize: 5
        }
      });
    }

    // 배치 크기 제한
    if (artistNames.length > 50) {
      return res.status(400).json({
        error: 'Batch size too large',
        maxSize: 50,
        provided: artistNames.length
      });
    }

    logger.info(`📦 배치 아티스트 수집 시작: ${artistNames.length}명 (method: ${method})`);

    // 클라이언트에 즉시 응답 (비동기 처리)
    res.json({
      success: true,
      message: 'Batch collection started',
      batchId: Date.now(),
      artistCount: artistNames.length,
      method: method,
      estimatedTime: `${Math.ceil(artistNames.length * delay / 1000 / 60)} minutes`
    });

    // 백그라운드에서 배치 처리 실행
    processBatchInBackground(artistNames, method, { batchSize, delay, forceUpdate });

  } catch (error) {
    logger.error('배치 아티스트 수집 실패', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * 배치 처리 백그라운드 실행
 */
async function processBatchInBackground(artistNames, method, options) {
  const startTime = Date.now();
  logger.info(`🚀 백그라운드 배치 처리 시작: ${artistNames.length}명`);

  try {
    let results;

    switch (method) {
      case 'enhanced':
        results = await EnhancedArtistCollectorService.collectArtistsBatch(artistNames, options);
        break;

      case 'python':
        results = await PythonWikipediaService.collectArtistsBatch(artistNames, options);
        break;

      case 'hybrid':
        // 하이브리드는 개별적으로 처리
        results = { successful: [], failed: [] };
        for (const artistName of artistNames) {
          try {
            const result = await PythonWikipediaService.hybridArtistCollection(artistName, options);
            results.successful.push({ name: artistName, data: result });
            
            // 지연 적용
            if (options.delay) {
              await new Promise(resolve => setTimeout(resolve, options.delay));
            }
          } catch (error) {
            results.failed.push({ name: artistName, error: error.message });
          }
        }
        break;

      default:
        throw new Error(`Invalid method: ${method}`);
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    logger.info(`✅ 백그라운드 배치 처리 완료: ${duration}초 소요`);
    logger.info(`📊 결과 - 성공: ${results.successful?.length || 0}, 실패: ${results.failed?.length || 0}`);

    // 결과를 로그 파일이나 별도 테이블에 저장할 수 있음
    await saveBatchResults({
      method,
      artistCount: artistNames.length,
      successCount: results.successful?.length || 0,
      failCount: results.failed?.length || 0,
      duration,
      results
    });

  } catch (error) {
    logger.error('백그라운드 배치 처리 실패', error);
  }
}

/**
 * 배치 결과 저장
 */
async function saveBatchResults(batchInfo) {
  try {
    const query = `
      INSERT INTO artist_collection_logs (
        method, artist_count, success_count, fail_count,
        duration_seconds, results, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    `;

    await pool.query(query, [
      batchInfo.method,
      batchInfo.artistCount,
      batchInfo.successCount,
      batchInfo.failCount,
      batchInfo.duration,
      JSON.stringify(batchInfo.results)
    ]);

    logger.info('배치 결과 로그 저장 완료');
  } catch (error) {
    logger.warn('배치 결과 로그 저장 실패', error.message);
  }
}

/**
 * 수집 통계 조회
 */
exports.getCollectionStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // 기본 30일

    const query = `
      SELECT 
        COUNT(*) as total_artists,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '${period} days' THEN 1 END) as recent_artists,
        COUNT(CASE WHEN bio IS NOT NULL THEN 1 END) as artists_with_bio,
        COUNT(CASE WHEN images IS NOT NULL AND images != '{}' THEN 1 END) as artists_with_images,
        COUNT(CASE WHEN birth_year IS NOT NULL THEN 1 END) as artists_with_birth_year,
        COUNT(CASE WHEN nationality IS NOT NULL THEN 1 END) as artists_with_nationality,
        COUNT(CASE WHEN copyright_status = 'public_domain' THEN 1 END) as public_domain_artists,
        COUNT(CASE WHEN copyright_status = 'contemporary' THEN 1 END) as contemporary_artists,
        COUNT(DISTINCT nationality) as unique_nationalities,
        COUNT(DISTINCT era) as unique_eras,
        AVG(CASE WHEN bio IS NOT NULL THEN length(bio) END) as avg_bio_length,
        MAX(created_at) as last_collected
      FROM artists
    `;

    const artistStats = await pool.query(query);

    // 수집 방법별 통계
    const methodStatsQuery = `
      SELECT 
        method,
        COUNT(*) as batch_count,
        SUM(artist_count) as total_processed,
        SUM(success_count) as total_successful,
        AVG(duration_seconds) as avg_duration
      FROM artist_collection_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY method
      ORDER BY batch_count DESC
    `;

    const methodStats = await pool.query(methodStatsQuery);

    // 일별 수집 통계
    const dailyStatsQuery = `
      SELECT 
        DATE(created_at) as collection_date,
        COUNT(*) as artists_collected
      FROM artists
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY DATE(created_at)
      ORDER BY collection_date DESC
      LIMIT 30
    `;

    const dailyStats = await pool.query(dailyStatsQuery);

    // 인기 국적 통계
    const nationalityStatsQuery = `
      SELECT 
        nationality,
        COUNT(*) as artist_count
      FROM artists
      WHERE nationality IS NOT NULL
      GROUP BY nationality
      ORDER BY artist_count DESC
      LIMIT 10
    `;

    const nationalityStats = await pool.query(nationalityStatsQuery);

    res.json({
      period: `${period} days`,
      overview: artistStats.rows[0],
      collectionMethods: methodStats.rows,
      dailyCollection: dailyStats.rows,
      topNationalities: nationalityStats.rows,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('수집 통계 조회 실패', error);
    res.status(500).json({
      error: 'Failed to fetch collection statistics',
      message: error.message
    });
  }
};

/**
 * Python 환경 설정 가이드
 */
exports.getSetupGuide = async (req, res) => {
  try {
    // Python 환경 확인
    const pythonAvailable = await PythonWikipediaService.checkPythonEnvironment();
    const installGuide = PythonWikipediaService.getInstallationGuide();

    res.json({
      pythonEnvironment: {
        available: pythonAvailable,
        status: pythonAvailable ? 'Ready' : 'Setup Required'
      },
      installationGuide: installGuide,
      collectionMethods: {
        enhanced: {
          description: 'Node.js 기반 다중 소스 수집',
          sources: ['Wikipedia REST API', 'Wikidata SPARQL', 'DBpedia', 'Museum APIs'],
          advantages: ['빠른 실행', '내장 AI 분석', '감정 시그니처 생성'],
          recommended: 'Quick collection with AI enhancement'
        },
        python: {
          description: 'Python Wikipedia-API 기반 정밀 수집',
          sources: ['Wikipedia-API', 'Wikidata', 'Korean Wikipedia'],
          advantages: ['정확한 파싱', '다국어 지원', '상세한 메타데이터'],
          recommended: 'Detailed biographical information'
        },
        hybrid: {
          description: '하이브리드 수집 (Node.js + Python)',
          sources: ['All above combined'],
          advantages: ['최고 정확도', '완성도 높은 데이터', '중복 제거'],
          recommended: 'Best quality data for important artists'
        }
      },
      examples: {
        singleArtist: {
          method: 'POST',
          url: '/api/artists/collect-single',
          body: {
            artistName: 'Pablo Picasso',
            method: 'hybrid',
            forceUpdate: false
          }
        },
        batchCollection: {
          method: 'POST',
          url: '/api/artists/collect-batch',
          body: {
            artistNames: ['Frida Kahlo', 'Vincent van Gogh', 'Georgia O\'Keeffe'],
            method: 'enhanced',
            batchSize: 10,
            delay: 2000
          }
        }
      }
    });

  } catch (error) {
    logger.error('설정 가이드 조회 실패', error);
    res.status(500).json({
      error: 'Failed to fetch setup guide',
      message: error.message
    });
  }
};

/**
 * 아티스트 검색 및 추천
 */
exports.searchArtists = async (req, res) => {
  try {
    const { 
      query, 
      nationality, 
      era, 
      limit = 20, 
      offset = 0,
      sortBy = 'relevance' 
    } = req.query;

    if (!query) {
      return res.status(400).json({ 
        error: 'Search query is required' 
      });
    }

    let baseQuery = `
      SELECT 
        id, name, name_ko, birth_year, death_year,
        nationality, nationality_ko, era, copyright_status,
        images, follow_count, is_featured,
        CASE 
          WHEN LOWER(name) = LOWER($1) THEN 100
          WHEN LOWER(name) LIKE LOWER($1 || '%') THEN 90
          WHEN LOWER(name) LIKE LOWER('%' || $1 || '%') THEN 80
          WHEN LOWER(name_ko) LIKE LOWER('%' || $1 || '%') THEN 70
          ELSE 50
        END as relevance_score
      FROM artists
      WHERE (
        LOWER(name) LIKE LOWER('%' || $1 || '%') OR
        LOWER(name_ko) LIKE LOWER('%' || $1 || '%') OR
        LOWER(bio) LIKE LOWER('%' || $1 || '%')
      )
    `;

    const params = [query];
    let paramIndex = 2;

    if (nationality) {
      baseQuery += ` AND LOWER(nationality) = LOWER($${paramIndex})`;
      params.push(nationality);
      paramIndex++;
    }

    if (era) {
      baseQuery += ` AND LOWER(era) = LOWER($${paramIndex})`;
      params.push(era);
      paramIndex++;
    }

    // 정렬
    switch (sortBy) {
      case 'relevance':
        baseQuery += ` ORDER BY relevance_score DESC, follow_count DESC`;
        break;
      case 'popularity':
        baseQuery += ` ORDER BY follow_count DESC, relevance_score DESC`;
        break;
      case 'alphabetical':
        baseQuery += ` ORDER BY name ASC`;
        break;
      case 'chronological':
        baseQuery += ` ORDER BY birth_year ASC NULLS LAST`;
        break;
      default:
        baseQuery += ` ORDER BY relevance_score DESC`;
    }

    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(baseQuery, params);

    // 총 개수 조회
    let countQuery = `
      SELECT COUNT(*) as total
      FROM artists
      WHERE (
        LOWER(name) LIKE LOWER('%' || $1 || '%') OR
        LOWER(name_ko) LIKE LOWER('%' || $1 || '%') OR
        LOWER(bio) LIKE LOWER('%' || $1 || '%')
      )
    `;

    const countParams = [query];
    let countParamIndex = 2;

    if (nationality) {
      countQuery += ` AND LOWER(nationality) = LOWER($${countParamIndex})`;
      countParams.push(nationality);
      countParamIndex++;
    }

    if (era) {
      countQuery += ` AND LOWER(era) = LOWER($${countParamIndex})`;
      countParams.push(era);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      query: query,
      filters: { nationality, era, sortBy },
      results: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < parseInt(countResult.rows[0].total)
      }
    });

  } catch (error) {
    logger.error('아티스트 검색 실패', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
};

/**
 * 데이터 품질 리포트
 */
exports.getDataQualityReport = async (req, res) => {
  try {
    const qualityQuery = `
      SELECT 
        COUNT(*) as total_artists,
        
        -- 완성도 지표
        COUNT(CASE WHEN name IS NOT NULL THEN 1 END) as has_name,
        COUNT(CASE WHEN bio IS NOT NULL AND length(bio) > 50 THEN 1 END) as has_meaningful_bio,
        COUNT(CASE WHEN birth_year IS NOT NULL THEN 1 END) as has_birth_year,
        COUNT(CASE WHEN death_year IS NOT NULL THEN 1 END) as has_death_year,
        COUNT(CASE WHEN nationality IS NOT NULL THEN 1 END) as has_nationality,
        COUNT(CASE WHEN images IS NOT NULL AND images != '{}' THEN 1 END) as has_images,
        
        -- 품질 점수 계산
        AVG(
          CASE WHEN name IS NOT NULL THEN 20 ELSE 0 END +
          CASE WHEN bio IS NOT NULL AND length(bio) > 50 THEN 25 ELSE 0 END +
          CASE WHEN birth_year IS NOT NULL THEN 15 ELSE 0 END +
          CASE WHEN nationality IS NOT NULL THEN 15 ELSE 0 END +
          CASE WHEN images IS NOT NULL AND images != '{}' THEN 15 ELSE 0 END +
          CASE WHEN sources IS NOT NULL AND sources != '{}' THEN 10 ELSE 0 END
        ) as avg_quality_score,
        
        -- 소스 다양성
        COUNT(CASE WHEN sources::text LIKE '%wikipedia%' THEN 1 END) as from_wikipedia,
        COUNT(CASE WHEN sources::text LIKE '%wikidata%' THEN 1 END) as from_wikidata,
        COUNT(CASE WHEN sources::text LIKE '%museums%' THEN 1 END) as from_museums,
        
        -- 신선도
        COUNT(CASE WHEN updated_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as updated_week,
        COUNT(CASE WHEN updated_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as updated_month
        
      FROM artists
    `;

    const qualityResult = await pool.query(qualityQuery);

    // 문제가 있는 아티스트들
    const issuesQuery = `
      SELECT 
        'Missing Biography' as issue_type,
        COUNT(*) as artist_count
      FROM artists 
      WHERE bio IS NULL OR length(bio) < 50
      
      UNION ALL
      
      SELECT 
        'Missing Birth Year' as issue_type,
        COUNT(*) as artist_count
      FROM artists 
      WHERE birth_year IS NULL
      
      UNION ALL
      
      SELECT 
        'Missing Nationality' as issue_type,
        COUNT(*) as artist_count
      FROM artists 
      WHERE nationality IS NULL
      
      UNION ALL
      
      SELECT 
        'No Images' as issue_type,
        COUNT(*) as artist_count
      FROM artists 
      WHERE images IS NULL OR images = '{}'
      
      ORDER BY artist_count DESC
    `;

    const issuesResult = await pool.query(issuesQuery);

    const quality = qualityResult.rows[0];
    const total = parseInt(quality.total_artists);

    res.json({
      overview: {
        totalArtists: total,
        averageQualityScore: Math.round(parseFloat(quality.avg_quality_score)),
        completenessRating: total > 0 ? Math.round(
          (parseInt(quality.has_meaningful_bio) + 
           parseInt(quality.has_birth_year) + 
           parseInt(quality.has_nationality) + 
           parseInt(quality.has_images)) / (total * 4) * 100
        ) : 0
      },
      
      completeness: {
        biography: {
          count: parseInt(quality.has_meaningful_bio),
          percentage: total > 0 ? Math.round(parseInt(quality.has_meaningful_bio) / total * 100) : 0
        },
        birthYear: {
          count: parseInt(quality.has_birth_year),
          percentage: total > 0 ? Math.round(parseInt(quality.has_birth_year) / total * 100) : 0
        },
        nationality: {
          count: parseInt(quality.has_nationality),
          percentage: total > 0 ? Math.round(parseInt(quality.has_nationality) / total * 100) : 0
        },
        images: {
          count: parseInt(quality.has_images),
          percentage: total > 0 ? Math.round(parseInt(quality.has_images) / total * 100) : 0
        }
      },
      
      sources: {
        wikipedia: parseInt(quality.from_wikipedia),
        wikidata: parseInt(quality.from_wikidata),
        museums: parseInt(quality.from_museums)
      },
      
      freshness: {
        updatedThisWeek: parseInt(quality.updated_week),
        updatedThisMonth: parseInt(quality.updated_month)
      },
      
      issues: issuesResult.rows,
      
      recommendations: [
        quality.has_meaningful_bio / total < 0.7 ? 'Focus on collecting biographical information' : null,
        quality.has_images / total < 0.5 ? 'Improve image collection from multiple sources' : null,
        quality.has_nationality / total < 0.8 ? 'Enhance nationality data collection' : null,
        quality.updated_month / total < 0.3 ? 'Update stale artist records' : null
      ].filter(Boolean),
      
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('데이터 품질 리포트 생성 실패', error);
    res.status(500).json({
      error: 'Failed to generate data quality report',
      message: error.message
    });
  }
};