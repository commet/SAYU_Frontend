const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const optionalAuth = (req, res, next) => {
  // Optional auth - proceed even without token
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  authenticateToken(req, res, (err) => {
    if (err) req.user = null;
    next();
  });
};
const validateRequest = require('../middleware/validateRequest');
const { body, query, param } = require('express-validator');
const exhibitionCalendarService = require('../services/exhibitionCalendarService');

// 월별 전시 캘린더 조회 (로그인 선택)
router.get('/monthly',
  optionalAuth,
  [
    query('year').isInt({ min: 2020, max: 2030 }),
    query('month').isInt({ min: 1, max: 12 }),
    query('location').optional().isString(),
    query('genres').optional().isString(), // comma-separated
    query('showPersonalizedOnly').optional().isBoolean().default(false)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { year, month, location, genres, showPersonalizedOnly } = req.query;

      const options = {
        userId: req.user?.id,
        location,
        genres: genres ? genres.split(',') : [],
        showPersonalizedOnly: showPersonalizedOnly === 'true'
      };

      const calendarData = await exhibitionCalendarService.getMonthlyExhibitions(
        parseInt(year),
        parseInt(month),
        options
      );

      res.json({
        success: true,
        year: parseInt(year),
        month: parseInt(month),
        calendar: calendarData.calendar,
        exhibitions: calendarData.exhibitions,
        summary: calendarData.summary
      });
    } catch (error) {
      console.error('Monthly calendar error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get monthly calendar'
      });
    }
  }
);

// 주별 전시 캘린더 조회
router.get('/weekly',
  optionalAuth,
  [
    query('startDate').isISO8601(),
    query('endDate').isISO8601()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const weeklyData = await exhibitionCalendarService.getWeeklyExhibitions(
        new Date(startDate),
        new Date(endDate),
        req.user?.id
      );

      res.json({
        success: true,
        startDate,
        endDate,
        weeks: weeklyData
      });
    } catch (error) {
      console.error('Weekly calendar error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get weekly calendar'
      });
    }
  }
);

// 일별 상세 전시 조회
router.get('/daily',
  optionalAuth,
  [
    query('date').isISO8601(),
    query('location').optional().isString(),
    query('radius').optional().isFloat({ min: 0 }),
    query('userLat').optional().isFloat(),
    query('userLng').optional().isFloat()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { date, location, radius, userLat, userLng } = req.query;

      const options = {
        userId: req.user?.id,
        location,
        radius: radius ? parseFloat(radius) : null,
        userLat: userLat ? parseFloat(userLat) : null,
        userLng: userLng ? parseFloat(userLng) : null
      };

      const dailyData = await exhibitionCalendarService.getDailyExhibitions(
        new Date(date),
        options
      );

      res.json({
        success: true,
        ...dailyData
      });
    } catch (error) {
      console.error('Daily calendar error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get daily calendar'
      });
    }
  }
);

// 스마트 알림 설정 (로그인 필요)
router.post('/notifications',
  authenticateToken,
  [
    body('exhibitionId').isUUID(),
    body('preferences').optional().isObject(),
    body('preferences.notifyBefore').optional().isArray(),
    body('preferences.quietHours').optional().isObject(),
    body('preferences.enableLocationAlert').optional().isBoolean(),
    body('preferences.maxDistance').optional().isFloat({ min: 0 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { exhibitionId, preferences = {} } = req.body;

      const notification = await exhibitionCalendarService.setSmartNotification(
        req.user.id,
        exhibitionId,
        preferences
      );

      res.json({
        success: true,
        notification,
        message: 'Notification set successfully'
      });
    } catch (error) {
      console.error('Notification setting error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set notification'
      });
    }
  }
);

// 알림 설정 조회
router.get('/notifications',
  authenticateToken,
  [
    query('exhibitionId').optional().isUUID()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { exhibitionId } = req.query;

      const notifications = await exhibitionCalendarService.getUserNotifications(
        req.user.id,
        exhibitionId
      );

      res.json({
        success: true,
        notifications
      });
    } catch (error) {
      console.error('Notification retrieval error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get notifications'
      });
    }
  }
);

// 알림 설정 수정
router.put('/notifications/:notificationId',
  authenticateToken,
  [
    param('notificationId').isUUID(),
    body('preferences').isObject(),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { notificationId } = req.params;
      const { preferences, isActive } = req.body;

      const updatedNotification = await exhibitionCalendarService.updateNotification(
        req.user.id,
        notificationId,
        { preferences, isActive }
      );

      res.json({
        success: true,
        notification: updatedNotification,
        message: 'Notification updated successfully'
      });
    } catch (error) {
      console.error('Notification update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update notification'
      });
    }
  }
);

// 알림 삭제
router.delete('/notifications/:notificationId',
  authenticateToken,
  [
    param('notificationId').isUUID()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { notificationId } = req.params;

      await exhibitionCalendarService.deleteNotification(
        req.user.id,
        notificationId
      );

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Notification deletion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete notification'
      });
    }
  }
);

