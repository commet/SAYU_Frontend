const router = require('express').Router();
const { getSupabaseGamificationService } = require('../services/supabaseGamificationService');
const { authenticateUser } = require('../middleware/supabase-auth');
const { log } = require('../config/logger');

const gamificationService = getSupabaseGamificationService();

// 사용자 게임 프로필 및 통계 조회
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await gamificationService.getUserStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    log.error('Failed to get user game profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game profile'
    });
  }
});

// 포인트 추가 (범용 엔드포인트)
router.post('/points/add', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { actionType, metadata } = req.body;
    
    if (!actionType) {
      return res.status(400).json({
        success: false,
        error: 'Action type is required'
      });
    }
    
    const result = await gamificationService.addPoints(userId, actionType, metadata);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to add points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add points'
    });
  }
});

// 일일 로그인 포인트
router.post('/daily-login', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await gamificationService.handleLogin(userId);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to process daily login:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process daily login'
    });
  }
});

// APT 테스트 완료
router.post('/apt-test-complete', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await gamificationService.handleAptTestComplete(userId);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to process APT test completion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process APT test completion'
    });
  }
});

// AI 프로필 생성
router.post('/ai-profile-create', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await gamificationService.handleAiProfileCreate(userId);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to process AI profile creation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process AI profile creation'
    });
  }
});

// 프로필 완성
router.post('/profile-complete', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await gamificationService.handleProfileComplete(userId);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to process profile completion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process profile completion'
    });
  }
});

// 작품 좋아요
router.post('/like-artwork', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { artworkId } = req.body;
    
    if (!artworkId) {
      return res.status(400).json({
        success: false,
        error: 'Artwork ID is required'
      });
    }
    
    const result = await gamificationService.handleLikeArtwork(userId, artworkId);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to process artwork like:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process artwork like'
    });
  }
});

// 작품 저장
router.post('/save-artwork', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { artworkId } = req.body;
    
    if (!artworkId) {
      return res.status(400).json({
        success: false,
        error: 'Artwork ID is required'
      });
    }
    
    const result = await gamificationService.handleSaveArtwork(userId, artworkId);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to process artwork save:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process artwork save'
    });
  }
});

// 전시 기록 작성
router.post('/exhibition-record', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { exhibitionId } = req.body;
    
    if (!exhibitionId) {
      return res.status(400).json({
        success: false,
        error: 'Exhibition ID is required'
      });
    }
    
    const result = await gamificationService.handleCreateExhibitionRecord(userId, exhibitionId);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to process exhibition record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process exhibition record'
    });
  }
});

// 상세 리뷰 작성
router.post('/detailed-review', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId, reviewLength } = req.body;
    
    if (!reviewId || !reviewLength) {
      return res.status(400).json({
        success: false,
        error: 'Review ID and length are required'
      });
    }
    
    const result = await gamificationService.handleWriteDetailedReview(userId, reviewId, reviewLength);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to process detailed review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process detailed review'
    });
  }
});

// 전시 사진 업로드
router.post('/upload-photo', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.body;
    
    if (!photoId) {
      return res.status(400).json({
        success: false,
        error: 'Photo ID is required'
      });
    }
    
    const result = await gamificationService.handleUploadExhibitionPhoto(userId, photoId);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to process photo upload:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process photo upload'
    });
  }
});

// 전시 평가
router.post('/rate-exhibition', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { exhibitionId, rating } = req.body;
    
    if (!exhibitionId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Exhibition ID and rating are required'
      });
    }
    
    const result = await gamificationService.handleRateExhibition(userId, exhibitionId, rating);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to process exhibition rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process exhibition rating'
    });
  }
});

// 사용자 팔로우
router.post('/follow-user', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { followedUserId } = req.body;
    
    if (!followedUserId) {
      return res.status(400).json({
        success: false,
        error: 'Followed user ID is required'
      });
    }
    
    const result = await gamificationService.handleFollowUser(userId, followedUserId);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to process user follow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process user follow'
    });
  }
});

// 프로필 공유
router.post('/share-profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await gamificationService.handleShareProfile(userId);
    
    res.json(result);
  } catch (error) {
    log.error('Failed to process profile share:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process profile share'
    });
  }
});

// 리더보드 조회
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'weekly', limit = 50 } = req.query;
    const leaderboard = await gamificationService.getLeaderboard(type, parseInt(limit));
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    log.error('Failed to get leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard'
    });
  }
});

// 포인트 히스토리 조회
router.get('/point-history', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;
    
    const history = await gamificationService.getPointHistory(userId, parseInt(limit));
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    log.error('Failed to get point history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get point history'
    });
  }
});

// 주간 진행도 조회
router.get('/weekly-progress', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await gamificationService.getWeeklyProgress(userId);
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    log.error('Failed to get weekly progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get weekly progress'
    });
  }
});

// 일일 활동 제한 확인
router.get('/daily-limit/:activityType', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityType } = req.params;
    
    const limitInfo = await gamificationService.checkDailyLimit(userId, activityType);
    
    res.json({
      success: true,
      data: limitInfo
    });
  } catch (error) {
    log.error('Failed to check daily limit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check daily limit'
    });
  }
});

// 레벨 정보 조회
router.get('/levels', async (req, res) => {
  try {
    const levels = await gamificationService.getAllLevels();
    
    res.json({
      success: true,
      data: levels
    });
  } catch (error) {
    log.error('Failed to get levels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get levels'
    });
  }
});

// 포인트 규칙 조회
router.get('/point-rules', async (req, res) => {
  try {
    const rules = await gamificationService.getPointRules();
    
    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    log.error('Failed to get point rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get point rules'
    });
  }
});

module.exports = router;