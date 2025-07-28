const { pool } = require('../config/database');

async function createGamificationTables() {
  const client = await pool.connect();

  try {
    console.log('Creating gamification tables...');

    // 사유 레벨 시스템
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_levels (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 5),
        current_xp INTEGER DEFAULT 0,
        total_xp INTEGER DEFAULT 0,
        level_name VARCHAR(50),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_user_levels_level ON user_levels(level);
      CREATE INDEX idx_user_levels_total_xp ON user_levels(total_xp DESC);
    `);

    // 일일 퀘스트 정의
    await client.query(`
      CREATE TABLE IF NOT EXISTS quest_definitions (
        id SERIAL PRIMARY KEY,
        quest_type VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        xp_reward INTEGER NOT NULL,
        required_count INTEGER DEFAULT 1,
        is_daily BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_quest_definitions_type ON quest_definitions(quest_type);
      CREATE INDEX idx_quest_definitions_active ON quest_definitions(is_active);
    `);

    // 사용자 퀘스트 진행도
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_quests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        quest_id INTEGER REFERENCES quest_definitions(id),
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, quest_id, date)
      );
      
      CREATE INDEX idx_user_quests_user_date ON user_quests(user_id, date);
      CREATE INDEX idx_user_quests_completed ON user_quests(completed);
      CREATE INDEX idx_user_quests_quest_id ON user_quests(quest_id);
    `);

    // 스트릭 시스템
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_streaks (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date DATE,
        streak_start_date DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_user_streaks_current ON user_streaks(current_streak DESC);
      CREATE INDEX idx_user_streaks_last_activity ON user_streaks(last_activity_date);
    `);

    // XP 트랜잭션 로그
    await client.query(`
      CREATE TABLE IF NOT EXISTS xp_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        xp_amount INTEGER NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        description TEXT,
        reference_id INTEGER,
        reference_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
      CREATE INDEX idx_xp_transactions_type ON xp_transactions(transaction_type);
      CREATE INDEX idx_xp_transactions_created ON xp_transactions(created_at DESC);
    `);

    // 리더보드 캐시 (주간)
    await client.query(`
      CREATE TABLE IF NOT EXISTS weekly_leaderboard (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(255),
        avatar_url TEXT,
        level INTEGER,
        weekly_xp INTEGER DEFAULT 0,
        rank INTEGER,
        week_start DATE,
        week_end DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, week_start)
      );
      
      CREATE INDEX idx_weekly_leaderboard_week ON weekly_leaderboard(week_start, week_end);
      CREATE INDEX idx_weekly_leaderboard_rank ON weekly_leaderboard(week_start, rank);
      CREATE INDEX idx_weekly_leaderboard_xp ON weekly_leaderboard(weekly_xp DESC);
    `);

    // 리그 시스템
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_leagues (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        league_tier VARCHAR(20) DEFAULT 'bronze',
        league_points INTEGER DEFAULT 0,
        promotion_threshold INTEGER DEFAULT 100,
        demotion_threshold INTEGER DEFAULT -50,
        week_start DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, week_start)
      );
      
      CREATE INDEX idx_user_leagues_tier ON user_leagues(league_tier);
      CREATE INDEX idx_user_leagues_week ON user_leagues(week_start);
    `);

    // 보상 시스템
    await client.query(`
      CREATE TABLE IF NOT EXISTS reward_definitions (
        id SERIAL PRIMARY KEY,
        reward_type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon_url TEXT,
        unlock_condition JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_reward_definitions_type ON reward_definitions(reward_type);
    `);

    // 사용자 보상
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_rewards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reward_id INTEGER REFERENCES reward_definitions(id),
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, reward_id)
      );
      
      CREATE INDEX idx_user_rewards_user ON user_rewards(user_id);
      CREATE INDEX idx_user_rewards_unlocked ON user_rewards(unlocked_at DESC);
    `);

    // 기본 퀘스트 데이터 삽입
    await client.query(`
      INSERT INTO quest_definitions (quest_type, title, description, xp_reward, required_count)
      VALUES 
        ('daily_login', '매일 접속하기', 'SAYU에 매일 로그인하세요', 10, 1),
        ('view_artwork', '작품 감상하기', '오늘 3개의 작품을 감상하세요', 15, 3),
        ('take_quiz', '퀴즈 참여하기', '성격 퀴즈를 완료하세요', 20, 1),
        ('follow_user', '새로운 친구 만들기', '다른 사용자를 팔로우하세요', 10, 1),
        ('share_artwork', '작품 공유하기', '마음에 드는 작품을 공유하세요', 15, 1),
        ('create_profile', 'AI 프로필 생성', 'AI 아트 프로필을 생성하세요', 30, 1),
        ('visit_exhibition', '전시 방문하기', '가상 전시를 관람하세요', 25, 1),
        ('weekly_streak', '주간 연속 접속', '7일 연속 접속하세요', 50, 7)
      ON CONFLICT (quest_type) DO NOTHING;
    `);

    // 레벨별 정보
    await client.query(`
      CREATE TABLE IF NOT EXISTS level_definitions (
        level INTEGER PRIMARY KEY,
        level_name VARCHAR(50) NOT NULL,
        required_xp INTEGER NOT NULL,
        perks JSONB
      );
      
      INSERT INTO level_definitions (level, level_name, required_xp, perks)
      VALUES 
        (1, '예술 입문자', 0, '{"daily_quests": 3, "follow_limit": 50}'),
        (2, '예술 탐험가', 100, '{"daily_quests": 4, "follow_limit": 100, "custom_profile": true}'),
        (3, '예술 애호가', 300, '{"daily_quests": 5, "follow_limit": 200, "custom_profile": true, "priority_matching": true}'),
        (4, '예술 전문가', 600, '{"daily_quests": 6, "follow_limit": 500, "custom_profile": true, "priority_matching": true, "exclusive_exhibitions": true}'),
        (5, '예술 마스터', 1000, '{"daily_quests": 7, "follow_limit": -1, "custom_profile": true, "priority_matching": true, "exclusive_exhibitions": true, "vip_events": true}')
      ON CONFLICT (level) DO NOTHING;
    `);

    console.log('Gamification tables created successfully!');

  } catch (error) {
    console.error('Error creating gamification tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 실행
if (require.main === module) {
  createGamificationTables()
    .then(() => {
      console.log('Setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = createGamificationTables;
