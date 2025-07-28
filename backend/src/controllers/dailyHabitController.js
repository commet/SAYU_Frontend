const dailyHabitService = require('../services/dailyHabitService');

class DailyHabitController {
  // 습관 설정 조회
  async getHabitSettings(req, res, next) {
    try {
      const { userId } = req.user;
      const settings = await dailyHabitService.getUserHabitSettings(userId);

      if (!settings) {
        // 기본 설정으로 생성
        const defaultSettings = await dailyHabitService.upsertUserHabitSettings(userId, {});
        return res.json(defaultSettings);
      }

      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  // 습관 설정 업데이트
  async updateHabitSettings(req, res, next) {
    try {
      const { userId } = req.user;
      const settings = req.body;

      const updatedSettings = await dailyHabitService.upsertUserHabitSettings(userId, settings);
      res.json(updatedSettings);
    } catch (error) {
      next(error);
    }
  }

  // 오늘의 기록 조회
  async getTodayEntry(req, res, next) {
    try {
      const { userId } = req.user;
      const today = new Date().toISOString().split('T')[0];

      let entry = await dailyHabitService.getDailyEntry(userId, today);

      if (!entry) {
        // 오늘 기록이 없으면 생성
        entry = await dailyHabitService.upsertDailyEntry(userId, today, {});
      }

      // 스트릭 정보 추가
      const streak = await dailyHabitService.getUserStreak(userId);

      res.json({
        entry,
        streak
      });
    } catch (error) {
      next(error);
    }
  }

  // 특정 날짜 기록 조회
  async getDateEntry(req, res, next) {
    try {
      const { userId } = req.user;
      const { date } = req.params;

      const entry = await dailyHabitService.getDailyEntry(userId, date);
      res.json(entry);
    } catch (error) {
      next(error);
    }
  }

  // 아침 활동 기록
  async recordMorning(req, res, next) {
    try {
      const { userId } = req.user;
      const { date = new Date().toISOString().split('T')[0] } = req.body;
      const data = req.body;

      // 오늘 기록이 없으면 먼저 생성
      await dailyHabitService.upsertDailyEntry(userId, date, {});

      // 아침 활동 기록
      const entry = await dailyHabitService.recordMorningActivity(userId, date, data);

      // 보상 확인
      const rewards = await dailyHabitService.checkAndGrantRewards(userId);

      res.json({
        entry,
        rewards
      });
    } catch (error) {
      next(error);
    }
  }

  // 점심 활동 기록
  async recordLunch(req, res, next) {
    try {
      const { userId } = req.user;
      const { date = new Date().toISOString().split('T')[0] } = req.body;
      const data = req.body;

      // 오늘 기록이 없으면 먼저 생성
      await dailyHabitService.upsertDailyEntry(userId, date, {});

      // 점심 활동 기록
      const entry = await dailyHabitService.recordLunchActivity(userId, date, data);

      // 보상 확인
      const rewards = await dailyHabitService.checkAndGrantRewards(userId);

      res.json({
        entry,
        rewards
      });
    } catch (error) {
      next(error);
    }
  }

  // 밤 활동 기록
  async recordNight(req, res, next) {
    try {
      const { userId } = req.user;
      const { date = new Date().toISOString().split('T')[0] } = req.body;
      const data = req.body;

      // 오늘 기록이 없으면 먼저 생성
      await dailyHabitService.upsertDailyEntry(userId, date, {});

      // 밤 활동 기록
      const entry = await dailyHabitService.recordNightActivity(userId, date, data);

      // 보상 확인
      const rewards = await dailyHabitService.checkAndGrantRewards(userId);

      res.json({
        entry,
        rewards
      });
    } catch (error) {
      next(error);
    }
  }

  // 일일 추천 작품 조회
  async getDailyRecommendation(req, res, next) {
    try {
      const { userId } = req.user;
      const { timeSlot } = req.params; // morning, lunch, night
      const date = new Date().toISOString().split('T')[0];

      const recommendation = await dailyHabitService.getDailyArtworkRecommendations(
        userId,
        date,
        timeSlot
      );

      // 시간대별 맞춤 질문 생성
      let question;
      switch (timeSlot) {
        case 'morning':
          question = '이 작품이 당신의 하루를 시작하는 색이라면?';
          break;
        case 'lunch':
          question = '지금 이 순간, 이 작품과 어떤 감정을 나누고 싶나요?';
          break;
        case 'night':
          question = '오늘 하루를 이 작품의 한 부분으로 표현한다면?';
          break;
      }

      res.json({
        artwork: recommendation,
        question,
        timeSlot
      });
    } catch (error) {
      next(error);
    }
  }

  // 푸시 알림 구독
  async subscribePush(req, res, next) {
    try {
      const { userId } = req.user;
      const subscription = req.body;

      await dailyHabitService.subscribeToPush(userId, subscription);
      res.json({ message: '푸시 알림 구독 완료' });
    } catch (error) {
      next(error);
    }
  }

  // 테스트 푸시 알림 전송
  async sendTestPush(req, res, next) {
    try {
      const { userId } = req.user;

      const payload = {
        title: 'SAYU 일일 예술',
        body: '오늘의 작품이 도착했습니다',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: {
          url: '/daily-art'
        }
      };

      const results = await dailyHabitService.sendPushNotification(
        userId,
        'test',
        payload
      );

      res.json({
        message: '테스트 알림 전송 완료',
        results
      });
    } catch (error) {
      next(error);
    }
  }

  // 스트릭 조회
  async getStreak(req, res, next) {
    try {
      const { userId } = req.user;
      const streak = await dailyHabitService.getUserStreak(userId);
      const rewards = await dailyHabitService.checkAndGrantRewards(userId);

      res.json({
        streak,
        rewards
      });
    } catch (error) {
      next(error);
    }
  }

  // 활동 패턴 조회
  async getActivityPatterns(req, res, next) {
    try {
      const { userId } = req.user;
      const patterns = await dailyHabitService.getActivityPatterns(userId);

      res.json(patterns);
    } catch (error) {
      next(error);
    }
  }

  // 월간 통계
  async getMonthlyStats(req, res, next) {
    try {
      const { userId } = req.user;
      const { year, month } = req.params;

      const stats = await dailyHabitService.getMonthlyStats(
        userId,
        parseInt(year),
        parseInt(month)
      );

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // 감정 체크인
  async checkInEmotion(req, res, next) {
    try {
      const { userId } = req.user;
      const { timeOfDay, emotion, artworkId, ...additionalData } = req.body;

      const checkin = await dailyHabitService.recordEmotionCheckin(
        userId,
        timeOfDay,
        emotion,
        artworkId,
        additionalData
      );

      res.json(checkin);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DailyHabitController();
