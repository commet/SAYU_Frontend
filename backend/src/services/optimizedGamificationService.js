const { pool } = require('../config/database');
const redis = require('../config/redis');
const { format, startOfWeek, endOfWeek, differenceInDays, addDays } = require('date-fns');
const { ko } = require('date-fns/locale');

class OptimizedGamificationService {
  constructor() {
    // 사유 레벨 시스템 (5단계)
    this.levels = [
      { level: 1, name: '예술 입문자', minXP: 0, maxXP: 100, color: '#9CA3AF', icon: '🌱' },
      { level: 2, name: '예술 탐험가', minXP: 100, maxXP: 300, color: '#60A5FA', icon: '🔍' },
      { level: 3, name: '예술 애호가', minXP: 300, maxXP: 600, color: '#A78BFA', icon: '💜' },
      { level: 4, name: '예술 전문가', minXP: 600, maxXP: 1000, color: '#F59E0B', icon: '⭐' },
      { level: 5, name: '예술 마스터', minXP: 1000, maxXP: Infinity, color: '#EF4444', icon: '👑' }
    ];

    // 일일 퀘스트 정의
    this.dailyQuests = [
      { id: 'daily_login', name: '매일 접속하기', xp: 10, required: 1 },
      { id: 'view_artwork', name: '작품 감상하기', xp: 15, required: 3 },
      { id: 'take_quiz', name: '퀴즈 참여하기', xp: 20, required: 1 },
      { id: 'follow_user', name: '새로운 친구 만들기', xp: 10, required: 1 },
      { id: 'share_artwork', name: '작품 공유하기', xp: 15, required: 1 }
    ];

    // XP 이벤트 타입
    this.xpEvents = {
      DAILY_LOGIN: 10,
      VIEW_ARTWORK: 5,
      COMPLETE_QUIZ: 20,
      FOLLOW_USER: 10,
      SHARE_ARTWORK: 15,
      CREATE_AI_PROFILE: 30,
      VISIT_EXHIBITION: 25,
      WRITE_REVIEW: 20,
      RECEIVE_LIKE: 5,
      STREAK_BONUS: 50
    };
  }

