const pool = require('../config/database');
const webpush = require('web-push');

// Web Push 설정 (환경 변수가 있을 때만)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@sayu.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

class DailyHabitService {
  // 사용자 습관 설정 조회
  async getUserHabitSettings(userId) {
    const query = `
      SELECT * FROM user_habit_settings
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // 사용자 습관 설정 생성/업데이트
  async upsertUserHabitSettings(userId, settings) {
    const query = `
      INSERT INTO user_habit_settings (
        user_id, morning_time, lunch_time, night_time,
        morning_enabled, lunch_enabled, night_enabled,
        push_enabled, email_reminder, timezone, active_days
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id) DO UPDATE SET
        morning_time = EXCLUDED.morning_time,
        lunch_time = EXCLUDED.lunch_time,
        night_time = EXCLUDED.night_time,
        morning_enabled = EXCLUDED.morning_enabled,
        lunch_enabled = EXCLUDED.lunch_enabled,
        night_enabled = EXCLUDED.night_enabled,
        push_enabled = EXCLUDED.push_enabled,
        email_reminder = EXCLUDED.email_reminder,
        timezone = EXCLUDED.timezone,
        active_days = EXCLUDED.active_days,
        updated_at = NOW()
      RETURNING *
    `;
    
    const values = [
      userId,
      settings.morningTime || '08:00',
      settings.lunchTime || '12:30',
      settings.nightTime || '22:00',
      settings.morningEnabled !== false,
      settings.lunchEnabled !== false,
      settings.nightEnabled !== false,
      settings.pushEnabled !== false,
      settings.emailReminder || false,
      settings.timezone || 'Asia/Seoul',
      settings.activeDays || [1, 2, 3, 4, 5]
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 일일 기록 조회
  async getDailyEntry(userId, date) {
    const query = `
      SELECT de.*, 
        ma.title as morning_artwork_title,
        ma.artist_display_name as morning_artist,
        ma.primary_image_url as morning_image_url,
        la.title as lunch_artwork_title,
        la.artist_display_name as lunch_artist,
        la.primary_image_url as lunch_image_url,
        na.title as night_artwork_title,
        na.artist_display_name as night_artist,
        na.primary_image_url as night_image_url
      FROM daily_art_entries de
      LEFT JOIN artworks_extended ma ON de.morning_artwork_id = ma.id
      LEFT JOIN artworks_extended la ON de.lunch_artwork_id = la.id
      LEFT JOIN artworks_extended na ON de.night_artwork_id = na.id
      WHERE de.user_id = $1 AND de.entry_date = $2
    `;
    const result = await pool.query(query, [userId, date]);
    return result.rows[0];
  }

  // 일일 기록 생성/업데이트
  async upsertDailyEntry(userId, date, entryData) {
    const query = `
      INSERT INTO daily_art_entries (
        user_id, entry_date
      ) VALUES ($1, $2)
      ON CONFLICT (user_id, entry_date) DO UPDATE SET
        updated_at = NOW()
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, date]);
    return result.rows[0];
  }

  // 아침 활동 기록
  async recordMorningActivity(userId, date, data) {
    const query = `
      UPDATE daily_art_entries
      SET 
        morning_artwork_id = $3,
        morning_question = $4,
        morning_response = $5,
        morning_color = $6,
        morning_completed_at = NOW(),
        daily_completion_rate = 
          CASE 
            WHEN lunch_completed_at IS NOT NULL AND night_completed_at IS NOT NULL THEN 1.0
            WHEN lunch_completed_at IS NOT NULL OR night_completed_at IS NOT NULL THEN 0.66
            ELSE 0.33
          END,
        updated_at = NOW()
      WHERE user_id = $1 AND entry_date = $2
      RETURNING *
    `;
    
    const values = [
      userId, 
      date,
      data.artworkId,
      data.question,
      data.response,
      data.color
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 점심 활동 기록
  async recordLunchActivity(userId, date, data) {
    const query = `
      UPDATE daily_art_entries
      SET 
        lunch_emotion = $3,
        lunch_artwork_id = $4,
        lunch_reason = $5,
        lunch_completed_at = NOW(),
        daily_completion_rate = 
          CASE 
            WHEN morning_completed_at IS NOT NULL AND night_completed_at IS NOT NULL THEN 1.0
            WHEN morning_completed_at IS NOT NULL OR night_completed_at IS NOT NULL THEN 0.66
            ELSE 0.33
          END,
        updated_at = NOW()
      WHERE user_id = $1 AND entry_date = $2
      RETURNING *
    `;
    
    const values = [
      userId,
      date,
      data.emotion,
      data.artworkId,
      data.reason
    ];
    
    const result = await pool.query(query, values);
    
    // 감정 체크인 기록
    await this.recordEmotionCheckin(userId, 'lunch', data.emotion, data.artworkId);
    
    return result.rows[0];
  }

  // 밤 활동 기록
  async recordNightActivity(userId, date, data) {
    const query = `
      UPDATE daily_art_entries
      SET 
        night_artwork_id = $3,
        night_reflection = $4,
        night_mood_tags = $5,
        night_completed_at = NOW(),
        daily_completion_rate = 
          CASE 
            WHEN morning_completed_at IS NOT NULL AND lunch_completed_at IS NOT NULL THEN 1.0
            WHEN morning_completed_at IS NOT NULL OR lunch_completed_at IS NOT NULL THEN 0.66
            ELSE 0.33
          END,
        updated_at = NOW()
      WHERE user_id = $1 AND entry_date = $2
      RETURNING *
    `;
    
    const values = [
      userId,
      date,
      data.artworkId,
      data.reflection,
      data.moodTags || []
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 감정 체크인 기록
  async recordEmotionCheckin(userId, timeOfDay, emotion, artworkId, additionalData = {}) {
    const query = `
      INSERT INTO emotion_checkins (
        user_id, time_of_day, primary_emotion, selected_artwork_id,
        secondary_emotions, energy_level, stress_level, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      userId,
      timeOfDay,
      emotion,
      artworkId,
      additionalData.secondaryEmotions || [],
      additionalData.energyLevel || null,
      additionalData.stressLevel || null,
      additionalData.notes || null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 현재 스트릭 조회
  async getUserStreak(userId) {
    const query = `
      SELECT * FROM user_streaks
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // 일일 추천 작품 조회
  async getDailyArtworkRecommendations(userId, date, timeSlot) {
    // 먼저 큐에서 확인
    const queueQuery = `
      SELECT aq.*, ae.* 
      FROM daily_artwork_queue aq
      JOIN artworks_extended ae ON aq.artwork_id = ae.id
      WHERE aq.user_id = $1 AND aq.queue_date = $2 AND aq.time_slot = $3
      AND aq.is_used = false
    `;
    
    const queueResult = await pool.query(queueQuery, [userId, date, timeSlot]);
    
    if (queueResult.rows.length > 0) {
      // 사용 표시
      await pool.query(
        'UPDATE daily_artwork_queue SET is_used = true, used_at = NOW() WHERE id = $1',
        [queueResult.rows[0].id]
      );
      return queueResult.rows[0];
    }
    
    // 큐가 비어있으면 새로운 추천 생성
    return this.generateArtworkRecommendation(userId, timeSlot);
  }

  // 작품 추천 생성
  async generateArtworkRecommendation(userId, timeSlot) {
    // 사용자 프로필과 선호도 기반 추천
    const query = `
      WITH user_preferences AS (
        SELECT 
          up.type_code,
          up.emotional_tags,
          up.aesthetic_vector
        FROM user_profiles up
        WHERE up.user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      ),
      recent_views AS (
        SELECT artwork_id
        FROM daily_art_entries
        WHERE user_id = $1
        AND entry_date > CURRENT_DATE - INTERVAL '30 days'
      )
      SELECT ae.*
      FROM artworks_extended ae
      WHERE ae.id NOT IN (SELECT artwork_id FROM recent_views WHERE artwork_id IS NOT NULL)
      AND ae.primary_image_url IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // 푸시 구독 등록
  async subscribeToPush(userId, subscription) {
    const query = `
      INSERT INTO push_subscriptions (
        user_id, endpoint, p256dh, auth, user_agent
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, endpoint) DO UPDATE SET
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        user_agent = EXCLUDED.user_agent,
        updated_at = NOW()
      RETURNING *
    `;
    
    const values = [
      userId,
      subscription.endpoint,
      subscription.keys.p256dh,
      subscription.keys.auth,
      subscription.userAgent || null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 푸시 알림 전송
  async sendPushNotification(userId, notificationType, payload) {
    // 사용자의 구독 정보 조회
    const subscriptions = await pool.query(
      'SELECT * FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );
    
    const notifications = [];
    
    for (const sub of subscriptions.rows) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };
      
      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        );
        
        // 알림 로그 기록
        await this.logNotification(userId, notificationType, 'sent', payload);
        notifications.push({ success: true, endpoint: sub.endpoint });
      } catch (error) {
        console.error('Push notification error:', error);
        await this.logNotification(userId, notificationType, 'failed', payload, error.message);
        notifications.push({ success: false, endpoint: sub.endpoint, error: error.message });
      }
    }
    
    return notifications;
  }

  // 알림 로그 기록
  async logNotification(userId, notificationType, status, payload, errorMessage = null) {
    const query = `
      INSERT INTO notification_logs (
        user_id, notification_type, sent_at, delivery_status, 
        payload, error_message
      ) VALUES ($1, $2, NOW(), $3, $4, $5)
    `;
    
    await pool.query(query, [
      userId,
      notificationType,
      status,
      payload,
      errorMessage
    ]);
  }

  // 습관 보상 확인 및 부여
  async checkAndGrantRewards(userId) {
    const streak = await this.getUserStreak(userId);
    if (!streak) return [];
    
    const rewards = [];
    
    // 7일 달성
    if (streak.current_streak >= 7 && !streak.achieved_7_days) {
      await this.grantReward(userId, 'badge', '일주일의 예술가', 7);
      rewards.push({ type: 'badge', name: '일주일의 예술가', days: 7 });
    }
    
    // 30일 달성
    if (streak.current_streak >= 30 && !streak.achieved_30_days) {
      await this.grantReward(userId, 'exhibition_invite', '특별 전시 초대권', 30);
      rewards.push({ type: 'exhibition_invite', name: '특별 전시 초대권', days: 30 });
    }
    
    // 100일 달성
    if (streak.current_streak >= 100 && !streak.achieved_100_days) {
      await this.grantReward(userId, 'mentor_match', '아트 멘토 매칭', 100);
      rewards.push({ type: 'mentor_match', name: '아트 멘토 매칭', days: 100 });
    }
    
    return rewards;
  }

  // 보상 부여
  async grantReward(userId, rewardType, rewardName, milestoneDays) {
    const query = `
      INSERT INTO habit_rewards (
        user_id, reward_type, reward_name, milestone_days
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, reward_type, milestone_days) DO NOTHING
    `;
    
    await pool.query(query, [userId, rewardType, rewardName, milestoneDays]);
  }

  // 활동 패턴 분석
  async getActivityPatterns(userId) {
    const query = `
      SELECT 
        day_of_week,
        hour_of_day,
        activity_count,
        avg_completion_time,
        last_activity
      FROM user_activity_patterns
      WHERE user_id = $1
      ORDER BY activity_count DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // 월간 습관 통계
  async getMonthlyStats(userId, year, month) {
    const query = `
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN daily_completion_rate > 0 THEN 1 ELSE 0 END) as active_days,
        SUM(CASE WHEN daily_completion_rate = 1.0 THEN 1 ELSE 0 END) as perfect_days,
        AVG(daily_completion_rate) as avg_completion_rate,
        COUNT(DISTINCT morning_artwork_id) + 
        COUNT(DISTINCT lunch_artwork_id) + 
        COUNT(DISTINCT night_artwork_id) as unique_artworks_viewed
      FROM daily_art_entries
      WHERE user_id = $1
      AND EXTRACT(YEAR FROM entry_date) = $2
      AND EXTRACT(MONTH FROM entry_date) = $3
    `;
    
    const result = await pool.query(query, [userId, year, month]);
    return result.rows[0];
  }
}

module.exports = new DailyHabitService();