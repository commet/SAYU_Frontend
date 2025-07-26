const gamificationService = require('../services/optimizedGamificationService');
const { validationResult } = require('express-validator');

// 사용자 통계 조회
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await gamificationService.getUserStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics'
    });
  }
};

// 일일 퀘스트 조회
exports.getDailyQuests = async (req, res) => {
  try {
    const userId = req.user.id;
    const quests = await gamificationService.getDailyQuests(userId);
    
    res.json({
      success: true,
      data: quests
    });
  } catch (error) {
    console.error('Error getting daily quests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get daily quests'
    });
  }
};

// XP 획득 (다양한 액션에서 호출)
exports.earnXP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const userId = req.user.id;
    const { eventType, metadata } = req.body;
    
    const result = await gamificationService.earnXP(userId, eventType, metadata);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error earning XP:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to earn XP'
    });
  }
};

// 리더보드 조회
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'weekly', limit = 100 } = req.query;
    const userId = req.user?.id;
    
    const leaderboard = await gamificationService.getLeaderboard(
      type, 
      parseInt(limit), 
      userId
    );
    
    res.json({
      success: true,
      data: {
        type,
        leaderboard
      }
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard'
    });
  }
};

// 특정 사용자 통계 조회 (프로필 페이지용)
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await gamificationService.getUserStats(parseInt(userId));
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
};

// 매일 로그인 처리
exports.dailyLogin = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 오늘 이미 로그인했는지 확인
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `daily_login:${userId}:${today}`;
    
    // Redis로 중복 체크
    const redis = require('../config/redis');
    const alreadyLoggedIn = await redis.get(cacheKey);
    
    if (alreadyLoggedIn) {
      return res.json({
        success: true,
        data: {
          alreadyCompleted: true,
          message: '오늘 이미 로그인 보상을 받았습니다.'
        }
      });
    }
    
    // XP 획득
    const result = await gamificationService.earnXP(userId, 'DAILY_LOGIN', {
      description: '일일 로그인 보상'
    });
    
    // Redis에 기록 (24시간)
    await redis.setex(cacheKey, 86400, '1');
    
    res.json({
      success: true,
      data: {
        ...result,
        message: '일일 로그인 보상을 받았습니다!'
      }
    });
  } catch (error) {
    console.error('Error processing daily login:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process daily login'
    });
  }
};

// 작품 감상 완료
exports.viewArtwork = async (req, res) => {
  try {
    const userId = req.user.id;
    const { artworkId } = req.body;
    
    const result = await gamificationService.earnXP(userId, 'VIEW_ARTWORK', {
      description: '작품 감상',
      referenceId: artworkId,
      referenceType: 'artwork'
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording artwork view:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record artwork view'
    });
  }
};

// 퀴즈 완료
exports.completeQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizType, score } = req.body;
    
    const result = await gamificationService.earnXP(userId, 'COMPLETE_QUIZ', {
      description: `퀴즈 완료 (점수: ${score})`,
      referenceId: quizType,
      referenceType: 'quiz'
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording quiz completion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record quiz completion'
    });
  }
};

// 팔로우 완료
exports.followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;
    
    const result = await gamificationService.earnXP(userId, 'FOLLOW_USER', {
      description: '새로운 친구 팔로우',
      referenceId: targetUserId,
      referenceType: 'user'
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording follow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record follow'
    });
  }
};

// 작품 공유
exports.shareArtwork = async (req, res) => {
  try {
    const userId = req.user.id;
    const { artworkId, platform } = req.body;
    
    const result = await gamificationService.earnXP(userId, 'SHARE_ARTWORK', {
      description: `작품 공유 (${platform})`,
      referenceId: artworkId,
      referenceType: 'artwork'
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording share:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record share'
    });
  }
};

// AI 프로필 생성
exports.createAIProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await gamificationService.earnXP(userId, 'CREATE_AI_PROFILE', {
      description: 'AI 아트 프로필 생성'
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording AI profile creation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record AI profile creation'
    });
  }
};

// 전시 방문
exports.visitExhibition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exhibitionId, exhibitionName } = req.body;
    
    const result = await gamificationService.earnXP(userId, 'VISIT_EXHIBITION', {
      description: `전시 방문: ${exhibitionName}`,
      referenceId: exhibitionId,
      referenceType: 'exhibition'
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording exhibition visit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record exhibition visit'
    });
  }
};

// 리뷰 작성
exports.writeReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetId, targetType, reviewLength } = req.body;
    
    const result = await gamificationService.earnXP(userId, 'WRITE_REVIEW', {
      description: '리뷰 작성',
      referenceId: targetId,
      referenceType: targetType,
      reviewLength
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record review'
    });
  }
};

// 좋아요 받기
exports.receiveLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentId, contentType } = req.body;
    
    const result = await gamificationService.earnXP(userId, 'RECEIVE_LIKE', {
      description: '좋아요 받기',
      referenceId: contentId,
      referenceType: contentType
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording like:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record like'
    });
  }
};

// 사용자 초기화 (회원가입 시)
exports.initializeUser = async (req, res) => {
  try {
    const userId = req.user.id;
    await gamificationService.initializeUser(userId);
    
    res.json({
      success: true,
      message: 'User gamification profile initialized'
    });
  } catch (error) {
    console.error('Error initializing user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize user'
    });
  }
};