  // 사용자 게임화 프로필 초기화
  async initializeUser(userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 레벨 정보 초기화
      await client.query(`
        INSERT INTO user_levels (user_id, level, level_name, current_xp, total_xp)
        VALUES ($1, 1, '예술 입문자', 0, 0)
        ON CONFLICT (user_id) DO NOTHING
      `, [userId]);

      // 스트릭 정보 초기화
      await client.query(`
        INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
        VALUES ($1, 0, 0, NULL)
        ON CONFLICT (user_id) DO NOTHING
      `, [userId]);

      await client.query('COMMIT');

      // Redis 캐시 초기화
      await this.cacheUserStats(userId);

      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error initializing user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // XP 획득 (최적화된 버전)
  async earnXP(userId, eventType, metadata = {}) {
    const xpAmount = this.xpEvents[eventType] || 0;
    if (xpAmount === 0) {
      throw new Error(`Unknown event type: ${eventType}`);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 현재 레벨 정보 가져오기 (FOR UPDATE로 락)
      const userLevelResult = await client.query(`
        SELECT * FROM user_levels WHERE user_id = $1 FOR UPDATE
      `, [userId]);

      if (userLevelResult.rows.length === 0) {
        await this.initializeUser(userId);
        return this.earnXP(userId, eventType, metadata);
      }

      const currentData = userLevelResult.rows[0];
      const newTotalXP = currentData.total_xp + xpAmount;
      const newLevel = this.calculateLevel(newTotalXP);
      const leveledUp = newLevel.level > currentData.level;

      // XP 업데이트
      await client.query(`
        UPDATE user_levels 
        SET total_xp = $2, 
            current_xp = $3,
            level = $4,
            level_name = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [userId, newTotalXP, newTotalXP - newLevel.minXP, newLevel.level, newLevel.name]);

      // XP 트랜잭션 로그
      await client.query(`
        INSERT INTO xp_transactions (user_id, xp_amount, transaction_type, description, reference_id, reference_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, xpAmount, eventType, metadata.description || eventType, metadata.referenceId, metadata.referenceType]);

      // 퀘스트 진행도 업데이트
      await this.updateQuestProgressInternal(client, userId, eventType);

      // 스트릭 업데이트
      if (eventType === 'DAILY_LOGIN') {
        await this.updateStreakInternal(client, userId);
      }

      // 주간 리더보드 업데이트
      await this.updateWeeklyLeaderboardInternal(client, userId, xpAmount);

      await client.query('COMMIT');

      // Redis 캐시 업데이트
      await this.updateRedisAfterXP(userId, newTotalXP, newLevel, xpAmount);

      // WebSocket 이벤트 발송
      const event = {
        type: leveledUp ? 'LEVEL_UP' : 'XP_GAINED',
        userId,
        xpGained: xpAmount,
        totalXP: newTotalXP,
        level: newLevel,
        leveledUp
      };

      // 레벨업 보상 처리
      if (leveledUp) {
        await this.grantLevelRewards(userId, newLevel.level);
      }

      return event;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error earning XP:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // 레벨 계산 (최적화)
  calculateLevel(totalXP) {
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (totalXP >= this.levels[i].minXP) {
        return this.levels[i];
      }
    }
    return this.levels[0];
  }

  // 일일 퀘스트 진행도 가져오기 (Redis 캐시 활용)
  async getDailyQuests(userId) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const cacheKey = `quests:${userId}:${today}`;

    // Redis에서 먼저 확인
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Redis error:', error);
    }

    // DB에서 가져오기
    const client = await pool.connect();
    try {
      const quests = [];

      for (const questDef of this.dailyQuests) {
        const progress = await client.query(`
          SELECT progress, completed FROM user_quests 
          WHERE user_id = $1 AND quest_id = (
            SELECT id FROM quest_definitions WHERE quest_type = $2
          ) AND date = $3
        `, [userId, questDef.id, today]);

        quests.push({
          ...questDef,
          progress: progress.rows[0]?.progress || 0,
          completed: progress.rows[0]?.completed || false
        });
      }

      // Redis에 캐시 (1시간)
      try {
        await redis.setex(cacheKey, 3600, JSON.stringify(quests));
      } catch (error) {
        console.error('Redis cache error:', error);
      }

      return quests;
    } finally {
      client.release();
    }
  }