// 위치 기반 알림 체크
router.post('/location-check',
  authenticateToken,
  [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { latitude, longitude } = req.body;

      const alerts = await exhibitionCalendarService.checkLocationAlerts(
        req.user.id,
        latitude,
        longitude
      );

      res.json({
        success: true,
        alerts,
        alertCount: alerts.length
      });
    } catch (error) {
      console.error('Location check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check location alerts'
      });
    }
  }
);

// 북마크 추가/제거
router.post('/bookmarks',
  authenticateToken,
  [
    body('exhibitionId').isUUID(),
    body('bookmarkType').optional().isIn(['interested', 'planning', 'maybe']),
    body('notes').optional().isString(),
    body('reminderDate').optional().isISO8601()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { exhibitionId, bookmarkType, notes, reminderDate } = req.body;

      const bookmark = await exhibitionCalendarService.toggleBookmark(
        req.user.id,
        exhibitionId,
        {
          bookmarkType: bookmarkType || 'interested',
          notes,
          reminderDate: reminderDate ? new Date(reminderDate) : null
        }
      );

      res.json({
        success: true,
        bookmark,
        isBookmarked: !!bookmark,
        message: bookmark ? 'Bookmarked' : 'Bookmark removed'
      });
    } catch (error) {
      console.error('Bookmark toggle error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle bookmark'
      });
    }
  }
);

// 사용자 북마크 목록
router.get('/bookmarks',
  authenticateToken,
  [
    query('type').optional().isIn(['interested', 'planning', 'maybe']),
    query('upcoming').optional().isBoolean(),
    query('limit').optional().isInt({ min: 1, max: 100 }).default(20),
    query('offset').optional().isInt({ min: 0 }).default(0)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { type, upcoming, limit, offset } = req.query;

      const bookmarks = await exhibitionCalendarService.getUserBookmarks(
        req.user.id,
        {
          type,
          upcoming: upcoming === 'true',
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      );

      res.json({
        success: true,
        bookmarks: bookmarks.items,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: bookmarks.total
        }
      });
    } catch (error) {
      console.error('Bookmarks retrieval error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get bookmarks'
      });
    }
  }
);

// 관람 기록 추가
router.post('/visits',
  authenticateToken,
  [
    body('exhibitionId').isUUID(),
    body('visitedAt').isISO8601(),
    body('duration').optional().isInt({ min: 1 }),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('visitType').optional().isIn(['solo', 'group', 'family', 'date']),
    body('companionsCount').optional().isInt({ min: 0 }),
    body('reviewText').optional().isString(),
    body('reviewTags').optional().isArray(),
    body('wouldRecommend').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const visitData = req.body;

      const visit = await exhibitionCalendarService.recordVisit(
        req.user.id,
        visitData
      );

      res.json({
        success: true,
        visit,
        message: 'Visit recorded successfully'
      });
    } catch (error) {
      console.error('Visit recording error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record visit'
      });
    }
  }
);

// 관람 기록 조회
router.get('/visits',
  authenticateToken,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).default(20),
    query('offset').optional().isInt({ min: 0 }).default(0),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { limit, offset, dateFrom, dateTo } = req.query;

      const visits = await exhibitionCalendarService.getUserVisits(
        req.user.id,
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          dateFrom: dateFrom ? new Date(dateFrom) : null,
          dateTo: dateTo ? new Date(dateTo) : null
        }
      );

      res.json({
        success: true,
        visits: visits.items,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: visits.total
        }
      });
    } catch (error) {
      console.error('Visits retrieval error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get visits'
      });
    }
  }
);

// 캘린더 동기화 설정
router.post('/sync/:provider',
  authenticateToken,
  [
    param('provider').isIn(['google', 'apple', 'outlook']),
    body('accessToken').isString(),
    body('refreshToken').optional().isString(),
    body('expiresAt').optional().isISO8601(),
    body('syncOptions').optional().isObject()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { provider } = req.params;
      const { accessToken, refreshToken, expiresAt, syncOptions } = req.body;

      const syncSettings = await exhibitionCalendarService.setupCalendarSync(
        req.user.id,
        provider,
        {
          accessToken,
          refreshToken,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          syncOptions
        }
      );

      res.json({
        success: true,
        syncSettings,
        message: 'Calendar sync configured successfully'
      });
    } catch (error) {
      console.error('Calendar sync error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to setup calendar sync'
      });
    }
  }
);

// 수동 캘린더 동기화 실행
router.post('/sync/:provider/execute',
  authenticateToken,
  [
    param('provider').isIn(['google', 'apple', 'outlook'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { provider } = req.params;

      const syncResult = await exhibitionCalendarService.syncWithCalendar(
        req.user.id,
        provider
      );

      res.json({
        success: true,
        syncResult,
        message: 'Calendar sync completed'
      });
    } catch (error) {
      console.error('Manual sync error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sync calendar'
      });
    }
  }
);

// 캘린더 통계 조회
router.get('/stats',
  authenticateToken,
  [
    query('period').optional().isIn(['week', 'month', 'year']).default('month')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { period } = req.query;

      const stats = await exhibitionCalendarService.getUserCalendarStats(
        req.user.id,
        period
      );

      res.json({
        success: true,
        stats,
        period
      });
    } catch (error) {
      console.error('Calendar stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get calendar stats'
      });
    }
  }
);

module.exports = router;
