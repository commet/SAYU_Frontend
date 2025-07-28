const db = require('../config/database');
const Redis = require('ioredis');
const { log } = require('../config/logger');
const EventEmitter = require('events');

class ExhibitionCalendarService extends EventEmitter {
  constructor() {
    super();
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL);
        this.redis.on('error', (error) => {
          log.error('Redis error in Exhibition Calendar service:', error);
          this.redis = null;
        });
      } catch (error) {
        log.warn('Redis connection failed in Exhibition Calendar service, running without cache:', error.message);
        this.redis = null;
      }
    } else {
      this.redis = null;
      log.warn('Exhibition Calendar service running without Redis cache - REDIS_URL not configured');
    }
    this.initializeService();
  }

  async initializeService() {
    try {
      if (this.redis) {
        await this.redis.ping();
        log.info('Exhibition Calendar service initialized with Redis');
      } else {
        log.info('Exhibition Calendar service initialized without Redis (cache disabled)');
      }

      // 알림 체크 스케줄러 시작
      if (this.redis) {
        this.startNotificationScheduler();
      }
    } catch (error) {
      log.error('Redis connection failed:', error);
      this.redis = null;
    }
  }

  // 월별 전시 조회
  async getMonthlyExhibitions(year, month, options = {}) {
    const {
      userId = null,
      location = null,
      genres = [],
      showPersonalizedOnly = false
    } = options;

    try {
      // 캐시 키 생성
      const cacheKey = `calendar:${year}:${month}:${userId || 'public'}:${location || 'all'}`;

      if (this.redis) {
        try {
          const cached = await this.redis.get(cacheKey);
          if (cached) {
            return JSON.parse(cached);
          }
        } catch (error) {
          log.warn('Redis cache read failed:', error.message);
        }
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const query = `
        SELECT DISTINCT e.*,
               i.name as institution_name,
               i.city, i.country,
               i.latitude, i.longitude,
               ARRAY_AGG(DISTINCT ea.artist_name) FILTER (WHERE ea.artist_name IS NOT NULL) as artists,
               CASE 
                 WHEN un.exhibition_id IS NOT NULL THEN true
                 ELSE false
               END as has_notification,
               CASE 
                 WHEN uev.exhibition_id IS NOT NULL THEN true
                 ELSE false
               END as is_visited
        FROM exhibitions e
        JOIN institutions i ON e.institution_id = i.id
        LEFT JOIN exhibition_artists ea ON e.id = ea.exhibition_id
        ${userId ? `
          LEFT JOIN user_notifications un ON e.id = un.exhibition_id AND un.user_id = $4
          LEFT JOIN user_exhibition_visits uev ON e.id = uev.exhibition_id AND uev.user_id = $4
        ` : ''}
        WHERE (
          (e.start_date <= $2 AND e.end_date >= $1) OR
          (e.start_date >= $1 AND e.start_date <= $2)
        )
        ${location ? 'AND i.city = $3' : ''}
        ${genres.length > 0 ? `AND e.genres && $${location ? 4 : 3}::text[]` : ''}
        GROUP BY e.id, i.id, un.exhibition_id, uev.exhibition_id
        ORDER BY e.start_date ASC, e.title ASC
      `;

      const queryParams = [startDate, endDate];
      if (location) queryParams.push(location);
      if (userId) queryParams.push(userId);
      if (genres.length > 0) queryParams.push(genres);

      const result = await db.query(query, queryParams);

      // 날짜별로 그룹화
      const calendarData = this.groupExhibitionsByDate(result.rows, startDate, endDate);

      // 개인화된 추천 점수 추가 (로그인 사용자만)
      if (userId && showPersonalizedOnly) {
        calendarData.exhibitions = await this.addPersonalizationScores(calendarData.exhibitions, userId);
      }

      // 캐시 저장 (1시간)
      if (this.redis) {
        try {
          await this.redis.setex(cacheKey, 3600, JSON.stringify(calendarData));
        } catch (error) {
          log.warn('Redis cache write failed:', error.message);
        }
      }

      return calendarData;
    } catch (error) {
      log.error('Monthly exhibitions query error:', error);
      throw error;
    }
  }

  // 주별 전시 조회
  async getWeeklyExhibitions(startDate, endDate, userId = null) {
    try {
      const query = `
        SELECT DISTINCT e.*,
               i.name as institution_name,
               i.city, i.country,
               ARRAY_AGG(DISTINCT ea.artist_name) FILTER (WHERE ea.artist_name IS NOT NULL) as artists,
               CASE 
                 WHEN un.exhibition_id IS NOT NULL THEN true
                 ELSE false
               END as has_notification
        FROM exhibitions e
        JOIN institutions i ON e.institution_id = i.id
        LEFT JOIN exhibition_artists ea ON e.id = ea.exhibition_id
        ${userId ? 'LEFT JOIN user_notifications un ON e.id = un.exhibition_id AND un.user_id = $3' : ''}
        WHERE (e.start_date <= $2 AND e.end_date >= $1)
        GROUP BY e.id, i.id${userId ? ', un.exhibition_id' : ''}
        ORDER BY e.start_date ASC
      `;

      const queryParams = [startDate, endDate];
      if (userId) queryParams.push(userId);

      const result = await db.query(query, queryParams);

      return this.groupExhibitionsByWeek(result.rows, startDate, endDate);
    } catch (error) {
      log.error('Weekly exhibitions query error:', error);
      throw error;
    }
  }

  // 일별 상세 전시 조회
  async getDailyExhibitions(date, options = {}) {
    const {
      userId = null,
      location = null,
      radius = null,
      userLat = null,
      userLng = null
    } = options;

    try {
      const query = `
        SELECT DISTINCT e.*,
               i.name as institution_name,
               i.city, i.country,
               i.address, i.latitude, i.longitude,
               i.opening_hours, i.website,
               ARRAY_AGG(DISTINCT ea.artist_name) FILTER (WHERE ea.artist_name IS NOT NULL) as artists,
               ${userLat && userLng ? `
                 ST_Distance(
                   ST_MakePoint($${location ? 4 : 3}, $${location ? 5 : 4}),
                   ST_MakePoint(i.longitude, i.latitude)
                 ) * 111.32 as distance_km,
               ` : ''}
               CASE 
                 WHEN un.exhibition_id IS NOT NULL THEN true
                 ELSE false
               END as has_notification,
               CASE 
                 WHEN ub.exhibition_id IS NOT NULL THEN true
                 ELSE false
               END as is_bookmarked
        FROM exhibitions e
        JOIN institutions i ON e.institution_id = i.id
        LEFT JOIN exhibition_artists ea ON e.id = ea.exhibition_id
        ${userId ? `
          LEFT JOIN user_notifications un ON e.id = un.exhibition_id AND un.user_id = $${userLat ? 6 : (location ? 4 : 3)}
          LEFT JOIN user_bookmarks ub ON e.id = ub.exhibition_id AND ub.user_id = $${userLat ? 6 : (location ? 4 : 3)}
        ` : ''}
        WHERE e.start_date <= $1 AND e.end_date >= $1
        ${location ? 'AND i.city = $2' : ''}
        ${radius && userLat && userLng ? `
          AND ST_Distance(
            ST_MakePoint($${location ? 4 : 3}, $${location ? 5 : 4}),
            ST_MakePoint(i.longitude, i.latitude)
          ) * 111.32 <= $${location ? 6 : 5}
        ` : ''}
        GROUP BY e.id, i.id${userId ? ', un.exhibition_id, ub.exhibition_id' : ''}
        ORDER BY ${userLat && userLng ? 'distance_km ASC,' : ''} e.title ASC
      `;

      const queryParams = [date];
      if (location) queryParams.push(location);
      if (userLat && userLng) {
        queryParams.push(parseFloat(userLat), parseFloat(userLng));
      }
      if (radius && userLat && userLng) queryParams.push(parseFloat(radius));
      if (userId) queryParams.push(userId);

      const result = await db.query(query, queryParams);

      return {
        date,
        exhibitions: result.rows,
        total: result.rows.length,
        nearbyCount: userLat && userLng ? result.rows.filter(e => e.distance_km <= 5).length : null
      };
    } catch (error) {
      log.error('Daily exhibitions query error:', error);
      throw error;
    }
  }

  // 스마트 알림 설정
  async setSmartNotification(userId, exhibitionId, preferences = {}) {
    const {
      notifyBefore = [7, 1], // 7일 전, 1일 전
      quietHours = { start: 22, end: 8 }, // 22시-8시는 조용
      enableLocationAlert = true,
      maxDistance = 5 // 5km 이내일 때만 위치 알림
    } = preferences;

    try {
      // 전시 정보 조회
      const exhibitionQuery = `
        SELECT e.*, i.name as institution_name, i.latitude, i.longitude
        FROM exhibitions e
        JOIN institutions i ON e.institution_id = i.id
        WHERE e.id = $1
      `;
      const exhibition = await db.query(exhibitionQuery, [exhibitionId]);

      if (exhibition.rows.length === 0) {
        throw new Error('Exhibition not found');
      }

      const exhibitionData = exhibition.rows[0];

      // 알림 설정 저장
      const insertQuery = `
        INSERT INTO user_notifications (
          user_id, exhibition_id, notification_preferences,
          created_at, updated_at
        ) VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (user_id, exhibition_id) 
        DO UPDATE SET 
          notification_preferences = $3,
          updated_at = NOW()
        RETURNING *
      `;

      const notificationPrefs = {
        notifyBefore,
        quietHours,
        enableLocationAlert,
        maxDistance,
        exhibitionTitle: exhibitionData.title,
        institutionName: exhibitionData.institution_name,
        startDate: exhibitionData.start_date,
        endDate: exhibitionData.end_date
      };

      const result = await db.query(insertQuery, [
        userId,
        exhibitionId,
        JSON.stringify(notificationPrefs)
      ]);

      // 스케줄된 알림 생성
      await this.scheduleNotifications(userId, exhibitionData, notificationPrefs);

      this.emit('notificationSet', {
        userId,
        exhibitionId,
        exhibitionTitle: exhibitionData.title
      });

      return result.rows[0];
    } catch (error) {
      log.error('Smart notification setup error:', error);
      throw error;
    }
  }

  // 알림 스케줄링
  async scheduleNotifications(userId, exhibition, preferences) {
    const { notifyBefore, quietHours } = preferences;
    const startDate = new Date(exhibition.start_date);

    for (const days of notifyBefore) {
      const notificationDate = new Date(startDate);
      notificationDate.setDate(notificationDate.getDate() - days);

      // 조용한 시간 피하기
      const hour = notificationDate.getHours();
      if (hour >= quietHours.start || hour < quietHours.end) {
        // 다음 활동 시간으로 조정 (오전 9시)
        notificationDate.setHours(9, 0, 0, 0);
        if (notificationDate < new Date()) {
          continue; // 이미 지난 시간은 스킵
        }
      }

      // Redis에 스케줄된 알림 저장
      if (this.redis) {
        try {
          const notificationKey = `scheduled_notification:${userId}:${exhibition.id}:${days}days`;
          const notificationData = {
            userId,
            exhibitionId: exhibition.id,
            exhibitionTitle: exhibition.title,
            institutionName: exhibition.institution_name,
            daysUntil: days,
            scheduledFor: notificationDate.toISOString(),
            type: days === 1 ? 'tomorrow' : 'upcoming'
          };

          await this.redis.setex(
            notificationKey,
            Math.floor((notificationDate - new Date()) / 1000),
            JSON.stringify(notificationData)
          );
        } catch (error) {
          log.warn('Redis notification save failed:', error.message);
        }
      }
    }
  }

  // 위치 기반 알림 체크
  async checkLocationAlerts(userId, userLat, userLng) {
    try {
      const query = `
        SELECT DISTINCT e.*, i.name as institution_name,
               i.latitude, i.longitude,
               un.notification_preferences,
               ST_Distance(
                 ST_MakePoint($2, $3),
                 ST_MakePoint(i.longitude, i.latitude)
               ) * 111.32 as distance_km
        FROM user_notifications un
        JOIN exhibitions e ON un.exhibition_id = e.id
        JOIN institutions i ON e.institution_id = i.id
        WHERE un.user_id = $1
          AND e.start_date <= CURRENT_DATE + INTERVAL '7 days'
          AND e.end_date >= CURRENT_DATE
          AND (un.notification_preferences->>'enableLocationAlert')::boolean = true
          AND ST_Distance(
            ST_MakePoint($2, $3),
            ST_MakePoint(i.longitude, i.latitude)
          ) * 111.32 <= (un.notification_preferences->>'maxDistance')::float
      `;

      const result = await db.query(query, [userId, userLng, userLat]);

      const nearbyExhibitions = [];
      for (const row of result.rows) {
        const prefs = row.notification_preferences;

        // 중복 알림 방지 체크
        let shouldInclude = true;
        if (this.redis) {
          try {
            const lastAlertKey = `location_alert:${userId}:${row.id}`;
            const exists = await this.redis.exists(lastAlertKey);
            shouldInclude = !exists;
          } catch (error) {
            log.warn('Redis exists check failed:', error.message);
            shouldInclude = true; // 에러 시 알림 허용
          }
        }

        if (shouldInclude) {
          nearbyExhibitions.push(row);
        }
      }

      // 위치 알림 발송
      for (const exhibition of nearbyExhibitions) {
        await this.sendLocationAlert(userId, exhibition);

        // 24시간 동안 같은 전시에 대한 위치 알림 방지
        if (this.redis) {
          try {
            const lastAlertKey = `location_alert:${userId}:${exhibition.id}`;
            await this.redis.setex(lastAlertKey, 86400, '1');
          } catch (error) {
            log.warn('Redis alert tracking failed:', error.message);
          }
        }
      }

      return nearbyExhibitions;
    } catch (error) {
      log.error('Location alerts check error:', error);
      throw error;
    }
  }

  // 캘린더 동기화 (Google Calendar)
  async syncWithGoogleCalendar(userId, accessToken) {
    try {
      // 사용자의 예정된 전시 조회
      const upcomingExhibitions = await this.getUserUpcomingExhibitions(userId);

      // Google Calendar API 연동 로직
      // 실제 구현에서는 google-auth-library와 googleapis 패키지 사용

      const calendarEvents = upcomingExhibitions.map(exhibition => ({
        summary: exhibition.title,
        location: `${exhibition.institution_name}, ${exhibition.address}`,
        description: `전시 관람 예정\n\n${exhibition.description || ''}`,
        start: {
          dateTime: exhibition.start_date,
          timeZone: 'Asia/Seoul'
        },
        end: {
          dateTime: exhibition.end_date,
          timeZone: 'Asia/Seoul'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 },
            { method: 'popup', minutes: 1440 } // 24시간 전
          ]
        }
      }));

      log.info(`Synchronized ${calendarEvents.length} exhibitions to Google Calendar for user ${userId}`);
      return calendarEvents;
    } catch (error) {
      log.error('Google Calendar sync error:', error);
      throw error;
    }
  }

  // 알림 스케줄러 시작
  startNotificationScheduler() {
    // 매 5분마다 예정된 알림 체크
    setInterval(async () => {
      try {
        await this.processScheduledNotifications();
      } catch (error) {
        log.error('Notification scheduler error:', error);
      }
    }, 5 * 60 * 1000); // 5분
  }

  // 예정된 알림 처리
  async processScheduledNotifications() {
    if (!this.redis) return;

    try {
      const pattern = 'scheduled_notification:*';
      const keys = await this.redis.keys(pattern);

      for (const key of keys) {
        try {
          const notificationData = await this.redis.get(key);
          if (!notificationData) continue;

          const notification = JSON.parse(notificationData);
          const scheduledTime = new Date(notification.scheduledFor);

          if (scheduledTime <= new Date()) {
            await this.sendScheduledNotification(notification);
            await this.redis.del(key);
          }
        } catch (error) {
          log.warn('Error processing notification:', error.message);
        }
      }
    } catch (error) {
      log.error('Scheduled notifications processing failed:', error);
    }
  }

  // 헬퍼 메소드들
  groupExhibitionsByDate(exhibitions, startDate, endDate) {
    const calendar = {};
    const currentDate = new Date(startDate);

    // 캘린더 그리드 초기화
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      calendar[dateKey] = [];
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 전시를 해당 날짜들에 배치
    exhibitions.forEach(exhibition => {
      const start = new Date(exhibition.start_date);
      const end = new Date(exhibition.end_date);

      const iterDate = new Date(Math.max(start, startDate));
      while (iterDate <= Math.min(end, endDate)) {
        const dateKey = iterDate.toISOString().split('T')[0];
        if (calendar[dateKey]) {
          calendar[dateKey].push(exhibition);
        }
        iterDate.setDate(iterDate.getDate() + 1);
      }
    });

    return {
      calendar,
      exhibitions,
      summary: {
        totalExhibitions: exhibitions.length,
        newExhibitions: exhibitions.filter(e => new Date(e.start_date) >= startDate).length,
        endingExhibitions: exhibitions.filter(e => new Date(e.end_date) <= endDate).length
      }
    };
  }

  groupExhibitionsByWeek(exhibitions, startDate, endDate) {
    const weeks = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekExhibitions = exhibitions.filter(exhibition => {
        const start = new Date(exhibition.start_date);
        const end = new Date(exhibition.end_date);
        return (start <= weekEnd && end >= weekStart);
      });

      weeks.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        exhibitions: weekExhibitions
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeks;
  }

  async addPersonalizationScores(exhibitions, userId) {
    // AI 추천 서비스와 연동하여 개인화 점수 추가
    // 실제 구현에서는 aiRecommendationService 사용
    return exhibitions.map(exhibition => ({
      ...exhibition,
      personalization_score: Math.random() * 100 // 임시 점수
    }));
  }

  async getUserUpcomingExhibitions(userId) {
    const query = `
      SELECT DISTINCT e.*, i.name as institution_name, i.address
      FROM user_notifications un
      JOIN exhibitions e ON un.exhibition_id = e.id
      JOIN institutions i ON e.institution_id = i.id
      WHERE un.user_id = $1
        AND e.end_date >= CURRENT_DATE
      ORDER BY e.start_date ASC
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
  }

  async sendScheduledNotification(notification) {
    // 실제 푸시 알림 발송 로직
    log.info(`Sending notification to user ${notification.userId}: ${notification.exhibitionTitle} ${notification.type}`);

    this.emit('notificationSent', notification);
  }

  async sendLocationAlert(userId, exhibition) {
    const alertData = {
      userId,
      type: 'location_alert',
      title: '근처에 관심 전시가 있어요!',
      message: `${exhibition.institution_name}에서 "${exhibition.title}" 전시가 진행 중이에요. (${exhibition.distance_km.toFixed(1)}km)`,
      exhibitionId: exhibition.id
    };

    log.info(`Sending location alert to user ${userId}: ${exhibition.title}`);
    this.emit('locationAlert', alertData);
  }
}

module.exports = new ExhibitionCalendarService();
