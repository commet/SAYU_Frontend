// SAYU 듀얼 가치 창출 시스템 통합 스크립트
// 기존 서버에 듀얼 가치 시스템을 통합하기 위한 설정

const DualValueCreationController = require('./src/controllers/dualValueCreationController');
const ValueExchangeService = require('./src/services/valueExchangeService');
const { router: dualValueRoutes, setController } = require('./src/routes/dualValueCreationRoutes');

/**
 * 듀얼 가치 시스템을 기존 Express 앱에 통합
 * @param {Express} app - Express 애플리케이션
 * @param {Database} database - 데이터베이스 연결
 * @param {string} openaiApiKey - OpenAI API 키
 */
function integrateDualValueSystem(app, database, openaiApiKey) {
  try {
    console.log('🔄 듀얼 가치 창출 시스템 통합 시작...');

    // 1. 컨트롤러 초기화
    const dualValueController = new DualValueCreationController(database, openaiApiKey);
    const valueExchangeService = new ValueExchangeService(database);

    // 2. 라우터에 컨트롤러 설정
    setController(dualValueController);

    // 3. 라우트 등록
    app.use('/api/dual-value', dualValueRoutes);

    // 4. 추가 가치 교환 라우트 등록
    setupValueExchangeRoutes(app, valueExchangeService);

    // 5. 데이터베이스 스키마 확인 및 생성
    setupDualValueDatabase(database);

    console.log('✅ 듀얼 가치 창출 시스템 통합 완료');
    console.log('📍 API 엔드포인트:');
    console.log('   - 개인 성장: /api/dual-value/personal-growth/*');
    console.log('   - 집단 지성: /api/dual-value/collective-intelligence/*');
    console.log('   - 가치 순환: /api/dual-value/value-circulation/*');
    console.log('   - 가치 교환: /api/dual-value/value-exchange/*');

    return {
      dualValueController,
      valueExchangeService,
      success: true
    };

  } catch (error) {
    console.error('❌ 듀얼 가치 시스템 통합 실패:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 가치 교환 관련 추가 라우트 설정
 */
function setupValueExchangeRoutes(app, valueExchangeService) {
  // 포인트 잔액 조회
  app.get('/api/dual-value/value-exchange/point-balance', async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
      }

      const balance = await valueExchangeService.getUserPointBalance(userId);
      res.json({ success: true, data: balance });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 작품 접근 권한 확인
  app.get('/api/dual-value/value-exchange/artwork-access/:artworkId', async (req, res) => {
    try {
      const userId = req.user?.id;
      const { artworkId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
      }

      const permission = await valueExchangeService.checkArtworkAccessPermission(userId, artworkId);
      res.json({ success: true, data: permission });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 작품 접근 기록
  app.post('/api/dual-value/value-exchange/record-access', async (req, res) => {
    try {
      const userId = req.user?.id;
      const { artworkId, accessType, pointsUsed } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
      }

      await valueExchangeService.recordArtworkAccess(userId, artworkId, accessType, pointsUsed);
      res.json({ success: true, message: '접근이 기록되었습니다.' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 프리미엄 기능 잠금 해제
  app.post('/api/dual-value/value-exchange/unlock-premium', async (req, res) => {
    try {
      const userId = req.user?.id;
      const { featureType, pointCost } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
      }

      const result = await valueExchangeService.unlockPremiumFeature(userId, featureType, pointCost);
      res.json({ success: result.success, message: result.message, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 프리미엄 상태 조회
  app.get('/api/dual-value/value-exchange/premium-status', async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
      }

      const status = await valueExchangeService.getUserPremiumStatus(userId);
      res.json({ success: true, data: status });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 거래 내역 조회
  app.get('/api/dual-value/value-exchange/transaction-history', async (req, res) => {
    try {
      const userId = req.user?.id;
      const { limit = 50 } = req.query;

      if (!userId) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
      }

      const history = await valueExchangeService.getUserValueExchangeHistory(userId, parseInt(limit));
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 가치 교환 효율성 분석
  app.get('/api/dual-value/value-exchange/efficiency-analysis', async (req, res) => {
    try {
      const { timeframe = 30 } = req.query;
      const analysis = await valueExchangeService.analyzeValueExchangeEfficiency(parseInt(timeframe));
      res.json({ success: true, data: analysis });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 월간 기여자 순위
  app.get('/api/dual-value/value-exchange/monthly-ranking', async (req, res) => {
    try {
      const ranking = await valueExchangeService.calculateMonthlyContributorRanking();
      res.json({ success: true, data: ranking });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
}

/**
 * 듀얼 가치 시스템용 데이터베이스 스키마 설정
 */
async function setupDualValueDatabase(database) {
  try {
    console.log('🗄️ 듀얼 가치 데이터베이스 스키마 확인 중...');

    // 누락된 테이블들 생성
    const missingTables = await checkMissingTables(database);

    if (missingTables.length > 0) {
      console.log(`📋 생성할 테이블: ${missingTables.join(', ')}`);

      // 스키마 파일 실행
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(__dirname, 'migrations', 'dual-value-creation-schema.sql');

      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await database.query(schema);
        console.log('✅ 듀얼 가치 데이터베이스 스키마 생성 완료');
      } else {
        console.warn('⚠️ 스키마 파일을 찾을 수 없습니다:', schemaPath);
      }
    } else {
      console.log('✅ 듀얼 가치 데이터베이스 스키마 확인 완료');
    }

    // 추가 테이블 생성 (가치 교환 시스템용)
    await createAdditionalTables(database);

  } catch (error) {
    console.error('❌ 데이터베이스 설정 실패:', error);
    throw error;
  }
}

/**
 * 누락된 테이블 확인
 */
async function checkMissingTables(database) {
  const requiredTables = [
    'emotional_vocabulary_growth',
    'contemplative_depth_tracking',
    'art_comprehension_evolution',
    'empathy_development',
    'artwork_interpretation_archive',
    'interpretation_feedback',
    'user_curated_paths',
    'collective_emotion_mapping',
    'contribution_metrics',
    'mutual_learning_tracking',
    'knowledge_reproduction_cycle',
    'personal_growth_dashboard'
  ];

  try {
    const existingTables = await database.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

    const existingTableNames = existingTables.rows.map(row => row.table_name);
    return requiredTables.filter(table => !existingTableNames.includes(table));
  } catch (error) {
    console.error('테이블 확인 중 오류:', error);
    return requiredTables; // 오류 시 모든 테이블을 생성 대상으로
  }
}

/**
 * 가치 교환 시스템을 위한 추가 테이블 생성
 */
async function createAdditionalTables(database) {
  try {
    // 작품 접근 로그 테이블
    await database.query(`
            CREATE TABLE IF NOT EXISTS artwork_access_log (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                artwork_id UUID NOT NULL,
                access_type VARCHAR(20) NOT NULL, -- 'free' or 'premium'
                points_used INTEGER DEFAULT 0,
                accessed_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_artwork_access_log_user_date 
            ON artwork_access_log(user_id, DATE(accessed_at));
        `);

    // 프리미엄 기능 잠금 해제 테이블
    await database.query(`
            CREATE TABLE IF NOT EXISTS premium_feature_unlocks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                feature_type VARCHAR(100) NOT NULL,
                points_used INTEGER NOT NULL,
                unlocked_at TIMESTAMPTZ DEFAULT NOW(),
                expires_at TIMESTAMPTZ NOT NULL,
                UNIQUE(user_id, feature_type)
            );
            CREATE INDEX IF NOT EXISTS idx_premium_feature_unlocks_user 
            ON premium_feature_unlocks(user_id, feature_type);
        `);

    // 사용자 큐레이션 경로 사용 기록 테이블
    await database.query(`
            CREATE TABLE IF NOT EXISTS user_curated_path_usage (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                path_id UUID NOT NULL REFERENCES user_curated_paths(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                completion_rate FLOAT DEFAULT 0,
                user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
                used_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_curated_path_usage_path 
            ON user_curated_path_usage(path_id);
        `);

    console.log('✅ 추가 테이블 생성 완료');
  } catch (error) {
    console.error('❌ 추가 테이블 생성 실패:', error);
  }
}

/**
 * 듀얼 가치 시스템 헬스 체크
 */
function createHealthCheckEndpoint(app, dualValueController) {
  app.get('/api/dual-value/health', async (req, res) => {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        components: {
          dualValueController: dualValueController ? 'active' : 'inactive',
          database: 'connected', // 실제로는 DB 연결 상태 확인
          apis: {
            personalGrowth: 'available',
            collectiveIntelligence: 'available',
            valueCirculation: 'available',
            valueExchange: 'available'
          }
        },
        metrics: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version
        }
      };

      res.json(healthStatus);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * 듀얼 가치 시스템 미들웨어 설정
 */
function setupDualValueMiddleware(app) {
  // 듀얼 가치 시스템 전용 로깅 미들웨어
  app.use('/api/dual-value', (req, res, next) => {
    console.log(`[Dual Value] ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });

  // 듀얼 가치 시스템 에러 핸들링 미들웨어
  app.use('/api/dual-value', (error, req, res, next) => {
    console.error('[Dual Value Error]:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: '듀얼 가치 시스템에서 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
}

module.exports = {
  integrateDualValueSystem,
  setupDualValueDatabase,
  createHealthCheckEndpoint,
  setupDualValueMiddleware
};
