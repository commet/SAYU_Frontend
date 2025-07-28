const cron = require('node-cron');
const dailyHabitService = require('../services/dailyHabitService');
const pool = require('../config/database');
const { log } = require('../config/logger');

// 푸시 알림 메시지 템플릿
const notificationTemplates = {
  morning: {
    title: '🌅 출근길 3분 예술',
    body: '오늘을 시작하는 특별한 작품이 도착했어요',
    data: { url: '/daily-art?time=morning' }
  },
  lunch: {
    title: '☕ 점심시간 감정 체크인',
    body: '지금의 기분과 어울리는 작품을 찾아보세요',
    data: { url: '/daily-art?time=lunch' }
  },
  night: {
    title: '🌙 하루 마무리 예술',
    body: '오늘 하루를 돌아보며 마음을 정리해요',
    data: { url: '/daily-art?time=night' }
  },
  streak_7: {
    title: '🔥 7일 연속 달성!',
    body: '일주일 동안 예술과 함께한 당신, 정말 멋져요!',
    data: { url: '/daily-art' }
  },
  streak_30: {
    title: '🏆 30일 연속 달성!',
    body: '한 달간의 예술 여정! 특별 전시 초대권이 준비되었어요',
    data: { url: '/daily-art' }
  },
  streak_100: {
    title: '🎨 100일 연속 달성!',
    body: '놀라운 예술 습관! 아트 멘토 매칭 서비스가 시작됩니다',
    data: { url: '/daily-art' }
  }
};

// 사용자 알림 설정 조회
async function getUsersForTimeSlot(timeSlot) {
  const query = `
    SELECT 
      u.id,
      u.nickname,
      uhs.${timeSlot}_time as notification_time,
      uhs.${timeSlot}_enabled,
      uhs.push_enabled,
      uhs.timezone,
      uhs.active_days
    FROM users u
    JOIN user_habit_settings uhs ON u.id = uhs.user_id
    WHERE uhs.${timeSlot}_enabled = true
    AND uhs.push_enabled = true
    AND EXTRACT(DOW FROM NOW() AT TIME ZONE uhs.timezone) = ANY(uhs.active_days)
  `;

  const result = await pool.query(query);
  return result.rows;
}

// 시간대별 알림 전송
async function sendTimeSlotNotifications(timeSlot) {
  try {
    const users = await getUsersForTimeSlot(timeSlot);
    log.info(`Sending ${timeSlot} notifications to ${users.length} users`);

    for (const user of users) {
      try {
        const template = notificationTemplates[timeSlot];
        await dailyHabitService.sendPushNotification(
          user.id,
          timeSlot,
          template
        );

        log.info(`${timeSlot} notification sent to user ${user.id}`);
      } catch (error) {
        log.error(`Failed to send ${timeSlot} notification to user ${user.id}:`, error);
      }
    }
  } catch (error) {
    log.error(`Failed to send ${timeSlot} notifications:`, error);
  }
}

// 스트릭 보상 확인 및 알림
async function checkStreakRewards() {
  try {
    log.info('Checking streak rewards...');

    const query = `
      SELECT 
        us.user_id,
        us.current_streak,
        us.achieved_7_days,
        us.achieved_30_days,
        us.achieved_100_days
      FROM user_streaks us
      WHERE us.current_streak >= 7
      AND us.last_activity_date = CURRENT_DATE
    `;

    const result = await pool.query(query);

    for (const streak of result.rows) {
      try {
        // 7일 달성 알림
        if (streak.current_streak === 7 && !streak.achieved_7_days) {
          await dailyHabitService.sendPushNotification(
            streak.user_id,
            'streak_achievement',
            notificationTemplates.streak_7
          );
          log.info(`7-day streak notification sent to user ${streak.user_id}`);
        }

        // 30일 달성 알림
        if (streak.current_streak === 30 && !streak.achieved_30_days) {
          await dailyHabitService.sendPushNotification(
            streak.user_id,
            'streak_achievement',
            notificationTemplates.streak_30
          );
          log.info(`30-day streak notification sent to user ${streak.user_id}`);
        }

        // 100일 달성 알림
        if (streak.current_streak === 100 && !streak.achieved_100_days) {
          await dailyHabitService.sendPushNotification(
            streak.user_id,
            'streak_achievement',
            notificationTemplates.streak_100
          );
          log.info(`100-day streak notification sent to user ${streak.user_id}`);
        }
      } catch (error) {
        log.error(`Failed to send streak notification to user ${streak.user_id}:`, error);
      }
    }
  } catch (error) {
    log.error('Failed to check streak rewards:', error);
  }
}

