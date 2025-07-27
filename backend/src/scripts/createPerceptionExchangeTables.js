const { pool } = require('../config/database');
const logger = require('../utils/logger');

async function createPerceptionExchangeTables() {
  try {
    logger.info('Creating perception exchange tables...');

    // 1. Perception Exchange Sessions 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS perception_exchange_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        artwork_id VARCHAR(255) NOT NULL,
        museum_source VARCHAR(100),
        artwork_data JSONB,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'declined')),
        current_phase INTEGER DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 4),
        initiated_at TIMESTAMP DEFAULT NOW(),
        accepted_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 2. Perception Messages 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS perception_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES perception_exchange_sessions(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        emotion_tags TEXT[],
        phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 4),
        word_count INTEGER DEFAULT 0,
        reaction VARCHAR(20) CHECK (reaction IN ('resonate', 'thoughtful', 'inspiring')),
        sent_at TIMESTAMP DEFAULT NOW(),
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 3. Exchange Quality Metrics 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exchange_quality_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES perception_exchange_sessions(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 5),
        depth_rating INTEGER CHECK (depth_rating BETWEEN 1 AND 5),
        connection_rating INTEGER CHECK (connection_rating BETWEEN 1 AND 5),
        learning_rating INTEGER CHECK (learning_rating BETWEEN 1 AND 5),
        feedback_text TEXT,
        would_exchange_again BOOLEAN,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 4. Exchange Preferences 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exchange_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        auto_accept_from_followers BOOLEAN DEFAULT false,
        preferred_exchange_length VARCHAR(20) DEFAULT 'medium' CHECK (preferred_exchange_length IN ('short', 'medium', 'long')),
        notification_preferences JSONB DEFAULT '{"new_invitations": true, "new_messages": true, "phase_advances": true}',
        privacy_level VARCHAR(20) DEFAULT 'normal' CHECK (privacy_level IN ('private', 'normal', 'open')),
        blocked_users UUID[] DEFAULT ARRAY[]::UUID[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 인덱스 생성
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_perception_sessions_artwork 
      ON perception_exchange_sessions(artwork_id, status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_perception_sessions_users 
      ON perception_exchange_sessions(initiator_id, partner_id, status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_perception_messages_session 
      ON perception_messages(session_id, sent_at);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_perception_messages_unread 
      ON perception_messages(sender_id, read_at) WHERE read_at IS NULL;
    `);

    // 트리거 함수 생성 (updated_at 자동 업데이트)
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // 트리거 적용
    await pool.query(`
      DROP TRIGGER IF EXISTS update_perception_sessions_updated_at ON perception_exchange_sessions;
      CREATE TRIGGER update_perception_sessions_updated_at 
        BEFORE UPDATE ON perception_exchange_sessions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_exchange_preferences_updated_at ON exchange_preferences;
      CREATE TRIGGER update_exchange_preferences_updated_at 
        BEFORE UPDATE ON exchange_preferences 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    logger.info('✅ Perception exchange tables created successfully');
    
    // 테이블 상태 확인
    const tablesResult = await hybridDB.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%perception%' OR table_name LIKE '%exchange%'
      ORDER BY table_name
    `);

    logger.info('Created tables:', tablesResult.rows.map(row => row.table_name));

  } catch (error) {
    logger.error('Failed to create perception exchange tables:', error);
    throw error;
  }
}

// 스크립트로 직접 실행할 때
if (require.main === module) {
  createPerceptionExchangeTables()
    .then(() => {
      console.log('✅ Perception exchange tables setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to setup tables:', error);
      process.exit(1);
    });
}

module.exports = { createPerceptionExchangeTables };