  // 퀘스트 진행도 업데이트 (내부 함수)
  async updateQuestProgressInternal(client, userId, eventType) {
    const today = format(new Date(), 'yyyy-MM-dd');

    // 이벤트 타입과 퀘스트 매핑
    const questMapping = {
      'DAILY_LOGIN': 'daily_login',
      'VIEW_ARTWORK': 'view_artwork',
      'COMPLETE_QUIZ': 'take_quiz',
      'FOLLOW_USER': 'follow_user',
      'SHARE_ARTWORK': 'share_artwork'
    };

    const questType = questMapping[eventType];
    if (!questType) return;

    // 퀘스트 정의 가져오기
    const questDef = await client.query(`
      SELECT * FROM quest_definitions WHERE quest_type = $1
    `, [questType]);

    if (questDef.rows.length === 0) return;

    const quest = questDef.rows[0];

    // 진행도 업데이트
    const result = await client.query(`
      INSERT INTO user_quests (user_id, quest_id, progress, date)
      VALUES ($1, $2, 1, $3)
      ON CONFLICT (user_id, quest_id, date) 
      DO UPDATE SET progress = LEAST(user_quests.progress + 1, $4)
      RETURNING *
    `, [userId, quest.id, today, quest.required_count]);

    const userQuest = result.rows[0];

    // 완료 체크
    if (userQuest.progress >= quest.required_count && !userQuest.completed) {
      await client.query(`
        UPDATE user_quests 
        SET completed = true, completed_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [userQuest.id]);

      // 퀘스트 완료 XP 보상
      await client.query(`
        UPDATE user_levels 
        SET total_xp = total_xp + $2, current_xp = current_xp + $2
        WHERE user_id = $1
      `, [userId, quest.xp_reward]);

      // XP 트랜잭션 로그
      await client.query(`
        INSERT INTO xp_transactions (user_id, xp_amount, transaction_type, description)
        VALUES ($1, $2, 'QUEST_COMPLETE', $3)
      `, [userId, quest.xp_reward, `퀘스트 완료: ${quest.title}`]);
    }

    // 캐시 무효화
    const cacheKey = `quests:${userId}:${today}`;
    try {
      await redis.del(cacheKey);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  // 스트릭 업데이트 (내부 함수)
  async updateStreakInternal(client, userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streakResult = await client.query(`
      SELECT * FROM user_streaks WHERE user_id = $1 FOR UPDATE
    `, [userId]);

    if (streakResult.rows.length === 0) {
      await client.query(`
        INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, streak_start_date)
        VALUES ($1, 1, 1, $2, $2)
      `, [userId, today]);
      return;
    }

    const streak = streakResult.rows[0];
    const lastActivity = streak.last_activity_date ? new Date(streak.last_activity_date) : null;

    if (lastActivity) {
      const daysDiff = differenceInDays(today, lastActivity);

      if (daysDiff === 0) {
        // 오늘 이미 활동함
        return;
      } else if (daysDiff === 1) {
        // 연속 접속
        const newStreak = streak.current_streak + 1;
        const longestStreak = Math.max(newStreak, streak.longest_streak);

        await client.query(`
          UPDATE user_streaks 
          SET current_streak = $2, longest_streak = $3, last_activity_date = $4
          WHERE user_id = $1
        `, [userId, newStreak, longestStreak, today]);

        // 7일 연속 보너스
        if (newStreak % 7 === 0) {
          await client.query(`
            UPDATE user_levels 
            SET total_xp = total_xp + 50, current_xp = current_xp + 50
            WHERE user_id = $1
          `, [userId]);

          await client.query(`
            INSERT INTO xp_transactions (user_id, xp_amount, transaction_type, description)
            VALUES ($1, 50, 'STREAK_BONUS', $2)
          `, [userId, `${newStreak}일 연속 접속 보너스!`]);
        }
      } else {
        // 스트릭 끊김
        await client.query(`
          UPDATE user_streaks 
          SET current_streak = 1, last_activity_date = $2, streak_start_date = $2
          WHERE user_id = $1
        `, [userId, today]);
      }
    } else {
      // 첫 활동
      await client.query(`
        UPDATE user_streaks 
        SET current_streak = 1, longest_streak = 1, last_activity_date = $2, streak_start_date = $2
        WHERE user_id = $1
      `, [userId, today]);
    }
  }

  // 주간 리더보드 업데이트 (내부 함수)
  async updateWeeklyLeaderboardInternal(client, userId, xpGained) {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    // 사용자 정보 가져오기
    const userInfo = await client.query(`
      SELECT u.username, u.avatar_url, ul.level 
      FROM users u
      LEFT JOIN user_levels ul ON u.id = ul.user_id
      WHERE u.id = $1
    `, [userId]);

    if (userInfo.rows.length === 0) return;

    const user = userInfo.rows[0];

    await client.query(`
      INSERT INTO weekly_leaderboard (user_id, username, avatar_url, level, weekly_xp, week_start, week_end)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, week_start) 
      DO UPDATE SET 
        weekly_xp = weekly_leaderboard.weekly_xp + $5,
        username = $2,
        avatar_url = $3,
        level = $4
    `, [userId, user.username, user.avatar_url, user.level || 1, xpGained, weekStart, weekEnd]);

    // Redis 리더보드 업데이트
    const redisKey = `leaderboard:weekly:${format(weekStart, 'yyyy-MM-dd')}`;
    try {
      await redis.zincrby(redisKey, xpGained, userId);
      await redis.expire(redisKey, 604800); // 7일
    } catch (error) {
      console.error('Redis leaderboard error:', error);
    }
  }

  // 리더보드 가져오기 (Redis 최적화)
  async getLeaderboard(type = 'weekly', limit = 100, userId = null) {
    if (type === 'weekly') {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const redisKey = `leaderboard:weekly:${format(weekStart, 'yyyy-MM-dd')}`;

      try {
        // Redis에서 상위 랭커 가져오기
        const topUsers = await redis.zrevrange(redisKey, 0, limit - 1, 'WITHSCORES');

        if (topUsers.length > 0) {
          const userIds = [];
          const scores = {};

          for (let i = 0; i < topUsers.length; i += 2) {
            userIds.push(parseInt(topUsers[i]));
            scores[topUsers[i]] = parseInt(topUsers[i + 1]);
          }

          // 사용자 정보 가져오기
          const userInfo = await pool.query(`
            SELECT u.id, u.username, u.avatar_url, ul.level
            FROM users u
            LEFT JOIN user_levels ul ON u.id = ul.user_id
            WHERE u.id = ANY($1::int[])
          `, [userIds]);

          const userMap = {};
          userInfo.rows.forEach(user => {
            userMap[user.id] = user;
          });

          const leaderboard = userIds.map((id, index) => ({
            rank: index + 1,
            user_id: id,
            username: userMap[id]?.username || 'Unknown',
            avatar_url: userMap[id]?.avatar_url,
            level: userMap[id]?.level || 1,
            weekly_xp: scores[id.toString()]
          }));

          // 현재 사용자 순위 추가
          if (userId) {
            const userRank = await redis.zrevrank(redisKey, userId);
            if (userRank !== null && userRank >= limit) {
              const userScore = await redis.zscore(redisKey, userId);
              const userInfo = await pool.query(`
                SELECT u.username, u.avatar_url, ul.level
                FROM users u
                LEFT JOIN user_levels ul ON u.id = ul.user_id
                WHERE u.id = $1
              `, [userId]);

              if (userInfo.rows.length > 0) {
                leaderboard.push({
                  rank: userRank + 1,
                  user_id: userId,
                  username: userInfo.rows[0].username,
                  avatar_url: userInfo.rows[0].avatar_url,
                  level: userInfo.rows[0].level || 1,
                  weekly_xp: parseInt(userScore),
                  isCurrentUser: true
                });
              }
            }
          }

          return leaderboard;
        }
      } catch (error) {
        console.error('Redis leaderboard error:', error);
      }
    }

    // DB에서 가져오기
    const query = type === 'weekly' ? `
      SELECT 
        wl.*,
        ROW_NUMBER() OVER (ORDER BY weekly_xp DESC) as rank
      FROM weekly_leaderboard wl
      WHERE week_start = $1
      ORDER BY weekly_xp DESC
      LIMIT $2
    ` : `
      SELECT 
        u.id as user_id,
        u.username,
        u.avatar_url,
        ul.level,
        ul.total_xp,
        ROW_NUMBER() OVER (ORDER BY ul.total_xp DESC) as rank
      FROM users u
      JOIN user_levels ul ON u.id = ul.user_id
      ORDER BY ul.total_xp DESC
      LIMIT $1
    `;

    const params = type === 'weekly'
      ? [startOfWeek(new Date(), { weekStartsOn: 1 }), limit]
      : [limit];

    const result = await pool.query(query, params);
    return result.rows;
  }

  // 사용자 통계 가져오기 (캐시 최적화)
  async getUserStats(userId) {
    const cacheKey = `user:stats:${userId}`;

    // Redis에서 먼저 확인
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Redis error:', error);
    }

    // DB에서 가져오기
    const client = await pool.connect();
    try {
      const stats = await client.query(`
        SELECT 
          ul.*,
          us.current_streak,
          us.longest_streak,
          us.last_activity_date,
          (
            SELECT COUNT(*) 
            FROM user_quests uq 
            WHERE uq.user_id = $1 
              AND uq.completed = true 
              AND uq.date = CURRENT_DATE
          ) as daily_quests_completed,
          (
            SELECT COUNT(*) 
            FROM quest_definitions 
            WHERE is_daily = true AND is_active = true
          ) as total_daily_quests,
          (
            SELECT COUNT(*) 
            FROM user_rewards ur 
            WHERE ur.user_id = $1
          ) as total_rewards,
          (
            SELECT rank FROM (
              SELECT user_id, RANK() OVER (ORDER BY weekly_xp DESC) as rank
              FROM weekly_leaderboard
              WHERE week_start = date_trunc('week', CURRENT_DATE)
            ) r WHERE r.user_id = $1
          ) as weekly_rank
        FROM user_levels ul
        LEFT JOIN user_streaks us ON ul.user_id = us.user_id
        WHERE ul.user_id = $1
      `, [userId]);

      if (stats.rows.length === 0) {
        // 새 사용자 초기화
        await this.initializeUser(userId);
        return this.getUserStats(userId);
      }

      const userStats = stats.rows[0];
      const currentLevel = this.calculateLevel(userStats.total_xp);
      const nextLevel = this.levels[Math.min(currentLevel.level, this.levels.length - 1)];
      const progressToNextLevel = currentLevel.level < 5
        ? ((userStats.total_xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
        : 100;

      const formattedStats = {
        userId,
        level: currentLevel.level,
        levelName: currentLevel.name,
        levelColor: currentLevel.color,
        levelIcon: currentLevel.icon,
        currentXP: userStats.current_xp,
        totalXP: userStats.total_xp,
        nextLevelXP: nextLevel.minXP,
        progressToNextLevel: Math.min(progressToNextLevel, 100),
        currentStreak: userStats.current_streak || 0,
        longestStreak: userStats.longest_streak || 0,
        lastActivityDate: userStats.last_activity_date,
        dailyQuestsCompleted: parseInt(userStats.daily_quests_completed) || 0,
        totalDailyQuests: parseInt(userStats.total_daily_quests) || 0,
        totalRewards: parseInt(userStats.total_rewards) || 0,
        weeklyRank: userStats.weekly_rank || null
      };

      // Redis에 캐시 (5분)
      try {
        await redis.setex(cacheKey, 300, JSON.stringify(formattedStats));
      } catch (error) {
        console.error('Redis cache error:', error);
      }

      return formattedStats;
    } finally {
      client.release();
    }
  }

  // Redis 캐시 업데이트 헬퍼
  async updateRedisAfterXP(userId, totalXP, level, xpGained) {
    try {
      // 사용자 통계 캐시 무효화
      await redis.del(`user:stats:${userId}`);

      // 실시간 XP 업데이트 스트림
      await redis.xadd(
        'xp-stream',
        '*',
        'userId', userId,
        'totalXP', totalXP,
        'level', level.level,
        'xpGained', xpGained,
        'timestamp', Date.now()
      );

      // 최근 활동 로그 (최대 100개)
      await redis.lpush(`activity:${userId}`, JSON.stringify({
        type: 'XP_GAINED',
        amount: xpGained,
        timestamp: new Date().toISOString()
      }));
      await redis.ltrim(`activity:${userId}`, 0, 99);

    } catch (error) {
      console.error('Redis update error:', error);
    }
  }

  // 사용자 통계 캐싱
  async cacheUserStats(userId) {
    const stats = await this.getUserStats(userId);
    return stats;
  }

  // 레벨업 보상
  async grantLevelRewards(userId, newLevel) {
    const rewards = {
      2: { type: 'custom_profile', name: '커스텀 프로필 잠금 해제' },
      3: { type: 'priority_matching', name: '우선 매칭 기능' },
      4: { type: 'exclusive_exhibitions', name: '독점 전시 접근' },
      5: { type: 'vip_status', name: 'VIP 상태' }
    };

    if (rewards[newLevel]) {
      const client = await pool.connect();
      try {
        const reward = rewards[newLevel];

        // 보상 정의 확인/생성
        const rewardDef = await client.query(`
          INSERT INTO reward_definitions (reward_type, name, description)
          VALUES ($1, $2, $3)
          ON CONFLICT (reward_type) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `, [reward.type, reward.name, reward.name]);

        // 사용자에게 보상 부여
        await client.query(`
          INSERT INTO user_rewards (user_id, reward_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, reward_id) DO NOTHING
        `, [userId, rewardDef.rows[0].id]);

      } catch (error) {
        console.error('Error granting rewards:', error);
      } finally {
        client.release();
      }
    }
  }

  // 주간 리그 시스템
  async updateUserLeague(userId) {
    const client = await pool.connect();
    try {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

      // 현재 주간 XP 확인
      const weeklyStats = await client.query(`
        SELECT weekly_xp, rank
        FROM weekly_leaderboard
        WHERE user_id = $1 AND week_start = $2
      `, [userId, weekStart]);

      if (weeklyStats.rows.length === 0) return;

      const { weekly_xp, rank } = weeklyStats.rows[0];

      // 리그 티어 계산
      let tier = 'bronze';
      if (rank <= 10) tier = 'diamond';
      else if (rank <= 50) tier = 'platinum';
      else if (rank <= 100) tier = 'gold';
      else if (rank <= 250) tier = 'silver';

      // 리그 업데이트
      await client.query(`
        INSERT INTO user_leagues (user_id, league_tier, league_points, week_start)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, week_start)
        DO UPDATE SET league_tier = $2, league_points = $3
      `, [userId, tier, weekly_xp, weekStart]);

    } catch (error) {
      console.error('Error updating league:', error);
    } finally {
      client.release();
    }
  }

  // 일일 퀘스트 리셋 (크론 작업용)
  async resetDailyQuests() {
    try {
      // 모든 캐시된 퀘스트 데이터 삭제
      const keys = await redis.keys('quests:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }

      console.log('Daily quests reset completed');
    } catch (error) {
      console.error('Error resetting daily quests:', error);
    }
  }

  // 주간 리더보드 아카이브 (크론 작업용)
  async archiveWeeklyLeaderboard() {
    const client = await pool.connect();
    try {
      const lastWeekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), -7);

      // 상위 100명 보상
      const topPlayers = await client.query(`
        SELECT user_id, rank, weekly_xp
        FROM weekly_leaderboard
        WHERE week_start = $1
        ORDER BY weekly_xp DESC
        LIMIT 100
      `, [lastWeekStart]);

      for (const player of topPlayers.rows) {
        let bonusXP = 0;
        if (player.rank <= 10) bonusXP = 100;
        else if (player.rank <= 50) bonusXP = 50;
        else if (player.rank <= 100) bonusXP = 25;

        if (bonusXP > 0) {
          await this.earnXP(player.user_id, 'WEEKLY_RANK_BONUS', {
            description: `주간 ${player.rank}위 보상`,
            referenceId: player.rank
          });
        }
      }

      // Redis 리더보드 정리
      const redisKey = `leaderboard:weekly:${format(lastWeekStart, 'yyyy-MM-dd')}`;
      await redis.del(redisKey);

      console.log('Weekly leaderboard archived');
    } catch (error) {
      console.error('Error archiving leaderboard:', error);
    } finally {
      client.release();
    }
  }
}

module.exports = new OptimizedGamificationService();
