const { pool } = require('../config/database');

class JourneyNudgeService {
  // 새 사용자 가입 시 7일 여정 초기화
  async initializeJourney(userId) {
    try {
      // 7일간의 nudge 생성
      const insertQuery = `
        INSERT INTO journey_nudges (user_id, day_number, nudge_type, title, message, cta_text, cta_link)
        SELECT 
          $1,
          jt.day_number,
          jt.nudge_type,
          CASE WHEN $2 = 'ko' THEN jt.title_ko ELSE jt.title_en END,
          CASE WHEN $2 = 'ko' THEN jt.message_ko ELSE jt.message_en END,
          CASE WHEN $2 = 'ko' THEN jt.cta_text_ko ELSE jt.cta_text_en END,
          jt.cta_link
        FROM journey_templates jt
        WHERE jt.is_active = true
        ORDER BY jt.day_number
      `;

      await pool.query(insertQuery, [userId, 'ko']); // 기본 한국어

      // 첫 번째 환영 메시지는 즉시 활성화
      await this.scheduleNudge(userId, 1);

      console.log(`✅ Journey initialized for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Journey initialization error:', error);
      throw error;
    }
  }

  // 특정 날짜의 nudge 스케줄링
  async scheduleNudge(userId, dayNumber) {
    try {
      const scheduleTime = new Date();
      if (dayNumber > 1) {
        scheduleTime.setDate(scheduleTime.getDate() + (dayNumber - 1));
      }

      const result = await pool.query(`
        UPDATE journey_nudges 
        SET sent_at = $1
        WHERE user_id = $2 AND day_number = $3
        RETURNING *
      `, [scheduleTime, userId, dayNumber]);

      return result.rows[0];
    } catch (error) {
      console.error('Nudge scheduling error:', error);
      throw error;
    }
  }

  // 사용자의 현재 여정 상태 조회
  async getUserJourneyStatus(userId) {
    try {
      const result = await pool.query(`
        SELECT 
          day_number,
          nudge_type,
          title,
          message,
          cta_text,
          cta_link,
          sent_at,
          viewed_at,
          clicked_at,
          CASE 
            WHEN viewed_at IS NULL AND sent_at IS NOT NULL THEN 'unread'
            WHEN viewed_at IS NOT NULL AND clicked_at IS NULL THEN 'read'
            WHEN clicked_at IS NOT NULL THEN 'completed'
            ELSE 'pending'
          END as status
        FROM journey_nudges 
        WHERE user_id = $1 
        ORDER BY day_number
      `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('Journey status error:', error);
      throw error;
    }
  }

  // 오늘 보여줄 nudge 조회
  async getTodaysNudge(userId) {
    try {
      const result = await pool.query(`
        SELECT 
          day_number,
          nudge_type,
          title,
          message,
          cta_text,
          cta_link,
          sent_at
        FROM journey_nudges 
        WHERE user_id = $1 
          AND sent_at IS NOT NULL 
          AND viewed_at IS NULL
          AND sent_at <= NOW()
        ORDER BY day_number
        LIMIT 1
      `, [userId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Todays nudge error:', error);
      throw error;
    }
  }

  // nudge 확인 처리
  async markNudgeAsViewed(userId, dayNumber) {
    try {
      const result = await pool.query(`
        UPDATE journey_nudges 
        SET viewed_at = NOW()
        WHERE user_id = $1 AND day_number = $2
        RETURNING *
      `, [userId, dayNumber]);

      // 다음 날 nudge 자동 스케줄링
      if (dayNumber < 7) {
        await this.scheduleNudge(userId, dayNumber + 1);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Mark viewed error:', error);
      throw error;
    }
  }

  // nudge 클릭 처리
  async markNudgeAsClicked(userId, dayNumber) {
    try {
      const result = await pool.query(`
        UPDATE journey_nudges 
        SET clicked_at = NOW()
        WHERE user_id = $1 AND day_number = $2
        RETURNING *
      `, [userId, dayNumber]);

      return result.rows[0];
    } catch (error) {
      console.error('Mark clicked error:', error);
      throw error;
    }
  }

  // 여정 완료율 통계
  async getJourneyStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(DISTINCT user_id) as total_users,
          COUNT(DISTINCT user_id) FILTER (WHERE viewed_at IS NOT NULL) as users_with_views,
          COUNT(DISTINCT user_id) FILTER (WHERE clicked_at IS NOT NULL) as users_with_clicks,
          AVG(CASE WHEN viewed_at IS NOT NULL THEN day_number END) as avg_days_viewed,
          COUNT(*) FILTER (WHERE day_number = 7 AND viewed_at IS NOT NULL) as completed_journeys
        FROM journey_nudges
      `);

      return result.rows[0];
    } catch (error) {
      console.error('Journey stats error:', error);
      throw error;
    }
  }
}

module.exports = new JourneyNudgeService();
