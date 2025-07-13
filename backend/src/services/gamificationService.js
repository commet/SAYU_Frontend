const { hybridDB } = require('../config/hybridDatabase');
const Redis = require('ioredis');
const { log } = require('../config/logger');
const EventEmitter = require('events');

class GamificationService extends EventEmitter {
  constructor() {
    super();
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL);
        this.redis.on('error', (error) => {
          log.error('Redis error in Gamification service:', error);
          this.redis = null;
        });
      } catch (error) {
        log.warn('Redis connection failed in Gamification service, running without cache:', error.message);
        this.redis = null;
      }
    } else {
      this.redis = null;
      log.warn('Gamification service running without Redis cache - REDIS_URL not configured');
    }
    this.initializeService();
  }

  async initializeService() {
    try {
      if (this.redis) {
        await this.redis.ping();
        log.info('Gamification service initialized with Redis');
      } else {
        log.info('Gamification service initialized without Redis (cache disabled)');
      }
    } catch (error) {
      log.error('Redis connection failed:', error);
      this.redis = null;
    }
  }

  // 레벨 정의
  getLevelDefinitions() {
    return [
      { level: 1, minPoints: 0, maxPoints: 100, name: '첫 발걸음', icon: '🌱' },
      { level: 2, minPoints: 101, maxPoints: 250, name: '첫 발걸음', icon: '🌱' },
      { level: 3, minPoints: 251, maxPoints: 450, name: '첫 발걸음', icon: '🌱' },
      { level: 4, minPoints: 451, maxPoints: 700, name: '첫 발걸음', icon: '🌱' },
      { level: 5, minPoints: 701, maxPoints: 1000, name: '첫 발걸음', icon: '🌱' },
      { level: 6, minPoints: 1001, maxPoints: 1350, name: '첫 발걸음', icon: '🌱' },
      { level: 7, minPoints: 1351, maxPoints: 1750, name: '첫 발걸음', icon: '🌱' },
      { level: 8, minPoints: 1751, maxPoints: 2200, name: '첫 발걸음', icon: '🌱' },
      { level: 9, minPoints: 2201, maxPoints: 2700, name: '첫 발걸음', icon: '🌱' },
      { level: 10, minPoints: 2701, maxPoints: 3250, name: '첫 발걸음', icon: '🌱' },
      // 11-25: 호기심 가득
      { level: 11, minPoints: 3251, maxPoints: 3850, name: '호기심 가득', icon: '👀' },
      { level: 15, minPoints: 6001, maxPoints: 7000, name: '호기심 가득', icon: '👀' },
      { level: 20, minPoints: 10001, maxPoints: 12000, name: '호기심 가득', icon: '👀' },
      { level: 25, minPoints: 15001, maxPoints: 18000, name: '호기심 가득', icon: '👀' },
      // 26-50: 눈뜨는 중
      { level: 26, minPoints: 18001, maxPoints: 21000, name: '눈뜨는 중', icon: '✨' },
      { level: 30, minPoints: 27001, maxPoints: 32000, name: '눈뜨는 중', icon: '✨' },
      { level: 40, minPoints: 50001, maxPoints: 60000, name: '눈뜨는 중', icon: '✨' },
      { level: 50, minPoints: 80001, maxPoints: 95000, name: '눈뜨는 중', icon: '✨' },
      // 51-75: 감성 충만
      { level: 51, minPoints: 95001, maxPoints: 110000, name: '감성 충만', icon: '🌸' },
      { level: 60, minPoints: 140001, maxPoints: 165000, name: '감성 충만', icon: '🌸' },
      { level: 70, minPoints: 210001, maxPoints: 245000, name: '감성 충만', icon: '🌸' },
      { level: 75, minPoints: 265001, maxPoints: 300000, name: '감성 충만', icon: '🌸' },
      // 76-100: 예술혼
      { level: 76, minPoints: 300001, maxPoints: 340000, name: '예술혼', icon: '🎨' },
      { level: 80, minPoints: 380001, maxPoints: 430000, name: '예술혼', icon: '🎨' },
      { level: 90, minPoints: 550001, maxPoints: 650000, name: '예술혼', icon: '🎨' },
      { level: 100, minPoints: 850001, maxPoints: 999999999, name: '예술혼', icon: '🎨' }
    ];
  }

  // 포인트 값 정의
  getPointValues() {
    return {
      EXHIBITION_START: 10,
      EXHIBITION_COMPLETE: 50,
      WRITE_REVIEW: 30,
      UPLOAD_PHOTO: 20,
      DAILY_CHECKIN: 20,
      WEEKLY_STREAK: 100,
      SHARE_SOCIAL: 15,
      FOLLOW_USER: 10,
      RECEIVE_LIKE: 5,
      FIRST_EXHIBITION: 100, // 보너스
      MILESTONE_10_EXHIBITIONS: 200,
      MILESTONE_50_EXHIBITIONS: 500
    };
  }

  // 사용자 통계 조회
  async getUserStats(userId) {
    try {
      // 캐시 확인
      if (this.redis) {
        try {
          const cached = await this.redis.get(`user:stats:${userId}`);
          if (cached) return JSON.parse(cached);
        } catch (error) {
          log.warn('Redis cache read failed:', error.message);
        }
      }

      const query = `
        SELECT 
          ug.*,
          u.username,
          u.profile_image,
          (SELECT name_ko FROM titles WHERE id = ug.main_title_id) as main_title,
          (SELECT COUNT(*) FROM activity_logs WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE) as today_activities
        FROM user_gamification ug
        JOIN users u ON u.id = ug.user_id
        WHERE ug.user_id = $1
      `;

      let result = await db.query(query, [userId]);

      // 첫 사용자인 경우 초기화
      if (result.rows.length === 0) {
        await this.initializeUser(userId);
        result = await db.query(query, [userId]);
      }

      const stats = result.rows[0];
      
      // 레벨 정보 추가
      const levelInfo = this.getLevelInfo(stats.level);
      stats.levelName = levelInfo.name;
      stats.levelIcon = levelInfo.icon;
      stats.nextLevelPoints = levelInfo.maxPoints;
      stats.currentLevelMinPoints = levelInfo.minPoints;
      stats.progressToNextLevel = this.calculateProgress(
        stats.total_points,
        levelInfo.minPoints,
        levelInfo.maxPoints
      );

      // 캐싱 (5분)
      if (this.redis) {
        try {
          await this.redis.setex(`user:stats:${userId}`, 300, JSON.stringify(stats));
        } catch (error) {
          log.warn('Redis cache write failed:', error.message);
        }
      }

      return stats;
    } catch (error) {
      log.error('Failed to get user stats:', error);
      throw error;
    }
  }

  // 사용자 초기화
  async initializeUser(userId) {
    try {
      await db.query(
        'INSERT INTO user_gamification (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
        [userId]
      );
    } catch (error) {
      log.error('Failed to initialize user:', error);
      throw error;
    }
  }

  // 포인트 획득
  async earnPoints(userId, activity, metadata = {}) {
    const trx = await hybridDB.transaction();
    
    try {
      // 포인트 값 조회
      const pointValues = this.getPointValues();
      let basePoints = pointValues[activity] || 0;
      
      if (basePoints === 0) {
        throw new Error(`Unknown activity: ${activity}`);
      }

      // 보너스 계산
      const multipliers = await this.calculateMultipliers(userId, activity, metadata);
      const totalMultiplier = Object.values(multipliers).reduce((a, b) => a * b, 1);
      const finalPoints = Math.round(basePoints * totalMultiplier);

      // 현재 통계 조회
      const currentStats = await trx.query(
        'SELECT * FROM user_gamification WHERE user_id = $1 FOR UPDATE',
        [userId]
      );

      const stats = currentStats.rows[0];
      const oldLevel = stats.level;
      const newTotalPoints = stats.total_points + finalPoints;
      const newCurrentPoints = stats.current_points + finalPoints;

      // 레벨 계산
      const newLevel = this.calculateLevel(newTotalPoints);
      const leveledUp = newLevel > oldLevel;

      // 통계 업데이트
      await trx.query(`
        UPDATE user_gamification 
        SET 
          total_points = $2,
          current_points = $3,
          level = $4,
          last_activity = NOW()
        WHERE user_id = $1
      `, [userId, newTotalPoints, newCurrentPoints, newLevel]);

      // 활동 로그 기록
      await trx.query(`
        INSERT INTO activity_logs (user_id, activity_type, points_earned, metadata)
        VALUES ($1, $2, $3, $4)
      `, [userId, activity, finalPoints, JSON.stringify({ ...metadata, multipliers })]);

      // 특정 활동별 추가 처리
      await this.handleSpecificActivity(trx, userId, activity, metadata);

      // 도전 과제 진행도 업데이트
      await this.updateChallengeProgress(trx, userId, activity, metadata);

      // 칭호 확인
      const newTitles = await this.checkAndAwardTitles(trx, userId, activity);

      await trx.commit();

      // 캐시 무효화
      if (this.redis) {
        try {
          await this.redis.del(`user:stats:${userId}`);
        } catch (error) {
          log.warn('Redis cache delete failed:', error.message);
        }
      }

      // 실시간 업데이트 전송
      const update = {
        type: 'pointsEarned',
        userId,
        points: finalPoints,
        activity,
        totalPoints: newTotalPoints,
        level: newLevel,
        multipliers
      };

      if (leveledUp) {
        update.type = 'levelUp';
        update.oldLevel = oldLevel;
        update.newLevel = newLevel;
        update.levelName = this.getLevelInfo(newLevel).name;
      }

      this.publishUpdate(userId, update);

      // 새로운 칭호가 있으면 알림
      if (newTitles.length > 0) {
        for (const title of newTitles) {
          this.publishUpdate(userId, {
            type: 'titleEarned',
            titleId: title.id,
            titleName: title.name_ko
          });
        }
      }

      return {
        pointsEarned: finalPoints,
        totalPoints: newTotalPoints,
        level: newLevel,
        leveledUp,
        newTitles,
        multipliers
      };

    } catch (error) {
      await trx.rollback();
      log.error('Failed to earn points:', error);
      throw error;
    }
  }

  // 보너스 배수 계산
  async calculateMultipliers(userId, activity, metadata) {
    const multipliers = {};

    // 시간대 보너스
    const hour = new Date().getHours();
    if (hour >= 10 && hour <= 14) {
      multipliers.timeBonus = 1.3; // 오전 30% 보너스
    } else if (hour >= 18 && hour <= 20) {
      multipliers.timeBonus = 1.2; // 저녁 20% 보너스
    }

    // 연속 방문 보너스
    const streak = await this.getUserStreak(userId);
    if (streak >= 7) {
      multipliers.streakBonus = 1.5;
    } else if (streak >= 3) {
      multipliers.streakBonus = 1.2;
    }

    // 프리미엄 회원 보너스
    const isPremium = await this.checkPremiumStatus(userId);
    if (isPremium) {
      multipliers.premiumBonus = 1.2;
    }

    // 특별 이벤트 보너스
    const activeEvent = await this.getActiveEvent();
    if (activeEvent) {
      multipliers.eventBonus = activeEvent.multiplier || 2.0;
    }

    return multipliers;
  }

  // 레벨 계산
  calculateLevel(totalPoints) {
    const levels = this.getLevelDefinitions();
    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalPoints >= levels[i].minPoints) {
        return levels[i].level;
      }
    }
    return 1;
  }

  // 레벨 정보 조회
  getLevelInfo(level) {
    const levels = this.getLevelDefinitions();
    return levels.find(l => l.level === level) || levels[0];
  }

  // 진행도 계산
  calculateProgress(current, min, max) {
    if (current <= min) return 0;
    if (current >= max) return 100;
    return Math.round(((current - min) / (max - min)) * 100);
  }

  // 전시 세션 시작
  async startExhibitionSession({ userId, exhibitionId, exhibitionName, location }) {
    try {
      const session = await db.query(`
        INSERT INTO exhibition_sessions 
        (user_id, exhibition_id, exhibition_name, location, start_time)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `, [userId, exhibitionId, exhibitionName, location]);

      // Redis에 활성 세션 저장
      if (this.redis) {
        try {
          await this.redis.setex(
            `session:active:${userId}`,
            86400, // 24시간
            JSON.stringify(session.rows[0])
          );
        } catch (error) {
          log.warn('Redis session save failed:', error.message);
        }
      }

      return session.rows[0];
    } catch (error) {
      log.error('Failed to start exhibition session:', error);
      throw error;
    }
  }

  // 전시 세션 종료
  async endExhibitionSession(sessionId) {
    try {
      const result = await db.query(`
        UPDATE exhibition_sessions
        SET 
          end_time = NOW(),
          duration = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60
        WHERE id = $1 AND end_time IS NULL
        RETURNING *, EXTRACT(EPOCH FROM (end_time - start_time)) / 60 as duration_minutes
      `, [sessionId]);

      if (result.rows.length === 0) {
        throw new Error('Session not found or already ended');
      }

      const session = result.rows[0];
      
      // Redis에서 활성 세션 제거
      if (this.redis) {
        try {
          await this.redis.del(`session:active:${session.user_id}`);
        } catch (error) {
          log.warn('Redis session delete failed:', error.message);
        }
      }

      // 관람 시간에 따른 추가 보너스
      const achievements = [];
      if (session.duration_minutes >= 120) {
        achievements.push('느긋한 산책자');
      }

      return {
        ...session,
        duration: Math.round(session.duration_minutes),
        achievements
      };
    } catch (error) {
      log.error('Failed to end exhibition session:', error);
      throw error;
    }
  }

  // 활성 세션 조회
  async getActiveSession(userId) {
    try {
      // Redis에서 먼저 확인
      if (this.redis) {
        try {
          const cached = await this.redis.get(`session:active:${userId}`);
          if (cached) {
            return JSON.parse(cached);
          }
        } catch (error) {
          log.warn('Redis session read failed:', error.message);
        }
      }

      // DB에서 확인
      const result = await db.query(`
        SELECT * FROM exhibition_sessions
        WHERE user_id = $1 AND end_time IS NULL
        ORDER BY start_time DESC
        LIMIT 1
      `, [userId]);

      return result.rows[0] || null;
    } catch (error) {
      log.error('Failed to get active session:', error);
      throw error;
    }
  }

  // 칭호 관리
  async getUserTitles(userId) {
    try {
      const result = await db.query(`
        SELECT 
          t.*,
          ut.earned_at,
          ut.is_main,
          ut.progress
        FROM titles t
        LEFT JOIN user_titles ut ON t.id = ut.title_id AND ut.user_id = $1
        ORDER BY 
          ut.is_main DESC NULLS LAST,
          ut.earned_at DESC NULLS LAST,
          t.rarity_score DESC
      `, [userId]);

      return result.rows.map(title => ({
        ...title,
        earned: !!title.earned_at,
        progress: title.progress || 0,
        requirement: this.getTitleRequirement(title.id)
      }));
    } catch (error) {
      log.error('Failed to get user titles:', error);
      throw error;
    }
  }

  // 메인 칭호 설정
  async setMainTitle(userId, titleId) {
    const trx = await hybridDB.transaction();
    
    try {
      // 칭호 소유 확인
      const owned = await trx.query(
        'SELECT * FROM user_titles WHERE user_id = $1 AND title_id = $2',
        [userId, titleId]
      );

      if (owned.rows.length === 0) {
        return { success: false, error: 'Title not owned' };
      }

      // 기존 메인 칭호 해제
      await trx.query(
        'UPDATE user_titles SET is_main = false WHERE user_id = $1',
        [userId]
      );

      // 새 메인 칭호 설정
      await trx.query(
        'UPDATE user_titles SET is_main = true WHERE user_id = $1 AND title_id = $2',
        [userId, titleId]
      );

      // user_gamification 테이블 업데이트
      await trx.query(
        'UPDATE user_gamification SET main_title_id = $2 WHERE user_id = $1',
        [userId, titleId]
      );

      await trx.commit();

      // 캐시 무효화
      if (this.redis) {
        try {
          await this.redis.del(`user:stats:${userId}`);
        } catch (error) {
          log.warn('Redis cache delete failed:', error.message);
        }
      }

      return { success: true };
    } catch (error) {
      await trx.rollback();
      log.error('Failed to set main title:', error);
      throw error;
    }
  }

  // 칭호 획득 확인
  async checkAndAwardTitles(trx, userId, activity) {
    const newTitles = [];
    
    // 활동 기반 칭호 확인
    const activityCounts = await this.getUserActivityCounts(trx, userId);
    
    // 얼리버드 (오전 10시 이전 관람 5회)
    if (activityCounts.morning_visits >= 5) {
      const awarded = await this.awardTitle(trx, userId, 'early_bird');
      if (awarded) newTitles.push(awarded);
    }

    // 열정 관람러 (하루 3개 이상 전시 관람)
    if (activityCounts.daily_max_exhibitions >= 3) {
      const awarded = await this.awardTitle(trx, userId, 'passionate_viewer');
      if (awarded) newTitles.push(awarded);
    }

    // 장르별 칭호
    if (activityCounts.contemporary_exhibitions >= 20) {
      const awarded = await this.awardTitle(trx, userId, 'contemporary_lover');
      if (awarded) newTitles.push(awarded);
    }

    return newTitles;
  }

  // 칭호 부여
  async awardTitle(trx, userId, titleKey) {
    try {
      const title = await trx.query(
        'SELECT * FROM titles WHERE key = $1',
        [titleKey]
      );

      if (title.rows.length === 0) return null;

      const titleData = title.rows[0];

      // 이미 획득했는지 확인
      const existing = await trx.query(
        'SELECT * FROM user_titles WHERE user_id = $1 AND title_id = $2',
        [userId, titleData.id]
      );

      if (existing.rows.length > 0) return null;

      // 칭호 부여
      await trx.query(
        'INSERT INTO user_titles (user_id, title_id) VALUES ($1, $2)',
        [userId, titleData.id]
      );

      return titleData;
    } catch (error) {
      log.error('Failed to award title:', error);
      return null;
    }
  }

  // 도전 과제 관리
  async getUserChallenges(userId, status = 'active') {
    try {
      let query = `
        SELECT 
          c.*,
          uc.progress,
          uc.completed_at,
          uc.claimed_at
        FROM challenges c
        LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = $1
        WHERE c.active = true
      `;

      const params = [userId];

      if (status === 'active') {
        query += ' AND (uc.completed_at IS NULL OR uc.claimed_at IS NULL)';
      } else if (status === 'completed') {
        query += ' AND uc.completed_at IS NOT NULL';
      }

      query += ' ORDER BY c.priority DESC, c.created_at DESC';

      const result = await db.query(query, params);

      return result.rows.map(challenge => ({
        ...challenge,
        progress: challenge.progress || 0,
        status: this.getChallengeStatus(challenge),
        timeLeft: this.getTimeLeft(challenge.expires_at)
      }));
    } catch (error) {
      log.error('Failed to get user challenges:', error);
      throw error;
    }
  }

  // 도전 과제 진행도 업데이트
  async updateChallengeProgress(trx, userId, activity, metadata) {
    // 활동 관련 도전 과제 조회
    const challenges = await trx.query(`
      SELECT c.* FROM challenges c
      WHERE c.active = true 
      AND c.criteria->>'activity' = $1
      AND NOT EXISTS (
        SELECT 1 FROM user_challenges uc 
        WHERE uc.challenge_id = c.id 
        AND uc.user_id = $2 
        AND uc.completed_at IS NOT NULL
      )
    `, [activity, userId]);

    for (const challenge of challenges.rows) {
      await this.incrementChallengeProgress(trx, userId, challenge.id, 1);
    }
  }

  // 도전 과제 진행도 증가
  async incrementChallengeProgress(trx, userId, challengeId, increment = 1) {
    const result = await trx.query(`
      INSERT INTO user_challenges (user_id, challenge_id, progress)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, challenge_id)
      DO UPDATE SET 
        progress = user_challenges.progress + $3,
        updated_at = NOW()
      RETURNING *
    `, [userId, challengeId, increment]);

    const userChallenge = result.rows[0];

    // 목표 달성 확인
    const challenge = await trx.query(
      'SELECT * FROM challenges WHERE id = $1',
      [challengeId]
    );

    if (challenge.rows.length > 0 && userChallenge.progress >= challenge.rows[0].target) {
      await trx.query(
        'UPDATE user_challenges SET completed_at = NOW() WHERE user_id = $1 AND challenge_id = $2',
        [userId, challengeId]
      );
    }
  }

  // 리더보드
  async getLeaderboard(type = 'weekly', limit = 50) {
    try {
      let query;
      
      switch (type) {
        case 'weekly':
          query = `
            SELECT 
              u.id as user_id,
              u.username,
              u.profile_image,
              ug.level,
              COALESCE(SUM(al.points_earned), 0) as points,
              RANK() OVER (ORDER BY COALESCE(SUM(al.points_earned), 0) DESC) as rank
            FROM users u
            JOIN user_gamification ug ON u.id = ug.user_id
            LEFT JOIN activity_logs al ON u.id = al.user_id 
              AND al.created_at >= DATE_TRUNC('week', CURRENT_DATE)
            GROUP BY u.id, u.username, u.profile_image, ug.level
            ORDER BY points DESC
            LIMIT $1
          `;
          break;
          
        case 'monthly':
          query = `
            SELECT 
              u.id as user_id,
              u.username,
              u.profile_image,
              ug.level,
              COALESCE(SUM(al.points_earned), 0) as points,
              RANK() OVER (ORDER BY COALESCE(SUM(al.points_earned), 0) DESC) as rank
            FROM users u
            JOIN user_gamification ug ON u.id = ug.user_id
            LEFT JOIN activity_logs al ON u.id = al.user_id 
              AND al.created_at >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY u.id, u.username, u.profile_image, ug.level
            ORDER BY points DESC
            LIMIT $1
          `;
          break;
          
        case 'all-time':
        default:
          query = `
            SELECT 
              u.id as user_id,
              u.username,
              u.profile_image,
              ug.level,
              ug.total_points as points,
              RANK() OVER (ORDER BY ug.total_points DESC) as rank
            FROM users u
            JOIN user_gamification ug ON u.id = ug.user_id
            ORDER BY ug.total_points DESC
            LIMIT $1
          `;
      }

      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      log.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  // 사용자 순위 조회
  async getUserRank(userId, type = 'weekly') {
    try {
      let query;

      switch (type) {
        case 'weekly':
          query = `
            WITH weekly_ranks AS (
              SELECT 
                user_id,
                COALESCE(SUM(points_earned), 0) as points,
                RANK() OVER (ORDER BY COALESCE(SUM(points_earned), 0) DESC) as rank
              FROM activity_logs
              WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
              GROUP BY user_id
            )
            SELECT * FROM weekly_ranks WHERE user_id = $1
          `;
          break;
          
        case 'monthly':
          query = `
            WITH monthly_ranks AS (
              SELECT 
                user_id,
                COALESCE(SUM(points_earned), 0) as points,
                RANK() OVER (ORDER BY COALESCE(SUM(points_earned), 0) DESC) as rank
              FROM activity_logs
              WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
              GROUP BY user_id
            )
            SELECT * FROM monthly_ranks WHERE user_id = $1
          `;
          break;
          
        case 'all-time':
        default:
          query = `
            WITH all_time_ranks AS (
              SELECT 
                user_id,
                total_points as points,
                RANK() OVER (ORDER BY total_points DESC) as rank
              FROM user_gamification
            )
            SELECT * FROM all_time_ranks WHERE user_id = $1
          `;
      }

      const result = await hybridDB.query(query, [userId]);
      return result.rows[0] || { rank: null, points: 0 };
    } catch (error) {
      log.error('Failed to get user rank:', error);
      throw error;
    }
  }

  // 친구 리더보드
  async getFriendsLeaderboard(userId) {
    try {
      const query = `
        WITH friends AS (
          SELECT following_id as friend_id FROM follows WHERE follower_id = $1
          UNION
          SELECT follower_id as friend_id FROM follows WHERE following_id = $1
        ),
        friend_stats AS (
          SELECT 
            u.id,
            u.username,
            u.profile_image,
            ug.level,
            ug.total_points,
            COALESCE(SUM(al.points_earned), 0) as weekly_points
          FROM friends f
          JOIN users u ON u.id = f.friend_id
          JOIN user_gamification ug ON u.id = ug.user_id
          LEFT JOIN activity_logs al ON u.id = al.user_id 
            AND al.created_at >= DATE_TRUNC('week', CURRENT_DATE)
          GROUP BY u.id, u.username, u.profile_image, ug.level, ug.total_points
          
          UNION ALL
          
          SELECT 
            u.id,
            u.username,
            u.profile_image,
            ug.level,
            ug.total_points,
            COALESCE(SUM(al.points_earned), 0) as weekly_points
          FROM users u
          JOIN user_gamification ug ON u.id = ug.user_id
          LEFT JOIN activity_logs al ON u.id = al.user_id 
            AND al.created_at >= DATE_TRUNC('week', CURRENT_DATE)
          WHERE u.id = $1
          GROUP BY u.id, u.username, u.profile_image, ug.level, ug.total_points
        )
        SELECT 
          *,
          RANK() OVER (ORDER BY weekly_points DESC) as rank
        FROM friend_stats
        ORDER BY weekly_points DESC
      `;

      const result = await hybridDB.query(query, [userId]);
      return result.rows;
    } catch (error) {
      log.error('Failed to get friends leaderboard:', error);
      throw error;
    }
  }

  // 활동 기록 조회
  async getActivityHistory(userId, options = {}) {
    try {
      const { limit = 20, offset = 0, type } = options;
      
      let query = `
        SELECT 
          al.*,
          CASE 
            WHEN al.activity_type LIKE 'EXHIBITION_%' THEN 'exhibition'
            WHEN al.activity_type LIKE 'REVIEW_%' THEN 'review'
            WHEN al.activity_type LIKE 'SOCIAL_%' THEN 'social'
            ELSE 'other'
          END as category
        FROM activity_logs al
        WHERE al.user_id = $1
      `;

      const params = [userId];

      if (type) {
        query += ' AND al.activity_type = $2';
        params.push(type);
      }

      query += ' ORDER BY al.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      log.error('Failed to get activity history:', error);
      throw error;
    }
  }

  // 주간 진행도
  async getWeeklyProgress(userId) {
    try {
      const query = `
        WITH daily_points AS (
          SELECT 
            DATE(created_at) as date,
            SUM(points_earned) as points
          FROM activity_logs
          WHERE user_id = $1
            AND created_at >= DATE_TRUNC('week', CURRENT_DATE)
          GROUP BY DATE(created_at)
        ),
        week_days AS (
          SELECT generate_series(
            DATE_TRUNC('week', CURRENT_DATE),
            DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days',
            INTERVAL '1 day'
          )::date as date
        )
        SELECT 
          wd.date,
          COALESCE(dp.points, 0) as points,
          EXTRACT(DOW FROM wd.date) as day_of_week
        FROM week_days wd
        LEFT JOIN daily_points dp ON wd.date = dp.date
        ORDER BY wd.date
      `;

      const result = await hybridDB.query(query, [userId]);
      
      const weekData = result.rows;
      const totalPoints = weekData.reduce((sum, day) => sum + day.points, 0);
      const activeDays = weekData.filter(day => day.points > 0).length;

      return {
        daily: weekData,
        totalPoints,
        activeDays,
        weeklyGoal: 500, // 주간 목표
        goalProgress: Math.min(100, (totalPoints / 500) * 100)
      };
    } catch (error) {
      log.error('Failed to get weekly progress:', error);
      throw error;
    }
  }

  // 상세 통계
  async getDetailedUserStats(userId) {
    try {
      const stats = await this.getUserStats(userId);
      
      // 추가 통계 조회
      const [
        exhibitionStats,
        socialStats,
        achievementStats
      ] = await Promise.all([
        this.getExhibitionStats(userId),
        this.getSocialStats(userId),
        this.getAchievementStats(userId)
      ]);

      return {
        ...stats,
        exhibitions: exhibitionStats,
        social: socialStats,
        achievements: achievementStats
      };
    } catch (error) {
      log.error('Failed to get detailed user stats:', error);
      throw error;
    }
  }

  // 전시 통계
  async getExhibitionStats(userId) {
    const query = `
      SELECT 
        COUNT(DISTINCT exhibition_id) as total_exhibitions,
        COUNT(*) as total_visits,
        AVG(duration) as avg_duration,
        MAX(duration) as max_duration,
        COUNT(DISTINCT DATE(start_time)) as unique_days
      FROM exhibition_sessions
      WHERE user_id = $1 AND end_time IS NOT NULL
    `;

    const result = await hybridDB.query(query, [userId]);
    return result.rows[0];
  }

  // 소셜 통계
  async getSocialStats(userId) {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = $1) as follower_count,
        (SELECT COUNT(*) FROM reviews WHERE user_id = $1) as review_count,
        (SELECT COUNT(*) FROM review_likes rl JOIN reviews r ON rl.review_id = r.id WHERE r.user_id = $1) as likes_received
    `;

    const result = await hybridDB.query(query, [userId]);
    return result.rows[0];
  }

  // 업적 통계
  async getAchievementStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_titles,
        COUNT(CASE WHEN rarity = 'legendary' THEN 1 END) as legendary_titles,
        COUNT(CASE WHEN rarity = 'epic' THEN 1 END) as epic_titles,
        COUNT(CASE WHEN rarity = 'rare' THEN 1 END) as rare_titles,
        COUNT(CASE WHEN rarity = 'common' THEN 1 END) as common_titles
      FROM user_titles ut
      JOIN titles t ON ut.title_id = t.id
      WHERE ut.user_id = $1
    `;

    const result = await hybridDB.query(query, [userId]);
    return result.rows[0];
  }

  // 유틸리티 함수들
  async getUserStreak(userId) {
    const query = `
      WITH daily_activity AS (
        SELECT DISTINCT DATE(created_at) as activity_date
        FROM activity_logs
        WHERE user_id = $1
        ORDER BY activity_date DESC
      ),
      streak_calc AS (
        SELECT 
          activity_date,
          activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date DESC) - 1) * INTERVAL '1 day' as streak_group
        FROM daily_activity
      )
      SELECT 
        COUNT(*) as streak_days
      FROM streak_calc
      WHERE streak_group = (
        SELECT MAX(streak_group) 
        FROM streak_calc 
        WHERE activity_date >= CURRENT_DATE - INTERVAL '1 day'
      )
    `;

    const result = await hybridDB.query(query, [userId]);
    return result.rows[0]?.streak_days || 0;
  }

  async checkPremiumStatus(userId) {
    try {
      // 캐시에서 먼저 확인
      if (this.redis) {
        try {
          const cached = await this.redis.get(`user:premium:${userId}`);
          if (cached !== null) {
            return cached === 'true';
          }
        } catch (error) {
          log.warn('Redis premium cache read failed:', error.message);
        }
      }

      // DB에서 프리미엄 상태 조회
      const result = await hybridDB.query(
        `SELECT 
          CASE 
            WHEN subscription_end_date >= NOW() THEN true
            WHEN is_premium = true THEN true
            ELSE false
          END as is_premium,
          subscription_type,
          subscription_end_date
        FROM users
        WHERE id = $1`,
        [userId]
      );

      const isPremium = result.rows[0]?.is_premium || false;
      
      // 캐시에 저장 (1시간)
      if (this.redis) {
        try {
          await this.redis.setex(`user:premium:${userId}`, 3600, isPremium.toString());
        } catch (error) {
          log.warn('Redis premium cache write failed:', error.message);
        }
      }
      
      return isPremium;
    } catch (error) {
      log.error('Failed to check premium status:', error);
      return false;
    }
  }

  async getActiveEvent() {
    const query = `
      SELECT * FROM gamification_events
      WHERE start_date <= NOW() AND end_date >= NOW()
      AND active = true
      ORDER BY priority DESC
      LIMIT 1
    `;

    const result = await hybridDB.query(query);
    return result.rows[0];
  }

  async getUserActivityCounts(trx, userId) {
    const query = `
      SELECT 
        COUNT(CASE WHEN EXTRACT(HOUR FROM start_time) < 10 THEN 1 END) as morning_visits,
        MAX(daily_count) as daily_max_exhibitions,
        COUNT(CASE WHEN metadata->>'genre' = 'contemporary' THEN 1 END) as contemporary_exhibitions
      FROM (
        SELECT 
          es.*,
          COUNT(*) OVER (PARTITION BY DATE(start_time)) as daily_count
        FROM exhibition_sessions es
        WHERE user_id = $1
      ) t
    `;

    const result = await trx.query(query, [userId]);
    return result.rows[0];
  }

  getTitleRequirement(titleId) {
    // 칭호별 요구사항 정의
    const requirements = {
      'early_bird': { type: 'count', target: 5, description: '오전 10시 이전 관람 5회' },
      'passionate_viewer': { type: 'daily', target: 3, description: '하루 3개 이상 전시 관람' },
      'contemporary_lover': { type: 'genre', target: 20, description: '현대미술 전시 20회 관람' }
    };

    return requirements[titleId] || {};
  }

  getChallengeStatus(challenge) {
    if (challenge.completed_at && challenge.claimed_at) return 'claimed';
    if (challenge.completed_at) return 'completed';
    if (challenge.expires_at && new Date(challenge.expires_at) < new Date()) return 'expired';
    return 'active';
  }

  getTimeLeft(expiresAt) {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}일 ${hours}시간`;
    return `${hours}시간`;
  }

  // 실시간 업데이트
  publishUpdate(userId, data) {
    const channel = `gamification:${userId}`;
    if (this.redis) {
      try {
        this.redis.publish(channel, JSON.stringify(data));
      } catch (error) {
        log.warn('Redis publish failed:', error.message);
      }
    }
    this.emit('update', { userId, data });
  }

  subscribeToUpdates(userId) {
    if (!this.redis || !process.env.REDIS_URL) {
      log.warn('Cannot subscribe to updates - Redis not available');
      return null;
    }
    try {
      const subscriber = new Redis(process.env.REDIS_URL);
      subscriber.subscribe(`gamification:${userId}`);
      return subscriber;
    } catch (error) {
      log.error('Failed to create Redis subscriber:', error);
      return null;
    }
  }

  // 특정 활동 처리
  async handleSpecificActivity(trx, userId, activity, metadata) {
    switch (activity) {
      case 'EXHIBITION_COMPLETE':
        await this.updateExhibitionCount(trx, userId);
        break;
      case 'WRITE_REVIEW':
        await this.updateReviewStats(trx, userId, metadata);
        break;
      case 'DAILY_CHECKIN':
        await this.updateDailyStreak(trx, userId);
        break;
    }
  }

  async updateExhibitionCount(trx, userId) {
    await trx.query(`
      UPDATE user_gamification 
      SET total_exhibitions = total_exhibitions + 1
      WHERE user_id = $1
    `, [userId]);
  }

  async updateReviewStats(trx, userId, metadata) {
    // 리뷰 관련 통계 업데이트
    if (metadata.reviewLength > 200) {
      // 긴 리뷰 작성 보너스
      await this.incrementChallengeProgress(trx, userId, 'detailed_reviewer', 1);
    }
  }

  async updateDailyStreak(trx, userId) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hasYesterdayActivity = await trx.query(`
      SELECT 1 FROM activity_logs 
      WHERE user_id = $1 
      AND DATE(created_at) = $2
      LIMIT 1
    `, [userId, yesterday.toISOString().split('T')[0]]);

    if (hasYesterdayActivity.rows.length > 0) {
      await trx.query(`
        UPDATE user_gamification 
        SET weekly_streak = weekly_streak + 1
        WHERE user_id = $1
      `, [userId]);
    } else {
      await trx.query(`
        UPDATE user_gamification 
        SET weekly_streak = 1
        WHERE user_id = $1
      `, [userId]);
    }
  }

  // 최근 업적
  async getRecentAchievements(userId, limit = 5) {
    const query = `
      SELECT 
        t.*,
        ut.earned_at
      FROM user_titles ut
      JOIN titles t ON ut.title_id = t.id
      WHERE ut.user_id = $1
      ORDER BY ut.earned_at DESC
      LIMIT $2
    `;

    const result = await db.query(query, [userId, limit]);
    return result.rows;
  }

  // 예정된 도전 과제
  async getUpcomingChallenges(userId) {
    const query = `
      SELECT 
        c.*,
        uc.progress,
        uc.completed_at
      FROM challenges c
      LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = $1
      WHERE c.active = true
      AND (uc.completed_at IS NULL OR uc.claimed_at IS NULL)
      AND c.expires_at > NOW()
      ORDER BY c.expires_at ASC
      LIMIT 5
    `;

    const result = await hybridDB.query(query, [userId]);
    return result.rows;
  }

  // 친구 활동
  async getFriendsActivity(userId, limit = 10) {
    const query = `
      SELECT 
        al.*,
        u.username,
        u.profile_image
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      WHERE al.user_id IN (
        SELECT following_id FROM follows WHERE follower_id = $1
      )
      AND al.created_at > NOW() - INTERVAL '7 days'
      ORDER BY al.created_at DESC
      LIMIT $2
    `;

    const result = await db.query(query, [userId, limit]);
    return result.rows;
  }

  // 권한 확인
  async canViewUserStats(viewerId, targetUserId) {
    // 자기 자신이거나 팔로우 관계인 경우 볼 수 있음
    if (viewerId === targetUserId) return true;

    const query = `
      SELECT 1 FROM follows 
      WHERE follower_id = $1 AND following_id = $2
      LIMIT 1
    `;

    const result = await db.query(query, [viewerId, targetUserId]);
    return result.rows.length > 0;
  }

  // 세션 정보 조회
  async getSession(sessionId) {
    const query = 'SELECT * FROM exhibition_sessions WHERE id = $1';
    const result = await db.query(query, [sessionId]);
    return result.rows[0];
  }

  // 관리자 기능
  async getGamificationMetrics() {
    const query = `
      SELECT 
        COUNT(DISTINCT user_id) as total_users,
        AVG(level) as avg_level,
        MAX(level) as max_level,
        AVG(total_points) as avg_points,
        COUNT(DISTINCT CASE WHEN last_activity > NOW() - INTERVAL '7 days' THEN user_id END) as weekly_active_users,
        COUNT(DISTINCT CASE WHEN last_activity > NOW() - INTERVAL '30 days' THEN user_id END) as monthly_active_users
      FROM user_gamification
    `;

    const result = await hybridDB.query(query);
    return result.rows[0];
  }

  // 서비스 정리
  async cleanup() {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (error) {
        log.warn('Redis cleanup failed:', error.message);
      }
    }
  }
}

// 싱글톤 인스턴스
let gamificationService;

function getGamificationService() {
  if (!gamificationService) {
    gamificationService = new GamificationService();
  }
  return gamificationService;
}

module.exports = {
  GamificationService,
  getGamificationService
};