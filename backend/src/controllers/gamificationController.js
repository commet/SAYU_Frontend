const { getGamificationService } = require('../services/gamificationService');
const { log } = require('../config/logger');
const { generateShareImage } = require('../utils/imageGenerator');

const gamificationService = getGamificationService();

class GamificationController {
  // 대시보드 데이터 조회
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;

      // 병렬로 필요한 데이터 조회
      const [
        userStats,
        recentAchievements,
        upcomingChallenges,
        weeklyProgress,
        friendsActivity
      ] = await Promise.all([
        gamificationService.getUserStats(userId),
        gamificationService.getRecentAchievements(userId, 5),
        gamificationService.getUpcomingChallenges(userId),
        gamificationService.getWeeklyProgress(userId),
        gamificationService.getFriendsActivity(userId, 10)
      ]);

      const dashboardData = {
        ...userStats,
        recentAchievements,
        upcomingChallenges,
        weeklyProgress,
        friendsActivity,
        timestamp: new Date()
      };

      res.json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      log.error('Failed to get dashboard', { userId: req.user.id, error });
      res.status(500).json({
        success: false,
        error: 'Failed to load dashboard data'
      });
    }
  }

  // 포인트 획득
  async earnPoints(req, res) {
    try {
      const userId = req.user.id;
      const { activity, metadata = {} } = req.body;

      // 메타데이터에 추가 정보 삽입
      const enrichedMetadata = {
        ...metadata,
        timestamp: new Date(),
        deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web',
        hour: new Date().getHours(),
        dayOfWeek: new Date().getDay()
      };

      const result = await gamificationService.earnPoints(
        userId,
        activity,
        enrichedMetadata
      );

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      log.error('Failed to earn points', {
        userId: req.user.id,
        activity: req.body.activity,
        error
      });

      res.status(500).json({
        success: false,
        error: 'Failed to process activity'
      });
    }
  }

  // 전시 세션 시작
  async startExhibitionSession(req, res) {
    try {
      const userId = req.user.id;
      const { exhibitionId, exhibitionName, location } = req.body;

      // 기존 세션 확인
      const existingSession = await gamificationService.getActiveSession(userId);
      if (existingSession) {
        return res.status(400).json({
          success: false,
          error: 'Already have an active session',
          data: { sessionId: existingSession.id }
        });
      }

      const session = await gamificationService.startExhibitionSession({
        userId,
        exhibitionId,
        exhibitionName,
        location
      });

      // 시작 포인트 획득
      await gamificationService.earnPoints(userId, 'EXHIBITION_START', {
        exhibitionId,
        sessionId: session.id
      });

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          startTime: session.startTime,
          pointsEarned: 10
        }
      });

    } catch (error) {
      log.error('Failed to start exhibition session', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to start session'
      });
    }
  }

  // 전시 세션 종료
  async endExhibitionSession(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.body;

      const session = await gamificationService.getSession(sessionId);

      if (!session || session.user_id !== userId) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      if (session.end_time) {
        return res.status(400).json({
          success: false,
          error: 'Session already ended'
        });
      }

      const result = await gamificationService.endExhibitionSession(sessionId);

      // 완료 포인트 획득
      const pointsResult = await gamificationService.earnPoints(
        userId,
        'EXHIBITION_COMPLETE',
        {
          exhibitionId: session.exhibition_id,
          duration: result.duration,
          sessionId
        }
      );

      res.json({
        success: true,
        data: {
          duration: result.duration,
          pointsEarned: pointsResult.pointsEarned,
          totalPoints: pointsResult.totalPoints,
          achievements: result.achievements || []
        }
      });

    } catch (error) {
      log.error('Failed to end exhibition session', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to end session'
      });
    }
  }

  // 현재 세션 조회
  async getCurrentSession(req, res) {
    try {
      const userId = req.user.id;
      const session = await gamificationService.getActiveSession(userId);

      res.json({
        success: true,
        data: session || null
      });

    } catch (error) {
      log.error('Failed to get current session', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get session'
      });
    }
  }

  // 칭호 목록
  async getTitles(req, res) {
    try {
      const userId = req.user.id;
      const titles = await gamificationService.getUserTitles(userId);

      res.json({
        success: true,
        data: titles
      });

    } catch (error) {
      log.error('Failed to get titles', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get titles'
      });
    }
  }

  // 메인 칭호 설정
  async setMainTitle(req, res) {
    try {
      const userId = req.user.id;
      const { titleId } = req.body;

      const result = await gamificationService.setMainTitle(userId, titleId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        data: { titleId }
      });

    } catch (error) {
      log.error('Failed to set main title', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to set title'
      });
    }
  }

  // 도전 과제 목록
  async getChallenges(req, res) {
    try {
      const userId = req.user.id;
      const { status = 'active' } = req.query;

      const challenges = await gamificationService.getUserChallenges(userId, status);

      res.json({
        success: true,
        data: challenges
      });

    } catch (error) {
      log.error('Failed to get challenges', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get challenges'
      });
    }
  }

  // 리더보드
  async getLeaderboard(req, res) {
    try {
      const userId = req.user.id;
      const { type = 'weekly', limit = 50 } = req.query;

      const leaderboard = await gamificationService.getLeaderboard(type, limit);
      const userRank = await gamificationService.getUserRank(userId, type);

      res.json({
        success: true,
        data: {
          leaderboard,
          userRank,
          type,
          updatedAt: new Date()
        }
      });

    } catch (error) {
      log.error('Failed to get leaderboard', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get leaderboard'
      });
    }
  }

  // 친구 리더보드
  async getFriendsLeaderboard(req, res) {
    try {
      const userId = req.user.id;

      const friendsLeaderboard = await gamificationService.getFriendsLeaderboard(userId);

      res.json({
        success: true,
        data: friendsLeaderboard
      });

    } catch (error) {
      log.error('Failed to get friends leaderboard', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get friends leaderboard'
      });
    }
  }

  // 사용자 통계
  async getUserStats(req, res) {
    try {
      const targetUserId = req.params.userId || req.user.id;

      // 다른 사용자 조회 시 프라이버시 체크
      if (targetUserId !== req.user.id) {
        const canView = await gamificationService.canViewUserStats(
          req.user.id,
          targetUserId
        );

        if (!canView) {
          return res.status(403).json({
            success: false,
            error: 'Cannot view this user\'s stats'
          });
        }
      }

      const stats = await gamificationService.getDetailedUserStats(targetUserId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      log.error('Failed to get user stats', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get stats'
      });
    }
  }

  // 활동 기록
  async getActivityHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0, type } = req.query;

      const activities = await gamificationService.getActivityHistory(
        userId,
        { limit, offset, type }
      );

      res.json({
        success: true,
        data: activities
      });

    } catch (error) {
      log.error('Failed to get activity history', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get activities'
      });
    }
  }

  // 주간 진행도
  async getWeeklyProgress(req, res) {
    try {
      const userId = req.user.id;
      const progress = await gamificationService.getWeeklyProgress(userId);

      res.json({
        success: true,
        data: progress
      });

    } catch (error) {
      log.error('Failed to get weekly progress', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get progress'
      });
    }
  }

  // 레벨 정보
  async getLevelInfo(req, res) {
    try {
      const levels = gamificationService.getLevelDefinitions();

      res.json({
        success: true,
        data: levels
      });

    } catch (error) {
      log.error('Failed to get level info', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get level info'
      });
    }
  }

  // 활성 이벤트
  async getActiveEvents(req, res) {
    try {
      const events = await gamificationService.getActiveEvents();

      res.json({
        success: true,
        data: events
      });

    } catch (error) {
      log.error('Failed to get active events', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get events'
      });
    }
  }

  // 공유 카드 생성
  async generateShareCard(req, res) {
    try {
      const userId = req.user.id;
      const { type, data = {} } = req.body;

      const userStats = await gamificationService.getUserStats(userId);

      const cardData = {
        ...userStats,
        ...data,
        type,
        generatedAt: new Date()
      };

      // 이미지 생성 (Canvas 또는 외부 서비스)
      const imageUrl = await generateShareImage(cardData);

      res.json({
        success: true,
        data: {
          imageUrl,
          shareData: {
            title: `나의 ${type === 'monthly' ? '월간' : ''} 아트 여정`,
            description: `레벨 ${cardData.level} | 전시 ${cardData.totalExhibitions}회 관람`,
            hashtags: ['SAYU', '아트라이프', '미술관투어']
          }
        }
      });

    } catch (error) {
      log.error('Failed to generate share card', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to generate card'
      });
    }
  }

  // SSE 스트림 (실시간 업데이트)
  async streamUpdates(req, res) {
    const userId = req.user.id;

    // SSE 헤더 설정
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // 초기 연결 메시지
    res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

    // Redis 구독
    const subscriber = gamificationService.subscribeToUpdates(userId);

    subscriber.on('message', (channel, message) => {
      res.write(`data: ${message}\n\n`);
    });

    // 주기적 하트비트
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // 연결 종료 처리
    req.on('close', () => {
      clearInterval(heartbeat);
      subscriber.unsubscribe();
      subscriber.quit();
    });
  }
}

module.exports = new GamificationController();