// 일일 추천 작품 큐 생성
async function generateDailyArtworkQueue() {
  try {
    log.info('Generating daily artwork queue...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 활성 사용자 조회
    const usersQuery = `
      SELECT DISTINCT u.id, up.type_code, up.emotional_tags
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      JOIN user_habit_settings uhs ON u.id = uhs.user_id
      WHERE (uhs.morning_enabled = true OR uhs.lunch_enabled = true OR uhs.night_enabled = true)
      AND uhs.push_enabled = true
    `;

    const usersResult = await pool.query(usersQuery);

    for (const user of usersResult.rows) {
      const timeSlots = ['morning', 'lunch', 'night'];

      for (const timeSlot of timeSlots) {
        try {
          // 각 시간대별로 추천 작품 생성
          const artworkQuery = `
            WITH recent_views AS (
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

          const artworkResult = await pool.query(artworkQuery, [user.id]);

          if (artworkResult.rows.length > 0) {
            const artwork = artworkResult.rows[0];

            // 큐에 추가
            await pool.query(`
              INSERT INTO daily_artwork_queue (
                user_id, artwork_id, queue_date, time_slot, recommendation_reason
              ) VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (user_id, queue_date, time_slot) DO UPDATE SET
                artwork_id = EXCLUDED.artwork_id,
                recommendation_reason = EXCLUDED.recommendation_reason
            `, [
              user.id,
              artwork.id,
              tomorrowStr,
              timeSlot,
              `${timeSlot} session recommendation based on user preferences`
            ]);
          }
        } catch (error) {
          log.error(`Failed to generate ${timeSlot} queue for user ${user.id}:`, error);
        }
      }
    }

    log.info('Daily artwork queue generation completed');
  } catch (error) {
    log.error('Failed to generate daily artwork queue:', error);
  }
}

// 오래된 데이터 정리
async function cleanupOldData() {
  try {
    log.info('Cleaning up old data...');

    // 90일 이상 된 알림 로그 삭제
    await pool.query(`
      DELETE FROM notification_logs
      WHERE created_at < NOW() - INTERVAL '90 days'
    `);

    // 30일 이상 된 사용되지 않은 큐 삭제
    await pool.query(`
      DELETE FROM daily_artwork_queue
      WHERE queue_date < CURRENT_DATE - INTERVAL '30 days'
    `);

    // 180일 이상 된 감정 체크인 기록 삭제
    await pool.query(`
      DELETE FROM emotion_checkins
      WHERE created_at < NOW() - INTERVAL '180 days'
    `);

    log.info('Old data cleanup completed');
  } catch (error) {
    log.error('Failed to cleanup old data:', error);
  }
}

// 주간 리포트 생성 (일요일 밤)
async function generateWeeklyReports() {
  try {
    log.info('Generating weekly reports...');

    const query = `
      SELECT 
        u.id,
        u.email,
        u.nickname,
        COUNT(dae.id) as activities_this_week,
        us.current_streak,
        us.longest_streak
      FROM users u
      JOIN user_habit_settings uhs ON u.id = uhs.user_id
      LEFT JOIN daily_art_entries dae ON u.id = dae.user_id 
        AND dae.entry_date >= CURRENT_DATE - INTERVAL '7 days'
      LEFT JOIN user_streaks us ON u.id = us.user_id
      WHERE uhs.email_reminder = true
      GROUP BY u.id, u.email, u.nickname, us.current_streak, us.longest_streak
    `;

    const result = await pool.query(query);

    for (const user of result.rows) {
      // 여기서 이메일 서비스를 통해 주간 리포트 발송
      // 실제 구현에서는 emailService.sendWeeklyReport() 등을 호출
      log.info(`Weekly report generated for user ${user.id}: ${user.activities_this_week} activities`);
    }
  } catch (error) {
    log.error('Failed to generate weekly reports:', error);
  }
}

// 크론 작업 스케줄링
function initializeDailyHabitJobs() {
  log.info('Initializing Daily Art Habit cron jobs...');

  // 아침 알림 (매일 오전 8시)
  cron.schedule('0 8 * * *', () => {
    sendTimeSlotNotifications('morning');
  }, {
    scheduled: true,
    timezone: 'Asia/Seoul'
  });

  // 점심 알림 (매일 오후 12시 30분)
  cron.schedule('30 12 * * *', () => {
    sendTimeSlotNotifications('lunch');
  }, {
    scheduled: true,
    timezone: 'Asia/Seoul'
  });

  // 밤 알림 (매일 밤 10시)
  cron.schedule('0 22 * * *', () => {
    sendTimeSlotNotifications('night');
  }, {
    scheduled: true,
    timezone: 'Asia/Seoul'
  });

  // 스트릭 보상 확인 (매일 밤 11시)
  cron.schedule('0 23 * * *', () => {
    checkStreakRewards();
  }, {
    scheduled: true,
    timezone: 'Asia/Seoul'
  });

  // 일일 추천 작품 큐 생성 (매일 새벽 2시)
  cron.schedule('0 2 * * *', () => {
    generateDailyArtworkQueue();
  }, {
    scheduled: true,
    timezone: 'Asia/Seoul'
  });

  // 데이터 정리 (매일 새벽 3시)
  cron.schedule('0 3 * * *', () => {
    cleanupOldData();
  }, {
    scheduled: true,
    timezone: 'Asia/Seoul'
  });

  // 주간 리포트 생성 (일요일 밤 11시)
  cron.schedule('0 23 * * 0', () => {
    generateWeeklyReports();
  }, {
    scheduled: true,
    timezone: 'Asia/Seoul'
  });

  log.info('Daily Art Habit cron jobs initialized successfully');
}

module.exports = {
  initializeDailyHabitJobs,
  sendTimeSlotNotifications,
  checkStreakRewards,
  generateDailyArtworkQueue,
  cleanupOldData,
  generateWeeklyReports
};
